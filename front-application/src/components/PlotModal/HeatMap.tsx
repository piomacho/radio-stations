import * as React from 'react'
import { ResponsiveHeatMap, HeatMapDatum } from '@nivo/heatmap'
import store, { CoordinatesType } from '../../Store/Store';

interface HeatmapType {
    latitude: string,
    longitude: string,
    elevation: number,
    [key: string]: number | string,
}

interface HeatmapObjectType {
    longitude: string,
    elevation: number,
}

const groupByLatitude = (elevationResults: Array<CoordinatesType>, logitudes: Array<string>) => {
    return elevationResults.reduce((latitudeObject: Record<string, Array<HeatmapObjectType>>, { latitude, longitude, elevation }: any) => {
        if (!latitudeObject[`${latitude}`]) {
            latitudeObject[`${latitude}`] = [];
        }
        const isDuplicate = latitudeObject[`${latitude}`].find((el: HeatmapObjectType) => el.longitude === longitude.toString());
        if(!isDuplicate){
            const longitudeStringified = longitude.toString();
            if(!logitudes.includes(longitudeStringified)) {
                logitudes.push(longitudeStringified)
            }
            latitudeObject[`${latitude}`].push({longitude:`${longitude}`, elevation: elevation});
        }
        return latitudeObject;
      }, {});

}

export const MyResponsiveHeatMap = () => {
    const { useGlobalState } = store;
    const [elevationResults] = useGlobalState("elevationResults");

    const logitudes: Array<string> = [];

    const groupedLatitudes = groupByLatitude(elevationResults, logitudes);

    const heatMapData: Array<HeatMapDatum> = [];

    Object.keys(groupedLatitudes).map((value: string) => {
        let obj: HeatmapType = {latitude: value, longitude: '', elevation: 0};
        const array = groupedLatitudes[value];
        var result = Array.from(new Set(array.map( (o: any) => JSON.stringify(o))), (s: any) => JSON.parse(s));


        result.map((el: HeatmapType) => {
            obj[`${el.longitude}`] = el.elevation;
        });
        heatMapData.push(obj);
    })

    return (

    <ResponsiveHeatMap
        data={heatMapData}
        keys={logitudes}
        indexBy="latitude"
        margin={{ top: 100, right: 10, bottom: 60, left: 10 }}
        forceSquare={true}
        axisTop={{ orient: 'top', tickSize: 5, tickPadding: 5, tickRotation: -90, legend: '', legendOffset: 36 }}
        axisRight={null}
        axisBottom={null}
        axisLeft={{
            orient: 'left',
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'latitude',
            legendPosition: 'middle',
            legendOffset: -80
        }}
        cellOpacity={1}
        cellBorderColor={{ from: 'color', modifiers: [ [ 'darker', 0.4 ] ] }}
        labelTextColor={{ from: 'color', modifiers: [ [ 'darker', 1.8 ] ] }}
        //@ts-ignore
        defs={[
            {
                id: 'lines',
                type: 'patternLines',
                background: 'inherit',
                color: 'rgba(0, 0, 0, 0.1)',
                rotation: -45,
                lineWidth: 4,
                spacing: 7
            }
        ]}
        fill={[ { id: 'lines' } ]}
        animate={true}
        motionStiffness={80}
        motionDamping={9}
        hoverTarget="cell"
        cellHoverOthersOpacity={0.25}
        colors="YlOrRd"
    />
)}
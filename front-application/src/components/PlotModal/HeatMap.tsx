import * as React from 'react'
import { ResponsiveHeatMap, HeatMapDatum } from '@nivo/heatmap'
import Loader from 'react-loader-spinner'
import { LoaderContainer } from './PlotModal.style';
import store, { CoordinatesType } from '../../Store/Store';
import { useEffect } from 'react';
import { callApiFetch } from '../../common/global';
import { useState } from 'react';
import OpenElevationClient from "../../OECient/OpenElevationClient";

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

const sortAndGroupResultElements = (results:Array<CoordinatesType>): any => {
    //@ts-ignore
    return results.sort((a, b) => {
           if (a.latitude === b.latitude) {
              // Price is only important when cities are the same
              return a.longitude - b.longitude ;
           }

           return a.latitude > b.latitude ? -1 : 1;
        }).reduce((r: Array<CoordinatesType>, a: CoordinatesType) => {
            //@ts-ignore
            r[a.latitude] = [...r[a.latitude] || [], a !== undefined && a];
            return r;
           }, {});
}

const getCorners = (results: Array<CoordinatesType>) => {
    const grouped = sortAndGroupResultElements(results);

    const keysOfGroupedArray = Object.keys(grouped).map((item: string) =>  Number(item));
    const minLat = Math.min(...keysOfGroupedArray);
    const maxLat = Math.max(...keysOfGroupedArray);

    const maxLongMaxLat = maxLat && grouped[`${maxLat}`] && grouped[`${maxLat}`].slice(-1)[0].longitude;
    const minLongMaxLat = maxLat && grouped[`${maxLat}`] && grouped[`${maxLat}`][0].longitude;

    const maxLongMinLat = minLat && grouped[`${minLat}`] && grouped[`${minLat}`].slice(-1)[0].longitude;
    const minLongMinLat = minLat && grouped[`${minLat}`] && grouped[`${minLat}`][0].longitude;

    return {
        maxLongMaxLat: {
            lat: maxLat,
            lng: maxLongMaxLat
        },
        minLongMaxLat: {
            lat: maxLat,
            lng: minLongMaxLat
        },
        maxLongMinLat: {
            lat: minLat,
            lng: maxLongMinLat
        },
        minLongMinLat: {
            lat: minLat,
            lng: minLongMinLat
        }
    }

}


export const MyResponsiveHeatMap = () => {
    const { useGlobalState } = store;
    const [heatMapData, setHeatMapData] = useState<Array<any>>([]);
    const [heatMapArray, setHeatMapArray] = useState<Array<any>>([]);
    const [longitudes, setLongitudes] = useState<Array<string>>([]);
    const [isLoading, setLoading] = useState(false);
    const [adapter] = useGlobalState('adapter');
    const [corners, setCorners] = useGlobalState('corners');
    const OEClient = new OpenElevationClient("http://0.0.0.0:10000/api/v1");
    const heatMapDataArray: Array<HeatMapDatum> = [];

    useEffect(() => {
        const adapterLatitude = +(+adapter.szerokosc).toFixed(2);
        const adapterLongitude = +(+adapter.dlugosc).toFixed(2);
        const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            adapter: {
                latitude: adapterLatitude,
                longitude: adapterLongitude,
            },
            radius: Number(10),
            pointsDistance: Number(0.5)
        })
        };
        setLoading(true);
        callApiFetch(`api/coordinates/generate-template`, requestOptions).then(response => {
            console.log("EEE ", response)
            OEClient.postLookup({
                locations: response.coordinates
              }).then(async (results) => {
                //@ts-ignore
                setHeatMapData(results.results)
                const tempArr: Array<string>= [];

                     //@ts-ignore
                const groupedLatitudes = await sortAndGroupResultElements(results.results);
                await Object.keys(groupedLatitudes).map((value: string) => {
                    let obj: HeatmapType = {latitude: value, longitude: '', elevation: 0};

                    //@ts-ignore
                    groupedLatitudes[value].map((point: any) => {
                        const longitudeStringified = point.longitude.toString();
                        if(!tempArr.includes(longitudeStringified)) {
                            tempArr.push(longitudeStringified)
                        }
                    })

                    const array = groupedLatitudes[value];
                    var result = Array.from(new Set(array.map( (o: any) => JSON.stringify(o))), (s: any) => JSON.parse(s));


                    result.map((el: HeatmapType) => {
                        obj[`${el.longitude}`] = el.elevation;
                    });
                    heatMapDataArray.push(obj);
                });
                setLongitudes(tempArr);
                setHeatMapArray(heatMapDataArray);
                //@ts-ignore
                const cornersValues = getCorners(results.results);
                setCorners(cornersValues);
                setLoading(false);
            });

        });
      }, [adapter])

    return (
        isLoading === true ? <LoaderContainer><Loader type="Circles" color="#22a6b3" height={40} width={40}/></LoaderContainer> :

        <ResponsiveHeatMap
            data={heatMapArray}
            keys={longitudes}
            indexBy="latitude"
            margin={{ top: 100, right: 10, bottom: 60, left: 10 }}
            forceSquare={true}
            axisTop={{ orient: 'top', tickSize: 5, tickPadding: 20, tickRotation: -90, legend: 'longitude →',
            legendPosition: 'start',  legendOffset: -15 }}
            axisRight={null}
            axisBottom={null}
            enableLabels={false}
            axisLeft={{
                orient: 'left',
                tickSize: 5,
                tickPadding: 20,
                tickRotation: 0,
                legend: '← latitude',
                legendPosition: 'end',
                legendOffset: -15,
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
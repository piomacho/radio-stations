/* global google */
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import Button from "../Button/Button";
import Map from '../Map/MapSiatka'
import { ButtonWrapper, Message } from "./GMapsModal.style";
import { callApiFetch } from "../../common/global";
import store, { CoordinatesType, GMapsCoordinatesType, ShortCoordinatesType } from "../../Store/Store";
import OpenElevationClient from "../../OECient/OpenElevationClient";
import { ResponsiveHeatMap, HeatMapDatum } from '@nivo/heatmap'
import { HeatmapType, sortAndGroupResultElements } from "../PlotModal/HeatMap";
import GMapsResults from "../GMapsResults/GMapsResults";
import { chunkArray } from "../ExportAllModal/chunkArray";

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: ((value: boolean, type: string, query: boolean) => ((event: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) => void) | undefined) | (() => void);

}


const GMapsComparisonModal = ({ modalVisiblity, showModal }: PlotModalType) => {
  const [successMessage, setSuccessMessage] = useState("");
  const { useGlobalState } = store;
  const [adapter] = useGlobalState("adapter");
  const [heatMapData, setHeatMapData] = useState<Array<any>>([]);
  const [heatMapArray, setHeatMapArray] = useState<Array<any>>([]);
  const [heatMapArrayMine, setHeatMapArrayMine] = useState<Array<any>>([]);
  const [porownawcza, setPorownawcza] = useState<Array<any>>([]);
  const [gmapsElevation, setGMapsElevation] = useState<Array<any>>([]);
  const [longitudes, setLongitudes] = useState<Array<string>>([]);
  const [longitudesMine, setLongitudesMine] = useState<Array<string>>([]);
  const [elRes, setElRes] = useState([]);
  const [iterator,     setIterator] = useState(false);
  const [gMapsElevation] = useGlobalState("gmapsCoordinates");
  const OEClient = new OpenElevationClient("http://0.0.0.0:10000/api/v1");
  const heatMapDataArray: Array<HeatMapDatum> = [];
  const heatMapDataArrayMine: Array<HeatMapDatum> = [];

  const elevator = new google.maps.ElevationService();

  const generateApiParameter = (trialCoords:any) => {
    return trialCoords.map((t: any) => {
        return (
            {lat: t.latitude, lng: t.longitude}
        )
    })
    }


  const getFormatedGmapsResults = (trialCoords:any) => {
    return trialCoords.map((t: any) => {
        return (
            {latitude: +t.location.lat().toFixed(4), longitude: +t.location.lng().toFixed(4), elevation: Math.round(t.elevation)}
        )
    })
    }


  useEffect(() => {
    const adapterLatitude = +(+adapter.szerokosc);
    const adapterLongitude = +(+adapter.dlugosc);
    const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        adapter: {
            latitude: adapterLatitude,
            longitude: adapterLongitude,
        },
        radius: Number(8),
        pointsDistance: Number(0.5)
    })
    };

    // setLoading(true);
    callApiFetch(`api/coordinates/generate-template`, requestOptions).then(response => {
        OEClient.postLookup({
            locations: response.coordinates
          }).then(async (results) => {

            const tempArr: Array<string>= [];
            const tempArrMine: Array<string> =[];
              //@ts-ignore
            setHeatMapData(results.results)
            //@ts-ignore
            const groupedLatitudesMine = await sortAndGroupResultElements(results.results);
            await Object.keys(groupedLatitudesMine).map((value: string) => {
                let obj: HeatmapType = {latitude: value, longitude: '', elevation: 0};

                //@ts-ignore
                groupedLatitudesMine[value].map((point: any) => {
                    const longitudeStringified = point.longitude.toString();
                    if(!tempArrMine.includes(longitudeStringified)) {
                      tempArrMine.push(longitudeStringified)
                    }
                    return null;
                })

                const array = groupedLatitudesMine[value];
                var result = Array.from(new Set(array.map( (o: any) => JSON.stringify(o))), (s: any) => JSON.parse(s));


                result.map((el: HeatmapType) => {
                    obj[`${el.longitude}`] = el.elevation;
                    return null;
                });
                heatMapDataArrayMine.push(obj);
                return null;
            });

            setLongitudesMine(tempArrMine);
            setHeatMapArrayMine(heatMapDataArrayMine);







            //gmaps
                 //@ts-ignore
            setElRes(results.results);
            //@ts-ignore
            const formattedCoords =  generateApiParameter(results.results);
            const chunked = chunkArray(formattedCoords, 2, true);
            // console.log("--formattedCoords ", formattedCoords)
            elevator.getElevationForLocations(
                {
                  locations: chunked[0],
                },
                async(results1, status) => {

                    elevator.getElevationForLocations(
                        {
                          locations: chunked[1],
                        },
                        async(results, status) => {
                            const a = [...results, ...results1];
                        const formatedGmapsResults = getFormatedGmapsResults(a);

                        //@ts-ignore
                        const groupedLatitudes = await sortAndGroupResultElements(formatedGmapsResults);

                        await Object.keys(groupedLatitudes).map((value: string) => {
                            let obj: HeatmapType = {latitude: value, longitude: '', elevation: 0};

                            //@ts-ignore
                            groupedLatitudes[value].map((point: any) => {
                                const longitudeStringified = point.longitude.toString();
                                if(!tempArr.includes(longitudeStringified)) {
                                    tempArr.push(longitudeStringified)
                                }
                                return null;
                            })

                            const array = groupedLatitudes[value];
                            var result = Array.from(new Set(array.map( (o: any) => JSON.stringify(o))), (s: any) => JSON.parse(s));


                            result.map((el: HeatmapType) => {
                                obj[`${el.longitude}`] = el.elevation;
                                return null;
                            });
                            heatMapDataArray.push(obj);
                            return null;
                        });
                        // const a = [...longitudes, ...tempArr];
                        // const b = [...heatMapArray, ...heatMapDataArray];
                                 //@ts-ignore
                        setLongitudes(tempArr);
                        setHeatMapArray(heatMapDataArray);
                        setIterator(true);

                        const porownawcza = heatMapDataArray.map((heatObj) => {
                          var temp = Object.assign({}, heatObj);
                          Object.keys(temp).forEach((keyInHeat) =>{

                            if(!isNaN(Number(keyInHeat))){
                              // console.log("key in heat", heatObj[keyInHeat]);
                             const foundVal= heatMapDataArrayMine.find((elem) => {
                               return elem.latitude.toString() === heatObj.latitude.toString()
                             })
                             if(foundVal !== undefined) {
                               //@ts-ignore
                              //  console.log("pierwotne ", temp[keyInHeat]," - ",+foundVal[keyInHeat]);
                               temp[keyInHeat] = Math.abs((+temp[keyInHeat]) - (+foundVal[keyInHeat]))
                             }
                              return temp
                            } else {
                              return temp[keyInHeat]
                            }
                            // return heatObj[keyInHeat] - 5;
                          })
                          return temp
                      });
                      setPorownawcza(porownawcza);
                      // console.log(" 0-0- ", porownawcza, " normalne", heatMapDataArray);
                      })




              })



            //   .catch(err => console.log(err));
        //   }, []);




            //@ts-ignore

            // setCorners(cornersValues);
            // setLoading(false);
        });

    });
  }, [adapter])

  console.log("longitudes ", heatMapArrayMine)
  return (
    <Modal
      isOpen={modalVisiblity}
      //@ts-ignore
      onRequestClose={showModal(false, "maps-comparison", false)}
      ariaHideApp={false}
      contentLabel="Example Modal"
    >
      {/* <Map elRes={elRes}/> */}
    {iterator === true  ?
        <ResponsiveHeatMap
            data={heatMapArray}
                //@ts-ignore
            keys={[...new Set(longitudes)]}
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
        /> : <div>loading</div>}
        <div>moje na dole ---------- </div>
          {longitudesMine.length > 0  && heatMapArrayMine.length > 0  ?
        <ResponsiveHeatMap
            data={heatMapArrayMine}
                //@ts-ignore
            keys={longitudesMine}
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
        /> : <div>loading 2</div>}

    <div>moje na dole ---------- </div>
          {longitudesMine.length > 0  && porownawcza.length > 0  ?
        <ResponsiveHeatMap
            data={porownawcza}
                //@ts-ignore
            keys={longitudesMine}
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
            colors="blues"
        /> : <div>loading 3</div>}

      <ButtonWrapper>
        <Button
          onClick={showModal(false, "maps-comparison", false)}
          label={"Close"}
          height={30}
          width={80}
          backColorHover={"#ff7979"}
        />

      </ButtonWrapper>
      <Message>{successMessage}</Message>

    </Modal>
  );
};

export default GMapsComparisonModal;

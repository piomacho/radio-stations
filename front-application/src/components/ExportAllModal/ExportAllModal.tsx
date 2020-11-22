import React, { useState, ChangeEvent } from "react";
import Modal from "react-modal";
import store, { CoordinatesType } from "../../Store/Store";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import Button from "../Button/Button";
import {
  FloppyIcon,
  InputWrapper,
  TypeSpan,
  Input,
  InputContainer,
  ExportWrapper,
  Message,
  AdapterCoordsWrapper,
  Coord,
  AdaptersHeader,
  ExportInputWrapper,
  DistanceDisplay,
  ProgressBarWrapper
} from "./ExportAllModal.style";
import { ButtonWrapper } from "../Button/Button.styles";
import { callApiFetch, measureDistance } from "../../common/global";
import OpenElevationClient from "../../OECient/OpenElevationClient";
import { chunkArray } from "./chunkArray";
import { LoaderOverLay } from "../SelectionPanel/SelectionPanel.styles";
import { LoaderContainer } from "../Adapters/Adapters.style";

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: (value: boolean, type: string, query: boolean) => any;
}

interface ErrorsType {
  xError: null | string;
  yError: null | string;
  pointsError: null | string;
  fileNameError: null | string;
}

const EmptyError: ErrorsType = { xError: null,
  yError: null,
  pointsError: null,
  fileNameError: null
}

interface ResultCoordinateType {
  coordinates: Array<ResultType>
}
interface ResultType {
  longitude: number;
  latitude: number;
}



interface ElevationSegmentType {
  latitude: number,
  longitude: number,
  elevation: number,
  distance: number
}

interface SegmentResultType {
  results: Array<ElevationSegmentType>
  receiver: {
    longitude: number,
    latitude: number
  }
}

interface SegmentFullResultType {
  receiver: {
    longitude: number,
    latitude: number
  },
  points: Array<ElevationSegmentType>
}


const ExportAllModal = ({ modalVisiblity, showModal }: PlotModalType) => {
  const { useGlobalState } = store;
  const [elevationResults] = useGlobalState("elevationResults");
  const [adapter] = useGlobalState('adapter');
  const [error, setError] = useState(EmptyError);
  const [loaderValue, setLoaderValue] = useState(0);
  const [fileName, setFileName] = useState("");
  const [segmentsElevations, setSegmentsElevations] = useState<Array<SegmentResultType>>([]);
  const [radius, setRadius] = useState("");
  const [pointsDistance, setPointsDistance] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const OEClient = new OpenElevationClient("http://0.0.0.0:10000/api/v1");


  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSuccessMessage("");
    setError({...error, fileNameError: null});
    setFileName(value);
    const rg1 = /^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
    const rg2 = /^\./; // cannot start with dot (.)
    const rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
    const isAllowed = rg1.test(value) && !rg2.test(value) && !rg3.test(value);
    // setAllowedName(isAllowed);
    if (!isAllowed && value.length > 0) {
      setError({...error, fileNameError: "Name is not allowed !"});
    }
  };

  const handleChangeRadius = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError({...error, xError: null});
    const rg = /^[0-9]+$/;
    const isAllowed = rg.test(value);
    // setAllowedName(isAllowed);
    if (!isAllowed) {
      setError({...error, xError: "Radius value is not allowed !"});
    }

    setRadius(value);
  }

  const handleChangePointsDistance = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError({...error, pointsError: null});
    const rg = /.*/;
    const isAllowed = rg.test(value);
    if (!isAllowed) {
      setError({...error, pointsError: "Points distance is invalid !"});
    }

    setPointsDistance(value);

  }

  const handleExportClick = () => {
      const adapterLatitude = +(+adapter.szerokosc).toFixed(2);
      const adapterLongitude = +(+adapter.dlugosc).toFixed(2);
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adapterLatitude: adapterLatitude,
          adapterLongitude: adapterLongitude,
          radius: Number(radius),
          pointsDistance: Number(pointsDistance)
        })
      };

    callApiFetch(`api/coordinates/generate`, requestOptions)
        .then(async(results: ResultCoordinateType) => {
          // const resultsChunked = chunkArray(results, 20, true);
          handleExportFull(results, Number(pointsDistance)).then((data: any) => {
           try {
              setSegmentsElevations(data);
              exportToOctave(data);

            } catch (e) {
              console.error("Parsing error ->", e);
            }
          })
        })
        .catch((error: any) => {
          console.log("Error postLookupLine:" + error);
        });
  }

  const constructDataForOctave = (data: Array<SegmentFullResultType>):any  => {
    const resultArray:any  = [];
    data && data.map((element:SegmentFullResultType, iterator: number) => {
      resultArray.push({
        coordinates: element.points,
        adapter: { latitude: adapterX, longitude: adapterY, height: adapter.wys_npm, frequency: adapter.czestotliwosc},
        receiver:  { latitude: +element.receiver.latitude, longitude: +element.receiver.longitude }
      });
    });

    return resultArray;
  }

  const exportToOctave = async(data: Array<SegmentFullResultType>) => {
    const dataConstructedForOctave: Array<SegmentFullResultType> = constructDataForOctave(data);


    const chunkedArray: Array<Array<SegmentFullResultType>> = chunkArray(dataConstructedForOctave, 20, true);
    let numberOfCalls = chunkedArray.length;

    while(numberOfCalls > 0){

      const bodyObject =  JSON.stringify( {
        fileName: fileName,
        adapter: { latitude: adapterX, longitude: adapterY, height: adapter.wys_npm, frequency: adapter.czestotliwosc},
        data: chunkedArray[numberOfCalls - 1],
        postNumber: numberOfCalls,
      });

      // console.log("export octa ", chunkedArray[numberOfCalls - 1])
      //@ts-ignore
      const awaited: postLookUpLineResultType = await fireOctaveExport(bodyObject, numberOfCalls);
      numberOfCalls = numberOfCalls - 1;

      if(awaited) {
        try {

        } catch(err) {
          console.error("getLineInfoFull() -> parsing error: ", err);
        }

      }
    }
  };


  const fireOctaveExport = async(data: Array<SegmentFullResultType>, postNumber: number) => {

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    };

    return new Promise(resolve => {
        resolve(
          callApiFetch(`api/export-octave/send-all/`, requestOptions)
        .then(async() => {
          // setLoaderValue(20 - postNumber)
          if(postNumber === 1){

            setSuccessMessage("File saved succcessfully! Octave process in progress ... ");
          }
          return postNumber;
        })
        .catch(err => setError(err))
        );
    });



  }


  const getLineInfo = (result: ResultType, distance: number) => {
    return OEClient.postLookupLineDistance({
        adapterLongitude: +adapterY,
        adapterLatitude: +adapterX,
        range: measureDistance( +adapterX, +adapterY, result.latitude, result.longitude).toFixed(2),
        distance: distance,
        receiverLongitude: result.longitude,
        receiverLatitude: result.latitude
      }).then(async function(results) {
        return Promise.resolve(results)
      });
  }

  interface postLookUpLineResultType {
    results: string;
  }

  const getLineInfoFull = async(results: ResultCoordinateType, distance: number) => {
    let numberOfCalls = 20;
    const resultArray = [];
    let hasMagenicVendor = results.coordinates.some( (vendor : any) => vendor.latitude === 52.09503391970407 && vendor.longitude === 21.032673362076522)
    const chunkedArray = chunkArray(results.coordinates, numberOfCalls, true);

    while(numberOfCalls > 0){
      //@ts-ignore
      const awaited: postLookUpLineResultType = await postLookupDistanceForAllPoint(+adapterX, +adapterY, distance, chunkedArray[numberOfCalls - 1]);
      if(awaited) {
        numberOfCalls = numberOfCalls - 1;
        setLoaderValue(20 - loaderValue - numberOfCalls)
        try {
          console.log("----> ", numberOfCalls);
          const parsedResponse = JSON.parse(awaited.results);
          resultArray.push(...parsedResponse);

          let hasMagenicVendor = resultArray.some( (vendor : any) => vendor.receiver.latitude === 52.09503391970407 && vendor.receiver.longitude === 21.032673362076522)
        } catch(err) {
          console.error("getLineInfoFull() -> parsing error: ", err);
        }

      }
    }
    return resultArray;
  };

  const postLookupDistanceForAllPoint = (adapterX: number, adapterY: number, distance: number, coordinates: ResultType[]) => {
    return OEClient.postLookupLineDistanceAll({
      adapterLongitude: +adapterY,
      adapterLatitude: +adapterX,
      distance: distance,
      receivers: coordinates
    }).then(async function(results) {
      return Promise.resolve(results)
    });
  };

  const handleLinePromises = async (item: ResultType, distance: number) => {
    return getLineInfo(item, distance)
  }

  const handleExportFull = async(results: ResultCoordinateType, distance: number) => {
    return getLineInfoFull(results, distance);
  }

  const allowedSubmit = Object.values(error).every(x => (x === null)) && fileName.length > 0 && successMessage === '';
  const adapterX = +(+adapter.szerokosc).toFixed(2);
  const adapterY = +(+adapter.dlugosc).toFixed(2);

  const customStyles = {
    content : {
      backgroundColor: '#cad7dd',
    }
  };

  return (
    <Modal
      isOpen={modalVisiblity}
      onRequestClose={showModal(false, "export", false)}
      ariaHideApp={false}
      contentLabel="Export Modal"
      style={ customStyles }
    >
      <FloppyIcon />
      <InputWrapper>
        <AdapterCoordsWrapper>
          <AdaptersHeader>Transmitter locations:</AdaptersHeader>
            <Coord>Longitude: {(+adapter.dlugosc).toFixed(2)} </Coord>
            <Coord>Latitude: {(+adapter.szerokosc).toFixed(2)}</Coord>
        </AdapterCoordsWrapper>
        <AdapterCoordsWrapper>
          <AdaptersHeader>Input radius value:</AdaptersHeader>
            <Coord><Input onChange={handleChangeRadius} placeholder="Radius: " /></Coord>
        </AdapterCoordsWrapper>
        <AdapterCoordsWrapper>
          <AdaptersHeader>Input wanted distance between points:</AdaptersHeader>
            <Coord><Input onChange={handleChangePointsDistance} placeholder="Distance between points: " /></Coord>
        </AdapterCoordsWrapper>

        <ExportInputWrapper>
          <InputContainer>
            <Input onChange={handleChange} placeholder="Enter file name:" />
            <TypeSpan>.xlsx</TypeSpan>

            <ExportWrapper>
              <Button
                onClick={allowedSubmit ? handleExportClick : null}
                label={"Export"}
                backColor={"#7bed9f"}
                backColorHover={"#2ed573"}
                disabled={!allowedSubmit}
              />:
          </ExportWrapper>
          </InputContainer>

        </ExportInputWrapper>
      </InputWrapper>
      {!allowedSubmit &&  Object.values(error).map((error:ErrorsType, idx:number) => (
        <Message key={idx} error={true}>{error}</Message>
      ))}
      {successMessage && <Message>{successMessage}</Message>}
         <ButtonWrapper>
         <Button
           onClick={showModal(false, "export-all", false)}
           label={"Close"}
           backColorHover={"#ff7979"}
         />
       </ButtonWrapper>

       {loaderValue > 0 && (loaderValue/20) < 1 ?
        <LoaderOverLay>
          <LoaderContainer>
              <ProgressBarWrapper>
                    <CircularProgressbar background={true} value={loaderValue/20} maxValue={1} text={`${Math.round((loaderValue/20) * 100)}%`} />;
                </ProgressBarWrapper>
          </LoaderContainer>
        </LoaderOverLay>
       : null}
    </Modal>
  );
};

export default ExportAllModal;

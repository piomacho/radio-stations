import React, { useState, ChangeEvent } from "react";
import Modal from "react-modal";
import store, { CoordinatesType } from "../../Store/Store";

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
  DistanceDisplay
} from "./ExportAllModal.style";
import { ButtonWrapper } from "../Button/Button.styles";
import { callApiFetch, lineFromPoints, measureDistance } from "../../common/global";
import OpenElevationClient from "../../OECient/OpenElevationClient";

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
          //@ts-ignore
          // handleExport(results, Number(pointsDistance)).then((data: Array<SegmentResultType>) => {
          //   console.log("WYNik ", data);
          //   //@ts-ignore

          // });
          handleExportFull(results, Number(pointsDistance)).then((data: any) => {
           try {
             console.log("===  ", data);
              const parsedResult = JSON.parse(data.results);
              setSegmentsElevations(parsedResult);
              exportToOctave(parsedResult);

            } catch (e) {
              console.error("Parsing error ->", e);
            }
          })
        })
        .catch((error: any) => {
          console.log("Error postLookupLine:" + error);
        });
  }

  // const constructDataForOctave = (data: Array<SegmentResultType>):any  => {
  //   const resultArray:any  = [];
  //   data.map((element:SegmentResultType, iterator: number) => {
  //     resultArray.push({
  //       coordinates: element.results,
  //       adapter: { latitude: adapterX, longitude: adapterY, height: adapter.wys_npm, frequency: adapter.czestotliwosc},
  //       receiver:  { latitude: +element.receiver.latitude, longitude: element.receiver.longitude }
  //     });
  //   });

  //   return resultArray;
  // }
  const constructDataForOctave = (data: Array<SegmentFullResultType>):any  => {
    const resultArray:any  = [];
    data.map((element:SegmentFullResultType, iterator: number) => {
      resultArray.push({
        coordinates: element.points,
        adapter: { latitude: adapterX, longitude: adapterY, height: adapter.wys_npm, frequency: adapter.czestotliwosc},
        receiver:  { latitude: +element.receiver.latitude, longitude: element.receiver.longitude }
      });
    });

    return resultArray;
  }

  const exportToOctave = (data: Array<SegmentFullResultType>) => {
    const bodyObject =  JSON.stringify( {
      fileName: fileName,
      adapter: { latitude: adapterX, longitude: adapterY, height: adapter.wys_npm, frequency: adapter.czestotliwosc},
      data: constructDataForOctave(data)
      // data: constructDataForOctave(data)
    });

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyObject
    };

      callApiFetch(`api/export-octave/send-all/`, requestOptions)
        .then(() => {
          setSuccessMessage("File saved succcessfully! Octave process in progress ... ");
        })
        .catch(err => setError(err));
  };

  const getLineInfo = (result: ResultType, distance: number) => {
    return OEClient.postLookupLineDistance({
        adapterLongitude: +adapterY,
        adapterLatitude: +adapterX,
        range: measureDistance( +adapterX, +adapterY, result.latitude, result.longitude).toFixed(2),
        distance: distance,
        receiverLongitude: result.longitude,
        receiverLatitude: result.latitude
      }).then(async function(results) {
        // console.log("myk");
        return Promise.resolve(results)
      });
  }

  const getLineInfoFull = (results: ResultCoordinateType, distance: number) => {
    return OEClient.postLookupLineDistanceAll({
      adapterLongitude: +adapterY,
      adapterLatitude: +adapterX,
      // range: measureDistance( +adapterX, +adapterY, result.latitude, result.longitude).toFixed(2),
      distance: distance,
      receivers: results.coordinates
      // receiverLongitude: result.longitude,
      // receiverLatitude: result.latitude
    }).then(async function(results) {
      return Promise.resolve(results)
    });
  };

  const handleLinePromises = async (item: ResultType, distance: number) => {
    return getLineInfo(item, distance)
  }

  const handleExport = async(results: ResultCoordinateType, distance: number) => {
    return Promise.all( results.coordinates.map(async(result: ResultType) => handleLinePromises(result, distance)));
  }

  const handleExportFull = async(results: ResultCoordinateType, distance: number) => {
    return await getLineInfoFull(results, distance);
  }

  const allowedSubmit = Object.values(error).every(x => (x === null)) && fileName.length > 0;
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
          {/* <DistanceDisplay>{ recLongitude !== "" && recLatitude !== "" &&  `Distance: ${measureDistance( adapterX, adapterY, +recLatitude, +recLongitude,).toFixed(2)} km`}</DistanceDisplay>
          <DistanceDisplay>{ recLongitude !== "" && recLatitude !== "" && points !== '' && `Unit distance: ${(measureDistance(adapterX, adapterY, +recLatitude, +recLongitude,)/+points).toFixed(2)} km`}</DistanceDisplay> */}
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
            />
          </ExportWrapper>
          </InputContainer>

        </ExportInputWrapper>
      </InputWrapper>
      {!allowedSubmit &&  Object.values(error).map(error => (
        <Message error={true}>{error}</Message>
      ))}
      {successMessage && <Message>{successMessage}</Message>}
      <ButtonWrapper>
        <Button
          onClick={showModal(false, "export-all", false)}
          label={"Close"}
          backColorHover={"#ff7979"}
        />
      </ButtonWrapper>
    </Modal>
  );
};

export default ExportAllModal;

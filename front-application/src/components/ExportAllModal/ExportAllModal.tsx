import React, { useState, ChangeEvent, useEffect } from "react";
import Modal from "react-modal";
import store, { CoordinatesType } from "../../Store/Store";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import io from "socket.io-client";
import Loader from 'react-loader-spinner';
import path from "path";

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
  ProgressBarWrapper,
  DownloadIcon,
  DownloadArea,
  ResultMessage
} from "./ExportAllModal.style";
import { ButtonWrapper } from "../Button/Button.styles";
import { callApiFetch, getCorners, measureDistance } from "../../common/global";
import OpenElevationClient from "../../OECient/OpenElevationClient";
import { chunkArray } from "./chunkArray";
import { LoaderOverLay } from "../SelectionPanel/SelectionPanel.styles";
import { LoaderContainer } from "../Adapters/Adapters.style";
import { CloseButton } from "../ExportModal/ExportModal.style";
import pLimit from 'p-limit';

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: (value: boolean, type: string, query: boolean) => any;
}

interface ErrorsType {
  xError: null | string;
  yError: null | string;
  pointsError: null | string;
  // fileNameError: null | string;
}

const EmptyError: ErrorsType = { xError: null,
  yError: null,
  pointsError: null,
  // fileNameError: null
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

let ITERATIONS = 200;
//@ts-ignore
let globalAr = [];

const ExportAllModal = ({ modalVisiblity, showModal }: PlotModalType) => {
  const { useGlobalState } = store;
  const [elevationResults] = useGlobalState("elevationResults");
  const [adapter] = useGlobalState('adapter');
  const { id_nadajnik, id_antena, id_program} = adapter;
  const [error, setError] = useState(EmptyError);
  const [octaveLoader, setOctaveLoader] = useState(false);
  const [loaderValue, setLoaderValue] = useState(-1);
  const [radius, setRadius] = useState("");
  const [pointsDistance, setPointsDistance] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [ isFinished, setIsFinihed ] = useState(false);
  const [corners, setCorners] = useState({});
  const ENDPOINT = "http://localhost:5000";
  const OEClient = new OpenElevationClient("http://0.0.0.0:10000/api/v1");
  // const socket = io('http://localhost:5000')

  const limit = pLimit(5);

  useEffect(() => {
    const socket = io(ENDPOINT);
    //@ts-ignore
    socket.on("loaderGenerate", data => {
      setLoaderValue(data);
    });
     //@ts-ignore
    socket.on("finishMapProcessing", data => {
      setSuccessMessage(data);
      setIsFinihed(true);
      setOctaveLoader(false);
    });

    return ()=>{
      socket.disconnect();
     }
  }, []);

  const handleChangeRadius = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError({...error, xError: null});
    const rg = /^[0-9]+$/;
    const isAllowed = rg.test(value);
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

    setLoaderValue(0);
    const dataFactor =  Number(radius)/Number(pointsDistance)

    if(dataFactor > 150 && dataFactor < 300) {
      ITERATIONS = 200
    } else if(dataFactor >= 300) {
      ITERATIONS = 2700;
    }
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        adapter:{
          latitude: adapterLatitude,
          longitude: adapterLongitude,
          height: +adapter.wys_npm,
          frequency: adapter.czestotliwosc
        },
        radius: Number(radius),
        pointsDistance: Number(pointsDistance),
        fileName: `${id_antena}_${id_nadajnik}_${id_program}`,
        dataFactor: dataFactor
      })
    };

    callApiFetch(`api/coordinates/generate`, requestOptions)
        .then(async(results: ResultCoordinateType) => {
          const corners123 = await getCorners(results.coordinates);
          setCorners(corners123);
        })
        .catch((error: any) => {
          console.log("Error postLookupLine:" + error);
        });
  }
  interface postLookUpLineResultType {
    results: string;
  }

  const allowedSubmit = Object.values(error).every(x => (x === null)) && pointsDistance !== "" && radius !== '' && successMessage === '';

  const customStyles = {
    content : {
      backgroundColor: 'rgb(223, 220, 227)',
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
      <CloseButton onClick={showModal(false, "export-all", false)}><span>&#10006;</span></CloseButton>
      <FloppyIcon />
      <InputWrapper>
        <AdapterCoordsWrapper>
          <AdaptersHeader>Współrzędne nadajnika:</AdaptersHeader>
            <Coord>Długość geograficzna: {(+adapter.dlugosc).toFixed(2)} </Coord>
            <Coord>Szerokość geograficzna: {(+adapter.szerokosc).toFixed(2)}</Coord>
        </AdapterCoordsWrapper>
        <AdapterCoordsWrapper>
          <AdaptersHeader>Wprowadź promień obszaru wokół nadajnika:</AdaptersHeader>
            <Coord><Input onChange={handleChangeRadius} placeholder="Promień: " /></Coord>
        </AdapterCoordsWrapper>
        <AdapterCoordsWrapper>
          <AdaptersHeader>Wprowadź dystans pomiędzy kolejnymi punktami:</AdaptersHeader>
            <Coord><Input onChange={handleChangePointsDistance} placeholder="Odległość: " /></Coord>
        </AdapterCoordsWrapper>

        {isFinished === false ?
        <ExportInputWrapper>
          <InputContainer>
            <Input value={`${id_antena}_${id_nadajnik}_${id_program}`} disabled={true}/>
            <TypeSpan>.xlsx</TypeSpan>

            <ExportWrapper>
              <Button
                onClick={allowedSubmit ? handleExportClick : () => void 0}
                label={"Wyeksportuj"}
                backColor={"#88d317"}
                backColorHover={"#0e8044"}
                disabled={!allowedSubmit}
              />
          </ExportWrapper>
          </InputContainer>

        </ExportInputWrapper> :
        <DownloadArea>
          <ResultMessage>Odwiedź stronę <a target="_blank" href="https://mapy.radiopolska.pl/">https://mapy.radiopolska.pl/</a> aby zobaczyć otrzymaną mapę.</ResultMessage>
          <div>
            <ResultMessage>Pobierz plik .kml:</ResultMessage>
            <a href={`https://storage.googleapis.com/klm-map-storage/${id_antena}_${id_nadajnik}_${id_program}.kml`} download={`${id_antena}_${id_nadajnik}_${id_program}.kml`}><DownloadIcon /></a> </div>
        </DownloadArea>}
      </InputWrapper>
      {!allowedSubmit &&  Object.values(error).map((error:ErrorsType, idx:number) => (
        <Message key={idx} error={true}>{error}</Message>
      ))}
      {successMessage &&  <div>
        <Message>{successMessage}</Message>
        { octaveLoader && <LoaderContainer><Loader type="Circles" color="#88d317" height={40} width={40}/></LoaderContainer>}
        {/* <a onClick={downloadFile} download={`${id_antena}_${id_nadajnik}_${id_program}.bmp`}>Download file ! </a> */}
        </div>}

       {loaderValue >= 0 && (loaderValue/ITERATIONS) < 1 ?
        <LoaderOverLay>
          <LoaderContainer>
              <ProgressBarWrapper>
                    <CircularProgressbar background={true} value={loaderValue/ITERATIONS} maxValue={1} text={`${Math.round((loaderValue/ITERATIONS) * 100)}%`} />;
                </ProgressBarWrapper>
          </LoaderContainer>
        </LoaderOverLay>
       : null}
    </Modal>
  );
};

export default ExportAllModal;

import React, { useState, ChangeEvent, useEffect } from "react";
import Modal from "react-modal";
import store from "../../Store/Store";
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import io from "socket.io-client";

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
  ProgressBarWrapper,
  DownloadIcon,
  DownloadArea,
  ResultMessage,
  ProgressBarOctaveWrapper,
  SuccessOctaveWrapper
} from "./ExportAllModal.style";
import { callApiFetch, getCorners } from "../../common/global";
import { LoaderOverLay } from "../SelectionPanel/SelectionPanel.styles";
import { LoaderContainer } from "../Adapters/Adapters.style";
import { CloseButton } from "../ExportModal/ExportModal.style";
import { ConfirmationDialog } from "../ConfirmationDialog/ConfirmationDialog";
import OpenElevationClient from "../../OECient/OpenElevationClient";

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: (value: boolean, type: string, query: boolean, onClose?: () => void) =>  ((event: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) => void) | undefined;
}
interface ErrorsType {
  yError: null | string;
  pointsError: null | string;
  xError: null | string;
}

const EmptyError: ErrorsType = { xError: null,
  yError: null,
  pointsError: null,
}

interface ResultCoordinateType {
  coordinates: Array<ResultType>
}
interface ResultType {
  longitude: number;
  latitude: number;
}

let ITERATIONS = 100;

const ExportAllModal = ({ modalVisiblity, showModal }: PlotModalType) => {
  const { useGlobalState } = store;
  const [adapter] = useGlobalState('adapter');
  const { id_nadajnik, id_antena, id_program} = adapter;
  const [error, setError] = useState(EmptyError);
  const [octaveLoader, setOctaveLoader] = useState(false);
  const [loaderValue, setLoaderValue] = useState(-1);
  const [octaveValueLoader, setOctaveValueLoader] = useState(-1);
  const [radius, setRadius] = useState("");
  const [pointsDistance, setPointsDistance] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [ isFinished, setIsFinihed ] = useState(false);
  const [ showConfirmationBox, setShowConfirmationBox ] = useState(false);
  const [ isConfirmed, setIsConfirmed] = useState(false);
  const [setCorners] = useState({});
  const ENDPOINT = "http://localhost:5000";
  const OEClient = new OpenElevationClient("http://0.0.0.0:10000/api/v1");

  useEffect(() => {
    const socket = io(ENDPOINT);
    //@ts-ignore
    socket.on("loaderGenerate", data => {
      setLoaderValue(data);
    });
    //@ts-ignore
    socket.on("octaveStart", data => {
      setSuccessMessage(data);
      setOctaveLoader(true);
    });
    //@ts-ignore
    socket.on("octaveError", data => {
      setErrorMessage(data);
    });
    //@ts-ignore
    socket.on("octaveLoader", data => {
      setOctaveValueLoader(data);

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

  useEffect(() => {
   if(isConfirmed) {
    handleExportClick();
   }
   setShowConfirmationBox(false);
 }, [isConfirmed, showConfirmationBox]);

  const handleChangeRadius = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError({...error, xError: null});
    const rg = /^[0-9]+$/;
    const isAllowed = rg.test(value);
    if (!isAllowed) {
      setError({...error, xError: "Nieprawidłowy zakres !"});
    }

    setRadius(value);
  }

  const handleChangePointsDistance = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError({...error, pointsError: null});
    const rg = /^\d+(\.\d+)?$/;
    const isAllowed = rg.test(value);
    if (!isAllowed) {
      setError({...error, pointsError: "Nieprawidłowy krok !"});
    }

    setPointsDistance(value);

  }

  const onCloseModal = () => {
    setIsFinihed(false);
    setSuccessMessage('');
  }

  const checkIfAlreadyExists = (): Promise<boolean> => {
    return callApiFetch(`api/kml/check-kml/${id_antena}_${id_nadajnik}_${id_program}`).then(response =>  {
      return response.exists;
    });

  }
  const removeCurrentDataFromStorage = () => {
    return callApiFetch(`api/kml/delete-kml/${id_antena}_${id_nadajnik}_${id_program}`).then(response =>  {
      return response;
    });
  }

  const handleConfirmation = (value: string) => {
    const confirmation = value === 'yes';
    setIsConfirmed(confirmation);
  }

  const handleExportClick = async() => {
    const adapterLatitudeToQuery = adapter.szerokosc &&  +(+adapter.szerokosc).toFixed(13);
    const adapterLongitudeToQuery = adapter.dlugosc &&  +(+adapter.dlugosc).toFixed(13);
    const doExists = await checkIfAlreadyExists();
    if(doExists === true && isConfirmed !== true) {
      setShowConfirmationBox(true);
    }

    if(doExists !== true || isConfirmed) {
      if(doExists === true) {
        removeCurrentDataFromStorage();
      }
      const dataFactor =  Number(radius)/Number(pointsDistance);
      if(dataFactor < 14) {
        setError({...error, pointsError: "Nieprawidłowe dane, wybierz inne wartości !"});
        setLoaderValue(-1);
        return;
      }
      setLoaderValue(0);


      if(dataFactor > 100 && dataFactor < 200) {
        ITERATIONS = 200
      }else if(dataFactor >= 200 && dataFactor < 250){
        ITERATIONS = 300
      }else if(dataFactor > 250 && dataFactor < 350){
        ITERATIONS = 500;
      } else if(dataFactor >= 300) {
        ITERATIONS = 2700;
      }

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adapter:{
            latitude: adapterLatitudeToQuery,
            longitude: adapterLongitudeToQuery,
            height: adapter.antena_npt && +adapter.antena_npt,
            frequency: adapter.czestotliwosc,
            erp: adapter.erp,
            polarization: adapter.polaryzacja,
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
          //@ts-ignore
          setCorners(corners123);
        })
        .catch((error: any) => {
          console.log("Error postLookupLine:" + error);
        });

    }



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
      onRequestClose={showModal(false, "export-all", false)}
      ariaHideApp={false}
      contentLabel="Export Modal"
      style={ customStyles }
    >
      <CloseButton onClick={showModal(false, "export-all", false, onCloseModal)}><span>&#10006;</span></CloseButton>
      <FloppyIcon />
      <InputWrapper>
        {showConfirmationBox === true ?
          <ConfirmationDialog title="Dla danej anteny wykonano już obliczenia !" message="Czy na pewno chcesz nadpisać istniejące dane?" onClickYes={()=>handleConfirmation("yes")} onClickNo={()=>handleConfirmation("no")} /> : null}
        <AdapterCoordsWrapper>
          {adapter.dlugosc && adapter.szerokosc ?
          <>
          <AdaptersHeader>Współrzędne nadajnika:</AdaptersHeader>
            <Coord>Długość geograficzna: {(+adapter.dlugosc).toFixed(2)} </Coord>
            <Coord>Szerokość geograficzna: {(+adapter.szerokosc).toFixed(2)}</Coord>
          </>:
            null }
        </AdapterCoordsWrapper>
        <AdapterCoordsWrapper>
          <AdaptersHeader>Wprowadź promień obszaru wokół nadajnika [km]:</AdaptersHeader>
            <Coord><Input onChange={handleChangeRadius} placeholder="Promień: " /></Coord>
        </AdapterCoordsWrapper>
        <AdapterCoordsWrapper>
          <AdaptersHeader>Wprowadź dystans pomiędzy kolejnymi punktami [km]:</AdaptersHeader>
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
          <div>
            <ResultMessage>Pobierz plik .kml:</ResultMessage>
            <a href={`https://storage.googleapis.com/klm-map-storage/${id_antena}_${id_nadajnik}_${id_program}.kml`} download={`${id_antena}_${id_nadajnik}_${id_program}.kml`}><DownloadIcon /></a> </div>

        </DownloadArea>}

      </InputWrapper>
      {!allowedSubmit &&  Object.values(error).map((error:ErrorsType, idx:number) => (
        <Message key={idx} error={true}>{error}</Message>
      ))}
      {successMessage && <SuccessOctaveWrapper>
        <Message>{successMessage}</Message>
        { octaveLoader && octaveValueLoader >= 0 && Math.round(octaveValueLoader) <= 1 &&
        <ProgressBarOctaveWrapper>
            <CircularProgressbar background={true} styles={buildStyles({textColor: '#88d317', pathColor: '#88d317'})} value={octaveValueLoader} maxValue={1} text={`${Math.round((octaveValueLoader) * 100)}%`} />
        </ProgressBarOctaveWrapper>
        }</SuccessOctaveWrapper>}

        {errorMessage &&  <div>
        <Message error={true}>{errorMessage}</Message>
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

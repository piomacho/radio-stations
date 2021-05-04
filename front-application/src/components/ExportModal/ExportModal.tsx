import React, { useState, ChangeEvent, useEffect } from "react";
import Modal from "react-modal";
import store from "../../Store/Store";

import Button from "../Button/Button";
import {
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
  TemplateWrapper,
  Title,
  TitleSpan,
  ValueSpan,
  CloseButton
} from "./ExportModal.style";
import { callApiFetch, measureDistance } from "../../common/global";
import OpenElevationClient from "../../OECient/OpenElevationClient";
import {LocationPickerComponent} from "./LocationPicker";
import { DownloadArea, DownloadIcon, ResultMessage } from "../ExportAllModal/ExportAllModal.style";
import io from "socket.io-client";

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: (value: boolean, type: string, query: boolean, onClose?: () => void) =>  ((event: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) => void) | undefined;
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

const ExportModal = ({ modalVisiblity, showModal }: PlotModalType) => {
  const { useGlobalState } = store;
  const [elevationResults] = useGlobalState("elevationResults");
  const [adapter] = useGlobalState('adapter');
  const [error, setError] = useState(EmptyError);
  const [fileName, setFileName] = useState("");
  const [recLongitude, setRecLongitude] = useState("");
  const [recLatitude, setRecLatitude] = useState("");
  const [distance, setDistance] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [ isFinished, setIsFinihed ] = useState(false);
  const OEClient = new OpenElevationClient("http://0.0.0.0:10000/api/v1");
  const ENDPOINT = "http://localhost:5000";

  useEffect(() => {
    const socket = io(ENDPOINT);
     //@ts-ignore
    socket.on("finishXlsProcessing", data => {

      callApiFetch(`api/export-octave/upload-xls/${fileName}`)
      .then(() => {
        setSuccessMessage(data);
        setIsFinihed(true);
      });
    });

    return ()=>{
      socket.disconnect();
     }
  }, [fileName]);

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

  const handleChangeDistance = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError({...error, pointsError: null});
    const rg = /^[+-]?\d+(\.\d+)?$/;
    const isAllowed = rg.test(value);
    if (!isAllowed) {
      setError({...error, pointsError: "Niepoprawna odległość między punktami!"});
    }

    setDistance(value);

  }

  const handleExportClick = () => {
      const adapterX = +(+adapter.szerokosc).toFixed(10);
      const adapterY = +(+adapter.dlugosc).toFixed(10);
      return OEClient.postLookupLine({
        adapterLongitude: +adapterY,
        adapterLatitude: +adapterX,
        range: measureDistance( adapterX, adapterY, +recLatitude, +recLongitude).toFixed(2),
        distance: distance,
        receiverLongitude: +recLongitude,
        receiverLatitude: +recLatitude,
      })
        .then((results: any) => {
          handleExport(results);
          return true;
        })
        .catch((error: any) => {
          console.log("Error postLookupLine:" + error);
          return false;
        });
  }

  const onCloseModal = () => {
    setIsFinihed(false);
    setSuccessMessage('');
  }

  const handleExport = (results: any) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coordinates: results.results,
        fileName: fileName,
        adapter: { latitude: adapterX, longitude: adapterY, height: adapter.antena_npt, frequency: adapter.czestotliwosc,
          polarization: adapter.polaryzacja},
        receiver: { latitude: +recLatitude, longitude: +recLongitude },
      })
    };

    callApiFetch(`api/export-octave/send`, requestOptions)
      .then(() => {
        setSuccessMessage("Zapisano plik! Trwa proces w Octave ... ");
      })
      .catch(err => setError(err));
  };

  const allowedSubmit = Object.values(error).every(x => (x === null)) && fileName.length > 0;
  const adapterX = +(+adapter.szerokosc).toFixed(2);
  const adapterY = +(+adapter.dlugosc).toFixed(2);

  const customStyles = {
    content : {
      backgroundColor: '#dfdce3',
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
      <CloseButton onClick={showModal(false, "export", false, onCloseModal)}><span>&#10006;</span></CloseButton>
      <Title>Wybierz punkt na mapie: </Title>
      <TemplateWrapper>
        <LocationPickerComponent
          handleChangeX={setRecLongitude}
          handleChangeY={setRecLatitude}
          recLongitude={recLongitude}
          recLatitude={recLatitude}

        />
        <InputWrapper>
          <AdapterCoordsWrapper>
            <AdaptersHeader>Współrzędne nadajnika:</AdaptersHeader>
              <TitleSpan>Długość: <ValueSpan>{(+adapter.dlugosc).toFixed(2)}</ValueSpan></TitleSpan>
              <TitleSpan>Szerokość:  <ValueSpan>{(+adapter.szerokosc).toFixed(2)}</ValueSpan></TitleSpan>
          </AdapterCoordsWrapper>
          <AdapterCoordsWrapper>
            <AdaptersHeader>Współrzędne odbiornika:</AdaptersHeader>
              <TitleSpan>Długość: <ValueSpan>{(+recLongitude).toFixed(2)}</ValueSpan> </TitleSpan>
              <TitleSpan>Szerokość: <ValueSpan>{ (+recLatitude).toFixed(2)}</ValueSpan></TitleSpan>
          </AdapterCoordsWrapper>
          {recLongitude !== "" && recLatitude !== "" &&
                <AdapterCoordsWrapper>
                  <AdaptersHeader>Odległość [km]: <ValueSpan>{` ${measureDistance( adapterX, adapterY, +recLatitude, +recLongitude,).toFixed(2)} km`}</ValueSpan></AdaptersHeader>
                </AdapterCoordsWrapper>}
          <AdapterCoordsWrapper>
            <AdaptersHeader>Odległość między punktami [km]:</AdaptersHeader>
              <Coord><Input onChange={handleChangeDistance} placeholder="Odległość: " /></Coord>
          </AdapterCoordsWrapper>
          {isFinished ?
          <DownloadArea>
            <div>
              <ResultMessage>Pobierz plik .xls:</ResultMessage>
              <a href={`https://storage.googleapis.com/klm-map-storage/${fileName}.xlsx`} download={`${fileName}.xls`}><DownloadIcon /></a> </div>

          </DownloadArea> :
          <ExportInputWrapper>
            <InputContainer>
              <Input onChange={handleChange} placeholder="Wpisz nazwę pliku:" />
              <TypeSpan>.xlsx</TypeSpan>
              <ExportWrapper>
              <Button
                onClick={allowedSubmit ? handleExportClick : () => void 0}
                label={"Wykonaj obliczenia"}
                backColor={"#0f1626"}
                backColorHover={"#f5f5f5"}
                color={"#f5f5f5"}
                colorHover={"#0f1626"}
                disabled={!allowedSubmit}
              />
            </ExportWrapper>
            </InputContainer>

          </ExportInputWrapper> }
        </InputWrapper>

        {!allowedSubmit &&  Object.values(error).map((error:ErrorsType, idx:number) => (
          <Message key={idx} error={true}>{error}</Message>
        ))}
        {successMessage && <Message>{successMessage}</Message>}

      </TemplateWrapper>

    </Modal>
  );
};

export default ExportModal;

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
  DistanceDisplay,
  TemplateWrapper
} from "./ExportModal.style";
import { ButtonWrapper } from "../Button/Button.styles";
import { callApiFetch, lineFromPoints, measureDistance } from "../../common/global";
import OpenElevationClient from "../../OECient/OpenElevationClient";
import {LocationPickerExample} from "./LocationPicker";

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

const ExportModal = ({ modalVisiblity, showModal }: PlotModalType) => {
  const { useGlobalState } = store;
  const [elevationResults] = useGlobalState("elevationResults");
  const [adapter] = useGlobalState('adapter');
  const [error, setError] = useState(EmptyError);
  const [fileName, setFileName] = useState("");
  const [recLongitude, setRecLongitude] = useState("");
  const [recLatitude, setRecLatitude] = useState("");
  const [points, setPoints] = useState("");
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

  const handleChangeX = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError({...error, xError: null});
    const rg = /^[+-]?\d+(\.\d+)?$/; // forbidden file names
    const isAllowed = rg.test(value);
    // setAllowedName(isAllowed);
    if (!isAllowed) {
      setError({...error, xError: "Latitude is not allowed !"});
    }

    setRecLatitude(value);
  }

  const handleChangePoints = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError({...error, pointsError: null});
    const rg = /^[0-9]+$/;
    const isAllowed = rg.test(value);
    if (!isAllowed) {
      setError({...error, pointsError: "Points quantity is invalid !"});
    }

    setPoints(value);

  }

  const handleChangeY = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setError({...error, yError: null});
    const rg = /^[+-]?\d+(\.\d+)?$/;
    const isAllowed = rg.test(value);
    if (!isAllowed) {
      setError({...error, yError: "Longitude is not allowed !"});
    }

    setRecLongitude(value);
  }

  const handleExportClick = () => {
      const adapterX = +(+adapter.szerokosc).toFixed(2);
      const adapterY = +(+adapter.dlugosc).toFixed(2);
      return OEClient.postLookupLine({
        adapterLongitude: +adapterY,
        adapterLatitude: +adapterX,
        range: measureDistance( adapterX, adapterY, +recLatitude, +recLongitude).toFixed(2),
        numberOfPoints: points,
        receiverLongitude: +recLongitude,
        receiverLatitude: +recLatitude
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

  const handleExport = (results: any) => {
    const bodyObject =  JSON.stringify( {
      fileName: fileName,
      data:
        [
          {
            coordinates: results.results,
            adapter: { latitude: adapterX, longitude: adapterY, height: adapter.wys_npm, frequency: adapter.czestotliwosc},
            receiver: { latitude: +recLatitude, longitude: +recLongitude }
          },
          {
            coordinates: results.results,
            adapter: { latitude: adapterX, longitude: adapterY, height: adapter.wys_npm, frequency: adapter.czestotliwosc},
            receiver: { latitude: +recLatitude, longitude: +recLongitude }
          }
        ]
    });
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // body: bodyObject
      body: JSON.stringify({
        coordinates: results.results,
        fileName: fileName,
        adapter: { latitude: adapterX, longitude: adapterY, height: adapter.wys_npm, frequency: adapter.czestotliwosc},
        receiver: { latitude: +recLatitude, longitude: +recLongitude }
      })
    };
    if (true) {
      callApiFetch(`api/export-octave/send`, requestOptions)
        .then(() => {
          setSuccessMessage("File saved succcessfully! Octave process in progress ... ");
        })
        .catch(err => setError(err));
    }
  };

  const allowedSubmit = Object.values(error).every(x => (x === null)) && fileName.length > 0;
  const adapterX = +(+adapter.szerokosc).toFixed(2);
  const adapterY = +(+adapter.dlugosc).toFixed(2);

  const customStyles = {
    content : {
      backgroundColor: '#FBE9EB',
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
      <TemplateWrapper>
        <LocationPickerExample />
        <InputWrapper>
          <AdapterCoordsWrapper>
            <AdaptersHeader>Transmitter locations:</AdaptersHeader>
              <Coord>Longitude: {(+adapter.dlugosc).toFixed(2)} </Coord>
              <Coord>Latitude: {(+adapter.szerokosc).toFixed(2)}</Coord>
          </AdapterCoordsWrapper>
          <AdapterCoordsWrapper>
            <AdaptersHeader>Input coordinates:</AdaptersHeader>
              <Coord><Input onChange={handleChangeY} placeholder="Receiver longitude: " /></Coord>
              <Coord><Input onChange={handleChangeX} placeholder="Receiver latitude: " /></Coord>
              <Coord><Input onChange={handleChangePoints} placeholder="Number of points: " /></Coord>
          </AdapterCoordsWrapper>
          <ExportInputWrapper>
            <DistanceDisplay>{ recLongitude !== "" && recLatitude !== "" &&  `Distance: ${measureDistance( adapterX, adapterY, +recLatitude, +recLongitude,).toFixed(2)} km`}</DistanceDisplay>
            <DistanceDisplay>{ recLongitude !== "" && recLatitude !== "" && points !== '' && `Unit distance: ${(measureDistance(adapterX, adapterY, +recLatitude, +recLongitude,)/+points).toFixed(2)} km`}</DistanceDisplay>
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

        {!allowedSubmit &&  Object.values(error).map((error:ErrorsType, idx:number) => (
          <Message key={idx} error={true}>{error}</Message>
        ))}
        {successMessage && <Message>{successMessage}</Message>}
        <ButtonWrapper>
          <Button
            onClick={showModal(false, "export", false)}
            label={"Close"}
            backColorHover={"#ff7979"}
          />
        </ButtonWrapper>
      </TemplateWrapper>

    </Modal>
  );
};

export default ExportModal;

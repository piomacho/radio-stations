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
} from "./ExportModal.style";
import { ButtonWrapper } from "../Button/Button.styles";
import { callApiFetch, lineFromPoints, measureDistance } from "../../common/global";
import OpenElevationClient from "../../OECient/OpenElevationClient";

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: (value: boolean, type: string) => any;
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
  const [allowedName, setAllowedName] = useState(false);
  const [fileName, setFileName] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");
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
    if (!isAllowed) {
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
      setError({...error, xError: "X is not allowed !"});
    }

    setX(value);
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
    // setAllowedName(isAllowed);
    if (!isAllowed) {
      setError({...error, yError: "X is not allowed !"});
    }

    setY(value);
  }

  const handleExportTemp = () => {
    // TODO please refactor
      const adapterX = +(+adapter.szerokosc).toFixed(2);
      const adapterY = +(+adapter.dlugosc).toFixed(2);
      const lineDetails = lineFromPoints({x: adapterX, y: adapterY}, {x: +x, y: +y});

      return OEClient.postLookupLine({
        adapterLatitude: +adapter.szerokosc,
        adapterLongitude: +adapter.dlugosc,
        range: measureDistance(adapterX, adapterY, +y, +x).toFixed(2),
        numberOfPoints: points,
        intercept: lineDetails.intercept,
        direction: lineDetails.direction
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
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coordinates: results.results,
        fileName: fileName
      })
    };

    if (true) {
      callApiFetch(`api/export-octave/send/`, requestOptions)
        .then(() => {
          setSuccessMessage("File saved succcessfully!");
          setFileName("");
        })
        .catch(err => setError(err));
    }
  };

  const allowedSubmit = Object.values(error).every(x => (x === null));
  const adapterX = +(+adapter.dlugosc).toFixed(2);
  const adapterY = +(+adapter.szerokosc).toFixed(2);
  return (
    <Modal
      isOpen={modalVisiblity}
      onRequestClose={showModal(false, "export")}
      ariaHideApp={false}
      contentLabel="Export Modal"
    >
      <FloppyIcon />
      <InputWrapper>
        <AdapterCoordsWrapper>
          <AdaptersHeader>Adapter locations:</AdaptersHeader>
            <Coord>x: {(+adapter.dlugosc).toFixed(2)}</Coord>
            <Coord>y: {(+adapter.szerokosc).toFixed(2)}</Coord>
        </AdapterCoordsWrapper>
        <AdapterCoordsWrapper>
          <AdaptersHeader>Input coordinates:</AdaptersHeader>
            <Coord><Input onChange={handleChangeX} placeholder="x: " /></Coord>
            <Coord><Input onChange={handleChangeY} placeholder="y: " /></Coord>
            <Coord><Input onChange={handleChangePoints} placeholder="points: " /></Coord>
        </AdapterCoordsWrapper>
        <ExportInputWrapper>
          <DistanceDisplay>{ x !== "" && y !== "" &&  `Distance: ${measureDistance(adapterX, adapterY, +x, +y).toFixed(2)} km`}</DistanceDisplay>
          <DistanceDisplay>{ x !== "" && y !== "" && points !== '' && `Unit distance: ${(measureDistance(adapterX, adapterY, +x, +y)/+points).toFixed(2)} km`}</DistanceDisplay>
          <InputContainer>
            <Input onChange={handleChange} placeholder="Enter file name:" />
            <TypeSpan>.csv</TypeSpan>
            <ExportWrapper>
            <Button
              // onClick={handleExport}
              onClick={handleExportTemp}
              label={"Export"}
              backColor={"#7bed9f"}
              backColorHover={"#2ed573"}
              disabled={!allowedSubmit}
            />
          </ExportWrapper>
          </InputContainer>

        </ExportInputWrapper>
      </InputWrapper>
      {!allowedName && fileName.length > 0 && (
        <Message error={true}>{error.fileNameError}</Message>
      )}
      {successMessage && <Message>{successMessage}</Message>}
      <ButtonWrapper>
        <Button
          onClick={showModal(false, "export")}
          label={"Close"}
          backColorHover={"#ff7979"}
        />
      </ButtonWrapper>
    </Modal>
  );
};

export default ExportModal;

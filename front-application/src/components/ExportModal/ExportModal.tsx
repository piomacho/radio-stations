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
  ExportInputWrapper
} from "./ExportModal.style";
import { ButtonWrapper } from "../Button/Button.styles";
import { callApiFetch, lineFromPoints } from "../../common/global";

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: (value: boolean, type: string) => any;
}

const ExportModal = ({ modalVisiblity, showModal }: PlotModalType) => {
  const { useGlobalState } = store;
  const [elevationResults] = useGlobalState("elevationResults");
  const [adapter] = useGlobalState('adapter');
  const [error, setError] = useState("");
  const [allowedName, setAllowedName] = useState(false);
  const [fileName, setFileName] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSuccessMessage("");
    setError("");
    setFileName(value);
    const rg1 = /^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
    const rg2 = /^\./; // cannot start with dot (.)
    const rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
    const isAllowed = rg1.test(value) && !rg2.test(value) && !rg3.test(value);
    setAllowedName(isAllowed);
    if (!isAllowed) {
      setError("Name is not allowed.");
    }
  };

  const handleChangeX = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const rg = /^[+-]?\d+(\.\d+)?$/; // forbidden file names
    const isAllowed = rg.test(value);
    setAllowedName(isAllowed);
    if (!isAllowed) {
      setError("X is not allowed.");
    }

    setX(value);
  }

  const handleChangeY = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const rg = /^[+-]?\d+(\.\d+)?$/; // forbidden file names
    const isAllowed = rg.test(value);
    setAllowedName(isAllowed);
    if (!isAllowed) {
      setError("Y is not allowed.");
    }

    setY(value);
  }

  const handleExport = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coordinates: elevationResults,
        fileName: fileName
      })
    };

    // todo please refactor
    const adapterX = +(+adapter.szerokosc).toFixed(2);
    const adapterY = +(+adapter.dlugosc).toFixed(2);
    console.log("X ", adapterX, "Y ", adapterY);

    // lineFromPoints({x: adapterX, y: adapterY}, {x: +x, y: +y});
    lineFromPoints({x: 3, y: 4}, {x: 4, y: 3});


    if (allowedName) {
      callApiFetch(`api/export-octave/send/`, requestOptions)
        .then(() => {
          setSuccessMessage("File saved succcessfully!");
          setFileName("");
        })
        .catch(err => setError(err));
    }
  };

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
        </AdapterCoordsWrapper>
        <ExportInputWrapper>
          <InputContainer>
            <Input onChange={handleChange} placeholder="Enter file name:" />
            <TypeSpan>.csv</TypeSpan>
          </InputContainer>
          <ExportWrapper>
            <Button
              onClick={handleExport}
              label={"Export"}
              backColor={"#7bed9f"}
              backColorHover={"#2ed573"}
              disabled={!allowedName}
            />
          </ExportWrapper>
        </ExportInputWrapper>
      </InputWrapper>
      {!allowedName && fileName.length > 0 && (
        <Message error={true}>{error}</Message>
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

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
  Message
} from "./ExportModal.style";
import { ButtonWrapper } from "../Button/Button.styles";
import { callApiFetch } from "../../common/global";

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: (value: boolean, type: string) => any;
}

const ExportModal = ({ modalVisiblity, showModal }: PlotModalType) => {
  const { useGlobalState } = store;
  const [elevationResults] = useGlobalState("elevationResults");
  const [error, setError] = useState("");
  const [allowedName, setAllowedName] = useState(false);
  const [fileName, setFileName] = useState("");
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

  const handleExport = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coordinates: elevationResults,
        fileName: fileName
      })
    };
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

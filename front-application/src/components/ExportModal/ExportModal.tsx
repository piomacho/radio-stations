import React from "react";
import Modal from "react-modal";
import store, { CoordinatesType } from "../../Store/Store";
import Button from "../Button/Button";
import { FloppyIcon, InputWrapper, TypeSpan, Input, InputContainer, ExportWrapper } from "./ExportModal.style";
import { ButtonWrapper } from "../Button/Button.styles";
import { callApiFetch } from "../../common/global";


interface PlotModalType {
  modalVisiblity: boolean;
  showModal: (value: boolean, type: string) => any;

}



const ExportModal = ({ modalVisiblity, showModal }: PlotModalType) => {
  const { useGlobalState } = store;
  const [elevationResults] = useGlobalState("elevationResults");

  const handleExport = () => {

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates: elevationResults })
    };

    callApiFetch(`api/export-octave/send/`, requestOptions)
    .then(response => console.log(response))
    .catch(err => console.log(err));
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
          <Input placeholder="Enter file name:" />
          <TypeSpan>.csv</TypeSpan>
      </InputContainer>
      <ExportWrapper>
        <Button
          onClick={handleExport}
          label={"Export"}
          height={30}
          width={50}
          backColor={"#7bed9f"}
          backColorHover={"#2ed573"}
        />
        </ExportWrapper>
      </InputWrapper>
      <ButtonWrapper>
        <Button
          onClick={showModal(false, "export")}
          label={"Close"}
          height={30}
          width={50}
          backColorHover={"#ff7979"}
        />
      </ButtonWrapper>
    </Modal>
  );
};

export default ExportModal;

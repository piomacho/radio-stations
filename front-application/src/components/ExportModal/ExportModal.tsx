import React from "react";
import Modal from "react-modal";
import Button from "../Button/Button";
import { FloppyIcon, InputWrapper, TypeSpan, Input } from "./ExportModal.style";
import { ButtonWrapper } from "../Button/Button.styles";


interface PlotModalType {
  modalVisiblity: boolean;
  showModal: (value: boolean, type: string) => any;

}

const ExportModal = ({ modalVisiblity, showModal }: PlotModalType) => {

  return (
    <Modal
      isOpen={modalVisiblity}
      onRequestClose={showModal(false, "export")}
      ariaHideApp={false}
      contentLabel="Export Modal"
    >
      <FloppyIcon />
      <InputWrapper>
        <Input placeholder="Enter file name:" />
        <TypeSpan>.csv</TypeSpan>

        <Button
          onClick={console.log("pyk")}
          label={"Export"}
          height={30}
          width={50}
          backColor={"#7bed9f"}
          backColorHover={"#2ed573"}
        />
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

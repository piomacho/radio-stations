import React from "react";
import Modal from "react-modal";
import Button from "../Button/Button";
import Map from '../Map/Map'
import { ButtonWrapper } from "./GMapsModal.style";

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: (value: boolean, type: string, query: boolean) => any;

}

const GMapsModal = ({ modalVisiblity, showModal }: PlotModalType) => {

  return (
    <Modal
      isOpen={modalVisiblity}
      onRequestClose={showModal(false, "maps", false)}
      ariaHideApp={false}
      contentLabel="Example Modal"
    >
      <Map />
      <ButtonWrapper>
        <Button
          onClick={showModal(false, "maps", false)}
          label={"Close"}
          height={30}
          width={80}
          backColorHover={"#ff7979"}
        />
      </ButtonWrapper>
    </Modal>
  );
};

export default GMapsModal;

import React, { useEffect, useState } from "react";
import { callApiFetch } from '../../common/global';
import Modal from "react-modal";
import store, { CoordinatesType } from "../../Store/Store";
import Button from "../Button/Button";
import Map from '../Map/Map'

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
      <Button
        onClick={showModal(false, "maps", false)}
        label={"Close"}
        height={30}
        width={50}
        backColorHover={"#ff7979"}
      />
    </Modal>
  );
};

export default GMapsModal;

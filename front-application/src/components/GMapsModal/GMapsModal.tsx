import React, { useEffect, useState } from "react";
import { callApiFetch } from '../../common/global';
import Modal from "react-modal";
import store, { CoordinatesType } from "../../Store/Store";
import Button from "../Button/Button";
import Map from '../Map/Map'

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: (value: boolean, type: string) => any;

}

const GMapsModal = ({ modalVisiblity, showModal }: PlotModalType) => {
  var layout = {
    title: "Google Maps comparison",
    autosize: false,
    width: 800,
    height: 800,
    margin: {
      l: 90,
      r: 90,
      b: 90,
      t: 90
    }
  };
  return (
    <Modal
      isOpen={modalVisiblity}
      onRequestClose={showModal(false, "maps")}
      ariaHideApp={false}
      contentLabel="Example Modal"
    >
      <Map />
      <Button
        onClick={showModal(false, "maps")}
        label={"Close"}

        
        height={30}
        width={50}
        backColorHover={"#ff7979"}
      />
    </Modal>
  );
};

export default GMapsModal;

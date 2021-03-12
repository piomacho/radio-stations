import React, { useState } from "react";
import Modal from "react-modal";
import L from 'leaflet';
// postCSS import of Leaflet's CSS
import 'leaflet/dist/leaflet.css';

import { CloseButton, Title } from "../ExportModal/ExportModal.style";
import {LeafletMap} from "./LeafletMap/LeafletMap";
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

const config: any = {};

config.params = {
  center: [52.1, 20.3],
  zoomControl: false,
  zoom: 7,
  maxZoom: 18,
  minZoom: 4,
};
config.tileLayer = {
  uri: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  params: {
    minZoom: 4,
    maxZoom: 16,
    attribution:
      'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    id: '',
    accessToken: '',
  },
};

const ShowMapsModal = ({ modalVisiblity, showModal }: PlotModalType) => {


  const customStyles = {
    content : {
      backgroundColor: 'rgb(223, 220, 227)',
    }
  };

  const handleOnChange = (layer: L.LayerGroup<any> | null) => {

    if(layer !== null) {
      layer.clearLayers();
    }
  }

  const closeModalHandler = () => {
    showModal(false, "show-maps", false);
  }

  return (
    <Modal
      isOpen={modalVisiblity}
      onRequestClose={closeModalHandler}
      ariaHideApp={false}
      contentLabel="Export Modal"
      style={ customStyles }
    >
      <CloseButton onClick={showModal(false, "show-maps", false)}><span>&#10006;</span></CloseButton>
      <Title>Obliczone mapy </Title>
      <LeafletMap handleOnChange={handleOnChange}/>
    </Modal>
  );
};

export default ShowMapsModal;

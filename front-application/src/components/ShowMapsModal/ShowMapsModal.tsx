import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import Modal from "react-modal";
import store from "../../Store/Store";
import L, { Circle, FeatureGroup, LayerGroup, Popup, Rectangle, TileLayer } from 'leaflet';
// postCSS import of Leaflet's CSS
import 'leaflet/dist/leaflet.css';

import Button from "../Button/Button";

import { callApiFetch, measureDistance } from "../../common/global";
import OpenElevationClient from "../../OECient/OpenElevationClient";
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

const EmptyError: ErrorsType = { xError: null,
  yError: null,
  pointsError: null,
  fileNameError: null
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
  // uri: process.env.TILE_PROVIDER_2_URL,
  params: {
    minZoom: 4,
    maxZoom: 16,
    attribution:
      'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    id: '',
    accessToken: '',
  },
};

// config.myIcon = L.icon({
//   iconUrl: icon,
//   iconSize: [30, 65],
//   // iconAnchor: [22, 94],
//   popupAnchor: [0, -35],
// });

// config.gpsIcon = L.icon({
//   iconUrl: gpsIcon,
//   iconSize: [30, 65],
//   // iconAnchor: [22, 94],
//   popupAnchor: [-10, -35],
// });


const ShowMapsModal = ({ modalVisiblity, showModal }: PlotModalType) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const { useGlobalState } = store;
  const [adapter] = useGlobalState('adapter');


  const customStyles = {
    content : {
      backgroundColor: 'rgb(223, 220, 227)',
    }
  };
  return (
    <Modal
      isOpen={modalVisiblity}
      onRequestClose={showModal(false, "show-maps", false)}
      ariaHideApp={false}
      contentLabel="Export Modal"
      style={ customStyles }
    >
      <CloseButton onClick={showModal(false, "show-maps", false)}><span>&#10006;</span></CloseButton>
      <Title>Obliczone mapy </Title>
        <LeafletMap />
    </Modal>
  );
};

export default ShowMapsModal;

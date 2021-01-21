import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import store from "../../../Store/Store";
import L from 'leaflet';
import { fetchKMLsArray } from '../helpers/maps-layers.js';
import { MapLeaflet } from './LeafletMap.style';

import 'leaflet/dist/leaflet.css';
// import '../styles/Map.css';
const icon = require('../images/transmitter_half.png').default;


const { PROD_FILES_URL } = process.env;
const { PROD_LIST_URL } = process.env;

const config: Record<string, any> = {};

config.params = {
  center: [52.1, 20.3],
  zoomControl: false,
  zoom: 7,
  maxZoom: 18,
  minZoom: 4,
};

config.myIcon = L.icon({
    iconUrl: icon,
    iconSize: [30, 65],
    // iconAnchor: [22, 94],
    popupAnchor: [0, -35],
  });
config.tileLayer = {
  uri:'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  params: {
    minZoom: 4,
    maxZoom: 16,
    attribution:
      'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    id: '',
    accessToken: '',
  },
};

export const LeafletMap = () => {
  const { useGlobalState } = store;
  const [adapter] = useGlobalState('adapter');
  const [ mapNode, setMapNode ] = React.useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const layersGroup = init(mapNode);
    fetchKMLsArray(
       adapter
      ).then((res) => {
        if(res !== null) {
          newDrawLayers(res, layersGroup)
        }

      });
  }, [mapNode])




  const newDrawLayers = (bounds: L.LatLngBounds, layersGroup: L.LayerGroup<any> | null) => {

    const url = `https://mapy.radiopolska.pl/files/get/fm-std/${adapter._mapahash}.png`;
    //   const url = `https://bitmap-hosting.herokuapp.com/api/images/get-image/${element._mapahash}`;
    if(layersGroup !== null) {
      fetch(url)
      .then(() => {
        const layer = L.imageOverlay(url, bounds, { opacity: 0.6 });
        layersGroup.addLayer(layer);
        console.log('layer ', layer);
      })
      .catch((e) => console.log(e));
    }

  }


  const init = (id: HTMLDivElement | null) => {
    if(id !== null) {
      const newMap = L.map(id, config.params);
      L.control.zoom({ position: 'bottomright' }).addTo(newMap);
      const layersGroup = new L.LayerGroup();
      layersGroup.addTo(newMap);

      // L.control.scale({ position: 'bottomleft' }).addTo(map);
      // a TileLayer is used as the "basemap"
      new L.TileLayer(config.tileLayer.uri, config.tileLayer.params).addTo(
        newMap,
      );
      return layersGroup
    }


    // set our state to include the tile layer
    // this.setState({ map: newMap });
    return null
  }


  const mapRef = (node: HTMLDivElement) => {
    setMapNode(node)
  };
  return (
      <MapLeaflet ref={mapRef} id="map" />
  );

}


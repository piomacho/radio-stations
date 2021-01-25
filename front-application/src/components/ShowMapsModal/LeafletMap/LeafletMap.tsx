import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import store from "../../../Store/Store";
import L from 'leaflet';
import { MapLeaflet } from './LeafletMap.style';
import {parseString} from 'xml2js';


import 'leaflet/dist/leaflet.css';
import { callApiFetch } from "../../../common/global";
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
const mapKMLToBounds = (response: any) => {
  const kml = response.kml.GroundOverlay;
  console.log("Bounds ", kml)
  // const kml = xml2js(response, { ignoreAttributes: true, compact: true }).kml.GroundOverlay;
  const boundsArray = [];
  if(kml.length > 0) {
    boundsArray.push(Number(kml[0].LatLonBox[0].east[0]));
    boundsArray.push(Number(kml[0].LatLonBox[0].north[0]));
    boundsArray.push(Number(kml[0].LatLonBox[0].south[0]));
    boundsArray.push(Number(kml[0].LatLonBox[0].west[0]));
    const corner1 = L.latLng(Number(boundsArray[1]), Number(boundsArray[0]));
    const corner2 = L.latLng(Number(boundsArray[2]), Number(boundsArray[3]));
    return L.latLngBounds(corner1, corner2);
  }

};

export const LeafletMap = () => {
  const { useGlobalState } = store;
  const [adapter] = useGlobalState('adapter');
  const [ mapNode, setMapNode ] = React.useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const layersGroup = init(mapNode);

    const mapahash = adapter._mapahash;
    callApiFetch(`api/comparison-map/kml/${mapahash}`).then((res) => {

     parseString(res.text, function (err, result) {
        console.dir(result);
        if(res.status === 200) {
          const bounds = mapKMLToBounds(result);
          if(bounds !== undefined){
            newDrawLayers(bounds, layersGroup)
          }

        } else {
          throw Error('Brak opisu mapy pokrycia o podanym id w bazie danych');
        }

      });

    });

  }, [mapNode])




  const newDrawLayers = (bounds: L.LatLngBounds, layersGroup: L.LayerGroup<any> | null) => {
    console.log(" bunds ", bounds );
    const url = `https://mapy.radiopolska.pl/files/get/fm-std/${adapter._mapahash}.png`;
    //   const url = `https://bitmap-hosting.herokuapp.com/api/images/get-image/${element._mapahash}`;
    if(layersGroup !== null) {
      callApiFetch(`api/comparison-map/image/${adapter._mapahash}`)
        .then(() => {
          const layer = L.imageOverlay(url, bounds, { opacity: 0.6 });
          layersGroup.addLayer(layer);
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


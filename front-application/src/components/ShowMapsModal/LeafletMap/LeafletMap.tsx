import React, { useEffect } from "react";
import store from "../../../Store/Store";
import L from 'leaflet';
import { MapLeaflet, OverLayElement, LoaderContainer } from './LeafletMap.style';
import {parseString} from 'xml2js';
import Loader from 'react-loader-spinner'
import 'leaflet/dist/leaflet.css';
import { callApiFetch } from "../../../common/global";
import { SourceTitle, ToggleWrapper } from "./ShowMapsModal.styles";
import { CheckBox, CheckBoxLabel, CheckBoxWrapper } from "../../ToggleSwitch/ToggleSwitch.styles";
import icon from '../images/transmitter_half.png';
import { MissingMapDialog } from "../../ConfirmationDialog/MissingMapDialog";
import Legend from "../../Legend/Legend";

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
const mapKMLToBounds = (response: Record<string, any>) => {
  const kml = response.kml.GroundOverlay;
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

const mapKMLToBoundsNew = (response: Record<string, any>) => {
  const kml = response.kml;
  const corner1 = L.latLng(Number(kml['maxLongMaxLat-latitude'][0]), Number(kml['maxLongMaxLat-longitude'][0]));
  const corner2 = L.latLng(Number(kml['minLongMinLat-latitude'][0]), Number(kml['minLongMinLat-longitude'][0]));
  return L.latLngBounds(corner1, corner2);
}


interface LeafletMapType {
  handleOnChange: (l: L.LayerGroup<any> | null) => void;
}

export const LeafletMap = ({handleOnChange}: LeafletMapType) => {
  const { useGlobalState } = store;
  const [adapter] = useGlobalState('adapter');
  const [isTl2001, setTl2001] = React.useState<boolean>(false);
  const [ loading, setLoading ] = React.useState(false);
  const [ showConfirmationBox, setConfirmationBox ] = React.useState(false);
  const [ mapNode, setMapNode ] = React.useState<HTMLDivElement | null>(null);
  const [ layersGroup, setLayersGroup ] = React.useState<L.LayerGroup<any> | null>(null);

  useEffect(() => {
    const layersGroup123 = init(mapNode);
    setLayersGroup(layersGroup123);
    const mapahash = adapter._mapahash;
    callApiFetch(`api/comparison-map/kml/${mapahash}`).then((res) => {

     parseString(res.text, function (err, result) {
        if(res.status === 200) {
          const bounds = mapKMLToBounds(result);
          if(bounds !== undefined){
            newDrawLayers(bounds, layersGroup123)
          }

        } else {
          throw Error('Brak opisu mapy pokrycia o podanym id w bazie danych');
        }

      });

    });
  }, [mapNode]);


  useEffect(() => {
    if(isTl2001){
      getTl2001Map();

    } else {
      getMRPMap();
    }


  }, [isTl2001])

  const getMRPMap = () => {
    const mapahash = adapter._mapahash;

    callApiFetch(`api/comparison-map/kml/${mapahash}`).then((res) => {

      parseString(res.text, function (err, result) {
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
  }


  const getTl2001Map = () => {
    const {id_antena, id_nadajnik, id_program} = adapter;

    setLoading(true);
    callApiFetch(`api/comparison-map/kml-new/${id_antena}_${id_nadajnik}_${id_program}`).then((res) => {
      parseString(res.text, function (err, result) {
          if(result && result.kml){
            const bounds = mapKMLToBoundsNew(result);
            if(bounds !== undefined){
              setLoading(false);
              newDrawLayersNew(bounds, layersGroup)
            }
          } else{
            setLoading(false);
            setConfirmationBox(true);
            console.log("Missing map in storage ! ")
          }

      });

     });
  }

  const closeConfirmationModal = () => {
    setConfirmationBox(false);
  }


  const newDrawLayers = (bounds: L.LatLngBounds, layersGroup: L.LayerGroup<any> | null) => {
    const url = `https://mapy.radiopolska.pl/files/get/fm-std/${adapter._mapahash}.png`;
    if(layersGroup !== null) {
      const layer = L.imageOverlay(url, bounds, { opacity: 0.6 });
      layersGroup.addLayer(layer);
    }

  }

  const newDrawLayersNew = (bounds: L.LatLngBounds, layersGroup: L.LayerGroup<any> | null) => {
    const bucketName = 'klm-map-storage';
    const {id_nadajnik, id_program, id_antena} = adapter;

    const url = `http://${bucketName}.storage.googleapis.com/${id_antena}_${id_nadajnik}_${id_program}.png`;
    if(layersGroup !== null) {
      const layer = L.imageOverlay(url, bounds, { opacity: 0.6 });
      layersGroup.addLayer(layer);
    }

  }


  const init = (id: HTMLDivElement | null) => {
    if(id !== null) {
      const newMap = L.map(id, config.params);
      L.control.zoom({ position: 'bottomright' }).addTo(newMap);
      const layersGroup = new L.LayerGroup();
      layersGroup.addTo(newMap);

      const marker = L.marker([+adapter.szerokosc, +adapter.dlugosc], {
        icon: config.myIcon,
      }).addTo(newMap);

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

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setTl2001(isChecked);
    handleOnChange(layersGroup)
  }
  return (
    <>
      <Legend />
      <ToggleWrapper>
        <SourceTitle>Mapy radiopolska</SourceTitle>
        <CheckBoxWrapper>
        <CheckBox id="checkbox" type="checkbox" onChange={onChange}/>
        <CheckBoxLabel htmlFor="checkbox" />
      </CheckBoxWrapper>
      <SourceTitle>tl_p2001</SourceTitle>
      </ToggleWrapper>
        <MapLeaflet ref={mapRef} id="map" />
      <OverLayElement active={loading} >
        <LoaderContainer><Loader type="Circles" color="#22a6b3" height={40} width={40}/></LoaderContainer>
       </OverLayElement>
       {/* {showConfirmationBox === true ?
          <MissingMapDialog title="Brak mapy w bazie !" message="Brak mapy w bazie !" onClickClose={()=> closeConfirmationModal()} /> : null} */}

    </>
  );

}


/* global google */
import React from "react"
import { compose } from "recompose"
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  GroundOverlay } from "react-google-maps";
import {parseString} from 'xml2js';
import store from "../../Store/Store";
import { callApiFetch } from "../../common/global";


export const MapWithGroundOverlay = compose(
  withScriptjs,
  withGoogleMap
)(props => {
  const { useGlobalState } = store;
  const [adapter] = useGlobalState("adapter");
  const [zoom, setZoom] = useGlobalState("zoom");
  const {id_nadajnik, id_program, id_antena} = adapter;

  const [bounds, setBounds] = React.useState({});
  const {isChecked} = props;
  const mapKMLToBounds = (response) => {
    const kml = response.kml.GroundOverlay;
    const boundsArray = [];
    if(kml.length > 0) {
      const east = Number(kml[0].LatLonBox[0].east[0]);
      const north = Number(kml[0].LatLonBox[0].north[0]);
      const south = Number(kml[0].LatLonBox[0].south[0]);
      const west = Number(kml[0].LatLonBox[0].west[0]);
      return {south: south, north: north, west:west, east: east};
  }}

  const mapKMLToBoundsNew = (response) => {
    const kml = response.kml;
    const north = Number(kml['maxLongMaxLat-latitude'][0]);
    const east =  Number(kml['maxLongMaxLat-longitude'][0]);
    const south = Number(kml['minLongMinLat-latitude'][0])
    const west = Number(kml['minLongMinLat-longitude'][0]);
    return {south: south, north: north, west: west, east: east};
  }




  React.useEffect(() => {
    callApiFetch(`api/comparison-map/kml-new/${id_antena}_${id_nadajnik}_${id_program}`).then((res) => {
        parseString(res.text, function (err, result) {
            if(result && result.kml){
                const bounds = mapKMLToBoundsNew(result);
                setBounds(bounds);
            } else{
              props.setConfirmationBox(true);
              console.log("Missing map in storage ! ")
            }

        });

   });
}, [isChecked]);

    const bucketName = 'klm-map-storage';
    function handleZoomChanged(){
      setZoom(this.getZoom());
    }

    const url = `https://${bucketName}.storage.googleapis.com/${id_antena}_${id_nadajnik}_${id_program}.png`
    return (
    <GoogleMap
        defaultZoom={zoom}
        zoom={zoom}
        defaultCenter={{ lat: +adapter.szerokosc, lng: +adapter.dlugosc }}
        defaultMapTypeId="terrain"
        onZoomChanged={handleZoomChanged}
    >
        {
        bounds.north !== undefined && bounds.south !== undefined &&  bounds.east !== undefined && bounds.west !== undefined  ?
        <GroundOverlay
            url={url}
            defaultBounds={new google.maps.LatLngBounds(
            new google.maps.LatLng(bounds.south, bounds.west),
            new google.maps.LatLng(bounds.north, bounds.east)
            )}
            defaultOpacity={.5}
        /> : null }
    </GoogleMap>
);

});
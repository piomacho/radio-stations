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
  const [boundsNew, setBoundsNew] = React.useState({});
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
    const mapahash = adapter._mapahash;

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


   callApiFetch(`api/comparison-map/kml/${mapahash}`).then((res) => {

    parseString(res.text, function (err, result) {
       if(res.status === 200) {

         const bounds = mapKMLToBounds(result);
         setBoundsNew(bounds);

       } else {
         throw Error('Brak opisu mapy pokrycia o podanym id w bazie danych');
       }

     });

   });

}, [isChecked]);

    const bucketName = 'klm-map-storage';
    function handleZoomChanged(){
      setZoom(this.getZoom());
    }

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
            url={`https://${bucketName}.storage.googleapis.com/${id_antena}_${id_nadajnik}_${id_program}.png`}

            defaultBounds={new google.maps.LatLngBounds(
            new google.maps.LatLng(bounds.south, bounds.west),
            new google.maps.LatLng(bounds.north, bounds.east)
            )}
            opacity={isChecked ? .5 : 0}
            defaultOpacity={.5}
        /> : null }

{
        boundsNew.north !== undefined && boundsNew.south !== undefined &&  boundsNew.east !== undefined && boundsNew.west !== undefined  ?
        <GroundOverlay
            url={`https://mapy.radiopolska.pl/files/get/fm-std/${adapter._mapahash}.png`}

            defaultBounds={new google.maps.LatLngBounds(
            new google.maps.LatLng(boundsNew.south, boundsNew.west),
            new google.maps.LatLng(boundsNew.north, boundsNew.east)
            )}
            opacity={isChecked ? 0.0 : .5}
            defaultOpacity={.5}
        /> : null }
    </GoogleMap>
);

});
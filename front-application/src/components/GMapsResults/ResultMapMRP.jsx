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


export const MapWithGroundOverlayMRP = compose(
  withScriptjs,
  withGoogleMap
)(props => {
  const { useGlobalState } = store;
  const [adapter] = useGlobalState("adapter");
  const [zoom, setZoom] = useGlobalState("zoom");
  const [bounds, setBounds] = React.useState({});
  const [mapUrl, setMapUrl] = React.useState(undefined);
  const {isChecked} = props;
  const mapKMLToBounds = (response) => {
    const kml = response.kml.GroundOverlay;
    if(kml.length > 0) {
      const east = Number(kml[0].LatLonBox[0].east[0]);
      const north = Number(kml[0].LatLonBox[0].north[0]);
      const south = Number(kml[0].LatLonBox[0].south[0]);
      const west = Number(kml[0].LatLonBox[0].west[0]);
      return {south: south, north: north, west:west, east: east};
  }}

  React.useEffect(() => {
  const mapahash = adapter._mapahash;
  callApiFetch(`api/comparison-map/kml/${mapahash}`).then((res) => {

   parseString(res.text, function (err, result) {
      if(res.status === 200) {

        const bounds = mapKMLToBounds(result);
        setBounds(bounds);

      } else {
        throw Error('Brak opisu mapy pokrycia o podanym id w bazie danych');
      }

    });

  });
}, [isChecked]);

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
        url={`https://mapy.radiopolska.pl/files/get/fm-std/${adapter._mapahash}.png`}
        defaultBounds={new google.maps.LatLngBounds(
          new google.maps.LatLng(bounds.south, bounds.west),
          new google.maps.LatLng(bounds.north, bounds.east)
        )}
        defaultOpacity={.5}
      /> : null }
  </GoogleMap>
);

});




// };

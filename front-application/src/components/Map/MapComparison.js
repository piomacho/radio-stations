import React, { Component } from "react";
import { compose } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  Polygon,
} from "react-google-maps";
import store from "../../Store/Store";
import Keys from "../../keys";

const MapWithMarker = compose(
  withScriptjs,
  withGoogleMap
)(props => {
  const { useGlobalState } = store;
  const [adapter] = useGlobalState("adapter");
  const [corners] = useGlobalState('corners');

  const icon = {
    url:
      "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
    size: { width: 140, height: 160 },
    anchor: { x: 15, y: 50 },
    scaledSize: { width: 30, height: 50 }
  };

  const path = [corners.maxLongMaxLat, corners.maxLongMinLat, corners.minLongMinLat, corners.minLongMaxLat, ]
  console.log("sadsad ", path)
  return (
      <GoogleMap
        defaultZoom={11}
        defaultCenter={{ lat: +adapter.szerokosc, lng: +adapter.dlugosc }}
        defaultMapTypeId="satellite"
      >
        <Marker
          icon={icon}
          position={{ lat: +adapter.szerokosc, lng: +adapter.dlugosc }}
        />
           <Polygon
            path={path}
            key={1}
            options={{
              strokeColor: "#FF0000",
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: "#FF0000",
              fillOpacity: 0.35
        }}
      />
      </GoogleMap>
  );
});

export default class ShelterMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shelters: [],
      selectedMarker: false
    };
  }

  handleClick = (marker, event) => {
    this.setState({ selectedMarker: marker });
  };
  render() {
    return (
      <MapWithMarker
        selectedMarker={this.state.selectedMarker}
        // markers={this.state.shelters}
        onClick={this.handleClick}
        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${Keys.mapsKey}&v=3.exp&libraries=geometry,drawing,places`}
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `550px` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />
    );
  }
}

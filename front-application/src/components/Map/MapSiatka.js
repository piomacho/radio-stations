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
    console.log("PRPRPR , ", props);
  const icon = {
    url:
      "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
    size: { width: 140, height: 160 },
    anchor: { x: 15, y: 50 },
    scaledSize: { width: 30, height: 50 }
  };

  const path = [corners.maxLongMaxLat, corners.maxLongMinLat, corners.minLongMinLat, corners.minLongMaxLat, ]
  return (
      <GoogleMap
        defaultZoom={11}
        defaultCenter={{ lat: +adapter.szerokosc, lng: +adapter.dlugosc }}
        defaultMapTypeId="satellite"
      >

        {props.elRes.map((marker, iterator) => {
        const onClick = props.onClick.bind(this, marker);
        return (
          <Marker
            key={Math.random()}
            onClick={onClick}
            position={{ lat: marker.latitude, lng: marker.longitude }}
          >

          </Marker>
        );
      })}
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
    console.log("handleClick", marker)
    this.setState({ selectedMarker: marker });
  };
  render() {
    return (
      <MapWithMarker
        selectedMarker={this.state.selectedMarker}
        elRes={this.props.elRes}
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

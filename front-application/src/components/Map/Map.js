import React, { Component, useEffect, useState } from "react";
import { compose } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  InfoWindow
} from "react-google-maps";
import { GMapsSpan, OESpan } from "./Map.style";
import store from "../../Store/Store";
import { callApiFetch } from "../../common/global";
import { measureDistance } from "../../common/global";
import Keys from "../../keys"

const MapWithMarker = compose(
  withScriptjs,
  withGoogleMap
)(props => {
  const { useGlobalState } = store;
  const [adapter] = useGlobalState("adapter");
  const [loading, setLoading] = useState(false);
  const [gMapsElevation, setGMapsElevation] = useState([]);
  const [trialCoords] = useGlobalState("trialCoords");
  const [elevationResults] = useGlobalState("elevationResults");
  const image =
    "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";

  const icon = {
    url:
      "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
    size: { width: 140, height: 160 },
    anchor: { x: 15, y: 50 },
    scaledSize: { width: 30, height: 50 }
  };

  const generateApiParameter = () => {
    let str = "";
    for(let i = 0; i < trialCoords.length ; i++) {
      if(i !== trialCoords.length -1) {
        str = `${str}${trialCoords[i].latitude},${trialCoords[i].longitude}%7C`;
      }
      else {
        str = `${str}${trialCoords[i].latitude},${trialCoords[i].longitude}`;
      }
    }
      return str;
    }

  useEffect(() => {
    // console.log("======> ", +adapter.szerokosc, "- ", +adapter.dlugosc) lat1: number , lon1: number, lat2: number , lon2: number)
    console.info(
      "Odległość między punktami: ,",
      measureDistance(+trialCoords[0].latitude, +trialCoords[0].longitude, +trialCoords[1].latitude, +trialCoords[1].longitude)
    );
    const formattedCoords =  generateApiParameter(trialCoords);

    callApiFetch(`api/gmaps/all/${formattedCoords}`)
      .then(response =>  setGMapsElevation(response))
      .catch(err => console.log(err));
  }, []);

  return (
    <GoogleMap
      defaultZoom={11}
      defaultCenter={{ lat: +adapter.szerokosc, lng: +adapter.dlugosc }}
      defaultMapTypeId="terrain"
    >
      <Marker
        icon={icon}
        position={{ lat: +adapter.szerokosc, lng: +adapter.dlugosc }}
      />
      {elevationResults.map((marker, iterator) => {
        const onClick = props.onClick.bind(this, marker);
        return (
          <Marker
            key={Math.random()}
            onClick={onClick}
            position={{ lat: marker.latitude, lng: marker.longitude }}
          >
            {props.selectedMarker === marker && marker && gMapsElevation[iterator] && (
              <InfoWindow>
                <div><GMapsSpan>GMaps: <b>{gMapsElevation[iterator].elevation}</b></GMapsSpan> | <OESpan>Open Elevation: <b>{marker.elevation}</b></OESpan></div>
              </InfoWindow>
            )}
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

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
import Keys from "../../keys";

const MapWithMarker = compose(
  withScriptjs,
  withGoogleMap
)(props => {
  const { useGlobalState } = store;
  const [adapter] = useGlobalState("adapter");
  const [loading, setLoading] = useState(false);
  const [gMapsElevation, setGMapsElevation] = useGlobalState("gmapsCoordinates");
  const [trialCoords] = useGlobalState("trialCoords");
  const image =
    "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";

  const icon = {
    url:
      "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
    size: { width: 140, height: 160 },
    anchor: { x: 15, y: 50 },
    scaledSize: { width: 30, height: 50 }
  };

  const elevationResults = [];
  const generateApiParameter = (trialCoords) => {
    let str = "";
    for(let i = 0; i < trialCoords.length ; i++) {
      if(i !== trialCoords.length -1) {
        str = `${str}${trialCoords[i].lat},${trialCoords[i].lng}%7C`;
      }
      else {
        str = `${str}${trialCoords[i].lat},${trialCoords[i].lng}`;
      }
    }
      return str;
    }
    const myResults = [{"lat": 52.14471, "lng": 21.04471, "e": 107.0, "d": 0.0}, {"lat": 52.15046, "lng": 21.03539, "e": 101.0, "d": 0.90206}, {"lat": 52.15621, "lng": 21.02607, "e": 102.0, "d": 1.80406}, {"lat": 52.16196, "lng": 21.01675, "e": 100.0, "d": 2.706}, {"lat": 52.16771, "lng": 21.00743, "e": 96.0, "d": 3.60788}, {"lat": 52.17346, "lng": 20.9981, "e": 102.0, "d": 4.51019}, {"lat": 52.1792, "lng": 20.98877, "e": 108.0, "d": 5.41165}, {"lat": 52.18495, "lng": 20.97944, "e": 105.0, "d": 6.31384}, {"lat": 52.19069, "lng": 20.97011, "e": 107.0, "d": 7.21519}, {"lat": 52.19644, "lng": 20.96077, "e": 110.0, "d": 8.11775}, {"lat": 52.20218, "lng": 20.95143, "e": 108.0, "d": 9.01946}, {"lat": 52.20793, "lng": 20.94209, "e": 108.0, "d": 9.9219}, {"lat": 52.21367, "lng": 20.93275, "e": 109.0, "d": 10.82349}, {"lat": 52.21941, "lng": 20.9234, "e": 110.0, "d": 11.72551}, {"lat": 52.22515, "lng": 20.91405, "e": 112.0, "d": 12.62747}, {"lat": 52.23089, "lng": 20.9047, "e": 111.0, "d": 13.52937}, {"lat": 52.23663, "lng": 20.89535, "e": 106.0, "d": 14.43121}, {"lat": 52.24237, "lng": 20.88599, "e": 106.0, "d": 15.33348}, {"lat": 52.24811, "lng": 20.87664, "e": 104.0, "d": 16.2352}, {"lat": 52.25385, "lng": 20.86728, "e": 110.0, "d": 17.13735}, {"lat": 52.25958, "lng": 20.85791, "e": 110.0, "d": 18.03914}, {"lat": 52.26532, "lng": 20.84855, "e": 98.0, "d": 18.94117}, {"lat": 52.27105, "lng": 20.83918, "e": 103.0, "d": 19.84284}, {"lat": 52.27679, "lng": 20.82981, "e": 90.0, "d": 20.74524}, {"lat": 52.28252, "lng": 20.82044, "e": 101.0, "d": 21.64679}, {"lat": 52.28826, "lng": 20.81106, "e": 90.0, "d": 22.54955}, {"lat": 52.29399, "lng": 20.80169, "e": 87.0, "d": 23.45099}, {"lat": 52.29972, "lng": 20.79231, "e": 83.0, "d": 24.35285}, {"lat": 52.30545, "lng": 20.78292, "e": 80.0, "d": 25.25513}, {"lat": 52.31118, "lng": 20.77354, "e": 85.0, "d": 26.15687}, {"lat": 52.31691, "lng": 20.76415, "e": 86.0, "d": 27.05903}];


  useEffect(() => {
    const myRes = [{"lat": 52.14471, "lng": 21.04471, "e": 107.0, "d": 0.0}, {"lat": 52.15046, "lng": 21.03539, "e": 101.0, "d": 0.90206}, {"lat": 52.15621, "lng": 21.02607, "e": 102.0, "d": 1.80406}, {"lat": 52.16196, "lng": 21.01675, "e": 100.0, "d": 2.706}, {"lat": 52.16771, "lng": 21.00743, "e": 96.0, "d": 3.60788}, {"lat": 52.17346, "lng": 20.9981, "e": 102.0, "d": 4.51019}, {"lat": 52.1792, "lng": 20.98877, "e": 108.0, "d": 5.41165}, {"lat": 52.18495, "lng": 20.97944, "e": 105.0, "d": 6.31384}, {"lat": 52.19069, "lng": 20.97011, "e": 107.0, "d": 7.21519}, {"lat": 52.19644, "lng": 20.96077, "e": 110.0, "d": 8.11775}, {"lat": 52.20218, "lng": 20.95143, "e": 108.0, "d": 9.01946}, {"lat": 52.20793, "lng": 20.94209, "e": 108.0, "d": 9.9219}, {"lat": 52.21367, "lng": 20.93275, "e": 109.0, "d": 10.82349}, {"lat": 52.21941, "lng": 20.9234, "e": 110.0, "d": 11.72551}, {"lat": 52.22515, "lng": 20.91405, "e": 112.0, "d": 12.62747}, {"lat": 52.23089, "lng": 20.9047, "e": 111.0, "d": 13.52937}, {"lat": 52.23663, "lng": 20.89535, "e": 106.0, "d": 14.43121}, {"lat": 52.24237, "lng": 20.88599, "e": 106.0, "d": 15.33348}, {"lat": 52.24811, "lng": 20.87664, "e": 104.0, "d": 16.2352}, {"lat": 52.25385, "lng": 20.86728, "e": 110.0, "d": 17.13735}, {"lat": 52.25958, "lng": 20.85791, "e": 110.0, "d": 18.03914}, {"lat": 52.26532, "lng": 20.84855, "e": 98.0, "d": 18.94117}, {"lat": 52.27105, "lng": 20.83918, "e": 103.0, "d": 19.84284}, {"lat": 52.27679, "lng": 20.82981, "e": 90.0, "d": 20.74524}, {"lat": 52.28252, "lng": 20.82044, "e": 101.0, "d": 21.64679}, {"lat": 52.28826, "lng": 20.81106, "e": 90.0, "d": 22.54955}, {"lat": 52.29399, "lng": 20.80169, "e": 87.0, "d": 23.45099}, {"lat": 52.29972, "lng": 20.79231, "e": 83.0, "d": 24.35285}, {"lat": 52.30545, "lng": 20.78292, "e": 80.0, "d": 25.25513}, {"lat": 52.31118, "lng": 20.77354, "e": 85.0, "d": 26.15687}, {"lat": 52.31691, "lng": 20.76415, "e": 86.0, "d": 27.05903}];

    const formattedCoords =  generateApiParameter(myRes);

    callApiFetch(`api/gmaps/all/${formattedCoords}`)
      .then(response =>  setGMapsElevation(response))
      .then(response =>  console.log("--- ", response))
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


      {myResults.map((marker, iterator) => {
        const onClick = props.onClick.bind(this, marker);
        return (
          <Marker
            key={Math.random()}
            onClick={onClick}
            position={{ lat: marker.lat, lng: marker.lng }}
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

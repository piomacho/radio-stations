import React, { Component, useEffect, useState } from "react";
import { compose } from "recompose";
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
  InfoWindow
} from "react-google-maps";
import store from "../../Store/Store";
import { callApiFetch } from "../../common/global";
import { measureDistance } from "../../common/global";
import Keys from "../../../keys.js"

const MapWithAMarker = compose(
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
    size: { width: 160, height: 200 },
    anchor: { x: 15, y: 50 },
    scaledSize: { width: 30, height: 50 }
  };

  const generateApiParameter = () => {
    let str = "";
    for(let i = 0; i < trialCoords.length; i++) {
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
    // setLoading(true);
    console.info(
      "Odległość między punktami: ,",
      measureDistance(+adapter.szerokosc, +adapter.dlugosc, 0.001)
    );
    const formattedCoords =  generateApiParameter(trialCoords);

    callApiFetch(`api/gmaps/all/${formattedCoords}`)
      .then(response => setGMapsElevation(response))
      // .then(adapters =>  { setAdapters(adapters); setAdapter(adapters[0]);  setLoading(false); })
      .catch(err => console.log(err));
  }, []);

  return (
    <GoogleMap
      defaultZoom={8}
      defaultCenter={{ lat: +adapter.szerokosc, lng: +adapter.dlugosc }}
      defaultMapTypeId="terrain"
    >
      <Marker
        // onClick={onClick}
        icon={icon}
        position={{ lat: +adapter.szerokosc, lng: +adapter.dlugosc }}
      >
        ANTENTA
      </Marker>
      {elevationResults.map((marker, iterator) => {
          // console.log("marker ,", iterator)
        const onClick = props.onClick.bind(this, marker);
        return (
          <Marker
            key={Math.random()}
            onClick={onClick}
            position={{ lat: marker.latitude, lng: marker.longitude }}
          >
            {props.selectedMarker === marker && (
              <InfoWindow>
                <div>{marker.elevation} | {gMapsElevation[iterator].elevation}</div>
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
    // console.log({ marker })
    this.setState({ selectedMarker: marker });
  };
  render() {
    return (
      <MapWithAMarker
        selectedMarker={this.state.selectedMarker}
        // markers={this.state.shelters}
        onClick={this.handleClick}
        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${Keys.mapsKey}&v=3.exp&libraries=geometry,drawing,places`}
        loadingElement={<div style={{ height: `100%` }} />}
        containerElement={<div style={{ height: `800px` }} />}
        mapElement={<div style={{ height: `100%` }} />}
      />
    );
  }
}

// export default Map;

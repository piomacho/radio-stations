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

     const myResults = [{"lat": 49.68518, "lng": 19.02975, "e": 1252.0, "d": 0.0004}, {"lat": 49.6871, "lng": 19.02679, "e": 1194.0, "d": 0.30154}, {"lat": 49.68901, "lng": 19.02384, "e": 1072.0, "d": 0.60187}, {"lat": 49.69093, "lng": 19.02089, "e": 956.0, "d": 0.90298}, {"lat": 49.69285, "lng": 19.01794, "e": 817.0, "d": 1.20409}, {"lat": 49.69476, "lng": 19.01499, "e": 831.0, "d": 1.5044}, {"lat": 49.69668, "lng": 19.01204, "e": 783.0, "d": 1.80549}, {"lat": 49.6986, "lng": 19.00908, "e": 724.0, "d": 2.10709}, {"lat": 49.70051, "lng": 19.00613, "e": 607.0, "d": 2.40738}, {"lat": 49.70243, "lng": 19.00318, "e": 560.0, "d": 2.70846}, {"lat": 49.70434, "lng": 19.00023, "e": 608.0, "d": 3.00874}, {"lat": 49.70626, "lng": 18.99727, "e": 698.0, "d": 3.31031}, {"lat": 49.70818, "lng": 18.99432, "e": 730.0, "d": 3.61137}, {"lat": 49.71009, "lng": 18.99137, "e": 841.0, "d": 3.91164}, {"lat": 49.71201, "lng": 18.98841, "e": 760.0, "d": 4.21319}, {"lat": 49.71393, "lng": 18.98546, "e": 698.0, "d": 4.51423}, {"lat": 49.71584, "lng": 18.9825, "e": 592.0, "d": 4.81499}, {"lat": 49.71776, "lng": 18.97955, "e": 580.0, "d": 5.11602}, {"lat": 49.71967, "lng": 18.97659, "e": 553.0, "d": 5.41676}, {"lat": 49.72159, "lng": 18.97364, "e": 584.0, "d": 5.71778}, {"lat": 49.7235, "lng": 18.97068, "e": 637.0, "d": 6.01851}, {"lat": 49.72542, "lng": 18.96773, "e": 669.0, "d": 6.31951}, {"lat": 49.72733, "lng": 18.96477, "e": 674.0, "d": 6.62023}, {"lat": 49.72925, "lng": 18.96181, "e": 693.0, "d": 6.92173}, {"lat": 49.73117, "lng": 18.95886, "e": 661.0, "d": 7.22272}, {"lat": 49.73308, "lng": 18.9559, "e": 655.0, "d": 7.52342}, {"lat": 49.735, "lng": 18.95295, "e": 768.0, "d": 7.8244}, {"lat": 49.73691, "lng": 18.94999, "e": 781.0, "d": 8.12509}, {"lat": 49.73883, "lng": 18.94703, "e": 792.0, "d": 8.42656}, {"lat": 49.74074, "lng": 18.94407, "e": 705.0, "d": 8.72724}, {"lat": 49.74266, "lng": 18.94112, "e": 777.0, "d": 9.02819}, {"lat": 49.74457, "lng": 18.93816, "e": 836.0, "d": 9.32886}, {"lat": 49.74648, "lng": 18.9352, "e": 846.0, "d": 9.62952}, {"lat": 49.7484, "lng": 18.93224, "e": 751.0, "d": 9.93096}, {"lat": 49.75031, "lng": 18.92928, "e": 665.0, "d": 10.23161}, {"lat": 49.75223, "lng": 18.92632, "e": 610.0, "d": 10.53304}, {"lat": 49.75414, "lng": 18.92337, "e": 658.0, "d": 10.83317}, {"lat": 49.75606, "lng": 18.92041, "e": 575.0, "d": 11.13459}, {"lat": 49.75797, "lng": 18.91745, "e": 525.0, "d": 11.43521}, {"lat": 49.75989, "lng": 18.91449, "e": 503.0, "d": 11.73662}, {"lat": 49.7618, "lng": 18.91153, "e": 489.0, "d": 12.03723}, {"lat": 49.76371, "lng": 18.90857, "e": 484.0, "d": 12.33784}, {"lat": 49.76563, "lng": 18.90561, "e": 556.0, "d": 12.63923}, {"lat": 49.76754, "lng": 18.90264, "e": 603.0, "d": 12.94033}, {"lat": 49.76945, "lng": 18.89968, "e": 546.0, "d": 13.24092}, {"lat": 49.77137, "lng": 18.89672, "e": 466.0, "d": 13.54229}, {"lat": 49.77328, "lng": 18.89376, "e": 432.0, "d": 13.84287}, {"lat": 49.7752, "lng": 18.8908, "e": 433.0, "d": 14.14423}, {"lat": 49.77711, "lng": 18.88784, "e": 415.0, "d": 14.44479}, {"lat": 49.77902, "lng": 18.88488, "e": 400.0, "d": 14.74535}, {"lat": 49.78094, "lng": 18.88191, "e": 379.0, "d": 15.0472}, {"lat": 49.78285, "lng": 18.87895, "e": 391.0, "d": 15.34775}, {"lat": 49.78476, "lng": 18.87599, "e": 430.0, "d": 15.64829}, {"lat": 49.78668, "lng": 18.87302, "e": 446.0, "d": 15.95012}, {"lat": 49.78859, "lng": 18.87006, "e": 387.0, "d": 16.25065}, {"lat": 49.7905, "lng": 18.8671, "e": 371.0, "d": 16.55117}, {"lat": 49.79241, "lng": 18.86413, "e": 348.0, "d": 16.8522}, {"lat": 49.79433, "lng": 18.86117, "e": 335.0, "d": 17.1535}, {"lat": 49.79624, "lng": 18.85821, "e": 348.0, "d": 17.45401}, {"lat": 49.79815, "lng": 18.85524, "e": 343.0, "d": 17.75501}, {"lat": 49.80006, "lng": 18.85228, "e": 332.0, "d": 18.05551}, {"lat": 49.80198, "lng": 18.84931, "e": 324.0, "d": 18.35729}, {"lat": 49.80389, "lng": 18.84635, "e": 319.0, "d": 18.65777}, {"lat": 49.8058, "lng": 18.84338, "e": 314.0, "d": 18.95876}, {"lat": 49.80771, "lng": 18.84042, "e": 297.0, "d": 19.25923}, {"lat": 49.80963, "lng": 18.83745, "e": 297.0, "d": 19.56099}, {"lat": 49.81154, "lng": 18.83448, "e": 291.0, "d": 19.86196}, {"lat": 49.81345, "lng": 18.83152, "e": 289.0, "d": 20.16241}, {"lat": 49.81536, "lng": 18.82855, "e": 287.0, "d": 20.46336}];


  useEffect(() => {
     const myRes = [{"lat": 49.68518, "lng": 19.02975, "e": 1252.0, "d": 0.0004}, {"lat": 49.6871, "lng": 19.02679, "e": 1194.0, "d": 0.30154}, {"lat": 49.68901, "lng": 19.02384, "e": 1072.0, "d": 0.60187}, {"lat": 49.69093, "lng": 19.02089, "e": 956.0, "d": 0.90298}, {"lat": 49.69285, "lng": 19.01794, "e": 817.0, "d": 1.20409}, {"lat": 49.69476, "lng": 19.01499, "e": 831.0, "d": 1.5044}, {"lat": 49.69668, "lng": 19.01204, "e": 783.0, "d": 1.80549}, {"lat": 49.6986, "lng": 19.00908, "e": 724.0, "d": 2.10709}, {"lat": 49.70051, "lng": 19.00613, "e": 607.0, "d": 2.40738}, {"lat": 49.70243, "lng": 19.00318, "e": 560.0, "d": 2.70846}, {"lat": 49.70434, "lng": 19.00023, "e": 608.0, "d": 3.00874}, {"lat": 49.70626, "lng": 18.99727, "e": 698.0, "d": 3.31031}, {"lat": 49.70818, "lng": 18.99432, "e": 730.0, "d": 3.61137}, {"lat": 49.71009, "lng": 18.99137, "e": 841.0, "d": 3.91164}, {"lat": 49.71201, "lng": 18.98841, "e": 760.0, "d": 4.21319}, {"lat": 49.71393, "lng": 18.98546, "e": 698.0, "d": 4.51423}, {"lat": 49.71584, "lng": 18.9825, "e": 592.0, "d": 4.81499}, {"lat": 49.71776, "lng": 18.97955, "e": 580.0, "d": 5.11602}, {"lat": 49.71967, "lng": 18.97659, "e": 553.0, "d": 5.41676}, {"lat": 49.72159, "lng": 18.97364, "e": 584.0, "d": 5.71778}, {"lat": 49.7235, "lng": 18.97068, "e": 637.0, "d": 6.01851}, {"lat": 49.72542, "lng": 18.96773, "e": 669.0, "d": 6.31951}, {"lat": 49.72733, "lng": 18.96477, "e": 674.0, "d": 6.62023}, {"lat": 49.72925, "lng": 18.96181, "e": 693.0, "d": 6.92173}, {"lat": 49.73117, "lng": 18.95886, "e": 661.0, "d": 7.22272}, {"lat": 49.73308, "lng": 18.9559, "e": 655.0, "d": 7.52342}, {"lat": 49.735, "lng": 18.95295, "e": 768.0, "d": 7.8244}, {"lat": 49.73691, "lng": 18.94999, "e": 781.0, "d": 8.12509}, {"lat": 49.73883, "lng": 18.94703, "e": 792.0, "d": 8.42656}, {"lat": 49.74074, "lng": 18.94407, "e": 705.0, "d": 8.72724}, {"lat": 49.74266, "lng": 18.94112, "e": 777.0, "d": 9.02819}, {"lat": 49.74457, "lng": 18.93816, "e": 836.0, "d": 9.32886}, {"lat": 49.74648, "lng": 18.9352, "e": 846.0, "d": 9.62952}, {"lat": 49.7484, "lng": 18.93224, "e": 751.0, "d": 9.93096}, {"lat": 49.75031, "lng": 18.92928, "e": 665.0, "d": 10.23161}, {"lat": 49.75223, "lng": 18.92632, "e": 610.0, "d": 10.53304}, {"lat": 49.75414, "lng": 18.92337, "e": 658.0, "d": 10.83317}, {"lat": 49.75606, "lng": 18.92041, "e": 575.0, "d": 11.13459}, {"lat": 49.75797, "lng": 18.91745, "e": 525.0, "d": 11.43521}, {"lat": 49.75989, "lng": 18.91449, "e": 503.0, "d": 11.73662}, {"lat": 49.7618, "lng": 18.91153, "e": 489.0, "d": 12.03723}, {"lat": 49.76371, "lng": 18.90857, "e": 484.0, "d": 12.33784}, {"lat": 49.76563, "lng": 18.90561, "e": 556.0, "d": 12.63923}, {"lat": 49.76754, "lng": 18.90264, "e": 603.0, "d": 12.94033}, {"lat": 49.76945, "lng": 18.89968, "e": 546.0, "d": 13.24092}, {"lat": 49.77137, "lng": 18.89672, "e": 466.0, "d": 13.54229}, {"lat": 49.77328, "lng": 18.89376, "e": 432.0, "d": 13.84287}, {"lat": 49.7752, "lng": 18.8908, "e": 433.0, "d": 14.14423}, {"lat": 49.77711, "lng": 18.88784, "e": 415.0, "d": 14.44479}, {"lat": 49.77902, "lng": 18.88488, "e": 400.0, "d": 14.74535}, {"lat": 49.78094, "lng": 18.88191, "e": 379.0, "d": 15.0472}, {"lat": 49.78285, "lng": 18.87895, "e": 391.0, "d": 15.34775}, {"lat": 49.78476, "lng": 18.87599, "e": 430.0, "d": 15.64829}, {"lat": 49.78668, "lng": 18.87302, "e": 446.0, "d": 15.95012}, {"lat": 49.78859, "lng": 18.87006, "e": 387.0, "d": 16.25065}, {"lat": 49.7905, "lng": 18.8671, "e": 371.0, "d": 16.55117}, {"lat": 49.79241, "lng": 18.86413, "e": 348.0, "d": 16.8522}, {"lat": 49.79433, "lng": 18.86117, "e": 335.0, "d": 17.1535}, {"lat": 49.79624, "lng": 18.85821, "e": 348.0, "d": 17.45401}, {"lat": 49.79815, "lng": 18.85524, "e": 343.0, "d": 17.75501}, {"lat": 49.80006, "lng": 18.85228, "e": 332.0, "d": 18.05551}, {"lat": 49.80198, "lng": 18.84931, "e": 324.0, "d": 18.35729}, {"lat": 49.80389, "lng": 18.84635, "e": 319.0, "d": 18.65777}, {"lat": 49.8058, "lng": 18.84338, "e": 314.0, "d": 18.95876}, {"lat": 49.80771, "lng": 18.84042, "e": 297.0, "d": 19.25923}, {"lat": 49.80963, "lng": 18.83745, "e": 297.0, "d": 19.56099}, {"lat": 49.81154, "lng": 18.83448, "e": 291.0, "d": 19.86196}, {"lat": 49.81345, "lng": 18.83152, "e": 289.0, "d": 20.16241}, {"lat": 49.81536, "lng": 18.82855, "e": 287.0, "d": 20.46336}];


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

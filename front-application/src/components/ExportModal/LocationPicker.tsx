import React, { useState } from 'react'
import Keys from "../../keys";
import GoogleMapReact, {ClickEventValue} from 'google-map-react';

const DefaultLocation = { lat: 51.14, lng: 21.04};
const DefaultZoom = 8;

interface LatLongType {
    lat: number,
    lng: number,
    text: string
}
const AnyReactComponent = ({lat, lng, text}: LatLongType) =>  <div style={{
    color: 'white',
    background: 'grey',
    padding: '15px 10px',
    display: 'inline-flex',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '100%',
    transform: 'translate(-30px, -30px)'
  }}>
   {text}
</div>;

export const LocationPickerExample = () => {

  const [defaultLocation, setDefaultLocation] = useState(DefaultLocation);

  const [location, setLocation] = useState(defaultLocation);
  const [zoom, setZoom] = useState(DefaultZoom);

  function handleChangeLocation (event: ClickEventValue){
    console.log("location --- >  ", event.lat," ",  event.lng);
    setLocation({lat: event.lat, lng: event.lng});
  }

//   function handleChangeZoom (newZoom: number){
//     setZoom(newZoom);
//   }

  function handleResetLocation(){
    setDefaultLocation({ ... DefaultLocation});
    // setZoom(DefaultZoom);
  }

  return (
    <>
  {/* <button onClick={handleResetLocation}>Reset Location</button>
  <label>Latitute:</label><input type='text' value={location.lat} disabled/>
  <label>Longitute:</label><input type='text' value={location.lng} disabled/> */}
  {/* <label>Zoom:</label><input type='text' value={zoom} disabled/> */}
  <div style={{ height: '100vh', width: '100%' }}>
  <GoogleMapReact
    defaultCenter={defaultLocation}
    defaultZoom={8}
    options={
        {
            zoomControl: false,
            gestureHandling: 'none'
        }
    }
    // style={{height:'700px'}}
    onClick={e => handleChangeLocation(e)}
    // onChangeZoom={handleChangeZoom}
    bootstrapURLKeys={{ key: Keys.mapsKey}}
    >
        {location.lat && location.lng ?
         <AnyReactComponent
            lat={location.lat}
            lng={location.lng}
            text={'Kreyser Avrora'}
          />:null}
    </GoogleMapReact>
    </div>
  </>
  );
}


import React, { SetStateAction, useState } from 'react'
import Keys from "../../keys";
import GoogleMapReact, {ClickEventValue} from 'google-map-react';
import { AdapterIcon, TransmitterIcon } from './ExportModal.style';
import store from "../../Store/Store";
import { useEffect } from 'react';


const DefaultZoom = 7;

interface LatLongType {
    lat: number,
    lng: number,
}


interface LocationPickerComponentType {
  recLongitude: string,
  recLatitude: string,
  handleChangeX: (x: SetStateAction<string>) => void,
  handleChangeY: (y: SetStateAction<string>) => void
}

const Receiver = ({lat, lng}: LatLongType) =>  <div style={{
    transform: 'translate(-20px, -40px)'
  }}>
    <TransmitterIcon />
</div>;

const Adapter = ({lat, lng}: LatLongType) =>  <div style={{
    transform: 'translate(-20px, -40px)'
  }}>
    <AdapterIcon />
</div>;

export const LocationPickerComponent = ({handleChangeX, handleChangeY, recLongitude, recLatitude}: LocationPickerComponentType) => {
  const { useGlobalState } = store;
  const [adapter] = useGlobalState('adapter');
  const DefaultLocation = { lat: Number(adapter.szerokosc), lng: Number(adapter.dlugosc)};

  const [defaultLocation, setDefaultLocation] = useState(DefaultLocation);


  const [location, setLocation] = useState(defaultLocation);
  const [zoom, setZoom] = useState(DefaultZoom);



  function handleChangeLocation (event: ClickEventValue){
    handleChangeX(`${event.lng}`);
    handleChangeY(`${event.lat}`);
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
        {Number(recLongitude) > 0 && Number(recLatitude) > 0  ?
         <Receiver
            lat={location.lat}
            lng={location.lng}
          />:null}

          <Adapter
            lat={Number(adapter.szerokosc)}
            lng={Number(adapter.dlugosc)}
          />

    </GoogleMapReact>
    </div>
  </>
  );
}


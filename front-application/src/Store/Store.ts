import { createStore } from 'react-hooks-global-state';

export interface CoordinatesType {
    latitude: number;
    elevation: number;
    longitude: number;
    distance: number;
}

interface GmapsLocationType {
    lat: number;
    lng: number;
}
export interface GMapsCoordinatesType {
    elevation: number;
    location: GmapsLocationType;
    resolution: number;
}

interface InitialStateType {
    station: {
        value: string;
        label: string;
    },
    adapter: {
        value: string;
        label: string;
        dlugosc: string;
        szerokosc: string;
        wys_npm: number | undefined;
        czestotliwosc: string;
    },
    // todo remove any
    coordinates: {elevations: Array<Array<number>>, distances: Array<Array<number>>},
    gmapsCoordinates: Array<GMapsCoordinatesType>,
    trialCoords: Array<any>,
    elevationResults: Array<CoordinatesType>
}

const initialState: InitialStateType = {
    station: {value: '', label: ''},
    adapter: {value: '', label: '', dlugosc: '', szerokosc: '', wys_npm: undefined, czestotliwosc: ''},
    gmapsCoordinates: [],
    coordinates: {elevations: [], distances: []}, trialCoords: [], elevationResults: []};


// router dom issue
  //@ts-ignore
const store = createStore(null, initialState);

export default store;

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

interface CornersType {
    maxLongMaxLat: {
        lat: number | null,
        lng: number | null
    },
    minLongMaxLat: {
        lat: number | null,
        lng: number | null
    },
    maxLongMinLat: {
        lat: number | null,
        lng: number | null
    },
    minLongMinLat: {
        lat: number | null,
        lng: number | null
    }
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
        id_antena: string;
        id_nadajnik: string;
        id_program: string;
        _mapahash: string;
    },
    // todo remove any
    coordinates: {elevations: Array<Array<number>>, distances: Array<Array<number>>},
    gmapsCoordinates: Array<GMapsCoordinatesType>,
    corners: CornersType,
    trialCoords: Array<any>,
    elevationResults: Array<CoordinatesType>,
}

const initialState: InitialStateType = {
    station: {value: '', label: ''},
    adapter: {value: '', label: '', dlugosc: '', szerokosc: '', wys_npm: undefined, czestotliwosc: '', id_antena: '', id_nadajnik: '', id_program: '', _mapahash: ''},
    gmapsCoordinates: [],
    corners: {
        maxLongMaxLat: {
            lat: null,
            lng: null
        },
        minLongMaxLat: {
            lat: null,
            lng: null
        },
        maxLongMinLat: {
            lat: null,
            lng: null
        },
        minLongMinLat: {
            lat: null,
            lng: null
        }
    },
    coordinates: {elevations: [], distances: []}, trialCoords: [], elevationResults: []};


// router dom issue
  //@ts-ignore
const store = createStore(null, initialState);

export default store;

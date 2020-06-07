import { createStore } from 'react-hooks-global-state';

export interface CoordinatesType {
    latitude: number;
    elevation: number;
    longitude: number;
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
        wys_npm: number | undefined
    },
    // todo remove any
    coordinates: Array<Array<number>>,
    trialCoords: Array<any>,
    elevationResults: Array<CoordinatesType>
}

const initialState: InitialStateType = { station: {value: '', label: ''},  adapter: {value: '', label: '', dlugosc: '', szerokosc: '', wys_npm: undefined}, coordinates: [], trialCoords: [], elevationResults: []};

// router dom issue
  //@ts-ignore
const store = createStore(null, initialState);

export default store;

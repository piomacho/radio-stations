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
    },
    coordinates: Array<CoordinatesType>
}

const initialState: InitialStateType = { station: {value: '', label: ''},  adapter: {value: '', label: '', dlugosc: '', szerokosc: ''}, coordinates: []}; 
const store = createStore(null, initialState);

export default store;
 
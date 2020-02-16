import { createStore } from 'react-hooks-global-state';
 
const initialState = { station: {value: '', label: ''},  adapter: {value: '', label: '', dlugosc: '', szerokosc: ''}  }; 
const store = createStore(null, initialState);

export default store;
 
import { createStore } from 'react-hooks-global-state';
 
const initialState = { station: {value: '', label: ''},  adapter: {value: '', label: ''}   };

 
const store = createStore(null, initialState);

export default store;
 
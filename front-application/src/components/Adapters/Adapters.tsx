import React, { useState, useEffect } from 'react';
import { callApiFetch } from '../../common/global';
import SelectBox from '../SelectBox/SelectBox';
import store from "../../Store/Store";
import { SelectContainer } from './Adapters.style';


interface AdapterType{
    obiekt: string;
    dlugosc: string;
    szerokosc: string;
    id_obiekt: string;
}

interface AdaptersType{
  station_id: string | undefined;
}

interface OptionType {
    value: string,
    label: string
}

const setParameters = (adapters: Array<AdapterType>): Array<OptionType> => {
    return adapters.map((adapter: AdapterType) => {
        return { value: adapter.id_obiekt, label: adapter.obiekt} 
    });
}

const Adapters = () => {
    const { useGlobalState } = store;
    const [station, setStation] = useGlobalState('station');
    const [adapter, setAdapter] = useGlobalState('adapter');
    const [ adapters, setAdapters ] = useState([{value: '', label: ''}]);

    useEffect(() => {
        callApiFetch(`api/adapters/all/${station.value}`)
        .then(response =>  setParameters(response))
        .then(adapters =>  setAdapters(adapters))
        .catch(err => console.log(err));
      }, [station])

 
    return (
    adapters &&
    <SelectContainer>
      <SelectBox
        options={adapters}
        setSelectedOption={setAdapter}
        selectedValue={adapter}
      />
    </SelectContainer>
    );
  
}

export default Adapters;
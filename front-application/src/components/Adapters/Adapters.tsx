import React, { useState, useEffect } from 'react';
import { callApiFetch } from '../../common/global';
import SelectBox from '../SelectBox/SelectBox';
import store from "../../Store/Store";
import Loader from 'react-loader-spinner'
import { SelectContainer, LoaderContainer } from './Adapters.style';


interface AdapterType{
    obiekt: string;
    dlugosc: string;
    szerokosc: string;
    id_obiekt: string;
    wys_npm: string;
    czestotliwosc: string;
    id_antena: string;
    id_nadajnik: string;
    id_program: string;
}

interface OptionType {
    value: string,
    label: string
}

const setParameters = (adapters: Array<AdapterType>): Array<OptionType> => {
    return adapters.map((adapter: AdapterType) => {
        return {
          value: adapter.id_obiekt,
          label: adapter.obiekt,
          szerokosc: adapter.szerokosc,
          dlugosc: adapter.dlugosc,
          wys_npm: adapter.wys_npm,
          czestotliwosc: adapter.czestotliwosc,
          id_antena: adapter.id_antena,
          id_nadajnik: adapter.id_nadajnik,
          id_program: adapter.id_program
        }
    });
}

const Adapters = () => {
    const { useGlobalState } = store;
    const [station] = useGlobalState('station');
    const [adapter, setAdapter] = useGlobalState('adapter');
    const [ adapters, setAdapters ] = useState([{value: '', label: ''}]);
    const [ loading, setLoading ] = useState(false);

    useEffect(() => {
        setLoading(true);
        callApiFetch(`api/adapters/all/${station.value}`)
        .then(response =>  setParameters(response))
        .then(adapters =>  { setAdapters(adapters); setAdapter(adapters[0]);  setLoading(false); })
        .catch(err => console.log(err));
      }, [station])

    return (

    <SelectContainer>
      {loading ? <LoaderContainer><Loader type="Circles" color="#22a6b3" height={40} width={40}/></LoaderContainer>:
      <SelectBox
        options={adapters}
        setSelectedOption={setAdapter}
        selectedValue={adapter}
      />}
    </SelectContainer>
    );

}

export default Adapters;
import React from 'react';
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
    antena_npt: string;
    czestotliwosc: string;
    erp: string;
    polaryzacja: string;
    id_antena: string;
    id_nadajnik: string;
    id_program: string;
    _mapahash: string;
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
          erp: adapter.erp,
          polaryzacja: adapter.polaryzacja,
          antena_npt: adapter.antena_npt,
          czestotliwosc: adapter.czestotliwosc,
          id_antena: adapter.id_antena,
          id_nadajnik: adapter.id_nadajnik,
          id_program: adapter.id_program,
          _mapahash: adapter._mapahash
        }
    });
}

const Adapters = () => {
    const { useGlobalState } = store;
    const [station] = useGlobalState('station');
    const [adapter, setAdapter] = useGlobalState('adapter');
    const [ adapters, setAdapters ] = React.useState([{value: '', label: ''}]);
    const [ loading, setLoading ] = React.useState(false);
    const [ noAdaterWarning, setNoAdaterWarning] = useGlobalState('noAdapterWarning');

    React.useEffect(() => {
        setLoading(true);
        callApiFetch(`api/adapters/all/${station.value}`)
        .then(response =>  setParameters(response))
        .then(adapters =>  {
          setAdapters(adapters);
          if(adapters.length > 0) {
            if(noAdaterWarning === true) {
              setNoAdaterWarning(false);
            }
            setAdapter(adapters[0]);
          } else {
            setNoAdaterWarning(true);
          }
          setLoading(false) })
        .catch(err => console.log(err));
      }, [station])

    const sortedAdapers = adapters.sort((a: OptionType, b: OptionType) => a.label.localeCompare(b.label));
    return (

    <SelectContainer>
      {loading ? <LoaderContainer><Loader type="Circles" color="#22a6b3" height={40} width={40}/></LoaderContainer>:
      <SelectBox
        options={sortedAdapers}
        setSelectedOption={setAdapter}
        selectedValue={adapter}
      />}
    </SelectContainer>
    );

}

export default Adapters;
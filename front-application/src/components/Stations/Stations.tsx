import React, { useState, useEffect } from 'react';
import { callApiFetch } from '../../common/global';
import SelectBox from '../SelectBox/SelectBox';
import store from '../../Store/Store';

interface ProgramType{
    id_program: string;
    nazwa: string;
}

interface OptionType {
    value: string,
    label: string
}

const setParameters = (programs: Array<ProgramType>): Array<OptionType> => {
    return programs.map((program: ProgramType) => {
        return { value: program.id_program, label: program.nazwa}
    });
}

const Stations = () => {
  const { useGlobalState } = store;
  const [station, setStation] = useGlobalState('station');
  const [ stations, setStations ] = useState([{value: '', label: ''}]);


    useEffect(() => {
        callApiFetch('api/stations/all')
        .then(response =>  setParameters(response))
        .then(programs =>  { setStations(programs); setStation(programs[0]); })
        .catch(err => console.log(err));
      }, [])


    return (
    stations &&
      <SelectBox
        options={stations}
        setSelectedOption={setStation}
        selectedValue={station}
      />
    );

}

export default Stations;
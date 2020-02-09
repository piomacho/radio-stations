import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { callApiFetch } from '../../common/global';
import SelectBox from '../SelectBox/SelectBox';


interface ProgramType{
    id_program: string;
    nazwa: string;
}

interface OptionType {
    value: string,
    label: string
}

// const callApi = async () => {
//     const response = await fetch('/api/hello');
//     const body = await response.json();
//     if (response.status !== 200) throw Error(body.message);
    
//     return body;
// };

// const setParameters = (programs: Array<ProgramType>): Array<OptionType> => {
//     return programs.map((program: ProgramType) => {
//         return { value: program.id_program, label: program.nazwa} 
//     });
// }
const setParameters = (programs: Array<ProgramType>): Array<OptionType> => {
    return programs.map((program: ProgramType) => {
        return { value: program.id_program, label: program.nazwa} 
    });
}

const Stations = () => {
    // const [selectedOption, setSelectedOption ] = useState({value: '', label: ''});
    const [ stations, setStations ] = useState([{value: '', label: ''}]);

    useEffect(() => {
        callApiFetch('api/hello')
        .then(response =>  setParameters(response))
        .then(programs =>  setStations(programs))
        .catch(err => console.log(err));
        // code to run on component mount
      }, [])

 
    return (
    stations &&
      <SelectBox
        options={stations}
      />
    );
  
}

export default Stations;
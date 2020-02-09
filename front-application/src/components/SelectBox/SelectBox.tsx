import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { callApiFetch } from '../../common/global';


interface SelectBoxType{
    options: Array<OptionType>
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


 
const SelectBox = ({ options }: SelectBoxType) => {
    const [selectedOption, setSelectedOption ] = useState({value: 'dupa', label:  'dupa'});
    
    useEffect(() => {
        setSelectedOption(options[0])
    }, [options]);

    const handleChange = (selectedOption :any) => {
        setSelectedOption(selectedOption);
    };
    
    return (
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={options}
      />
    );
  
}

export default SelectBox;
import React, { useState, useEffect } from 'react';
import Select from 'react-select';

interface SelectBoxType{
    options: Array<OptionType>;
    selectedValue: OptionType;
    setSelectedOption: (u: any) => void;
}

interface OptionType {
    value: string,
    label: string
}

const SelectBox = ({ options, setSelectedOption, selectedValue }: SelectBoxType) => {

    useEffect(() => {
        setSelectedOption(selectedValue)
    }, []);

    return (
      <Select
        value={selectedValue.value ? selectedValue : options[0]}
        onChange={setSelectedOption}
        options={options}
      />
    );

}

export default SelectBox;
import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { observable } from 'mobx';
import { useEffect } from 'react';
import Select from 'react-select';

export interface StationsOptionsType {
    [key: string]: string;
}

interface OptionType {
    id: string,
    label: string
}

interface ProgramType{
    id_program: string;
    nazwa: string;
}

class StationsState {
    @observable programs: Array<ProgramType>
    @observable selected: OptionType | null;

    constructor() {
        this.programs = [];
        this.selected = null;
    }

    handleChange = (selectedOption: any, data: any) => {
        this.selected = selectedOption.value;
    };
}

const callApi = async () => {
    const response = await fetch('/api/hello');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    return body;
};

const Stations = observer(() => {
 const [state] = React.useState(() => new StationsState());

    useEffect(() => {
        callApi()
        .then(res =>  state.programs = res)
        .catch(err => console.log(err));
        // code to run on component mount
      }, [])

    const { programs, selected, handleChange } = state;
    const options = programs.map((program: ProgramType) => {
        return { id: program.id_program, label: program.nazwa}
    });

    return (
        <Select
          value={selected}
          onChange={handleChange}
          options={options}
        />
    );
});

export default Stations;
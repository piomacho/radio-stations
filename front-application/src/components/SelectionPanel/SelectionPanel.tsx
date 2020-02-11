import React from 'react';

import Stations from '../Stations/Stations';
import Adapters from '../Adapters/Adapters';
import { Wrapper } from './SelectionPanel.styles';


const SelectionPanel = () => {
  return (
    <Wrapper>
      <Stations />
      <Adapters />
    </Wrapper>
  );
}

export default SelectionPanel;

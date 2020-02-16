import React, { useState, useCallback, memo } from 'react';
import Stations from '../Stations/Stations';
import Adapters from '../Adapters/Adapters';
import { Wrapper, ButtonWrapper } from './SelectionPanel.styles';
import Button from '../Button/Button';
import PlotModal from '../PlotModal/PlotModal';


const SubmitButton = ({callback} :any) => (
    <Button
      width={150}
      height={50}
      backColor={"#686de0"}
      backColorHover={"#30336b"}
      label={"Create plot"}
      onClick={callback}
  />
);

const PlotButton = memo(SubmitButton);

const SelectionPanel = () => {
  const [ modalVisiblity, setModalVisiblity ] = useState(false);

  const showModal =  useCallback((value: boolean) => (
  ) => {
    setModalVisiblity(value)
  }, [modalVisiblity])
    

  return (
    <Wrapper>
      <Stations />
      <Adapters />
      <ButtonWrapper>
        <PlotButton callback={showModal(true)} />
      </ButtonWrapper>
      <PlotModal showModal={showModal} modalVisiblity={modalVisiblity} />
    </Wrapper>
  );
}

export default SelectionPanel;

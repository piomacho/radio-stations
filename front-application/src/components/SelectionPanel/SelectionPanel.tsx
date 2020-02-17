import React, { useState, useCallback, memo, useEffect } from 'react';
import Stations from '../Stations/Stations';
import Adapters from '../Adapters/Adapters';
import { Wrapper, ButtonWrapper, LoaderOverLay, LoaderWrapper } from './SelectionPanel.styles';
import Button from '../Button/Button';
import PlotModal from '../PlotModal/PlotModal';
import { generateTrialCoordinates } from '../../common/global';
import store, { CoordinatesType } from '../../Store/Store';
import OpenElevationClient from '../../OECient/OpenElevationClient';
import Loader from 'react-loader-spinner'
import { LoaderContainer } from '../Adapters/Adapters.style';


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

const format = (coords: Array<CoordinatesType>): Array<Array<number>> => {
  // const arr = [];
  const secondArr: Array<Array<any>>= [[]];
  for(let i = 0; i < 5; i++) {
    secondArr[i] =[];
    for(let j = 0; j<5; j++ ) {
      secondArr[i].push(coords[i*5+j] && coords[i*5+j].elevation);
    }

  
    // arr.push(secondArr);
  }
  console.log("------------------------", secondArr)
  return secondArr;
}

const SelectionPanel = () => {
  const { useGlobalState } = store;
  const [ modalVisiblity, setModalVisiblity ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ plotData, setPlotData ] = useState<Array<Array<number>>>([]);
  const [adapter, setAdapter] = useGlobalState('adapter');
  const [coordinates, setCoordinates] = useGlobalState('coordinates');
  const OEClient = new OpenElevationClient('http://0.0.0.0:10000/api/v1');

  // const formattCoords = ( res: any ) => {
  //   const arr: any = [];
  //   for(let i=0; i < 5; i++) {
  //     for(let j=0; j < 5; j++) {
  //       arr[i].push(res[j].elevation)
  //     }
  //   }
  //   return arr;
  // }

  const getCoordinates = async() => {
   
    const coords =  await generateTrialCoordinates(+adapter.dlugosc, +adapter.szerokosc, 25);
        setLoading(true);
         if(coords) {
          OEClient.postLookup(
            {
              "locations": coords
            }
          ).then((results: any) => {
             
             const abc = format(results.results);;
              setCoordinates(abc)
              return true;
          })
          .then(a => {
          
            setLoading(false);
          })
          .catch((error: any) => {
              console.log('Error postLookup:' + error);
          });
         }
 
  }  

  const showModal =  useCallback((value: boolean) => (
  ) => {
    setModalVisiblity(value);
    if(value) {
      getCoordinates();
    }
  }, [modalVisiblity, adapter])

  return (
    <Wrapper>
      <Stations />
      <Adapters />
      <ButtonWrapper>
        <SubmitButton callback={showModal(true)} />
      </ButtonWrapper>
      {loading ? 
      <LoaderOverLay>
          <LoaderContainer>
            <Loader type="Watch" color="#fff" height={100} width={100}/>
          </LoaderContainer>
      </LoaderOverLay> : null}
      {coordinates.length > 0 ?
        <PlotModal showModal={showModal} modalVisiblity={modalVisiblity} /> :null}
    </Wrapper>
  );
}

export default SelectionPanel;

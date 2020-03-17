import React, { useState, useCallback, memo, useEffect } from "react";
import Stations from "../Stations/Stations";
import Adapters from "../Adapters/Adapters";
import {
  Wrapper,
  ButtonWrapper,
  LoaderOverLay,
  LoaderWrapper
} from "./SelectionPanel.styles";
import Button from "../Button/Button";
import PlotModal from "../PlotModal/PlotModal";
import { generateTrialCoordinates } from "../../common/global";
import store, { CoordinatesType } from "../../Store/Store";
import OpenElevationClient from "../../OECient/OpenElevationClient";
import Loader from "react-loader-spinner";
import { LoaderContainer } from "../Adapters/Adapters.style";
import GMapsModal from "../GMapsModal/GMapsModal";

const SubmitPlotButton = ({ callback }: any) => (
  <Button
    width={150}
    height={50}
    backColor={"#686de0"}
    backColorHover={"#30336b"}
    label={"Create plot"}
    onClick={callback}
  />
);

const SubmitMapsButton = ({ callback }: any) => (
  <Button
    width={150}
    height={50}
    backColor={"#2ecc71"}
    backColorHover={"#27ae60"}
    label={"Show Google Maps"}
    onClick={callback}
  />
);

const SubmitPlotMemoButton = memo(SubmitPlotButton);
const SubmitMapsMemoButton = memo(SubmitMapsButton);
// todo refactor to see proper plot
const format = (coords: Array<CoordinatesType>, range: number): Array<Array<number>> => {
  // const arr = [];
  const secondArr: Array<Array<any>> = [[]];
  for (let i = 0; i < range; i++) {
    secondArr[i] = [];
    for (let j = 0; j < range; j++) {
      secondArr[i].push(coords[i * range + j] && coords[i * range + j].elevation);
    }

    // arr.push(secondArr);
  }
  // console.log("------------------------", secondArr)
  return secondArr;
};

const SelectionPanel = () => {
  const { useGlobalState } = store;
  const [plotModalVisiblity, setPlotModalVisiblity] = useState(false);
  const [mapsModalVisiblity, setMapsModalVisiblity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plotData, setPlotData] = useState<Array<Array<number>>>([]);
  const [trialCoords, setTrialCoords] = useGlobalState("trialCoords");
  const [adapter, setAdapter] = useGlobalState("adapter");
  const [coordinates, setCoordinates] = useGlobalState("coordinates");
  const [elevationResults, setElevationResults] = useGlobalState("elevationResults");
  const OEClient = new OpenElevationClient("http://0.0.0.0:10000/api/v1");

  const getCoordinates = async () => {
    const coords = await generateTrialCoordinates(
      +adapter.szerokosc,
      +adapter.dlugosc,
      20
    );
    setTrialCoords(coords);
    setLoading(true);
    if (coords) {
      // OEClient.postLookup({
      //   locations: coords
      // })
      //   .then((results: any) => {
      //     const result = format(results.results, 40);
      //     setCoordinates(result);
      //     setElevationResults(results.results);
      //     return true;
      //   })
      //   .then(a => {
         
      //     setLoading(false);
      //   })
      //   .catch((error: any) => {
      //     console.log("Error postLookup:" + error);
      //   });



        OEClient.postLookupNew({
           adapterLongitude: +adapter.dlugosc, adapterLatitude: +adapter.szerokosc, range: 20 
        })
          .then((results: any) => {
            console.log("postLookupNew", results);
            return true;
          })
          .then(a => {
           
            // setLoading(false);
          })
          .catch((error: any) => {
            console.log("Error postLookup:" + error);
          });
    }

    // console.info("cooords ->  ", generateTrialCoordinates(5,5,10))
  };

  const triggerState = (value: boolean, type: string) => {
    switch (type) {
      case "plot":
        return setPlotModalVisiblity(value);
      case "maps":
        return setMapsModalVisiblity(value);
        return;
    }
  };

  const showModal = useCallback(
    (value: boolean, type: string) => () => {
      triggerState(value, type);
      // setModalVisiblity(value);
      if (value) {
        getCoordinates();
      }
    },
    [plotModalVisiblity, plotModalVisiblity, adapter]
  );

  // console.log("elevations ",elevationResults)

  return (
    <Wrapper>
      <Stations />
      <Adapters />
      <ButtonWrapper>
        <SubmitPlotMemoButton callback={showModal(true, "plot")} />
      </ButtonWrapper>
      <ButtonWrapper>
        <SubmitMapsButton callback={showModal(true, "maps")} />
      </ButtonWrapper>
      {loading ? (
        <LoaderOverLay>
          <LoaderContainer>
            <Loader type="Watch" color="#fff" height={100} width={100} />
          </LoaderContainer>
        </LoaderOverLay>
      ) : null}
      {coordinates.length > 0 ? (
        <PlotModal showModal={showModal} modalVisiblity={plotModalVisiblity} />
      ) : null}
      {coordinates.length > 0 ? (
        <GMapsModal showModal={showModal} modalVisiblity={mapsModalVisiblity} />
      ) : null}
    </Wrapper>
  );
};

export default SelectionPanel;

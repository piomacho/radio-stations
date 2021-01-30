import React, { useState, useCallback } from "react";
import Stations from "../Stations/Stations";
import Adapters from "../Adapters/Adapters";
import {
  Wrapper,
  ButtonWrapper,
  LoaderOverLay,
  SubmitPlotMemoButton,
  SendToOctaveButton,
  NavigationPanel,
  NavigationWrapper, SendAllToOctaveButton, ShowResultMapsButton
} from "./SelectionPanel.styles";
import PlotModal from "../PlotModal/PlotModal";
import store, { CoordinatesType } from "../../Store/Store";
import OpenElevationClient from "../../OECient/OpenElevationClient";
import Loader from "react-loader-spinner";
import { LoaderContainer } from "../Adapters/Adapters.style";
import GMapsModal from "../GMapsModal/GMapsModal";
import ExportModal from "../ExportModal/ExportModal";
import ExportAllModal from "../ExportAllModal/ExportAllModal";
import ShowMapsModal from "../ShowMapsModal/ShowMapsModal";

// todo refactor to see proper plot
const format = (
  coords: Array<CoordinatesType>,
  range: number
): Array<Array<number>> => {
  const secondArr: Array<Array<any>> = [[]];
  for (let i = 0; i < range; i++) {
    secondArr[i] = [];
    for (let j = 0; j < range; j++) {
      secondArr[i].push(
        coords[i * range + j] && coords[i * range + j].elevation
      );
    }
  }
  return secondArr;
};

const formatDistance = (
  coords: Array<CoordinatesType>,
  range: number
): Array<Array<number>> => {
  const secondArr: Array<Array<any>> = [[]];
  for (let i = 0; i < range; i++) {
    secondArr[i] = [];
    for (let j = 0; j < range; j++) {
      secondArr[i].push(
        coords[i * range + j] && coords[i * range + j].distance
      );
    }
  }
  return secondArr;
};

const SelectionPanel = () => {
  const { useGlobalState } = store;
  const [plotModalVisiblity, setPlotModalVisiblity] = useState(false);
  const [mapsModalVisiblity, setMapsModalVisiblity] = useState(false);
  const [exportModalVisiblity, setExportModalVisiblity] = useState(false);
  const [exportAllModalVisiblity, setExportAllModalVisiblity] = useState(false);
  const [showMapsModalVisiblity, setShowMapsModalVisiblity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [plotData, setPlotData] = useState<Array<any>>([]);
  const [trialCoords, setTrialCoords] = useGlobalState("trialCoords");
  const [adapter] = useGlobalState("adapter");
  const [coordinates, setCoordinates] = useGlobalState("coordinates");
  const [elevationResults, setElevationResults] = useGlobalState("elevationResults");
  const OEClient = new OpenElevationClient("http://0.0.0.0:10000/api/v1");

  const getCoordinates = () => {
    setLoading(true);


    return OEClient.postLookupNew({
      adapterLongitude: +adapter.dlugosc,
      adapterLatitude: +adapter.szerokosc,
      range: 10,
    })
      .then(async(results: any) => {
        const elevations = await format(results.results, 30);
        const distances = await formatDistance(results.results, 30);
        setPlotData(results.results);
        setCoordinates({elevations: elevations, distances: distances });
        setElevationResults(results.results);
        setTrialCoords(results.results);
        setLoading(false);
        return true;
      })
      .catch((error: any) => {
        console.log("Error postLookup:" + error);
        return false;
      });
  };

  const triggerState = (value: boolean, type: string) => {
    switch (type) {
      case "plot":
        return setPlotModalVisiblity(value);
      case "maps":
        return setMapsModalVisiblity(value);
      case "export":
        return setExportModalVisiblity(value);
      case "export-all":
          return setExportAllModalVisiblity(value);
      case "show-maps":
          return setShowMapsModalVisiblity(value);
    }
  };

  const showModal = useCallback(
    (value: boolean, type: string, query: boolean, onClose?: () => void) => () => {
      if(onClose){
        onClose();
      }
      triggerState(value, type);
      if (value && query) {
        getCoordinates();
      }
    },
    [plotModalVisiblity, adapter, exportAllModalVisiblity ]
  );

  return (
    <Wrapper>
      <Stations />
      <Adapters />
      <NavigationWrapper>
        <NavigationPanel>
          <ButtonWrapper>
            <SubmitPlotMemoButton callback={showModal(true, "plot", true)} />
          </ButtonWrapper>
          {/* <ButtonWrapper>
            <SubmitMapsButton callback={showModal(true, "maps", true)} />
          </ButtonWrapper> */}
          <ButtonWrapper>
            <SendToOctaveButton callback={showModal(true, "export", false)} />
          </ButtonWrapper>
          <ButtonWrapper>
            <SendAllToOctaveButton callback={showModal(true, "export-all", false)} />
          </ButtonWrapper>
          <ButtonWrapper>
            <ShowResultMapsButton callback={showModal(true, "show-maps", false)} />
          </ButtonWrapper>
        </NavigationPanel>
      </NavigationWrapper>
      {loading ? (
        <LoaderOverLay>
          <LoaderContainer>
            <Loader type="Watch" color="#fff" height={100} width={100} />
          </LoaderContainer>
        </LoaderOverLay>
      ) : null}
      {plotData.length > 0 ? (
        <PlotModal showModal={showModal} modalVisiblity={plotModalVisiblity} />
      ) : null}
      {coordinates.elevations.length > 0 ? (
        <GMapsModal showModal={showModal} modalVisiblity={mapsModalVisiblity} />
      ) : null}
        <ExportModal
          showModal={showModal}
          modalVisiblity={exportModalVisiblity}
        />
        <ExportAllModal
          showModal={showModal}
          modalVisiblity={exportAllModalVisiblity}
        />
        <ShowMapsModal
          showModal={showModal}
          modalVisiblity={showMapsModalVisiblity}
        />
    </Wrapper>
  );
};

export default SelectionPanel;

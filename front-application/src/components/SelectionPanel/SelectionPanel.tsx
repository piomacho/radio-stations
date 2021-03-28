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
  NavigationWrapper, SendAllToOctaveButton, ShowResultMapsButton, SubmitMapsButton
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
        const myResults = {"c": [{"lat": 52.14471, "lng": 21.04471, "e": 107.0, "d": 0.0}, {"lat": 52.15046, "lng": 21.03539, "e": 101.0, "d": 0.90206}, {"lat": 52.15621, "lng": 21.02607, "e": 102.0, "d": 1.80406}, {"lat": 52.16196, "lng": 21.01675, "e": 100.0, "d": 2.706}, {"lat": 52.16771, "lng": 21.00743, "e": 96.0, "d": 3.60788}, {"lat": 52.17346, "lng": 20.9981, "e": 102.0, "d": 4.51019}, {"lat": 52.1792, "lng": 20.98877, "e": 108.0, "d": 5.41165}, {"lat": 52.18495, "lng": 20.97944, "e": 105.0, "d": 6.31384}, {"lat": 52.19069, "lng": 20.97011, "e": 107.0, "d": 7.21519}, {"lat": 52.19644, "lng": 20.96077, "e": 110.0, "d": 8.11775}, {"lat": 52.20218, "lng": 20.95143, "e": 108.0, "d": 9.01946}, {"lat": 52.20793, "lng": 20.94209, "e": 108.0, "d": 9.9219}, {"lat": 52.21367, "lng": 20.93275, "e": 109.0, "d": 10.82349}, {"lat": 52.21941, "lng": 20.9234, "e": 110.0, "d": 11.72551}, {"lat": 52.22515, "lng": 20.91405, "e": 112.0, "d": 12.62747}, {"lat": 52.23089, "lng": 20.9047, "e": 111.0, "d": 13.52937}, {"lat": 52.23663, "lng": 20.89535, "e": 106.0, "d": 14.43121}, {"lat": 52.24237, "lng": 20.88599, "e": 106.0, "d": 15.33348}, {"lat": 52.24811, "lng": 20.87664, "e": 104.0, "d": 16.2352}, {"lat": 52.25385, "lng": 20.86728, "e": 110.0, "d": 17.13735}, {"lat": 52.25958, "lng": 20.85791, "e": 110.0, "d": 18.03914}, {"lat": 52.26532, "lng": 20.84855, "e": 98.0, "d": 18.94117}, {"lat": 52.27105, "lng": 20.83918, "e": 103.0, "d": 19.84284}, {"lat": 52.27679, "lng": 20.82981, "e": 90.0, "d": 20.74524}, {"lat": 52.28252, "lng": 20.82044, "e": 101.0, "d": 21.64679}, {"lat": 52.28826, "lng": 20.81106, "e": 90.0, "d": 22.54955}, {"lat": 52.29399, "lng": 20.80169, "e": 87.0, "d": 23.45099}, {"lat": 52.29972, "lng": 20.79231, "e": 83.0, "d": 24.35285}, {"lat": 52.30545, "lng": 20.78292, "e": 80.0, "d": 25.25513}, {"lat": 52.31118, "lng": 20.77354, "e": 85.0, "d": 26.15687}, {"lat": 52.31691, "lng": 20.76415, "e": 86.0, "d": 27.05903}], "r": {"lat": 52.32278, "lng": 20.75453}}

        setElevationResults(myResults.c)
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

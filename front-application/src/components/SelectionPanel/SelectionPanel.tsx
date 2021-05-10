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
  NavigationWrapper, SendAllToOctaveButton, ShowResultMapsButton, SubmitMapsButton, ShowResultGMapsMapsButton, NoAdaperWarning
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
import GMapsResults from "../GMapsResults/GMapsResults";

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
  const [ noAdaterWarning ] = useGlobalState('noAdapterWarning');
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
        const myRes = [
          {
             "lat":51.745500345704,
             "lng":19.53791601026,
             "e":220.0,
             "d":0.0
          },
          {
             "lat":51.7474744051349,
             "lng":19.5349353191189,
             "e":219.0,
             "d":0.30058152054283577
          },
          {
             "lat":51.7494483891677,
             "lng":19.531954367456,
             "e":222.0,
             "d":0.6011630410744531
          },
          {
             "lat":51.7514222977906,
             "lng":19.5289731552398,
             "e":228.0,
             "d":0.9017445616155066
          },
          {
             "lat":51.7533961309916,
             "lng":19.5259916824391,
             "e":230.0,
             "d":1.2023260821564805
          },
          {
             "lat":51.7553698887588,
             "lng":19.5230099490227,
             "e":239.0,
             "d":1.5029076026978883
          },
          {
             "lat":51.7573435710801,
             "lng":19.5200279549592,
             "e":233.0,
             "d":1.803489123230457
          },
          {
             "lat":51.7593171779438,
             "lng":19.5170457002173,
             "e":233.0,
             "d":2.104070643774745
          },
          {
             "lat":51.7612907093378,
             "lng":19.5140631847659,
             "e":223.0,
             "d":2.4046521643091583
          },
          {
             "lat":51.7632641652502,
             "lng":19.5110804085734,
             "e":223.0,
             "d":2.705233684852052
          },
          {
             "lat":51.7652375456691,
             "lng":19.5080973716088,
             "e":228.0,
             "d":3.0058152053929694
          },
          {
             "lat":51.7672108505824,
             "lng":19.5051140738406,
             "e":227.0,
             "d":3.306396725929064
          },
          {
             "lat":51.7691840799783,
             "lng":19.5021305152376,
             "e":230.0,
             "d":3.60697824646806
          },
          {
             "lat":51.7711572338448,
             "lng":19.4991466957684,
             "e":239.0,
             "d":3.9075597670107163
          },
          {
             "lat":51.7731303121699,
             "lng":19.4961626154018,
             "e":238.0,
             "d":4.208141287548644
          },
          {
             "lat":51.7751033149417,
             "lng":19.4931782741065,
             "e":232.0,
             "d":4.508722808086718
          },
          {
             "lat":51.7770762421482,
             "lng":19.4901936718511,
             "e":231.0,
             "d":4.8093043286247
          },
          {
             "lat":51.7790490937775,
             "lng":19.4872088086043,
             "e":227.0,
             "d":5.10988584916802
          },
          {
             "lat":51.7810218698176,
             "lng":19.4842236843349,
             "e":226.0,
             "d":5.410467369708103
          },
          {
             "lat":51.7829945702565,
             "lng":19.4812382990115,
             "e":219.0,
             "d":5.711048890245994
          },
          {
             "lat":51.7849671950822,
             "lng":19.4782526526027,
             "e":213.0,
             "d":6.011630410783697
          },
          {
             "lat":51.7869397442829,
             "lng":19.4752667450774,
             "e":212.0,
             "d":6.312211931323
          },
          {
             "lat":51.7889122178464,
             "lng":19.472280576404,
             "e":215.0,
             "d":6.612793451860025
          },
          {
             "lat":51.790884615761,
             "lng":19.4692941465514,
             "e":216.0,
             "d":6.913374972405993
          },
          {
             "lat":51.7928569380144,
             "lng":19.4663074554882,
             "e":215.0,
             "d":7.213956492937467
          },
          {
             "lat":51.7948291845949,
             "lng":19.4633205031831,
             "e":214.0,
             "d":7.514538013476615
          },
          {
             "lat":51.7968013554904,
             "lng":19.4603332896047,
             "e":216.0,
             "d":7.815119534015986
          },
          {
             "lat":51.798773450689,
             "lng":19.4573458147217,
             "e":217.0,
             "d":8.115701054560606
          },
          {
             "lat":51.8007454701786,
             "lng":19.4543580785028,
             "e":217.0,
             "d":8.416282575100215
          },
          {
             "lat":51.8027174139472,
             "lng":19.4513700809166,
             "e":215.0,
             "d":8.716864095636923
          },
          {
             "lat":51.8046892819829,
             "lng":19.4483818219319,
             "e":217.0,
             "d":9.017445616170194
          },
          {
             "lat":51.8066610742737,
             "lng":19.4453933015171,
             "e":224.0,
             "d":9.318027136711542
          },
          {
             "lat":51.8086327908076,
             "lng":19.4424045196411,
             "e":221.0,
             "d":9.618608657249421
          },
          {
             "lat":51.8106044315726,
             "lng":19.4394154762725,
             "e":212.0,
             "d":9.919190177785458
          },
          {
             "lat":51.8125759965568,
             "lng":19.4364261713798,
             "e":206.0,
             "d":10.219771698335045
          },
          {
             "lat":51.814547485748,
             "lng":19.4334366049319,
             "e":203.0,
             "d":10.520353218869351
          },
          {
             "lat":51.8165188991343,
             "lng":19.4304467768972,
             "e":200.0,
             "d":10.820934739408314
          },
          {
             "lat":51.8184902367038,
             "lng":19.4274566872446,
             "e":209.0,
             "d":11.121516259948443
          },
          {
             "lat":51.8204614984443,
             "lng":19.4244663359425,
             "e":209.0,
             "d":11.422097780484952
          },
          {
             "lat":51.822432684344,
             "lng":19.4214757229597,
             "e":211.0,
             "d":11.722679301027672
          },
          {
             "lat":51.8244037943907,
             "lng":19.4184848482648,
             "e":207.0,
             "d":12.023260821562069
          },
          {
             "lat":51.8263748285726,
             "lng":19.4154937118264,
             "e":205.0,
             "d":12.323842342107527
          },
          {
             "lat":51.8283457868775,
             "lng":19.4125023136132,
             "e":201.0,
             "d":12.624423862645815
          },
          {
             "lat":51.8303166692934,
             "lng":19.4095106535937,
             "e":207.0,
             "d":12.925005383184406
          },
          {
             "lat":51.8322874758084,
             "lng":19.4065187317368,
             "e":203.0,
             "d":13.225586903718856
          },
          {
             "lat":51.8342582064105,
             "lng":19.4035265480108,
             "e":199.0,
             "d":13.526168424267365
          },
          {
             "lat":51.8362288610875,
             "lng":19.4005341023846,
             "e":198.0,
             "d":13.826749944801362
          },
          {
             "lat":51.8381994398275,
             "lng":19.3975413948267,
             "e":196.0,
             "d":14.127331465337646
          },
          {
             "lat":51.8401699426185,
             "lng":19.3945484253057,
             "e":193.0,
             "d":14.427912985879216
          },
          {
             "lat":51.8421403694484,
             "lng":19.3915551937902,
             "e":189.0,
             "d":14.728494506419786
          },
          {
             "lat":51.8441107203052,
             "lng":19.388561700249,
             "e":185.0,
             "d":15.029076026954765
          },
          {
             "lat":51.8460809951769,
             "lng":19.3855679446505,
             "e":182.0,
             "d":15.329657547494854
          },
          {
             "lat":51.8480511940515,
             "lng":19.3825739269635,
             "e":176.0,
             "d":15.630239068035735
          },
          {
             "lat":51.8500213169169,
             "lng":19.3795796471564,
             "e":175.0,
             "d":15.930820588580346
          },
          {
             "lat":51.851991363761,
             "lng":19.376585105198,
             "e":176.0,
             "d":16.23140210911603
          },
          {
             "lat":51.8539613345719,
             "lng":19.3735903010569,
             "e":192.0,
             "d":16.53198362965278
          },
          {
             "lat":51.8559312293375,
             "lng":19.3705952347016,
             "e":202.0,
             "d":16.832565150192284
          },
          {
             "lat":51.8579010480457,
             "lng":19.3675999061007,
             "e":210.0,
             "d":17.13314667072852
          },
          {
             "lat":51.8598707906846,
             "lng":19.3646043152229,
             "e":209.0,
             "d":17.43372819127054
          },
          {
             "lat":51.861840457242,
             "lng":19.3616084620367,
             "e":195.0,
             "d":17.734309711808315
          },
          {
             "lat":51.863810047706,
             "lng":19.3586123465108,
             "e":197.0,
             "d":18.03489123234968
          },
          {
             "lat":51.8657795620645,
             "lng":19.3556159686138,
             "e":186.0,
             "d":18.33547275289139
          },
          {
             "lat":51.8677490003053,
             "lng":19.3526193283141,
             "e":181.0,
             "d":18.636054273429167
          },
          {
             "lat":51.8697183624165,
             "lng":19.3496224255806,
             "e":185.0,
             "d":18.93663579396086
          },
          {
             "lat":51.8716876483861,
             "lng":19.3466252603816,
             "e":178.0,
             "d":19.23721731450566
          },
          {
             "lat":51.8736568582019,
             "lng":19.3436278326858,
             "e":187.0,
             "d":19.53779883504615
          },
          {
             "lat":51.8756259918519,
             "lng":19.3406301424619,
             "e":188.0,
             "d":19.838380355582512
          }
       ];

        setElevationResults(myRes)
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
      case "show-maps-google":
          return setMapsModalVisiblity(value);
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
      {noAdaterWarning !== true ?
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
          {/* <ButtonWrapper>
            <ShowResultMapsButton callback={showModal(true, "show-maps", false)} />
          </ButtonWrapper> */}
          <ButtonWrapper>
            <ShowResultGMapsMapsButton callback={showModal(true, "show-maps-google", false)} />
          </ButtonWrapper>
        </NavigationPanel>
      </NavigationWrapper> : <NoAdaperWarning>Proszę wybrać inną stację</NoAdaperWarning>}
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
      {/* {coordinates.elevations.length > 0 ? (
        <GMapsModal showModal={showModal} modalVisiblity={mapsModalVisiblity} />
      ) : null} */}
        <ExportModal
          showModal={showModal}
          modalVisiblity={exportModalVisiblity}
        />
        <ExportAllModal
          showModal={showModal}
          modalVisiblity={exportAllModalVisiblity}
        />
        {/* <ShowMapsModal
          showModal={showModal}
          modalVisiblity={showMapsModalVisiblity}
        /> */}
        <GMapsResults showModal={showModal} modalVisiblity={mapsModalVisiblity} />
    </Wrapper>
  );
};

export default SelectionPanel;

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import store, { CoordinatesType } from "../../Store/Store";
import Button from "../Button/Button";

import createPlotlyComponent from "react-plotlyjs";
//See the list of possible plotly bundles at https://github.com/plotly/plotly.js/blob/master/dist/README.md#partial-bundles or roll your own
import Plotly from "plotly.js-gl3d-dist";
import { Link } from "react-router-dom";

const PlotlyComponent = createPlotlyComponent(Plotly);

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: any;
  // props: HighchartsReact.Props
  // showModal: (event: boolean) => (e: React.MouseEvent<Element, MouseEvent> )=> void
}

const format = (coords: Array<CoordinatesType>): Array<Array<number>> => {
  const arr = [];
  let secondArr;
  for (let i = 0; i < 5; i++) {
    secondArr = [];
    for (let j = 0; j < 5; j++) {
      // secondArr.push(j)
      // console.log("coords[j]", coords[j]);
      secondArr.push(coords[j] && coords[j].elevation);
    }
    arr.push(secondArr);
  }
  return arr;
};

const PlotModal = ({ modalVisiblity, showModal }: PlotModalType) => {
  const { useGlobalState } = store;
  const [coordinates, setCoordinates] = useGlobalState("coordinates");

  var data = [
    {
      z: coordinates,
      type: "surface"
    }
  ];

  var layout = {
    title: "Elevation around adapter",
    autosize: false,
    width: 800,
    height: 800,
    margin: {
      l: 90,
      r: 90,

      b: 90,
      t: 90
    }
  };
  return (
    <Modal
      isOpen={modalVisiblity}
      onRequestClose={showModal(false, "plot")}
      ariaHideApp={false}
      contentLabel="Example Modal"
    >
      <PlotlyComponent
        className="whatever"
        data={data}
        layout={layout}
        config={{}}
      />
      <Button
        onClick={showModal(false, "plot")}
        label={"Close"}
        height={30}
        width={50}
        backColorHover={"#ff7979"}
      />
    </Modal>
  );
};

export default PlotModal;

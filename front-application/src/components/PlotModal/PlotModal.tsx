import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import store, { CoordinatesType } from "../../Store/Store";
import Button from "../Button/Button";

import createPlotlyComponent from "react-plotlyjs";
import Plotly from "plotly.js-gl3d-dist";
import { ButtonWrapper } from "../Button/Button.styles";

const PlotlyComponent = createPlotlyComponent(Plotly);

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: any;
}

const format = (coords: Array<CoordinatesType>): Array<Array<number>> => {
  const arr = [];
  let secondArr;
  for (let i = 0; i < 5; i++) {
    secondArr = [];
    for (let j = 0; j < 5; j++) {
      secondArr.push(coords[j] && coords[j].elevation);
    }
    arr.push(secondArr);
  }
  return arr;
};

const PlotModal = ({ modalVisiblity, showModal }: PlotModalType) => {
  const { useGlobalState } = store;
  const [coordinates] = useGlobalState("coordinates");

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
      <ButtonWrapper>
        <Button
          onClick={showModal(false, "plot")}
          label={"Close"}
          height={30}
          width={50}
          backColorHover={"#ff7979"}
        />
      </ButtonWrapper>

    </Modal>
  );
};

export default PlotModal;

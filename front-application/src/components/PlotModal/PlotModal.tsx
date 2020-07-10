import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import store, { CoordinatesType } from "../../Store/Store";
import Button from "../Button/Button";

import createPlotlyComponent from "react-plotlyjs";
import Plotly from "plotly.js-gl3d-dist";
import { ButtonWrapper } from "../Button/Button.styles";
import { MyResponsiveHeatMap } from "./HeatMap";

const PlotlyComponent = createPlotlyComponent(Plotly);

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: any;
}

const PlotModal = ({ modalVisiblity, showModal }: PlotModalType) => {
  const { useGlobalState } = store;
  const [coordinates] = useGlobalState("coordinates");


  var data = [
    {
      z: coordinates.elevations,
      y: coordinates.distances,
      type: "surface"
    }
  ];

  var layout = {
    title: "Elevation around adapter",
    autosize: false,
    width: 800,
    height: 500,
    margin: {
      l: 50,
      r: 50,

      b: 30,
      t: 30
    }
  };
  return (
    <Modal
      isOpen={modalVisiblity}
      onRequestClose={showModal(false, "plot")}
      ariaHideApp={false}
      contentLabel="Example Modal"
    >
      {/* <PlotlyComponent
        className="whatever"
        data={data}
        layout={layout}
        config={{}}
      /> */}
      {/* keysData={['']} */}
      <MyResponsiveHeatMap />
      <ButtonWrapper>
        <Button
          onClick={showModal(false, "plot")}
          label={"Close"}
          height={30}
          width={100}
          backColorHover={"#ff7979"}
        />
      </ButtonWrapper>

    </Modal>
  );
};

export default PlotModal;

import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import store, { CoordinatesType } from "../../Store/Store";
import Button from "../Button/Button";

import createPlotlyComponent from "react-plotlyjs";
import Plotly from "plotly.js-gl3d-dist";
import { ButtonWrapper } from "../Button/Button.styles";
import { MyResponsiveHeatMap } from "./HeatMap";
import Map from '../Map/MapComparison'
import {CloseButtonWrapper, MapWrapper } from "./PlotModal.style";
import { CloseButton } from "../ExportModal/ExportModal.style";

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: any;
}

const PlotModal = ({ modalVisiblity, showModal }: PlotModalType) => {

  return (
    <Modal
      isOpen={modalVisiblity}
      onRequestClose={showModal(false, "plot")}
      ariaHideApp={false}
      contentLabel="Example Modal"
    >
      <CloseButtonWrapper>
        <CloseButton onClick={showModal(false, "plot")}><span>&#10006;</span></CloseButton>
      </CloseButtonWrapper>

      <MyResponsiveHeatMap />
      <MapWrapper>
        <Map />
      </MapWrapper>

    </Modal>
  );
};

export default PlotModal;

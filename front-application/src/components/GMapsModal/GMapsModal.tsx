import React, { useState } from "react";
import Modal from "react-modal";
import Button from "../Button/Button";
import Map from '../Map/Map'
import { ButtonWrapper, Message } from "./GMapsModal.style";
import { callApiFetch } from "../../common/global";
import store, { CoordinatesType } from "../../Store/Store";

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: (value: boolean, type: string, query: boolean) => any;

}

const GMapsModal = ({ modalVisiblity, showModal }: PlotModalType) => {
  const [successMessage, setSuccessMessage] = useState("");
  const { useGlobalState } = store;
  const [elevationResults] = useGlobalState("elevationResults");
// console.log("ER ",elevationResults);
  const handleExport = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        coordinates: elevationResults.map((result: CoordinatesType) => result.elevation)
      })
    };

  callApiFetch(`api/gmaps/excel-send`, requestOptions)
    .then(() => {
      setSuccessMessage("File exported succcessfully!");
    })
    .catch(err => console.error(err));
  };


  return (
    <Modal
      isOpen={modalVisiblity}
      onRequestClose={showModal(false, "maps", false)}
      ariaHideApp={false}
      contentLabel="Example Modal"
    >
      <Map />
      <ButtonWrapper>
      <Button
          onClick={handleExport}
          label={"Compare results in Excel"}
          height={30}
          backColor={"#01a3a4"}
          width={150}
          backColorHover={"#58B19F"}
        />
        <Button
          onClick={showModal(false, "maps", false)}
          label={"Close"}
          height={30}
          width={80}
          backColorHover={"#ff7979"}
        />

      </ButtonWrapper>
      <Message>{successMessage}</Message>

    </Modal>
  );
};

export default GMapsModal;

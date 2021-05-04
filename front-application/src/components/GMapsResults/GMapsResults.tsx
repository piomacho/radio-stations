import React from "react";
import Modal from "react-modal";
import { CloseButton } from "../ExportModal/ExportModal.style";
import { CloseButtonWrapper } from "../PlotModal/PlotModal.style";
import { MapWithGroundOverlay } from "./ResultMap";
import Keys from "../../keys";
import { MapWrapper, SourceTitle, ToggleWrapper } from "./ShowMapsModal.styles";
import Legend from "../Legend/Legend";
import { CheckBox, CheckBoxLabel, CheckBoxWrapper } from "../ToggleSwitch/ToggleSwitch.styles";
import { MapWithGroundOverlayMRP } from "./ResultMapMRP";
import { MissingMapDialog } from "../ConfirmationDialog/MissingMapDialog";

interface PlotModalType {
  modalVisiblity: boolean;
  showModal: (value: boolean, type: string, query: boolean, onClose?: () => void) =>  ((event: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>) => void) | undefined;
}


const GMapsResults = ({ modalVisiblity, showModal }: PlotModalType) => {
  const [isChecked, setIsChecked] = React.useState(false);
  const [ showConfirmationBox, setConfirmationBox ] = React.useState(false);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setIsChecked(isChecked);
  }

  const handleClose = () => {
    showModal(false, "show-maps-google", false);
  }
  const closeConfirmationModal = () => {
    setConfirmationBox(false);
  }

  const customStyles = {
    content : {
      background: '#f2f8eb'
    }
  };

  return (
    <Modal
      isOpen={modalVisiblity}
      onRequestClose={handleClose}
      ariaHideApp={false}
      contentLabel="Porównaj wyniki"
      style={ customStyles }
    >
      <CloseButtonWrapper>
        <CloseButton onClick={showModal(false, "show-maps-google", false)}><span>&#10006;</span></CloseButton>
      </CloseButtonWrapper>

      <Legend />
      <ToggleWrapper>
        <SourceTitle>Mapy radiopolska</SourceTitle>
        <CheckBoxWrapper>
        <CheckBox id="checkbox" type="checkbox" checked={isChecked} onChange={onChange}/>
        <CheckBoxLabel htmlFor="checkbox" />
      </CheckBoxWrapper>
      <SourceTitle>tl_p2001</SourceTitle>
      </ToggleWrapper>
      <MapWrapper>
        {isChecked === true ?
       <MapWithGroundOverlay
          googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${Keys.mapsKey}&v=3.exp&libraries=geometry,drawing,places`}
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `700px` }} />}
          mapElement={<div style={{ height: `100%` }} />}
          isChecked={isChecked}
          setConfirmationBox={setConfirmationBox}
        /> :
        <MapWithGroundOverlayMRP
          googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${Keys.mapsKey}&v=3.exp&libraries=geometry,drawing,places`}
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `700px` }} />}
          mapElement={<div style={{ height: `100%` }} />}
          isChecked={isChecked}
      /> }
      </MapWrapper>
    {showConfirmationBox === true ?
          <MissingMapDialog title="Brak mapy w bazie !" message="Brak mapy w bazie !" onClickClose={()=> closeConfirmationModal()} /> : null}
    </Modal>
  );
};

export default GMapsResults;

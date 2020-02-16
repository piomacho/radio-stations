import React  from 'react';
import Modal from 'react-modal';
import store from '../../Store/Store';

interface PlotModalType {
    modalVisiblity: boolean,
    showModal: (event: boolean) => (e: React.MouseEvent<Element, MouseEvent> )=> void
}

// componentDidMount() {
//     this.coordinates = this.generateTrialCoordinates(52.217, 20.913, 50);
//    }
 
//    generateTrialCoordinates = (x0: number, y0:number, range: number): Array<LocationType> => {
//      const cArray: Array<LocationType>  = [];
 
//      for(let x = 0; x < range; x++ ) {
//        for(let y = 0; y < range; y++) {
//          cArray.push({latitude: Math.round(((x0 + 0.001 * x) + Number.EPSILON) * 1000) / 1000, longitude: Math.round(((y0 + 0.001 * y) + Number.EPSILON) * 1000) / 1000 })
//        }
//      }
//      return cArray;
//    }

const PlotModal = ({modalVisiblity, showModal}: PlotModalType) => {
    const { useGlobalState } = store;
    const [adapter] = useGlobalState('adapter');
    console.log("dapter ", adapter)
  return (
    <Modal
        isOpen={modalVisiblity}
        onRequestClose={showModal(false)}
        ariaHideApp={false}
        contentLabel="Example Modal"
    >
        <div>I am a modal</div>
        <form>
        <input />
        <button>tab navigation</button>
        <button>stays</button>
        <button>inside</button>
        <button>the modal</button>
        </form>
    </Modal>
  );
}

export default PlotModal;

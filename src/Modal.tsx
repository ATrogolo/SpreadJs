import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import './App.css'

export interface ModalProps {
  show: boolean;
  onClose: () => void;
}
export const Modal: FunctionComponent<ModalProps> = ({
  show,
  onClose
}) => {




  const modal = (
    <React.Fragment>
    <div className = "center">
      <div className = "modal">
    <div>ciao</div>
    <button onClick= {onClose}>CLICCAMI</button>
    </div>
    </div>
    </React.Fragment>
    
  );
  return show ? ReactDOM.createPortal(modal, document.body) : null;
};
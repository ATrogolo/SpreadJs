import React, { FunctionComponent } from 'react';
import ReactDOM from 'react-dom';
import './App.css'

export interface ModalProps {
  showModalConfigurator: boolean;
  onClose: () => void;
}
export const ModalCommandConfigurator: FunctionComponent<ModalProps> = ({
  showModalConfigurator,
  onClose
}) => {




  const modal = (
    <React.Fragment>
    <div className = "center">
      <div className = "modal">
    <div>ciao Sono la modale di configurazione del bottone</div>
    <button onClick= {onClose}>CLICCAMI</button>
    </div>
    </div>
    </React.Fragment>
    
  );
  return showModalConfigurator ? ReactDOM.createPortal(modal, document.body) : null;
};
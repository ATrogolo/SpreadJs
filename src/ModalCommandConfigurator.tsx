import { render } from '@testing-library/react';
import React, { FunctionComponent,Component } from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import'./ModalCommandConfigurator.css';
import * as GC from '@grapecity/spread-sheets'

export interface ModalProps {
  showModalConfigurator: boolean;
  designerMode: boolean;
  onClose: () => void;
  spreadSheet : any;
  fbx : any;
}



export class ModalCommandConfigurator extends React.Component<any, any>{


  constructor(props:any) {
    super(props);
    this.state = {
      options: [
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' }
      ],
      parameters :[],
      commandSelected: {},
      spreadSheet : GC.Spread,
      fbx: GC.Spread.Sheets.FormulaTextBox.FormulaTextBox
    };
    
    
  }



  removeParameter=( index:number)=>{
    const parameters = this.state.parameters;
    parameters.splice(index,1)
    this.setState({parameters:parameters})
  }

  addParameter =(value:any)=>{
    const parameters = this.state.parameters;
    parameters.push({value:value})
    this.setState({parameters: parameters })
    
    console.log(this.state)
  }


  handleChange=(command:any)=> {
    const com = {value:command.value, label:command.label}
    this.setState({ commandSelected: com})
  }


  setParameter =(value : any, index: number) =>{

  }

  render(){
  const { showModalConfigurator, onClose, designerMode} = this.props
  const { options, parameters, commandSelected} = this.state
  const elementFormulaBar = document.getElementById('formulaBar')!
  // var fbx = this.state.spreadSheet.FormulaTextBox(elementFormulaBar,{rangeSelectMode: true, absoluteReference: false});
  // fbx.workbook(this.state.spreadSheet.Workbook);
  // this.setState({fbx : fbx});
  // console.log("roba ",this.state.spreadSheet)
    
 return showModalConfigurator && designerMode ? (
  
    <div  className="modal">
      <div id ='formulaBar'></div>
      <div className = "modal-content">

          <div className = "modal-header">

            <div className="labelSelect">
              <div>Command:</div>
              <div className="selectSize">
                <Select  options={options} onChange={this.handleChange} />
              </div>
            </div>
              
           </div>


           <div className="modal-body">
             {Object.keys(commandSelected).length !== 0 && <span>
                {parameters.map((element: any, index: number) => {
                  return(
                   <div className="labelSelect" key= {index}>
                     <div>Parameter: </div>
                    <div >
                    <form >
                      {/* <input  defaultValue={element.value} onChange={() => this.setParameter(element.value, index)}/> */}
                      <div id="formulaBar" spellCheck="false"
                        style={{ border: "1px solid #808080", width: "100%" }}></div>
                    </form>                  
                      </div>
                      <div>
                      <button className="removeButton" onClick={() =>this.removeParameter(index)} >X</button> 
                      </div>
                   </div>
                  )
                }
                )}
                </span>
              }
          </div>

          <div className= "modal-footer">
            <div>
                {Object.keys(commandSelected).length !== 0 &&<button className="addButton" onClick={() =>this.addParameter("")} >+</button>}
              </div>
              <div className="footerButton">
            <button className="buttonUndo" onClick= {onClose}>ANNULLA</button>
            <button  className="buttonConfirm" onClick= {onClose}>CONFERMA</button>
            </div>
          </div>

          

      </div>

    </div>
  

    ) : null}
    

  }
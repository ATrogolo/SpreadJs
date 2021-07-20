import { render } from '@testing-library/react'
import ReactDOM from 'react-dom'
import Select from 'react-select'
import './ModalCommandConfigurator.css'
import * as GC from '@grapecity/spread-sheets'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import Paper, { PaperProps } from '@material-ui/core/Paper'

import React from 'react'
import Draggable from 'react-draggable'

export interface ModalProps {
  showModalConfigurator: boolean
  designerMode: boolean
  onClose: () => void
  spreadSheet: any
  fbx: any
}

export class ModalCommandConfigurator extends React.Component<any, any> {
  constructor(props: any) {
    super(props)
    this.state = {
      options: [
        { value: 'chocolate', label: 'Chocolate' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' },
      ],
      parameters: [],
      commandSelected: {},
      spreadSheet: GC.Spread,
      fbx: GC.Spread.Sheets.FormulaTextBox.FormulaTextBox,
    }
  }

  removeParameter = (index: number) => {
    const parameters = this.state.parameters
    parameters.splice(index, 1)
    this.setState({ parameters: parameters })
  }

  addParameter = (value: any) => {
    const parameters = this.state.parameters
    parameters.push({ value: value })
    this.setState({ parameters: parameters })

    console.log(this.state)
  }

  handleChange = (command: any) => {
    const com = { value: command.value, label: command.label }
    this.setState({ commandSelected: com })
  }

  setParameter = (value: any, index: number) => {}

  render() {
    const { showModalConfigurator, onClose, designerMode } = this.props
    const { options, parameters, commandSelected } = this.state

    return showModalConfigurator && designerMode ? (
      <span>
        <Dialog open={true} PaperComponent={PaperComponent} aria-labelledby="draggable-dialog-title">
          {' '}
          <DialogTitle style={{ cursor: 'move'}} id="draggable-dialog-title">
 
          </DialogTitle>
            <div className="modal">
              <div className="modal-content">
                <div className="modal-header">
                  <div className="labelSelect">
                    <div>Command:</div>
                    <div className="selectSize">
                      <Select options={options} onChange={this.handleChange} />
                    </div>
                  </div>
                </div>

                <div className="modal-body">
                  {Object.keys(commandSelected).length !== 0 && (
                    <div className="componentWraper">
                      <p className="componentTitle">Parameter</p>
                      <div className="overflow">
                        {parameters.map((element: any, index: number) => {
                          return (
                            <div className="labelSelect" key={index}>
                              <div>
                                <Select options={options} onChange={this.handleChange} />
                              </div>
                              <div>
                                <form>
                                  {/* <input  defaultValue={element.value} onChange={() => this.setParameter(element.value, index)}/> */}
                                  <div
                                    id="formulaBar"
                                    spellCheck="false"
                                    style={{ border: '1px solid #808080', width: '100%' }}
                                  ></div>
                                </form>
                              </div>
                              <div>
                                <button className="removeButton" onClick={() => this.removeParameter(index)}>
                                  X
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {/* <div className="options-container">
                <div className="top-options">
                    <p>Click the icon of the rangeSelector, then select a range, then Click the 'Get Value' button.This can be useful for providing users the ability to select ranges for their formulas rather than manually typing them.</p>
                    <div id="formulaBar" spellCheck="false"
                        style={{ border: "1px solid #808080", width: "100%" }}></div>
                </div>
                <div className="options-row" style={{ marginTop: "10px" }}>
                    <input type="button" id="getValue" value="Get Value" style={{ fontSize: "14px", height: "30px" }} onClick={(e)=>{this.props.getSelectedRangeFormula(e)}} />
                    <label>
                        Range Text: <span id="rangeText"
                                        style={{ border: 0, outline: "none", fontSize: "14px", padding: 0 }}></span>
                    </label>
                </div>
            </div>
            
            <div className="options-container">
                <div className="top-options">
                    <p>Click the icon of the rangeSelector, then select a range, then Click the 'Get Value' button.This can be useful for providing users the ability to select ranges for their formulas rather than manually typing them.</p>
                    <div id="formulaBar" spellCheck="false"
                        style={{ border: "1px solid #808080", width: "100%" }}></div>
                </div>
                <div className="options-row" style={{ marginTop: "10px" }}>
                    <input type="button" id="getValue2" value="Get Value" style={{ fontSize: "14px", height: "30px" }} onClick={(e)=>{this.props.getSelectedRangeFormula(e)}} />
                    <label>
                        Range Text: <span id="rangeTextd"
                                        style={{ border: 0, outline: "none", fontSize: "14px", padding: 0 }}></span>
                    </label>
                </div>
            </div> */}

                <div className="modal-footer">
                  <div>
                    {Object.keys(commandSelected).length !== 0 && (
                      <button className="addButton" onClick={() => this.addParameter('')}>
                        +
                      </button>
                    )}
                  </div>
                  <div className="footerButton">
                    <button className="buttonUndo" onClick={onClose}>
                      CLOSE
                    </button>
                    <button className="buttonConfirm" onClick={onClose}>
                      CONFIRM
                    </button>
                  </div>
                </div>

                <div style={{ display: 'none' }} id="formulaBar" spellCheck="false"></div>
              </div>
            </div>
            
        </Dialog>
      </span>
    ) : null
  }
}

function PaperComponent(props: PaperProps) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  )
}

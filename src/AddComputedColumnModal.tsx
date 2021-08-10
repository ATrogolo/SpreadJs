import * as GC from '@grapecity/spread-sheets'
import Dialog from '@material-ui/core/Dialog'
import { useState } from 'react'
import { DraggableComponent } from './DraggableComponent'

import './AddComputedColumnModal.css'

const INIT_ADD_COMPUTEDCOL: AddComputedColumn = { name: '', formula: '', id: -1 }

interface AddComputedColumnModalProps {
  isOpen: boolean
  workbook?: GC.Spread.Sheets.Workbook
  addComputedColumn: (activeSheet: GC.Spread.Sheets.Worksheet, newComputedColumn: AddComputedColumn) => void
  toggleAddComputedModal: (isOpen: boolean) => void
}

export interface AddComputedColumn {
  id: number
  name: string
  formula: string
}

const AddComputedColumnModal = (props: AddComputedColumnModalProps) => {
  const [computedColumn, setComputedColumn] = useState(INIT_ADD_COMPUTEDCOL)

  function reset() {
    setComputedColumn(INIT_ADD_COMPUTEDCOL)
    props.toggleAddComputedModal(false)
  }

  return (
    <Dialog open={props.isOpen} PaperComponent={DraggableComponent} disableBackdropClick={false}>
      <div className="gc-sjsdesigner-dialog gc-designer-root en custom">
        <div id="dialog-titlebar" className="dialog-titlebar">
          <span className="dialog-titlebar-title">Add new</span>
        </div>

        <div className="dialog-content">
          <div>
            <div className="gc-flexcontainer">
              <div>
                <fieldset className="gc-label-container">
                  <legend className="text">Computed column:</legend>
                  <div className="gc-column-set" style={{ margin: '3px 0px' }}>
                    <div className="gc-flex-component flex-default" style={{ width: '80px' }}>
                      <div title="">Name:</div>
                    </div>
                    <div className="gc-flex-component flex-auto">
                      <div>
                        <input
                          type="text"
                          value={computedColumn.name}
                          onChange={({ target: { value } }) =>
                            setComputedColumn({
                              ...computedColumn,
                              name: value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="gc-column-set" style={{ margin: '3px 0px' }}>
                    <div className="gc-flex-component flex-default" style={{ width: '80px' }}>
                      <div title="">Formula:</div>
                    </div>
                    <div className="gc-flex-component flex-auto">
                      <div>
                        <input
                          type="text"
                          value={computedColumn.formula}
                          onChange={({ target: { value } }) =>
                            setComputedColumn({
                              ...computedColumn,
                              formula: value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>
        </div>
        <div className="dialog-footer">
          <button
            type="button"
            className="gc-ui-button"
            onClick={() => {
              const activeSheet = props.workbook?.getActiveSheet()
              if (!activeSheet) {
                return
              }

              const newComputedColumn = { ...computedColumn, id: new Date().getTime() }

              reset()
              props.addComputedColumn(activeSheet, newComputedColumn)
            }}
          >
            <span>OK</span>
          </button>
          <button type="button" className="gc-ui-button" onClick={() => reset()}>
            <span>Cancel</span>
          </button>
        </div>
      </div>
    </Dialog>
  )
}

export default AddComputedColumnModal

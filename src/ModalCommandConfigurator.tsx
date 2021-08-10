import Dialog from '@material-ui/core/Dialog'
import React from 'react'
import Select from 'react-select'
import { Actions, CommandConfig } from './App'
import { DraggableComponent } from './DraggableComponent'
import './ModalCommandConfigurator.css'

interface ModalCommandConfiguratorProps {
  isOpen: boolean
  schema: any
  commandConfig: CommandConfig | null
  toggleCommandConfigModal: (isOpen: boolean) => void
  setCommand: (action: Actions, command: Command) => void
}

export interface Parameter {
  id: number
  name: string | null
  value: string | null
}

export interface Command {
  name: string | null
  parameters: Parameter[]
}

interface ModalCommandConfiguratorState {
  command: Command
}

interface Action {
  value: string
  label: string
}

const INIT_COMMAND = {
  name: null,
  parameters: [],
}

export class ModalCommandConfigurator extends React.Component<
  ModalCommandConfiguratorProps,
  ModalCommandConfiguratorState
> {
  constructor(props: ModalCommandConfiguratorProps) {
    super(props)

    this.state = {
      command: INIT_COMMAND,
    }
  }

  // createInformation() {
  //   const a = []
  //   a.push({ command: this.state.commandSelected })
  //   a.push({ parameters: this.state.parameters })
  //   console.log(a)
  //   // this.props.onClose()
  // }

  // roba(e: any, index: any) {
  //   // this.props.getSelectedRangeFormula(e)
  //   const a = document.getElementById('formulaBar')!
  //   // a.textContent = this.props.fbx.text()
  //   this.setState({ variabile: a.textContent })
  // }

  addParameter = () => {
    const id = new Date().getTime()
    const parameters = [...this.state.command.parameters, { id, name: null, value: null }]

    this.setState({
      command: {
        ...this.state.command,
        parameters,
      },
    })
  }

  selectCommand = (command: any) => {
    const { value } = command

    this.setState({ command: { ...this.state.command, name: value } })
  }

  setParameter = (id: number, name: string | null, value: string | null) => {
    const { parameters } = this.state.command

    const index = parameters.findIndex((parameter: Parameter) => parameter.id === id)
    if (index > -1 && (name !== null || value != null)) {
      const parameter = parameters[index]

      if (name !== null) {
        parameter.name = name
      }
      if (value !== null) {
        parameter.value = value
      }

      parameters.splice(index, 1, parameter)

      this.setState({
        command: {
          ...this.state.command,
          parameters,
        },
      })
    }
  }

  deleteParameter = (id: number) => {
    const { parameters } = this.state.command

    const index = parameters.findIndex((parameter: Parameter) => parameter.id === id)
    if (index > -1) {
      parameters.splice(index, 1)

      this.setState({
        command: {
          ...this.state.command,
          parameters,
        },
      })
    }
  }

  render() {
    const { isOpen, schema } = this.props
    const { command } = this.state

    const commandsList: Action[] = schema.actions.map((action: any) => ({
      value: action.name,
      label: action.name,
    }))

    let commandParameters: Action[] = []
    if (command.name != null) {
      const currentSelectedCommand = schema.actions.find((action: any) => action.name === command.name)
      commandParameters = currentSelectedCommand.parameters.map((parameter: any) => ({
        value: parameter.name,
        label: parameter.name,
      }))
    }

    return isOpen ? (
      <Dialog
        open={this.props.isOpen}
        classes={{
          paper: 'paper-cmd-config',
        }}
        PaperComponent={DraggableComponent}
        disableBackdropClick={false}
      >
        <div className="gc-sjsdesigner-dialog gc-designer-root en custom config-command-modal">
          <div id="dialog-titlebar" className="dialog-titlebar">
            <span className="dialog-titlebar-title">Add new</span>
          </div>

          <div className="config-command-container">
            <div className="labelSelect">
              <div>Command:</div>
              <div className="selectSize">
                <Select options={commandsList} onChange={this.selectCommand} />
              </div>
            </div>

            <div className="config-parameters">
              <div className="labelSelect">
                <span>Parameters:</span>
              </div>

              {/* Insert command parameters */}
              {command.parameters.length !== 0 &&
                command.parameters.map((parameter: Parameter) => {
                  const { id, value } = parameter

                  return (
                    <div className="parameter-wrapper" key={id}>
                      <Select
                        className="parameters-list"
                        options={commandParameters}
                        onChange={(option) => option && this.setParameter(id, option.value, null)}
                      />

                      <input
                        className="parameter-value"
                        type="text"
                        value={value ?? ''}
                        onChange={({ target: { value } }) => {
                          this.setParameter(id, null, value)
                        }}
                      />

                      <div className="remove-icon" onClick={() => this.deleteParameter(id)}></div>
                    </div>
                  )
                })}
            </div>

            <div className="add-btn-wrapper">
              <button type="button" className="add-btn" onClick={this.addParameter}>
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="buttons-bar dialog-footer">
            <button
              className="btn-remove"
              onClick={() => {
                this.setState({ command: INIT_COMMAND })

                this.props.setCommand(Actions.Delete, this.state.command)
                this.props.toggleCommandConfigModal(false)
              }}
            >
              <span>Remove</span>
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                this.setState({ command: INIT_COMMAND })
                this.props.toggleCommandConfigModal(false)
              }}
            >
              <span>Cancel</span>
            </button>
            <button
              className="btn-save"
              onClick={() => {
                this.setState({ command: INIT_COMMAND })

                this.props.setCommand(Actions.Update, this.state.command)
                this.props.toggleCommandConfigModal(false)
              }}
            >
              <span>Save</span>
            </button>
          </div>

          <div className="modal" style={{ display: 'none' }}>
            <div
              id="formulaBar"
              spellCheck="false"
              style={{ border: '1px solid #808080', width: '100%', height: '86%' }}
            ></div>
          </div>
        </div>
      </Dialog>
    ) : null
  }
}

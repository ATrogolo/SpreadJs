import * as React from 'react'
import * as GC from '@grapecity/spread-sheets'
import { SpreadSheets, Worksheet } from '@grapecity/spread-sheets-react'

import '@grapecity/spread-sheets-designer-resources-en'
import { Designer } from '@grapecity/spread-sheets-designer-react'
import '@grapecity/spread-sheets-designer/styles/gc.spread.sheets.designer.min.css'
import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013white.css'

import './App.css'
import { Modal } from './Modal'
import { Command, ModalCommandConfigurator, Parameter } from './ModalCommandConfigurator'
import Dialog from '@material-ui/core/Dialog'
import { DraggableComponent } from './DraggableComponent'

import AddComputedColumnModal, { AddComputedColumn } from './AddComputedColumnModal'
import { addMoreRoom, getBoundedTable, getIrionConfigIndex } from './utils'
import { schema } from './schema'
import { getOrders } from './orders'

// GC.Spread.Sheets.LicenseKey =
//   'GrapeCity-Internal-Use-Only,362369852286222#B0vRARPV5NrR6LUhmN8YGe4k5LhlkbhJWaZVkSmBjellXUF5URz46a4N6RhhDNadjW7c6d4VES7MURnlHVXd5V7gnVwA7YxIkeYNXMwxGdqVzUlhVMzIUWxdXTwgTUJZlNvImdBJ4SW5GTExEezhVOOxWb7R7VKF7TaFnWYJ4L6c7NoN4RRNGSXVEaKJDTFVTYCNmMKNlUZNFMjNzSxgHRwhTMwQ4QsRVWlFTMjFmdUZjYyUXZRR6bXV6RBt6NDBHV8Z5drdWZtRUbCJHeZRFO8F6R5AzM4ljSXNjQ9gTMqBHah5UTKZWT6h6YihXU8Q6V7ckI0IyUiwiIyUUNzAjQwcjI0ICSiwCN9EzM9kjM4YTM0IicfJye#4Xfd5nIFVUSWJiOiMkIsICNx8idgAyUKBCZhVmcwNlI0IiTis7W0ICZyBlIsISM4ETNyADIxAjMxAjMwIjI0ICdyNkIsIybp9ie4lGbit6YhR7cuoCLt36YukHdpNWZwFmcn9iKiojIz5GRiwiI9RXaDVGchJ7RiojIh94QiwiIyIjM6gjMyUDO9YzMyYzMiojIklkIs4XZzxWYmpjIyNHZisnOiwmbBJye0ICRiwiI34TQQFUM6NlUvFjQ6J5dRJzbk3Ca4U6N8c5MxNmQ5JFRW3EWJxEayhFZ4FncPJndZRUahRzcFdnZGZUOpRGeSRVWiplUy8EWh9kV8gjTip5bNpkSSFGWvcVMYVTURlHcHVXMwJjU' as any
// ;(GC.Spread.Sheets as any).Designer.LicenseKey =
//   'GrapeCity-Internal-Use-Only,118434355471155#B0u5f7hlbHVHc8NjbktydGlVdsp5KYJ6Tw36M7gVcOJGO5QXOYBXMFdmUwxmU6VVZkJTeUxEW7p7TmF7Z9JFZhR5dDJHNoJWV5hFdwYUOpZzYiF6YRlkcaJ7MPdjRXJURr56Nr84cwYWaWZTMEBjbGJ6Uk9mY5FUQS5EWVp7Z4EDOFZUeUJ7SIp6STZ7UjRHaMVmTCdzSjpWeBJXQa54MohWOzolbSFHOtFTZVBHcLRTSo5UYipFU7NzQXJ7LD9GSzQ6bz24Lnplba3UclVDczJ6SzZjYnRnR49GV7ZVYNpkRrkXZRhkd6IFZNFlI0IyUiwiIGBTOEZUNyUjI0ICSiwCMxcDM6AjNxQTM0IicfJye&Qf35VfiklNFdjI0IyQiwiI4EjL6Bicl96ZpNXZE5yUKRWYlJHcTJiOi8kI1tlOiQmcQJCLiUTNzIzNwAyNwITMwIDMyIiOiQncDJCLi2WauoHdpxmYrNWY4NnLqwSbvNmL9RXajVGchJ7ZuoiI0IyctRkIsISe4l6QlBXYydkI0ISYONkIsISN5ETM7QTN5MDNzQDOxEjI0ICZJJye0ICRiwiI34TQwYDeJlUeHhEa9okZQhmaZ94UVdGUhNGe5UEeUVUWVVDU5o4N5ADNrkUOxN5NvQ5NBRFOGF4RjhlcVVmaTRUeVlnTVlGaQRER844RsVEO9AjbFJnSx8EMxQ5KZdlUNNXQtNEak3SVlrDbM' as any

enum ResizeMode {
  Cells = 0,
  Rows = 1,
}

interface AppState {
  show: boolean
  isAddComputedColumnOpen: boolean
  isCommandConfigOpen: boolean
  editComputedColumn: { isOpen: boolean; tableName: string; computedColumn: ComputedColumn | null }
  tableConfig: IrionConfig | null
  resizeMode: ResizeMode
  commandConfig: CommandConfig | null
}

export interface IrionConfig {
  tableName: string
  row: number
  col: number
  sheet: string
  dataSource: string
  computedColumns: ComputedColumn[]
}

export interface CommandConfig {
  id: number
  name: string
  parameters: Parameter[]
}

interface ComputedColumn {
  id: number
  name: string
  formula: string
  index: number
}

export enum Actions {
  Add = 0,
  Update = 1,
  Delete = 2,
}

interface Config {
  spreadJs: { [key: string]: any }
  irionConfig: IrionConfig[]
}

type ICellRangeExtended = GC.Spread.Sheets.CellRange & { id: number }

const DEBUG = true
const SERVER_URL = 'https://jsonplaceholder.typicode.com'
const POSTS_SOURCE = 'Posts'
const USERS_SOURCE = 'Users'
const TODOS_SOURCE = 'Todos'
const COMMENTS_SOURCE = 'Comments'
const DELAY = 2000
const DATASOURCES = [POSTS_SOURCE, USERS_SOURCE, TODOS_SOURCE, COMMENTS_SOURCE]
const WITH_BINDING = 'With Bindings'
const WITHOUT_BINDING = 'Without Bindings'
const EXPORT_MODE = [WITH_BINDING, WITHOUT_BINDING]
const START_PERFORMANCE_TEST = false
const PERF_ROWS = 1000
const PERF_COLS = 14

const INIT_EDIT_COMPUTEDCOL = { isOpen: false, tableName: '', computedColumn: null }

class App extends React.Component<{}, AppState> {
  hostStyle: any
  wb1: GC.Spread.Sheets.Workbook | undefined
  wb2: GC.Spread.Sheets.Workbook | undefined
  ribbonConfig: any
  irionConfig: IrionConfig[] = []
  fbx: any

  constructor(props: {}) {
    super(props)
    this.hostStyle = {
      width: '100%',
      height: (window.innerHeight - 80) / 2,
    }

    this.state = {
      show: false,
      isAddComputedColumnOpen: false,
      isCommandConfigOpen: false,
      resizeMode: ResizeMode.Rows,
      editComputedColumn: INIT_EDIT_COMPUTEDCOL,
      tableConfig: null,
      commandConfig: null,
    }

    this.ribbonConfig = this.getRibbonConfig()
    this.fbx = null
  }

  showModal = () => {
    this.setState({ show: true })
  }

  hideModal = () => {
    this.setState({ show: false })
    this.getRibbonTablesDropdown()
  }

  getSelectedRangeFormula(e: any) {
    const a = document.getElementById('formulaBar')!
    a.textContent = this.fbx.text()
  }

  render() {
    const { isAddComputedColumnOpen, isCommandConfigOpen, editComputedColumn, resizeMode, commandConfig } = this.state

    return (
      <>
        <ModalCommandConfigurator
          isOpen={isCommandConfigOpen}
          toggleCommandConfigModal={this.toggleCommandConfigModal}
          schema={schema}
          commandConfig={commandConfig}
          setCommand={this.setCommand}
        ></ModalCommandConfigurator>

        {/* Add New Computed Column Dialog */}
        <AddComputedColumnModal
          isOpen={isAddComputedColumnOpen}
          workbook={this.wb1}
          addComputedColumn={this.addComputedColumn}
          toggleAddComputedModal={this.toggleAddComputedModal}
        />

        {/* Edit Computed Column Dialog */}
        {editComputedColumn.isOpen && editComputedColumn.computedColumn && (
          <Dialog open={editComputedColumn.isOpen} PaperComponent={DraggableComponent} disableBackdropClick={false}>
            <div className="gc-sjsdesigner-dialog gc-designer-root en custom">
              <div id="dialog-titlebar" className="dialog-titlebar">
                <span className="dialog-titlebar-title">Edit column</span>
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
                                value={editComputedColumn.computedColumn.name}
                                onChange={({ target: { value } }) => {
                                  if (editComputedColumn.computedColumn) {
                                    const computedColumn = {
                                      ...editComputedColumn.computedColumn,
                                      name: value,
                                    }

                                    this.setState({
                                      editComputedColumn: {
                                        ...this.state.editComputedColumn,
                                        computedColumn,
                                      },
                                    })
                                  }
                                }}
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
                                value={editComputedColumn.computedColumn.formula}
                                onChange={({ target: { value } }) => {
                                  if (editComputedColumn.computedColumn) {
                                    const computedColumn = {
                                      ...editComputedColumn.computedColumn,
                                      formula: value,
                                    }

                                    this.setState({
                                      editComputedColumn: {
                                        ...this.state.editComputedColumn,
                                        computedColumn,
                                      },
                                    })
                                  }
                                }}
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
                  className="gc-ui-button remove"
                  onClick={() => {
                    const activeSheet = this.wb1?.getActiveSheet()
                    const { tableName, computedColumn } = this.state.editComputedColumn

                    if (!activeSheet) {
                      return
                    }

                    if (!tableName || !computedColumn) {
                      return
                    }

                    const tableConfig = this.irionConfig.find((config) => config.tableName === tableName)

                    if (tableConfig) {
                      const { dataSource, row, col, tableName } = tableConfig

                      const computedCol = tableConfig?.computedColumns.find(
                        (computedCol) => computedCol.id === computedColumn.id
                      )

                      if (computedCol) {
                        this.updateComputedColumns(tableName, activeSheet.name(), Actions.Delete, computedColumn)

                        this.fetchData(dataSource).then((json) => {
                          this.setTable(json, dataSource, row, col, tableName, activeSheet)
                        })
                      }
                    }

                    this.setState({ editComputedColumn: INIT_EDIT_COMPUTEDCOL })
                  }}
                >
                  <span>Remove</span>
                </button>
                <button
                  type="button"
                  className="gc-ui-button"
                  onClick={() => this.setState({ editComputedColumn: INIT_EDIT_COMPUTEDCOL })}
                >
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  className="gc-ui-button"
                  onClick={() => {
                    const activeSheet = this.wb1?.getActiveSheet()
                    if (!activeSheet) {
                      return
                    }

                    const updatedComputedColumn = { ...this.state.editComputedColumn }
                    if (!updatedComputedColumn || !updatedComputedColumn.computedColumn) {
                      return
                    }

                    // Reset state
                    this.setState({ editComputedColumn: INIT_EDIT_COMPUTEDCOL })

                    const computedColumn = { ...updatedComputedColumn.computedColumn }

                    this.updateComputedColumns(
                      updatedComputedColumn.tableName,
                      activeSheet.name(),
                      Actions.Update,
                      computedColumn
                    )

                    const tableConfig = this.irionConfig.find(
                      (config) => config.tableName === updatedComputedColumn.tableName
                    )

                    if (tableConfig) {
                      const { dataSource, row, col, tableName } = tableConfig

                      this.fetchData(dataSource).then((json) => {
                        this.setTable(json, dataSource, row, col, tableName, activeSheet)
                      })
                    }
                  }}
                >
                  <span>OK</span>
                </button>
              </div>
            </div>
          </Dialog>
        )}
        <div className="toolbar">
          <button className="export-config" onClick={this.exportToWB2}>
            Export WB1 to WB2
          </button>
          <button
            className="resize-mode"
            onClick={() => {
              const nextResizeMode = resizeMode === ResizeMode.Cells ? ResizeMode.Rows : ResizeMode.Cells
              this.setState({ resizeMode: nextResizeMode })
            }}
          >
            Resize Table: {(resizeMode === ResizeMode.Cells && 'Cells') || 'Rows'}
          </button>
          {/* <button
                className="add-table"
                onClick={() => {
                  const sheet = this.wb1?.getActiveSheet()
                  if (sheet) {
                    this.fetchData(POSTS_SOURCE).then((json) => {
                      this.setTable(json, POSTS_SOURCE, 1, 1, 'table2', sheet, false, true)
                    })
                  }
                }}
              >
                Add table (15,1)
              </button> */}
          {/* </> */}
          {/* )} */}
        </div>
        <>
          <Designer
            styleInfo={{ width: '100%', height: '65vh' }}
            designerInitialized={(designer: any) => this.initSpread1(designer.getWorkbook())}
            config={this.ribbonConfig}
          ></Designer>

          <div id="statusBar"></div>

          <hr />

          <SpreadSheets
            hostStyle={this.hostStyle}
            name="WB2"
            workbookInitialized={(workBook) => this.initSpread2(workBook)}
          ></SpreadSheets>
          <button className="export-config" onClick={() => this.exportJson(this.wb2)}>
            Export WB2 jsonConfig
          </button>
        </>
        {/* )} */}
        <Modal show={this.state.show} onClose={this.hideModal}>
          <p>Modal</p>
        </Modal>
      </>
    )
  }

  initSpread1(workBook: GC.Spread.Sheets.Workbook) {
    this.wb1 = workBook
    const sheet = workBook.getActiveSheet()

    // Bind events
    this.bindEvents(this.wb1, sheet)

    // DEBUG
    if (DEBUG) {
      if (sheet) {
        const row = sheet.getActiveRowIndex()
        const col = sheet.getActiveColumnIndex()
        this.wb1.suspendPaint()
        const tableUniqueName = POSTS_SOURCE + '_' + new Date().getTime()
        this.fetchData(POSTS_SOURCE).then((json) => {
          this.setTable(json, POSTS_SOURCE, row, col, tableUniqueName, sheet)
          this.updateIrionConfig(tableUniqueName, row, col, sheet.name(), POSTS_SOURCE)
          const table = sheet.tables.findByName(tableUniqueName)
          if (table) {
            const columnIndex = 1,
              computedColumnIndex = columnIndex + 1
            const columnName = 'A'
            const formula = '=[id]+100'
            table.insertColumns(columnIndex, 1, true)
            table.setColumnName(computedColumnIndex, columnName)
            table.setColumnDataFormula(computedColumnIndex, formula)
            // Update IrionConfig
            const id = new Date().getTime()
            const computedColumn: ComputedColumn = {
              id,
              index: computedColumnIndex,
              name: columnName,
              formula: formula,
            }
            this.updateComputedColumns(tableUniqueName, sheet.name(), Actions.Add, computedColumn)
            this.wb1?.resumePaint()
          }
        })
        this.insertButtons(sheet)
      }
    }

    if (START_PERFORMANCE_TEST) {
      this.startPerformanceTests()
    }
    // Status Bar
    // workBook.suspendPaint()
    // const statusBarElement = document.getElementById('statusBar')
    // if (statusBarElement) {
    //   const statusBar = new GC.Spread.Sheets.StatusBar.StatusBar(statusBarElement)
    //   statusBar.bind(workBook)
    // }
    // workBook.resumePaint()

    // //Setting Values - DateTime
    // sheet
    //   .getCell(shiftRow + 4, 2)
    //   .value(new Date(2020, 10, 7))
    //   .formatter('mm-dd-yyyy')
    // //Setting style
    // sheet.setColumnWidth(1, 200)
    // sheet.setColumnWidth(2, 200)
    // sheet
    //   .getRange(shiftRow + 1, 1, 1, 2)
    //   .backColor('rgb(130, 188, 0)')
    //   .foreColor('rgb(255, 255, 255)')

    // sheet.getRange(shiftRow + 3, 1, 1, 2).backColor('rgb(211, 211, 211)')

    // this.fetchData(USERS_SOURCE).then((json) => {
    //   this.setTable(json, USERS_SOURCE, 10, 1, 'table1', sheet, false, true)
    // })

    workBook.resumePaint()
  }

  initSpread2(workBook: GC.Spread.Sheets.Workbook) {
    this.wb2 = workBook
  }

  exportJson(workbook?: GC.Spread.Sheets.Workbook) {
    const serializationOption = {}
    const json = workbook?.toJSON(serializationOption)

    const exportConfig: Config = { spreadJs: { ...json }, irionConfig: [] }
    console.log('json', exportConfig)
  }

  exportConfig = (workbook?: GC.Spread.Sheets.Workbook, withBindings: boolean = true): Config => {
    const serializationOption = {
      // includeBindingSource: true, // include binding source when converting the workbook to json, default value is false
      // ignoreStyle: false, // ignore styles when converting workbook to json, default value is false
      // ignoreFormula: true, // ignore formulas when converting workbook to json, default value is false
      // saveAsView: true, //include the format string formatting result when converting workbook to json, default value is false
      // rowHeadersAsFrozenColumns: true, // treat row headers as frozen columns when converting workbook to json, default value is false
      // columnHeadersAsFrozenRows: true, // treat column headers as frozen rows when converting workbook to json, default value is false
      // includeAutoMergedCells: true, // include the automatically merged cells to the real merged cells when converting the workbook to json.
    }

    // WB1 configuration stringified
    const json = workbook?.toJSON(serializationOption)
    const irionConfig = withBindings ? [...this.irionConfig] : []

    const exportConfig: Config = { spreadJs: { ...json }, irionConfig: irionConfig }
    console.log('json', exportConfig)

    return exportConfig
  }

  exportToWB2 = () => {
    // Get config from WB1 and export it to WB2
    const config = this.exportConfig(this.wb1)

    const jsonOptions = {
      // ignoreFormula: true, // ignore styles when converting json to workbook, default value is false
      // ignoreStyle: true, // ignore the formulas when converting json to workbook, default value is false
      // frozenColumnsAsRowHeaders: true, // treat the frozen columns as row headers when converting json to workbook, default value is false
      // frozenRowsAsColumnHeaders: true, // treat the frozen rows as column headers when converting json to workbook, default value is false
      // doNotRecalculateAfterLoad: true, //  disable recalculation after loading the json, default value is false
      incrementalLoading: true,
      // incrementalLoading: {
      //   loading: function (progress: number) {
      //     console.log('progress', progress)
      //   },
      //   loaded: function () {
      //     console.log('Done')
      //   },
      // },
    }

    // FromJson
    // this.wb2?.fromJSON(JSON.parse(jsonStr))
    this.wb2?.fromJSON(JSON.parse(JSON.stringify(config.spreadJs)), jsonOptions)

    setTimeout(() => {
      const promises: Promise<any>[] = []
      this.irionConfig.forEach((tableConfig) => {
        const { dataSource } = tableConfig

        promises.push(this.fetchData(dataSource))
      })

      Promise.all(promises).then((results: any[]) => {
        // Insert (import) table
        results.forEach((json: any[], index) => {
          const { sheet: sheetName, row, col, dataSource, tableName } = this.irionConfig[index]

          const sheet: GC.Spread.Sheets.Worksheet =
            this.wb2?.getSheetFromName(sheetName) ??
            this.wb2?.addSheetTab(0, sheetName, GC.Spread.Sheets.SheetType.tableSheet)

          this.setTable(json, dataSource, row, col, tableName, sheet, true)
        })
      })
    }, DELAY)
  }

  setTable = (
    json: any[],
    dataSource: string,
    row: number,
    col: number,
    tableName: string,
    currentSheet: GC.Spread.Sheets.Worksheet,
    tweakData: boolean = false
  ) => {
    const sheet = currentSheet ?? this.wb1?.getActiveSheet()

    if (sheet) {
      this.wb1?.suspendPaint()
      this.wb2?.suspendPaint()

      let data = dataSource === POSTS_SOURCE || dataSource === COMMENTS_SOURCE ? json.slice(0, 2) : json

      if (tweakData) {
        data = this.tweakData(data, dataSource)
      }

      const rowNumber = data.length
      const columnNames = Object.keys(data[0])
      const columnNumber = columnNames.length

      // Add more rows / columns if there's no enough room
      addMoreRoom(sheet, row, rowNumber, col, columnNumber)

      let table = sheet.tables.findByName(tableName)
      if (table == null) {
        table = sheet.tables.add(tableName, row, col, rowNumber, columnNumber)

        console.log('Sto inserendo la tabella ', tableName)
      } else {
        console.warn(
          'La tabella è già definita nel foglio. Probabilmente è stata importata una configurazione precedente'
        )
      }

      const columns: any[] = []
      columnNames.forEach((columnName, index) => {
        const column = new GC.Spread.Sheets.Tables.TableColumn(index, columnName)

        columns.push(column)
      })

      table.autoGenerateColumns(true) // nonsense but it works when removing columns

      let throwsError = false
      try {
        table.bind(columns, '', data)
        table.bind(columns, '', data)
        // do it again for bug
        // #6. Thanks for the sample this looks like bug to me hence we have escalated this issue to the concerned team for further investigation.
        // Till then as a workaround you may call the bind method twice that should solve the issue.
        // Please refer to the following update sample and let us know if you face any issues. sample: https://codesandbox.io/s/blue-fast-qb68d?file=/src/index.js
      } catch (error) {
        console.error(error)

        throwsError = true
        if (this.state.resizeMode === ResizeMode.Rows) {
          this.resizeTable(sheet, table, rowNumber, columnNumber)

          table.bind(columns, '', data)
          table.bind(columns, '', data)

          throwsError = false
        }
      } finally {
        if (throwsError === false) {
          // Add computed columns
          const tableConfig = this.irionConfig.find((config) => {
            return config.tableName === tableName
          })

          if (tableConfig && tableConfig.computedColumns.length > 0) {
            const tableSize = table.range().colCount

            tableConfig.computedColumns.forEach((computedCol) => {
              const { name: columnName, formula } = computedCol
              let { index } = computedCol

              // If the computed column has an index greater than the table size,
              // the computed column will be set at the end of the table.
              if (index > tableSize) {
                index = tableSize
              }

              table.insertColumns(index - 1, 1, true)
              table.setColumnName(index, columnName)
              table.setColumnDataFormula(index, formula)
            })
          }

          // this.fitColumns(sheet, col, columnNumber)
          // this.resizeColumns(sheet, col, columnNumber)
        }

        this.wb1?.resumePaint()
        this.wb2?.resumePaint()
      }
    }
  }

  resizeTable = (
    sheet: GC.Spread.Sheets.Worksheet,
    table: GC.Spread.Sheets.Tables.Table,
    rowNumber: number,
    columnNumber: number
  ) => {
    const currentRange = table.range()
    const { row, rowCount, col, colCount } = currentRange

    // Add rows
    const lastRowIndex = row + rowCount
    const rowsToAdd = rowNumber - (rowCount - 1) // rowCount counts header too
    if (rowsToAdd > 0) {
      sheet.addRows(lastRowIndex, rowsToAdd)
    }

    // Add columns
    let colsToAdd = 0
    const configIndex = getIrionConfigIndex(this.irionConfig, sheet.name(), table.name())
    if (configIndex > -1) {
      const computedColumnsNumber = this.irionConfig[configIndex].computedColumns.length

      const lastColIndex = col + colCount
      colsToAdd = columnNumber - (colCount - computedColumnsNumber)
      if (colsToAdd > 0) {
        sheet.addColumns(lastColIndex, colsToAdd)
      }
    }

    sheet.tables.resize(table.name(), new GC.Spread.Sheets.Range(row, col, rowCount + rowsToAdd, colCount + colsToAdd))
  }

  fetchData = (dataMember: string) => {
    return fetch(`${SERVER_URL}/${dataMember}`).then((response) => response.json())
  }

  updateIrionConfig = (tableName: string, row: number, col: number, sheet: string, dataSource: string) => {
    const configIndex = getIrionConfigIndex(this.irionConfig, sheet, tableName)

    const tableConfig: IrionConfig = {
      tableName,
      row,
      col,
      sheet,
      dataSource,
      computedColumns: [],
    }

    if (configIndex !== -1) {
      this.irionConfig[configIndex] = tableConfig
    } else {
      this.irionConfig.push(tableConfig)
    }
  }

  updateComputedColumns = (tableName: string, sheet: string, action: Actions, computedColumn: ComputedColumn) => {
    const configIndex = getIrionConfigIndex(this.irionConfig, sheet, tableName)
    if (configIndex === -1) {
      return
    }

    const { computedColumns } = this.irionConfig[configIndex]
    const computedColIndex = computedColumns.findIndex((computedCol) => computedCol.id === computedColumn.id)

    switch (action) {
      case Actions.Add:
        this.irionConfig[configIndex].computedColumns = [...computedColumns, computedColumn]
        break
      case Actions.Update:
        if (computedColIndex > -1) {
          this.irionConfig[configIndex].computedColumns.splice(computedColIndex, 1, computedColumn)
        }
        break
      case Actions.Delete:
        if (computedColIndex > -1) {
          this.irionConfig[configIndex].computedColumns.splice(computedColIndex, 1)
        }
        break
    }
  }

  resizeColumns = (sheet: GC.Spread.Sheets.Worksheet, startingColumn: number, columnCount: number) => {
    // Resize table columns
    const lastColumn = startingColumn + columnCount
    for (let col = startingColumn; col < lastColumn; col++) {
      sheet.autoFitColumn(col)
    }
  }

  fitColumns = (sheet: GC.Spread.Sheets.Worksheet, startingColumn: number, columnCount: number) => {
    // Set number of columns of the sheet to proportionally size them
    sheet.setColumnCount(columnCount)

    // Fit table columns
    const lastColumn = startingColumn + columnCount
    for (let col = startingColumn; col < lastColumn; col++) {
      sheet.setColumnWidth(col, '*')
    }
  }

  tweakData = (data: any[], dataSource: string) => {
    // let _id = 0
    // data = data.map((row) => {
    //   // Remove columns
    //   // if (dataSource === POSTS_SOURCE) {
    //   //   const { title, body, ...slice } = row
    //   //   return slice
    //   // } else if (dataSource === USERS_SOURCE) {
    //   //   const { username, email, ...slice } = row
    //   //   return slice
    //   // }
    //   // Add columns
    //   _id++
    //   if (dataSource === POSTS_SOURCE) {
    //     const { userId, id, title, body } = row
    //     return { userId, id, unId: _id, unaStringa: 'aa ' + row.id, title, body }
    //   } else if (dataSource === USERS_SOURCE) {
    //     const { id, name, username, email, address, phone, website, company } = row
    //     return {
    //       id,
    //       name,
    //       unId: _id,
    //       unaStringa: `aa ${_id}`,
    //       username,
    //       email,
    //       address,
    //       phone,
    //       website,
    //       company,
    //     }
    //   }
    //   return row
    // })

    // const size = 2
    // for (let i = 0; i < size; i++) {
    //   // if (dataSource === USERS_SOURCE) {
    //   //   return data.slice(0, 5)
    //   //   //   data.push({
    //   //   //     id: i + 50,
    //   //   //     name: 'Carmine',
    //   //   //     username: 'Car',
    //   //   //     email: 'asd@asd.it',
    //   //   //   })
    //   //   // } else
    //   if (dataSource === POSTS_SOURCE) {
    //     // return data.slice(0, 1)
    //     data.push({
    //       userId: i + 50,
    //       id: i + 50,
    //       title: 'qui est esse',
    //       body: 'qui est esse',
    //     })
    //   }
    // }

    return data
  }

  insertButtons = (sheet: GC.Spread.Sheets.Worksheet) => {
    let id1 = new Date().getTime()
    const row = 4 //sheet.getActiveRowIndex()
    const col = 6 //sheet.getActiveColumnIndex()

    const cellType: any = new GC.Spread.Sheets.CellTypes.Button()
    cellType.buttonBackColor('#FFFF00')
    cellType.text('Button')
    cellType.id = id1

    // Insert cellType
    const cell = sheet.getCell(row, col) as ICellRangeExtended
    // cell.tag(id1)
    cell.cellType(cellType)

    // Insert cellStyle
    // let id2 = new Date().getTime()
    // const dropdownStylefunction = new GC.Spread.Sheets.Style()
    // dropdownStylefunction.cellButtons = [
    //   {
    //     buttonBackColor: '#94cefd',
    //     caption: 'CellStyle Button',
    //     id: id2,
    //     // captionAlign: GC.Spread.Sheets.CaptionAlignment.left,
    //     // enabled: true,
    //     // hoverBackColor: '#FF0000',
    //     position: GC.Spread.Sheets.ButtonPosition.left,
    //     useButtonStyle: true,
    //     // visibility: GC.Spread.Sheets.ButtonVisibility.always,
    //     width: 125,
    //     // imageType: GC.Spread.Sheets.ButtonImageType.none,
    //     command: (sheet: GC.Spread.Sheets.Worksheet, row: number, col: number, option: any) => {
    //       const cellButton: ICellButtonExtended = sheet.getCell(row, col).cellButtons()?.[0]
    //       console.log('ButtonClicked', cellButton.id)

    //       // Get Command from IrionConfig and trigger it
    //     },
    //   },
    // ] as ICellButtonExtended[]

    // sheet.setStyle(row, col + 1, dropdownStylefunction)

    // this.resizeColumns(sheet, col, 2)
  }

  toggleCommandConfigModal = (isOpen: boolean) => {
    this.setState({ isCommandConfigOpen: isOpen })
  }

  toggleAddComputedModal = (isOpen: boolean) => {
    this.setState({ isAddComputedColumnOpen: isOpen })
  }

  addComputedColumn = (activeSheet: GC.Spread.Sheets.Worksheet, newComputedColumn: AddComputedColumn) => {
    // open modal to set column's name & formula to replicate for each row of the table

    if (activeSheet) {
      const row = activeSheet.getActiveRowIndex()
      const col = activeSheet.getActiveColumnIndex()

      const table = activeSheet.tables.find(row, col)
      if (table == null) {
        console.warn('No table here')
        return
      }

      this.wb1?.suspendPaint()

      const tableRange = table.range()
      const { col: startingCol } = tableRange

      const columnIndex = col - startingCol
      const computedColumnIndex = columnIndex + 1

      // const firstColumnName = table.getColumnName(0)
      // const secondColumnName = table.getColumnName(1)

      const { name: columnName, formula, id } = newComputedColumn
      // const columnName = 'Formula'
      // const formula = `=[${firstColumnName}]+[${secondColumnName}]`

      if (columnName == null || formula == null) {
        console.warn('No columnName or formula provided')
        return
      }

      table.insertColumns(columnIndex, 1, true)
      table.setColumnName(computedColumnIndex, columnName)
      table.setColumnDataFormula(computedColumnIndex, formula)

      // Update IrionConfig
      const computedColumn: ComputedColumn = {
        id,
        index: computedColumnIndex,
        name: columnName,
        formula: formula,
      }

      this.updateComputedColumns(table.name(), activeSheet.name(), Actions.Add, computedColumn)
      this.wb1?.resumePaint()
    }
  }

  setCommand = (action: Actions, command: Command) => {
    const activeSheet = this.wb1?.getActiveSheet()
    if (activeSheet) {
      const row = activeSheet.getActiveRowIndex()
      const col = activeSheet.getActiveColumnIndex()
      const cellType = activeSheet.getCellType(row, col) as any

      const id = cellType.id ?? new Date().getTime()

      // Search command with provided "id"
      const index = -1

      if (index === -1) {
        // New
        if (action === Actions.Delete) {
          return
        }

        // Update IrionConfig
        // this.irionConfig.commands.push(command)
      } else {
        // Found
        // Update IrionConfig
        if (action === Actions.Delete) {
          // this.irionConfig.commands.splice(index, 1)
        } else {
          // this.irionConfig.commands.splice(index, 1, command)
        }
      }
    }
  }

  getRibbonConfig = () => {
    // config1.getCommand().cellType.subCommands.push("commandWindosButtonConfiguration")
    const config = (GC.Spread.Sheets as any).Designer.DefaultConfig

    config.commandMap = {
      saveData: {
        title: 'Save data to server',
        text: 'Save',
        iconClass: 'save-icon',
        bigButton: 'true',
        commandName: 'saveData',
        execute: async (context: any, propertyName: any, fontItalicChecked: any) => {
          const config = this.exportConfig(this.wb1)

          console.log('Save Action', config)
        },
      },
      addNewBinding: {
        bigButton: true,
        commandName: 'addNewBinding',
        iconClass: 'ribbon-button-table',
        subCommands: DATASOURCES,
        length: DATASOURCES.length,
        text: 'Add New',
        title: 'Add New',
        type: 'dropdown',
      },
      listExport: {
        bigButton: true,
        commandName: 'listExport',
        iconClass: 'icon-ssjson',
        subCommands: EXPORT_MODE,
        length: EXPORT_MODE.length,
        text: 'Export',
        title: 'Export',
        type: 'dropdown',
      },
      configCommand: {
        title: 'Config Button',
        text: 'Config Command',
        iconClass: 'ribbon-button-cellstates',
        bigButton: true,
        commandName: 'configCommand',
        useButtonStyle: true,
        execute: async (context: any, propertyName: any, fontItalicChecked: any) => {
          const activeSheet = context.Spread.getActiveSheet()
          const row = activeSheet.getActiveRowIndex()
          const col = activeSheet.getActiveColumnIndex()
          const cellType = activeSheet.getCellType(row, col) as any

          const isButtonCellType = cellType instanceof GC.Spread.Sheets.CellTypes.Button
          if (isButtonCellType) {
            const id = cellType.id
            if (id) {
              // Search button config in IrionConfig
            } else {
              // New button
              this.setState({
                commandConfig: null,
              })
            }
            this.toggleCommandConfigModal(true)

            // var fbx = new GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(document.getElementById('formulaBar')!, {
            //   rangeSelectMode: true,
            //   absoluteReference: false,
            // })

            // fbx.workbook(context.Spread)
            // this.fbx = fbx
          } else {
            window.alert('Please select a button')
          }
        },
      },
      editBinding: {
        title: 'Edit',
        text: 'Edit',
        iconClass: 'ribbon-button-sheetgeneral',
        bigButton: 'true',
        commandName: 'editBinding',
        execute: async (context: any, propertyName: any, fontItalicChecked: any) => {
          const activeSheet: GC.Spread.Sheets.Worksheet = context.Spread.getActiveSheet()
          const row = activeSheet.getActiveRowIndex()
          const col = activeSheet.getActiveColumnIndex()

          const table = activeSheet.tables.find(row, col)
          const isTable = table != null
          //oltre questo controllo, andrebbe poi successivamente fatto un check sul fatto che sia una tabella con binding
          if (isTable) {
            // Open modal and edit data
            this.showModal()
          } else {
            console.warn('La cella selezionata non appartiene ad una tabella!')
          }
        },
      },
      showBindings: {
        title: 'Show all',
        text: 'Show all',
        iconClass: 'ribbon-button-celltype',
        bigButton: 'true',
        commandName: 'showBindings',
        execute: async (context: any, propertyName: any, fontItalicChecked: any) => {
          //finestra con elenco tabelle inserite bindate
          this.showModal()
        },
      },
      addCompColumn: {
        title: 'Add',
        text: 'Add',
        iconClass: 'ribbon-button-table',
        bigButton: 'true',
        commandName: 'addCompColumn',
        execute: async (context: any, propertyName: any, fontItalicChecked: any) => {
          const activeSheet: GC.Spread.Sheets.Worksheet = context.Spread.getActiveSheet()

          const boundedTable = getBoundedTable(activeSheet, this.irionConfig)
          if (boundedTable) {
            this.toggleAddComputedModal(true)
          }
        },
      },
      editCompColumn: {
        title: 'Edit',
        text: 'Edit',
        iconClass: 'ribbon-button-sheetgeneral',
        bigButton: 'true',
        commandName: 'editCompColumn',
        execute: async (context: any, propertyName: any, fontItalicChecked: any) => {
          const activeSheet: GC.Spread.Sheets.Worksheet = context.Spread.getActiveSheet()
          const col = activeSheet.getActiveColumnIndex()

          const boundedTable = getBoundedTable(activeSheet, this.irionConfig)
          if (boundedTable) {
            const { table, tableConfig } = boundedTable

            const tableName = table.name()
            const currentColIndex = col - table.range().col
            const columnName = table.getColumnName(currentColIndex)

            const computedColumn = tableConfig?.computedColumns.find((computedCol) => {
              return computedCol.name === columnName
            })

            if (computedColumn) {
              // open modal
              this.setState({
                editComputedColumn: {
                  ...this.state.editComputedColumn,
                  isOpen: true,
                  tableName,
                  computedColumn: computedColumn ?? null,
                },
                // tableConfig: tableConfig ?? null,
              })
            }
          }
        },
      },
      resetIrionConfig: {
        title: 'Reset',
        text: 'Reset',
        iconClass: 'ribbon-button-clear-celltype',
        bigButton: 'true',
        commandName: 'resetIrionConfig',
        execute: async (context: any, propertyName: any, fontItalicChecked: any) => {
          this.irionConfig = []
        },
      },
    }

    config.contextMenu = [...config.contextMenu, 'configCommand']

    //genero la lista delle tabelle per il ribbon e relative azioni
    this.getRibbonTablesDropdown()

    //genero la lista del tipologie d'export per il ribbon e le relative azioni
    this.getRibbonExportDropdown()

    // this.prova()

    let exist = false
    config.ribbon.forEach((element: any) => {
      if (element.id === 'command') {
        exist = true
      }
    })

    if (!exist) {
      config.ribbon.push({
        buttonGroups: [],
        id: 'command',
        text: 'IRION',
      })
    }

    config.ribbon.forEach((element: any) => {
      var exist = false
      element.buttonGroups.forEach((element: any) => {
        if (element.label === 'Save Data') {
          exist = true
        }
      })
      if (!exist && element.id === 'command') {
        element.buttonGroups.push(
          {
            label: 'Save Data',
            // thumbnailClass: 'ribbon-thumbnail-save',
            commandGroup: {
              children: [
                {
                  direction: 'vertical',
                  commands: ['saveData'],
                },
              ],
            },
          },
          {
            label: 'Bindings',
            // thumbnailClass: 'ribbon-thumbnail-viewport',
            commandGroup: {
              children: [
                {
                  direction: 'horizontal',
                  commands: ['addNewBinding', 'editBinding', 'showBindings'],
                },
              ],
            },
          },
          {
            label: 'Clipboard',
            // thumbnailClass: 'ribbon-thumbnail-viewport',
            commandGroup: {
              children: [
                {
                  direction: 'vertical',
                  commands: ['listExport'],
                },
              ],
            },
          },
          {
            label: 'Config Command',
            // thumbnailClass: 'ribbon-thumbnail-save',
            commandGroup: {
              children: [
                {
                  direction: 'vertical',
                  commands: ['configCommand'],
                },
              ],
            },
          },
          {
            label: 'Computed Columns',
            // thumbnailClass: 'ribbon-thumbnail-save',
            commandGroup: {
              children: [
                {
                  direction: 'horizontal',
                  commands: ['addCompColumn', 'editCompColumn'],
                },
              ],
            },
          },
          {
            label: 'Debug',
            // thumbnailClass: 'ribbon-thumbnail-save',
            commandGroup: {
              children: [
                {
                  direction: 'horizontal',
                  commands: ['resetIrionConfig'],
                },
              ],
            },
          }
        )
      }
    })

    return config
  }

  getRibbonExportDropdown() {
    EXPORT_MODE.forEach((exportName) => {
      const config = (GC.Spread.Sheets as any).Designer.DefaultConfig

      //creo con la formattazione richiesta, un command per il click sul nome tabella
      const value = {
        [exportName]: {
          title: exportName,
          text: exportName,
          iconClass: 'icon-ssjson',
          bigButton: false,
          commandName: exportName,
          execute: async (context: any, propertyName: any, fontItalicChecked: any) => {
            const exportBindings = exportName === WITH_BINDING

            const config = this.exportConfig(context.Spread, exportBindings)
            navigator.clipboard.writeText(JSON.stringify(config))
          },
        },
      }

      config.commandMap = { ...config.commandMap, ...value }
    })
  }

  getRibbonTablesDropdown() {
    DATASOURCES.forEach((dataSource) => {
      const config = (GC.Spread.Sheets as any).Designer.DefaultConfig

      //creo con la formattazione richiesta, un command per il click sul nome tabella
      const value = {
        [dataSource]: {
          title: dataSource,
          text: dataSource,
          iconClass: 'ribbon-button-table',
          bigButton: false,
          commandName: dataSource,
          execute: async (context: any, propertyName: any, fontItalicChecked: any) => {
            const sheet = context.Spread.getActiveSheet()

            if (sheet) {
              const row = sheet.getActiveRowIndex()
              const col = sheet.getActiveColumnIndex()
              // this.showModal()
              const tableUniqueName = dataSource + '_' + new Date().getTime()
              this.fetchData(dataSource).then((json) => {
                this.setTable(json, dataSource, row, col, tableUniqueName, sheet)
                this.updateIrionConfig(tableUniqueName, row, col, sheet.name(), dataSource)
              })
            }
          },
        },
      }

      config.commandMap = { ...config.commandMap, ...value }
    })
  }

  bindEvents = (workBook: GC.Spread.Sheets.Workbook, sheet: GC.Spread.Sheets.Worksheet) => {
    workBook.bind(
      GC.Spread.Sheets.Events.ButtonClicked,
      (sender: any, args: GC.Spread.Sheets.IButtonClickedEventArgs) => {
        const { sheet, row, col } = args

        const cellType = sheet.getCellType(row, col)
        if (cellType instanceof GC.Spread.Sheets.CellTypes.Button) {
          //   this.showModalConfigurator()

          const cell = sheet.getCellType(row, col)
          const { id } = cell as any
          console.log('ButtonClicked', id)

          if (cellType instanceof GC.Spread.Sheets.CellTypes.Button) {
            //se esiste una configurazione per quell'id esegui il command
            //altrimenti nulla default
          }
          // Get Command from IrionConfig and trigger it
        }
      }
    )

    workBook.bind(GC.Spread.Sheets.Events.CellChanged, (sender: any, args: GC.Spread.Sheets.ICellChangedEventArgs) => {
      const { oldValue, newValue, propertyName } = args

      if (propertyName === '[styleinfo]') {
        if (oldValue?.cellType && !newValue?.cellType) {
          console.log('cellType Cleared')
        }
      }
    })

    sheet.bind(
      GC.Spread.Sheets.Events.TableRowsChanged,
      function (
        sheet: Worksheet,
        table: string,
        propertyName: string,
        row: number,
        count: number,
        isAfter: boolean,
        deletedItem: undefined
      ) {
        console.log('TableRowsChanged')
      }
    )

    // sheet.bind(GC.Spread.Sheets.Events.EditEnded, (sender: any, args: GC.Spread.Sheets.IEditEndedEventArgs) => {
    //   const { row, col } = args
    //   console.log('Cell (' + row + ', ' + col + ') data has been changed.')

    //   const table = sheet.tables.find(row, col)
    //   if (table) {
    //     const tableName = table.name()
    //     const index = this.irionConfig.findIndex((item) => item.tableName === tableName && item.sheet === sheet.name())

    //     if (index !== -1) {
    //       // Found
    //       const { dataSource } = this.irionConfig[index]

    //       const rowsChanged = table.getDirtyRows() ?? []
    //       const rowChanged = rowsChanged.slice(-1)?.[0]?.item
    //       const key = rowChanged['id'] // Read primary key from layout config

    //       // Update rowChanged to the Model
    //       fetch(`${SERVER_URL}/${dataSource}/${key}`, {
    //         method: 'PATCH',
    //         body: JSON.stringify(rowChanged),
    //         headers: {
    //           'Content-type': 'application/json; charset=UTF-8',
    //         },
    //       })
    //     }
    //   }
    // })

    sheet.bind(
      GC.Spread.Sheets.Events.ClipboardChanged,
      function (sender: any, args: GC.Spread.Sheets.IClipboardChangedEventArgs) {
        const { sheet, sheetName, copyData } = args
        console.log('ClipboardChanged', sheet, sheetName, copyData)

        const isATable = copyData.html?.startsWith('<table>')
        if (isATable) {
          console.log('%cCopying a table!', 'color: orange; font-size: 14px;')
        }
      }
    )

    sheet.bind(
      GC.Spread.Sheets.Events.ClipboardPasting,
      function (sender: any, args: GC.Spread.Sheets.IClipboardPastingEventArgs) {
        const { sheet, sheetName, cellRange, pasteOption } = args
        console.log('ClipboardPasting', sheet, sheetName, cellRange, pasteOption)
      }
    )

    sheet.bind(
      GC.Spread.Sheets.Events.DragDropBlockCompleted,
      function (sender: any, args: GC.Spread.Sheets.IDragDropBlockCompletedEventArgs) {
        const { fromRow, fromCol, toRow, toCol } = args
        console.log('DragDropBlockCompleted', fromRow, fromCol, '->', toRow, toCol)

        const table = sheet.tables.find(toRow, toCol)
        const isATable = table != null
        if (isATable) {
          console.log('%cTable: ', 'color: orange; font-size: 14px;', table)
        }
      }
    )

    sheet.bind(
      GC.Spread.Sheets.Events.InvalidOperation,
      function (sender: any, args: GC.Spread.Sheets.IInvalidOperationEventArgs) {
        const { sheet, sheetName, message } = args
        console.error('InvalidOperation', sheet, sheetName, message)
      }
    )
  }

  /* Performance test to insert multiple table in a single shot measuring performance */
  startPerformanceTests = () => {
    const sheet = this.wb1?.getActiveSheet()
    if (sheet) {
      this.performanceTest(sheet, 0, 0, 50000, undefined)
      this.performanceTest(sheet, 0, 15, 5, 3)
    }

    this.wb1?.addSheet(1, new GC.Spread.Sheets.Worksheet('PerfSheet'))

    const perfSheet = this.wb1?.getSheetFromName('PerfSheet')
    if (perfSheet) {
      this.performanceTest(perfSheet, 0, 0, 50000, undefined)
      this.performanceTest(perfSheet, 0, 15, 5, 3)
    }
  }

  performanceTest = (sheet: GC.Spread.Sheets.Worksheet, row: number, col: number, rows?: number, cols?: number) => {
    const data = this.sizeOrdersTable(rows, cols)

    if (sheet) {
      const t0 = performance.now()
      const tableUniqueName = 'Orders_' + new Date().getTime()
      this.setTable(data, '', row, col, tableUniqueName, sheet)
      const t1 = performance.now()

      console.log('%cTime spent to insert data: ' + Math.floor(t1 - t0) / PERF_ROWS + ' sec', 'color: orange')
    }
  }

  sizeOrdersTable = (rows?: number, cols?: number) => {
    let data = getOrders()

    if (rows && rows < PERF_ROWS) {
      data = data.slice(0, rows)
    }
    if (cols && cols < PERF_COLS) {
      data = data.map((row: any) => {
        const keys = Object.keys(row)

        let key
        for (let i = cols; i < PERF_COLS; i++) {
          key = keys[i]
          delete row[key]
        }

        return row
      })
    }

    if (rows && rows > PERF_ROWS) {
      for (let i = PERF_ROWS; i < rows; i++) {
        // Add new row
        const randomIndex = Math.floor(Math.random() * PERF_ROWS)

        const newItem = { ...data[randomIndex], id: i }
        data.push(newItem)
      }
    }
    if (cols && cols > PERF_COLS) {
      data = data.map((row: any) => {
        let key
        for (let i = PERF_COLS; i < cols; i++) {
          key = `A${i}`
          row[key] = Math.floor(Math.random() * PERF_ROWS)
        }

        return row
      })
    }

    return data
  }
  /* End of section perform tests */
}
export default App

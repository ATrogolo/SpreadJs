import * as React from 'react'
import * as GC from '@grapecity/spread-sheets'
import { SpreadSheets, Worksheet } from '@grapecity/spread-sheets-react'

import '@grapecity/spread-sheets-designer-resources-en'
import { Designer } from '@grapecity/spread-sheets-designer-react'
import '@grapecity/spread-sheets-designer/styles/gc.spread.sheets.designer.min.css'
import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013white.css'

import './App.css'
import { Modal } from './Modal'
import { ModalCommandConfigurator } from './ModalCommandConfigurator'

// GC.Spread.Sheets.LicenseKey =
//   'GrapeCity-Internal-Use-Only,362369852286222#B0vRARPV5NrR6LUhmN8YGe4k5LhlkbhJWaZVkSmBjellXUF5URz46a4N6RhhDNadjW7c6d4VES7MURnlHVXd5V7gnVwA7YxIkeYNXMwxGdqVzUlhVMzIUWxdXTwgTUJZlNvImdBJ4SW5GTExEezhVOOxWb7R7VKF7TaFnWYJ4L6c7NoN4RRNGSXVEaKJDTFVTYCNmMKNlUZNFMjNzSxgHRwhTMwQ4QsRVWlFTMjFmdUZjYyUXZRR6bXV6RBt6NDBHV8Z5drdWZtRUbCJHeZRFO8F6R5AzM4ljSXNjQ9gTMqBHah5UTKZWT6h6YihXU8Q6V7ckI0IyUiwiIyUUNzAjQwcjI0ICSiwCN9EzM9kjM4YTM0IicfJye#4Xfd5nIFVUSWJiOiMkIsICNx8idgAyUKBCZhVmcwNlI0IiTis7W0ICZyBlIsISM4ETNyADIxAjMxAjMwIjI0ICdyNkIsIybp9ie4lGbit6YhR7cuoCLt36YukHdpNWZwFmcn9iKiojIz5GRiwiI9RXaDVGchJ7RiojIh94QiwiIyIjM6gjMyUDO9YzMyYzMiojIklkIs4XZzxWYmpjIyNHZisnOiwmbBJye0ICRiwiI34TQQFUM6NlUvFjQ6J5dRJzbk3Ca4U6N8c5MxNmQ5JFRW3EWJxEayhFZ4FncPJndZRUahRzcFdnZGZUOpRGeSRVWiplUy8EWh9kV8gjTip5bNpkSSFGWvcVMYVTURlHcHVXMwJjU' as any
// ;(GC.Spread.Sheets as any).Designer.LicenseKey =
//   'GrapeCity-Internal-Use-Only,118434355471155#B0u5f7hlbHVHc8NjbktydGlVdsp5KYJ6Tw36M7gVcOJGO5QXOYBXMFdmUwxmU6VVZkJTeUxEW7p7TmF7Z9JFZhR5dDJHNoJWV5hFdwYUOpZzYiF6YRlkcaJ7MPdjRXJURr56Nr84cwYWaWZTMEBjbGJ6Uk9mY5FUQS5EWVp7Z4EDOFZUeUJ7SIp6STZ7UjRHaMVmTCdzSjpWeBJXQa54MohWOzolbSFHOtFTZVBHcLRTSo5UYipFU7NzQXJ7LD9GSzQ6bz24Lnplba3UclVDczJ6SzZjYnRnR49GV7ZVYNpkRrkXZRhkd6IFZNFlI0IyUiwiIGBTOEZUNyUjI0ICSiwCMxcDM6AjNxQTM0IicfJye&Qf35VfiklNFdjI0IyQiwiI4EjL6Bicl96ZpNXZE5yUKRWYlJHcTJiOi8kI1tlOiQmcQJCLiUTNzIzNwAyNwITMwIDMyIiOiQncDJCLi2WauoHdpxmYrNWY4NnLqwSbvNmL9RXajVGchJ7ZuoiI0IyctRkIsISe4l6QlBXYydkI0ISYONkIsISN5ETM7QTN5MDNzQDOxEjI0ICZJJye0ICRiwiI34TQwYDeJlUeHhEa9okZQhmaZ94UVdGUhNGe5UEeUVUWVVDU5o4N5ADNrkUOxN5NvQ5NBRFOGF4RjhlcVVmaTRUeVlnTVlGaQRER844RsVEO9AjbFJnSx8EMxQ5KZdlUNNXQtNEak3SVlrDbM' as any

interface AppState {
  designerMode: boolean
  show: boolean
  showModalConfigurator: boolean
  buttonCaption: string
}

interface IrionConfig {
  tableName: string
  row: number
  col: number
  sheet: string
  dataSource: string
}

interface Config {
  spreadJs: { [key: string]: any }
  irionConfig: IrionConfig[]
}

type ICellButtonExtended = GC.Spread.Sheets.ICellButton & { id: number }
type ICellRangeExtended = GC.Spread.Sheets.CellRange & { id: number }

const SERVER_URL = 'https://jsonplaceholder.typicode.com'
const POSTS_SOURCE = 'Posts'
const USERS_SOURCE = 'Users'
const TODOS_SOURCE = 'Todos'
const COMMENTS_SOURCE = 'Comments'
const DELAY = 2000
const DATASOURCES = [POSTS_SOURCE, USERS_SOURCE, TODOS_SOURCE, COMMENTS_SOURCE]
const WITH_BINDING = 'With Binding'
const WITHOUT_BINDING = 'Without Binding'
const EXPORT_MODE = [WITH_BINDING, WITHOUT_BINDING]

class App extends React.Component<{}, AppState> {
  hostStyle: any
  wb1: GC.Spread.Sheets.Workbook | undefined
  wb2: GC.Spread.Sheets.Workbook | undefined
  designerWb1: GC.Spread.Sheets.Workbook | undefined
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
      designerMode: true,
      show: false,
      showModalConfigurator: false,
      buttonCaption: '',
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

  showModalConfigurator = () => {
    this.setState({ showModalConfigurator: true })
  }

  hideModalConfigurator = () => {
    this.setState({ showModalConfigurator: false })
  }

  getSelectedRangeFormula(e: any) {
    const a = document.getElementById('rangeText')!
    a.textContent = this.fbx.text()
  }

  render() {
    // const { designerMode } = this.state
    // const designerModeCssClass = 'designer-mode ' + (designerMode ? 'on' : 'off')

    return (
      <>
        <ModalCommandConfigurator
          showModalConfigurator={this.state.showModalConfigurator}
          onClose={this.hideModalConfigurator}
          designerMode={this.state.designerMode}
          getSelectedRangeFormula={(e: any) => {
            this.getSelectedRangeFormula(e)
          }}
          spreadSheet={GC.Spread}
          fbx={this.fbx}
          buttonCaption={this.state.buttonCaption}
        ></ModalCommandConfigurator>
        <div className="toolbar">
          {/* <button
            className={designerModeCssClass}
            onClick={() => this.setState({ designerMode: !this.state.designerMode })}
          >
            Designer Mode: {designerMode ? 'ON' : 'OFF'}
          </button> */}
          {/* {!designerMode && ( */}
          {/* <> */}
          <button className="export-config" onClick={this.exportToWB2}>
            Export WB1 to WB2
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

        {/* {(designerMode && (
          <Designer
            styleInfo={{ width: '100%', height: '100vh' }}
            designerInitialized={(designer: any) => this.initDesigner(designer.getWorkbook())}
            config={this.ribbonConfig}
          ></Designer>
        )) || ( */}
        <>
          <Designer
            styleInfo={{ width: '100%', height: '65vh' }}
            designerInitialized={(designer: any) => this.initSpread1(designer.getWorkbook())}
            config={this.ribbonConfig}
          ></Designer>

          {/* <SpreadSheets
              hostStyle={this.hostStyle}
              name="WB1"
              workbookInitialized={(workBook) => this.initSpread1(workBook)}
            ></SpreadSheets> */}
          <div id="statusBar"></div>

          <hr />

          <SpreadSheets
            hostStyle={this.hostStyle}
            name="WB2"
            workbookInitialized={(workBook) => this.initSpread2(workBook)}
          ></SpreadSheets>
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

    this.insertButtons(sheet)
    // Bind events
    this.bindEvents(this.wb1, sheet)

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

  initDesigner(workBook: GC.Spread.Sheets.Workbook) {
    this.designerWb1 = workBook

    const sheet = this.designerWb1?.getActiveSheet()
    sheet?.setValue(1, 1, 'Type something here!')

    this.insertButtons(sheet)
    this.bindEvents(this.designerWb1, sheet)

    // this.fetchData(POSTS_SOURCE).then((json) => {
    //   this.setTable(json, POSTS_SOURCE, 5, 2, 'ds_wb_table1', sheet, false, true)
    // })
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

  addMoreRoom = (
    sheet: GC.Spread.Sheets.Worksheet,
    row: number,
    rowNumber: number,
    col: number,
    columnNumber: number
  ) => {
    // Check available space
    const sheetRowCount = sheet.getRowCount()
    const sheetColCount = sheet.getColumnCount()
    // Rows
    if (sheetRowCount - row < rowNumber) {
      const rowsToAdd = rowNumber - sheetRowCount + row + 10
      sheet.addRows(sheetRowCount - 1, rowsToAdd)
    }
    // Columns
    if (sheetColCount - col < columnNumber) {
      const colsToAdd = columnNumber - sheetColCount + col + 10
      sheet.addColumns(sheetColCount - 1, colsToAdd)
    }
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
      this.designerWb1?.suspendPaint()
      try {
        let data = dataSource === POSTS_SOURCE || dataSource === COMMENTS_SOURCE ? json.slice(0, 2) : json

        if (tweakData) {
          data = this.tweakData(data, dataSource)
        }

        const rowNumber = data.length
        const columnNames = Object.keys(data[0])
        const columnNumber = columnNames.length

        // Add more rows / columns if there's no enough room
        this.addMoreRoom(sheet, row, rowNumber, col, columnNumber)

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

        table.bind(columns, '', data)
        // table.bind(columns, '', data)
        // do it again for bug
        // #6. Thanks for the sample this looks like bug to me hence we have escalated this issue to the concerned team for further investigation.
        // Till then as a workaround you may call the bind method twice that should solve the issue.
        // Please refer to the following update sample and let us know if you face any issues. sample: https://codesandbox.io/s/blue-fast-qb68d?file=/src/index.js

        // this.fitColumns(sheet, col, columnNumber)
        this.resizeColumns(sheet, col, columnNumber)
      } catch (error) {
        console.error(error)

        // this.wb1?.resumePaint()
        // this.wb2?.resumePaint()
        // this.designerWb1?.resumePaint()
      } finally {
        this.wb1?.resumePaint()
        this.wb2?.resumePaint()
        this.designerWb1?.resumePaint()
      }
    }
  }

  fetchData = (dataMember: string) => {
    return fetch(`${SERVER_URL}/${dataMember}`).then((response) => response.json())
  }

  updateIrionConfig = (tableName: string, row: number, col: number, sheet: string, dataSource: string) => {
    const index = this.irionConfig.findIndex(
      (item) => item.sheet === sheet && item.tableName === tableName // && item.row === row && item.col === col
    )
    const tableConfig = {
      tableName,
      row,
      col,
      sheet,
      dataSource,
    }

    if (index !== -1) {
      this.irionConfig[index] = tableConfig
    } else {
      this.irionConfig.push(tableConfig)
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
    // Remove columns
    // if (dataSource === POSTS_SOURCE) {
    //   const { title, body, ...slice } = row
    //   return slice
    // } else if (dataSource === USERS_SOURCE) {
    //   const { username, email, ...slice } = row
    //   return slice
    // }
    // Add columns
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

    const size = 2
    for (let i = 0; i < size; i++) {
      // if (dataSource === USERS_SOURCE) {
      //   return data.slice(0, 5)
      //   //   data.push({
      //   //     id: i + 50,
      //   //     name: 'Carmine',
      //   //     username: 'Car',
      //   //     email: 'asd@asd.it',
      //   //   })
      //   // } else
      if (dataSource === POSTS_SOURCE) {
        // return data.slice(0, 1)
        data.push({
          userId: i + 50,
          id: i + 50,
          title: 'qui est esse',
          body: 'qui est esse',
        })
      }
    }

    return data
  }

  insertButtons = (sheet: GC.Spread.Sheets.Worksheet) => {
    let id1 = new Date().getTime()
    const row = sheet.getActiveRowIndex()
    const col = sheet.getActiveColumnIndex()

    const cellType: any = new GC.Spread.Sheets.CellTypes.Button()
    cellType.buttonBackColor('#FFFF00')
    cellType.text('CellType Button')
    cellType.id = id1

    // Insert cellType
    const cell = sheet.getCell(row, col) as ICellRangeExtended
    // cell.tag(id1)
    cell.cellType(cellType)

    // Insert cellStyle
    let id2 = new Date().getTime()
    const dropdownStylefunction = new GC.Spread.Sheets.Style()
    dropdownStylefunction.cellButtons = [
      {
        buttonBackColor: '#94cefd',
        caption: 'CellStyle Button',
        id: id2,
        // captionAlign: GC.Spread.Sheets.CaptionAlignment.left,
        // enabled: true,
        // hoverBackColor: '#FF0000',
        position: GC.Spread.Sheets.ButtonPosition.left,
        useButtonStyle: true,
        // visibility: GC.Spread.Sheets.ButtonVisibility.always,
        width: 125,
        // imageType: GC.Spread.Sheets.ButtonImageType.none,
        command: (sheet: GC.Spread.Sheets.Worksheet, row: number, col: number, option: any) => {
          const cellButton: ICellButtonExtended = sheet.getCell(row, col).cellButtons()?.[0]
          console.log('ButtonClicked', cellButton.id)

          // Get Command from IrionConfig and trigger it
        },
      },
    ] as ICellButtonExtended[]

    sheet.setStyle(row, col + 1, dropdownStylefunction)

    // this.resizeColumns(sheet, col, 2)
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
          const config = this.exportConfig(this.designerWb1)

          console.log('Save Action', config)
        },
      },
      listTable: {
        bigButton: true,
        commandName: 'listTable',
        iconClass: 'ribbon-button-table',
        subCommands: DATASOURCES,
        length: DATASOURCES.length,
        text: 'DataSources',
        title: 'DataSources',
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
        title: 'config Command',
        text: 'Command',
        iconClass: 'ribbon-button-cellstates',
        bigButton: true,
        commandName: 'ribbonButtonButtonCellType',
        useButtonStyle: true,

        execute: async (context: any, propertyName: any, fontItalicChecked: any) => {
          var activeSheet = context.Spread.getActiveSheet()
          var basicButttonStyle = new GC.Spread.Sheets.Style()
          basicButttonStyle.cellButtons = [
            //configuro come deve essere il bottone
            {
              caption: 'enable',
              useButtonStyle: true,
              // enabled: true,
              width: undefined!,
              hoverBackColor: 'deepskyblue',
              buttonBackColor: 'green',
              //configuro cosa deve accadere al click in griglia
              command: (sheet, row, col, option) => {
                this.setState({ buttonCaption: 'ciao' })
                console.log(sheet, row, col, option)

                // Get Command from IrionConfig and fire it
                this.showModalConfigurator()

                // if (this.state.showModalConfigurator) {
                //   var fbx = new GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(document.getElementById('formulaBar')!, {
                //     rangeSelectMode: true,
                //     absoluteReference: false,
                //   })

                //   fbx.workbook(context.Spread)
                //   this.fbx = fbx
                // }
              },
            },
          ]
          //pesco la cella selezionata
          const row = activeSheet.getActiveRowIndex()
          const col = activeSheet.getActiveColumnIndex()

          activeSheet.setText(row, col)
          activeSheet.setStyle(row, col, basicButttonStyle)
        },
      },
      editTable: {
        title: 'Edit table',
        text: 'Edit table',
        iconClass: 'ribbon-button-sheetgeneral',
        bigButton: 'true',
        commandName: 'EditTable',
        execute: async (context: any, propertyName: any, fontItalicChecked: any) => {
          const activeSheet: GC.Spread.Sheets.Worksheet = context.Spread.getActiveSheet()
          const row = activeSheet.getActiveRowIndex()
          const col = activeSheet.getActiveColumnIndex()

          const table = activeSheet.tables.find(row, col)
          const isTable = table != null

          if (isTable) {
            // Open modal and edit data
            this.showModal()
          }
        },
      },
    }

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
            thumbnailClass: 'ribbon-thumbnail-save',
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
            label: 'Table Bind',
            thumbnailClass: 'ribbon-thumbnail-viewport',
            commandGroup: {
              children: [
                {
                  direction: 'vertical',
                  commands: ['listTable'],
                },
              ],
            },
          },
          {
            label: 'Export',
            thumbnailClass: 'ribbon-thumbnail-viewport',
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
            thumbnailClass: 'ribbon-thumbnail-save',
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
            label: 'Edit Table',
            thumbnailClass: 'ribbon-thumbnail-save',
            commandGroup: {
              children: [
                {
                  direction: 'vertical',
                  commands: ['editTable'],
                },
              ],
            },
          }
        )
      }
    })

    return config
  }

  // prova(){

  //     //creo con la formattazione richiesta, un command per il click sul nome tabella
  //     const config = (GC.Spread.Sheets as any).Designer
  //     const value = {
  //    "commandWindosButtonConfiguration":{
  //       commandName: "commandWindosButtonConfiguration",
  //       iconClass: "ribbon-button-buttonlistcelltype",
  //       text: "Button List"
  //     }
  //   }
  //     config.commandMap = { ...config.commandMap, ...value }

  // }

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
}
export default App

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

const SERVER_URL = 'https://jsonplaceholder.typicode.com'
const POSTS_SOURCE = 'Posts'
const USERS_SOURCE = 'Users'
const DELAY = 5000
const DATASOURCES = [POSTS_SOURCE, USERS_SOURCE]
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
      buttonCaption: ''
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
    const { designerMode } = this.state
    const designerModeCssClass = 'designer-mode ' + (designerMode ? 'on' : 'off')

    return (
      <>
        <ModalCommandConfigurator
          showModalConfigurator={this.state.showModalConfigurator}
          onClose={this.hideModalConfigurator}
          designerMode={this.state.designerMode}
          getSelectedRangeFormula={(e:any)=>{this.getSelectedRangeFormula(e)}}
          spreadSheet = {GC.Spread}
          fbx = {this.fbx}
          buttonCaption = {this.state.buttonCaption}
        >
        </ModalCommandConfigurator>
        <div className="toolbar">
          <button
            className={designerModeCssClass}
            onClick={() => this.setState({ designerMode: !this.state.designerMode })}
          >
            Designer Mode: {designerMode ? 'ON' : 'OFF'}
          </button>
          {!designerMode && (
            <>
              <button className="export-config" onClick={this.exportToWB2}>
                Export WB1 to WB2
              </button>
              <button className="add-table" onClick={() => this.setTable(POSTS_SOURCE, 15, 1, 'table2')}>
                Add table (1,1)
              </button>
            </>
          )}
        </div>

        {(designerMode && (
          <Designer
            styleInfo={{ width: '100%', height: '100vh' }}
            designerInitialized={(designer: any) => this.initDesigner(designer.getWorkbook())}
            config={this.ribbonConfig}
          >

          


          </Designer>
        )) || (
          <>
            <SpreadSheets
              hostStyle={this.hostStyle}
              name="WB1"
              workbookInitialized={(workBook) => this.initSpread1(workBook)}
            ></SpreadSheets>
            <div id="statusBar"></div>

            <hr />

            <SpreadSheets
              hostStyle={this.hostStyle}
              name="WB2"
              workbookInitialized={(workBook) => this.initSpread2(workBook)}
            ></SpreadSheets>
          </>
        )}

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
    this.bindEvents()

    // Status Bar
    // workBook.suspendPaint()
    // const statusBarElement = document.getElementById('statusBar')
    // if (statusBarElement) {
    //   const statusBar = new GC.Spread.Sheets.StatusBar.StatusBar(statusBarElement)
    //   statusBar.bind(workBook)
    // }
    // workBook.resumePaint()

    // //initialize the spread
    // workBook.suspendPaint()
    //Setting Values - Text
    // const shiftRow = 14
    // sheet.setValue(shiftRow + 1, 1, 'Setting Values')
    // //Setting Values - Number
    // sheet.setValue(shiftRow + 2, 1, 'Number')
    // sheet.setValue(shiftRow + 2, 2, 23)
    // sheet.setValue(shiftRow + 3, 1, 'Text')
    // sheet.setValue(shiftRow + 3, 2, 'GrapeCity')
    // sheet.setValue(shiftRow + 4, 1, 'Datetime')
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

    const dropdownStylefunction = new GC.Spread.Sheets.Style()
    dropdownStylefunction.cellButtons = [
      {
        buttonBackColor: '#4061f3',
        caption: 'Fire Cmd',
        // captionAlign: GC.Spread.Sheets.CaptionAlignment.left,
        // enabled: true,
        // hoverBackColor: '#FF0000',
        position: GC.Spread.Sheets.ButtonPosition.left,
        useButtonStyle: true,
        // visibility: GC.Spread.Sheets.ButtonVisibility.always,
        width: 75,
        // imageType: GC.Spread.Sheets.ButtonImageType.none,
        command: (sheet, row, col, option) => {
          console.log(sheet, row, col, option)
          // Get Command from IrionConfig and fire it
        },
      },
    ]
    sheet.setStyle(0, 4, dropdownStylefunction)

    this.setTable(USERS_SOURCE, 1, 1, 'table1', sheet)
    workBook.resumePaint()
  }

  initSpread2(workBook: GC.Spread.Sheets.Workbook) {
    this.wb2 = workBook
  }

  initDesigner(workBook: GC.Spread.Sheets.Workbook) {
    this.designerWb1 = workBook

    const sheet = this.designerWb1?.getActiveSheet()
    sheet?.setValue(1, 1, 'Type something here!')

    this.designerWb1?.bind(
      GC.Spread.Sheets.Events.ButtonClicked,
      (sender: any, args: GC.Spread.Sheets.IButtonClickedEventArgs) => {
        const { sheet, row, col, sheetName, sheetArea } = args

         const cellType = sheet.getCellType(row, col)
         if (cellType instanceof GC.Spread.Sheets.CellTypes.Button) {
        //   this.showModalConfigurator()
        console.log("bottone classico ",sheet, row, col,sheetName, sheetArea)
        //   console.log(document)
        //   if(this.state.showModalConfigurator){
        //     var fbx = new GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(document.getElementById('formulaBar')!, {rangeSelectMode: true, absoluteReference: false});
        //     fbx.workbook(workBook);
        //     this.fbx = fbx
        //   }
         }
      }
    )


  }

  exportToJson = (workbook?: GC.Spread.Sheets.Workbook) => {
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
    const exportJson = { spreadJS: { ...json } }
    console.log('json', exportJson)

    return exportJson
  }

  exportConfig = (workbook?: GC.Spread.Sheets.Workbook): Config => {
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

    const exportConfig: Config = { spreadJs: { ...json }, irionConfig: [...this.irionConfig] }
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
      this.irionConfig.forEach((tableConfig) => {
        const { sheet: sheetName, row, col, dataSource, tableName } = tableConfig

        const sheet: GC.Spread.Sheets.Worksheet =
          this.wb2?.getSheetFromName(sheetName) ??
          this.wb2?.addSheetTab(0, sheetName, GC.Spread.Sheets.SheetType.tableSheet)

        // Insert (import) table
        this.setTable(dataSource, row, col, tableName, sheet)
      })
    }, DELAY)
  }

  setTable = (
    dataSource: string,
    row: number,
    col: number,
    tableName: string,
    currentSheet?: GC.Spread.Sheets.Worksheet
  ) => {
    const sheet = currentSheet ?? this.wb1?.getActiveSheet()

    if (sheet) {
      this.wb1?.suspendPaint()
      this.wb2?.suspendPaint()
      this.designerWb1?.suspendPaint()

      this.fetchData(dataSource)
        .then((json: any[]) => {
          const data = dataSource === POSTS_SOURCE ? json.slice(0, 2) : json

          const rowNumber = data.length
          const columnNames = Object.keys(data[0])
          const columnNumber = columnNames.length

          // const table2 = sheet.tables.addFromDataSource(
          //   tableUniqueName,
          //   row,
          //   col,
          //   data,
          //   GC.Spread.Sheets.Tables.TableThemes.medium2
          // )

          let table = sheet.tables.find(row, col)
          if (table == null) {
            const tableUniqueName = tableName + '_' + new Date().getTime()
            table = sheet.tables.add(tableUniqueName, row, col, rowNumber, columnNumber)

            console.log('Sto inserendo la tabella ', tableUniqueName)
          } else {
            console.warn(
              'La tabella è già definita nel foglio. Probabilmente è stata importata una configurazione precedente'
            )
          }

          // let column
          const columns: any[] = []
          columnNames.forEach((columnName, index) => {
            const column = new GC.Spread.Sheets.Tables.TableColumn(index, columnName)

            columns.push(column)
          })

          // column = new GC.Spread.Sheets.Tables.TableColumn(
          //   2,
          //   'id',
          //   'ID',
          //   undefined,
          //   undefined,
          //   (item: any) => item['id'] + '€'
          // )
          // columns.push(column)

          table.autoGenerateColumns(false)
          table.bind(columns, '', data)

          this.updateIrionConfig(table.name(), row, col, sheet.name(), dataSource)
          // this.fitColumns(sheet, col, columnNumber)
          this.resizeColumns(sheet, col, columnNumber)
        })
        .catch((error) => {
          console.error(error)

          this.wb1?.resumePaint()
          this.wb2?.resumePaint()
          this.designerWb1?.resumePaint()
        })
        .finally(() => {
          this.wb1?.resumePaint()
          this.wb2?.resumePaint()
          this.designerWb1?.resumePaint()
        })
    }
  }

  fetchData = (dataMember: string) => {
    return fetch(`${SERVER_URL}/${dataMember}`).then((response) => response.json())
  }

  updateIrionConfig = (tableName: string, row: number, col: number, sheet: string, dataSource: string) => {
    const index = this.irionConfig.findIndex(
      (item) => item.sheet === sheet && item.row === row && item.col === col // && item.tableName === tableName
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

  getRibbonConfig = () => {
     const config1 = (GC.Spread.Sheets as any).Designer
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
        iconClass: 'ribbon-button-buttoncelltype',
        bigButton: true,
        commandName: 'ribbonButtonButtonCellType',
        useButtonStyle: true,
        
        execute: async (context: any, propertyName: any, fontItalicChecked: any) => {
          var activeSheet = context.Spread.getActiveSheet();
          var basicButttonStyle = new GC.Spread.Sheets.Style();
          basicButttonStyle.cellButtons = 
          [ //configuro come deve essere il bottone
            {
              caption: "enable",
              useButtonStyle: true,
              // enabled: true,
              width: undefined!,
              hoverBackColor: "deepskyblue",
              buttonBackColor:"green",          
              //configuro cosa deve accadere al click in griglia
              command: (sheet, row, col, option) => {
                this.setState({buttonCaption: 'ciao' })
                console.log(sheet, row, col, option)
                // Get Command from IrionConfig and fire it
                this.showModalConfigurator()

                console.log(document)
                if(this.state.showModalConfigurator){
                  var fbx = new GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(document.getElementById('formulaBar')!, {rangeSelectMode: true, absoluteReference: false});
             
                  fbx.workbook(context.Spread);
                  this.fbx = fbx
                }
              },
            }
          ];
          //pesco la cella selezionata
          const row = activeSheet.getActiveRowIndex()
          const col = activeSheet.getActiveColumnIndex()

          activeSheet.setText(row, col);
          activeSheet.setStyle(row, col, basicButttonStyle);
          
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
            if (exportName === WITHOUT_BINDING) {
              //da configurare
              const config = this.exportConfig(this.designerWb1)
              navigator.clipboard.writeText(JSON.stringify(config.spreadJs))
            }
            if (exportName === WITH_BINDING) {
              //da configurare
              navigator.clipboard.writeText(JSON.stringify(this.exportConfig(this.designerWb1)))
            }
          },
        },
      }

      config.commandMap = { ...config.commandMap, ...value }
    })
  }

  getRibbonTablesDropdown() {
    DATASOURCES.forEach((tableName) => {
      const config = (GC.Spread.Sheets as any).Designer.DefaultConfig

      //creo con la formattazione richiesta, un command per il click sul nome tabella
      const value = {
        [tableName]: {
          title: tableName,
          text: tableName,
          iconClass: 'ribbon-button-table',
          bigButton: false,
          commandName: tableName,
          execute: async (context: any, propertyName: any, fontItalicChecked: any) => {
            const sheet = this.designerWb1?.getActiveSheet()

            if (sheet) {
              const row = sheet.getActiveRowIndex()
              const col = sheet.getActiveColumnIndex()
              //this.showModal()

              this.setTable(tableName, row, col, tableName, sheet)
            }
          },
        },
      }

      config.commandMap = { ...config.commandMap, ...value }
    })
  }

  bindEvents = () => {
    const sheet = this.wb1?.getActiveSheet()
    if (!sheet) return

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

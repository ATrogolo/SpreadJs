import * as React from 'react'
import * as GC from '@grapecity/spread-sheets'
import { SpreadSheets, Worksheet } from '@grapecity/spread-sheets-react'

import '@grapecity/spread-sheets-designer-resources-en'
import { Designer } from '@grapecity/spread-sheets-designer-react'
import '@grapecity/spread-sheets-designer/styles/gc.spread.sheets.designer.min.css'
import '@grapecity/spread-sheets/styles/gc.spread.sheets.excel2013white.css'

import './App.css'

interface AppState {
  designerMode: boolean
}

const SERVER_URL = 'https://jsonplaceholder.typicode.com'
const POSTS_SOURCE = 'posts'
const USERS_SOURCE = 'users'
const DELAY = 100
const DATASOURCES = [POSTS_SOURCE, USERS_SOURCE]

class App extends React.Component<{}, AppState> {
  hostStyle: any
  wb1: GC.Spread.Sheets.Workbook | undefined
  wb2: GC.Spread.Sheets.Workbook | undefined
  designerWb1: GC.Spread.Sheets.Workbook | undefined
  ribbonConfig: any
  irionConfig: { tableName: string; row: number; col: number; sheet: string; dataSource: string }[] = []

  constructor(props: {}) {
    super(props)
    this.hostStyle = {
      width: '100%',
      height: (window.innerHeight - 80) / 2,
    }

    this.state = {
      designerMode: true,
    }

    this.ribbonConfig = this.getRibbonConfig()
  }

  render() {
    const { designerMode } = this.state
    const designerModeCssClass = 'designer-mode ' + (designerMode ? 'on' : 'off')

    return (
      <>
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
              <button className="add-table" onClick={() => this.addTable(POSTS_SOURCE, 15, 1, 'table2')}>
                Add table (1,1)
              </button>
            </>
          )}
        </div>

        {(designerMode && (
          <Designer
            styleInfo={{ width: '100%', height: '100vh' }}
            designerInitialized={(designer: any) => {
              this.designerWb1 = designer.getWorkbook()

              const sheet = this.designerWb1?.getActiveSheet()
              sheet?.setValue(1, 1, 'Type something here!')
            }}
            config={this.ribbonConfig}
          ></Designer>
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
      </>
    )
  }

  initSpread1(workBook: GC.Spread.Sheets.Workbook) {
    this.wb1 = workBook
    const sheet = workBook.getActiveSheet()

    // Bind events
    this.bindEvents()

    // Status Bar
    workBook.suspendPaint()
    const statusBarElement = document.getElementById('statusBar')
    if (statusBarElement) {
      const statusBar = new GC.Spread.Sheets.StatusBar.StatusBar(statusBarElement)
      statusBar.bind(workBook)
    }
    workBook.resumePaint()

    //initialize the spread
    workBook.suspendPaint()
    //Setting Values - Text
    const shiftRow = 14
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

    this.fetchData(USERS_SOURCE).then((data: any[]) => {
      sheet.tables.addFromDataSource('table1', 1, 1, data, GC.Spread.Sheets.Tables.TableThemes.medium2)
      this.updateIrionConfig('table1', 1, 1, sheet.name(), USERS_SOURCE)
      workBook.resumePaint()
    })
  }

  initSpread2(workBook: GC.Spread.Sheets.Workbook) {
    this.wb2 = workBook
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
    const json = JSON.stringify(workbook?.toJSON(serializationOption))
    //   console.log('json', json)

    return json
  }

  exportToWB2 = () => {
    // Get config from WB1 and export it to WB2
    const jsonStr = this.exportToJson(this.wb1)

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
    this.wb2?.fromJSON(JSON.parse(jsonStr), jsonOptions)

    setTimeout(() => {
      // const config: any = JSON.parse(jsonStr)
      // const sheetsKeys = Object.keys(config.sheets)

      // sheetsKeys.forEach((sheetKey) => {
      //   const sheet = config.sheets[sheetKey]

      //   const sheetName = sheet.name

      //   for (let table of sheet.tables) {
      //     const { name, row, col } = table

      //     const sheet = this.wb2?.getSheetFromName(sheetName)
      //     const destTable = sheet?.tables.find(row, col)

      //     if (destTable) {
      //       // remove
      //       sheet?.tables.remove(destTable, GC.Spread.Sheets.Tables.TableRemoveOptions.none)
      //     }
      //     // fetch data
      //     this.addTable(sheet, row, col, destTable?.name())
      //   }
      // })
      this.irionConfig.forEach((tableConfig) => {
        const { sheet: sheetName, row, col, dataSource, tableName } = tableConfig

        const sheet = this.wb2?.getSheetFromName(sheetName)
        const destTable = sheet?.tables.find(row, col)

        if (destTable) {
          // Remove it
          sheet?.tables.remove(destTable, GC.Spread.Sheets.Tables.TableRemoveOptions.none)
        }

        // Insert table
        this.addTable(dataSource, row, col, tableName, sheet)
      })
    }, DELAY)
  }

  fetchData = (dataMember: string) => {
    return fetch(`${SERVER_URL}/${dataMember}`).then((response) => response.json())
  }

  updateIrionConfig = (tableName: string, row: number, col: number, sheet: string, dataSource: string) => {
    const index = this.irionConfig.findIndex(
      (item) => item.row === row && item.col === col && item.tableName === tableName && item.sheet === sheet
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

  addTable = (
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
          // const rowNumber = data.length
          // const columnNumber = Object.keys(data[0]).length

          const table2 = sheet.tables.addFromDataSource(
            tableName,
            row,
            col,
            data,
            GC.Spread.Sheets.Tables.TableThemes.medium2
          )

          this.updateIrionConfig(tableName, row, col, sheet.name(), dataSource)

          // const table = sheet.tables.add('table2', 0, 0, rowNumber, columnNumber)
          // let column
          // const columns = []
          // column = new GC.Spread.Sheets.Tables.TableColumn(
          //   1,
          //   'userId',
          //   'UserID',
          //   undefined,
          //   new GC.Spread.Sheets.CellTypes.Text(),
          //   (item: any) => '#' + item['userId']
          // )
          // columns.push(column)

          // column = new GC.Spread.Sheets.Tables.TableColumn(
          //   2,
          //   'id',
          //   'ID',
          //   undefined,
          //   undefined,
          //   (item: any) => item['id'] + '€'
          // )
          // columns.push(column)

          // column = new GC.Spread.Sheets.Tables.TableColumn(3, 'title', 'Title')
          // columns.push(column)

          // column = new GC.Spread.Sheets.Tables.TableColumn(4, 'body', 'Post')
          // columns.push(column)

          // table.autoGenerateColumns(false)
          // table.bind(columns, '', data)

          // this.fitColumns(sheet, columnNumber)
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

  resizeColumns = (sheet: GC.Spread.Sheets.Worksheet, columnCount: number) => {
    // Resize table columns
    for (let i = 0; i < columnCount; i++) {
      sheet.autoFitColumn(i)
    }
  }

  fitColumns = (sheet: GC.Spread.Sheets.Worksheet, columnCount: number) => {
    // Set number of columns of the sheet to proportionally size them
    sheet.setColumnCount(columnCount)

    // Fit table columns
    for (let i = 0; i < columnCount; i++) {
      sheet.setColumnWidth(i, '*')
    }
  }

  getRibbonConfig = () => {
    const config = (GC.Spread.Sheets as any).Designer.DefaultConfig

    config.commandMap = {
      saveData: {
        title: 'Save data to server',
        text: 'Save',
        iconClass: 'saveData',
        bigButton: 'true',
        commandName: 'saveData',
        execute: async (context: any, propertyName: any, fontItalicChecked: any) => {
          const result = this.exportToJson(this.designerWb1)

          console.log('Save Action', result)
        },
      },
      listTable: {
        bigButton: true,
        commandName: 'listTable',
        // iconClass: '',
        subCommands: DATASOURCES,
        length: DATASOURCES.length,
        text: 'DataSources',
        title: 'DataSources',
        type: 'dropdown',
      },
    }

    //genero la lista delle tabelle per il ribbon e relative azioni
    this.getRibbonTablesDropdown()

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
          }
        )
      }
    })

    return config
  }

  getRibbonTablesDropdown() {
    DATASOURCES.forEach((tableName) => {
      const config = (GC.Spread.Sheets as any).Designer.DefaultConfig

      //creo con la formattazione richiesta, un command per il click sul nome tabella
      const value = {
        [tableName]: {
          title: tableName,
          text: tableName,
          iconClass: 'datasource',
          bigButton: false,
          commandName: tableName,
          execute: async (context: any, propertyName: any, fontItalicChecked: any) => {
            const sheet = this.designerWb1?.getActiveSheet()

            if (sheet) {
              const row = sheet.getActiveRowIndex()
              const col = sheet.getActiveColumnIndex()

              this.addTable(tableName, row, col, tableName, sheet)
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

    sheet.bind(GC.Spread.Sheets.Events.EditEnded, (sender: any, args: GC.Spread.Sheets.IEditEndedEventArgs) => {
      const { row, col } = args
      console.log('Cell (' + row + ', ' + col + ') data has been changed.')

      const table = sheet.tables.find(row, col)
      if (table) {
        const tableName = table.name()
        const index = this.irionConfig.findIndex((item) => item.tableName === tableName && item.sheet === sheet.name())

        if (index !== -1) {
          // Found
          const { dataSource } = this.irionConfig[index]

          const rowsChanged = table.getDirtyRows() ?? []
          const rowChanged = rowsChanged.slice(-1)?.[0]?.item
          const key = rowChanged['id'] // Read primary key from layout config

          // Update rowChanged to the Model
          fetch(`${SERVER_URL}/${dataSource}/${key}`, {
            method: 'PATCH',
            body: JSON.stringify(rowChanged),
            headers: {
              'Content-type': 'application/json; charset=UTF-8',
            },
          })
        }
      }
    })

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

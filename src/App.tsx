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

class App extends React.Component<any, AppState> {
  hostStyle: any
  wb1: GC.Spread.Sheets.Workbook | undefined
  wb2: GC.Spread.Sheets.Workbook | undefined
  designerWb1: GC.Spread.Sheets.Workbook | undefined
  config: any

  constructor(props: any) {
    super(props)
    this.hostStyle = {
      width: '100%',
      height: (window.innerHeight - 80) / 2,
    }

    this.state = {
      designerMode: false,
    }

    this.config = this.createRibbonConfig()
  }

  createRibbonConfig = () => {
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

          console.log('Exported config', result)
        },
      },
    }
    config.ribbon[0].buttonGroups.push({
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
    })

    return config
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
              <button className="add-table" onClick={() => this.addTable()}>
                Add table (1,1)
              </button>
              <button className="get-dirty-rows" onClick={this.getTable2Changes}>
                Get Table2 DirtyRows
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
            config={this.config}
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

    this.wb1?.bind(
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

    const sheet = workBook.getActiveSheet()

    sheet.bind(GC.Spread.Sheets.Events.EditEnded, function (sender: any, args: GC.Spread.Sheets.IEditEndedEventArgs) {
      const { row, col } = args
      console.log('Cell (' + row + ', ' + col + ') data has been changed.')

      const table = sheet.tables.find(row, col)
      if (table) {
        const rowsChanged = table.getDirtyRows() ?? []
        const rowChanged = rowsChanged.slice(-1)?.[0]?.item
        // Update rowChanged to the Model
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
    // console.log('isSelected', sheet.isSelected())

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

    const data = [
      {
        id: 1,
        name: 'Leanne Graham',
        username: 'Bret',
        email: 'Sincere@april.biz',
        address: {
          street: 'Kulas Light',
          suite: 'Apt. 556',
          city: 'Gwenborough',
          zipcode: '92998-3874',
          geo: {
            lat: '-37.3159',
            lng: '81.1496',
          },
        },
        phone: '1-770-736-8031 x56442',
        website: 'hildegard.org',
        company: {
          name: 'Romaguera-Crona',
          catchPhrase: 'Multi-layered client-server neural-net',
          bs: 'harness real-time e-markets',
        },
      },
      {
        id: 2,
        name: 'Ervin Howell',
        username: 'Antonette',
        email: 'Shanna@melissa.tv',
        address: {
          street: 'Victor Plains',
          suite: 'Suite 879',
          city: 'Wisokyburgh',
          zipcode: '90566-7771',
          geo: {
            lat: '-43.9509',
            lng: '-34.4618',
          },
        },
        phone: '010-692-6593 x09125',
        website: 'anastasia.net',
        company: {
          name: 'Deckow-Crist',
          catchPhrase: 'Proactive didactic contingency',
          bs: 'synergize scalable supply-chains',
        },
      },
      {
        id: 3,
        name: 'Clementine Bauch',
        username: 'Samantha',
        email: 'Nathan@yesenia.net',
        address: {
          street: 'Douglas Extension',
          suite: 'Suite 847',
          city: 'McKenziehaven',
          zipcode: '59590-4157',
          geo: {
            lat: '-68.6102',
            lng: '-47.0653',
          },
        },
        phone: '1-463-123-4447',
        website: 'ramiro.info',
        company: {
          name: 'Romaguera-Jacobson',
          catchPhrase: 'Face to face bifurcated interface',
          bs: 'e-enable strategic applications',
        },
      },
      {
        id: 4,
        name: 'Patricia Lebsack',
        username: 'Karianne',
        email: 'Julianne.OConner@kory.org',
        address: {
          street: 'Hoeger Mall',
          suite: 'Apt. 692',
          city: 'South Elvis',
          zipcode: '53919-4257',
          geo: {
            lat: '29.4572',
            lng: '-164.2990',
          },
        },
        phone: '493-170-9623 x156',
        website: 'kale.biz',
        company: {
          name: 'Robel-Corkery',
          catchPhrase: 'Multi-tiered zero tolerance productivity',
          bs: 'transition cutting-edge web services',
        },
      },
      {
        id: 5,
        name: 'Chelsey Dietrich',
        username: 'Kamren',
        email: 'Lucio_Hettinger@annie.ca',
        address: {
          street: 'Skiles Walks',
          suite: 'Suite 351',
          city: 'Roscoeview',
          zipcode: '33263',
          geo: {
            lat: '-31.8129',
            lng: '62.5342',
          },
        },
        phone: '(254)954-1289',
        website: 'demarco.info',
        company: {
          name: 'Keebler LLC',
          catchPhrase: 'User-centric fault-tolerant solution',
          bs: 'revolutionize end-to-end systems',
        },
      },
      {
        id: 6,
        name: 'Mrs. Dennis Schulist',
        username: 'Leopoldo_Corkery',
        email: 'Karley_Dach@jasper.info',
        address: {
          street: 'Norberto Crossing',
          suite: 'Apt. 950',
          city: 'South Christy',
          zipcode: '23505-1337',
          geo: {
            lat: '-71.4197',
            lng: '71.7478',
          },
        },
        phone: '1-477-935-8478 x6430',
        website: 'ola.org',
        company: {
          name: 'Considine-Lockman',
          catchPhrase: 'Synchronised bottom-line interface',
          bs: 'e-enable innovative applications',
        },
      },
      {
        id: 7,
        name: 'Kurtis Weissnat',
        username: 'Elwyn.Skiles',
        email: 'Telly.Hoeger@billy.biz',
        address: {
          street: 'Rex Trail',
          suite: 'Suite 280',
          city: 'Howemouth',
          zipcode: '58804-1099',
          geo: {
            lat: '24.8918',
            lng: '21.8984',
          },
        },
        phone: '210.067.6132',
        website: 'elvis.io',
        company: {
          name: 'Johns Group',
          catchPhrase: 'Configurable multimedia task-force',
          bs: 'generate enterprise e-tailers',
        },
      },
      {
        id: 8,
        name: 'Nicholas Runolfsdottir V',
        username: 'Maxime_Nienow',
        email: 'Sherwood@rosamond.me',
        address: {
          street: 'Ellsworth Summit',
          suite: 'Suite 729',
          city: 'Aliyaview',
          zipcode: '45169',
          geo: {
            lat: '-14.3990',
            lng: '-120.7677',
          },
        },
        phone: '586.493.6943 x140',
        website: 'jacynthe.com',
        company: {
          name: 'Abernathy Group',
          catchPhrase: 'Implemented secondary concept',
          bs: 'e-enable extensible e-tailers',
        },
      },
      {
        id: 9,
        name: 'Glenna Reichert',
        username: 'Delphine',
        email: 'Chaim_McDermott@dana.io',
        address: {
          street: 'Dayna Park',
          suite: 'Suite 449',
          city: 'Bartholomebury',
          zipcode: '76495-3109',
          geo: {
            lat: '24.6463',
            lng: '-168.8889',
          },
        },
        phone: '(775)976-6794 x41206',
        website: 'conrad.com',
        company: {
          name: 'Yost and Sons',
          catchPhrase: 'Switchable contextually-based project',
          bs: 'aggregate real-time technologies',
        },
      },
      {
        id: 10,
        name: 'Clementina DuBuque',
        username: 'Moriah.Stanton',
        email: 'Rey.Padberg@karina.biz',
        address: {
          street: 'Kattie Turnpike',
          suite: 'Suite 198',
          city: 'Lebsackbury',
          zipcode: '31428-2261',
          geo: {
            lat: '-38.2386',
            lng: '57.2232',
          },
        },
        phone: '024-648-3804',
        website: 'ambrose.net',
        company: {
          name: 'Hoeger LLC',
          catchPhrase: 'Centralized empowering task-force',
          bs: 'target end-to-end models',
        },
      },
    ]
    sheet.tables.addFromDataSource('table1', 8, 1, data, GC.Spread.Sheets.Tables.TableThemes.light1)

    workBook.resumePaint()
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
    console.log('json', json)

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
      const config: any = JSON.parse(jsonStr)
      const sheetsKeys = Object.keys(config.sheets)

      sheetsKeys.forEach((sheetKey) => {
        const sheet = config.sheets[sheetKey]

        const sheetName = sheet.name

        for (let table of sheet.tables) {
          const { name, row, col } = table

          const sheet = this.wb2?.getSheetFromName(sheetName)
          const destTable = sheet?.tables.find(row, col)

          if (destTable) {
            // remove
            sheet?.tables.remove(destTable, GC.Spread.Sheets.Tables.TableRemoveOptions.none)
          }
          // fetch data
          this.addTable(sheet, row, col, destTable?.name())
        }
      })
    }, 1000)
  }

  addTable = (currentSheet?: any, row?: number, col?: number, tableName?: string) => {
    const sheet = currentSheet ?? this.wb1?.getActiveSheet()

    if (sheet) {
      this.wb1?.suspendPaint()

      // let table = sheet.tables.add('tableSales', 0, 0, 5, 5)
      // let tableColumn1 = new GC.Spread.Sheets.Tables.TableColumn(
      //   1,
      //   'field',
      //   'column name',
      //   'formatter for dates / currencies',
      //   new GC.Spread.Sheets.CellTypes.Text(),
      //   functionToManipulateValue / irionAdapter
      // )

      // table.bind([tableColumn1, tableColumn2, tableColumn3, tableColumn4, tableColumn5], 'sales', data)
      // // sheet.autoFitColumn(1)

      fetch('https://jsonplaceholder.typicode.com/posts')
        .then((response) => response.json())
        .then((json: any[]) => {
          const data = json.slice(0, 2)
          const rowNumber = data.length
          const columnNumber = Object.keys(data[0]).length

          const table2 = sheet.tables.addFromDataSource(
            tableName ?? 'table2',
            row ?? 1,
            col ?? 1,
            data,
            GC.Spread.Sheets.Tables.TableThemes.medium2
          )

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
          console.error('Le tabelle non possono essere sovrapposte', error)
          this.wb1?.resumePaint()
        })
        .finally(() => {
          this.wb1?.resumePaint()
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

  getTable2Changes = () => {
    const changedRows = this.wb1?.getActiveSheet().tables.findByName('table2')?.getDirtyRows() ?? []

    console.log('Changed rows #: ' + changedRows.length)
    for (let changedRow of changedRows) {
      console.log('changedRow', changedRow)
    }
  }
}

export default App

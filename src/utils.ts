import * as GC from '@grapecity/spread-sheets'
import { TableConfig } from './App'

export const getBoundedTable = (activeSheet: GC.Spread.Sheets.Worksheet, irionConfig: TableConfig[]) => {
  const row = activeSheet.getActiveRowIndex()
  const col = activeSheet.getActiveColumnIndex()

  const table = activeSheet.tables.find(row, col)
  const isTable = table != null

  if (isTable) {
    const tableName = table.name()

    const tableConfig = irionConfig.find((config) => config.tableName === tableName)
    const isBoundedTable = tableConfig != null

    if (isBoundedTable) {
      return { table, tableConfig }
    } else {
      console.warn('Not a bounded table')
    }
  } else {
    console.warn('The cell does not belong to a table')
  }
}

export const addMoreRoom = (
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

export const getIrionConfigIndex = (irionConfig: TableConfig[], sheet: string, tableName: string) => {
  const configIndex = irionConfig.findIndex(
    (item) => item.sheet === sheet && item.tableName === tableName // && item.row === row && item.col === col
  )
  return configIndex
}

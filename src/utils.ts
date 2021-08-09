import * as GC from '@grapecity/spread-sheets'
import { IrionConfig } from './App'

export const getBoundedTable = (activeSheet: GC.Spread.Sheets.Worksheet, irionConfig: IrionConfig[]) => {
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

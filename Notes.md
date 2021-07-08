# SpreadSheet Viewer

## Obiettivo

Mettere a disposizione dei Designer un foglio di calcolo che possa esser personalizzato per poi essere utilizzato per operazioni di reportistica dati da un EndUser.

- Ci sono 3 tipologie di utente:
  1. Designer
  2. Configurator
  3. EndUser

Il Designer si occuperà di creare un Book con all'interno un viewer SpreadSheet.
Imposterà una serie di proprietà (quali ad esempio le tabelle dalle quali lo SpreadSheet potrà attingere i dati ed una serie di Command).
Questa configurazione verrà salvata nel layout del Book.

Il Configurator utilizzerà quanto messo a disposizione dal Designer ed utilizzerà lo SpreadJsDesigner tool per configurare l'Excel (tabelle, ribbon, stili ...)

L'EndUser sarà colui che utilizzerà il prodotto finale per visualizzare i dati / dashboard o per fare data-entry.

---

## SpreadJS

- La libreria è composta da 2 moduli: un visualizzatore (`SpreadJs`) ed uno strumento per la creazione di fogli Excel (`Designer`) composto dal Ribbon + la parte Excel.

- [Funzionalità libreria](https://www.grapecity.com/spreadjs/demos/quickstart/quickstart-react)
- [Dettaglio funzionalità](https://www.grapecity.com/spreadjs/docs/v14/online/features.html)

- [Demo Online Designer](https://www.grapecity.com/spreadjs/designer/index.html)

```jsx
<SpreadSheets
  hostStyle={this.hostStyle}
  name="WB1"
  workbookInitialized={(workBook) => this.initSpread1(workBook)}
></SpreadSheets>
```

```jsx
<Designer
  styleInfo={{ width: '100%', height: '100vh' }}
  designerInitialized={(designer: any) => {
    this.designerWb1 = designer.getWorkbook()
  }}
  config={this.config}
></Designer>
```

---

### Inserimento tabelle del Model _Irion_

#### Aggiunta di tabelle

Il _Designer_ configurerà, tramite opportune properties, le tabelle del Model che il Configurator potrà inserire nello SpreadSheet.

Il _Configurator_ troverà tali tabelle in una sezione del Ribbon. La selezione di una tabella farà si che essa venga aggiunta al foglio Excel, andando a caricare i dati dal server, visualizzandoli a partire dalla cella selezionata.

La presenza della tabella nel WorkBook verrà resa persistente al **salvataggio** della configurazione dell'Excel sullo Shelf.
La configurazione non conterrà però il riferimento alla tabella del Model; occorrerà pertanto salvare in una configurazione a parte queste informazioni sullo Shelf. (Ad esempio in una nuova colonna)

Es:

**Config Excel:**

```json
{
  "version": "14.1.1",
  "sheets": {
    "Sheet1": {
      "name": "Sheet1",
      "tables": [
        {
          "name": "table1",
          "row": 8,
          "col": 1,
          ...
        }
      ]
    }
  }
}
```

**Config Binding:**

```json
[
  {
    "name": "table1",
    "row": 8,
    "col": 1,
    "dataMember": "Customers"
  }
]
```

Le opzioni sono quindi 2:

1. Nome della tabella
   Il nome viene associato in fase di creazione della tabella.
   L'utente potrà cambiarlo tramite il Ribbon (sezione `Table Design`), ma non è presente un evento che intercetti questo cambiamento, rendendo difficile l'aggiornamento dell'associazione.
   Nel caso in cui si vogliano aggiungere N tabelle sullo stesso WorkBook ci sarebbero inoltre dei problemi.
   >
2. Riferimento: foglio, riga, colonna (Sheet1!B52)
   Questo riferimento è univoco ma occorre gestire lo spostamento della tabella.

   - Drag & drop: occorre gestire l'evento di `DragDropBlockCompleted` in modo da aggiornare i riferimenti con la nuova posizione della tabella.
   - Copy & paste: occorre intercettare la copia di una tabella ed aggiornare i riferimenti.
     **Complicato**: all'evento di `ClipboardChanged` occorre capire che cosa si sta copiando (se una tabella o altro). Non semplice.

#### Data-binding

1. Uso il binding per associare la definizione di una colonna ai dati:
   Questo secondo caso è necessario se il Designer può definire quali colonne di una tabella del Model verranno visualizzate e se si vuole associare ad esse una formattazione (es. per date / numeri)
   Diversamente le colonne verranno inferite dallo Schema (o dai dati)

   In alternativa, è possibile definire il formato delle celle con SpreadJS: tasto dx > `Format Cells`.

```json
{
  "columns": [
    {
      "name": "ShippingDate",
      "header": "Shipped on",
      "format": "dd/mm/yyyy"
    },
    {
      "name": "Value",
      "header": "Price",
      "prefix": "€"
    }
  ]
}
```

```js
const table = sheet.tables.add(tableName, row, column)
const data = {
    items: [
        {birthdate: new Date(), cost: 10 }
        {birthdate: new Date(), cost: 20 }
    ]
}
const bindingPath = 'items'

const columns = []
const column1 = new GC.Spread.Sheets.Tables.TableColumn(index, field, header, formatValue, cellType, valueAdapter)
columns.push(column)

const column2 = new GC.Spread.Sheets.Tables.TableColumn(1, 'birthdate', 'Birth Date', 'dd/mm/yyyy')
columns.push(column)

const column3 = new GC.Spread.Sheets.Tables.TableColumn(2, 'cost', 'Cost', null, null, (row) => {
  return row['cost'] + '€'
})
columns.push(column)

table.autoGenerateColumns(false)
table.bind(columns, bindingPath, data)
```

#### Update tabelle

Quando l'_EndUser_ aggiorna il contenuto di una tabella (bindata) occorre lanciare un'update per salvare il nuovo dato sul Model.
È presente l'evento `EditEnded` (a livello di Sheet) che viene lanciato al termine dell'editing di una cella.

Nel caso in cui si stia editando una tabella, occorre aggiornare il Model con la riga aggiornata:

```js
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
```

#### AutoSize colonne

- Il **resize** delle colonne (in base al contenuto delle celle) può essere realizzato con:

```js
const columnCount = sheet.getColumnCount()
for (let i = 0; i < columnCount; i++) {
  sheet.autoFitColumn(i)
}
```

- Il **fit** delle colonne (un set di colonne occupa equamente l'intera viewport width) può essere realizzato con:

```js
// Fit table columns
for (let i = 0; i < columnCount; i++) {
  sheet.setColumnWidth(i, '*')
}
```

#### Conflitti tra tabelle

Se inserisco 2 o più tabelle dove sono già presenti dei dati mi verrà restituito un errore di tipo "The tables cannot be intersected."
Questo può succedere a "design-time" (il Configurator inserisce 2 tabelle che collidono) ma anche a runtime (le tabelle hanno un set di dati maggiore di quello previsto dal Configurator e quindi ora collidono)

È quindi buona norma evitare di inserire 2 tabelle (delle quali non si conosce il numero di righe a priori) sulle stesse colonne.
Lo stesso problema si ha su Excel, dove viene sollevato lo stesso errore.

---

#### Import / Export

Serializzo il contenuto dell'Excel con:

```js
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
const jsonStr = JSON.stringify(this.wb1?.toJSON(serializationOption))
```

Deserializzo il JSON con FromJSON:

```js
// Fetch JSON from DataShelf
const jsonStr = readJsonFromDataShelf()

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

this.wb2?.fromJSON(JSON.parse(jsonStr), jsonOptions)
```

##### Caricamento dati Model

Una volta importata la configurazione sarà necessario caricare i dati dal Model Irion.
Occorrerà quindi:

1.  Estrarre le tabelle salvate nella configurazione Excel (JSON)
2.  Estrarre dalla configurazione Irion la tabella del Model corrispondente alla tabella Excel
3.  Leggere i dati e portarli sul WorkBook Excel

##### ⚠️Export tabelle "statiche"

Dettagli sull'export [qui](#import-export)

Decidendo di esportare la configurazione senza i dati (poiché il contenuto delle tabelle verrà caricato all'esecuzione del Book) nel caso in cui vengano definite delle tabelle "statiche" i dati contenuti al loro interno **non verranno esportati**.

Le opzioni sono:

1. Non permettere la creazione di tabelle non associate al Model di Irion (binding)
2. Sviluppare una funzione che distingua le tabelle "bindate" e quelle "non bindate" salvando i dati di quelle "non bindate" all'interno della configurazione.
   > Occorre esportare la configurazione Excel 2 volte:
   >
   > 1. Con i dati
   > 2. Senza i dati
   > 3. Aggiungere all'export "senza dati" il contenuto delle tabelle "statiche"

---

### Scenari

#### 1. Designer

#### 2. Configurator

#### 3. EndUser

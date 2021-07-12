# SpreadSheet Viewer

## Requisiti

Mettere a disposizione dei Designer un foglio di calcolo in modo che venga poi utilizzato da un EndUser per operazioni di analisi dati.

- Lo SpreadSheet verrà utilizzato da 3 tipi di utenti:
  1. Designer
  2. Configurator
  3. EndUser

Il Designer si occuperà di creare un Book con all'interno un viewer SpreadSheet.
Imposterà una serie di proprietà (quali ad esempio le tabelle accessibili dal Configurator per visualizzarne i dati nello SpreadSheet ed una serie di Command).
Questa configurazione verrà salvata nel layout del Book.

Il Configurator utilizzerà quanto messo a disposizione dal Designer ed utilizzerà lo SpreadJsDesigner tool per configurare l'Excel (tabelle, ribbon, stili ...)

L'EndUser sarà colui che utilizzerà il prodotto finale per visualizzare i dati / dashboard o per fare data-entry.

---

### User Stories

#### 1. Designer

Configura nella property `DataSources` le sorgenti dati accessibili al _Configurator_.
Ognuna di esse sarà contraddistinta dalle stesse property del tipo _Source_ e da una label che identificherà la _dataSource_ nell'elenco presentato al _Configurator_.
L'elenco verrà visualizzato in un menù a tendina nel Ribbon e sarà accessibile solo al _Configurator_.

Per ognuno dei `dataSource` il Designer potrà configurare quali colonne visualizzare sullo SpreadSheet definendo (opzionalmente):

- Header
- Formattazione valore (date)
- Larghezza della colonna
- Funzione che va a manipolare il valore (Adapter)

Diversamente verranno riportate tutte le colonne presenti nel `dataSource`.

Definisce quindi nella property `Buttons` i pulsanti che saranno presenti nel Ribbon.
Ogni `Button` avrà un nome, un'icona e una o più azioni da eseguire alla sua selezione.

Tramite la property `Configuration` imposterà la tabella nella quale salvare la configurazione dello SpreadSheet.
Tramite la property `SaveConfig` indicherà il _Command_ che si occuperà di persistere la configurazione su _DataShelf_.

#### 2. Configurator

Eseguirà il Book contenente lo SpreadSheet e, tramite il menu a tendina presente nel Ribbon, inserirà le tabelle nello SpreadSheeet.
Personalizzerà il contenuto dello SpreadSheet, inserirà stili e formattazioni custom.

Salverà infine quanto realizzato tramite un pulsante presente nel Ribbon che persisterà la configurazione su _DataShelf_.
Il _Command_ eseguito per salvare i dati sarà quello indicato dal _Designer_ nella property `SaveConfig`.

#### 3. EndUser

Eseguirà il Book e potrà visualizzare (e modificare) lo SpreadSheet preparato dal _Configurator_.

Nel dettaglio gli step saranno:

- Lettura della configurazione dello SpreadSheet (property `Configuration`)
- Estrazione delle tabelle bindate allo SpreadSheet
- Lettura del contenuto delle tabelle (dataDriven)
- Visualizzazione dei dati

L'EndUser potrà modificare le tabelle del Model, semplicemente modificando il contenuto delle celle.
Ogni modifica, se associata ad una dataSource, aggiornerà il dataSet.

Potrà inoltre eseguire le azioni messe a disposizione dal Designer tramite i `Button` del Ribbon.

---

## SpreadJS

- La libreria è composta da 2 moduli: un visualizzatore (`SpreadJs`) ed uno strumento per la creazione di fogli Excel (`Designer`) composto dal Ribbon + la parte Excel.

- [Funzionalità](https://www.grapecity.com/spreadjs/demos/features/workbook/initialization/react)
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

La presenza della tabella nel WorkBook verrà resa persistente al salvataggio della configurazione dell'Excel sullo Shelf.
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

**Config Irion (binding):**

```json
[
  {
    "sheet": "Sheet1",
    "table": "table1",
    "row": 8,
    "col": 1,
    "dataSource": "Customers"
  }
]
```

Per poter associare le 2 configurazioni ci sono 2 opzioni:

1. Nome della tabella
   Il nome viene associato in fase di creazione della tabella.
   L'utente potrà cambiarlo tramite il Ribbon (sezione `Table Design`), ~~ma non è presente un evento che intercetti questo cambiamento, rendendo difficile l'aggiornamento dell'associazione.~~
   Gestire il cambio nome con:

   ```js
   spread.commandManager().addListener('appListener', function (cmd) {
     console.log(cmd)
     if (cmd.command.cmd === 'Designer.setTableName') {
       console.log('table Name Changed')
     }
   })
   ```

   Nel caso in cui si vogliano aggiungere N tabelle sullo stesso WorkBook ci sarebbero inoltre dei problemi.

   >

2. Riferimento: foglio, riga, colonna (Sheet1!B52)
   Questo riferimento è univoco ma occorre gestire lo spostamento della tabella.

   - Drag & drop: occorre gestire l'evento di `DragDropBlockCompleted` in modo da aggiornare i riferimenti con la nuova posizione della tabella.

   - Copy & paste: occorre intercettare la copia di una tabella ed aggiornare i riferimenti.
     **Complicato**: all'evento di `ClipboardChanged` occorre capire che cosa si sta copiando (se una tabella o altro). Non semplice.

#### Definizione colonne

Le colonne di un binding tra SpreadSheet e Model possono esser:

1.  Derivate dallo Schema del dataSource
2.  Definite tramite la property `Columns` della dataSource

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
Questo può succedere a "design-time" (il Configurator inserisce 2 tabelle che collidono) ma anche a runtime (le tabelle hanno un set di dati maggiore di quello previsto dal Configurator e quindi collidono)

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

---

## [Supporto](https://www.grapecity.com/my-account/my-support)

| User             | Passwd       |
| ---------------- | ------------ |
| andreat@irion.it | p**\*\*\***a |

## ToDo

- [x] ~~Export di tabelle statiche nel JSON di SpreadJs~~
      Vengono esportate correttamente (con i dati)
- [ ] Come configurare il Ribbon
- [ ] Lettura tabella con la configurazione dal Model
- [ ] Check su ricaricamento dataMember multipli a fronte del click su un "Button" del Ribbon da parte dell'_EndUser_
  >
- [x] Manda mail a SpreadJs con:

  - C'è un evento che mi consente di intercettare il cambio nome per una tabella?
    Si:

  ```js
  spread.commandManager().addListener('appListener', function (cmd) {
    console.log(cmd)
    if (cmd.command.cmd === 'Designer.setTableName') {
      console.log('table Name Changed')
    }
  })
  ```

  - Funzionamento del copia e incolla delle tabelle
    [Vedi ticket](https://www.grapecity.com/my-account/my-support/case/17b8cdf5-07e0-eb11-bacb-0022482182de)
  - Documentazione sul Ribbon?
    Ad oggi non c'è una documentazione. Guardare l'esempio: https://codesandbox.io/s/spread-js-starter-forked-jf3i4
  - Definizioni dei tipi (TypeScript) per la parte _Designer_
    Ci stanno lavorando. Al momento non ci sono.

- [ ]

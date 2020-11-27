/**
 * This javascript file will constitute the entry point of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')

// if you want to use es6, you can do something like
//     require('./es6/myEs6code')
// here to load the myEs6code.js file, and it will be automatically transpiled.

// Change this to get detailed logging from the stomp library
global.DEBUG = false

const url = "ws://localhost:8011/stomp"
const client = Stomp.client(url)

client.debug = function (msg) {
  if (global.DEBUG) {
    console.info(msg)
  }
}


client.connect({}, connectCallback, function (error) {
  alert(error.headers.message)
})


class TableClass {

  constructor() {
    this.currencies = [];//Object of rowId & currency
    this.tableData = [];
  }

  addCurrency(currency) {
    this.currencies.push({
      'rowId': this.tableData.length,
      'currency': currency
    });
    return this.tableData.length;
  }

  renderTable() {
    this.tableData.sort((a, b) => {
      if (parseFloat(a.lastChangeBid) < parseFloat(b.lastChangeBid)) {
        return 1;
      } else {
        return -1
      }
    })

    let tBody = document.querySelector('table > tbody');
    while (tBody.firstChild) {
      tBody.removeChild(tBody.firstChild);
    }
    this.tableData.forEach((rowData) => {
      var row = document.createElement('tr');
      row.id = rowData.id;

      let rowItem;

      rowItem = document.createElement('td');
      rowItem.id = 'name';
      rowItem.innerText = rowData.name.toString();
      row.appendChild(rowItem);

      rowItem = document.createElement('td');
      rowItem.id = 'bestBid';
      rowItem.innerText = rowData.bestBid.toString();
      row.appendChild(rowItem);

      rowItem = document.createElement('td');
      rowItem.id = 'bestAsk';
      rowItem.innerText = rowData.bestAsk.toString();
      row.appendChild(rowItem);

      rowItem = document.createElement('td');
      rowItem.id = 'lastChangeAsk';
      rowItem.innerText = rowData.lastChangeAsk.toString();
      row.appendChild(rowItem);

      rowItem = document.createElement('td');
      rowItem.id = 'lastChangeBid';
      rowItem.innerText = rowData.lastChangeBid.toString();
      row.appendChild(rowItem);

      tBody.appendChild(row);
    })
  }

  renderRow(rowData) {
    try {
      let tBody = document.querySelector('table > tbody');
      var row = document.createElement('tr');
      row.id = rowData.id;

      let rowItem;
      rowItem = document.createElement('td');
      rowItem.id = 'name';
      rowItem.innerText = rowData.name.toString();
      row.appendChild(rowItem);

      rowItem = document.createElement('td');
      rowItem.id = 'bestBid';
      rowItem.innerText = rowData.bestBid.toString();
      row.appendChild(rowItem);

      rowItem = document.createElement('td');
      rowItem.id = 'bestAsk';
      rowItem.innerText = rowData.bestAsk.toString();
      row.appendChild(rowItem);

      rowItem = document.createElement('td');
      rowItem.id = 'lastChangeAsk';
      rowItem.innerText = rowData.lastChangeAsk.toString();
      row.appendChild(rowItem);

      rowItem = document.createElement('td');
      rowItem.id = 'lastChangeBid';
      rowItem.innerText = rowData.lastChangeBid.toString();
      row.appendChild(rowItem);

      tBody.appendChild(row);

    } catch (e) {
      console.log(e)
    }
  }

  pushTableRowAtIndex(index, currentRowData) {
    // index = 4 currentRowIndex=2
    let currentRowIndex;
    let localTableData = JSON.parse(JSON.stringify(this.tableData));

    for (let i = 0; i < localTableData.length; i++) {
      if (localTableData[i].id === currentRowData.id)
        currentRowIndex = i;
    }

    localTableData.splice(index, 0, currentRowData);

    if (index >= currentRowIndex) {
      //index remains same even after slicing
      localTableData.splice(currentRowIndex, 1);
    } else {
      //index changes by one
      localTableData.splice(currentRowIndex + 1, 1);
    }
    //update currentRow to its new index 
    this.tableData = localTableData;

  }

  pushIndex(currentRowData) {
    try {
      //calculate the index where the new element needs to be pushed
      if (this.tableData.length > 1) {
        let tBody = document.querySelector('table > tbody');

        for (let i = 0; i < this.tableData.length; i++) {
          if (this.tableData[i].id != currentRowData.id && (parseFloat(this.tableData[i].lastChangeBid) < parseFloat(currentRowData.lastChangeBid)) || this.tableData.length === i) {
            if (this.tableData.length !== i) {
              //push it to its new index            
              let currentRowEle = document.querySelector(`tr[id='${currentRowData.id}']`);
              let pushBeforeRowEle = document.querySelector(`tr[id='${this.tableData[i].id}']`);

              tBody.insertBefore(currentRowEle, pushBeforeRowEle);
              // //change the table order as well

              this.pushTableRowAtIndex(i, currentRowData);
            } else {
              //push the element at the last 
              let currentRowEle = document.querySelector(`tr[id='${currentRowData.id}']`);
              tBody.appendChild(currentRowEle);
              // //change the table order as well
              this.pushTableRowAtIndex(i, currentRowData);
            }
            break;
          }
        }
      }
    } catch (e) {
      console.log(e);
    }

  }

  createNewRow(currentRowData) {
    try {
      //push the new row
      let rowId = this.addCurrency(currentRowData.name);
      currentRowData.id = rowId;
      this.tableData.push(currentRowData);
      // this.renderRow(currentRowData);
      // this.pushIndex(currentRowData);

    } catch (e) {
      console.log(e);
    }
  }

  getRowId(key) {
    let rowId;
    this.currencies.forEach((ele) => {
      if (ele.currency === key)
        rowId = ele.rowId;
    })
    return rowId;
  }

  highlightItem(tRow) {
    tRow.classList.add('blink');
    setTimeout(function () {
      tRow.classList.remove('blink');
    }, 500);
  }

  updateRowItem(rowItem, value) {
    rowItem.innerText = value;
    this.highlightItem(rowItem);
  }

  updateTableRowData(newRowData) {
    let updateRowId;
    for (let i = 0; i < this.tableData.length; i++) {
      if (this.tableData[i].name === newRowData.name) {
        this.tableData[i].bestBid = newRowData.bestBid;
        this.tableData[i].bestAsk = newRowData.bestAsk;
        this.tableData[i].lastChangeAsk = newRowData.lastChangeAsk;
        this.tableData[i].lastChangeBid = newRowData.lastChangeBid;
        updateRowId = this.tableData[i].id;
        break;
      }
    }
    return this.tableData[updateRowId];
  }

  updateExistingRow(rowData) {
    rowData = this.updateTableRowData(rowData);
    let tRow = document.querySelector(`tr[id='${rowData.id}']`);
    if (tRow) {
      this.updateRowItem(tRow.querySelector('#name'), rowData.name);
      this.updateRowItem(tRow.querySelector('#bestBid'), rowData.bestBid);
      this.updateRowItem(tRow.querySelector('#bestAsk'), rowData.bestAsk);
      this.updateRowItem(tRow.querySelector('#lastChangeAsk'), rowData.lastChangeAsk);
      this.updateRowItem(tRow.querySelector('#lastChangeBid'), rowData.lastChangeBid);
    }
    // this.pushIndex(rowData);

  }

  checkIfAlreadyPresent(key) {
    try {
      let flag = false;
      this.currencies.forEach((ele) => {
        if (ele.currency === key) {
          flag = true
        }
      })
      return flag;
    } catch (e) {
      console.log(e);
    }
  }


  generateSparkLines(){
    try{
    const exampleSparkline = document.getElementById('chart')
    Sparkline.draw(exampleSparkline, [1, 2, 3, 6, 8, 20, 2, 2, 4, 2, 3])
    }catch(e){
      console.log(e);
    }
  }

}

const tableObj = new TableClass();

function connectCallback(result) {
  client.subscribe('/fx/prices', function (message) {
    if (message.body) {
      let result = JSON.parse(message.body);
      let isalreadyPresent = tableObj.checkIfAlreadyPresent(result.name)
      if (isalreadyPresent) {
        //update existing entry 
        tableObj.updateExistingRow(result);
      } else {
        //unqiue add an entry
        //push it in the currencies array
        tableObj.createNewRow(result);
      }

      tableObj.renderTable();
      tableObj.generateSparkLines();
    }
  });
}

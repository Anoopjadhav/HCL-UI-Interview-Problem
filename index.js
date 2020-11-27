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


// let tableData = [];
// function connectCallback(result) {
//   // document.getElementById('stomp-status').innerHTML = "It has now successfully connected to a stomp server serving price updates for some foreign exchange currency pairs."
//   client.subscribe('/fx/prices', function (message) {
//     console.log(JSON.parse(message.body));
//   });
// }


client.connect({}, connectCallback, function (error) {
  alert(error.headers.message)
})

// const exampleSparkline = document.getElementById('example-sparkline')
// Sparkline.draw(exampleSparkline, [1, 2, 3, 6, 8, 20, 2, 2, 4, 2, 3])



class TableClass {

  constructor() {
    this.currencies = [];//Object of rowId & currency
    this.tableData = [];
  }
  // currencies = [];
  // tableData = []; 
  addCurrency(currency) {
    this.currencies.push({
      'rowId': this.tableData.length,
      'currency': currency
    });

    return this.tableData.length;
  }

  renderRow(rowData, rowId) {
    try {
      let tBody = document.querySelector('table > tbody');
      var row = document.createElement('tr');
      row.id = rowId;
      // console.log(Object.keys(rowData));
      Object.keys(rowData).forEach((rowItemKey) => {
        if (rowItemKey) {
          if (rowItemKey === 'name' || rowItemKey === 'bestBid' || rowItemKey === 'bestAsk' || rowItemKey === 'lastChangeAsk' || rowItemKey === 'lastChangeBid') {
            let rowItem = document.createElement('td');
            rowItem.id = rowItemKey;
            rowItem.innerText = rowData[rowItemKey];
            row.appendChild(rowItem);
          }
        }
      })
      tBody.appendChild(row);

    } catch (e) {
      console.log(e)
    }
  }

  createNewRow(rowData) {
    try {
      //push the new row
      let rowId = this.addCurrency(rowData.name);
      rowData.id = rowId;
      this.tableData.push(rowData);
      this.renderRow(rowData, rowId);
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

  highlightItem(tRow){
    tRow.classList.add('blink');
    setTimeout(function(){
      tRow.classList.remove('blink');
    },2000);
  }

  updateRowItem(rowItem,value){
   rowItem.innerText = value;
   this.highlightItem(rowItem);
  }
  
  updateExistingRow(rowData) {
    let rowId = this.getRowId(rowData.name)
    let tRow = document.querySelector(`tr[id='${rowId}']`);
    if(tRow){
      this.updateRowItem(tRow.querySelector('#name'),rowData.name);
      this.updateRowItem(tRow.querySelector('#bestBid'),rowData.bestBid);
      this.updateRowItem(tRow.querySelector('#bestAsk'),rowData.bestAsk);
      this.updateRowItem(tRow.querySelector('#lastChangeAsk'),rowData.lastChangeAsk);
      this.updateRowItem(tRow.querySelector('#lastChangeBid'),rowData.lastChangeBid);
    }    
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


}

const tableObj = new TableClass();

function connectCallback(result) {
  client.subscribe('/fx/prices', function (message) {
    if (message.body) {

      let result = JSON.parse(message.body);

      let isalreadyPresent = tableObj.checkIfAlreadyPresent(result.name)
      // console.log(tableObj.currencies)
      if (isalreadyPresent) {
        //update existing entry 
        tableObj.updateExistingRow(result);
        console.log('already exists');
      } else {
        //unqiue add an entry
        //push it in the currencies array
        tableObj.createNewRow(result);
      }
    }
  });
}

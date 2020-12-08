
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Sparkline = factory();
  }
}(this, function () {


  /*
  hello,

  I have created the following two classes to handle the overall functionality in the same file- 
  
  TableClass -
  This handles the table rendering, creation of new rows/ updates on the existing rows, sorting of the rows etc.
  
  RowClass - 
  This stores all the row related data and functionality. ie row render functionality, sparks graph render methods, Timer functionality.
  

  Code execution - 
  1. Initially in the index.js file we create the tableObj.
  2. tableObj receives the data from the web socket randomly. This data is then used to create/update the row objects.
  3. Row objects then handles the actually dom updates. All the updates would be highlighted will a yellow background.
  4. As soon as the row object is created the setInterval function starts which will only keep the latest 30sec data in the array. 

  let me know incase any issues. 

  Thanks,
  Anoop

  anoopjadhav@gmail.com
  */

  function TableClass() {

    this.currencies = [];//Stores the map of unique id and currency
    this.tableData = [];//Stores the row objects


    this.addCurrency = function (currency) {
      this.currencies.push({
        'rowId': this.tableData.length,
        'currency': currency
      });
      return this.tableData.length;
    }


    //Function to create a new row in the tableData Obj
    this.createNewRow = function (currentRowData) {
      try {
        //currency list stores the unique mapping of the id and the currency name.
        //Add the new currency in the currencies list
        let rowId = this.addCurrency(currentRowData.name);

        //get the row id from the currency list
        currentRowData.id = rowId;

        let newRow = new Row(currentRowData.id, currentRowData.name, currentRowData.bestBid, currentRowData.bestAsk, currentRowData.lastChangeAsk, currentRowData.lastChangeBid);
        newRow.createRow();
        this.tableData.push(newRow);

        return true;

      } catch (e) {
        console.log(e);
        return false;
      }
    }

    //FUNCTION TO GET THE UNQIUE ID OF THE ROW BASED ON THE CURRENCY
    this.getRowId = function (key) {
      let rowId;
      this.currencies.forEach((ele) => {
        if (ele.currency === key)
          rowId = ele.rowId;
      })
      return rowId;
    }


    //FUNCTION TO UPDATE THE EXISITING ROW 
    this.updateExistingRow = function (rowData) {
      try {
        let updated = false;
        //Fetch Row ID from currency map
        let rowId = this.getRowId(rowData.name);

        //update the row
        this.tableData.forEach(ele => {
          if (ele.id == rowId) {
            updated = ele.updateRow(rowData);
          }
        })
        return updated;
      } catch (e) {
        console.log(e);
        return false;
      }
    }

    //FUNCTION TO CHECK IF THE ROW IS ALREADY PRESENT
    this.checkIfAlreadyPresent = function (key) {
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

    //FUNCTION TO SORT THE TABLE AND RERENDER THE ROWS
    this.sortTable = function () {
      try {
        this.tableData.sort((a, b) => {
          if (parseFloat(a.lastChangeBid) < parseFloat(b.lastChangeBid)) {
            return 1;
          } else {
            return -1
          }
        })
        this.rerenderTable();
        return true;
      } catch (e) {
        return false;
        console.log(e);
      }
    }

    //FUNCTION TO REARRANGE THE ROWS AS PER THE SORTING
    this.rerenderTable = function () {
      try {

        let tBody = document.querySelector('table > tbody');
        while (tBody.firstChild) {
          tBody.removeChild(tBody.firstChild);
        }

        this.tableData.forEach((ele) => {
          tBody.appendChild(ele.element);
        })

      } catch (e) {
        console.log(e);
      }
    }

  }

  function Row(tableId, name, bestBid, bestAsk, lastChangeAsk, lastChangeBid) {

    //Row data
    this.id = tableId;
    this.name = name;
    this.bestBid = bestBid;
    this.bestAsk = bestAsk;
    this.lastChangeAsk = lastChangeAsk;
    this.lastChangeBid = lastChangeBid;
    this.rowOrder = ['name', 'bestBid', 'bestAsk', 'lastChangeAsk', 'lastChangeBid', 'sparkline'];

    this.counter = 0;

    //current row dom element
    this.element = {};

    //Array which stores all the midPrice calculatons based on which the graph is rendered.
    this.midPriceArray = [];
    this.midPriceArrayTimestampMap = [];

    // FUNCTION TO RENDER THE CHART
    this.renderChart = function () {
      try {
        let tRow = document.querySelector(`tr[id='${this.id}']`);
        let exampleSparkline = tRow.getElementsByClassName('sparkline')
        Sparkline.draw(exampleSparkline[0], this.midPriceArray)

      } catch (e) {
        console.log(e);
      }
    }

    this.createRowItem = (id) => {
      try {
        let rowItem;
        rowItem = document.createElement('td');

        if (id === 'sparkline') {
          rowItem.classList.add('sparkline');
          rowItem.dataset.currency = this.name;
        } else {
          rowItem.id = id;
          rowItem.innerText = this[id].toString();
        }
        return rowItem;
      } catch (e) {
        console.log(e);
      }
    }

    //FUNCTION TO CREATE A NEW TABLE ROW AND RENDER IT ON THE DOM
    this.createRow = () => {
      try {
        let tBody = document.querySelector('table > tbody');
        var row = document.createElement('tr');
        row.id = this.id;

        this.rowOrder.forEach(rowName => {
          row.appendChild(this.createRowItem(rowName));
        })

        //set this element in an obj attr as it will be required for sorting and rerendering
        this.element = row;
        tBody.appendChild(row);

        this.calculateMidPrice();

        return true;

      } catch (e) {
        console.log(e);
        return false;
      }
    }

    //Function to calculate the midPrice 
    this.calculateMidPrice = function () {
      try {
        let calculatedMidPrice = (this.bestBid + this.bestAsk) / 2;

        this.midPriceArrayTimestampMap.push({
          value: calculatedMidPrice,
          time: new Date()
        })

        let midPriceArrTemp = [];

        this.midPriceArrayTimestampMap = this.midPriceArrayTimestampMap.filter(ele => {
          let currentTime = new Date();
          //check if the stored value timestamp is older than 30secs
          if (currentTime.getTime() - ele.time.getTime() <= 30000) {
            midPriceArrTemp.push(ele.value);
            return true;
          } else {
            //remove the entry older than 30sec
            return false;
          }
        })

        this.midPriceArray = midPriceArrTemp;

        if (this.name == 'gbpjpy') {
          console.log(midPriceArrTemp);
        }
        setTimeout(() => {
          this.renderChart();
        }, 0)

      } catch (e) {
        console.log(e);
      }
    }

    //FUNCTION TO UPDATE THE EXISTING ROW
    this.updateRow = function ({ name, bestBid, bestAsk, lastChangeAsk, lastChangeBid }) {
      try {
        //assign the new values
        this.name = name;
        this.bestBid = bestBid;
        this.bestAsk = bestAsk;
        this.lastChangeAsk = lastChangeAsk;
        this.lastChangeBid = lastChangeBid;

        //update the DOM accordingly 
        let tRow = document.querySelector(`tr[id='${this.id}']`);

        if (tRow) {
          this.updateRowItem(tRow.querySelector('#name'), this.name);
          this.updateRowItem(tRow.querySelector('#bestBid'), this.bestBid);
          this.updateRowItem(tRow.querySelector('#bestAsk'), this.bestAsk);
          this.updateRowItem(tRow.querySelector('#lastChangeAsk'), this.lastChangeAsk);
          this.updateRowItem(tRow.querySelector('#lastChangeBid'), this.lastChangeBid);
        }

        this.calculateMidPrice();

        return true;

      } catch (e) {
        console.log(e);
        return false;
      }

    }

    this.updateRowItem = function (rowItem, value) {
      rowItem.innerText = value;
    }
  }

  return TableClass;

}));
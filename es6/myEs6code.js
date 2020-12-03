
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Sparkline = factory();
  }
}(this, function () {

  function TableClass() {
    this.currencies = [];//Object of rowId & currency
    this.tableData = [];
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

      } catch (e) {
        console.log(e);
      }
    }
    this.getRowId = function (key) {
      let rowId;
      this.currencies.forEach((ele) => {
        if (ele.currency === key)
          rowId = ele.rowId;
      })
      return rowId;
    }
    this.updateExistingRow = function (rowData) {
      //Fetch Row ID from currency map
      let rowId = this.getRowId(rowData.name);

      //update the row
      this.tableData.forEach(ele => {
        if (ele.id == rowId) {
          ele.updateRow(rowData);
        }
      })
    }
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
    this.sortTable = function(){
      try{
        this.tableData.sort((a, b) => {
          if (parseFloat(a.lastChangeBid) < parseFloat(b.lastChangeBid)) {
            return 1;
          } else {
            return -1
          }
        })
        this.rerenderTable();
      }catch(e){
        console.log(e);
      }
    }
    this.rerenderTable = function(){
      try{

      }catch(e){
        console.log(e);
      }
    }

  }

  function Row(tableId, name, bestBid, bestAsk, lastChangeAsk, lastChangeBid) {
    this.id = tableId;
    this.name = name;
    this.bestBid = bestBid;
    this.bestAsk = bestAsk;
    this.lastChangeAsk = lastChangeAsk;
    this.lastChangeBid = lastChangeBid;
    this.midPriceArray = [];
    this.element={};

    this.renderChart = function () {
      try {
        let tRow = document.querySelector(`tr[id='${this.id}']`);
        let exampleSparkline = tRow.getElementsByClassName('sparkline')
        Sparkline.draw(exampleSparkline[0], this.midPriceArray)
      } catch (e) {
        console.log(e);
      }
    }

    this.createRow = () => {
      try {
        let tBody = document.querySelector('table > tbody');
        var row = document.createElement('tr');
        row.id = this.id;

        let rowItem;
        rowItem = document.createElement('td');
        rowItem.id = 'name';
        rowItem.innerText = this.name.toString();
        row.appendChild(rowItem);

        rowItem = document.createElement('td');
        rowItem.id = 'bestBid';
        rowItem.innerText = this.bestBid.toString();
        row.appendChild(rowItem);

        rowItem = document.createElement('td');
        rowItem.id = 'bestAsk';
        rowItem.innerText = this.bestAsk.toString();
        row.appendChild(rowItem);

        rowItem = document.createElement('td');
        rowItem.id = 'lastChangeAsk';
        rowItem.innerText = this.lastChangeAsk.toString();
        row.appendChild(rowItem);

        rowItem = document.createElement('td');
        rowItem.id = 'lastChangeBid';
        rowItem.innerText = this.lastChangeBid.toString();
        row.appendChild(rowItem);

        rowItem = document.createElement('td');
        rowItem.classList.add('sparkline');
        //create a sparline element
        row.appendChild(rowItem);

        this.element = row;
        tBody.appendChild(row);

        //calculate the mid price
        this.calculateMidPrice();

      } catch (e) {
        console.log(e);
      }
    }

    this.updateRow = function ({ name, bestBid, bestAsk, lastChangeAsk, lastChangeBid }) {
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
    }

    this.highlightItem = function (tRow) {
      tRow.classList.add('blink');
      setTimeout(function () {
        tRow.classList.remove('blink');
      }, 500);
    }

    this.updateRowItem = function (rowItem, value) {
      rowItem.innerText = value;
      this.highlightItem(rowItem);
    }

    this.calculateMidPrice = function () {
      try {
        let calculatedMidPrice = (this.bestBid + this.bestAsk) / 2;
        if (this.midPriceArray.length > 300) {
          this.midPriceArray.pop();
          this.midPriceArray.unshift(calculatedMidPrice);
        } else {
          this.midPriceArray.push(calculatedMidPrice);
        }

        console.log(this.midPriceArray);
        setTimeout(() => {
          this.renderChart();
        }, 0)

      } catch (e) {
        console.log(e);
      }
    }

  }

  return TableClass;

}));
/**
 * This javascript file will constitute the entry point of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

const sparkline = require('./site/sparkline')

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')

Sparkline = require('./site/sparkline')

Sparkline.options = {
  width: 670,
  lineColor: "blue",
  lineWidth: 1,
  startColor: "green",
  endColor: "red",
  maxColor: "transparent",
  minColor: "transparent",
  minValue: null,
  maxValue: null,
  dotRadius: 2.5,
  tooltip: null
};
// if you want to use es6, you can do something like
TableClass = require('./es6/myEs6code')
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


const tableObj = new TableClass();

//Create an object of the table Class
tableObj.calculateMidPrice();

setInterval(function(){
  tableObj.renderChart();
},100)


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

    }
  });
}



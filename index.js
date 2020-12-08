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
    width: 400,
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

/********Code Starts Here********** */

// Created a TableClass to encapsulate all the Table related functions. 
// The class is present in the es6 folder named as myES6code.js

//Create an object of the table Class
const tableObj = new TableClass();

//In the connectCallback we get the dummy response from the web socket. 
function connectCallback(result) {
    client.subscribe('/fx/prices', function (message) {
        if (message.body) {
            console.log(message.body);
            let result = JSON.parse(message.body);

            //Check if the current currency is already present in the table
            let isalreadyPresent = tableObj.checkIfAlreadyPresent(result.name)

            if (isalreadyPresent) {
                //if present then update the existing entry in the object i.e tableData 
                tableObj.updateExistingRow(result);
            } else {
                //if not present then add a new entry in the tableData list
                //also push the new currency in the currencies array
                tableObj.createNewRow(result);
            }
            // Sort Table
            tableObj.sortTable();
        }
    });
}
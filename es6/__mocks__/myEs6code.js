jsDom = require('jsdom')
const dom = new jsDom.JSDOM()
global.document = dom.window.document
global.window = dom.window

let table = document.createElement('table');
let tableBody = document.createElement('tbody');
table.appendChild(tableBody);
document.body.appendChild(table);




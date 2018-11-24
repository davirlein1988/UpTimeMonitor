/*
 *Primary file for API
 */
 //dependencies

var server = require('./lib/server');
var workers = require('./lib/workers'); 

//App
var app = {};


app.init = function(){
  //Strat server
  server.init();

  //start workers
  workers.init();
};


//Execute
app.init();

//Export app
module.exports = app;
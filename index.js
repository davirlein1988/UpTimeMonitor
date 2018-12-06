/*
 *Primary file for API
 */
 //dependencies

var server = require('./lib/server');
var workers = require('./lib/workers'); 
var cli = require('./lib/cli');

//App
var app = {};


app.init = function(){
  //Strat server
  server.init();

  //start workers
  workers.init();

  //start cli
  setTimeout(function(){
    cli.init();
  }, 50);
};


//Execute
app.init();

//Export app
module.exports = app;
/*
 * Server tasks
 *
 */


//Dependencies

const http = require("http");
const https = require("https");
var url = require("url");
var StringDecoder = require("string_decoder").StringDecoder;
var config = require('./config');
var fs = require('fs');
var data = require('./data');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');
var util = require('util');
var debug = util.debuglog('server');
//Instanciate server object
var server = {};

//
//instantiating the server
server.httpServer = http.createServer(function(req, res) {
  server.unifiedServer(req, res);
});



//Instantiate the https server
server.httpsServerOptions = {
  'key' : fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert' : fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res) {
  server.unifiedServer(req, res);
});


//Unified server for both http and https
server.unifiedServer = function(req, res){
  //Get an url and parse it
  var parsedUrl = url.parse(req.url, true);
  // get the path from the url
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  //Get the query string as an object
  var queryStringObj = parsedUrl.query;

  //Get the http method
  var method = req.method.toLowerCase();

  //Get th headers
  var headers = req.headers;

  //get the payload if present

  var decoder = new StringDecoder("utf-8");
  var buffer = "";
  req.on("data", function(data) {
    buffer += decoder.write(data);
  });
  req.on("end", function() {
    buffer += decoder.end();

    //Where this request should be sent to
    var chosenHandler =  typeof(server.router[trimmedPath]) !== "undefined"
        ? server.router[trimmedPath]
        : handlers.notFound;

    //construct data object
    var data = {
      "trimmedPath" : trimmedPath,
      "queryStringObj" : queryStringObj,
      "method" : method,
      "headers" : headers,
      "payload" : helpers.parseJsonToObject(buffer)
    };

    //Route the request to the handler

    chosenHandler(data, function(statusCode, payload) {
      //Status code call by the handler of default 200
      statusCode = typeof(statusCode) == "number" ? statusCode : 200;
      // Use the payload called back by the handler, or defaults empty obj

      payload = typeof(payload) == "object" ? payload : {};

      // Conver payload to string
      var payloadString = JSON.stringify(payload);

      //return response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode);
      res.end(payloadString);
      //If response 200 print green else red
      if(statusCode == 200){
        debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
      } else {
        debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);
      }
    });
  });
};

//define a router
server.router = {
  'ping': handlers.ping,
  'users' : handlers.users,
  'tokens' : handlers.tokens,
  'checks' : handlers.checks
};

//Init script
server.init = function(){
  //Server http starts
  server.httpServer.listen(config.httpsPort, function() {
  console.log('\x1b[36m%s\x1b[0m', 'Sever listening on port'+config.httpsPort);
  });
//start https server
  server.httpsServer.listen(config.httpPort, function() {
  console.log('\x1b[35m%s\x1b[0m', 'Sever listening on port'+config.httpsPort);
  });

}

//Export server

module.exports = server;
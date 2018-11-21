/*
 *Primary file for API
 */

//Dependencies

const http = require("http");
const https = require("https");
var url = require("url");
var StringDecoder = require("string_decoder").StringDecoder;
var config = require('./config');
var fs = require('fs');
var data = require('./lib/data');

// @TODO delete this
data.delete('test', 'newFile', function(err, data){
  console.log('This was the error', err);
});

//instantiating the server
var httpServer = http.createServer(function(req, res) {
  unifiedServer(req, res);
});

//Server starts
httpServer.listen(config.httpsPort, function() {
  console.log("Sever listening on port "+config.httpsPort );
});

//Instantiate the https server
var httpsServerOptions = {
  'key' : fs.readFileSync('./https/key.pem'),
  'cert' : fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer(req, res);
});

//start https server
httpsServer.listen(config.httpPort, function() {
  console.log("Sever listening on port "+config.httpPort );
});



//Unified server for both http and https
var unifiedServer = function(req, res){
  //Get an url and parse it
  var parsedUrl = url.parse(req.url, true);
  // get the path from the url
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, "");

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
    var chosenHandler =  typeof(router[trimmedPath]) !== "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    //construct data object
    var data = {
      "trimmedPath" : trimmedPath,
      "queryStringObj" : queryStringObj,
      "method" : method,
      "headers" : headers,
      "payload" : buffer
    };

    //Route the request to the handler

    chosenHandler(data, function(statusCode, payload) {
      //Status code call by the handler of default 200
      statusCode = typeof statusCode == "number" ? statusCode : 200;
      // Use the payload called back by the handler, or defaults empty obj

      payload = typeof payload == "object" ? payload : {};

      // Conver payload to string
      var payloadString = JSON.stringify(payload);

      //return response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log("Returning this response: " + statusCode, payloadString);
    });
  });
};
//define handlers
var handlers = {};


// ping handler
handlers.ping = function(data, callback){
  callback(200);
}
//not found handler
handlers.notFound = function(data, callback) {
  callback(404);
};
//define a router
var router = {
  'ping': handlers.ping
};

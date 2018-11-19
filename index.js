/*
 *Primary file for API
 */

//Dependencies

const http = require("http");
var url = require("url");
var StringDecoder = require("string_decoder").StringDecoder;
var config = require('./config');

//Server should respond to all requests with a string
var server = http.createServer(function(req, res) {
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
});

//Server starts
server.listen(config.port, function() {
  console.log("Sever listening on port "+config.port+ " in "+config.envName+" mode" );
});
//define handlers
var handlers = {};

//sample handler
handlers.sample = function(data, callback) {
  //callback of http staus code and payload
  callback(406, { name: "sample handler" });
};
//not found handler
handlers.notFound = function(data, callback) {
  callback(404);
};
//define a router
var router = {
  sample: handlers.sample
};

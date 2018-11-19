/*
 *Primary file for API
 */

//Dependencies

const http = require("http");
var url = require("url");
var StringDecoder = require("string_decoder").StringDecoder;

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

  //get the payload

  var decoder = new StringDecoder("utf-8");
  var buffer = "";
  req.on("data", function(data) {
    buffer += decoder.write(data);
  });
  req.on("end", function() {
    buffer += decoder.end();

    // send the response
    res.end("Hello world!!\n");
    //Log the request
    console.log("request received with this payload " + buffer);
  });
});

//Server should strat at certain port
server.listen(3000, function() {
  console.log("Sever listening on pot 3000 at the momment");
});

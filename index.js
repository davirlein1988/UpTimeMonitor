/*
 *Primary file for API
 */

//Dependencies

const http = require("http");

//Server should respond to all requests with a string
var server = http.createServer(function(req, res) {
  res.end("Hello world!!\n");
});

//Server should strat at certain port
server.listen(3000, function() {
  console.log("Sever listening on pot 3000 at the momment");
});

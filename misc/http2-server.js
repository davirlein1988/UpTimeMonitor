var http2 = require('http2');

var server = http2.createServer();

//on stream send back 

server.on('stream', function(stream, headers){
    stream.respond({
        'status' : 200,
        'content/type' : 'text/html'
    });
    stream.end("<html><p>Server response</p></html>");
});

//Listen in port

server.listen(6000);
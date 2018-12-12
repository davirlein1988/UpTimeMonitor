//Udp clien message to server

var dgram = require('dgram');

var client = dgram.createSocket('udp4');


//Message

var messageString = 'this is my message to server';
var messageBuffer =  Buffer.from(messageString);

client.send(messageBuffer, 6000, 'localhost', function(err){
    client.close();
});
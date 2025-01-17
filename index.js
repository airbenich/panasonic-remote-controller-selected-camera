var app = require('express')();
var http = require('http');
var httpServer = http.createServer(app);
var io = require('socket.io')(httpServer);
const axios = require('axios');

console.log('\033c'); // clear terminal
console.log('Panasonic AW-RP150 Selected Camera AUX Switcher');

// Include Nodejs' net module.
const Net = require('net');
// The port on which the server is listening.
const port = 62000;

// Use net.createServer() in your code. This is just for illustration purpose.
// Create a new TCP server.
const server = new Net.Server();
// The server listens to a socket for a client to make a connection request.
// Think of a socket as an end point.
server.listen(port, function() {
    console.log('Server listening for panasonic AW-RP150 connection requests on socket localhost: ' + port);
});

// When a client requests a connection with the server, the server creates a new
// socket dedicated to that client.
server.on('connection', function(socket) {
    console.log('A new connection has been established.');

    // Now that a TCP connection has been established, the server can send data to
    // the client by writing to its socket.
    // socket.write('Hello, client.');

    // The server can also receive data from the client by reading from its socket.
    socket.on('data', function(chunk) {
        // console.log('Data received from client: ' + chunk.toString());
        // console.log(chunk);
        // console.log(String.fromCharCode(chunk.toString()));
        var rawCommand = chunk.toString();
        var cleanCommand = rawCommand.replace('\x02','').replace('\x03','');
        
        var command = cleanCommand.split(':');
        console.log(command);
        if(command[0] == 'SBUS' && command[1] == '113') {
            selectCamera(parseInt(command[2]));
        }
        
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('end', function() {
        console.log('Closing connection with the client');
    });

    // Don't forget to catch error, for your own sake.
    socket.on('error', function(err) {
        console.log(`Error: ${err}`);
    });
});

var cameraButtonMapping = [];
cameraButtonMapping[1] = 1;
cameraButtonMapping[2] = 2;
cameraButtonMapping[3] = 3;
cameraButtonMapping[4] = 4;

function selectCamera(number) {
    console.log('Selected Camera ' + number);
    sendCommandToAllWebsocketClients('selectedCamera', number);
    sendRequestToStreamDeck(12, 1, cameraButtonMapping[number]);
}

function sendRequestToStreamDeck(bank, row, column) {
  ///api/location/<page>/<row>/<column>/press
  console.log('http://10.1.1.30:8000/api/location/' + bank + '/' + row + '/' + column + '/press');

  axios.post('http://10.1.1.30:8000/api/location/' + bank + '/' + row + '/' + column + '/press')
  .then(function (response) {
    console.log("Response: " + response.data);
  })
  .catch(function (error) {
    console.log(error);
  });
}









/*
 * Websocket server
 *
 * 
 */
var websocketClients = new Array();
var websocketPort = 3000;

httpServer.listen(websocketPort, () => {
  console.log('Websockets listening on *:' +  websocketPort);
});

// Authentication
io.use(function(socket, next){
  // console.log("Query: ", socket.handshake.query);
  // return the result of next() to accept the connection.
  if (socket.handshake.query.authentication == "sDJZn16TuP7zu82a") {
      return next();
  }
  // call next() with an Error if you need to reject the connection.
  next(new Error('Authentication error'));
});

// on conncection
io.on('connection', function(socket){
  console.log('Websocket client connected');

  // add client to clientlist
  websocketClients.push(socket);

  // return 'connected'
  socket.emit('connetion',true);


  socket.on('disconnect', function(){
    console.log('Client disconnected');
  });
});

function sendCommandToAllWebsocketClients(key, value) {
  websocketClients.forEach(function (websocketClient) {
    websocketClient.emit(key, value);
  });
}

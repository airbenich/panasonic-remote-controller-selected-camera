const http = require('http');
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
cameraButtonMapping[1] = 2;
cameraButtonMapping[2] = 3;
cameraButtonMapping[3] = 4;
cameraButtonMapping[4] = 5;

function selectCamera(number) {
    console.log('Selected Camera ' + number);
    sendCommandToAllWebsocketClients('selectedCamera', number);
    sendRequestToStreamDeck(10,cameraButtonMapping[number]);
}

function sendRequestToStreamDeck(bank,button) {
    http.get('http://172.17.121.11:8000/press/bank/' + bank + '/' + button, (resp) => {
      let data = '';
    
      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        data += chunk;
      });
    
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        console.log(data);
      });
    
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
}









/*
 * Websocket server
 *
 * 
 */
var websocketClients = new Array();

var io = require('socket.io')(http);
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
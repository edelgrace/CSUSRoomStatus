var net = require('net');
var config = require('./config/config.json');
var room = require('./Room.js');
var dateTime = require('node-datetime');

var arduinoStatus = true;
var prevArduinoStatus = true;
var delay = 2*60*1000; // 2 minutes
var dt = dateTime.create();
var timestamp = dt.now();
var roomStatus = true;

// event emitter
var eventEmitter = room.emitter;

// arduino says room is open
eventEmitter.on('open', function() {	
  roomStatus = true;
  
  var time = dt.format("H:M");

  botMsg = "**" + time + ":** The CSUS room is *OPEN*";

  sendMessage(botMsg);
});

// arduino says room is closed
eventEmitter.on('closed', function() {
  roomStatus = false;

  var dt = dateTime.create();
  var time = dt.format("H:M");

  botMsg = "**" + time + ":** The CSUS room is *CLOSED*";

  sendMessage(botMsg);
});

// arduino says it's still running
eventEmitter.on('arduino on', function() {
  arduinoStatus = true;

  if (!prevArduinoStatus) {
    var dt = dateTime.create();
    var time = dt.format("H:M");

    timestamp = dt.now();
    prevArduinoStatus = arduinoStatus;

    botMsg = "**" + time + ":** The arduino is *WORKING*";
    
    sendMessage(botMsg);
  }

});

// create a client to send to sever
var client = new net.Socket();

client.connect(config.port, config.address, function() {
  console.log('Connected to server');
});

// on error, try to reconnect after delay
client.on('close', function(err) {
  console.log(err);
});

// on error, try to reconnect after delay
client.on('error', function(err) {
  console.log(err);

  client.setTimeout(1000*10, function() {
    client.connect(config.port, config.address);
  });
});

// send information to the bot
function sendMessage(message) {
  client.write(message);
}

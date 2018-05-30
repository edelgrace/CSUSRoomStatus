/*
Date: 	2018-05-28
Author: Edel Altares
Description: Will read from the Arduino
*/

var exports = module.exports = {};

var SerialPort = require("serialport");
var logger = require('winston');
var dateTime = require('node-datetime');

// global variables
var prev_value = 0;
var curr_value = 0;
var room_status = true;
const delay = 30*1000; // 30 seconds
var dt = dateTime.create();

var timestamp = dt.now();

// logger settings
logger.level = 'debug';
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});

// create a parser
var Readline = SerialPort.parsers.Readline;
var parser = new Readline();

// create an event emitter
var events = require('events');
var em = new events.EventEmitter();

exports.emitter = em;

// open the port
var serialport = new SerialPort("COM3", {baudRate: 9600});

// add parser
serialport.pipe(parser);

// get data as it's coming through
parser.on('data', function(data){
  // current time
  var time = dt.now();
	
  curr_value = parseInt(data, 10);

  var difference = curr_value - prev_value;

  // compare the previous readings
  if(Math.abs(difference) >= 300) {
    
    // room is open
    if(difference < 0) {
      if (!room_status & time > timestamp + delay) {
        logger.info(time + " ROOM OPEN");
        room_status = true;        
        em.addListener('open', function () {});
        em.emit('open');
        
      }
    }

    // room is closed
    else {
      if(room_status & prev_value != 0 & time > timestamp + delay) { 
        logger.info(time + " ROOM CLOSED");
        room_status = false;     
        em.addListener('closed', function () {});
        em.emit('closed');
      }
    }
  }
  
  prev_value = curr_value;
  timestamp = time;
});

// connected
serialport.on('open', function(){
  logger.info('Serial Port Opend');
});

// error
serialport.on("error", function(err, callback) {
  logger.error(err);
});

exports.Status = function() {
  return "**CLOSED**";
};
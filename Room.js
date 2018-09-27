/*
Date: 	2018-05-28
Author: Edel Altares
Description: Will read from the Arduino
*/

var exports = module.exports = {};

var auth = require('./config/auth.json');
var SerialPort = require("serialport");
var logger = require('winston');
var dateTime = require('node-datetime');

// global variables
var prev_value = 0;
var curr_value = 0;
var room_status = true;
var change = false;
const delay = 10*1000; // 30 seconds
var dt = dateTime.create();

var timestamp = dt.now();
var arduino_timestamp = dt.now();
var prev_time = dt.now();

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
var serialport = new SerialPort(auth.port, {baudRate: 9600});

// add parser
serialport.pipe(parser);

// get data as it's coming through
parser.on('data', function(data){
  // current time
  var time = dt.now();
  prev_time = time;
	
  curr_value = parseInt(data, 10);

  var difference = curr_value - prev_value;

  // compare the previous readings
  if(Math.abs(difference) >= 300 & prev_value != 0) {
    change = true;
    logger.info("CHANGE: " + difference);
  }
  else {
    logger.info("NO CHANGE: " + difference);
  }
  
  // once a change is detected and 30s has passed by
  if (change & time > timestamp + delay) {    
    change = false;
    
    // check if reading doesnt matches status
    if((curr_value > 900 & room_status) | (curr_value < 900 & !room_status)) {
      room_status = !room_status;
      logger.info("REAL");
      
      // send alert
      send_alert(time, room_status);
    }
    else {
      logger.info("FAKE");
    }
    
    
  }
  
  if(!change) {
    timestamp = time;
  }
  
  logger.info(dateTime.create().now());
  logger.info("30 sec: " + (time > timestamp + delay));
  logger.info("currnt: " + curr_value);
  logger.info("roomst: " + room_status);
  logger.info("change: " + change);
  logger.info("--------------------------");
  prev_value = curr_value;

});

// connected
serialport.on('open', function(){
  logger.info('Serial Port Opend');
});

// error
serialport.on("error", function(err, callback) {
  logger.error(err);
});

// check if no response from the arduino every minute
function checkArduino() {
  var dt = dateTime.create();
  var time = dt.now();

  if(arduino_timestamp + 2*delay > prev_time) {
    arduinoStatus = false;

    botMsg = "**" + dt.format("H:M") + ":** The arduino is *NOT WORKING*";
    //sendMessage(botMsg);
  }
}
setInterval(checkArduino, 60*1000);

// send alert
function send_alert(time, state) {
  var status = "closed";

  if(state) {
    status = "open";
  }
  
  logger.info(time + " room " + status);

  em.addListener(status, function () {});
  em.emit(status);
}

exports.Status = function() {
  return "**CLOSED**";
};
/*
Date: 	2018-05-28
Author: Edel Altares
Description: Will read from the Arduino
*/

var exports = module.exports = {};

var SerialPort = require("serialport");

// create a parser
var Readline = SerialPort.parsers.Readline;
var parser = new Readline();

// open the port
var serialport = new SerialPort("COM3", {baudRate: 9600});

// add parser
serialport.pipe(parser);
parser.on('data', logger.info);

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
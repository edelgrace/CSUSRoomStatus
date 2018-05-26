// Date: 2018-05-14
// Author: Edel Altares
// Description: Discord bot for the CSUS UCalgary server

var auth = require('./auth.json');
var logger = require('winston');
var Discord = require('discord.io');
var room = require('./Room.js');

// logger settings
logger.level = 'debug';
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});

var SerialPort = require("serialport");

// start a parser
var Readline = SerialPort.parsers.Readline;
var parser = new Readline();

// open the port
var serialport = new SerialPort("COM5", {baudRate: 9600});

// add parser
serialport.pipe(parser);
parser.on('data', logger.info);

// connected
serialport.on('open', function(){
  logger.info('Serial Port Opend');
});

serialport.on("error", function(err, callback) {
  logger.error(err);
});

// initialize the bot
var bot = new Discord.Client({
  token: auth.token,
  autorun: true
});

logger.info("Bot created");

// log connection
bot.on('ready', function (event) {
  logger.info('Bot connected to server');
  logger.info('Bot logged in as: ' + bot.username + ' - (' + bot.id + ')');
});

// log any errors
bot.on('disconnect', function(error, code) {
  logger.error(error);
  logger.error(code);
});

// check the messages
bot.on('message', function (user, userID, channelID, message, event) {
  msg = message.trim();
  msg = msg.toLowerCase();

  // check if a bot command
  if(msg.startsWith(".csus")) {
    botMsg = "";

    switch(msg) {
      // CSUS ROOM STATUS
      case '.csus room':
        roomStatus = room.Status();

        botMsg = "The CSUS room is " + roomStatus;

        // send a response
        bot.sendMessage({
          to: channelID,
          message: botMsg
        });

        break;

      // COMMAND NOT RECOGNIZED
      default:
        botMsg = "Are you trying to talk to *CSUSBot*? Your command was not recognized";

        bot.sendMessage({
          to: channelID,
          message: botMsg
        });

    }

    // log the interaction
    logger.info("[" + user + "]: " + msg);
    logger.info("[CSUSBot]: " + botMsg);
  }
  
});
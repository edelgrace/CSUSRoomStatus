// Date: 2018-05-14
// Author: Edel Altares
// Description: Discord bot for the CSUS UCalgary server

var auth = require('./auth.json');
var logger = require('winston');
var Discord = require('discord.io');
var net = requite('net');

// logger settings
logger.level = 'debug';
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});

// create server
var server = net.createServer(function(client) {
  logger.log('Arduino connected: ' + client.remoteAddress);

  client.setEncoding('utf-8');
  client.setTimeout(1000);
});

server.listen(() => {
  logger.log('Opened server on ' + server.address);
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

// connect
io.on('connection', function(socket) {
  logger.info('Arduino connected');
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
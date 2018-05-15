// Date: 2018-05-14
// Author: Edel Altares
// Description: Discord bot for the CSUS UCalgary server

var auth = require('./auth.json');
var logger = require('winston');
var Discord = require('discord.io');

// logger settings
logger.level = 'debug';
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});

logger.info(auth.token);

// initialize the bot
var bot = new Discord.Client({
  token: auth.token,
  autorun: true
});

logger.info("Bot created");

bot.on('ready', function (event) {
  logger.info('Bot connected to server');
  logger.info('Logged in as: ' + bot.username + ' - (' + bot.id + ')');
});

bot.on('disconnect', function(error, code) {
  logger.error(error);
  logger.error(code);
});

bot.on('message', function (user, userID, channelID, message, event) {
  // look for messages starting with '!'
  if (message.substring(0,1) == '!'){
    var args = message.substring(1).split(' ');
    var cmd = args[0];

    args = args.splice(1);

    switch(cmd) {
      // !status
      case 'status':
        bot.sendMessage({
          to: channelID,
          message: 'The CSUS room is '
        });
        break;
        
    }
  }
});
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

// initialize the bot
var bot = new Discord.Client({
  token: auth.token,
  autorun: true
});

logger.info("Bot created");

bot.on('ready', function (event) {
  logger.info('Bot connected to server');
  logger.info('Bot logged in as: ' + bot.username + ' - (' + bot.id + ')');
});

bot.on('disconnect', function(error, code) {
  logger.error(error);
  logger.error(code);
});

bot.on('message', function (user, userID, channelID, message, event) {
  msg = message.trim();
  msg = msg.toLowerCase();

  if(msg.startsWith(".csus")) {

    switch(cmd) {
      // !status
      case '.csus room':
        bot.sendMessage({
          to: channelID,
          message: 'The CSUS room is '
        });
        break;
        
    }
  }
  
});
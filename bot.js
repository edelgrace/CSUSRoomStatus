// Date: 2018-05-14
// Author: Edel Altares
// Description: Discord bot for the CSUS UCalgary server

var auth = require('./config/auth.json');
var logger = require('winston');
var Discord = require('discord.io');
var room = require('./Room.js');
var dateTime = require('node-datetime');

const csus_channel = "451174282412818433";
// const csus_channel = "445744499185025037";

const HELP_MSG = '```.csus help   \t get the list of commands and contact info\n' +
  '.csus room   \t get the room status\n' +
  '.csus arduino\t get the arduino status\n\n```' + 
  'Questions? Email us at **csus@ucalgary.ca**\n' + 
  'Contribute! **<https://github.com/edelgrace/CSUSRoomStatus>**';

var roomStatus = true;

// event emitter
var eventEmitter = room.emitter;

// datetime
var dt = dateTime.create();

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

// log connection
bot.on('ready', function (event) {
  logger.info('Bot connected to server');
  logger.info('Bot logged in as: ' + bot.username + ' - (' + bot.id + ')');
});

eventEmitter.on('open', function() {	
  roomStatus = true;
  
  var dt = dateTime.create();
  var time = dt.format("H:M");

  botMsg = "**" + time + ":** The CSUS room is *OPEN*";

  sendMessage(botMsg, csus_channel);
});

eventEmitter.on('closed', function() {
  roomStatus = false;

  var dt = dateTime.create();
  var time = dt.format("H:M");

  botMsg = "**" + time + ":** The CSUS room is *CLOSED*";

  sendMessage(botMsg, csus_channel);
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
    var dt = dateTime.create();
    var time = dt.format("H:M");
    botMsg = "**" + time + ":** ";
    
    switch(msg) {
      // CSUS ROOM STATUS
      case '.csus room':
        var state = "";
        
        if(roomStatus) {
          state = "*OPEN*";
        }
        else {
          state = "*CLOSED*"
        }
		
        botMsg += "The CSUS room is " + state;

        // send a response
        sendMessage(botMsg, channelID);

        break;


      // ASK FOR HELP
      case '.csus help':
        sendMessage(HELP_MSG, channelID);
        break;

      default:
        botMsg = ":thinking: That isn't a command I know. Here's a list of commands:\n"
        botMsg += HELP_MSG;

        sendMessage(botMsg, channelID);
    
        break;
      }
    }

    // log the interaction
    logger.info("[" + user + " " + channelID + "]: " + msg);
    logger.info("[CSUSBot]: " + botMsg);
});

bot.on('error', function(err, callback) {
  logger.error(err);
});

bot.on('disconnect', reconnectDiscord.bind(this));

function reconnectDiscord(err, code) {
  if(code == 1000) {
    logger.info('Reconnecting to Discord...');
    this.bot.connect();
  }
}

function sendMessage(msg, channelID) {
  bot.sendMessage({
    to: channelID,
    message: msg
  });
  
  logger.info("[CSUSBot]: " + msg);
}

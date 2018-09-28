// Date: 2018-05-14
// Author: Edel Altares
// Description: Discord bot for the CSUS UCalgary room

var net = require('net');
var logger = require('winston');
var Discord = require('discord.io');
var dateTime = require('node-datetime');
var auth = require('./config/auth.json');
var config = require('./config/config.json');

const CHANNEL = config.channel;
const HELP_MSG = '```.csus help   \t get the list of commands and contact info\n' +
  '.csus room   \t get the room status\n' +
  '.csus arduino\t get the arduino status\n\n```' + 
  'Questions? Email us at **csus@ucalgary.ca**\n' + 
  'Contribute! **<https://github.com/edelgrace/CSUSRoomStatus>**';

var arduinoStatus = true;
var roomStatus = true;
var clients = [];
var dt = dateTime.create();

// logger settings
logger.level = 'debug';
logger.remove(logger.transports.Console);
logger.add(logger.transports.File, {filename: 'bot.log'});

// initialize the bot
var bot = new Discord.Client({
  token: auth.token,
  autorun: true
});

logger.info('Bot created');

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
  if(msg.startsWith('.csus')) {
    var dt = dateTime.create();
    var time = dt.format('H:M');
    botMsg = '**' + time + ':** ';
    
    switch(msg) {
      // CSUS ROOM STATUS
      case '.csus room':
        var state = '';
        
        if(roomStatus) {
          state = '*OPEN*';
        }
        else {
          state = '*CLOSED*'
        }
		
        botMsg += 'The CSUS room is ' + state;

        sendMessage(botMsg, channelID);

        break;

      // ARDUINO STATUS
      case '.csus arduino':
        var state = '';

        if(arduinoStatus) {
          state = '*WORKING*';
        }
        else {
          state = '*NOT WORKING*';
        }

        botMsg += "The arduino is " + state;
        
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

    // log the interaction
    logger.info('[' + user + ' ' + channelID + ']: ' + msg);
    logger.info('[CSUSBot]: ' + botMsg);
  }
  
});

bot.on('error', function(err, callback) {
  logger.error(err);
});

// send message to the bot
function sendMessage(msg, channelID) {
  bot.sendMessage({
    to: channelID,
    message: msg
  });

  logger.info('[CSUSBot]: ' + msg);
}

// create server
net.createServer(function(socket) {
  logger.info('Server started');
  
  socket.name = socket.remoteAddress + ':' + socket.remotePort;

  clients.push(socket);

  socket.write('Welcome ' + socket.name + '\n');
  logger.info(socket.name + ' joined\n');

  socket.on('data', function(data) {

  
    if (data.indexOf('*NOT WORKING*') !== -1) {
      arduinoStatus = false;
    }
    
    if (data.indexOf('*WORKING*') !== -1) {
      arduinoStatus = true;
    }

    logger.info('> ' + data);

    sendMessage(data, config.channel);
  });


  socket.on('error', function() {
    logger.info(socket.name + 'letf\n');  
  });

  socket.on('end', function() {
    clients.splice(clients.indexOf(socket), 1);
    logger.info(socket.name + 'left\n');
  });

  function broadcast(message, sender) {
    clients.forEach(function (client) {
      if (client === sender) {
        return;
      }
      
      client.write(message);
      logger.info(message);
    });
  }
}).listen(5000);

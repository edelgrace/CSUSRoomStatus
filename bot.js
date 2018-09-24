// Date: 2018-05-14
// Author: Edel Altares
// Description: Discord bot for the CSUS UCalgary room

var auth = require('./config/auth.json');
var logger = require('winston');
var Discord = require('discord.io');
var dateTime = require('node-datetime');
var net = require('net');

var clients = [];

const channel = config.channel;

var roomStatus = true;

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
        botMsg = "contact: csus@ucalgary.ca | get room status: *.csus room*"
        botMsg += "| source code: <https://github.com/edelgrace/CSUSRoomStatus>";
        
        sendMessage(botMsg, channelID);
        
        break;
        
      // COMMAND NOT RECOGNIZED
      default:
        botMsg = "contact: csus@ucalgary.ca | get room status: *.csus room*";
        botMsg += "| source code: <https://github.com/edelgrace/CSUSRoomStatus>";

        sendMessage(botMsg, channelID);
    }

    // log the interaction
    logger.info("[" + user + " " + channelID + "]: " + msg);
    logger.info("[CSUSBot]: " + botMsg);
  }
  
});

bot.on('error', function(err, callback) {
  logger.error(err);
});

function sendMessage(msg, channelID) {
  bot.sendMessage({
    to: channelID,
    message: msg
  });
  
  logger.info("[CSUSBot]: " + msg);
}

net.createServer(function(socket) {
  
  socket.name = socket.remoteAddress + ":" + socket.remotePort;

  clients.push(socket);

  socket.write("Welcome " + socket.name + "\n");
  broadcast(socket.name + " joined\n", socket);
  console.log(socket.name + " joined\n");

  socket.on('data', function(data) {
    broadcast(socket.name + "> " + data, socket);
    console.log(socket.name + "> " + data)
  });

  socket.on('end', function() {
    clients.splice(clients.indexOf(socket), 1);
    broadcast(socket.name + "left\n");
    console.log(socket.name + "left\n");
  });

  function broadcast(message, sender) {
    clients.forEach(function (client) {
      if (client === sender) return;
      client.writer(message);
      console.log(message);
    });
  }
}).listen(5000);
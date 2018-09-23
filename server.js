var net = require('net');
var logger = require('winston');

var clients = [];

logger.level = 'debug';
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true
});

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

console.log("Welcome!");
console.log("Welcome everyone!"); 

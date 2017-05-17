const ws = require('ws');
const Server = require('./server');

const clientPackets = [
  'ping', 
];

const serverPackets = [
  'pong',
];

const server = new Server(clientPackets, serverPackets, {
  perMessageDeflate: false,
  port: 8080,
});

server.onConnection((client) => {
  client.liberate('ping');
});

server.on('ping', (client) => {
  client.emit('pong');
});

server.start();

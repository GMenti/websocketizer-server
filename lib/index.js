const ws = require('ws');
const Packets = require('./packets');
const Server = require('./server');

const clientPackets = new Packets([
  'ping', 
]);

const serverPackets = new Packets([
  'pong',
]);

const server = new Server(clientPackets, serverPackets, {
  perMessageDeflate: false,
  port: 8080,
});

server.on('ping', () => {
  
});

server.start();

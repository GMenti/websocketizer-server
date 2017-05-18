const ws = require('ws');
const Server = require('./server');

let amount = 0;
let totalTime = 0;

const clientPackets = [
  'ping', 
];

const serverPackets = [
];

const server = new Server(clientPackets, serverPackets, {
  perMessageDeflate: false,
  port: 8080,
});

server.onConnection((client) => {
  client.liberate('ping');
});

server.on('ping', (client, data) => {
  amount += 1;
  totalTime += new Date().getTime() - data;
});

setInterval(() => {
  console.log(amount, totalTime, totalTime / amount);
}, 1000);

server.start();

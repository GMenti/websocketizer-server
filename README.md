# websocketizer-server

> Simple websocket server using same jobs in memory with 'ws' (https://github.com/websockets/ws)

## Installing
```bash
npm install websocketizer-server --save
```

## Getting start

```js
const Server = require('websocketizer-server');
 
// same options of 'ws'
const server = new Server({
	port: 7001,
});
  
server.onConnection((socket) => {
    // liberate socket to process job 'ping'
    socket.liberate('ping');
     
	console.log(`${socket.id} connected`);
 
    // send to all connections
    server.emit('receivedConnection', socket.id);
 
    // send to specific connection
    socket.emit('youAreConnected');
});
 
server.onDisconnection((socket) => {
	console.log(`${socket.id} disconnected`);
  
    // send to all connections
    server.emit('receivedDisconnection', socket.id);
});
  
// execute on receive packet 'ping'
server.on('ping', (socket) => {
	console.log(`${socket.id} pinged`);
  
    // respond with packet 'pong'
	socket.emit('pong');
});
  
server.start();
```

## Build Setup

``` bash
# install dependencies
npm install
  
# start compiled version.
npm run start
 
# watch files and on change start compiled version.
npm run watch
 
# run lint in code
npm run lint
```

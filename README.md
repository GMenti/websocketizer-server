# websocketizer-server

> Simple websocket server using same jobs in memory with 'ws' (https://github.com/websockets/ws)

## Getting start

```js
import Server from 'websocketizer-server';

// same options of 'ws'
const server = new Server({
	port: 7001,
});

server.onConnection((socket) => {
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

# build for production with minification
npm run build

# start compiled version.
npm run start

# run lint in code
npm run lint
```

const ws = require('ws');
const Packets = require('packets');
const Client = require('./client');

/**
 * Identifiers of ws packets.
 * 
 * @type {object}
 */
const IDENTIFIERS = {
  PACKETS: 'packets',
  CONNECTION: 'connection',
  DISCONNECTION: 'close',
  MESSAGE: 'message',
};

class Server {
   /**
    * Contructor of server instance.
    * 
    * @param {Array} clientPackets
    * @param {Array} serverPackets
    * @param {object} options
    */
   constructor(clientPackets, serverPackets, options) {
     this.clientPackets = new Packets(clientPackets);
     this.serverPackets = new Packets(serverPackets);
     this.jobs = [];
     this.clients = [];
     this.onConnectionCallback = () => {};
     this.onDisconnectionCallback = () => {};
     this.options = options;
     this.instance = {};
   }

   /**
    * Add callback to execute on receive connection.
    *
    * @param {function} callback
    */
   onConnection(callback) {
     if (typeof callback !== 'function') {
       throw new Error(`Job to process 'onConnection' must be a function`);
     }

     this.onConnectionCallback = callback;
   }

   /**
    * Add callback to execute on close connection.
    *
    * @param {function} callback
    */
   onDisconnection(callback) {
     if (typeof callback !== 'function') {
       throw new Error(`Job to process 'onDisconnection' must be a function`);
     }

     this.onDisconnectionCallback = callback;
   }

   /**
    * Add a job to server.
    *
    * @param {string} key 
    * @param {function} callback 
    */
   on(key, callback) {
     const packetIdentifier = this.clientPackets.get(key);
     
     if (typeof callback !== 'function') {
       throw new Error(`Job to process ${key} must be a function`);
     }
     
     this.jobs[packetIdentifier] = callback;
   }

   /**
    * Emit packet to specific client by id.
    *
    * @param {string} id 
    * @param {string} key 
    * @param {?*} data 
    */
   emitById(id, key, data) {
     this.clients[id].emit(key, data);
   }

   /**
    * Emit packet to all connected clients.
    *
    * @param {string} key 
    * @param {?*} data 
    */
   emit(key, data) {
     const packetIdentifier = this.serverPackets.get(key);

     Object.keys(this.clients).forEach((id) => {
       this.clients[id].emitByIdentifier(packetIdentifier, data);
     });
   }

   /**
    * Start new websocket server.
    */
   start() {
     const instance = new ws.Server(this.options);

     instance.on(IDENTIFIERS.CONNECTION, (connection) => {
       const client = new Client(
         connection, 
         this.clientPackets, 
         this.serverPackets
       );
      
       connection.on(IDENTIFIERS.MESSAGE, (message) => {
         try {
           const [packetIdentifier,data] = JSON.parse(message);

           if (client.canByIdentifier(packetIdentifier) && this.jobs[packetIdentifier]) {
             this.jobs[packetIdentifier](client, data);
           }
         } catch (error) {
           //
         }
       });

       connection.on(IDENTIFIERS.DISCONNECTION, () => {
         this.onDisconnectionCallback(client);
         delete this.clients[client.id];
       });

       client.emitByIdentifier(IDENTIFIERS.PACKETS, {
         clientPackets: this.clientPackets.keys(),
         serverPackets: this.serverPackets.keys(),
       });

       this.clients[client.id] = client;
       this.onConnectionCallback(client);
     });

     this.instance = instance;
   }
}

module.exports = Server;

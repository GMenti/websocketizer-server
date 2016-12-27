import WebSocket from 'ws';
import Crypto from 'crypto';

function Connection(socket) {
  /**
   * Id of connection.
   *
   * @type {String}
   */
  this.id = Crypto.randomBytes(16).toString('hex');

  /**
   * Emit packet to connection.
   *
   * @type {Function}
   */
  this.emit = (key, data) => {
    try {
      const dataToSend = JSON.stringify([key, data]);
      socket.send(dataToSend);
    } catch (error) {
      //
    }
  };
}

function Server(options) {
  /**
   * Jobs to execute on receive message packet.
   *
   * @type {Array}
   */
  this.jobs = [];

  /**
   * Connected clients.
   *
   * @type {Array}
   */
  this.connections = [];

  /**
   * Callback to execute on receive a new connection.
   *
   * @type {Function}
   */
  this._onConnection = () => {};

  /**
   * Callback to execute on close a connection.
   *
   * @type {Function}
   */
  this._onDisconnection = () => {};

  /**
   * Add callback to execute on receive connection.
   *
   * @param  {Function} callback
   */
  this.onConnection = (callback) => {
    this._onConnection = callback;
  };

  /**
   * Add callback to execute on close connection.
   *
   * @param  {Function} callback
   */
  this.onDisconnection = (callback) => {
    this._onDisconnection = callback;
  };

  /**
   * Instance of ws.
   *
   * @type {Object}
   */
  this.instance = {};

  /**
   * Start new websocket server.
   */
  this.start = () => {
    const instance = new WebSocket.Server(options);

    instance.on('connection', (socket) => {
      const connection = new Connection(socket);
      this.connections[connection.id] = connection;

      socket.on('message', (message) => {
        try {
          const response = JSON.parse(message);
          this.jobs[response[0]](connection, response[1]);
        } catch (error) {
          //
        }
      });

      socket.on('close', () => {
        this._onDisconnection(connection);
        delete this.connections[connection.id];
      });

      this._onConnection(connection);
    });
  };

  /**
   * Emit packet to all connections.
   *
   * @param  {String} key
   * @param  {Any} data
   */
  this.emit = (key, data) => {
    Object.keys(this.connections).forEach((id) => {
      this.connections[id].emit(key, data);
    });
  };

  /**
   * Work a job for specific packet.
   *
   * @param  {String} key
   * @param  {Function} callback
   */
  this.on = (key, callback) => {
    this.jobs[key] = callback;
  };

  /**
   * Load notifier to manage connection.
   *
   * @param  {Function} notifier
   */
  this.loadNotifier = (notifier) => {
    notifier(this);
  };
}


export default Server;

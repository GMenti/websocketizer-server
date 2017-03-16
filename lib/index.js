const ws = require('ws');
const { randomBytes } = require('crypto');

class Socket {
  /**
   * Constructor of socket instance.
   *
   * @param {object} connection
   */
  constructor(connection) {
    this.id = randomBytes(16).toString('hex');
    this.jobs = [];
    this.connection = connection;
  }

  /**
   * Check if socket can process job.
   *
   * @param {string} key
   * @returns {boolean}
   */
  can(key) {
    return (this.jobs[key]);
  }

  /**
   * Liberate socket to process specific job.
   *
   * @param {string} key
   */
  liberate(key) {
    this.jobs[key] = true;
  }

  /**
   * Block socket to process specific job.
   *
   * @param {string} key
   */
  block(key) {
    delete this.jobs[key];
  }

  /**
   * Emit packet to connection.
   *
   * @param {string} key
   * @param {?*} data
   */
  emit(key, data) {
    try {
      const dataToSend = JSON.stringify([key, data]);
      this.connection.send(dataToSend);
    } catch (error) {
      //
    }
  }
}

class Server {
  /**
   * Constructor of server instance.
   *
   * @param {object} options
   */
  constructor(options) {
    this.jobs = [];
    this.options = options;
    this.sockets = {};

    this._server = {};
    this._onConnection = () => {};
    this._onDisconnection = () => {};
  }

  /**
   * Add callback to execute on receive connection.
   *
   * @param {function} callback
   */
  onConnection(callback) {
    this._onConnection = callback;
  }

  /**
   * Add callback to execute on close connection.
   *
   * @param {function} callback
   */
  onDisconnection(callback) {
    this._onDisconnection = callback;
  }

  /**
   * Start new websocket server.
   */
  start() {
    this._server = new ws.Server(this.options);
    this._server.on('connection', (connection) => {
      const socket = new Socket(connection);
      this.sockets[socket.id] = socket;

      connection.on('message', (message) => {
        try {
          const [key, data] = JSON.parse(message);

          if (socket.can(key)) {
            this.jobs[key](socket, data);
          }
        } catch (error) {
          //
        }
      });

      connection.on('close', () => {
        this._onDisconnection(socket);
        delete this.sockets[socket.id];
      });

      this._onConnection(socket);
    });
  }

  /**
   * Emit packet to socket with id.
   *
   * @param {string} id
   * @param {string} key
   * @param {?*} data
   */
  emitById(id, key, data) {
    this.sockets[id].emit(key, data);
  }

  /**
   * Emit packet to all connections.
   *
   * @param  {string} key
   * @param  {?*} data
   */
  emit(key, data) {
    Object.keys(this.sockets).forEach((id) => {
      this.emitById(id, key, data);
    });
  }

  /**
   * Work a job for specific packet.
   *
   * @param  {string} key
   * @param  {function} callback
   */
  on(key, callback) {
    this.jobs[key] = callback;
  }

  /**
   * Load notifier to manage connection.
   *
   * @param {function} notifier
   */
  loadNotifier(notifier) {
    notifier(this);
  }
}

module.exports = Server;

const uuid = require('uuid/v4');
const Packets = require('packets');

class Client {
  /**
   * Constructor of client instance.
   *
   * @param {object} connection
   * @param {Packets} clientPackets
   * @param {Packets} serverPackets
   */
  constructor(connection, clientPackets, serverPackets) {
    if (!(clientPackets instanceof Packets) || !(serverPackets instanceof Packets)) {
      throw new Error('Failed on create client, client/server packets must be instance of Packets');
    }

    this.id = uuid();
    this.connection = connection;
    this.clientPackets = clientPackets;
    this.serverPackets = serverPackets;
    this.jobs = [];
  }

  /**
   * Check if client can process job.
   *
   * @param {string|number|boolean} key
   * @returns {boolean}
   */
  can(key) {
    const packetIdentifier = this.clientPackets.get(key);

    if (this.jobs[packetIdentifier]) {
      return true;
    }

    return false;
  }

  /**
   * Liberate client to process specific job.
   *
   * @param {string|number|boolean} key
   */
  liberate(key) {
    const packetIdentifier = this.clientPackets.get(key);

    this.jobs[packetIdentifier] = true;
  }

  /**
   * Block client to process specific job.
   *
   * @param {string|number|boolean} key
   */
  block(key) {
    const packetIdentifier = this.clientPackets.get(key);

    delete this.jobs[packetIdentifier];
  }

  /**
   * Emit packet to connection.
   *
   * @param {string|number|boolean} key
   * @param {?*} data
   */
  emit(key, data) {
    const packetIdentifier = this.serverPackets.get(key);

    this.emitByIdentifier(packetIdentifier, data);
  }

  /**
   * Emit packet to connection by identifier.
   * 
   * @param {number} packetIdentifier 
   * @param {?*} data 
   */
  emitByIdentifier(packetIdentifier, data) {
    try {
      const dataToSend = JSON.stringify([packetIdentifier, data]);
      this.connection.send(dataToSend);
    } catch (error) {
      //
    }
  }
}

module.exports = Client;

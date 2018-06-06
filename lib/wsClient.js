/**
 * @name WSClient
 * @summary Websocket client
 */
'use strict';
const WebSocket = require('ws');
const Promise = require('bluebird');
const uuid = require('uuid');

/**
* @name WSClient
* @summary Message WSClient
*/
class WSClient {
  /**
  * @name constructor
  * @summary class constructor
  * @return {undefined}
  */
  constructor() {
    this.ws = null;
    this.url = '';
    this.clientID = 0;
  }

  /**
   * @name open
   * @param {string} url - hydra-router server url
   * @param {function} messageHandler - message handler
   * @return {undefined}
   */
  open(url, messageHandler) {
    return new Promise((resolve, _reject) => {
      this.url = url;
      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        resolve();
      });

      this.ws.on('message', (message) => {

        let msg = JSON.parse(message);
        if (msg.typ === 'connection') {
          
          this.clientID = msg.bdy.id;
        }
        messageHandler(msg);
      });

      this.ws.on('close', () => {
        console.log('close');
      });

      this.ws.on('error', (error) => {
        console.log('error', error);
        throw error;
      });
    });
  }

  /**
   * @name close
   * @return {undefined}
  */
  close() {
    if (this.ws) {
      this.ws.close();
    }
  }

  /**
   * @name createMessage
   * @param {object} overrideEntries - object with message entries to override base message
   * @return {object} message - newly minted message
   */
  createMessage(overrideEntries) {
    const UMF_VERSION = 'UMF/1.4.6';
    return Object.assign({}, {
      to: 'hmr-svcs:/',
      from: 'requestmob:/',
      version: UMF_VERSION,
      ts: new Date().toISOString(),
      mid: uuid.v4()
    }, overrideEntries);
  }

  /**
   * @name sendMessage
   * @param {string} msg - message craeted with createMessage
   * @return {undefined}
   */
  async sendMessage(msg) {
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      this.ws.send(msg);
    } else {
      await this.open(this.url);
      console.log('reopening socket');
      this.sendMessage(msg);
    }
  }
}

module.exports = WSClient;

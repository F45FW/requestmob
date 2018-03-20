'use strict';

const Actor = require('./actor');
const WSClient = require('../lib/wsClient');

const CLIENT_COUNT = 100;
const DURATION = 60 * 1000;

/**
* @name HMRWsRelay100Cients60Seconds
* @summary Call HMRWsRelay using 100 clients for 60 seconds
* @return {undefined}
*/
module.exports = class HMRWsRelay100Cients60Seconds extends Actor {
  /**
  * @name constructor
  * @description class contructor
  * @return {undefined}
  */
  constructor() {
    super();

    this.wsClients = [];
  }

  /**
  * @name getDescription
  * @summary return module description
  * @return {string} description - module description
  */
  getDescription() {
    return 'Call HMR websocket reply endpoint using 100 clients for 60 seconds';
  }

  /**
  * @name execute
  * @summary execute module
  * @param {string} actorName - name of actor
  * @return {undefined}
  */
  async execute(actorName) {
    let messageHandler = (msg) => {
      if (msg.rmid) { // only track messages with rmid's
        this.logStat(actorName, 'process', msg.rmid);
      }
    };

    let range = [...Array(CLIENT_COUNT).keys()];
    for (let i of range) {
      let client = new WSClient();
      this.wsClients.push(client);
      await client.open('ws://localhost:5353', messageHandler);
    }

    await this.doForDuration(DURATION, 1000, () => {
      try {
        let idx = 0;
        for (let i of range) {
          let msg = this.wsClients[idx].createMessage({
            "bdy": {
              "ts": "00:00:01.0050",
              "datum": { "rpm": "58", "torq": "18", "tp": "0.25521" }
            }
          });
          this.logStat(actorName, 'request', msg.mid);
          this.wsClients[idx].sendMessage(JSON.stringify(msg));
          idx++;
        }
      } catch (err) {
        console.log('err', err);
        this.logStat(actorName, 'error', msg.mid);
      }
    });
  }
}
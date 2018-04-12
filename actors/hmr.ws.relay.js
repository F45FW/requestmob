'use strict';

const Actor = require('../actor');
const WSClient = require('../lib/wsClient');


/**
* @name HMRWsRelay
* @summary Call HMRWsRelay endpoint
* @return {undefined}
*/
module.exports = class HMRWsRelay extends Actor {
  /**
  * @name constructor
  * @description class contructor
  * @param {object} config - config object
  * @return {undefined}
  */
  constructor(config) {
    super(config);
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

    let wsClient = new WSClient();
    let msg = wsClient.createMessage({
      "bdy": {
        "ts": "00:00:01.0050",
        "datum": { "rpm": "58", "torq": "18", "tp": "0.25521" }
      }
    });

    try {
      await wsClient.open(this.config.wsTarget, messageHandler);
      this.logStat(actorName, 'request', msg.mid);
      wsClient.sendMessage(JSON.stringify(msg));
    } catch (e) {
      this.logStat(actorName, 'error', msg.mid, e);
    }
  }
}

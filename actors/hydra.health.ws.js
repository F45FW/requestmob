'use strict';

const Actor = require('../actor');
const WSClient = require('../lib/wsClient');

const CLIENT_COUNT = 100;
const DURATION = 180 * 1000;

module.exports = class HydraHealthWS extends Actor {
  /**
  * @name constructor
  * @description class contructor
  * @param {object} config - config object
  * @return {undefined}
  */
  constructor(config) {
    super(config);
    this.wsClients = [];
  }

  /**
  * @name execute
  * @summary execute module
  * @param {string} actorName - name of actor
  * @return {undefined}
  */
  async execute(actorName) {
    let messageHandler = (msg) => {
      //console.log('recieving message', msg.mid);
      if (msg.rmid) { // only track messages with rmid's
        this.logStat(actorName, 'process', msg.rmid);
      }
    };

    let range = [...Array(CLIENT_COUNT).keys()];
    for (let i of range) {
      let client = new WSClient();
      this.wsClients.push(client);
      await client.open(this.config.wsTarget, messageHandler);
    }
    console.log('Awaiting connections');
    await(5000);
    console.log('Starting Test');
    await this.doForDuration(250000, 1000, () => {
      let idx = 0;
      for (let i of range) {
        try {
          let msg = this.wsClients[idx].createMessage({
            "to": "hydra-router:[GET]/v1/router/health",
            "body": {}
          });
          // log(actorName, requestID, action, error=null, message) {
          // logStat(actorName, type, requestID, error, message) {
          //console.log('Sending message', msg.mid);
          this.logStat(actorName, 'request', msg.mid, null, msg);
          this.wsClients[idx].sendMessage(JSON.stringify(msg));
          idx++;
        } catch (err) {
          console.log('Error', err);
          this.logStat(actorName, 'error', msg.mid, err);
        }
      }
    });
    console.log('Fin');
    await(5000);
  }
}

'use strict';

const Actor = require('../actor');
const ServerRequest = require('../lib/server-request');

/**
* @name HydraHealth
* @summary Call Hydra Health endpoint
* @return {undefined}
*/
module.exports = class HydraHealth extends Actor {
  /**
  * @name constructor
  * @description class contructor
  * @param {object} config - config object
  * @return {undefined}
  */
  constructor(config) {
    super(config);
  }

  async sendHttpRequest () {
    let serverRequest = new ServerRequest();
    let d = await serverRequest.send({
      host: this.config.host,
      port: this.config.port,
      method: 'get',
      path: '/v1/router/health?token=14f35238-80c5-454a-aa99-59e5ed28b7ac'
    });
    return d;
  }

  /**
  * @name execute
  * @summary execute module
  * @param {string} actorName - name of actor
  * @return {undefined}
  */
  async execute(actorName) {
    // let serverRequest = new ServerRequest();

    let result;
    let currentSecond = 1;
    let DURATION_OF_TEST_IN_SECONDS = 300;
    
    /*
    while (currentSecond < DURATION_OF_TEST_IN_SECONDS) {
      try {
        let requestID = this.getRequestID();
        this.logStat(actorName, 'request', requestID);
        result = await serverRequest.send({
          host: this.config.host,
          port: this.config.port,
          method: 'get',
          path: '/v1/router/health?token=14f35238-80c5-454a-aa99-59e5ed28b7ac'
        });
        this.logStat(actorName, 'process', requestID);
      } catch (e) {
        this.logStat(actorName, 'error', requestID, e);
      }
      currentSecond++;
    };
    */
  
   while (currentSecond < DURATION_OF_TEST_IN_SECONDS) {

    let requestID1 = this.getRequestID();
    let requestID2 = this.getRequestID();
    let requestID3 = this.getRequestID();
    let requestID4 = this.getRequestID();
    let requestID5 = this.getRequestID();
    let requestID6 = this.getRequestID();
    let requestID7 = this.getRequestID();
    let requestID8 = this.getRequestID();
    let requestID9 = this.getRequestID();

    try {

      this.logStat(actorName, 'request', requestID1);
      this.logStat(actorName, 'request', requestID2);
      this.logStat(actorName, 'request', requestID3);
      this.logStat(actorName, 'request', requestID4);
      this.logStat(actorName, 'request', requestID5);
      this.logStat(actorName, 'request', requestID6);
      this.logStat(actorName, 'request', requestID7);
      this.logStat(actorName, 'request', requestID8);
      this.logStat(actorName, 'request', requestID9);

      let [res1, res2, res3, res4, res5, res6, res7, res8, res9] = await Promise.all([
        this.sendHttpRequest(), this.sendHttpRequest(), this.sendHttpRequest(),
        this.sendHttpRequest(), this.sendHttpRequest(), this.sendHttpRequest(),
        this.sendHttpRequest(), this.sendHttpRequest(), this.sendHttpRequest()
      ]);

      if (res1.statusCode === 200) {
        this.logStat(actorName, 'process', requestID1);
      } else {
        this.logStat(actorName, 'error', requestID1, res1.statusCode);
      }

      if (res2.statusCode === 200) {
        this.logStat(actorName, 'process', requestID2);
      } else {
        this.logStat(actorName, 'error', requestID2, res2.statusCode);
      }

      if (res3.statusCode === 200) {
        this.logStat(actorName, 'process', requestID3);
      } else {
        this.logStat(actorName, 'error', requestID3, res3.statusCode);
      }

            
      if (res4.statusCode === 200) {
        this.logStat(actorName, 'process', requestID4);
      } else {
        this.logStat(actorName, 'error', requestID4, res4.statusCode);
      }

      if (res5.statusCode === 200) {
        this.logStat(actorName, 'process', requestID5);
      } else {
        this.logStat(actorName, 'error', requestID5, res5.statusCode);
      }

      if (res6.statusCode === 200) {
        this.logStat(actorName, 'process', requestID6);
      } else {
        this.logStat(actorName, 'error', requestID6, res6.statusCode);
      }

            
      if (res7.statusCode === 200) {
        this.logStat(actorName, 'process', requestID7);
      } else {
        this.logStat(actorName, 'error', requestID7, res7.statusCode);
      }

      if (res8.statusCode === 200) {
        this.logStat(actorName, 'process', requestID8);
      } else {
        this.logStat(actorName, 'error', requestID8, res8.statusCode);
      }

      if (res9.statusCode === 200) {
        this.logStat(actorName, 'process', requestID9);
      } else {
        this.logStat(actorName, 'error', requestID9, res9.statusCode);
      }

    } catch (e) {
      console.log('SOMETHING BAD HAPPENED', e);
      break;
    }
    currentSecond++;
  };

  }
}

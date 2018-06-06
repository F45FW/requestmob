'use strict';

const Actor = require('../actor');
const ServerRequest = require('../lib/server-request');
const DURATION = 300 * 1000;

/**
* @name LeaderboardHttpBenchmarking
* @summary
* @return {undefined}
*/
module.exports = class LeaderboardHttpBenchmarking extends Actor {
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
    let serverRequest = new ServerRequest();

    await this.doForDuration(DURATION, 1000, async () => {
      let requestID = this.getRequestID();
      let result;
      try {
        this.logStat(actorName, 'request', requestID);
        result = await serverRequest.send({
          host: this.config.host,
          port: this.config.port,
          method: 'get',
          path: '/v1/video-metrics/health'
        });
        this.logStat(actorName, 'process', requestID);
      } catch (e) {
        this.logStat(actorName, 'error', requestID, e);
      }
    });
  }
}

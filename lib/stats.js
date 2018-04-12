'use strict';

const Utils = require('./utils');
let utils = new Utils();

/**
* @name Stats
* @summary stats tracker
* @return {undefined}
*/
class Stats {
  /**
  * @name constructor
  * @summary class constructor
  * @return {undefined}
  */
  constructor() {
    this.stats = {
      totalRequests: 0,
      startTime: 0,
      endTime: 0,
      actors: {}
    };
  }

  /**
   * @name getTimeStamp
   * @description get time stamp in milliseconds
   * @return {number} timestamp
   */
  getTimeStamp() {
    return new Date().getTime();
  }

  /**
   * @name start
   * @description mark the start of a metrics session
   * @return {undefined}
   */
  start() {
    this.stats.startTime = this.getTimeStamp();
  }

  /**
   * @name end
   * @description mark the end of a metrics session
   * @return {undefined}
   */
  end() {
    this.stats.endTime = this.getTimeStamp();
  }

  /**
  * @name log
  * @summary log a stat
  * @param {string} actorName - Actor name
  * @param {string} requestID - request ID
  * @param {string} action - request action (request, process, error)
  * @param {object} error - optional error object. If used, action must be set to 'error'
  * @return {undefined}
  */
  log(actorName, requestID, action, error=null) {
    if (!this.stats.actors[actorName]) {
      this.stats.actors[actorName] = {};
    }
    if (!this.stats.actors[actorName][requestID]) {
      this.stats.actors[actorName][requestID] = {
        start: 0,
        end: 0,
        success: false
      }
    }
    let statEntry = this.stats.actors[actorName][requestID];
    switch (action) {
      case 'request':
        statEntry.start = this.getTimeStamp();
        this.stats.totalRequests += 1;
        break;
      case 'process':
        statEntry.end = this.getTimeStamp();
        statEntry.success = true;
        statEntry.elapsed = statEntry.end - statEntry.start;
        break;
      case 'error':
        statEntry.end = this.getTimeStamp();
        statEntry.elapsed = statEntry.end - statEntry.start;
        statEntry.sucess = false;
        if (error !== null) {
          let hash = utils.stringHash(error);
          if (!this.stats.actors[actorName].errorHashes) {
            this.stats.actors[actorName].errorHashes = {};
            this.stats.actors[actorName].errors = [];
            console.log('hit');
          }
          if (!this.stats.actors[actorName].errorHashes[hash]) {
            this.stats.actors[actorName].errorHashes[hash] = 1;
            this.stats.actors[actorName].errors.push(error);
          }
        }
        break;
      default:
        break;
    }
  }

  /**
   * @name getStats
   * @description get the stats
   * @return {object} stats data object
   */
  getStats() {
    this.stats.totalElapsed = this.stats.endTime - this.stats.startTime;
    delete this.stats.endTime;
    delete this.stats.startTime;

    Object.keys(this.stats.actors).forEach((actor) => {
      let fastestElapsed = 99999999;
      let slowestElapsed = 0;
      let totalElapsed = 0;
      let total = 0;
      let totalSuccess = 0;

      Object.keys(this.stats.actors[actor]).forEach((request) => {
        total += 1;
        if (request.success) {
          totalSuccess += 1;
          totalElapsed += request.elapsed;
        }
        if (request.elapsed <= fastestElapsed) {
          fastestElapsed = request.elapsed;
        }
        if (request.elapsed >= slowestElapsed) {
          slowestElapsed = request.elapsed;
        }
        if (request !== 'errors') {
          delete this.stats.actors[actor][request];
        }
      });

      // delete this.stats.actors[actor].errorHashes;
      this.stats.actors[actor].success = totalSuccess;
      this.stats.actors[actor].failures = total - totalSuccess;
      this.stats.actors[actor].showest = slowestElapsed;
      this.stats.actors[actor].fastest = fastestElapsed;
      this.stats.actors[actor].average = Number(parseFloat(Math.round(totalElapsed / total)).toFixed(2));
    });

    return this.stats;
  }
}

module.exports = Stats;

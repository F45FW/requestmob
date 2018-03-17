#!/usr/bin/env node
'use strict';

const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
const version = require('./package.json').version;
const config = require('./config');
const Stats = require('./lib/stats');
const processor = require('./lib/processor');
const Delay = require('./lib/delay');
const EXIT_DELAY = 250;

let stats = new Stats();

/**
* @name Program
* @summary Main program file
* @return {undefined}
*/
class Program {
  /**
  * @name constructor
  * @description main contructor
  * @return {undefined}
  */
  constructor() {
    config.actorsPath = require('path').join(__dirname, '/actors');
    processor.init(config);
  }

  /**
  * @name displayHelp
  * @description Display program help info
  * @return {undefined}
  */
  displayHelp() {
    console.log(`requestmob - Request Mob ${version}`);
    console.log('Usage: requestmob durationInSeconds actor1 actor2 ...');
    console.log('');
    console.log('A tool for generating network request load');
    console.log('');
    console.log('Actor IDs:');
    processor.getCommandlist().forEach((actor) => {
      console.log(`  ${actor.name} - ${actor.description}`);
    });
    console.log('');
  }

  /**
  * @name main
  * @description entry point for command dispatch processing
  * @return {undefined}
  */
  async main() {
    let args = process.argv.slice(2);
    if (args.length < 2) {
      this.displayHelp();
      this.exitApp();
      return;
    }
    let duration = parseInt(args[0]);
    if (isNaN(duration)) {
      this.displayHelp();
      console.log('Error, first parameter must be a number of seconds');
      this.exitApp();
      return;
    }
    args.shift();

    if (cluster.isMaster) {
      stats.start();

      let totalWorkers = numCPUs * 2;
      for (let i = 0; i < totalWorkers; i++) {
        let worker = cluster.fork();
        worker.on('message', (message) => {
          stats.log(message.actorName, message.requestID, message.type);
        });
      }

      cluster.on('exit', (worker, code, signal) => {
        // console.log(`worker ${worker.process.pid} died`);
      });

      setTimeout(() => {
        process.exit(0);
      }, duration * 1000);

      process.on('exit', () => {
        stats.end();
        let statsObj = stats.getStats();
        console.log(JSON.stringify(statsObj, null, 2));
      });
    } else {
      // worker
      // console.log(`Worker ${process.pid} started`);
      for (let actorName of args) {
        try {
          processor.executeCommand(actorName);
        } catch (e) {
          console.log(`Unable to invoke actor ${actorName}`);
        }
      }
      this.exitApp();
    }
  }

  /**
  * @name exitApp
  * @description properly exit this app
  * @return {undefined}
  */
  async exitApp() {
    await Delay.sleep(EXIT_DELAY);
    process.exit();
  }
}

new Program().main();

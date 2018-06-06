const Actor = require('../actor');
const WSClient = require('../lib/wsClient');
const timeout = ms => new Promise(res => setTimeout(res, ms));

const videoMetricsMessage = {
  "frm": "user-1@client:/",
  "to": "video-metrics-service:/",
  "bdy": {
    "userId": "1",
    "ipAddress": "129.168.1.8",
    "classId": "9000121",
    "classSecond": 1
  }
};

/**
* @name MetricsBenchmarking
* @summary Benchmark Leaderboard system
* @return {undefined}
*/
module.exports = class MetricsBenchmarking extends Actor {
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

  buildConnectMessage(userId) {
    return {
      "to": "bms:/",
      "from": `user-${userId}@client:/`,
      "body": {
        "cmd": "connect",
        "uid": userId,
        "classid": "1"
      }
    };
  }

  buildMetricMessage(userId, second) {
    return {
      "from": `user-${userId}@client:/`,
      "to": "bms:/",
      "body": {
        "classId": "1",
        "ts": second,
        "datum": { "rpm": "58", "torq": "18", "tp": "0.25" }
      }
    };
   }

   buildLeaderboardRequestMessage(userId, second) {
     return {
      "from": `user-${userId}@client:/`,
      "to": "leaderboard-service:/",
      "body": {
        "classid": "1", "second": second
      }
    };
   }

  /**
  * @name execute
  * @summary execute module
  * @param {string} actorName - name of actor
  * @return {undefined}
  */
  async execute(actorName) {
    
    const NUMBER_OF_CLIENTS_PER_CORE = 13;
    const DURATION_OF_TEST_IN_SECONDS = 300;

    let messageHandler = (msg) => {
      if (msg.rmid) {
        this.logStat(actorName, 'process', msg.rmid);
      }
    }
    const clientCount = [...Array(NUMBER_OF_CLIENTS_PER_CORE).keys()];
    for (let i of clientCount) {
      let client = new WSClient();
      this.wsClients.push(client);
      await client.open(this.config.wsTarget, messageHandler);
    }

    // Bikemetrics servivce is "statefull" so we must connect.
    let userId;
    for (let i of clientCount) {
      userId = `${process.env['WORKER_ID']}${i}`;
      let clientConnectMessage = this.buildConnectMessage(userId);
      let connectMessage = this.wsClients[i].createMessage(clientConnectMessage);
      // CONNECT DOES NOT SEND BACK A RESPONSE!
      this.wsClients[i].sendMessage(JSON.stringify(connectMessage));
    }

    await timeout(10000); // Let connections catch up.
    let currentSecond = 1;

    while (currentSecond < DURATION_OF_TEST_IN_SECONDS) {
      for (let i of clientCount) {
        let currentMessage;

        try {
          // Send Metrics Data
          userId = `${process.env['WORKER_ID']}${i}`;
          let metricMessage = this.buildMetricMessage(userId, currentSecond);
          currentMessage = this.wsClients[i].createMessage(metricMessage);
          this.logStat(actorName, 'request', currentMessage.mid, null, currentMessage);
          this.wsClients[i].sendMessage(JSON.stringify(currentMessage));

          // Send LB request
          let lbMessage = this.buildLeaderboardRequestMessage(userId, currentSecond, null, currentMessage);
          currentMessage = this.wsClients[i].createMessage(lbMessage);
          this.logStat(actorName, 'request', currentMessage.mid);
          this.wsClients[i].sendMessage(JSON.stringify(currentMessage));

          // Send VMS Data (There IS NO ack here, So there is NO stat to log)
          let vmsUMFMessage = this.wsClients[i].createMessage(videoMetricsMessage);
          this.wsClients[i].sendMessage(JSON.stringify(vmsUMFMessage));
          
        } catch (error) {
          this.logStat(actorName, 'error', currentMessage.mid, error);
        }
      }
      currentSecond++;
      await timeout(1000);
    }
  }
}
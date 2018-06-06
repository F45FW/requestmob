/**
 * @name ServerRequest
 * @summary Class for handling server requests
 */
'use strict';

const Promise = require('bluebird');
const config = require('../config/config.json');

const REQUEST_TIMEOUT = 30000; // 30-seconds

class ServerRequest {
  /**
  * @name constructor
  * @summary Class constructor
  * @return {undefined}
  */
  constructor() {
    this.payLoad = '';
  }

  /**
  * @name send
  * @summary sends an HTTP Request
  * @param {object} options - request options
  * @return {object} promise
  */
  send(options) {
    return new Promise((resolve, reject) => {
      options = Object.assign({
        headers: {
          'content-type': 'application/json',
          'Accept': 'application/json; charset=UTF-8'
        },
        method: 'get'
      }, options);

      if (options.method === 'post' || options.method === 'put') {
        options.headers = options.headers || {};
        if (options.body) {
          options.headers['content-length'] = Buffer.byteLength(options.body, 'utf8');
        }
      } else {
        delete options.body;
      }

      let httpProto;
      if (options.host && options.host.includes('https://')) {
        options.host = options.host.replace('https://', '');
        httpProto = require('https');
      } else {
        options.host = options.host.replace('http://', '');
        httpProto = require('http');
      }
      //console.log(options);
      let req = httpProto.request(options, (res) => {
        let response = [];
        res.on('data', (data) => {
          response.push(data);
        });
        res.on('end', () => {
          let buffer = Buffer.concat(response);
          let data = {
            statusCode: res.statusCode,
            headers: res.headers
          };
          data.headers['content-length'] = Buffer.byteLength(buffer);
          // this.payLoad = data.payLoad = buffer;
          data.result = JSON.parse(buffer.toString('utf8'));
          resolve(data);
        });
        res.on('error', (err) => {
          reject(err);
        });
      });

      req.on('socket', (socket) => {
        socket.setNoDelay(true);
        socket.setTimeout(options.timeout * 1000 || REQUEST_TIMEOUT, () => {
          req.abort();
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  }

  /**
  * @name text
  * @summary return response as text
  * @return {string} text - text response
  */
  text() {
    return this.payLoad.toString('utf8');
  }

  /**
  * @name json
  * @summary return response as JSON
  * @return {object} json - json response
  */
  json() {
    return JSON.parse(this.text());
  }

}

ServerRequest.HTTP_OK = 200;
ServerRequest.HTTP_CREATED = 201;

module.exports = ServerRequest;

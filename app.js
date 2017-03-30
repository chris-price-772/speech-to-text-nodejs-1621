/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const express = require('express');
const app = express();
const watson = require('watson-developer-cloud');
const request = require('request');

// Bootstrap application settings
require('./config/express')(app);

const stt = new watson.SpeechToTextV1({
  // if left undefined, username and password to fall back to the SPEECH_TO_TEXT_USERNAME and
  // SPEECH_TO_TEXT_PASSWORD environment properties, and then to VCAP_SERVICES (on Bluemix)
  // username: '',
  // password: ''
});

const authService = new watson.AuthorizationV1(stt.getCredentials());

var appId = process.env.APP_ID;
var secret = process.env.APP_SECRET;



const getLocalPerson = (tok, cb) => {
  request.post(
    'https://api.watsonwork.ibm.com/graphql', {
      headers: {
        Authorization: 'Bearer ' + tok,
        "Content-Type": 'application/graphql'
      },
      json: false,
      body: '{ me { id } }'
    }, (err, res) => {
      if(err || res.statusCode !== 200) {
        console.log('Error sending localPerson graphql ', err || res.statusCode);
        cb(err || new Error(res.statusCode));
        return;
      }

      cb(null, JSON.parse(res.body));
    });
};

  // Get token using your credentials
  app.get('/api/token', function(req, res, next) {

    getLocalPerson(req.header('jwt'), function(err, person) {
      if (err) {
          console.log("Failed to get person");
          res.status(401).send("Request failed")
          return;
      }

      authService.getToken(function(err, token) {
        if (err) {
          next(err);
        } else {
          res.send(JSON.stringify({sttToken: token}));
        }
      });
    });
  });


module.exports = app;

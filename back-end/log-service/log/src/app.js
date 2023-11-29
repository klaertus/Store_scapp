const express = require('express')
const log = require('debug')('log-d')

const app = express.Router()
const utils = require('./utils/utils')


app.get('/log/', (req, res) => {
  const token = req.query.token;
  const username = req.query.username;
  const level = req.query.level;
  const type = req.query.type;
  const service = req.query.service
  const eventOperation = req.query.operation;  // Event type
  
  const operation = "GetLog"
  utils.sendLog(token, service, "INFO", operation, `Requesting to get logs with parameters : ${username}, ${level}, ${type}, ${service}, ${eventOperation}`, 0)

  return utils.getLog(token, username, level, type, service, eventOperation)
    .then((result) => {
      utils.sendLog(token, service, "INFO", operation, `Logs succesfully gotten`, 0)
      res.status(200).json({ status: 'success', result})
    })
    .catch((error) => {
      utils.sendLog(token, service, "INFO", operation, `Logs not gotten. Details : ${error}`, 0)
      res.status(404).json({ status: 'error', message: String(error) })
    })
});


app.post('/log/create/', (req, res) => {
  const token = req.query.token; // if any
  log(res.query)
  const timestamp = req.body.timestamp;
  const service = req.body.service; // Service linked to the event
  const type = req.body.type; // ERROR, INFO
  const operation = req.body.operation; // Event type
  const details = req.body.details;  // Event message details
  const responseTime = req.body.responseTime;  // Time response of the request

  log('Creating new log')

  return utils.createLog(token, timestamp, type, service, operation, details, responseTime)
    .catch((error) => {
      log(`Log not created. Details : ${error}`)
    })
});



module.exports = app

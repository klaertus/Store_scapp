const express = require('express')
const log = require('debug')('users-d')
const axios = require('axios')


const app = express.Router()
const utils = require('./utils/utils')

const service = "user-service"

app.post('/user/create/', (req, res) => {

  var username = req.body.username
  var password = req.body.password

  const operation = "UserCreation"
  utils.sendLog(null, service, "INFO", operation, `Creating new user : ${username}`, 0)
  
  return utils.createUser(username, password)
    .then((result) => {  // res is the token for new user
      utils.sendLog(result, service, "INFO", operation, `${username} successfully created`, 0)
      res.status(200).json({ status: 'success', result})
    })
    .catch((error) => {
      utils.sendLog(null, service, "ERROR", operation, `${username} not created. Details : ${error}`, 0)
      res.status(403).json({ status: 'error', result:String(error)})
    })
})

// Change GET method to POST method for more security
// Get User Token 
app.post('/user/authenticate/', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  
  const operation = "UserAuthentification"
  utils.sendLog(null, service, "INFO", operation, `Authentificating ${username}`, 0)
  
  return utils.authenticateUser(username, password)
    .then((result) => {  //res is the token
      utils.sendLog(result, service, "INFO", operation, `${username} successfully authentificated`, 0)
      res.status(200).json({ status: 'success', result})
    })
    .catch((error) => {
      utils.sendLog(null, service, "ERROR", operation, `${username} not authentificated. Details : ${error}`, 0)
      res.status(403).json({ status: 'error', result:String(error)})
    })
})

// Check if token exist for a user in the database
app.get('/user/validate/', (req, res) => {
  var token = req.query.token;

  const operation = "CheckTokenValidity"
  log(`${token}, ${service}, "INFO", ${operation}, Checking token validity :, 0`)
  return utils.getUsername(token)
    .then((result) => {
      log(`${token}, ${service}, "INFO", ${operation}, Checking token validity : ${result}, 0`)
      res.status(200).json({ status: 'success', result})
    })
    .catch((error) => {
      log(error)
      res.status(403).json({ status: 'error', result:String(error)})
    })
})

// Check the user level (0 is guest, 1 is normal user, 2 is admin)
app.get('/user/level/', (req, res) => {
  var token = req.query.token;
  
  const operation = "CheckUserLevel"
  //utils.sendLog(token, service, "INFO", operation, `Checking user level`, 0)
  return utils.getUserLevel(token)
    .then((result) => {
      //utils.sendLog(token, service, "INFO", operation, `User is level ${result}`, 0)
      res.status(200).json({ status: 'success', result})
    })
    .catch((error) => {
      //utils.sendLog(token, service, "INFO", operation, `Can't verifying user level. Details ${error}`, 0)
      log(error)
      res.status(403).json({ status: 'error', result:String(error) })
    })
})



// Route to set a user as an admin
app.put('/user/setAdmin/', (req, res) => {
  const token = req.query.token;
  const username = req.body.username;
  
  const operation = "SetAdminOperation"
  utils.sendLog(token, service, "INFO", operation, `Trying to set ${username} as an admin`, 0)

  return utils.setAdmin(token, username)
    .then((result) => {
      utils.sendLog(result, service, "INFO", operation, `${username} is now admin`, 0)
      res.status(200).json({ status: 'success', result})
    })
    .catch((error) => {
      utils.sendLog(result, service, "ERROR", operation, `${username} is not admin. Details : ${error}`, 0)
      res.status(404).json({ status: 'error', result:String(error)})
    })
})




module.exports = app

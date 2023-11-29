const axios = require('axios');
const log = require('debug')('log-d')
const user_service = process.env.USER_SERVICE_URL;
const nano = require('nano')(process.env.DB_URL);
const log_database = nano.use(process.env.DB_NAME);

// Function to get the logs
function getLog(token, username, level, type, service, operation){
  return new Promise((resolve, reject) => {
    axios.get(`${user_service}/user/level`, { params: { token:token}}) // Validate the user token
    .then(response => { 
      let leveluser = response
      if (leveluser != 2){
        reject(new Error('User is not an admin'))
      }
      // Build a selector for the query based on non-null parameters
      let selector = {};
      if (username !== null) selector.username = username;
      if (level !== null) selector.userLevel = level;
      if (type !== null) selector.type = type;
      if (service !== null) selector.service = service;
      if (operation !== null) selector.operation = operation;
  
      // Perform the query
      log_database.find({ selector })
      .then(result => {
        resolve(result.docs);
      })
      .catch(error => {
        reject(new Error(`Error fetching logs: ${error.reason}`));
      });
    
    })
    .catch(error => { // If the token is not valid
        reject(new Error(`Échec de la vérification du token : ${error}`));
    });
    
  });

}

// Function to create a log
function createLog(token, timestamp, type, service, operation, details, responseTime) {
  return new Promise((resolve, reject) => {
    axios.get(`${user_service}/user/validate`, { params: { token:token}}) // Validate the user token
    .then(result => {
      log(result.data) 
      let username = result.data.result
      axios.get(`${user_service}/user/level`, { params: { token:token}})
      .then(result => {
        log(result.data)  
        let level = result.data.result
        log_database.insert({
          'timestamp': timestamp,
          'username': username,
          'userLevel':level,
          'type': type,
          'service':service,
          'operation':operation,
          'details':details,
          'responseTime':responseTime,
        })
        .then(result => {
          log(result.data) 
          resolve(true);
        })
        .catch(error => {
          reject(`Error fetching logs: ${error.reason}`);
        });
      })
      .catch(error => { // If the token is not valid
          reject(`Error when getting user authorizations : ${error}`);
      });
    
    })
    .catch(error => { // If the token is not valid
        reject(`Error when validating token : ${error}`);
    });
    

    
  });
}

module.exports = {
  createLog,
  getLog,

}

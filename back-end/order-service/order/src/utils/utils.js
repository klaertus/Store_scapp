
const axios = require('axios');
const log = require('debug')('order-d')
const nano = require('nano')(process.env.DB_URL);
const orders = nano.use(process.env.DB_NAME);
var user_service = process.env.USER_SERVICE_URL

// Function to create a new order
function createOrder(token, checkout) {
  return new Promise((resolve, reject) => {
    axios.get(`${user_service}/user/validate`, { params: { token:token}})
    .then(result => { 
        let username = result.data.result
        if (username == 'guest'){
          reject('User must be connected');
          return;
        }
        orders.list({}) 
        .then(result => { // Isert the order in the database
            var orderID = result.rows.length +1;
            checkout.user = username;
            orders.insert({checkout}, orderID)
            .then(result => { 
              resolve(true)
            })
           .catch(error => { 
               reject(`Erreur lors de la creation du panier de l'utilisateur ${username}. Details : ${error}.`)
            });
        })
       .catch(error => { 
           reject(`Erreur lors de la creation du panier de l'utilisateur ${username}. Details : ${error}.`)
        });
      })
      .catch(error => { // If the token is not valid
        reject(`Échec de la vérification du token : ${error}`);
      });  
  });
}

// Function to get the order of a user
function getOrder(token) {
  return new Promise((resolve, reject) => { 
    log("Getting order 1")
    axios.get(`${user_service}/user/validate`, { params: { token:token}}) // Validate the user token
    .then(result => { 
        let username = result.data.result
        log(username)
        if (username == 'guest'){
          reject('User must be connected');
          return;
        }
        log(username)
        orders.find({ selector: { "checkout.user": username }}) // if the token is valid, get the order of the user
        .then(result => {
          const checkouts = result.docs.map(doc => doc.checkout);
          resolve(checkouts);
        })
        .catch(error => {
            reject(`Erreur lors de la récupération du panier de l'utilisateur ${username}. Details : ${error}.`)
        });
      })
      .catch(error => { // If the token is not valid
        reject(`Échec de la vérification du token. Details : ${error}`);
      });
  });
}

// Function to send a log
function sendLog(token, service, type, operation, details, responseTime) {
  // Construct the log object
  const logData = {
    timestamp: Date.now(),
    service: service,
    type: type,
    operation : operation,
    details : details,
    responseTime: responseTime,
  };
  log(logData)
  return axios.post(`${process.env.LOG_SERVICE_URL}/log/create/`, logData, { params: { token:token}}); // Send the log to the log service
}



module.exports = {
  createOrder,
  getOrder,
  sendLog
}

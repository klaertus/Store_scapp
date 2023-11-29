
const axios = require('axios');
var user_service = process.env.USER_SERVICE_URL

const log = require('debug')('order-d')

const nano = require('nano')(process.env.DB_URL);
const orders = nano.use(process.env.DB_NAME);

function createOrder(token, checkout) {
  return new Promise((resolve, reject) => {
    axios.get(`${user_service}/user/validate`, { params: { token:token}})
    .then(result => { 
        let username = result.data.result
        if (username == 'guest'){
          reject('User must be connected');
          return;
        }
        // Insérer le nouveau panier dans la base de données
        orders.list({})
        .then(result => { 
            var orderID = result.rows.length +1;
            checkout.user = username;
            orders.insert({checkout}, orderID)
            .then(result => { 
              resolve(true)
            })
           .catch(error => {
               // Gère les erreurs liées à la vérification du token
               reject(`Erreur lors de la creation du panier de l'utilisateur ${username}. Details : ${error}.`)
            });
        })
       .catch(error => {
           reject(`Erreur lors de la creation du panier de l'utilisateur ${username}. Details : ${error}.`)
        });
      })
      .catch(error => {
        // Gère les erreurs liées à la vérification du token
        reject(`Échec de la vérification du token : ${error}`);
      });
    // Créer un nouveau panier vide
    
  });
}

function getOrder(token) {
  return new Promise((resolve, reject) => {
    // Vérifie d'abord le token
    // Vérifie d'abord le token
    log("Getting order 1")
    axios.get(`${user_service}/user/validate`, { params: { token:token}})
    .then(result => { 
        let username = result.data.result
        log(username)
        if (username == 'guest'){
          reject('User must be connected');
          return;
        }
        log(username)
        // Si le token est valide, récupère le panier de l'utilisateur
        orders.find({ selector: { "checkout.user": username }})
        .then(result => {
          const checkouts = result.docs.map(doc => doc.checkout);
          resolve(checkouts);
        })
        .catch(error => {
            // Gère les erreurs liées à la vérification du token
            reject(`Erreur lors de la récupération du panier de l'utilisateur ${username}. Details : ${error}.`)
        });
      })
      .catch(error => {
        // Gère les erreurs liées à la vérification du token
        reject(`Échec de la vérification du token. Details : ${error}`);
      });
  });
}


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

  // Print information about the log in the console
  log(logData)
  // Send the log data to the log service
  return axios.post(`${process.env.LOG_SERVICE_URL}/log/create/`, logData, { params: { token:token}});
}



module.exports = {
  createOrder,
  getOrder,
  sendLog
}

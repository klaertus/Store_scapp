const axios = require('axios');


const log = require('debug')('cart-d')


const nano = require('nano')(process.env.DB_URL);
const carts = nano.use(process.env.DB_NAME);

const user_service = process.env.USER_SERVICE_URL

function getCart(token) {
  return new Promise((resolve, reject) => {
    // Vérifie d'abord le token
    // Vérifie d'abord le token
    axios.get(`${user_service}/user/validate`, { params: { token:token}})
    .then(result => { 
        let username = result.data.result
        if (username == 'guest'){
          reject('User must be connected');
          return;
        }
        // Si le token est valide, récupère le panier de l'utilisateur
        carts.get(username)
        .then(result => { 
           resolve(result)
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

function createCart(token) {
  return new Promise((resolve, reject) => {
    log(token)
    axios.get(`${user_service}/user/validate`, { params: { token:token}})
    .then(result => { 
        let username = result.data.result
        if (username == 'guest'){
          reject('User must be connected');
          return;
        }
        // Insérer le nouveau panier dans la base de données
        carts.insert({items:[]}, username)
        .then(result => { 
          resolve()
        })
       .catch(error => {
            log(error)
           // Gère les erreurs liées à la vérification du token
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

function removeFromCart(token, itemId) {
  return new Promise((resolve, reject) => {
    axios.get(`${user_service}/user/validate`, { params: { token:token}})
    .then(result => { 
        let username = result.data.result
        if (username == 'guest'){
          reject('User must be connected');
          return;
        }
        
        // Retirer l'article du panier
        carts.get(username)
        .then(result => { 
          const cart = result
          const updatedItems = cart.items.filter(item => item.id !== itemId);

          // Mettre à jour le panier dans la base de données
          carts.insert({cart, items: updatedItems}, username)
            .then(result => resolve(result))
            .catch(error => reject(`Erreur lors de la mise à jour du panier de l'utilisateur ${username}. Détails : ${error}.`));
        })
        .catch(error => {
            // Gère les erreurs liées à la vérification du token
            reject(`Erreur lors de la récupération du panier de l'utilisateur ${username}. Details : ${error}.`)
        });
        
    })
    .catch(error => {
          reject(`Échec de la vérification du token : ${error}`);
    });
  })
}

function updateCart(token, items) {
  return new Promise((resolve, reject) => {
    axios.get(`${user_service}/user/validate`, { params: { token: token } })
    .then(result => { 
        let username = result.data.result;
        if (username === 'guest'){
          reject('User must be connected');
          return;
        }

        // Récupérer le panier actuel de l'utilisateur
        carts.get(username)
        .then(cart => { 
          // Réinitialiser les articles du panier
          const updatedCart = { ...cart, items: items }; // Réinitialise les articles à un tableau vide

          // Mettre à jour le panier dans la base de données
          carts.insert(updatedCart, username)
            .then(result => resolve(result))
            .catch(error => reject(`Erreur lors de la mise à jour du panier de l'utilisateur ${username}. Détails : ${error}.`));
        })
        .catch(error => {
            reject(`Erreur lors de la récupération du panier de l'utilisateur ${username}. Détails : ${error}.`)
        });
    })
    .catch(error => {
        reject(`Échec de la vérification du token : ${error}`);
    });
  });
}

function addToCart(token, item) {
  return new Promise((resolve, reject) => {
    axios.get(`${user_service}/user/validate`, { params: { token:token}})
      .then(response => {
        let username = response.data.result;
        if (username === 'guest') {
          reject('User must be connected');
          return;
        }
        // Récupérer le panier actuel de l'utilisateur
        carts.get(username)
          .then(result => {
            // Vérifier si l'article existe déjà dans le panier
            const cart = result
            const itemIndex = cart.items.findIndex(itemr => itemr.id === item.id);
            if (itemIndex !== -1) {
              // Mettre à jour la quantité si l'article existe déjà
              cart.items[itemIndex].quantity += item.quantity;
            } else {
              // Ajouter l'article au panier s'il n'existe pas
              cart.items.push(item);
            }

            // Mettre à jour le panier dans la base de données
            carts.insert(cart, username)
              .then(result => resolve(result))
              .catch(error => reject(`Erreur lors de la mise à jour du panier de l'utilisateur ${username}. Détails : ${error}.`));
          })
          .catch(error => reject(`Erreur lors de la récupération du panier de l'utilisateur ${username}. Détails : ${error}.`));
      })
      .catch(error => reject(`Échec de la vérification du token : ${error}`));
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
  getCart,
  createCart,
  addToCart,
  removeFromCart,
  sendLog,
  updateCart
}

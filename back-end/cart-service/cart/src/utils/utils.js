const axios = require('axios');
const log = require('debug')('cart-d')
const nano = require('nano')(process.env.DB_URL);
const carts = nano.use(process.env.DB_NAME);
const user_service = process.env.USER_SERVICE_URL

// Function to get the cart of a user by token
function getCart(token) {
  return new Promise((resolve, reject) => {
    axios.get(`${user_service}/user/validate`, { params: { token:token}}) // Validate the user token
    .then(result => {  // If the token is valid, get the cart of the user
        let username = result.data.result
        if (username == 'guest'){
          reject('User must be connected');
          return;
        }
        carts.get(username) // Get the cart of the user
        .then(result => { 
           resolve(result)
        })
        .catch(error => { // If the cart doesn't exist
            reject(`Erreur lors de la récupération du panier de l'utilisateur ${username}. Details : ${error}.`)
        });
    })
    .catch(error => { // If the token is not valid
        reject(`Échec de la vérification du token. Details : ${error}`);
    });
  });
}

// Function to create a cart for a user
function createCart(token) {
  return new Promise((resolve, reject) => {
    log(token)
    axios.get(`${user_service}/user/validate`, { params: { token:token}}) // Validate the user token
    .then(result => {  // If the token is valid, create the cart of the user
        let username = result.data.result
        if (username == 'guest'){
          reject('User must be connected');
          return;
        }
        carts.insert({items:[]}, username) // Create the cart of the user and insert information in the database
        .then(result => { 
          resolve()
        })
       .catch(error => { // If the cart already exist
            log(error)
           reject(`Erreur lors de la creation du panier de l'utilisateur ${username}. Details : ${error}.`)
        });
    })
    .catch(error => { // If the token is not valid
      reject(`Échec de la vérification du token : ${error}`);
    });
  });
}

// Function to remove an item from the cart of a user
function removeFromCart(token, itemId) {
  return new Promise((resolve, reject) => {
    axios.get(`${user_service}/user/validate`, { params: { token:token}}) // Validate the user token
    .then(result => {  // If the token is valid, remove the item from the cart of the user
        let username = result.data.result
        if (username == 'guest'){
          reject('User must be connected');
          return;
        }
        carts.get(username) // Get the cart of the user
        .then(result => { 
          const cart = result
          const updatedItems = cart.items.filter(item => item.id !== itemId);
          carts.insert({cart, items: updatedItems}, username) // update the cart of the user and insert information in the database
          .then(result => resolve(result))
          .catch(error => reject(`Erreur lors de la mise à jour du panier de l'utilisateur ${username}. Détails : ${error}.`));
        })
        .catch(error => { // If the cart doesn't exist
            reject(`Erreur lors de la récupération du panier de l'utilisateur ${username}. Details : ${error}.`)
        });
        
    })
    .catch(error => { // If the token is not valid
          reject(`Échec de la vérification du token : ${error}`);
    });
  })
}

// Function to update the cart of a user
function updateCart(token, items) {
  return new Promise((resolve, reject) => {
    axios.get(`${user_service}/user/validate`, { params: { token: token } }) // Validate the user token
    .then(result => { // If the token is valid, update the cart of the user
        let username = result.data.result;
        if (username === 'guest'){
          reject('User must be connected');
          return;
        }
        carts.get(username) // Get the cart of the user
        .then(cart => { 
          const updatedCart = { ...cart, items: items }; // Update the cart of the user
          carts.insert(updatedCart, username) // Update the cart of the user and insert information in the database
            .then(result => resolve(result))
            .catch(error => reject(`Erreur lors de la mise à jour du panier de l'utilisateur ${username}. Détails : ${error}.`));
        })
        .catch(error => { // If the cart doesn't exist
            reject(`Erreur lors de la récupération du panier de l'utilisateur ${username}. Détails : ${error}.`)
        });
    })
    .catch(error => { // If the token is not valid
        reject(`Échec de la vérification du token : ${error}`);
    });
  });
}

// Function to add an item to the cart of a user
function addToCart(token, item) {
  return new Promise((resolve, reject) => {
    axios.get(`${user_service}/user/validate`, { params: { token:token}}) // Validate the user token
      .then(response => { // If the token is valid, add the item to the cart of the user
        let username = response.data.result;
        if (username === 'guest') {
          reject('User must be connected');
          return;
        }
        carts.get(username) // Get the cart of the user
          .then(result => { // If the cart exist add the item to the cart of the user
            const cart = result
            const itemIndex = cart.items.findIndex(itemr => itemr.id === item.id);
            if (itemIndex !== -1) {
              cart.items[itemIndex].quantity += item.quantity;
            } else {
              cart.items.push(item);
            }
            carts.insert(cart, username) // Update the cart of the user and insert information in the database
              .then(result => resolve(result))
              .catch(error => reject(`Erreur lors de la mise à jour du panier de l'utilisateur ${username}. Détails : ${error}.`));
          })
          .catch(error => // If the cart doesn't exist
            reject(`Erreur lors de la récupération du panier de l'utilisateur ${username}. Détails : ${error}.`)
          );
      })
      .catch(error => // If the token is not valid
        reject(`Échec de la vérification du token : ${error}`)
        );
  });
}

// Function to send a log to the log service
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

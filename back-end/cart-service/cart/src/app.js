const express = require('express')
const log = require('debug')('cart-d')
const app = express.Router()
const utils = require('./utils/utils')
const service = "cart-service"

// Get cart
app.get('/cart/get/', (req, res) => { // Get cart by user token
  const token = req.query.token;

  const operation = "GettingCart"
  utils.sendLog(token, service, "INFO", operation, `Getting cart`, 0) // Send log to log-service

  return utils.getCart(token) // Get cart from cart-service
    .then((result) => {
      utils.sendLog(token, service, "INFO", operation, `Cart succesfully retrieved`, 0) // Send log to log-service
      res.status(200).json({ status: 'success', result })
    })
    .catch((error) => {
      utils.sendLog(token, service, "ERROR", operation, `Cart not retrieved. Info : ${error}`, 0)
      res.status(403).json({ status: 'error', result: String(error)})
    })
});

// Create cart
app.post('/cart/create/', (req, res) => { // Create cart by user token
  const token = req.query.token;
  const operation = "CartCreation"
  utils.sendLog(token, service, "INFO", operation, `Creating cart`, 0)

  return utils.createCart(token) // Create cart from cart-service
    .then((result) => {
      utils.sendLog(token, service, "INFO", operation, `Cart succesfully created`, 0) // Send log to log-service
      res.status(200).json({ status: 'success', result})
    })
    .catch((error) => {
      utils.sendLog(token, service, "ERROR", operation, `Cart not created. Info : ${error}`, 0) // Send log to log-service
      res.status(403).json({ status: 'error', result: String(error) })
    })
});

// Update cart
app.put('/cart/update/', (req, res) => { // Update cart by user token and specific item need to be updated
  const token = req.query.token;
  const items = req.body.items;

  const operation = "UpdateCart" 
  utils.sendLog(token, service, "INFO", operation, `Update all content form cart with : [${items}]`, 0) // Send log to log-service

  utils.updateCart(token, items) // Update cart from cart-service
    .then(response => {
      utils.sendLog(token, service, "INFO", operation, `Cart succesfully updated`, 0) // Send log to log-service
      res.status(200).json({ status: 'success', response });
    })
    .catch(error => {
      utils.sendLog(token, service, "ERROR", operation, `Cart can't be updated. Info : ${error}`, 0)
      res.status(403).json({ status: 'error', message: String(error) });
    });
});

// Put item in cart
app.put('/cart/add/', (req, res) => { // Add item to cart by user token and spécific item need to be added
  const token = req.query.token;
  const item = req.body.item; 

  const operation = "AddItemToCart"
  utils.sendLog(token, service, "INFO", operation, `Adding item [${item}] to cart`, 0) // Send log to log-service
  log
  utils.addToCart(token, item) // Add item to user-cart from cart-service
    .then(response => {
      utils.sendLog(token, service, "INFO", operation, `Item [${item}] succesfully added to cart`, 0) // Send log to log-service
      res.status(200).json({ status: 'success', response });
    })
    .catch(error => {
      utils.sendLog(token, service, "ERROR", operation, `Item [${item}] not added to cart. Info : ${error}`, 0)
      res.status(403).json({ status: 'error', message: String(error) });
    });
});

module.exports = app

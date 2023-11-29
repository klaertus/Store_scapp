const express = require('express')
const log = require('debug')('cart-d')


const app = express.Router()
const utils = require('./utils/utils')

const service = "cart-service"

app.get('/cart/get/', (req, res) => {
  const token = req.query.token;

  const operation = "GettingCart"
  utils.sendLog(token, service, "INFO", operation, `Getting cart`, 0)

  return utils.getCart(token)
    .then((result) => {
      utils.sendLog(token, service, "INFO", operation, `Cart succesfully retrieved`, 0)
      res.status(200).json({ status: 'success', result })
    })
    .catch((error) => {
      utils.sendLog(token, service, "ERROR", operation, `Cart not retrieved. Info : ${error}`, 0)
      res.status(403).json({ status: 'error', result: String(error)})
    })
});


app.post('/cart/create/', (req, res) => {
  const token = req.query.token;
  const operation = "CartCreation"
  utils.sendLog(token, service, "INFO", operation, `Creating cart`, 0)

  return utils.createCart(token)
    .then((result) => {
      utils.sendLog(token, service, "INFO", operation, `Cart succesfully created`, 0)
      res.status(200).json({ status: 'success', result})
    })
    .catch((error) => {
      utils.sendLog(token, service, "ERROR", operation, `Cart not created. Info : ${error}`, 0)
      res.status(404).json({ status: 'error', result: String(error) })
    })
});


app.put('/cart/update/', (req, res) => {
  const token = req.query.token;
  const items = req.body.items;

  const operation = "UpdateCart"
  utils.sendLog(token, service, "INFO", operation, `Update all content form cart with : [${items}]`, 0)

  utils.updateCart(token, items)
    .then(response => {
      utils.sendLog(token, service, "INFO", operation, `Cart succesfully updated`, 0)
      res.status(200).json({ status: 'success', response });
    })
    .catch(error => {
      utils.sendLog(token, service, "ERROR", operation, `Cart can't be updated. Info : ${error}`, 0)
      res.status(404).json({ status: 'error', message: String(error) });
    });
});

app.put('/cart/add/', (req, res) => {
  const token = req.query.token;
  const item = req.body.item; 

  const operation = "AddItem"
  utils.sendLog(token, service, "INFO", operation, `Adding item [${item}] to cart`, 0)
  log
  utils.addToCart(token, item)
    .then(response => {
      utils.sendLog(token, service, "INFO", operation, `Item [${item}] succesfully added to cart`, 0)
      res.status(200).json({ status: 'success', response });
    })
    .catch(error => {
      utils.sendLog(token, service, "ERROR", operation, `Item [${item}] not added to cart. Info : ${error}`, 0)
      res.status(404).json({ status: 'error', message: String(error) });
    });
});

module.exports = app

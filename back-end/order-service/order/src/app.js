const express = require('express')
const log = require('debug')('orders-d')

const app = express.Router()
const utils = require('./utils/utils')

app.post('/order/create/', (req, res) => {
  const token = req.query.token;

  var checkout = req.body.checkout
  
  //log(`Creating a new order (${order.}) identified with "${usrPassw}"`)
  return utils.createOrder(token, checkout)
    .then((result) => {  //result is item
      res.status(200).json({ status: 'success', result })
    })
    .catch((error) => {
      res.status(409).json({ status: 'error', result: String(error) })
    })
})

app.get('/order/get/', (req, res) => {
  const token = req.query.token;
  
  //log(`Creating a new order (${order.}) identified with "${usrPassw}"`)
  log("Getting order")
  return utils.getOrder(token)
    .then((result) => {  //result is the history of orders
      res.status(200).json({ status: 'success', result})
    })
    .catch((error) => {
      res.status(409).json({ status: 'error', result: String(error) })
    })
})

module.exports = app

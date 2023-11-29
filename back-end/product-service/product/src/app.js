const express = require('express')
const log = require('debug')('product-d')

const app = express.Router()
const db = require('./utils/crud-wp')

const service = "product-service"

app.post('/product/createItem/', (req, res) => {
  var token = req.query.token;
  var name = req.body.name
  var price = req.body.price
  var image = req.body.image
  var category = req.body.category
  
  const operation = "CreateItem"
  db.sendLog(token, service, "INFO", operation, `Create new item with attributes : ${name},${price},${image},${category}`, 0)

  //log(`Creating a new order (${order.}) identified with "${usrPassw}"`)
  return db.createItem(token, name,price,image,category)
    .then((item) => {
      db.sendLog(token, service, "INFO", operation, `Item with attributes : ${name},${price},${image},${category} successfully created`, 0)
      res.status(200).json({ status: 'success', item })
    })
    .catch((error) => {
      db.sendLog(token, service, "ERROR", operation, `Item with attributes : ${name},${price},${image},${category} doesn't created. Infos : ${error}`, 0)
      res.status(403).json({ status: 'error', message: String(error) })
    })
})

app.post('/product/delItem/', (req, res) => {
  var token = req.query.token;
  var id = req.body.id;

  const operation = "DeleteItem"
  db.sendLog(token, service, "INFO", operation, `Delete item with id : ${id}`, 0)

  return db.deleteItem(token, id)
    .then(() => {
      db.sendLog(token, service, "INFO", operation, `Delete item with id : ${id}`, 0)
      res.status(200).json({ status: 'success', message: 'Item deleted successfully' });
    })
    .catch((error) => {
      db.sendLog(token, service, "ERROR", operation, `Can't delete item with id : ${id}. Infos : ${error}`, 0)
      res.status(403).json({ status: 'error', message: String(error) });
    });
});

app.post('/product/updateItem/', (req, res) => {
  var token = req.query.token;
  var id = req.body.id;
  var name = req.body.name;
  var price = req.body.price;
  var image = req.body.image;

  const operation = "UpdateItem"
  db.sendLog(token, service, "INFO", operation, `Update item with id : ${id} with theses attributes : ${name},${price},${image}`, 0)

  return db.updateItem(token, id, name, price, image)
    .then((result) => {
      db.sendLog(token, service, "INFO", operation, `Successfully updated item with id : ${id} with theses attributes : ${name},${price},${image}`, 0)
      res.status(200).json({ status: 'success', message: 'Item updated successfully', result });
    })
    .catch((error) => {
      db.sendLog(token, service, "ERROR", operation, `Can't update item with id : ${id} with theses attributes : ${name},${price},${image}. Infos : ${error}`, 0)
      res.status(403).json({ status: 'error', message: String(error) });
    });
});

app.post('/product/initOrder/', (req, res) => {
  const data = {
		Vegetables: [
			{
				name: 'Brocolli',
				price: 2.73,
				image:
					'https://res.cloudinary.com/sivadass/image/upload/v1493620046/dummy-products/broccoli.jpg',
				category: 'Vegetables'
			},
			{
     
				name: 'Cauliflower',
				price: 6.3,
				image:
					'https://res.cloudinary.com/sivadass/image/upload/v1493620046/dummy-products/cauliflower.jpg',
				category: 'Vegetables'
			},
			{
      
				name: 'Cucumber',
				price: 5.6,
				image:
					'https://res.cloudinary.com/sivadass/image/upload/v1493620046/dummy-products/cucumber.jpg',
				category: 'Vegetables'
			},
			{
        
				name: 'Beetroot',
				price: 8.7,
				image:
					'https://res.cloudinary.com/sivadass/image/upload/v1493620045/dummy-products/beetroot.jpg',
				category: 'Vegetables'
			}
		],
		Fruits: [
			{
      
				name: 'Apple',
				price: 2.34,
				image:
					'https://res.cloudinary.com/sivadass/image/upload/v1493620045/dummy-products/apple.jpg',
				category: 'Fruits'
			},
			{
      
				name: 'Banana',
				price: 1.69,
				image:
					'https://res.cloudinary.com/sivadass/image/upload/v1493620045/dummy-products/banana.jpg',
				category: 'Fruits'
			},
			{
        
				name: 'Grapes',
				price: 5.98,
				image:
					'https://res.cloudinary.com/sivadass/image/upload/v1493620045/dummy-products/grapes.jpg',
				category: 'Fruits'
			},
			{
       
				name: 'Mango',
				price: 6.8,
				image:
					'https://res.cloudinary.com/sivadass/image/upload/v1493620045/dummy-products/mango.jpg',
				category: 'Fruits'
			}
		]
	};

  for (const category in data) {
      for (const item of data[category]) {
          db.initProduct(item.name, item.price, item.image, category)
              .then(success => console.log(success))
              .catch(error => console.error(error));
      }
  }

  res.status(200).json({ status: 'success', message: 'Data inserted successfully' });
});

app.get('/product/items/', (req, res) => {
  return db.list({ include_docs: true })
    .then((body) => {
      let items = body.rows.map(row => {
        return {
          id: row.doc.id,
          name: row.doc.name,
          price: row.doc.price,
          image: row.doc.image,
          category: row.doc.category,
        };
      });
      let sortedItems = items.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      }, {});
      res.status(200).json({ status: 'success', items: sortedItems})
    })
    .catch((err) => {
      res.status(403).json({ status: 'error', message: String(err) })
    })
});


module.exports = app

const nano = require('nano')(process.env.DB_URL);
const db = nano.use(process.env.DB_NAME);
const log = require('debug')('product-d')
const user_service = process.env.USER_SERVICE_URL
const axios = require('axios');

// Function to create a new item
function createItem (token, name,price,image,category) {
  return new Promise((resolve, reject) => {
    axios.get(`${user_service}/user/level`, { params: { token:token}}) // Validate the user token
      .then(response => {
        let level = response.data.result;
        log(response.data)
        log(token)
        if (level != 2) {
          reject("User is not admin");
          return;
        }
        
        var id = crypto.randomUUID();
        db.insert( // Insert the item in the database
          // argument of nano.insert()
          {
            '_id': id,
            'id': id,
            'name': name,
            'price': parseFloat(price),
            'image': image,
            'category': category,
          },
          // callback to execute once the request to the DB is complete
          (error, success) => {
            if (success) {
              resolve(success)
            } else {
              reject(`In the creation of order. Details: ${error.reason}.`)
            }
          }
        )

        
      }).catch(error => reject(`Can't check user authorizations. Details : ${error}`));
  });
    
}

// Function to init the product database
function initProduct(name,price,image,category){
  return new Promise((resolve, reject) => {
    var id = crypto.randomUUID();
        db.insert(
          // argument of nano.insert()
          {
            '_id': id,
            'id': id,
            'name': name,
            'price': parseFloat(price),
            'image': image,
            'category': category,
          },
          // callback to execute once the request to the DB is complete
          (error, success) => {
            if (success) {
              resolve(success)
            } else {
              reject(`In the creation of order. Details: ${error.reason}.`)
            }
          }
        )
    })
}

// delete an item
function deleteItem(token, id) {
  return new Promise((resolve, reject) => {
    axios.get(`${user_service}/user/level`, { params: { token:token}})
      .then(response => {
        let username = response.data.result;
        if (username === 'guest') {
          reject('User must be connected');
          return;
        }
        // First, get the existing document
        db.get(id, (err, existing) => {
          if (!err) {
            // Delete the document using its ID and _rev
            db.destroy(existing._id, existing._rev, (err, body) => {
              if (!err) {
                resolve(body);
              } else {
                reject(`Failed to delete item (${id}). Details: ${err.reason}.`);
              }
            });
          } else {
            reject(`Failed to find item (${id}). Details: ${err.reason}.`);
          }
        });

      }).catch(error => reject(`Can't check user authorizations. Details : ${error}`)); 
  });
}

// update an item
function updateItem(token, id, name, price, image) {
  return new Promise((resolve, reject) => {
    axios.get(`${user_service}/user/level`, { params: { token:token}})
      .then(response => {
        let username = response.data.result;
        if (username === 'guest') {
          reject('User must be connected');
          return;
        }
        // First, get the existing document
        db.get(id, (err, existing) => {
          if (!err) {
            // Update the document with the new fields
            const updatedDoc = { ...existing, name, price, image };

            // Save the updated document back to the database
            db.insert(updatedDoc, (err, result) => {
              if (!err) {
                resolve(result);
              } else {
                reject(`Failed to update item (${id}). Details: ${err}.`);
              }
            });
          } else {
            reject(`Failed to find item (${id}). Details: ${err}.`);
          }
        });
      }).catch(error => reject(`Can't check user authorizations. Details : ${error}`)); 
  });
}

// Function to list all items
function list (options) {
  return new Promise((resolve, reject) => {
    db.list(options, (error, success) => {
      if (success) {
        resolve(success)
      } else {
        reject(`To fetch information of order. Reason: ${error.reason}.`)
      }
    })
  })
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

  // Print information about the log in the console
  log(logData)
  // Send the log data to the log service
  return axios.post(`${process.env.LOG_SERVICE_URL}/log/create/`, logData, { params: { token:token}});
}


module.exports = {
  createItem,
  list,
  deleteItem,
  updateItem,
  sendLog,
  initProduct,
};


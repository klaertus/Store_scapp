const bcrypt = require('bcryptjs')
const tku = require('./en-de-coders')
const log = require('debug')('users-d')
const axios = require('axios')

const nano = require('nano')(process.env.DB_URL);
const users = nano.use(process.env.DB_NAME);

const cart_service = process.env.CART_SERVICE_URL


function equalPassws (usrPass, usrDbPass) {
  return bcrypt.compareSync(usrPass, usrDbPass)
}

function getUsername(token){
  return new Promise((resolve, reject) => {
    const decoded = tku.verifyToken(token)
    if (decoded.valid) {
      users.get(decoded.username)
      .then(result => {
        resolve(decoded.username)
      })
      .catch(error => {
        resolve('guest')
      });

    } else {
        resolve('guest')
    }
  })
}

function getUserLevel(token) {
  return new Promise((resolve, reject) => {
      //if (!token){
      //  return;
      //}
      getUsername(token)
      .then(result => {
        const username = result
        if (username == 'guest'){
          resolve(0);
          return;
        }
        users.get(username)
        .then(result => {
          if (result && result.isAdmin) {
            resolve(2);
          } else {
            resolve(1);
          }
        })
        .catch(error => {
          resolve(0);
        });
  
      });
      
  })
}



function createUser(username, password) {
  return new Promise((resolve, reject) => {
    // Check if username and password are provided
    log("pass1")
    if (!username || !password) {
      reject('Username and password are required.');
      return;
    }
    // Check if it's the first user creation -> if yes, the user will be an admin
    users.list({ limit: 1 }) 
    .then(result => {
      var isFirstUser = result && result.rows.length === 0;
      
      // Check if the new user already exists
      users.get(username)
      .then(result => {
          reject('User already exists');
          return;
      })
      .catch(error => {
        if (!(error.statusCode === 404)) {
          log("pass6")
          reject(`Can't check if user exist`);
          return;
        } else {
              // Create the new user
          users.insert({ 'passw': bcrypt.hashSync(username, bcrypt.genSaltSync()),'isAdmin': isFirstUser}, username)
          .then(result => {
            var token = tku.encodeToken(username)
            resolve(token)     
          })
          .catch(error => {
            reject(`Can't add the new user. Details: ${error}.`);
            return;
          });
        }
      })
    })
    .catch(error => {
      reject(`Error checking existing users. Reason: ${error.reason}.`);
      return;
    });
  })
}


function authenticateUser(username, password) {
  // Return the token of a provided username and password
  // Used for login into the website

  return new Promise((resolve, reject) => {
    users.get(username)
    .then(result => {
      if (!equalPassws(password, result.passw)) {
        reject(`Passwords for user: ${password} do not match.`)
        return;
      }
      const token = tku.encodeToken(username);
      resolve(token)
    })
    .catch(error => {
        reject(`Can't find ${username} in the database`);
    });
  });
}


function setAdmin(token, targetUser) {
  return new Promise((resolve, reject) => {
    // Vérifier si l'utilisateur qui fait la demande est un administrateur
    getUserLevel(token)
    .then(result => {
      if (result != 2) {
        reject("User is not admin");
        return;
      } 
      // Récupérer l'utilisateur cible de la base de données
      users.get(targetUser)
        .then(result => {
          const userDoc = result;
          // Mettre à jour l'utilisateur cible comme administrateur
          userDoc.isAdmin = true;
          // Enregistrer les modifications dans la base de données
          users.insert(userDoc)
          .then(result => {
            resolve(true);
          })
          .catch(error => {
            reject(`Erreur lors de la mise à jour de l'utilisateur: ${error}`);
          });
        })
        .catch(error => {
          reject(`Can't find user [${targetUser}] in the database. Details : ${error}`);
        });
      
    })
    .catch(error => {
        reject(error);
    }); 
  })
};

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
  createUser,
  authenticateUser,
  setAdmin,
  sendLog,
  getUserLevel,
  getUsername

}

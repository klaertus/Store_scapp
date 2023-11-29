const moment = require('moment')
const jwt = require('jwt-simple')

function encodeToken(username) {
  var playload = {
    exp: moment().add(14, 'days').unix(),
    iat: moment().unix(),
    sub: username
  }
  return jwt.encode(playload, process.env.TOKEN_SECRET)
}

function verifyToken(token) {
  try {
    var decoded = jwt.decode(token, process.env.TOKEN_SECRET);
      if (decoded.exp <= moment().unix()) {
        return { valid: false};
      }
      else {
        return { valid: true, username:decoded.sub};
      }
    } catch (error) {
    return { valid: false};
  }
      
}

module.exports = {
  encodeToken,
  verifyToken
}

const base64url = require('base64url')
const JWT = require('../utils/jwt')
const KeyService = require('../services/keyservice')

function isAuthenticated(req, res, next) {
 
  let authorization = req.headers.authorization
  if (!authorization || !(authorization.search('Bearer ') === 0)) {
    return next(new Error('401 Missing Authorization Header'))
  }
  let token = authorization.split(' ')[1]
  if (!token) {
    return next(new Error('401 Missing Bearer Token'))
  }

  // Unpack JWT
  let components = token.split('.')
  let header = JSON.parse(base64url.decode(components[0]))
  let payload = JSON.parse(base64url.decode(components[1]))
  let signature = components[2]

  req.param.email = payload.email

  // Verify JWT
  KeyService.get(payload.jti)
    .then(function(userKey) {
      let authenticated = JWT.verify(token, userKey)
      if (authenticated) {
        return next()
      }

      return next(new Error('403 Invalid Access Token'))
    })
}

module.exports = {
  isAuthenticated: isAuthenticated
}
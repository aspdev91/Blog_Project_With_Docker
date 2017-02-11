const _ = require('underscore')
const jsrsasign = require('jsrsasign')

const sessionKey = require('../utils/sessionKey')

const JWT_OPTIONS = require('../env').JWT_OPTIONS
const JWT_ENCODING_ALGORITHM = JWT_OPTIONS.algorithm

const JWT_SECRET_SEPARATOR = JWT_OPTIONS.secret_seperator

function JWT() {
  this.secretKey = JWT_OPTIONS.secret
}

// Generate a new JWT
JWT.prototype.generate = function(user, userKey, issuedAt,
                                  expiresAt) {
  if (!user.id || !user.email) {
    throw new Error('user.id and user.email are required parameters')
  }

  var header = {
    alg: JWT_ENCODING_ALGORITHM, typ: 'JWT'
  }

  var payload = {
    email: user.email,
    jti: sessionKey(user.id, issuedAt),
    iat: issuedAt,
    exp: expiresAt
  }

  var secret = this.secret(userKey)
  var token = jsrsasign.jws.JWS.sign(JWT_ENCODING_ALGORITHM,
                         JSON.stringify(header),
                         JSON.stringify(payload),
                         secret)
  return token
}

JWT.prototype.verify = function(token, userKey) {
  var secret = this.secret(userKey)
  var isValid = jsrsasign.jws.JWS.verifyJWT(token,
                                            secret,
                                            {
                                              alg: [JWT_ENCODING_ALGORITHM],
                                              verifyAt: new Date().getTime()})
  return isValid
}

// Token Secret generation
JWT.prototype.secret = function(userKey) {
  return this.secretKey + JWT_SECRET_SEPARATOR + userKey
}

module.exports = new JWT()
// KeyService stores and manages user-specific keys used to sign JWTs
const redis = require('redis')
const Promise = require('bluebird')
const uuid = require('node-uuid')
const KEY_SERVICE_INFO = require('../env')["KEY_SERVICE_INFO"]
const KEY_SERVICE_PORT = KEY_SERVICE_INFO.port
const KEY_SERVICE_HOST = KEY_SERVICE_INFO.host
const KEY_SERVICE_EXPIRES_SECONDS = KEY_SERVICE_INFO.expires_seconds
const JWT = require('../utils/jwt')
const sessionKey = require('../utils/sessionKey')

Promise.promisifyAll(redis.RedisClient.prototype)

function KeyService() {
  this.client = redis.createClient(KEY_SERVICE_PORT,
                                   KEY_SERVICE_HOST)
  this.client.on('connect', function() {
    console.log('Redis connected.')
  })
  console.log('Connecting to Redis...')
}

// Retrieve a JWT user key
KeyService.prototype.get = function(sessionKey) {
  return this.client.getAsync(sessionKey)
}

// Generate and store a new JWT user key
KeyService.prototype.set = function(user) {
  let userKey = uuid.v4()
  let issuedAt = new Date().getTime()

  let expiresAt = issuedAt + (KEY_SERVICE_EXPIRES_SECONDS * 1000)

  let token = JWT.generate(user, userKey, issuedAt, expiresAt)
  let key = sessionKey(user.id, issuedAt)

  let setKey = this.client.setAsync(key, userKey)
  let setExpiration = setKey.then(this.client.expireAsync(key,
                                  KEY_SERVICE_EXPIRES_SECONDS))
  let getToken = setExpiration.then(function() {
    return token
  })

  return getToken
}

// Manually remove a JWT user key
KeyService.prototype.delete = function(sessionKey) {
  return this.client.delAsync(sessionKey)
}

module.exports = new KeyService()
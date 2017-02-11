'use strict'

const http = require('http');
const server = http.createServer();
const models = require('./models');
const Promise = require('bluebird')

server.on('request', require('./app'))
// var port
if (process.env.NODE_ENV === 'production') {
    var port = process.env.PORT
} else {
    var port = 3000
}


models.Blog.sync({ force: true })
    .then(() => models.User.sync({ force: true }))
    .then(() => models.Comment.sync({ force: true }))
    .then(() => {
        server.listen(port, function () {
            console.log(`Server is listening on ${port}`)
        })
    })
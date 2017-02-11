'use strict'

const express = require('express')
const app = express()

const helmet = require('helmet')

const bodyParser = require('body-parser')
const morgan = require('morgan')

const blogRouter = require('./routes/blog')
const userRouter = require('./routes/user')

const path = require('path')
module.exports = app

// uses morgan 
app.use(morgan('dev'))

// protection middleware for express
app.use(helmet())

// parse all application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse all application/json
app.use(bodyParser.json())

// Sub-routers for blog and user
app.use('/blog', blogRouter)
app.use('/user', userRouter)

// error middleware to handle 
app.use((err, req, res, next) => {
    err.status = err.status || 500
    err.message = err.message || 'Internal Error'
    res.status('error').send({ err })
}) 

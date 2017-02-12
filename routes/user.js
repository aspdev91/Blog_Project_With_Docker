'use strict'

const _ = require('underscore')
const Promise = require('bluebird')
const express = require('express')
const router = express.Router()
const User = require('../models').User
const KeyService = require('../services/keyservice')
const auth = require('../auth')

module.exports = router

// Register User
router.post('/register', function (req, res, next) {

    if (!req.body.email || !req.body.password) {
        return res.status(400).send({
            error: 'email and password ' +
            'are required parameters'
        })
    }

    User.findOrCreate({
        where: {
            email: req.body.email
        },
        defaults: {
            password: req.body.password
        }
    })
        .spread((user, created) => {
            if (!created) {
                return res.status(409).send({
                    error: 'User with that email ' +
                    'already exists.'
                })
            }
            res.status(201).send(user.email)
        })
        .catch(next)
})


// login
router.post('/login', function (req, res, next) {

    if (!req.body.email || !req.body.password) {
        return res.status(400).send({
            error: 'email and password ' +
            'are required parameters'
        })
    }

    let user = User.findOne({
        where: {
            email: req.body.email
        },
        attributes: {
            include: ['password', 'salt']
        }
    })

    let passwordMatch = user.then(function (userResult) {
        if (!userResult) {
            return res.sendStatus(401)
        }
        return userResult.isPasswordValid(req.body.password)
    })

    Promise.join(user, passwordMatch, function (userResult, passwordMatchResult) {
        if (!passwordMatchResult) {
            return res.status(403).send({
                error: 'Incorrect password'
            })
        }

        return KeyService.set(userResult)
            .then(function (token) {
                res.status(200).send({
                    accessToken: token
                })
            })
    })
        .catch(next)
})

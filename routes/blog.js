'use strict'

const express = require('express')
const router = express.Router()
const { Blog, Comment, User } = require('../models')
const auth = require('../auth')


module.exports = router

// Get /blog
router.get('/', (req, res, next) => {

    Blog.findAll({ limit: 10 })
        .then(function (blogs) {
            res.json(blogs)
        })
        .catch(next)
})

// Post /blog
router.post('/addBlog', auth.isAuthenticated, (req, res, next) => {

    User.findOne({
        where: {
            "email": req.param.email
        }
    })
        .then((user) => {
            let newBlogBlueprint = req.body
            newBlogBlueprint.userId = user.id
            return Blog.create(newBlogBlueprint)
        })
        .then((newBlog) => {
            res.send(newBlog)
        })
        .catch(next)
})


// Get /blog/addComment
router.post('/addComment', (req, res, next) => {
    // check if blog id exists
    Blog.findOne({
        where: {
            id: req.body.blogId
        }
    })
        .then((blog) => {
            if (blog === null) {
                return res.status(400).send("The blog does not exist and " +
                    "therefore, the comment was not processed.")
            }
            return Comment.create(req.body)
        })
        .then(() => {
            res.status(200).send()
        })
        .catch(next)

})


router.get('/view/:urlTitle', function (req, res, next) {
    var urlTitleOfBlog = req.params.urlTitle

    var blog
    Blog.findOne({
        where: {
            "urlTitle": urlTitleOfBlog
        }
    })
        .then(function (blogResult) {
            blog = blogResult
            if (blog === null) {
                return res.status(400).send('That blog does not exist!')
            }
            return Comment.findAll({
                where: {
                    blogId: blog.id
                }
            })
        })
        .then((comments) => {
            res.json({ blog, comments })
        })
        .catch(next)
})
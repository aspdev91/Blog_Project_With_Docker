const chai = require('chai')
const expect = chai.expect
const supertest = require('supertest-as-promised')
const { Blog, User, Comment } = require('../models')
const Promise = require('bluebird')
const app = require('../app')
const agent = supertest.agent(app)

describe('http requests on routes', function () {

    // Recreates tables clearing out all existing data
    before(function beforeFn() {
        return User.sync({ force: true })
            .then(() => {
                return Blog.sync({ force: true })
            })
            .then(() => {
                return Comment.sync({ force: true })
            })
    })

    var accessToken

    // Register user

    before(function () {
        return agent.post('/user/register')
            .set('Accept', 'application/json')
            .send({
                'email': 'test@gmail.com',
                'username': "tester",
                'password': "testing123456"
            })
    })

    // Login user and retrieve token

    before(function () {
        return agent.post('/user/login')
            .set('Accept', 'application/json')
            .send({
                'email': 'test@gmail.com',
                'password': "testing123456"
            })
            .then(res => {
                accessToken = res.body.accessToken
            })
    })

    // Holds generated url of created blog

    var urlTitleBlog1

    // Creates blog for future tests

    before(function () {
        return agent
            .post('/blog/addBlog')
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Accept', 'application/json')
            .send({
                'title': 'Will adding a new blog work?',
                'content': "If mocha, chai, and supertest says so."
            })
            .then((res) => {
                urlTitleBlog1 = res.body.urlTitle
            })
    })

    describe('POST /blog (add a blog)', function () {

        it('responds in 200 success', function () {
            return agent
                .post('/blog/addBlog')
                .set('Authorization', `Bearer ${accessToken}`)
                .set('Accept', 'application/json')
                .send({
                    'title': 'Will adding a second blog work?',
                    'content': "If mocha, chai, and supertest says so again."
                })
                .expect(200)
        })

        it('responds in 500 failure with wrong authorization token', function () {
            return agent
                .post('/blog/addBlog')
                .set('Authorization', `Bearer ${accessToken}abcde`)
                .set('Accept', 'application/json')
                .send({
                    'title': 'Will adding a new blog work?',
                    'content': "If mocha, chai, and supertest says so."
                })
                .expect(500)
        })

        it('responds in 500 failure with no authorization token', function () {
            return agent
                .post('/blog/addBlog')
                .set('Accept', 'application/json')
                .send({
                    'title': 'Will adding a new blog work?',
                    'content': "If mocha, chai, and supertest says so."
                })
                .expect(500)
        })
    })

    describe('POST /blog/addComment (add a comment)', function () {

        it('responds with 200 success', function () {
            return agent
                .post('/blog/addComment')
                .set('Accept', 'application/json')
                .send({
                    'content': 'Mocha + Chai is awesome!',
                    'blogId': 1
                })
                .expect(200)
        })

        it("responds with 400 if blog doesn't exit", function () {
            return agent
                .post('/blog/addComment')
                .set('Accept', 'application/json')
                .send({
                    'content': 'Mocha + Chai is awesome!',
                    'blogId': 1000000
                })
                .expect(400)
        })

    })

    describe('GET /blog/view/:urlTitle (access a blog)', function () {

        it('responds in 200 success with json data', function () {
            return agent
                .get(`/blog/view/${urlTitleBlog1}`)
                .expect('Content-Type', /json/)
                .expect(200)
        })

        it('returns the created blog and comments', function () {
            return agent.get(`/blog/view/${urlTitleBlog1}`)
                .then(res => {
                    expect(res.body.blog.title).to.equal('Will adding a new blog work?')
                    expect(res.body.blog.content).to.equal('If mocha, chai, and supertest says so.')
                    expect(res.body.blog.urlTitle).to.equal(urlTitleBlog1)
                    expect(res.body.comments[0].content).to.equal('Mocha + Chai is awesome!')
                    expect(res.body.comments[0].blogId).to.deep.equal(1)
                })
        })

        it("responds in 400 if blog doesn't exit", function () {
            return agent
                .get(`/blog/view/nonexistentblog`)
                .expect(400)
        })

    })

    describe('GET /blog (all blogs)', function () {


        it('responds in 200 success with json data', function () {
            return agent
                .get('/blog')
                .expect('Content-Type', /json/)
                .expect(200)
        })

        it('returns the created data', function () {
            return agent
                .get('/blog')
                .then((res) => {
                    expect(res.body[0].title).to.equal('Will adding a new blog work?')
                    expect(res.body[0].content).to.equal("If mocha, chai, and supertest says so.")
                    expect(res.body[0].urlTitle).to.equal(urlTitleBlog1)
                    expect(res.body[0].userId).to.equal(1)
                    expect(res.body[1].title).to.equal('Will adding a second blog work?')
                    expect(res.body[1].content).to.equal("If mocha, chai, and supertest says so again.")
                    expect(res.body[1].userId).to.equal(1)
                })
        })
    })

    // after(function () {
    //     return Blog.truncate({})
    //         .then(function () {
    //             return Comment.truncate({})
    //         })
    //         .then(function () {
    //             return User.truncate({})
    //         })
    // })
})
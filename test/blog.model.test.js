'use strict';

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-things'));
const Blog = require('../models').Blog;
const db = require('../models').db;

describe('Blog Model', function () {

    before(function () {
        return Blog.sync({ force: true })
    });

    describe('Validations', function () {

        it('errors without title', function () {
            let blog = Blog.build({});
            return blog
                .validate()
                .then(function (err) {
                    expect(err).to.exist;
                    expect(err.errors).to.contain.a.thing.with.property('path','title');
                });
        });

        it('errors without content', function () {
            let blog = Blog.build({});
            return blog
                .validate()
                .then(function (err) {
                    expect(err).to.exist;
                    expect(err.errors).to.contain.a.thing.with.property('path', 'content');
                });
        });
    })

    describe('Hooks', function () {

        it('it sets urlTitle based on title before validating', function () {

            let blog = Blog.build({
                title: 'Test',
                content: 'TestContent'
            });

            return blog.save()
                .then(function () {
                    expect(blog.urlTitle).to.include('Test');
                });
        });

    });

});
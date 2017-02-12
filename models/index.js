'use strict'

const Sequelize = require('sequelize')
const database_info = require('../env')["POSTGRESQL_INFO"]
var db = new Sequelize(database_info)
var crypto = require('crypto')

var User = db.define('user', {
    name: {
        type: Sequelize.STRING,
        allownull: false,
    },
    email: {
        type: Sequelize.STRING,
        allownull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: Sequelize.STRING,
        set: function (plaintext) {
            this.setDataValue('password', this.hashPassword(plaintext))
        }
    },
    salt: {
        type: Sequelize.STRING,
        defaultValue: function () {
            return crypto.randomBytes(16).toString('base64')
        }
    }
}, {
        defaultScope: {
            attributes: { exclude: ['password', 'salt'] }
        },
        instanceMethods: {
            hashPassword: function (plaintext) {
                return crypto.pbkdf2Sync(plaintext, this.salt, 10000, 64).toString('base64')
            },
            isPasswordValid: function (attempt) {
                return this.hashPassword(attempt) === this.password
            }
        }
    })

var Blog = db.define('blog', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    urlTitle: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        references: 'users',
        referencesKey: 'id'
    }
},
    {
        hooks: {
            beforeValidate: function (page) {
                if (page.title) {
                    page.urlTitle = page.title.replace(/ /g, '').replace(/\W/g, '') + Math.random().toString(10).substring(2, 8)
                }
            }
        }
    }
)

var Comment = db.define('comment', {
    content: {
        type: Sequelize.STRING(500),
        allownull: false
    },
    blogId: {
        type: Sequelize.INTEGER,
        references: 'blogs',
        referencesKey: 'id'
    }
})

Blog.belongsTo(User)
Comment.belongsTo(Blog)

module.exports = {
    Blog,
    User,
    Comment,
    db
}
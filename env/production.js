module.exports = {
    "POSTGRESQL_INFO": {
        "username": process.env.BLOG_USERNAME,
        "password": process.env.BLOG_PASSWORD,
        "database": process.env.BLOG_DATABASE,
        "host": process.env.BLOG_HOST,
        "port": process.env.BLOG_PORT,
        "dialect": "postgres",
        "logging": false
    },
    "KEY_SERVICE_INFO": {
        "host": process.env.KEY_SERVICE_HOST,
        "port": process.env.KEY_SERVICE_PORT,
        "expires_seconds": process.env.KEY_SERVICE_EXPIRES_SECONDS
    },
    "JWT_OPTIONS": {
        "algorithm": process.env.JWT_ALGORITHM,
        "secret_separator": process.env.JWT_SECRET_SEPERATOR,
        "secret": process.env.JWT_SECRET
    }
}

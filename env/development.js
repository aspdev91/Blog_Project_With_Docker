module.exports = {
    "POSTGRESQL_INFO": {
        "username": "michael",
        "password": "myPassword",
        "database": "blog_db",
        "host": "127.0.0.1",
        "port": "5432",
        "dialect": "postgres",
        "logging": false
    },
    "KEY_SERVICE_INFO": {
        "host": "127.0.0.1",
        "port": 6379,
        "expires_seconds": 3600
    },
    "JWT_OPTIONS": {
        "algorithm": "HS256",
        "secret_separator": ".",
        "secret": "thisismysecret"
    }
}
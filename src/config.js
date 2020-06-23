module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_TOKEN: process.env.API_TOKEN || 'my-api-token',
    DB_URL: process.env.DATABASE_URL || 'postgresql://dunder_mifflin@localhost/bookmarks',
    TEST_DB_URL: process.env.TEST_DATABASE_URL || 'postgresql://dunder_mifflin@localhost/bookmarks'
}
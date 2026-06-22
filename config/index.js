module.exports = {
    port: process.env.PORT || 3000,
    db: {
        url: process.env.DB_URI,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    }
};

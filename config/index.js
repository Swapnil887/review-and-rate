const defaultCorsOrigins = [
    'https://review-and-rate-fe.vercel.app',
    'https://review-and-rate-fe-git-main-swapnil887s-projects.vercel.app',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
];
module.exports = {
    port: process.env.PORT || 3000,
    db: {
        url: process.env.DB_URI,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    cors: {
        origins: process.env.CORS_ORIGINS
            ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
            : defaultCorsOrigins,
    },
};
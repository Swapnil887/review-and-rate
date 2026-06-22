require('dotenv').config();

// Development only: use public DNS so mongodb+srv SRV lookup works
if (process.env.NODE_ENV !== 'production') {
    const dns = require('dns');
    dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const userRoutes = require('./routes/user.route');
const companyRoutes = require('./routes/company.route');
const reviewRoutes = require('./routes/review.route');

const app = express();
const { port, db } = config;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Review & Rate API',
        database: mongoose.connection.name,
        mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});

app.use('/api/auth', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/companies/:companyId/reviews', reviewRoutes);

mongoose
    .connect(db.url)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });

const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const {
    signup,
    login,
    logout,
    refreshToken
} = require('../controller/user.controller');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/refresh-token', refreshToken);

module.exports = router;

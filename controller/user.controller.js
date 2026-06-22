const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config');

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user._id, email: user.email, type: 'access' },
        config.jwt.secret,
        { expiresIn: config.jwt.accessExpiresIn }
    );

    const refreshToken = jwt.sign(
        { id: user._id, type: 'refresh' },
        config.jwt.secret,
        { expiresIn: config.jwt.refreshExpiresIn }
    );

    return { accessToken, refreshToken };
};

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with this email.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const { accessToken, refreshToken } = generateTokens(user);
        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            message: 'User registered successfully.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            accessToken,
            refreshToken
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to register user.', error: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const { accessToken, refreshToken } = generateTokens(user);
        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            message: 'Login successful.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            accessToken,
            refreshToken
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to login.', error: err.message });
    }
};

const logout = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
        res.status(200).json({ message: 'Logout successful.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to logout.', error: err.message });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Refresh token is required.' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, config.jwt.secret);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired refresh token.' });
        }

        if (decoded.type !== 'refresh') {
            return res.status(401).json({ message: 'Invalid token type.' });
        }

        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== token) {
            return res.status(401).json({ message: 'Invalid refresh token.' });
        }

        const tokens = generateTokens(user);
        user.refreshToken = tokens.refreshToken;
        await user.save();

        res.status(200).json({
            message: 'Token refreshed successfully.',
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to refresh token.', error: err.message });
    }
};

module.exports = {
    signup,
    login,
    logout,
    refreshToken
};

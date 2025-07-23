// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Game = require('./models/Game');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SEC = process.env.JWT_SECRET || 'replace_this_with_a_strong_secret';

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// --- JUDGE0 CONFIG ---
const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com';
const judge0Headers = {
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
    'Content-Type': 'application/json'
};

/**
 * @route POST /api/compile
 * @desc  Submit code to Judge0 and return the result
 */
app.post('/api/compile', async(req, res) => {
    try {
        const { source_code, language_id, stdin } = req.body;
        const response = await axios.post(
            `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, { source_code, language_id, stdin }, { headers: judge0Headers }
        );
        res.json(response.data);
    } catch (error) {
        console.error('Compile error:', error.message);
        res.status(500).json({ error: 'Compilation failed', details: error.message });
    }
});

// --- AUTH ROUTES ---

/**
 * @route POST /api/auth/register
 * @desc  Create a new user account
 */
app.post('/api/auth/register', async(req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'First name, last name, email and password are required' });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const hash = await bcrypt.hash(password, 12);
        const user = await User.create({ firstName, lastName, email, password: hash });
        const token = jwt.sign({ id: user._id }, JWT_SEC, { expiresIn: '7d' });
        res.json({ token });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route POST /api/auth/login
 * @desc  Authenticate a user and return a JWT
 */
app.post('/api/auth/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, JWT_SEC, { expiresIn: '7d' });
        res.json({ token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- AUTH MIDDLEWARE ---
function requireAuth(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }
    const token = auth.replace('Bearer ', '');
    try {
        const payload = jwt.verify(token, JWT_SEC);
        req.userId = payload.id;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(401).json({ error: 'Invalid token' });
    }
}

// --- GAME ROUTES ---

/**
 * @route POST /api/games
 * @desc  Save a custom game for the authenticated user
 */
app.post('/api/games', requireAuth, async(req, res) => {
    try {
        const { title, html, javascript } = req.body;
        const newGame = new Game({ title, html, javascript, owner: req.userId });
        const saved = await newGame.save();
        res.json(saved);
    } catch (error) {
        console.error('Save game error:', error);
        res.status(400).json({ error: 'Could not save game', details: error.message });
    }
});

/**
 * @route GET /api/games
 * @desc  List all custom games for the authenticated user
 */
app.get('/api/games', requireAuth, async(req, res) => {
    try {
        const games = await Game.find({ owner: req.userId }).sort({ createdAt: -1 });
        res.json(games);
    } catch (err) {
        console.error('List games error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @route GET /api/games/:id
 * @desc  Get a single custom game by ID (must belong to the user)
 */
app.get('/api/games/:id', requireAuth, async(req, res) => {
    try {
        const game = await Game.findOne({ _id: req.params.id, owner: req.userId });
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }
        res.json(game);
    } catch (error) {
        console.error('Get game error:', error);
        res.status(400).json({ error: 'Invalid game ID', details: error.message });
    }
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`🚀 Backend running on https://code-play-b0l6.onrender.com`);
});

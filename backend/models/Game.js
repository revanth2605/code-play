// backend/models/Game.js

const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    title: { type: String, required: true },
    html: { type: String, required: true },
    javascript: { type: String, required: true },

    // ← this is the new owner field
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', GameSchema);
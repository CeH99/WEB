const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['operator', 'engineer', 'director'], 
        default: 'operator' 
    },
    // Для Account lockout після 5 спроб
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number },
    // Для Password expiration (90 днів)
    passwordChangedAt: { type: Date, default: Date.now }
});

userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model('User', userSchema);
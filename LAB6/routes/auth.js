const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

router.post('/register',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).trim().escape(),
    body('name').notEmpty().trim().escape(),
    body('role').isIn(['operator', 'engineer', 'director']).optional(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { email, password, name, role } = req.body;
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ error: 'Користувач вже існує' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ email, password: hashedPassword, name, role });

            res.status(201).json({ message: 'Реєстрація успішна', user: { email: user.email, role: user.role } });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

router.post('/login', passport.authenticate('local'), (req, res) => {
    res.json({ message: 'Вхід успішний', user: { email: req.user.email, role: req.user.role } });
});

router.post('/change-password', isAuthenticated, 
    body('newPassword').isLength({ min: 8 }).trim().escape(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const user = await User.findById(req.user.id);
            user.password = await bcrypt.hash(req.body.newPassword, 10);
            user.passwordChangedAt = Date.now();
            await user.save();
            
            res.json({ message: 'Пароль успішно змінено' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
});

module.exports = router;
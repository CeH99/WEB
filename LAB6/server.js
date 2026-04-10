require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const cors = require('cors');
const csrf = require('csurf');
const rateLimit = require('express-rate-limit');
// ??? fix? const xssClean = require('xss-clean');
const mongoose = require('mongoose');

require('./config/passport');

const app = express();

// Підключення до БД (заміни URI на свій або додай у .env)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cogeneration_db')
    .then(() => console.log('MongoDB підключено'))
    .catch(err => console.error('Помилка підключення до MongoDB:', err));

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],      
            scriptSrcAttr: ["'unsafe-inline'"],           
            styleSrc: ["'self'", "'unsafe-inline'"],   
        },
    },
}));
// ??? fix? app.use(xssClean());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting (захист від brute-force)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 хвилин
    max: 100, // ліміт запитів з одного IP
    message: 'Забагато запитів, спробуйте пізніше'
});
app.use(limiter);

app.use(session({
    secret: process.env.SESSION_SECRET || 'super-secret-key-tec',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(passport.initialize());
app.use(passport.session());

const csrfProtection = csrf();

//app.use(csrfProtection);
app.use(express.static('public'));
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер системи ТЕЦ запущено на порті ${PORT}`);
});
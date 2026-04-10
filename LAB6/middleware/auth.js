function isAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Необхідна автентифікація' });
    }

    // Перевірка Password expiration (90 днів)
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    if (Date.now() - new Date(req.user.passwordChangedAt).getTime() > ninetyDaysMs) {
        return res.status(403).json({ error: 'Термін дії пароля минув. Будь ласка, змініть пароль.' });
    }

    return next();
}

function hasRole(...roles) {
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: 'Необхідна автентифікація' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Недостатньо прав доступу' });
        }
        return next();
    };
}

module.exports = { isAuthenticated, hasRole };
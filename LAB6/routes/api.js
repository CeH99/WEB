const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

let tecState = {
    temperature: '95°C',
    pressure: '12 atm',
    powerOutput: '50 MW',
    mode: 'Normal',
    status: 'Optimal'
};

router.get('/cogeneration/parameters', isAuthenticated, (req, res) => {
    res.json(tecState);
});

router.put('/cogeneration/settings', isAuthenticated, hasRole('engineer', 'director'), async (req, res) => {
    const newSettings = req.body;
    
    if (newSettings.targetTemp) tecState.temperature = newSettings.targetTemp;
    if (newSettings.mode) tecState.mode = newSettings.mode;
    
    if (tecState.mode === 'High Load') {
        tecState.status = 'Maximum Output';
        tecState.powerOutput = '75 MW';
    } else if (tecState.mode === 'Eco') {
        tecState.status = 'Power Saving';
        tecState.powerOutput = '30 MW';
    } else {
        tecState.status = 'Optimal';
        tecState.powerOutput = '50 MW';
    }
    
    await AuditLog.create({
        user: req.user.id,
        action: 'UPDATE_SETTINGS',
        details: newSettings,
        ipAddress: req.ip
    });

    res.json({ 
        message: 'Налаштування успішно оновлено та залоговано', 
        settings: newSettings 
    });
});

router.get('/reports/financial', isAuthenticated, hasRole('director'), (req, res) => {
    res.json({
        revenue: '$120,000',
        fuelCosts: '$45,000',
        netProfit: '$75,000',
        period: 'Q3 2026'
    });
});

module.exports = router;
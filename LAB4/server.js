const express = require('express');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express();
const PORT = 3000;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());

let meters = [
    {
        id: 1,
        serialNumber: "SM-2024-001",
        consumerName: "Іванов І.І.",
        address: "вул. Політехнічна, 14, кв. 12",
        activePower: 2.5,
        voltage: 225,
        current: 11.1,
        energyConsumed: 1450.5,
        powerFactor: 0.95,
        tariff: "day",
        history: []
    },
    {
        id: 2,
        serialNumber: "SM-2024-002",
        consumerName: "Петров П.П.",
        address: "вул. Борщагівська, 115, кв. 44",
        activePower: 1.2,
        voltage: 230,
        current: 5.2,
        energyConsumed: 890.2,
        powerFactor: 0.98,
        tariff: "night",
        history: []
    }
];


//----------------------------------------- ENDPOINTS------------------------

// GET /api/smart-meters
app.get('/api/smart-meters', (req, res) => {
    let result = [...meters];
    const { tariff, search, sortBy } = req.query;

    if (tariff) {
        result = result.filter(m => m.tariff === tariff);
    }

    if (search) {
        const searchLower = search.toLowerCase();
        result = result.filter(m => 
            m.consumerName.toLowerCase().includes(searchLower) || 
            m.address.toLowerCase().includes(searchLower)
        );
    }

    if (sortBy === 'energy') {
        result.sort((a, b) => b.energyConsumed - a.energyConsumed);
    }

    res.json({
        total: result.length,
        data: result
    });
});

// GET /api/smart-meters/:id 
app.get('/api/smart-meters/:id', (req, res) => {
    const meter = meters.find(m => m.id === parseInt(req.params.id));
    if (!meter) {
        return res.status(404).json({ error: 'Лічильник не знайдено' });
    }
    res.json(meter);
});

// GET /api/smart-meters/:id/consumption
app.get('/api/smart-meters/:id/consumption', (req, res) => {
    const meter = meters.find(m => m.id === parseInt(req.params.id));
    if (!meter) return res.status(404).json({ error: 'Лічильник не знайдено' });

    res.json({
        id: meter.id,
        serialNumber: meter.serialNumber,
        consumerName: meter.consumerName,
        totalEnergyConsumed: meter.energyConsumed,
        currentTariff: meter.tariff
    });
});

// GET /api/smart-meters/:id/history
app.get('/api/smart-meters/:id/history', (req, res) => {
    const meter = meters.find(m => m.id === parseInt(req.params.id));
    if (!meter) return res.status(404).json({ error: 'Лічильник не знайдено' });

    res.json({
        meterId: meter.id,
        historyRecordsCount: meter.history.length,
        history: meter.history
    });
});

// POST /api/smart-meters/:id/readings
app.post('/api/smart-meters/:id/readings', (req, res) => {
    const meter = meters.find(m => m.id === parseInt(req.params.id));
    if (!meter) return res.status(404).json({ error: 'Лічильник не знайдено' });

    const { activePower, voltage, current, addedEnergy, powerFactor, tariff } = req.body;

    if (activePower === undefined || voltage === undefined || addedEnergy === undefined) {
        return res.status(400).json({ error: 'Відсутні обов\'язкові поля для показів' });
    }

    meter.activePower = activePower;
    meter.voltage = voltage;
    meter.current = current || meter.current;
    meter.energyConsumed += addedEnergy;
    meter.powerFactor = powerFactor || meter.powerFactor;
    if (tariff) meter.tariff = tariff;

    const reading = {
        timestamp: new Date().toISOString(),
        activePower,
        voltage,
        addedEnergy,
        totalEnergy: meter.energyConsumed
    };
    meter.history.push(reading);

    res.status(201).json({
        message: 'Покази успішно додано',
        currentStats: meter
    });
});

// PUT /api/smart-meters/:id
app.put('/api/smart-meters/:id', (req, res) => {
    const index = meters.findIndex(m => m.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Лічильник не знайдено' });

    if (!req.body.consumerName || !req.body.address) {
        return res.status(400).json({ error: 'Ім\'я споживача та адреса є обов\'язковими' });
    }

    meters[index] = {
        ...meters[index],
        ...req.body,
        id: parseInt(req.params.id),
        history: meters[index].history
    };

    res.json(meters[index]);
});

app.post('/api/smart-meters', (req, res) => {
    const { serialNumber, consumerName, address, tariff } = req.body;
    
    if (!serialNumber || !consumerName || !address) {
        return res.status(400).json({ error: 'Відсутні обов\'язкові поля' });
    }

    const newMeter = {
        id: meters.length > 0 ? Math.max(...meters.map(m => m.id)) + 1 : 1,
        serialNumber,
        consumerName,
        address,
        activePower: 0,
        voltage: 220,
        current: 0,
        energyConsumed: 0,
        powerFactor: 1.0,
        tariff: tariff || 'day',
        history: []
    };

    meters.push(newMeter);
    res.status(201).json(newMeter);
});

app.listen(PORT, () => {
    console.log(`⚡ API розумних лічильників запущено на http://localhost:${PORT}`);
});
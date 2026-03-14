const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files

// DB Connection
mongoose.connect('mongodb://localhost:27017/energy_audit')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schema
const auditSchema = new mongoose.Schema({
    address: { type: String, required: true },
    buildingType: { type: String, required: true }, 
    area: { type: Number, required: true, min: 1 }, 
    consumption: { type: Number, required: true, min: 0 }, 
    
  // Calculated fields
    specificConsumption: { type: Number },
    normExceeded: { type: Boolean },

    auditDate: { type: Date, default: Date.now }
});

const Audit = mongoose.model('Audit', auditSchema);

// Consumption norms by building type
const NORMS = {
    residential: 150, 
    commercial: 250,
    industrial: 500,
    public: 200
};

// -------------------------------Routes-----------------------------

// GET all audits
app.get('/api/audits', async (req, res) => {
    try {
        const audits = await Audit.find().sort({ auditDate: -1 }); // Sort by newest
        res.json(audits);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching data' });
    }
});

// POST new audit
app.post('/api/audits', async (req, res) => {
    try {
        const { address, buildingType, area, consumption } = req.body;

        // Calculate specific consumption
        const specificConsumption = Number((consumption / area).toFixed(2));
        
        // Check against norms
        const currentNorm = NORMS[buildingType] || 200;
        const normExceeded = specificConsumption > currentNorm;

        // Save to DB
        const newAudit = await Audit.create({
            address,
            buildingType,
            area,
            consumption,
            specificConsumption,
            normExceeded
        });

        res.status(201).json({
            success: true,
            message: 'Audit saved successfully',
            data: newAudit
        });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Validation or save error', error: error.message });
    }
});

// DELETE audit by ID
app.delete('/api/audits/:id', async (req, res) => {
    try {
        await Audit.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Audit deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting audit' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
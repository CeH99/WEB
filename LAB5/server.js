const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server started on port 8080');

function generateCogenerationData() {
    const gasConsumption = 1200 + (Math.random() - 0.5) * 100; // Витрата газу (м³/год)
    const electricEfficiency = 42 + (Math.random() - 0.5) * 2; // ККД електричний (%)
    const thermalEfficiency = 45 + (Math.random() - 0.5) * 2;  // ККД тепловий (%)
    
    const electricPower = (gasConsumption * 9.3 * (electricEfficiency / 100)) / 1000; // Електрична потужність (МВт)
    const thermalPower = (gasConsumption * 8.0 * (thermalEfficiency / 100)) / 1000;   // Теплова потужність (Гкал/год)

    return {
        timestamp: Date.now(),
        electricPower: electricPower,
        thermalPower: thermalPower,
        gasConsumption: gasConsumption,
        coolantTemperature: 95 + (Math.random() - 0.5) * 5, // Температура теплоносія (°C)
        electricEfficiency: electricEfficiency,
        thermalEfficiency: thermalEfficiency
    };
}

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Відправка даних кожні 2 секунди
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            const data = generateCogenerationData();
            ws.send(JSON.stringify(data));
        }
    }, 2000);

    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(interval);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clearInterval(interval);
    });
});
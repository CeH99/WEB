// Configuration variant 8
const config = {
    temp: { min: 60, max: 95, normMin: 70, normMax: 85, dec: 0 },
    pressure: { min: 2, max: 6, normMin: 3, normMax: 5, dec: 1 },
    gas: { min: 0, max: 150, normMin: 50, normMax: 120, dec: 0 },
    smoke: { min: 120, max: 250, normMin: 140, normMax: 200, dec: 0 },
    power: { min: 0, max: 2, normMin: 0.5, normMax: 1.8, dec: 2 },
    water: { min: 0, max: 100, normMin: 60, normMax: 90, dec: 0 },
    kpd: { min: 70, max: 100, normMin: 85, normMax: 95, dec: 1 }
};

let timer = null;
let isAuto = false;
let chart;

// History for chart and export
const historyData = {
    time: [],
    power: []
};

// Alarm sound
const alarm = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');

// random number
function getRandom(min, max, decimals) {
    const value = Math.random() * (max - min) + min;
    return value.toFixed(decimals);
}

function getStatus(value, paramConfig) {
    const v = parseFloat(value);
    
    if (v >= paramConfig.normMin && v <= paramConfig.normMax) {
        return 'normal';
    } else if (v >= paramConfig.min && v <= paramConfig.max) {
        return 'warning';
    } else {
        return 'danger';
    }
}

function updateData() {
    let hasAlert = false;
    const now = new Date().toLocaleTimeString('uk-UA');

    for (let key in config) {
        const value = getRandom(config[key].min, config[key].max, config[key].dec);
        const status = getStatus(value, config[key]);

        if (status === 'danger') {
            hasAlert = true;
        }

        document.getElementById(`val_${key}`).textContent = value;
        document.getElementById(`stat_${key}`).className = `status-indicator status-${status}`;

        // Save history for power chart
        if (key === 'power') {
            historyData.time.push(now);
            historyData.power.push(value);

            // Keep only last 15 items
            if (historyData.time.length > 15) {
                historyData.time.shift();
                historyData.power.shift();
            }
            
            if (chart) {
                chart.update();
            }
        }
    }

    const pumps = ['Робота', 'Робота', 'Очікування', 'Аварія'];
    const randomPump = pumps[Math.floor(Math.random() * pumps.length)];
    let pumpStatus = 'normal';
    
    if (randomPump === 'Очікування') pumpStatus = 'warning';
    if (randomPump === 'Аварія') {
        pumpStatus = 'danger';
        hasAlert = true;
    }

    document.getElementById('val_pumps').textContent = randomPump;
    document.getElementById('stat_pumps').className = `status-indicator status-${pumpStatus}`;
    document.getElementById('lastUpdateTime').textContent = now;

    if (hasAlert) {
        alarm.play().catch(function(e) { console.log("Audio blocked by browser"); });
    }
}

function toggleAuto() {
    const btn = document.getElementById('btnAuto');
    const statusText = document.getElementById('autoStatus');

    if (isAuto === false) {
        isAuto = true;
        timer = setInterval(updateData, 3000);
        
        btn.textContent = '⏸️ Зупинити';
        btn.className = 'btn btn-danger';
        statusText.textContent = 'УВІМКНЕНО (3 сек)';
        statusText.style.color = 'var(--danger)';
    } else {
        isAuto = false;
        clearInterval(timer);
        
        btn.textContent = '▶️ Автооновлення';
        btn.className = 'btn btn-success';
        statusText.textContent = 'ВИМКНЕНО';
        statusText.style.color = 'gray';
    }
}

function exportCSV() {
    if (historyData.time.length === 0) {
        alert("No data to export!");
        return;
    }

    let csv = "data:text/csv;charset=utf-8,Час,Потужність\n";
    
    // Create CSV rows
    for (let i = 0; i < historyData.time.length; i++) {
        csv += historyData.time[i] + "," + historyData.power[i] + "\n";
    }
    
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "boiler_data.csv";
    link.click();
}

// initialize
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('powerChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: { 
            labels: historyData.time, 
            datasets: [{ 
                label: 'Power (MW)', 
                data: historyData.power, 
                borderColor: '#007bff' 
            }] 
        }
    });

    updateData();

    document.getElementById('btnUpdate').addEventListener('click', updateData);
    document.getElementById('btnAuto').addEventListener('click', toggleAuto);
    document.getElementById('btnExport').addEventListener('click', exportCSV);
});
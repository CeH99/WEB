class CogenerationMonitor {
    constructor() {
        this.charts = new EnergyCharts(15);
        this.api = new EnergyAPI(
            'ws://localhost:8080', 
            (data) => this.processData(data),
            (isOnline) => this.updateStatus(isOnline)
        );
    }

    updateStatus(isOnline) {
        const statusEl = document.getElementById('status');
        statusEl.textContent = isOnline ? 'Онлайн' : 'Офлайн';
        statusEl.className = isOnline ? 'status-online' : 'status-offline';
    }

    processData(data) {
        const timeStr = new Date(data.timestamp).toLocaleTimeString();

        document.getElementById('elEff').textContent = data.electricEfficiency.toFixed(1) + ' %';
        document.getElementById('thEff').textContent = data.thermalEfficiency.toFixed(1) + ' %';
        document.getElementById('gasCons').textContent = data.gasConsumption.toFixed(0);
        document.getElementById('coolantTemp').textContent = data.coolantTemperature.toFixed(1);

        this.charts.updatePowerChart(timeStr, data.electricPower, data.thermalPower);
        this.charts.updateSankey(data.electricEfficiency, data.thermalEfficiency);

        this.updateTable(timeStr, data);
    }

    updateTable(timeStr, data) {
        const tbody = document.getElementById('dataTableBody');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${timeStr}</td>
            <td>${data.electricPower.toFixed(2)}</td>
            <td>${data.thermalPower.toFixed(2)}</td>
            <td>${data.gasConsumption.toFixed(0)}</td>
            <td>${data.coolantTemperature.toFixed(1)}</td>
        `;
        tbody.insertBefore(row, tbody.firstChild);
        if (tbody.children.length > 10) tbody.removeChild(tbody.lastChild);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CogenerationMonitor();
});
class EnergyCharts {
    constructor(historyLimit) {
        this.historyLimit = historyLimit;
        this.initPowerChart();
        this.updateSankey(40, 45); 
    }

    initPowerChart() {
        const powerLayout = {
            margin: { t: 30, l: 40, r: 20, b: 40 },
            xaxis: { title: 'Час' },
            yaxis: { title: 'Потужність' }
        };
        Plotly.newPlot('powerChart', [
            { x: [], y: [], name: 'Ел. (МВт)', type: 'scatter', mode: 'lines+markers', line: {color: 'blue'} },
            { x: [], y: [], name: 'Теп. (Гкал/год)', type: 'scatter', mode: 'lines+markers', line: {color: 'red'} }
        ], powerLayout);
    }

    updatePowerChart(timeStr, electricPower, thermalPower) {
        Plotly.extendTraces('powerChart', {
            x: [[timeStr], [timeStr]],
            y: [[electricPower], [thermalPower]]
        }, [0, 1]);

        const chartDiv = document.getElementById('powerChart');
        if (chartDiv.data[0].x.length > this.historyLimit) {
            Plotly.relayout('powerChart', {
                xaxis: { range: [chartDiv.data[0].x.length - this.historyLimit, chartDiv.data[0].x.length] }
            });
        }
    }

    updateSankey(elEff, thEff) {
        const losses = 100 - elEff - thEff;
        const sankeyData = {
            type: "sankey", orientation: "h",
            node: {
                pad: 15, thickness: 30,
                line: { color: "black", width: 0.5 },
                label: ["Природний газ (100%)", "Електроенергія", "Теплова енергія", "Втрати"],
                color: ["gray", "blue", "red", "orange"]
            },
            link: {
                source: [0, 0, 0], target: [1, 2, 3], value: [elEff, thEff, losses]
            }
        };
        Plotly.react('sankeyChart', [sankeyData], { margin: { t: 30, l: 20, r: 20, b: 20 } });
    }
}
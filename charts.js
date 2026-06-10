// charts.js
let otChartInstance = null;

export function drawAnalyticsChart(canvasId, type, labels, datasetLabel, dataPoints) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (otChartInstance) {
        otChartInstance.destroy();
    }

    // Default colors (Blue for Normal OT)
    let bgColors = 'rgba(59, 130, 246, 0.7)';
    let borderColors = 'rgb(37, 99, 235)';

    // Change color based on metric
    if(datasetLabel.includes('Special')) { bgColors = 'rgba(239, 68, 68, 0.7)'; borderColors = 'rgb(220, 38, 38)'; }
    else if(datasetLabel.includes('Lieu')) { bgColors = 'rgba(168, 85, 247, 0.7)'; borderColors = 'rgb(147, 51, 234)'; }
    else if(datasetLabel.includes('No-Pay')) { bgColors = 'rgba(249, 115, 22, 0.7)'; borderColors = 'rgb(234, 88, 12)'; }

    // If showing all metrics at once (Individual Monthly)
    if(labels.includes('Normal OT') && labels.includes('Special OT')) {
        bgColors = labels.map(l => {
            if(l === 'Normal OT') return 'rgba(59, 130, 246, 0.7)';
            if(l === 'Special OT') return 'rgba(239, 68, 68, 0.7)';
            if(l === 'Lieu Days') return 'rgba(168, 85, 247, 0.7)';
            if(l === 'No-Pay') return 'rgba(249, 115, 22, 0.7)';
        });
        borderColors = labels.map(l => {
            if(l === 'Normal OT') return 'rgb(37, 99, 235)';
            if(l === 'Special OT') return 'rgb(220, 38, 38)';
            if(l === 'Lieu Days') return 'rgb(147, 51, 234)';
            if(l === 'No-Pay') return 'rgb(234, 88, 12)';
        });
    }

    otChartInstance = new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: datasetLabel,
                data: dataPoints,
                backgroundColor: bgColors,
                borderColor: borderColors,
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { labels: { font: { size: 10, weight: 'bold' } } } }
        }
    });
}

// charts.js
let otChartInstance = null;

export function drawOTChart(canvasId, labels, dataPoints) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Kalin chart ekak draw karala thiyenawanm eka ain karanawa (Canvas reuse errors walakwanna)
    if (otChartInstance) {
        otChartInstance.destroy();
    }

    // Aluth bar chart eka draw karanawa
    otChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels, // Employee Names
            datasets: [{
                label: 'Total Normal OT (Hours)',
                data: dataPoints, // OT Hours
                backgroundColor: 'rgba(59, 130, 246, 0.7)', // Tailwind blue-500 equivalent with opacity
                borderColor: 'rgb(37, 99, 235)', // Tailwind blue-600
                borderWidth: 1,
                borderRadius: 6,
                hoverBackgroundColor: 'rgba(37, 99, 235, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: { size: 10, weight: 'bold' }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hours',
                        font: { size: 10, weight: 'bold' }
                    }
                },
                x: {
                    ticks: {
                        font: { size: 9, weight: 'bold' }
                    }
                }
            }
        }
    });
}

/**
 * VOLTARIS CHARTS MODULE (charts.js)
 * Wraps local Chart.js library with Circuit-Noir Neon themes,
 * live filter updates, custom sparklines, and responsive canvas sizing.
 */

// Neon Color Constants matching tokens.css
const THEME_COLORS = {
  volt: '#C6FF3D',
  signal: '#22E5FF',
  plasma: '#8B5CFF',
  flare: '#FF3D8B',
  amber: '#FFB020',
  text: '#EAF0FF',
  muted: '#8D9AC4',
  gridLine: 'rgba(34, 229, 255, 0.08)',
  cardBg: 'rgba(18, 26, 66, 0.6)'
};

/**
 * Configure default Chart.js styling
 */
function applyChartDefaults() {
  if (typeof Chart === 'undefined') return;

  Chart.defaults.color = THEME_COLORS.muted;
  Chart.defaults.font.family = "'JetBrains Mono', monospace";
  Chart.defaults.font.size = 11;
  Chart.defaults.plugins.tooltip.backgroundColor = '#0B1030';
  Chart.defaults.plugins.tooltip.titleColor = '#FFFFFF';
  Chart.defaults.plugins.tooltip.bodyColor = THEME_COLORS.signal;
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(34, 229, 255, 0.3)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;
}

/**
 * Renders Mini-Dashboard Chart on Home Page (index.html)
 */
export function renderHomeMiniChart(canvasId = 'homeMiniChart') {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return null;

  applyChartDefaults();
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, 220);
  gradient.addColorStop(0, 'rgba(198, 255, 61, 0.35)');
  gradient.addColorStop(1, 'rgba(34, 229, 255, 0.0)');

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
      datasets: [
        {
          label: 'Telemetry Velocity',
          data: [1420, 1890, 2480, 4120, 3750, 4890, 5210],
          borderColor: THEME_COLORS.volt,
          backgroundColor: gradient,
          borderWidth: 2.5,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: THEME_COLORS.signal,
          pointBorderColor: '#050816',
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { color: THEME_COLORS.gridLine },
          ticks: { color: THEME_COLORS.muted }
        },
        y: {
          grid: { color: THEME_COLORS.gridLine },
          ticks: { color: THEME_COLORS.muted }
        }
      }
    }
  });
}

/**
 * Renders Insights Studio Switchable Charts (insights.html)
 */
export function renderStudioChart(canvasId, chartType, filterCategory = 'All', filterRange = '30d') {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return null;

  applyChartDefaults();
  const ctx = canvas.getContext('2d');

  // Multiplier simulation based on filters
  const rangeMultiplier = filterRange === '7d' ? 0.35 : (filterRange === '90d' ? 2.8 : 1.0);
  const catMultiplier = filterCategory === 'All' ? 1.0 : 0.6;

  let config;

  if (chartType === 'sales') {
    const gradientVolt = ctx.createLinearGradient(0, 0, 0, 300);
    gradientVolt.addColorStop(0, 'rgba(198, 255, 61, 0.35)');
    gradientVolt.addColorStop(1, 'rgba(198, 255, 61, 0.0)');

    const gradientSignal = ctx.createLinearGradient(0, 0, 0, 300);
    gradientSignal.addColorStop(0, 'rgba(34, 229, 255, 0.25)');
    gradientSignal.addColorStop(1, 'rgba(34, 229, 255, 0.0)');

    config = {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
        datasets: [
          {
            label: 'Net Revenue ($k)',
            data: [42, 58, 71, 65, 89, 104].map(v => Math.round(v * rangeMultiplier * catMultiplier)),
            borderColor: THEME_COLORS.volt,
            backgroundColor: gradientVolt,
            borderWidth: 3,
            tension: 0.35,
            fill: true
          },
          {
            label: 'Cost of Goods ($k)',
            data: [26, 35, 42, 39, 53, 62].map(v => Math.round(v * rangeMultiplier * catMultiplier)),
            borderColor: THEME_COLORS.signal,
            backgroundColor: gradientSignal,
            borderWidth: 2,
            tension: 0.35,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12 } }
        },
        scales: {
          x: { grid: { color: THEME_COLORS.gridLine } },
          y: { grid: { color: THEME_COLORS.gridLine } }
        }
      }
    };
  } else if (chartType === 'share') {
    config = {
      type: 'doughnut',
      data: {
        labels: ['Phones', 'Laptops', 'Wearables', 'Audio', 'Smart Home', 'Accessories'],
        datasets: [{
          data: [32, 24, 18, 12, 8, 6],
          backgroundColor: [
            THEME_COLORS.volt,
            THEME_COLORS.signal,
            THEME_COLORS.plasma,
            THEME_COLORS.flare,
            THEME_COLORS.amber,
            '#4361EE'
          ],
          borderColor: '#050816',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' }
        },
        cutout: '68%'
      }
    };
  } else if (chartType === 'warehouse') {
    config = {
      type: 'bar',
      data: {
        labels: ['WH-North (Chicago)', 'WH-Central (Seattle)', 'WH-East (New York)', 'WH-South (Miami)'],
        datasets: [
          {
            label: 'Active Inventory (Units)',
            data: [1420, 1180, 960, 1340].map(v => Math.round(v * rangeMultiplier)),
            backgroundColor: THEME_COLORS.signal,
            borderRadius: 6
          },
          {
            label: 'Low Stock SKU Count',
            data: [12, 18, 8, 15],
            backgroundColor: THEME_COLORS.amber,
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: THEME_COLORS.gridLine } },
          y: { grid: { color: THEME_COLORS.gridLine } }
        }
      }
    };
  } else if (chartType === 'margin') {
    config = {
      type: 'bar',
      data: {
        labels: ['Phones', 'Laptops', 'Wearables', 'Audio', 'Smart Home', 'Accessories'],
        datasets: [{
          label: 'Average Gross Margin %',
          data: [35.2, 33.4, 44.8, 48.2, 45.6, 56.8],
          backgroundColor: [
            THEME_COLORS.signal,
            THEME_COLORS.plasma,
            THEME_COLORS.volt,
            THEME_COLORS.volt,
            THEME_COLORS.signal,
            THEME_COLORS.volt
          ],
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { max: 70, grid: { color: THEME_COLORS.gridLine } },
          y: { grid: { color: THEME_COLORS.gridLine } }
        }
      }
    };
  } else {
    // Forecast area with confidence band
    config = {
      type: 'line',
      data: {
        labels: ['Oct', 'Nov', 'Dec', 'Jan (FC)', 'Feb (FC)', 'Mar (FC)'],
        datasets: [
          {
            label: 'Upper Confidence 95%',
            data: [82, 94, 115, 138, 155, 172],
            borderColor: 'rgba(34, 229, 255, 0.25)',
            borderDash: [5, 5],
            fill: '+1',
            backgroundColor: 'rgba(34, 229, 255, 0.08)',
            pointRadius: 0
          },
          {
            label: 'Predicted Run Rate',
            data: [82, 94, 115, 126, 140, 156],
            borderColor: THEME_COLORS.volt,
            borderWidth: 3,
            fill: false,
            pointBackgroundColor: THEME_COLORS.volt
          },
          {
            label: 'Lower Confidence 95%',
            data: [82, 94, 115, 112, 124, 138],
            borderColor: 'rgba(34, 229, 255, 0.25)',
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: THEME_COLORS.gridLine } },
          y: { grid: { color: THEME_COLORS.gridLine } }
        }
      }
    };
  }

  return new Chart(ctx, config);
}

/**
 * Overview Revenue Trend Chart on Dashboard (dashboard.html)
 */
export function renderDashboardRevenueChart(canvasId = 'dashRevenueChart') {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return null;

  applyChartDefaults();
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, 260);
  grad.addColorStop(0, 'rgba(198, 255, 61, 0.35)');
  grad.addColorStop(1, 'rgba(34, 229, 255, 0.02)');

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Oct 01', 'Oct 05', 'Oct 10', 'Oct 15', 'Oct 20', 'Oct 25', 'Oct 30'],
      datasets: [
        {
          label: 'Revenue ($)',
          data: [18400, 24200, 22900, 31400, 38900, 42100, 48650],
          borderColor: THEME_COLORS.volt,
          backgroundColor: grad,
          fill: true,
          tension: 0.38,
          borderWidth: 2.5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: THEME_COLORS.gridLine } },
        y: { grid: { color: THEME_COLORS.gridLine } }
      }
    }
  });
}

/**
 * Overview Donut Chart on Dashboard (dashboard.html)
 */
export function renderDashboardCategoryDonut(canvasId = 'dashCategoryDonut') {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return null;

  applyChartDefaults();
  const ctx = canvas.getContext('2d');

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Phones', 'Laptops', 'Wearables', 'Audio', 'Smart Home', 'Accessories'],
      datasets: [{
        data: [11, 11, 11, 11, 11, 10],
        backgroundColor: [
          THEME_COLORS.volt,
          THEME_COLORS.signal,
          THEME_COLORS.plasma,
          THEME_COLORS.flare,
          THEME_COLORS.amber,
          '#3D7CFF'
        ],
        borderWidth: 2,
        borderColor: '#0B1030'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
      },
      cutout: '72%'
    }
  });
}

/**
 * Analytics View Multi-Period Comparison Chart (dashboard.html)
 */
export function renderAnalyticsComparisonChart(canvasId = 'analyticsCompareChart') {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === 'undefined') return null;

  applyChartDefaults();
  const ctx = canvas.getContext('2d');

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Current Period (Units)',
          data: [840, 960, 1120, 1340],
          backgroundColor: THEME_COLORS.volt,
          borderRadius: 6
        },
        {
          label: 'Previous Period (Units)',
          data: [720, 810, 890, 1050],
          backgroundColor: 'rgba(34, 229, 255, 0.4)',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: THEME_COLORS.gridLine } },
        y: { grid: { color: THEME_COLORS.gridLine } }
      }
    }
  });
}

/**
 * Renders Mini Canvas Sparkline for KPI Cards
 */
export function renderSparkline(canvasId, dataPoints, color = THEME_COLORS.signal) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  const min = Math.min(...dataPoints);
  const max = Math.max(...dataPoints);
  const range = max - min || 1;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';

  dataPoints.forEach((val, idx) => {
    const x = (idx / (dataPoints.length - 1)) * (w - 6) + 3;
    const y = h - 4 - ((val - min) / range) * (h - 8);
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}

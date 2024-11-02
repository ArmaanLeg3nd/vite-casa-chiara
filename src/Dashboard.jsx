import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { Chart } from 'chart.js/auto';

const Dashboard = () => {
  const [statistics, setStatistics] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch statistics data from the server
    axios.get('http://localhost:8000/api/statistics')
      .then((response) => {
        // Log the response for debugging
        console.log('API response:', response);

        // Validate the response data
        if (Array.isArray(response.data)) {
          setStatistics(response.data);
        } else {
          throw new Error('Expected an array of data');
        }
      })
      .catch((error) => {
        console.error('Error fetching statistics:', error);
        setError('Failed to load statistics');
      });
  }, []);

  useEffect(() => {
    // Create and render the charts when statistics data is available
    if (statistics.length > 0) {
      renderCharts(statistics);
    }
  }, [statistics]);

  const renderCharts = (data) => {
    if (!Array.isArray(data)) return;
  
    // Log data to debug missing fields
    console.log('Statistics data for chart rendering:', data);
  
    // Extract and round off data
    const dates = data.map((entry) => entry.date || 'N/A');
    const views = data.map((entry) => Math.round(entry.views) || 0);
    const homePageReads = data.map((entry) => Math.round(entry.homePageReads) || 0);
    const vacationRentalReads = data.map((entry) => Math.round(entry.vacationRentalReads) || 0);
    const servicesReads = data.map((entry) => Math.round(entry.servicesReads) || 0);
  
    // Destroy any existing charts on the canvases
    destroyChart('viewsChart');
    destroyChart('homePageReadsChart');
    destroyChart('vacationRentalReadsChart');
    destroyChart('servicesReadsChart');
  
    // Create a new chart for each statistic
    createChart('viewsChart', dates, views, 'Number of Views');
    createChart('homePageReadsChart', dates, homePageReads, 'Home Page Views');
    createChart('vacationRentalReadsChart', dates, vacationRentalReads, 'Vacation Rental Page Views');
    createChart('servicesReadsChart', dates, servicesReads, 'Services Page Views');
  };
  
  const destroyChart = (chartId) => {
    const existingChart = Chart.getChart(chartId);
    if (existingChart) {
      existingChart.destroy();
    }
  };

  const createChart = (chartId, labels, data, label) => {
    const ctx = document.getElementById(chartId);
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label,
            data,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
  };

  return (
    <div className="statistics">
      <h2>Last 30 Days' Usage Statistics</h2>
      {error && <div className="error">{error}</div>}
      <div className="chart-container">
        <canvas id="viewsChart" />
      </div>
      <div className="chart-container">
        <canvas id="homePageReadsChart" />
      </div>
      <div className="chart-container">
        <canvas id="vacationRentalReadsChart" />
      </div>
      <div className="chart-container">
        <canvas id="servicesReadsChart" />
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import axios from '../../utils/axios';
import './ProgressChart.css';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const ProgressChart = () => {
  const [data, setData] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axios.get('/progress', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Format data for chart
        const chartData = res.data.map(entry => ({
          date: new Date(entry.date).toLocaleDateString(),
          weight: parseFloat(entry.weight),
          chest: parseFloat(entry.bodyMeasurements?.chest || 0),
          waist: parseFloat(entry.bodyMeasurements?.waist || 0),
          hips: parseFloat(entry.bodyMeasurements?.hips || 0),
          runTime: parseFloat(entry.performanceMetrics?.runTime || 0),
          liftingMax: parseFloat(entry.performanceMetrics?.liftingMax || 0),
        }));

        setData(chartData);
      } catch (err) {
        console.error('Error fetching chart data:', err);
      }
    };

    fetchProgress();
  }, []);

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <div className="tooltip-header">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="tooltip-row">
              <span className="tooltip-label">{entry.dataKey}:</span>
              <span className="tooltip-value">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // if (!data || data.length === 0) {
  //   return (
  //     <div className="progress-container">
  //       <div className="no-data-message">
  //         <div className="no-data-icon">📊</div>
  //         <h3>No Progress Data Available</h3>
  //         <p>Start tracking your progress to see analytics!</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="progress-container">
      {/* Header */}
<div className="stats-header">
  <h2 className="progress-title">Progress Analytics</h2>
  <div className="stats-grid">
    <div className="stat-card">
      <div className="stat-number">
        {data.length > 0
          ? Math.max(...data.map(d => d.weight || 0)).toFixed(1)
          : 'N/A'}
      </div>
      <div className="stat-label">Max Weight (kg)</div>
    </div>
       <div className="stat-card">
      <div className="stat-number">
        {data.length > 0
          ? `${Math.min(...data.map(d => d.runTime || Infinity))}s`
          : 'N/A'}
      </div>
      <div className="stat-label">Best Run Time</div>
    </div>
    <div className="stat-card">
      <div className="stat-number">
        {data.length > 0
          ? Math.max(...data.map(d => d.liftingMax || 0)).toFixed(1)
          : 'N/A'}
      </div>
      <div className="stat-label">Max Weightlifting (kg)</div>
    </div>
 
  </div>
</div>



      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Weight Chart */}
        <div className="chart-section">
          <div className="chart-box">
            <div className="chart-header">
              <h3 className="chart-heading">Weight Over Time</h3>
              <p className="chart-description">Track your weight changes</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#7f8c8d' }}
                />
                <YAxis 
                  label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#7f8c8d' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#3498db" 
                  strokeWidth={3} 
                  dot={{ fill: '#3498db', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#3498db', strokeWidth: 2, fill: '#fff' }}
                  name="Weight (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Body Measurements */}
        <div className="chart-section">
          <div className="chart-box">
            <div className="chart-header">
              <h3 className="chart-heading">Body Measurements</h3>
              <p className="chart-description">Monitor your body measurements</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#7f8c8d' }}
                />
                <YAxis 
                  label={{ value: 'Measurements', angle: -90, position: 'insideLeft' }}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#7f8c8d' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="chest" 
                  stroke="#e67e22" 
                  strokeWidth={3}
                  dot={{ fill: '#e67e22', strokeWidth: 2, r: 4 }}
                  name="Chest (cm)"
                />
                <Line 
                  type="monotone" 
                  dataKey="waist" 
                  stroke="#27ae60" 
                  strokeWidth={3}
                  dot={{ fill: '#27ae60', strokeWidth: 2, r: 4 }}
                  name="Waist (cm)"
                />
                <Line 
                  type="monotone" 
                  dataKey="hips" 
                  stroke="#3498db" 
                  strokeWidth={3}
                  dot={{ fill: '#3498db', strokeWidth: 2, r: 4 }}
                  name="Hips (cm)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="chart-section">
          <div className="chart-box">
            <div className="chart-header">
              <h3 className="chart-heading">Performance Metrics</h3>
              <p className="chart-description">Track your fitness performance</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#7f8c8d' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#7f8c8d' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="runTime" 
                  stroke="#9b59b6" 
                  strokeWidth={3}
                  dot={{ fill: '#9b59b6', strokeWidth: 2, r: 4 }}
                  name="Run Time (s)"
                />
                <Line 
                  type="monotone" 
                  dataKey="liftingMax" 
                  stroke="#e74c3c" 
                  strokeWidth={3}
                  dot={{ fill: '#e74c3c', strokeWidth: 2, r: 4 }}
                  name="Lifting Max (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
import React, { useEffect, useState } from 'react';
import './WorkoutChart.css';

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const WorkoutChart = ({ workouts = [] }) => {
  const [chartData, setChartData] = useState({
    categoryBreakdown: [],
    monthlyProgress: [],
    topExercises: [],
    weeklyActivity: [],
    exercisesByCategory: []
  });

  useEffect(() => {
    if (workouts && workouts.length > 0) {
      analyzeWorkoutData();
    }
  }, [workouts]);

  const analyzeWorkoutData = () => {
    // Category Distribution
    const categoryCount = {};
    workouts.forEach(workout => {
      const category = workout.category || 'Other';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const categoryBreakdown = Object.entries(categoryCount).map(([category, count]) => ({
      name: getCategoryDisplayName(category),
      value: count,
      percentage: Math.round((count / workouts.length) * 100),
      fill: getCategoryColor(category)
    }));

    // Monthly Progress
    const monthlyData = {};
    workouts.forEach(workout => {
      const date = new Date(workout.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          workouts: 0,
          totalExercises: 0
        };
      }
      
      monthlyData[monthKey].workouts += 1;
      monthlyData[monthKey].totalExercises += workout.exercises?.length || 0;
    });

    const monthlyProgress = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    // Top Exercises
    const exerciseFrequency = {};
    workouts.forEach(workout => {
      if (workout.exercises && workout.exercises.length > 0) {
        workout.exercises.forEach(exercise => {
          const name = exercise.name;
          if (!exerciseFrequency[name]) {
            exerciseFrequency[name] = {
              name: name,
              frequency: 0
            };
          }
          exerciseFrequency[name].frequency += 1;
        });
      }
    });

    const topExercises = Object.values(exerciseFrequency)
      .map(ex => ({
        ...ex,
        displayName: ex.name.length > 15 ? ex.name.substring(0, 15) + '...' : ex.name
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 8);

    // Weekly Activity
    const last8Weeks = {};
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekDate = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekStart = new Date(weekDate.setDate(weekDate.getDate() - weekDate.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      const weekLabel = weekStart.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      last8Weeks[weekKey] = {
        week: weekLabel,
        workouts: 0
      };
    }

    workouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      const weekStart = new Date(workoutDate.setDate(workoutDate.getDate() - workoutDate.getDay()));
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (last8Weeks[weekKey]) {
        last8Weeks[weekKey].workouts += 1;
      }
    });

    const weeklyActivity = Object.values(last8Weeks);

    // Exercises by Category
    const exercisesByCategory = {};
    workouts.forEach(workout => {
      const category = getCategoryDisplayName(workout.category || 'Other');
      if (!exercisesByCategory[category]) {
        exercisesByCategory[category] = 0;
      }
      exercisesByCategory[category] += workout.exercises?.length || 0;
    });

    const exercisesByCategoryData = Object.entries(exercisesByCategory).map(([category, count]) => ({
      category,
      exercises: count,
      fill: getCategoryColor(category.toLowerCase())
    }));

    setChartData({
      categoryBreakdown,
      monthlyProgress,
      topExercises,
      weeklyActivity,
      exercisesByCategory: exercisesByCategoryData
    });
  };

  const getCategoryDisplayName = (category) => {
    const names = {
      strength: 'Strength',
      cardio: 'Cardio',
      flexibility: 'Flexibility',
      balance: 'Balance'
    };
    return names[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getCategoryColor = (category) => {
    const colors = {
      strength: '#3498db',    // Gentle blue
      cardio: '#27ae60',      // Gentle green
      flexibility: '#e67e22', // Gentle orange
      balance: '#9b59b6',     // Gentle purple
      other: '#95a5a6'        // Gentle gray
    };
    return colors[category] || colors.other;
  };

  // Custom Tooltips
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

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="chart-tooltip">
          <div className="tooltip-header">{data.name}</div>
          <div className="tooltip-row">
            <span className="tooltip-label">Workouts:</span>
            <span className="tooltip-value">{data.value}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Percentage:</span>
            <span className="tooltip-value">{data.payload.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!workouts || workouts.length === 0) {
    return (
      <div className="workout-chart-container">
        <div className="no-data-message">
          <div className="no-data-icon">📊</div>
          <h3>No Workout Data Available</h3>
          <p>Add workouts to see your analytics!</p>
        </div>
      </div>
    );
  }

  const totalExercises = workouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0);
  const avgExercisesPerWorkout = Math.round(totalExercises / workouts.length);

  return (
    <div className="workout-chart-container">
      {/* Stats Header */}
      <div className="stats-header">
        <h2 className="page-title">Workout Analytics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{workouts.length}</div>
            <div className="stat-label">Total Workouts</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{totalExercises}</div>
            <div className="stat-label">Total Exercises</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{avgExercisesPerWorkout}</div>
            <div className="stat-label">Avg per Workout</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Category Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Workout Types</h3>
            <p>Distribution of your workout categories</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.categoryBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {chartData.categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Exercises by Category */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Exercises by Type</h3>
            <p>Exercise distribution by category</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.exercisesByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
              <XAxis 
                dataKey="category" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#7f8c8d' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#7f8c8d' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="exercises" 
                fill="#9b59b6"
                radius={[4, 4, 0, 0]}
                name="Exercises"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>


        {/* Top Exercises */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Popular Exercises</h3>
            <p>Your most frequently performed exercises</p>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData.topExercises}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
              <XAxis 
                dataKey="displayName" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#7f8c8d' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#7f8c8d' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="frequency" 
                fill="#27ae60"
                radius={[4, 4, 0, 0]}
                name="Frequency"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

    


      </div>
    </div>
  );
};

export default WorkoutChart;
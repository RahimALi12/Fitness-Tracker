


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import { toast } from 'react-toastify';
import { useLoading } from '../context/GlobalLoadingContext';
import usePageLoader from '../hooks/usePageLoader';
import './Dashboard.css';

const Dashboard = () => {
  const { isLoading } = useLoading();
  const [loading, setLoading] = useState(true); // ✅ fixed destructuring
  const [dashboardData, setDashboardData] = useState({
    recentWorkouts: [],
    recentNutrition: [],
    recentProgress: [],
    stats: {
      totalWorkouts: 0,
      totalNutrition: 0,
      totalProgress: 0,
      thisWeekWorkouts: 0
    }
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchDashboardData = async () => {
    try {
      const [workoutsRes, nutritionRes, progressRes] = await Promise.all([
        axios.get('/workouts', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/nutrition', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/progress', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const workouts = workoutsRes.data || [];
      const nutrition = nutritionRes.data || [];
      const progress = progressRes.data || [];

      const recentWorkouts = workouts.slice(0, 5);
      const recentNutrition = nutrition.slice(0, 5);
      const recentProgress = progress.slice(0, 3);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const thisWeekWorkouts = workouts.filter(workout =>
        new Date(workout.date) >= oneWeekAgo
      ).length;

      setDashboardData({
        recentWorkouts,
        recentNutrition,
        recentProgress,
        stats: {
          totalWorkouts: workouts.length,
          totalNutrition: nutrition.length,
          totalProgress: progress.length,
          thisWeekWorkouts
        }
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error); // ✅ useful for debugging
    } finally {
      setLoading(false);
    }
  };

  usePageLoader(fetchDashboardData); // ✅ this is fine

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getTotalCalories = (nutritionLog) => {
    return nutritionLog.foodItems?.reduce((total, item) => total + (item.calories || 0), 0) || 0;
  };

  if (isLoading || loading) return <div className="loader-container" />;



  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">
            {getGreeting()}, {user.name || 'Fitness Enthusiast'}!
          </h1>
          <p className="welcome-subtitle">
            Here's your fitness journey overview for today
          </p>
        </div>
        
        <div className="quick-actions">
          <button 
            onClick={() => navigate('/workouts')}
            className="quick-action-btn workout"
          >
            Add Workout
          </button>
          <button 
            onClick={() => navigate('/nutrition')}
            className="quick-action-btn nutrition"
          >
            Add Meal
          </button>
          <button 
            onClick={() => navigate('/progress/new')}
            className="quick-action-btn progress"
          >
            Log Progress
          </button>
        </div>
      </div>

      {/* Stats Cards - All in one row */}
      <div className="stats-grid">
        <div className="stat-card workouts">
          <div className="stat-content">
            <h3 className="stat-number">{dashboardData.stats.totalWorkouts}</h3>
            <p className="stat-label">Total Workouts</p>
          </div>
        </div>
        
        <div className="stat-card nutrition">
          <div className="stat-content">
            <h3 className="stat-number">{dashboardData.stats.totalNutrition}</h3>
            <p className="stat-label">Nutrition Entries</p>
          </div>
        </div>
        
        <div className="stat-card progress">
          <div className="stat-content">
            <h3 className="stat-number">{dashboardData.stats.totalProgress}</h3>
            <p className="stat-label">Progress Records</p>
          </div>
        </div>
        
       
      </div>
<br />
      {/* Recent Activities */}
      <div className="dashboard-content">
        {/* Recent Workouts */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Recent Workouts</h2>
            <Link to="/workouts" className="view-all-btn">View All</Link>
          </div>
          
          {dashboardData.recentWorkouts.length === 0 ? (
            <div className="empty-state">
              <p className="empty-text">No workouts yet. Start your fitness journey!</p>
              <button 
                onClick={() => navigate('/workouts')}
                className="empty-action-btn"
              >
                Add Your First Workout
              </button>
            </div>
          ) : (
            <div className="activity-list">
              {dashboardData.recentWorkouts.map((workout) => (
                <div key={workout._id} className="activity-item workout-item">
                  <div className="activity-content">
                    <h4 className="activity-title">{workout.name}</h4>
                    <p className="activity-details">
                      {workout.exercises?.length || 0} exercises • {workout.duration || 'No duration'} min
                    </p>
                    <p className="activity-date">
                      {new Date(workout.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate(`/workouts/edit/${workout._id}`)}
                    className="activity-action"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Nutrition */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Recent Nutrition</h2>
            <Link to="/nutrition" className="view-all-btn">View All</Link>
          </div>
          
          {dashboardData.recentNutrition.length === 0 ? (
            <div className="empty-state">
              <p className="empty-text">No nutrition logs yet. Start tracking your meals!</p>
              <button 
                onClick={() => navigate('/nutrition')}
                className="empty-action-btn"
              >
                Add Your First Meal
              </button>
            </div>
          ) : (
            <div className="activity-list">
              {dashboardData.recentNutrition.map((nutrition) => (
                <div key={nutrition._id} className="activity-item nutrition-item">
                  <div className="activity-content">
                    <h4 className="activity-title">
                      {nutrition.mealType.charAt(0).toUpperCase() + nutrition.mealType.slice(1)}
                    </h4>
                    <p className="activity-details">
                      {nutrition.foodItems?.length || 0} food items • {getTotalCalories(nutrition)} calories
                    </p>
                    <p className="activity-date">
                      {new Date(nutrition.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate(`/nutrition/edit/${nutrition._id}`)}
                    className="activity-action"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Progress */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Recent Progress</h2>
            <Link to="/progress" className="view-all-btn">View All</Link>
          </div>
          
          {dashboardData.recentProgress.length === 0 ? (
            <div className="empty-state">
              <p className="empty-text">No progress recorded yet. Track your improvements!</p>
              <button 
                onClick={() => navigate('/progress/new')}
                className="empty-action-btn"
              >
                Record Your First Progress
              </button>
            </div>
          ) : (
            <div className="activity-list">
              {dashboardData.recentProgress.map((progress) => (
                <div key={progress._id} className="activity-item progress-item">
                  <div className="activity-content">
                    <h4 className="activity-title">Progress Update</h4>
                    <p className="activity-details">
                      Weight: {progress.weight} kg
                      {progress.bodyMeasurements?.chest && ` • Chest: ${progress.bodyMeasurements.chest} cm`}
                    </p>
                    <p className="activity-date">
                      {new Date(progress.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate(`/progress/edit/${progress._id}`)}
                    className="activity-action"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
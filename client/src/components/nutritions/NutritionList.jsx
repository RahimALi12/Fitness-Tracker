import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import { useLoading } from '../../context/GlobalLoadingContext';
// import usePageLoader from '../../hooks/usePageLoader';
import './NutritionList.css';


const NutritionList = () => {
  
  const { isLoading } = useLoading();
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
//   const [activeView, setActiveView] = useState('nutrition');
  const navigate = useNavigate();
  useEffect(() => {
  if (localStorage.getItem('showAddToast') === 'true') {
    toast.success('Nutrition log added successfully!');
    localStorage.removeItem('showAddToast');
  }

  if (localStorage.getItem('showDeleteToast') === 'true') {
    toast.success('Nutrition log deleted successfully!');
    localStorage.removeItem('showDeleteToast');
  }
}, []);
  
  // Filter states - same structure as Progress
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    mealType: '',
    caloriesMin: '',
    caloriesMax: '',
    foodSearch: ''
  });

  // Fix today's date
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    date: getTodayDate(),
    mealType: 'breakfast',
    foodItems: [{
      name: '',
      quantity: '',
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0 }
    }]
  });

  const token = localStorage.getItem('token');

  // Move these functions BEFORE useMemo
  const getTotalCalories = (log) => {
    return log.foodItems.reduce((total, item) => total + (item.calories || 0), 0);
  };

  const getTotalMacros = (log) => {
    return log.foodItems.reduce(
      (totals, item) => ({
        protein: totals.protein + (item.macros?.protein || 0),
        carbs: totals.carbs + (item.macros?.carbs || 0),
        fat: totals.fat + (item.macros?.fat || 0)
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );
  };

  const getMealTypeColor = (mealType) => {
    const colors = {
      breakfast: '#f59e0b',
      lunch: '#10b981',
      dinner: '#3b82f6',
      snack: '#8b5cf6'
    };
    return colors[mealType] || '#6b7280';
  };

  useEffect(() => {
    fetchNutritionLogs();
  }, []);

  // Filtered nutrition logs based on all filter criteria
  const filteredNutritionLogs = useMemo(() => {
    return nutritionLogs.filter(log => {
      // Date range filter
      if (filters.dateFrom) {
        const logDate = new Date(log.date);
        const fromDate = new Date(filters.dateFrom);
        if (logDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const logDate = new Date(log.date);
        const toDate = new Date(filters.dateTo);
        if (logDate > toDate) return false;
      }

      // Meal type filter
      if (filters.mealType && log.mealType !== filters.mealType) return false;

      // Calories range filter
      const totalCalories = getTotalCalories(log);
      if (filters.caloriesMin && totalCalories < parseFloat(filters.caloriesMin)) return false;
      if (filters.caloriesMax && totalCalories > parseFloat(filters.caloriesMax)) return false;

      // Food search filter
      if (filters.foodSearch) {
        const searchTerm = filters.foodSearch.toLowerCase();
        const hasMatchingFood = log.foodItems.some(item =>
          item.name.toLowerCase().includes(searchTerm)
        );
        if (!hasMatchingFood) return false;
      }

      return true;
    });
  }, [nutritionLogs, filters]);



   const fetchNutritionLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/nutrition', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNutritionLogs(res.data);
    } catch {
        toast.error('Failed to fetch nutrition logs');
    } finally {
      setLoading(false);
    }
  };




const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const config = { headers: { Authorization: `Bearer ${token}` } };

    const cleanedFoodItems = formData.foodItems.map(item => ({
    ...item,
    calories: Number(item.calories),
    macros: {
      protein: Number(item.macros.protein),
      carbs: Number(item.macros.carbs),
      fat: Number(item.macros.fat),
    }
  }));


  const finalFormData = {
    ...formData,
    foodItems: cleanedFoodItems
  };

  try {
    const response = await axios.post('/nutrition', finalFormData, config);

    if (response?.status === 201 || response?.status === 200) {
      resetForm();
localStorage.setItem('showAddToast', 'true');
navigate(0);
    } else {
      toast.error('Unexpected response from server.');
    }
  } catch (error) {
    console.error('Error saving nutrition log:', error);
    toast.error('Failed to add Nutrition log. Please try again.');
  } finally {
    setLoading(false);
  }
};






const deleteLog = async (id) => {
  const toastId = toast(
    () => (
      <div className="custom-toast-confirmation">
        <h3 className="toast-title">Fitness Tracker</h3>
        <p className="toast-message">Are you sure you want to delete this nutrition entry?</p>
        <div className="toast-buttons">
          <button
            className="btn btn-delete"
            onClick={async () => {
              try {
                await axios.delete(`/nutrition/${id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                      setNutritionLogs(nutritionLogs.filter(log => log._id !== id));
                await fetchNutritionLogs();
                // toast.success('Nutrition log deleted successfully!');
localStorage.setItem('showDeleteToast', 'true');
navigate(0);

              } catch (err) {
                console.error('Error deleting Nutrition log:', err);
                toast.error('Failed to delete nutrition log.');
              } finally {
                toast.dismiss(toastId);
              }
            }}
          >
            Yes, Delete
          </button>

          <button
            className="btn btn-cancel"
            onClick={() => toast.dismiss(toastId)}
          >
            Cancel
          </button>
        </div>
      </div>
    ),
    {
      closeButton: false,
      autoClose: false,
      position: "top-center",
      className: 'toast-confirmation-wrapper',
    }
  );
};



  const resetForm = () => {
    setFormData({
      date: getTodayDate(),
      mealType: 'breakfast',
      foodItems: [{
        name: '',
        quantity: '',
        calories: 0,
        macros: { protein: 0, carbs: 0, fat: 0 }
      }]
    });
  };

  const addFoodItem = () => {
    setFormData({
      ...formData,
      foodItems: [...formData.foodItems, {
        name: '',
        quantity: '',
        calories: '',
        macros: { protein: '', carbs: '', fat: '' }
      }]
    });
  };

  const removeFoodItem = (index) => {
    const newFoodItems = formData.foodItems.filter((_, i) => i !== index);
    setFormData({ ...formData, foodItems: newFoodItems });
  };

  const updateFoodItem = (index, field, value) => {
    const newFoodItems = [...formData.foodItems];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newFoodItems[index][parent][child] = value;
    } else {
      newFoodItems[index][field] = value;
    }
    setFormData({ ...formData, foodItems: newFoodItems });
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      mealType: '',
      caloriesMin: '',
      caloriesMax: '',
      foodSearch: ''
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  const activeFilterCount = Object.values(filters).filter(value => value !== '').length;



  if (isLoading) return <div className="loader-container" />;

  return (
    <div className="nutrition-list-container">
  

      {/* Header Container - Same as Progress */}
      <div className="nutrition-header-container">
        <div className="nutrition-header-left">
          <h2 className="nutrition-heading">Your Nutrition Journey</h2>
          <div className="nutrition-stats">
            {hasActiveFilters && (
              <span className="filter-results">
                Showing {filteredNutritionLogs.length} of {nutritionLogs.length} entries
                {activeFilterCount > 0 && (
                  <span className="active-filters-count">
                    ({activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active)
                  </span>
                )}
              </span>
            )}
            {!hasActiveFilters && nutritionLogs.length > 0 && (
              <div className="nutrition-counter">
                {nutritionLogs.length} nutrition entr{nutritionLogs.length !== 1 ? 'ies' : 'y'} recorded
              </div>
            )}
          </div>
        </div>

        <div className="nutrition-header-actions">
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span className="filter-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M7 12H17M10 18H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            Filter
            {hasActiveFilters && <span className="filter-badge">{activeFilterCount}</span>}
          </button>
          <button 
            className="nutrition-add-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Add Meal'}
          </button>
        </div>
      </div>

      {/* Filter Panel - Same style as Progress */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3>Filter Nutrition</h3>
            {hasActiveFilters && (
              <button 
                className="clear-filters-btn"
                onClick={clearAllFilters}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="filter-grid">
            {/* Date Range Filters */}
            <div className="filter-group">
              <label className="filter-label">Date Range</label>
              <div className="date-range-inputs">
                <input
                  type="date"
                  placeholder="From date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="filter-input date-input"
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  placeholder="To date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="filter-input date-input"
                />
              </div>
            </div>

            {/* Meal Type Filter */}
            <div className="filter-group">
              <label className="filter-label">Meal Type</label>
              <select
                value={filters.mealType}
                onChange={(e) => handleFilterChange('mealType', e.target.value)}
                className="filter-input"
              >
                <option value="">All Meals</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            {/* Calories Range */}
            <div className="filter-group">
              <label className="filter-label">Calories Range</label>
              <div className="date-range-inputs">
                <input
                  type="number"
                  placeholder="Min calories"
                  value={filters.caloriesMin}
                  onChange={(e) => handleFilterChange('caloriesMin', e.target.value)}
                  className="filter-input date-input"
                />
                <span className="date-separator">to</span>
                <input
                  type="number"
                  placeholder="Max calories"
                  value={filters.caloriesMax}
                  onChange={(e) => handleFilterChange('caloriesMax', e.target.value)}
                  className="filter-input date-input"
                />
              </div>
            </div>

            {/* Food Search */}
            <div className="filter-group">
              <label className="filter-label">Search Food</label>
              <input
                type="text"
                placeholder="Search food items..."
                value={filters.foodSearch}
                onChange={(e) => handleFilterChange('foodSearch', e.target.value)}
                className="filter-input search-input"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="nutrition-form-container">
          <form onSubmit={handleSubmit} className="nutrition-form">
            <h3>Add Nutrition Log</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date:</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Meal Type:</label>
                <select
                  value={formData.mealType}
                  onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
            </div>

            {/* Food Items with Labels */}
            <div className="food-items-section">
              <h4>Food Items</h4>
              {formData.foodItems.map((item, index) => (
                <div key={index} className="food-item-form">
                  <div className="food-item-header">
                    <h5>Food Item {index + 1}</h5>
                    {formData.foodItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFoodItem(index)}
                        className="remove-food-btn"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Food Name:</label>
                      <input
                        type="text"
                        placeholder="e.g., Chicken Breast"
                        value={item.name}
                        onChange={(e) => updateFoodItem(index, 'name', e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Quantity:</label>
                      <input
                        type="text"
                        placeholder="e.g., 1 cup, 100g"
                        value={item.quantity}
                        onChange={(e) => updateFoodItem(index, 'quantity', e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Calories:</label>
                    <input
  type="number"
  placeholder="e.g., 250"
  value={item.calories}
  onChange={(e) => updateFoodItem(index, 'calories', e.target.value)}
  onFocus={(e) => e.target.select()}
  className="form-input"
  required
/>

                    </div>
                  </div>

                  <div className="macros-row">
                    <div className="form-group">
                      <label className="form-label">Protein (g):</label>
                  <input
  type="number"
  step="0.1"
  placeholder="e.g., 25.5"
  value={item.macros.protein}
  onChange={(e) => updateFoodItem(index, 'macros.protein', Number(e.target.value))}
  onFocus={(e) => e.target.select()}
  className="form-input"
  required
/>

                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Carbs (g):</label>
                    <input
  type="number"
  step="0.1"
  placeholder="e.g., 15.0"
  value={item.macros.carbs}
  onChange={(e) => updateFoodItem(index, 'macros.carbs', Number(e.target.value))}
  onFocus={(e) => e.target.select()}
  className="form-input"
  required
/>

                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Fat (g):</label>
                   <input
  type="number"
  step="0.1"
  placeholder="e.g., 8.2"
  value={item.macros.fat}
  onChange={(e) => updateFoodItem(index, 'macros.fat', Number(e.target.value))}
  onFocus={(e) => e.target.select()}
  className="form-input"
  required
/>

                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addFoodItem}
                className="add-food-item-btn"
              >
                + Add Another Food Item
              </button>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                Add Nutrition Log
              </button>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Nutrition Logs Display */}
      {loading ? (
        // <p className="nutrition-loading">Loading nutrition...</p>
           <div className="loader-container" />
      ) : filteredNutritionLogs.length === 0 ? (
        <div className="no-workouts-message">
          {hasActiveFilters ? (
            <div className="no-filter-results">
              <div className="no-results-icon">🔍</div>
              <h3>No nutrition entries match your filters</h3>
              <p>Try adjusting your search criteria or clearing some filters.</p>
              <button 
                className="clear-filters-btn-alt"
                onClick={clearAllFilters}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="no-workouts">
              <div className="no-workouts-icon">🍽️</div>
              <h3>No nutrition data found</h3>
              <p>Start tracking your meals by adding your first nutrition entry!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="nutrition-cards-grid">
          {filteredNutritionLogs.map((log) => {
            const totalCalories = getTotalCalories(log);
            const totalMacros = getTotalMacros(log);

            return (
              <div key={log._id} className="nutrition-card">
                <div className="nutrition-card-header">
                  <div className="nutrition-date">
                    {new Date(log.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="nutrition-meal-badge">
                    <span 
                      className="meal-type-badge"
                      style={{ backgroundColor: getMealTypeColor(log.mealType) }}
                    >
                      {log.mealType.charAt(0).toUpperCase() + log.mealType.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="nutrition-card-content">
                  {/* Calories Section */}
                  <div className="nutrition-calories-section">
                    <h4 className="nutrition-section-title">Total Calories</h4>
                    <div className="nutrition-calories">
                      <div className="nutrition-metric">
                        <span className="nutrition-metric-value">{totalCalories} cal</span>
                      </div>
                    </div>
                  </div>

                  {/* Macros Section */}
                  <div className="nutrition-macros-section">
                    <h4 className="nutrition-section-title">Macronutrients</h4>
                    <div className="nutrition-macros">
                      <div className="nutrition-metric">
                        <span className="nutrition-metric-label">Protein</span>
                        <span className="nutrition-metric-value">{totalMacros.protein.toFixed(1)}g</span>
                      </div>
                      <div className="nutrition-metric">
                        <span className="nutrition-metric-label">Carbs</span>
                        <span className="nutrition-metric-value">{totalMacros.carbs.toFixed(1)}g</span>
                      </div>
                      <div className="nutrition-metric">
                        <span className="nutrition-metric-label">Fat</span>
                        <span className="nutrition-metric-value">{totalMacros.fat.toFixed(1)}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Food Items */}
                  <div className="nutrition-foods-section">
                    <h4 className="nutrition-section-title">Food Items ({log.foodItems.length})</h4>
                    <div className="nutrition-food-list">
                      {log.foodItems.slice(0, 3).map((item, index) => (
                        <div key={index} className="nutrition-food-item">
                          <span className="food-name">{item.name}</span>
                          <span className="food-details">{item.quantity} - {item.calories} cal</span>
                        </div>
                      ))}
                      {log.foodItems.length > 3 && (
                        <div className="nutrition-food-item more">
                          +{log.foodItems.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="nutrition-action-buttons">
                  <button
                    onClick={() => navigate(`/nutrition/edit/${log._id}`)}
                    className="actions-btn edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteLog(log._id)}
                    className="actions-btn delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NutritionList;
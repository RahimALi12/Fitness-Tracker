import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import './NutritionEdit.css';
import { useLoading } from '../../context/GlobalLoadingContext';
import usePageLoader from '../../hooks/usePageLoader';

const NutritionEdit = () => {
  const { id } = useParams();
    const { isLoading } = useLoading();
  const navigate = useNavigate();
const [, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    fetchNutritionLog();
  }, [id]);

  const fetchNutritionLog = async () => {
    try {
      const response = await axios.get(`/nutrition/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const log = response.data;
      const formattedDate = new Date(log.date).toISOString().split('T')[0];
      
      setFormData({
        date: formattedDate,
        mealType: log.mealType,
        foodItems: log.foodItems.map(item => ({
          name: item.name || '',
          quantity: item.quantity || '',
          calories: item.calories || 0,
          macros: {
            protein: item.macros?.protein || 0,
            carbs: item.macros?.carbs || 0,
            fat: item.macros?.fat || 0
          }
        }))
      });
    } catch {
      toast.error('Failed to fetch nutrition log');
      navigate('/nutrition');
    } finally {
      setLoading(false);
    }
  };

    usePageLoader(fetchNutritionLog);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await axios.put(`/nutrition/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Nutrition log updated successfully!');
      navigate('/nutrition');
    } catch {
      toast.error('Failed to update nutrition log');
    } finally {
      setSaving(false);
    }
  };

  const addFoodItem = () => {
    setFormData({
      ...formData,
      foodItems: [...formData.foodItems, {
        name: '',
        quantity: '',
        calories: 0,
        macros: { protein: 0, carbs: 0, fat: 0 }
      }]
    });
  };

  const removeFoodItem = (index) => {
    if (formData.foodItems.length === 1) {
      toast.warning('At least one food item is required');
      return;
    }
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

  const handleCancel = () => {
    navigate('/nutrition');
  };

  const getMealTypeIcon = (mealType) => {
    const icons = {
      breakfast: '🌅',
      lunch: '🌞', 
      dinner: '🌙',
      snack: '🍎'
    };
    return icons[mealType] || '🍽️';
  };


 if (isLoading) return <div className="loader-container" />;

  return (
    <div className="edit-container">
      {/* Background Decoration */}
      <div className="edit-background">
        <div className="bg-blob blob-1"></div>
        <div className="bg-blob blob-2"></div>
        <div className="bg-blob blob-3"></div>
      </div>

      {/* Header Section */}
      <div className="edit-header">
        <button 
          onClick={handleCancel}
          className="back-button"
        >
          <span className="back-icon">←</span>
          <span>Back to Nutrition</span>
        </button>
        
        <div className="edit-title-section">
          <div className="title-icon">
            {getMealTypeIcon(formData.mealType)}
          </div>
          <div className="title-content">
            <h1 className="edit-title">Edit Nutrition Entry</h1>
            <p className="edit-subtitle">
              Updating your {formData.mealType} from {new Date(formData.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="edit-form-wrapper">
        <form onSubmit={handleSubmit} className="edit-form">
          {/* Basic Info Card */}
          <div className="form-card basic-info-card">
            <div className="card-header">
              <h3 className="card-title">Basic Information</h3>
            </div>
            
            <div className="card-content">
              <div className="form-grid basic-grid">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="form-input premium-inputs"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Meal Type</label>
                  <select
                    value={formData.mealType}
                    onChange={(e) => setFormData({ ...formData, mealType: e.target.value })}
                    className="form-select premium-selects"
                    required
                  >
                    <option value="breakfast">🌅 Breakfast</option>
                    <option value="lunch">🌞 Lunch</option>
                    <option value="dinner">🌙 Dinner</option>
                    <option value="snack">🍎 Snack</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Food Items Card */}
          <div className="form-card food-items-card">
            <div className="card-header">
              <h3 className="card-title">Food Items ({formData.foodItems.length})</h3>
              <button
                type="button"
                onClick={addFoodItem}
                className="add-item-btn"
              >
                + Add Food
              </button>
            </div>

            <div className="card-content">
              <div className="food-items-list">
                {formData.foodItems.map((item, index) => (
                  <div key={index} className="food-item-card">
                    <div className="food-item-header">
                      <div className="item-number">
                        <span>{index + 1}</span>
                      </div>
                      <h4 className="item-title">Food Item {index + 1}</h4>
                      {formData.foodItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFoodItem(index)}
                          className="remove-item-btn"
                        >
                          <span>×</span>
                        </button>
                      )}
                    </div>

                    <div className="food-item-content">
                      {/* Basic Food Info */}
                      <div className="form-grid food-basic-grid">
                        <div className="form-group">
                          <label className="form-label">Food Name</label>
                          <input
                            type="text"
                            placeholder="e.g., Grilled Chicken Breast"
                            value={item.name}
                            onChange={(e) => updateFoodItem(index, 'name', e.target.value)}
                            className="form-input premium-inputs"
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Quantity</label>
                          <input
                            type="text"
                            placeholder="e.g., 150g, 1 cup"
                            value={item.quantity}
                            onChange={(e) => updateFoodItem(index, 'quantity', e.target.value)}
                            className="form-input premium-inputs"
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label">Calories</label>
                          <input
                            type="number"
                            placeholder="250"
                            value={item.calories}
                            onChange={(e) => updateFoodItem(index, 'calories', Number(e.target.value))}
                            className="form-input premium-inputs"
                            required
                          />
                        </div>
                      </div>

                      {/* Macros Section */}
                      <div className="macros-section">
                        <h5 className="macros-title">Macronutrients (grams)</h5>
                        <div className="form-grid macros-grid">
                          <div className="form-group">
                            <label className="form-label macro-label protein">
                              <span className="macro-dot protein-dot"></span>
                              Protein
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="25.5"
                              value={item.macros.protein}
                              onChange={(e) => updateFoodItem(index, 'macros.protein', Number(e.target.value))}
                              className="form-input premium-inputs macro-input"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label macro-label carbs">
                              <span className="macro-dot carbs-dot"></span>
                              Carbs
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="15.0"
                              value={item.macros.carbs}
                              onChange={(e) => updateFoodItem(index, 'macros.carbs', Number(e.target.value))}
                              className="form-input premium-inputs macro-input"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label macro-label fats">
                              <span className="macro-dot fats-dot"></span>
                              Fats
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="8.2"
                              value={item.macros.fat}
                              onChange={(e) => updateFoodItem(index, 'macros.fat', Number(e.target.value))}
                              className="form-input premium-inputs macro-input"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actionsu">
            <button 
              type="button" 
              onClick={handleCancel}
              className="action-btnu cancel-btn"
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="action-btnu save-btnu"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="btnu-loading"></div>
                  Updating...
                </>
              ) : (
                'Update Nutrition Log'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NutritionEdit;
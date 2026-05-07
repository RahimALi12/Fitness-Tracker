import React, { useState } from 'react';
import axios from '../../utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLoading } from '../../context/GlobalLoadingContext';
import usePageLoader from '../../hooks/usePageLoader';
import './WorkoutEdit.css';

const WorkoutEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoading } = useLoading();

  const [formData, setFormData] = useState({
    date: '',
    title: '',
    category: 'strength',
    tags: '',
    exercises: [{ name: '', sets: '', reps: '', weight: '', notes: '' }]
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch workout data using global loading hook
  const fetchWorkout = async () => {
    try {
      const res = await axios.get(`/workouts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;

      setFormData({
        date: data.date?.slice(0, 10) || '', 
        title: data.title || '',
        category: data.category || 'strength',
        tags: data.tags?.join(', ') || '',
        exercises: data.exercises?.length ? data.exercises : [{ name: '', sets: '', reps: '', weight: '', notes: '' }]
      });
    } catch (error) {
      console.error('Failed to load workout:', error);
      toast.error('Failed to load workout');
    }
  };

  usePageLoader(fetchWorkout);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...formData.exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setFormData(prev => ({ ...prev, exercises: newExercises }));
  };

  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, { name: '', sets: '', reps: '', weight: '', notes: '' }]
    }));
  };

  const removeExercise = (index) => {
    const newExercises = formData.exercises.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, exercises: newExercises }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      const workoutData = {
        date: formData.date,
        title: formData.title,
        category: formData.category,
        tags: tagsArray,
        exercises: formData.exercises.map(ex => ({
          name: ex.name,
          sets: Number(ex.sets),
          reps: Number(ex.reps),
          weight: ex.weight ? Number(ex.weight) : null,
          notes: ex.notes
        }))
      };

      await axios.put(`/workouts/${id}`, workoutData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Workout updated successfully!');
      setTimeout(() => navigate(`/workouts/${id}`), 800);
    } catch (error) {
      console.error('Failed to update workout:', error);
      toast.error('Failed to update workout');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="loader-container" />;

  return (
    <div className="workout-form-container">
      <h2>Edit Workout</h2>

      <form onSubmit={handleSubmit} className="workout-form-grid">
        
        {/* Date and Title in same row with labels */}
        <div className="workout-form-grid workout-form-grid-2">
          <div className="workout-form-field">
            <label className="workout-form-label">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="workout-form-input"
            />
          </div>

          <div className="workout-form-field">
            <label className="workout-form-label">Workout Title</label>
            <input
              type="text"
              name="title"
              placeholder="Workout Title"
              value={formData.title}
              onChange={handleChange}
              required
              className="workout-form-input"
            />
          </div>
        </div>

        {/* Category and Tags in same row with labels */}
        <div className="workout-form-grid workout-form-grid-2">
          <div className="workout-form-field">
            <label className="workout-form-label">Category</label>
            <select 
              name="category"
              value={formData.category} 
              onChange={handleChange}
              className="workout-form-input"
            >
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="balance">Balance</option>
            </select>
          </div>

          <div className="workout-form-field">
            <label className="workout-form-label">Tags</label>
            <input
              type="text"
              name="tags"
              placeholder="Tags (comma separated)"
              value={formData.tags}
              onChange={handleChange}
              className="workout-form-input"
            />
          </div>
        </div>

        {/* Exercises Section */}
        <div className="workout-exercises-section">
          <h3>Exercises</h3>
          
          {formData.exercises.map((exercise, index) => (
            <div key={index} className="workout-exercise-card">
              <div className="workout-form-grid workout-form-grid-2">
                <div className="workout-form-field">
                  <label className="workout-form-label">Exercise Name</label>
                  <input
                    type="text"
                    placeholder="Exercise Name"
                    value={exercise.name}
                    onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    required
                    className="workout-form-input"
                  />
                </div>
                
                <div className="workout-form-field">
                  <label className="workout-form-label">Sets</label>
                  <input
                    type="number"
                    placeholder="Sets"
                    value={exercise.sets}
                    onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                    required
                    min="1"
                    className="workout-form-input"
                  />
                </div>
              </div>

              <div className="workout-form-grid workout-form-grid-2">
                <div className="workout-form-field">
                  <label className="workout-form-label">Reps</label>
                  <input
                    type="number"
                    placeholder="Reps"
                    value={exercise.reps}
                    onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                    required
                    min="1"
                    className="workout-form-input"
                  />
                </div>
                
                <div className="workout-form-field">
                  <label className="workout-form-label">Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="Weight (kg) - Optional"
                    value={exercise.weight}
                    onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                    min="0"
                    className="workout-form-input"
                  />
                </div>
              </div>

              <div className="workout-form-field">
                <label className="workout-form-label">Notes</label>
                <textarea
                  placeholder="Exercise notes (optional)"
                  value={exercise.notes}
                  onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                  className="workout-form-textarea"
                  rows="2"
                />
              </div>

              {formData.exercises.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeExercise(index)}
                  className="workout-remove-exercise-btn"
                >
                  Remove Exercise
                </button>
              )}
            </div>
          ))}
        </div>

        <button 
          type="button" 
          onClick={addExercise}
          className="workout-add-exercise-btn"
        >
          Add Exercise
        </button>

        <button 
          type="submit"
          disabled={loading}
          className="progress-form-button"
        >
          {loading ? 'Updating...' : 'Update Workout'}
        </button>
      </form>
    </div>
  );
};

export default WorkoutEdit;
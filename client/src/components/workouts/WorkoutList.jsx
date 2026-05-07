import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLoading } from '../../context/GlobalLoadingContext';
import './WorkoutList.css';

const WorkoutList = ({ workouts = [], deleteWorkout }) => {
  const { isLoading } = useLoading();

  // Filter states
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    titleSearch: '',
    exerciseSearch: '',
    category: '',
    tags: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories and tags for filter options
  const { categories, allTags } = useMemo(() => {
    const cats = [...new Set(workouts.map(w => w.category).filter(Boolean))];
    const tags = [...new Set(workouts.flatMap(w => w.tags || []))];
    return { categories: cats, allTags: tags };
  }, [workouts]);

  // Filtered workouts based on all filter criteria
  const filteredWorkouts = useMemo(() => {
    return workouts.filter(workout => {
      // Date range filter
      if (filters.dateFrom) {
        const workoutDate = new Date(workout.date);
        const fromDate = new Date(filters.dateFrom);
        if (workoutDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const workoutDate = new Date(workout.date);
        const toDate = new Date(filters.dateTo);
        if (workoutDate > toDate) return false;
      }

      // Title search filter
      if (filters.titleSearch) {
        if (!workout.title?.toLowerCase().includes(filters.titleSearch.toLowerCase())) {
          return false;
        }
      }

      // Exercise search filter
      if (filters.exerciseSearch) {
        const hasExercise = workout.exercises?.some(ex => 
          ex.name?.toLowerCase().includes(filters.exerciseSearch.toLowerCase())
        );
        if (!hasExercise) return false;
      }

      // Category filter
      if (filters.category && workout.category !== filters.category) {
        return false;
      }

      // Tags filter
      if (filters.tags) {
        const searchTags = filters.tags.toLowerCase().split(',').map(t => t.trim());
        const workoutTags = (workout.tags || []).map(t => t.toLowerCase());
        const hasMatchingTag = searchTags.some(searchTag => 
          workoutTags.some(workoutTag => workoutTag.includes(searchTag))
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }, [workouts, filters]);

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
      titleSearch: '',
      exerciseSearch: '',
      category: '',
      tags: ''
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  const activeFilterCount = Object.values(filters).filter(value => value !== '').length;

  // DEBUG: Check received props
  console.log('WorkoutList received workouts:', workouts);
  console.log('Filtered workouts:', filteredWorkouts);

  return (
    <div className="workout-list-container">
      <div className="workout-header-container">
        <div className="workout-header-left">
          <h2 className="workout-heading">Your Workouts</h2>
          <div className="workout-stats">
            {hasActiveFilters && (
              <span className="filter-results">
                Showing {filteredWorkouts.length} of {workouts.length} workouts
                {activeFilterCount > 0 && (
                  <span className="active-filters-count">
                    ({activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active)
                  </span>
                )}
              </span>
            )}
            {!hasActiveFilters && workouts.length > 0 && (
              <div className="workout-counter">
                {workouts.length} workout{workouts.length !== 1 ? 's' : ''} completed
              </div>
            )}
          </div>
        </div>
   

<div className="workout-header-actions">
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
  <Link 
    to="/workouts/new" 
    className="workout-add-btn"
  >
    Add Workout
  </Link>
</div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3>Filter Workouts</h3>
            {hasActiveFilters && (
              <button 
                className="clear-filters-btn"
                onClick={clearAllFilters}
              >
                Clear All
              </button>
            )}
          </div>

 <div className="filter-content-scroll">
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

            {/* Title Search */}
            <div className="filter-group">
              <label className="filter-label">Workout Title</label>
              <input
                type="text"
                placeholder="Search by workout title..."
                value={filters.titleSearch}
                onChange={(e) => handleFilterChange('titleSearch', e.target.value)}
                className="filter-input search-input"
              />
            </div>

            {/* Exercise Search */}
            <div className="filter-group">
              <label className="filter-label">Exercise Name</label>
              <input
                type="text"
                placeholder="Search by exercise name..."
                value={filters.exerciseSearch}
                onChange={(e) => handleFilterChange('exerciseSearch', e.target.value)}
                className="filter-input search-input"
              />
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-input select-input"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Filter */}
            {/* <div className="filter-group">
              <label className="filter-label">Tags</label>
              {allTags.length > 0 && (
                <div className="available-tags">
                  {allTags.slice(0, 12).map(tag => (
                    <button
                      key={tag}
                      className="tag-suggestion"
                  
                      onClick={() => {
  const currentTagsArray = filters.tags 
    ? filters.tags.split(',').map(t => t.trim()).filter(t => t !== '')
    : [];
  
 
  if (!currentTagsArray.includes(tag)) {
    const updatedTags = currentTagsArray.length > 0 
      ? filters.tags + ', ' + tag 
      : tag;
    handleFilterChange('tags', updatedTags);
  }
}}
                           title={`Add "${tag}" to search`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

              )}
            </div>
                   {filters.tags && (
  <div className="current-tags-display">
    <span className="current-tags-label">Selected Tags:</span>
    <div className="current-tags-list">
      {filters.tags.split(',').map((tag, index) => (
        <span key={index} className="current-tag-chip">
          {tag.trim()}
          <button
            className="remove-tag-btn"
            onClick={() => {
              const updatedTags = filters.tags
                .split(',')
                .filter((t, i) => i !== index)
                .join(',');
              handleFilterChange('tags', updatedTags);
            }}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  </div>
)} */}
  
  
  <div className="filter-group">
  <label className="filter-label">Tags</label>
  
  
  {allTags.length > 0 && (
      <div>
        {allTags.slice(0, 12).map(tag => {
          const currentTagsArray = filters.tags 
            ? filters.tags.split(',').map(t => t.trim()).filter(t => t !== '')
            : [];
          const isSelected = currentTagsArray.includes(tag);
          
          return (
            <button
              key={tag}
              className={`tag-suggestion ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                if (!isSelected) {
                  const updatedTags = currentTagsArray.length > 0 
                    ? filters.tags + ', ' + tag 
                    : tag;
                  handleFilterChange('tags', updatedTags);
                }
              }}
              title={isSelected ? `"${tag}" already selected` : `Add "${tag}" to search`}
              disabled={isSelected}
            >
              {tag} {isSelected && '✓'}
            </button>
          );
        })}
      </div>
  )}
</div>

  {filters.tags && (
    <div className="current-tags-display">
      <span className="current-tags-label">Selected Tags:</span>
      <div className="current-tags-list">
        {filters.tags.split(',').map((tag, index) => (
          <span key={index} className="current-tag-chip">
            {tag.trim()}
            <button
              className="remove-tag-btn"
              onClick={() => {
                const updatedTags = filters.tags
                  .split(',')
                  .filter((t, i) => i !== index)
                  .map(t => t.trim())
                  .filter(t => t !== '')
                  .join(', ');
                handleFilterChange('tags', updatedTags);
              }}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  )}
  
          </div>
            </div>

        </div>
        
      )}

      {isLoading ? (
        <p className="workout-loading">Loading workouts...</p>
      ) : filteredWorkouts.length === 0 ? (
        <div className="no-workouts-message">
          {hasActiveFilters ? (
            <div className="no-filter-results">
              <div className="no-results-icon">🔍</div>
              <h3>No workouts match your filters</h3>
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
              <div className="no-workouts-icon">💪</div>
              <h3>No workouts found</h3>
              <p>Let's get moving! Add your first workout.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="workout-cards-grid">
          {filteredWorkouts.map((workout) => (
            <div key={workout._id} className="workout-card">
              
              <div className="workout-date-line">
                {new Date(workout.date).toLocaleDateString()}
              </div>

              <div className="workout-title-section">
                {workout.title}
              </div>

              <div className="workout-details">
                <div className="workout-detail-row">
                  <span className="workout-detail-label">Category:</span>
                  <span className="workout-category-badge">{workout.category}</span>
                </div>
                
                {workout.tags && workout.tags.length > 0 && (
                  <div className="workout-detail-row">
                    <span className="workout-detail-label">Tags:</span>
                    <span className="workout-detail-value">{workout.tags.join(', ')}</span>
                  </div>
                )}
                
                {workout.exercises && workout.exercises.length > 0 && (
                  <div className="workout-exercises-section">
                    <div className="workout-detail-row">
                      <span className="workout-detail-label">Exercises:</span>
                      <span className="workout-exercises-count">{workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="workout-exercises-preview">
                      {workout.exercises.slice(0, 2).map((ex, index) => (
                        <span key={index} className="workout-exercise-chip">
                          {ex.name}
                        </span>
                      ))}
                      {workout.exercises.length > 2 && (
                        <span className="workout-exercise-chip more">
                          +{workout.exercises.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {workout.notes && (
                  <div className="workout-notes-section">
                    <span className="workout-detail-label">Notes:</span>
                    <div className="workout-notes-content">{workout.notes}</div>
                  </div>
                )}
              </div>

              <div className="workout-action-buttons">
                <Link
                  to={`/workouts/${workout._id}`}
                  className="workout-action-btn view"
                  title="View Details"
                >
                  View
                </Link>
                <Link
                  to={`/workouts/edit/${workout._id}`}
                  className="workout-action-btn edit"
                  title="Edit"
                >
                  Edit
                </Link>
                <button
                  onClick={() => deleteWorkout(workout._id)}
                  className="workout-action-btn delete"
                  title="Delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutList;
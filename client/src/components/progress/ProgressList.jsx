// import { useNavigate } from 'react-router-dom';
// import './ProgressList.css';
// import { useLoading } from '../../context/GlobalLoadingContext';


// const ProgressList = ({ progressList, deleteProgress }) => {
//     useLoading();
//   const navigate = useNavigate();

//   return (
    
//         <div className="progress-list-container">
//       <div className="header-container">
//         <h2 className="heading">Your Progress</h2>
//         <button
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//           onClick={() => navigate('/progress/new')}
//         >
//           Add Progress
//         </button>
//       </div>

//       {progressList.length === 0 ? (
//         <p className="text-gray-500">No progress data available.</p>
//       ) : (
//         <>
//           <div className="cards-grid">
//             {progressList.map((item) => (
//               <div key={item._id} className="progress-card">
//                 <div className="date-line">
//                   {new Date(item.date).toLocaleDateString()}
//                 </div>
//                 <div className="progress-details">
//                   <p><strong>Weight:</strong> {item.weight} kg</p>
//                   <p><strong>Chest:</strong> {item.bodyMeasurements?.chest || '-'}</p>
//                   <p><strong>Waist:</strong> {item.bodyMeasurements?.waist || '-'}</p>
//                   <p><strong>Hips:</strong> {item.bodyMeasurements?.hips || '-'}</p>
//                   <p><strong>Run Time:</strong> {item.performanceMetrics?.runTime || '-'} s</p>
//                   <p><strong>Lifting Max:</strong> {item.performanceMetrics?.liftingMax || '-'}</p>
//                   <p><strong>Notes:</strong> {item.notes || '-'}</p>
//                 </div>
//                 <div className="action-buttons">
//                   <button
//                     onClick={() => deleteProgress(item._id)}
//                     className="action-btn delete"
//                     title="Delete"
//                   >
//                     Delete
//                   </button>
//                   <button
//                     onClick={() => navigate(`/progress/edit/${item._id}`)}
//                     className="action-btn edit"
//                     title="Edit"
//                   >
//                     Edit
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//         </>
//       )}
//     </div>
//   );
// };

// export default ProgressList;


import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProgressList.css';
import { useLoading } from '../../context/GlobalLoadingContext';

const ProgressList = ({ progressList, deleteProgress }) => {
  const { isLoading } = useLoading();
  const navigate = useNavigate();

  // Filter states - same structure as WorkoutList
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    weightMin: '',
    weightMax: '',
    notesSearch: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  // Filtered progress based on all filter criteria
  const filteredProgress = useMemo(() => {
    return progressList.filter(item => {
      // Date range filter
      if (filters.dateFrom) {
        const itemDate = new Date(item.date);
        const fromDate = new Date(filters.dateFrom);
        if (itemDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const itemDate = new Date(item.date);
        const toDate = new Date(filters.dateTo);
        if (itemDate > toDate) return false;
      }

      // Weight range filter
      if (filters.weightMin && item.weight < parseFloat(filters.weightMin)) return false;
      if (filters.weightMax && item.weight > parseFloat(filters.weightMax)) return false;

      // Notes search filter
      if (filters.notesSearch) {
        if (!item.notes?.toLowerCase().includes(filters.notesSearch.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [progressList, filters]);

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
      weightMin: '',
      weightMax: '',
      notesSearch: ''
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  const activeFilterCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <div className="progress-list-container">
      <div className="progress-header-container">
        <div className="progress-header-left">
          <h2 className="progress-heading">Your Progress Journey</h2>
          <div className="progress-stats">
            {hasActiveFilters && (
              <span className="filter-results">
                Showing {filteredProgress.length} of {progressList.length} entries
                {activeFilterCount > 0 && (
                  <span className="active-filters-count">
                    ({activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active)
                  </span>
                )}
              </span>
            )}
            {!hasActiveFilters && progressList.length > 0 && (
              <div className="progress-counter">
                {progressList.length} progress entr{progressList.length !== 1 ? 'ies' : 'y'} recorded
              </div>
            )}
          </div>
        </div>

        <div className="progress-header-actions">
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
            className="progress-add-btn"
            onClick={() => navigate('/progress/new')}
          >
            Add Progress
          </button>
        </div>
      </div>

      {/* Filter Panel - Same style as WorkoutList */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3>Filter Progress</h3>
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

            {/* Weight Range */}
            <div className="filter-group">
              <label className="filter-label">Weight Range (kg)</label>
              <div className="date-range-inputs">
                <input
                  type="number"
                  placeholder="Min weight"
                  value={filters.weightMin}
                  onChange={(e) => handleFilterChange('weightMin', e.target.value)}
                  className="filter-input date-input"
                />
                <span className="date-separator">to</span>
                <input
                  type="number"
                  placeholder="Max weight"
                  value={filters.weightMax}
                  onChange={(e) => handleFilterChange('weightMax', e.target.value)}
                  className="filter-input date-input"
                />
              </div>
            </div>

            {/* Notes Search */}
            <div className="filter-group">
              <label className="filter-label">Search Notes</label>
              <input
                type="text"
                placeholder="Search in notes..."
                value={filters.notesSearch}
                onChange={(e) => handleFilterChange('notesSearch', e.target.value)}
                className="filter-input search-input"
              />
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="progress-loading">Loading progress...</p>
      ) : filteredProgress.length === 0 ? (
        <div className="no-workouts-message">
          {hasActiveFilters ? (
            <div className="no-filter-results">
              <div className="no-results-icon">🔍</div>
              <h3>No progress entries match your filters</h3>
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
              <div className="no-workouts-icon">📊</div>
              <h3>No progress data found</h3>
              <p>Start tracking your fitness journey by adding your first progress entry!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="progress-cards-grid">
          {filteredProgress.map((item) => (
            <div key={item._id} className="progress-card">
              <div className="progress-card-header">
                <div className="progress-date">
                  {new Date(item.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                <div className="progress-weight-badge">
                  {item.weight} kg
                </div>
              </div>

              <div className="progress-card-content">
                {/* Body Measurements */}
                {(item.bodyMeasurements?.chest || item.bodyMeasurements?.waist || item.bodyMeasurements?.hips) && (
                  <div className="progress-measurement-section">
                    <h4 className="progress-section-title">Body Measurements</h4>
                    <div className="progress-measurements">
                      {item.bodyMeasurements?.chest && (
                        <div className="progress-metric">
                          <span className="progress-metric-label">Chest</span>
                          <span className="progress-metric-value">{item.bodyMeasurements.chest} cm</span>
                        </div>
                      )}
                      {item.bodyMeasurements?.waist && (
                        <div className="progress-metric">
                          <span className="progress-metric-label">Waist</span>
                          <span className="progress-metric-value">{item.bodyMeasurements.waist} cm</span>
                        </div>
                      )}
                      {item.bodyMeasurements?.hips && (
                        <div className="progress-metric">
                          <span className="progress-metric-label">Hips</span>
                          <span className="progress-metric-value">{item.bodyMeasurements.hips} cm</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                {(item.performanceMetrics?.runTime || item.performanceMetrics?.liftingMax) && (
                  <div className="progress-performance-section">
                    <h4 className="progress-section-title">Performance</h4>
                    <div className="progress-measurements">
                      {item.performanceMetrics?.runTime && (
                        <div className="progress-metric">
                          <span className="progress-metric-label">Run Time</span>
                          <span className="progress-metric-value">{item.performanceMetrics.runTime} s</span>
                        </div>
                      )}
                      {item.performanceMetrics?.liftingMax && (
                        <div className="progress-metric">
                          <span className="progress-metric-label">Max Lift</span>
                          <span className="progress-metric-value">{item.performanceMetrics.liftingMax} kg</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {item.notes && (
                  <div className="progress-notes-section">
                    <h4 className="progress-section-title">Notes</h4>
                    <p className="progress-notes">{item.notes}</p>
                  </div>
                )}
              </div>

              <div className="progress-card-actions">
                <button
                  onClick={() => navigate(`/progress/edit/${item._id}`)}
                  className="progress-action-btn progress-edit-btn"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProgress(item._id)}
                  className="progress-action-btn progress-delete-btn"
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

export default ProgressList;
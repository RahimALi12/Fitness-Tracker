// import React, { useEffect, useState } from 'react';
// import axios from '../../utils/axios';
// import { useParams, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify'; // Add toast import
// import './WorkoutDetail.css';

// const WorkoutDetail = () => {
//   const { id } = useParams();
//   const [workout, setWorkout] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchWorkout = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const config = { headers: { Authorization: `Bearer ${token}` } };

//         const res = await axios.get(`/workouts/${id}`, config);
//         setWorkout(res.data);
//       } catch (error) {
//         console.error('Failed to fetch workout:', error);
//         toast.error('Failed to load workout details');
//       }
//     };

//     fetchWorkout();
//   }, [id]);

//   // Delete handler
//   const handleDelete = async () => {
//     if (!window.confirm('Are you sure you want to delete this workout?')) return;

//     try {
//       const token = localStorage.getItem('token');
//       const config = { headers: { Authorization: `Bearer ${token}` } };

//       await axios.delete(`/workouts/${id}`, config);
//       toast.success('Workout deleted successfully');
//       navigate('/workouts'); // Redirect to workouts list after deletion
//     } catch (error) {
//   console.error('Failed to delete workout:', error.response?.data || error.message || error);
//   toast.error(`Failed to delete workout: ${error.response?.data?.message || error.message || 'Unknown error'}`);
// }


//   };

//   if (!workout) return <div className="detail-loading">Loading workout...</div>;

//   return (
//     <div className="detail-wrapper">
//       <div className="detail-card">
//         <div className="detail-header">
//           <h2>{workout.title}</h2>
//           <p className="detail-category">{workout.category}</p>
//           <p className="detail-tags">
//             <strong>Tags:</strong> {workout.tags?.join(', ') || 'None'}
//           </p>
//         </div>

//         <div className="detail-section">
//           <h3>Exercises</h3>
//           {workout.exercises.length === 0 ? (
//             <p className="empty">No exercises added.</p>
//           ) : (
//             <div className="exercise-list">
//               {workout.exercises.map((ex, index) => (
//                 <div key={index} className="exercise-card">
//                   <div className="exercise-title">{ex.name}</div>
//                   <div className="exercise-meta">
//                     Sets: {ex.sets} | Reps: {ex.reps} | Weight: {ex.weight || 'N/A'}
//                   </div>
//                   <div className="exercise-notes">
//                     <strong>Notes:</strong> {ex.notes || 'None'}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="detail-actions">
//           <button className="btn edit" onClick={() => navigate(`/workouts/edit/${id}`)}>✏️ Edit</button>
//           <button className="btn delete" onClick={handleDelete}>🗑️ Delete</button> {/* Added Delete button */}
//           <button className="btn back" onClick={() => navigate('/workouts')}>🔙 Back</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WorkoutDetail;




import React, { useEffect, useState } from 'react';
import axios from '../../utils/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLoading } from '../../context/GlobalLoadingContext';
import './WorkoutDetail.css';

const WorkoutDetail = () => {
  const { id } = useParams();
  const [workout, setWorkout] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isLoading, setIsLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkout = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`/workouts/${id}`, config);
        setWorkout(res.data);
      } catch (error) {
        console.error('Failed to fetch workout:', error);
        toast.error('Failed to load workout details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkout();
  }, [id, setIsLoading]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`/workouts/${id}`, config);
      toast.success('Workout deleted successfully!');
      navigate('/workouts');
    } catch (error) {
      console.error('Failed to delete workout:', error);
      toast.error('Failed to delete workout');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="detail-wrapper">
        <div className="detail-loading">Loading workout details...</div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="detail-wrapper">
        <div className="detail-loading">Workout not found</div>
      </div>
    );
  }

  return (
    <div className="detail-wrapper">
      <div className="detail-card">
        {/* Header */}
        <div className="detail-header">
          <div className="workout-date">
            {new Date(workout.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <h1 className="workout-title">{workout.title}</h1>
          <div className="workout-meta">
            <span className="category-badge">{workout.category}</span>
            <span className="exercises-count">{workout.exercises?.length || 0} exercises</span>
          </div>
          {workout.tags && workout.tags.length > 0 && (
            <div className="tags-container">
              {workout.tags.map((tag, index) => (
                <span key={index} className="tag-chip">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Exercises */}
        <div className="exercises-section">
          <h2>Exercises</h2>
          {workout.exercises?.length === 0 ? (
            <div className="empty-message">No exercises added yet.</div>
          ) : (
            <div className="exercises-list">
              {workout.exercises?.map((exercise, index) => (
                <div key={index} className="exercise-card">
                  <h3 className="exercise-name">{exercise.name}</h3>
                  <div className="exercise-stats">
                    <span>Sets: {exercise.sets || 'N/A'}</span>
                    <span>Reps: {exercise.reps || 'N/A'}</span>
                    <span>Weight: {exercise.weight ? `${exercise.weight} kg` : 'N/A'}</span>
                  </div>
                  {exercise.notes && (
                    <div className="exercise-notes">
                      <strong>Notes:</strong> {exercise.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workout Notes */}
        {workout.notes && (
          <div className="notes-section">
            <h2>Notes</h2>
            <div className="workout-notes">{workout.notes}</div>
          </div>
        )}

        {/* Actions */}
        <div className="action-buttons">
          <button className="btn back-btn" onClick={() => navigate('/workouts')}>
            Back to Workouts
          </button>
          <div className="action-buttons-right">
            <button className="btn edit-btn" onClick={() => navigate(`/workouts/edit/${id}`)}>
              Edit
            </button>
            <button className="btn delete-btn" onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <h3>Delete Workout?</h3>
            <p>Are you sure you want to delete "{workout.title}"?</p>
            <p className="warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                className="btn cancel-btn" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn confirm-btn" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutDetail;
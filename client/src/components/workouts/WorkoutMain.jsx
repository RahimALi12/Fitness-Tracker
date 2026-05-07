// import React, { useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
// import axios from '../../utils/axios';
// import WorkoutList from './WorkoutList';
// import { useLoading } from '../../context/GlobalLoadingContext';

// const WorkoutMain = () => {
//   const { setIsLoading } = useLoading();
//   const [workouts, setWorkouts] = useState([]);
//   const token = localStorage.getItem('token');

//   const fetchWorkouts = async () => {
//     setIsLoading(true);
//     try {
//       const res = await axios.get('/workouts', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
      
//       // Debugging log - check what's actually coming from API
//       console.log('API Response Data:', res.data);
      
//       if (res.data && Array.isArray(res.data)) {
//         setWorkouts(res.data);
//       } else {
//         console.error('Invalid data format:', res.data);
//         setWorkouts([]);
//       }
//     } catch (error) {
//       console.error('Error fetching workouts:', error);
//       toast.error('Failed to load workouts');
//       setWorkouts([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Add this function to force update after new workout is added
//   const handleWorkoutAdded = () => {
//     fetchWorkouts();
//   };

//   useEffect(() => {
//     fetchWorkouts();
    
//     // Listen for custom event when new workout is added
//     window.addEventListener('workoutAdded', handleWorkoutAdded);
    
//     return () => {
//       window.removeEventListener('workoutAdded', handleWorkoutAdded);
//     };
//   }, []);

//   return (
//     <div className="workout-main-container">
//       <WorkoutList 
//         workouts={workouts} 
//         onRefresh={fetchWorkouts} 
//       />
//     </div>
//   );
// };

// export default WorkoutMain;


import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import WorkoutList from './WorkoutList';
import WorkoutChart from './WorkoutChart';
import './WorkoutMain.css';
import { useLoading } from '../../context/GlobalLoadingContext';

const WorkoutMain = () => {
  const { setIsLoading } = useLoading();
  const [activeTab, setActiveTab] = useState('list');
  const [workouts, setWorkouts] = useState([]);
  const token = localStorage.getItem('token');

  const fetchWorkouts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/workouts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('API Response Data:', res.data);
      console.log('API Response Length:', res.data?.length);
      
      if (res.data && Array.isArray(res.data)) {
        setWorkouts(res.data);
        console.log('Workouts Set:', res.data);
      } else {
        console.error('Invalid data format:', res.data);
        setWorkouts([]);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
      toast.error('Failed to load workouts');
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkout = async (id) => {
    const toastId = toast(
      () => (
        <div className="custom-toast-confirmation">
          <h3 className="toast-title">Fitness Tracker</h3>
          <p className="toast-message">Are you sure you want to delete this workout?</p>
          <div className="toast-buttons">
            <button
              className="btn btn-delete"
              onClick={async () => {
                try {
                  await axios.delete(`/workouts/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  await fetchWorkouts();
                  toast.success('Workout deleted successfully!');
                } catch (err) {
                  console.error('Error deleting workout:', err);
                  toast.error('Failed to delete workout.');
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

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // DEBUG: Check workouts state
  console.log('Current workouts state:', workouts);
  console.log('Workouts length:', workouts.length);

  return (
    <div className="workout-main-container">
      {workouts.length > 0 && (
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'list' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('list')}
          >
            All Workouts
          </button>
          <button
            className={`tab-btn ${activeTab === 'chart' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('chart')}
          >
            Workout Charts
          </button>
        </div>
      )}

      {activeTab === 'list' ? (
        <WorkoutList 
          workouts={workouts} 
          deleteWorkout={deleteWorkout}
        />
      ) : (
        <WorkoutChart workouts={workouts} />
      )}
    </div>
  );
};

export default WorkoutMain;
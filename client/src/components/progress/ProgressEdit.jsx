
// // src/components/progress/ProgressEdit.jsx
// import { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from '../../utils/axios';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import './ProgressEdit.css';

// const EditProgress = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     date: '',
//     weight: '',
//     bodyMeasurements: { chest: '', waist: '', hips: '' },
//     performanceMetrics: { runTime: '', liftingMax: '' },
//     notes: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(true);

//   const token = localStorage.getItem('token');

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.get(`/progress/${id}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         const data = res.data;

//         setFormData({
//           date: data.date?.slice(0, 10) || '',
//           weight: data.weight || '',
//           bodyMeasurements: {
//             chest: data.bodyMeasurements?.chest || '',
//             waist: data.bodyMeasurements?.waist || '',
//             hips: data.bodyMeasurements?.hips || ''
//           },
//           performanceMetrics: {
//             runTime: data.performanceMetrics?.runTime || '',
//             liftingMax: data.performanceMetrics?.liftingMax || ''
//           },
//           notes: data.notes || ''
//         });
//       } catch (err) {
//         toast.error('Error loading progress');
//         console.error('Fetch error:', err);
//       } finally {
//         setFetching(false);
//       }
//     };

//     fetchData();
//   }, [id]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (['chest', 'waist', 'hips'].includes(name)) {
//       setFormData((prev) => ({
//         ...prev,
//         bodyMeasurements: { ...prev.bodyMeasurements, [name]: value }
//       }));
//     } else if (['runTime', 'liftingMax'].includes(name)) {
//       setFormData((prev) => ({
//         ...prev,
//         performanceMetrics: { ...prev.performanceMetrics, [name]: value }
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await axios.put(`/progress/${id}`, formData, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       toast.success('Progress updated successfully!');
//       setTimeout(() => navigate('/progress'), 800);
//     } catch (error) {
//       console.error('Update error:', error);
//       toast.error('Failed to update progress');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (fetching) return <p className="p-4">Loading...</p>;

//   return (
//     <div className="progress-form-container">
//       <h2>Edit Progress</h2>

//       <form onSubmit={handleSubmit} className="progress-form-grid">
//         <input
//           type="date"
//           name="date"
//           value={formData.date}
//           onChange={handleChange}
//           required
//           className="progress-form-input"
//         />

//         <input
//           type="number"
//           name="weight"
//           placeholder="Weight (kg)"
//           value={formData.weight}
//           onChange={handleChange}
//           className="progress-form-input"
//         />

//         <div className="progress-form-grid progress-form-grid-3">
//           <input
//             type="number"
//             name="chest"
//             placeholder="Chest (cm)"
//             value={formData.bodyMeasurements.chest}
//             onChange={handleChange}
//             className="progress-form-input"
//           />
//           <input
//             type="number"
//             name="waist"
//             placeholder="Waist (cm)"
//             value={formData.bodyMeasurements.waist}
//             onChange={handleChange}
//             className="progress-form-input"
//           />
//           <input
//             type="number"
//             name="hips"
//             placeholder="Hips (cm)"
//             value={formData.bodyMeasurements.hips}
//             onChange={handleChange}
//             className="progress-form-input"
//           />
//         </div>

//         <div className="progress-form-grid progress-form-grid-2">
//           <input
//             type="number"
//             name="runTime"
//             placeholder="Run Time (s)"
//             value={formData.performanceMetrics.runTime}
//             onChange={handleChange}
//             className="progress-form-input"
//           />
//           <input
//             type="number"
//             name="liftingMax"
//             placeholder="Lifting Max (kg)"
//             value={formData.performanceMetrics.liftingMax}
//             onChange={handleChange}
//             className="progress-form-input"
//           />
//         </div>

//         <textarea
//           name="notes"
//           placeholder="Additional notes"
//           value={formData.notes}
//           onChange={handleChange}
//           className="progress-form-textarea"
//           rows="3"
//         />

//         <button
//           type="submit"
//           disabled={loading}
//           className="progress-form-button"
//         >
//           {loading ? 'Saving...' : 'Update Progress'}
//         </button>
//       </form>

 
//     </div>
//   );
// };

// export default EditProgress;


// src/components/progress/ProgressEdit.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ProgressEdit.css';

import usePageLoader from '../../hooks/usePageLoader';
import { useLoading } from '../../context/GlobalLoadingContext';

const EditProgress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoading } = useLoading(); // Global loading state
  const [formData, setFormData] = useState({
    date: '',
    weight: '',
    bodyMeasurements: { chest: '', waist: '', hips: '' },
    performanceMetrics: { runTime: '', liftingMax: '' },
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  // Fetch data using global loading hook
  const fetchData = async () => {
    try {
      const res = await axios.get(`/progress/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;

      setFormData({
        date: data.date?.slice(0, 10) || '',
        weight: data.weight || '',
        bodyMeasurements: {
          chest: data.bodyMeasurements?.chest || '',
          waist: data.bodyMeasurements?.waist || '',
          hips: data.bodyMeasurements?.hips || ''
        },
        performanceMetrics: {
          runTime: data.performanceMetrics?.runTime || '',
          liftingMax: data.performanceMetrics?.liftingMax || ''
        },
        notes: data.notes || ''
      });
    } catch (err) {
      toast.error('Error loading progress');
      console.error('Fetch error:', err);
    }
  };

  usePageLoader(fetchData); // Triggers loading state and runs fetchData

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (['chest', 'waist', 'hips'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        bodyMeasurements: { ...prev.bodyMeasurements, [name]: value }
      }));
    } else if (['runTime', 'liftingMax'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        performanceMetrics: { ...prev.performanceMetrics, [name]: value }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`/progress/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Progress updated successfully!');
      setTimeout(() => navigate('/progress'), 800);
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="loader-container" />; // <-- Lottie loader will show here

  // return (
  //   <div className="progress-form-container">
  //     <h2>Edit Progress</h2>

  //     <form onSubmit={handleSubmit} className="progress-form-grid">
  //       <input
  //         type="date"
  //         name="date"
  //         value={formData.date}
  //         onChange={handleChange}
  //         required
  //         className="progress-form-input"
  //       />

  //       <input
  //         type="number"
  //         name="weight"
  //         placeholder="Weight (kg)"
  //         value={formData.weight}
  //         onChange={handleChange}
  //         className="progress-form-input"
  //       />

  //       <div className="progress-form-grid progress-form-grid-3">
  //         <input
  //           type="number"
  //           name="chest"
  //           placeholder="Chest (cm)"
  //           value={formData.bodyMeasurements.chest}
  //           onChange={handleChange}
  //           className="progress-form-input"
  //         />
  //         <input
  //           type="number"
  //           name="waist"
  //           placeholder="Waist (cm)"
  //           value={formData.bodyMeasurements.waist}
  //           onChange={handleChange}
  //           className="progress-form-input"
  //         />
  //         <input
  //           type="number"
  //           name="hips"
  //           placeholder="Hips (cm)"
  //           value={formData.bodyMeasurements.hips}
  //           onChange={handleChange}
  //           className="progress-form-input"
  //         />
  //       </div>

  //       <div className="progress-form-grid progress-form-grid-2">
  //         <input
  //           type="number"
  //           name="runTime"
  //           placeholder="Run Time (s)"
  //           value={formData.performanceMetrics.runTime}
  //           onChange={handleChange}
  //           className="progress-form-input"
  //         />
  //         <input
  //           type="number"
  //           name="liftingMax"
  //           placeholder="Lifting Max (kg)"
  //           value={formData.performanceMetrics.liftingMax}
  //           onChange={handleChange}
  //           className="progress-form-input"
  //         />
  //       </div>

  //       <textarea
  //         name="notes"
  //         placeholder="Additional notes"
  //         value={formData.notes}
  //         onChange={handleChange}
  //         className="progress-form-textarea"
  //         rows="3"
  //       />

  //       <button
  //         type="submit"
  //         disabled={loading}
  //         className="progress-form-button"
  //       >
  //         {loading ? 'Saving...' : 'Update Progress'}
  //       </button>
  //     </form>
  //   </div>
  // );


return (
  <div className="progress-form-container">
    <h2>Edit Progress</h2>

    <form onSubmit={handleSubmit} className="progress-form-grid">
      
      {/* Date and Weight in same row with labels */}
      <div className="progress-form-grid progress-form-grid-2">
        <div className="form-field">
          <label className="form-label">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="progress-form-input"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Weight (kg)</label>
          <input
            type="number"
            name="weight"
            placeholder="Weight (kg)"
            value={formData.weight}
            onChange={handleChange}
            className="progress-form-input"
          />
        </div>
      </div>

      {/* Body Measurements - 3 fields in one row */}
      <div className="progress-form-grid progress-form-grid-3">
        <div className="form-field">
          <label className="form-label">Chest (cm)</label>
          <input
            type="number"
            name="chest"
            placeholder="Chest (cm)"
            value={formData.bodyMeasurements.chest}
            onChange={handleChange}
            className="progress-form-input"
          />
        </div>
        
        <div className="form-field">
          <label className="form-label">Waist (cm)</label>
          <input
            type="number"
            name="waist"
            placeholder="Waist (cm)"
            value={formData.bodyMeasurements.waist}
            onChange={handleChange}
            className="progress-form-input"
          />
        </div>
        
        <div className="form-field">
          <label className="form-label">Hips (cm)</label>
          <input
            type="number"
            name="hips"
            placeholder="Hips (cm)"
            value={formData.bodyMeasurements.hips}
            onChange={handleChange}
            className="progress-form-input"
          />
        </div>
      </div>

      {/* Performance Metrics - 2 fields in one row */}
      <div className="progress-form-grid progress-form-grid-2">
        <div className="form-field">
          <label className="form-label">Run Time (seconds)</label>
          <input
            type="number"
            name="runTime"
            placeholder="Run Time (s)"
            value={formData.performanceMetrics.runTime}
            onChange={handleChange}
            className="progress-form-input"
          />
        </div>
        
        <div className="form-field">
          <label className="form-label">Lifting Max (kg)</label>
          <input
            type="number"
            name="liftingMax"
            placeholder="Lifting Max (kg)"
            value={formData.performanceMetrics.liftingMax}
            onChange={handleChange}
            className="progress-form-input"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="form-field">
        <label className="form-label">Additional Notes</label>
        <textarea
          name="notes"
          placeholder="Additional notes"
          value={formData.notes}
          onChange={handleChange}
          className="progress-form-textarea"
          rows="3"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="progress-form-button"
      >
        {loading ? 'Saving...' : 'Update Progress'}
      </button>
    </form>
  </div>
);

  
};

export default EditProgress;

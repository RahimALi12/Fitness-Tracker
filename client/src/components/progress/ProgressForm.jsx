import { useState, useEffect } from 'react';
import axios from '../../utils/axios';
// import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import './ProgressForm.css';

import { toast } from 'react-toastify';


const ProgressForm = () => {
  
useEffect(() => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const dd = String(today.getDate()).padStart(2, '0');
  const formattedToday = `${yyyy}-${mm}-${dd}`;
  
  setFormData((prev) => ({ ...prev, date: formattedToday }));
}, []);

    
  const [formData, setFormData] = useState({
    date: '',
    weight: '',
    bodyMeasurements: { chest: '', waist: '', hips: '' },
    performanceMetrics: { runTime: '', liftingMax: '' },
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  const resetForm = () => {
    setFormData({
      date: '',
      weight: '',
      bodyMeasurements: { chest: '', waist: '', hips: '' },
      performanceMetrics: { runTime: '', liftingMax: '' },
      notes: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (['chest', 'waist', 'hips'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        bodyMeasurements: { ...prev.bodyMeasurements, [name]: value }
      }));
    } else if (['runTime', 'liftingMax'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        performanceMetrics: { ...prev.performanceMetrics, [name]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  if (
    !formData.date ||
    !formData.weight ||
    !formData.bodyMeasurements.chest ||
    !formData.bodyMeasurements.waist ||
    !formData.bodyMeasurements.hips ||
    !formData.performanceMetrics.runTime ||
    !formData.performanceMetrics.liftingMax
  ) {
    toast.error('Please fill in all required fields!');
    return;
  }

  setLoading(true);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  try {
    const response = await axios.post('/progress', formData, config);

    if (response?.status === 201 || response?.status === 200) {
       toast.success('Progress added successfully!');
      resetForm();
      navigate('/progress'); 
    } else {
      toast.error('Unexpected response from server.');
    }
  } catch (error) {
    console.error('Error saving progress:', error);
    toast.error('Failed to add progress. Please try again.');
  } finally {
    setLoading(false);
  }
};


//   return (
//     <>



// <div className="min-h-screen bg-gradient-to-tr from-slate-100 via-blue-50 to-white py-12 px-4">
// <form onSubmit={handleSubmit} className="progress-form-container">
//   <h2>Add Progress</h2>
//  <div className="progress-form-grid progress-form-grid-1">
//   <input
//     type="date"
//     name="date"
//     value={formData.date}
//     onChange={handleChange}
//     required
//     className="progress-form-input"
//   />
 
//   <input
//     type="number"
//     name="weight"
//     placeholder="Weight (kg)"
//     value={formData.weight}
//     onChange={handleChange}
//     className="progress-form-input"
//   />
//    </div>
//     <div className="progress-form-grid progress-form-grid-3">
//     <input
//       type="number"
//       name="chest"
//       placeholder="Chest (cm)"
//       value={formData.bodyMeasurements.chest}
//       onChange={handleChange}
//       className="progress-form-input"
//     />
  
//     <input
//       type="number"
//       name="waist"
//       placeholder="Waist (cm)"
//       value={formData.bodyMeasurements.waist}
//       onChange={handleChange}
//       className="progress-form-input"
//     />
    
//     <input
//       type="number"
//       name="hips"
//       placeholder="Hips (cm)"
//       value={formData.bodyMeasurements.hips}
//       onChange={handleChange}
//       className="progress-form-input"
//     />
//  </div>

//   <div className="progress-form-grid progress-form-grid-2">
//     <input
//       type="number"
//       name="runTime"
//       placeholder="Run Time (s)"
//       value={formData.performanceMetrics.runTime}
//       onChange={handleChange}
//       className="progress-form-input"
//     />
//     <input
//       type="number"
//       name="liftingMax"
//       placeholder="Lifting Max (kg)"
//       value={formData.performanceMetrics.liftingMax}
//       onChange={handleChange}
//       className="progress-form-input"
//     />
//   </div>
//  <div className="progress-form-grid">
//   <textarea
//     name="notes"
//     placeholder="Additional notes"
//     value={formData.notes}
//     onChange={handleChange}
//     rows="3"
//     className="progress-form-textarea"
//   />
// </div>
//     <button
//       type="submit"
//       disabled={loading}
//       className="progress-form-button"
//     >
//       {loading ? 'Saving...' : 'Add Progress'}
//     </button>
// </form>
// </div>
//     </>
//   );





 return (
    <div className="progress-form-container">
      <h2>Add Progress</h2>

      <form onSubmit={handleSubmit} className="progress-form-grid">
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="progress-form-input"
        />

        <input
          type="number"
          name="weight"
          placeholder="Weight (kg)"
          value={formData.weight}
          onChange={handleChange}
          className="progress-form-input"
        />

        <div className="progress-form-grid progress-form-grid-3">
          <input
            type="number"
            name="chest"
            placeholder="Chest (cm)"
            value={formData.bodyMeasurements.chest}
            onChange={handleChange}
            className="progress-form-input"
          />
          <input
            type="number"
            name="waist"
            placeholder="Waist (cm)"
            value={formData.bodyMeasurements.waist}
            onChange={handleChange}
            className="progress-form-input"
          />
          <input
            type="number"
            name="hips"
            placeholder="Hips (cm)"
            value={formData.bodyMeasurements.hips}
            onChange={handleChange}
            className="progress-form-input"
          />
        </div>

        <div className="progress-form-grid progress-form-grid-2">
          <input
            type="number"
            name="runTime"
            placeholder="Run Time (s)"
            value={formData.performanceMetrics.runTime}
            onChange={handleChange}
            className="progress-form-input"
          />
          <input
            type="number"
            name="liftingMax"
            placeholder="Lifting Max (kg)"
            value={formData.performanceMetrics.liftingMax}
            onChange={handleChange}
            className="progress-form-input"
          />
        </div>

        <textarea
          name="notes"
          placeholder="Additional notes"
          value={formData.notes}
          onChange={handleChange}
          className="progress-form-textarea"
          rows="3"
        />

        <button
          type="submit"
          disabled={loading}
          className="progress-form-button"
        >
          {loading ? 'Saving...' : 'Add Progress'}
        </button>
      </form>

 
    </div>
  );




};

export default ProgressForm;

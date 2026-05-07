// import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// import axios from '../../utils/axios';
// import { useNavigate, useParams } from 'react-router-dom';
// import { toast } from 'react-toastify';


// const WorkoutForm = () => {

//   const { id } = useParams();
//   const isEdit = !!id;
//   const navigate = useNavigate();

//   const [date, setDate] = useState('');
//   const [title, setTitle] = useState('');
//   const [category, setCategory] = useState('strength');
//   const [tags, setTags] = useState('');
//   const [exercises, setExercises] = useState([
//     { name: '', sets: '', reps: '', weight: '', notes: '' },
//   ]);

//   useEffect(() => {
//     if (isEdit) {
//       const fetchWorkout = async () => {
//         try {
//           const token = localStorage.getItem('token');
//           const config = { headers: { Authorization: `Bearer ${token}` } };
//           const res = await axios.get(`/api/workouts/${id}`, config);
//           const data = res.data;
//           setDate(data.date);
//           setTitle(data.title);
//           setCategory(data.category);
//           setTags(data.tags.join(', '));
//           setExercises(
//             data.exercises.length
//               ? data.exercises
//               : [{ name: '', sets: '', reps: '', weight: '', notes: '' }]
//           );
//         } catch (error) {
//           console.error('Error fetching workout:', error);
//         }
//       };
//       fetchWorkout();
//     }
//   }, [id, isEdit]);

//   const handleExerciseChange = (index, field, value) => {
//     const updated = [...exercises];
//     updated[index][field] = value;
//     setExercises(updated);
//   };

//   const addExercise = () => {
//     setExercises([...exercises, { name: '', sets: '', reps: '', weight: '', notes: '' }]);
//   };

//   const removeExercise = (index) => {
//     const updated = exercises.filter((_, i) => i !== index);
//     setExercises(updated);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Prepare data
//     const workoutData = {
//       date,
//       title,
//       category,
//       tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
//       exercises: exercises.map((ex) => ({
//         name: ex.name,
//         sets: Number(ex.sets),
//         reps: Number(ex.reps),
//         weight: ex.weight ? Number(ex.weight) : null,
//         notes: ex.notes,
//       })),
//     };

// try {
//   const token = localStorage.getItem('token');
//   const config = { headers: { Authorization: `Bearer ${token}` } };

//   if (isEdit) {
//     await axios.put(`/workouts/${id}`, workoutData, config);
//     toast.success('Workout updated successfully!');
//   } else {
//     await axios.post('/workouts', workoutData, config);
//     toast.success('Workout created successfully!');
//   }

//   navigate('/workouts');
// } catch (error) {
//   console.error('Error saving workout:', error);
//   toast.error('Failed to save workout. Please try again.');
// }

//   };

//   return (
//     <div style={{ padding: '1rem' }}>
//       <h2>{isEdit ? 'Edit Workout' : 'Add New Workout'}</h2>

//  <form onSubmit={handleSubmit}>
//         <input
//           type="date"
//           name="date"
//           value={date}
//            onChange={(e) => setDate(e.target.value)}
//           required
//           className="progress-form-input"
//         />


   
//         <div>
//           <label>Title:</label><br />
//           <input
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             required
//           />
//         </div>

//         <div>
//           <label>Category:</label><br />
//           <select value={category} onChange={(e) => setCategory(e.target.value)}>
//             <option value="strength">Strength</option>
//             <option value="cardio">Cardio</option>
//             <option value="flexibility">Flexibility</option>
//             <option value="balance">Balance</option>
//           </select>
//         </div>

//         <div>
//           <label>Tags (comma separated):</label><br />
//           <input
//             type="text"
//             value={tags}
//             onChange={(e) => setTags(e.target.value)}
//           />
//         </div>

//         <h3>Exercises:</h3>

//         {exercises.map((ex, index) => (
//           <div
//             key={index}
//             style={{
//               border: '1px solid #ccc',
//               padding: '10px',
//               marginBottom: '10px',
//             }}
//           >
//             <label>Name:</label><br />
//             <input
//               type="text"
//               value={ex.name}
//               onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
//               required
//             /><br />

//             <label>Sets:</label><br />
//             <input
//               type="number"
//               value={ex.sets}
//               onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
//               required
//               min={1}
//             /><br />

//             <label>Reps:</label><br />
//             <input
//               type="number"
//               value={ex.reps}
//               onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
//               required
//               min={1}
//             /><br />

//             <label>Weight (optional):</label><br />
//             <input
//               type="number"
//               value={ex.weight}
//               onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
//               min={0}
//             /><br />

//             <label>Notes (optional):</label><br />
//             <input
//               type="text"
//               value={ex.notes}
//               onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
//             /><br />

//             {exercises.length > 1 && (
//               <button type="button" onClick={() => removeExercise(index)}>
//                 Remove Exercise
//               </button>
//             )}
//           </div>
//         ))}

//         <button type="button" onClick={addExercise}>Add Exercise</button><br /><br />

//         <button type="submit">{isEdit ? 'Update Workout' : 'Create Workout'}</button>
//       </form>
//     </div>
//   );
// };

// export default WorkoutForm;



import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import './WorkoutForm.css';

const WorkoutForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('strength');
  const [tags, setTags] = useState('');
  const [exercises, setExercises] = useState([
    { name: '', sets: '', reps: '', weight: '', notes: '' },
  ]);




  useEffect(() => {
  // Set today's date for new workouts
  if (!isEdit) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yyyy}-${mm}-${dd}`;
    setDate(formattedToday);
  }
  // Existing edit logic
  if (isEdit) {
    const fetchWorkout = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`/api/workouts/${id}`, config);
        const data = res.data;
        setDate(data.date);
        setTitle(data.title);
        setCategory(data.category);
        setTags(data.tags.join(', '));
        setExercises(
          data.exercises.length
            ? data.exercises
            : [{ name: '', sets: '', reps: '', weight: '', notes: '' }]
        );
      } catch (error) {
        console.error('Error fetching workout:', error);
      }
    };
    fetchWorkout();
  }
}, [id, isEdit]);

  const handleExerciseChange = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: '', reps: '', weight: '', notes: '' }]);
  };

  const removeExercise = (index) => {
    const updated = exercises.filter((_, i) => i !== index);
    setExercises(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const workoutData = {
      date,
      title,
      category,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      exercises: exercises.map((ex) => ({
        name: ex.name,
        sets: Number(ex.sets),
        reps: Number(ex.reps),
        weight: ex.weight ? Number(ex.weight) : null,
        notes: ex.notes,
      })),
    };

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (isEdit) {
        await axios.put(`/workouts/${id}`, workoutData, config);
        toast.success('Workout updated successfully!');
      } else {
        await axios.post('/workouts', workoutData, config);
        toast.success('Workout created successfully!');
      }

      navigate('/workouts');
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout. Please try again.');
    }
  };

 
return (
  <div className="progress-form-container">
    <h2>{isEdit ? 'Edit Workout' : 'Add Workout'}</h2>

    <form onSubmit={handleSubmit} className="progress-form-grid">
      
      {/* Date and Title in same row */}
      <div className="progress-form-grid progress-form-grid-2">
        <input
          type="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="progress-form-input"
        />

        <input
          type="text"
          name="title"
          placeholder="Workout Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="progress-form-input"
        />
      </div>

      {/* Category and Tags in same row */}
      <div className="progress-form-grid progress-form-grid-2">
        <select 
          name="category"
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="progress-form-input"
        >
          <option value="strength">Strength</option>
          <option value="cardio">Cardio</option>
          <option value="flexibility">Flexibility</option>
          <option value="balance">Balance</option>
        </select>

        <input
          type="text"
          name="tags"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="progress-form-input"
        />
      </div>

      <div className="exercises-section">
        <h3>Exercises:</h3>
        
        {exercises.map((ex, index) => (
          <div key={index} className="exercise-card">
            <div className="progress-form-grid progress-form-grid-2">
              <input
                type="text"
                placeholder="Exercise Name"
                value={ex.name}
                onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                required
                className="progress-form-input"
              />
              
              <input
                type="number"
                placeholder="Sets"
                value={ex.sets}
                onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                required
                min={1}
                className="progress-form-input"
              />
            </div>

            <div className="progress-form-grid progress-form-grid-2">
              <input
                type="number"
                placeholder="Reps"
                value={ex.reps}
                onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                required
                min={1}
                className="progress-form-input"
              />
              
              <input
                type="number"
                placeholder="Weight (kg) Optional"
                value={ex.weight}
                onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                min={0}
                className="progress-form-input"
              />
            </div>
<br />
            <textarea
              placeholder="Notes (Optional)"
              value={ex.notes}
              onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
              className="progress-form-textarea"
              rows="2"
            />

            {exercises.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeExercise(index)}
                className="remove-exercise-btn"
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
        className="add-exercise-btn"
      >
        Add Exercise
      </button>

      <button 
        type="submit"
        className="progress-form-button"
      >
        {isEdit ? 'Update Workout' : 'Create Workout'}
      </button>
    </form>
  </div>
);


};

export default WorkoutForm;
import React, { useState, useEffect } from 'react';
import NutritionList from './NutritionList';
import NutritionChart from './NutritionChart';
import { useLoading } from '../../context/GlobalLoadingContext';


// import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import './NutritionMain.css'; 

const NutritionMain = () => {
    const { setIsLoading } = useLoading();
  

    const [activeTab, setActiveTab] = useState('list');
    const [nutritionList, setNutritionList] = useState([]);
    // const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

      const fetchNutrition = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/nutrition', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNutritionList(res.data);
    } catch (err) {
      console.error('Error fetching progress:', err);
    } finally {
      setIsLoading(false);
    }
  };


// const deleteProgress = async (id) => {
//   const toastId = toast(
//     () => (
//       <div className="custom-toast-confirmation">
//         <h3 className="toast-title">Fitness Tracker</h3>
//         <p className="toast-message">Are you sure you want to delete this progress entry?</p>
//         <div className="toast-buttons">
//           <button
//             className="btn btn-delete"
//             onClick={async () => {
//               try {
//                 await axios.delete(`/progress/${id}`, {
//                   headers: { Authorization: `Bearer ${token}` }
//                 });
//                 await fetchProgress();
//                 toast.success('Progress deleted successfully!');
//               } catch (err) {
//                 console.error('Error deleting progress:', err);
//                 toast.error('Failed to delete progress.');
//               } finally {
//                 toast.dismiss(toastId);
//               }
//             }}
//           >
//             Yes, Delete
//           </button>

//           <button
//             className="btn btn-cancel"
//             onClick={() => toast.dismiss(toastId)}
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     ),
//     {
//       closeButton: false,
//       autoClose: false,
//       position: "top-center",
//       className: 'toast-confirmation-wrapper',
//     }
//   );
// };

    useEffect(() => {
      fetchNutrition();
    }, []);

  // return (
  //   <div className="nutrition-wrapper">

  //  <div className="tabs-container">
  //         <button
  //           className={`tab-btn ${activeTab === 'list' ? 'active' : 'inactive'}`}
  //           onClick={() => setActiveTab('list')}
  //         >
  //           All Nutrition
  //         </button>
  //         <button
  //           className={`tab-btn ${activeTab === 'chart' ? 'active' : 'inactive'}`}
  //           onClick={() => setActiveTab('chart')}
  //         >
  //          Nutrition Chart
  //         </button>
  //       </div>

  //     <div className="nutrition-content">
  //       {view === 'list' ? <NutritionList /> : <NutritionChart />}
  //     </div>
  //   </div>
  // );
    return (
    <div className="mt-10 px-4">
      {nutritionList.length > 0 && (
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'list' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('list')}
          >
              All Nutrition
          </button>
          <button
            className={`tab-btn ${activeTab === 'chart' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('chart')}
          >
            Nutrition Chart
          </button>
        </div>
      )}

      {activeTab === 'list' ? (
        <NutritionList
          nutritionList={nutritionList}
        />
      ) : (
        <NutritionChart data={nutritionList} />
      )}
    </div>
  );
};

export default NutritionMain;

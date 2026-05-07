import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import ProgressList from './ProgressList';
import ProgressChart from './ProgressChart';
import './ProgressMain.css'; 

import { useLoading } from '../../context/GlobalLoadingContext';

const ProgressMain = () => {
  const { setIsLoading } = useLoading();


  const [activeTab, setActiveTab] = useState('list');
  const [progressList, setProgressList] = useState([]);
  // const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchProgress = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgressList(res.data);
    } catch (err) {
      console.error('Error fetching progress:', err);
    } finally {
      setIsLoading(false);
    }
  };



const deleteProgress = async (id) => {
  const toastId = toast(
    () => (
      <div className="custom-toast-confirmation">
        <h3 className="toast-title">Fitness Tracker</h3>
        {/* <h4 className="toast-subtitle">Confirm Deletion</h4> */}
        <p className="toast-message">Are you sure you want to delete this progress entry?</p>
        <div className="toast-buttons">
          <button
            className="btn btn-delete"
            onClick={async () => {
              try {
                await axios.delete(`/progress/${id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                await fetchProgress();
                toast.success('Progress deleted successfully!');
              } catch (err) {
                console.error('Error deleting progress:', err);
                toast.error('Failed to delete progress.');
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
    fetchProgress();
  }, []);



  return (
    <div className="mt-10 px-4">
      {progressList.length > 0 && (
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'list' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('list')}
          >
            All Progress
          </button>
          <button
            className={`tab-btn ${activeTab === 'chart' ? 'active' : 'inactive'}`}
            onClick={() => setActiveTab('chart')}
          >
            Progress Chart
          </button>
        </div>
      )}

      {activeTab === 'list' ? (
        <ProgressList
          progressList={progressList}
          deleteProgress={deleteProgress}
        />
      ) : (
        <ProgressChart data={progressList} />
      )}
    </div>
  );
};

export default ProgressMain;

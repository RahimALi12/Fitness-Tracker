import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LoadingProvider, useLoading } from './context/GlobalLoadingContext';
import GlobalLoader from './components/GlobalLoader';
import './components/GlobalLoader.css';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import WorkoutEdit from './components/workouts/WorkoutEdit';
import WorkoutList from './components/workouts/WorkoutList';
import WorkoutDetail from './components/workouts/WorkoutDetail';
import WorkoutForm from './components/workouts/WorkoutForm';

// import ProgressList from './components/progress/ProgressList';
import ProgressForm from './components/progress/ProgressForm';
import ProgressEdit from './components/progress/ProgressEdit';
import ProgressMain from './components/progress/ProgressMain';
import WorkoutMain from './components/workouts/WorkoutMain';
import NutritionEdit from './components/nutritions/NutritionEdit';
import FloatingChatbot from './components/FloatingChatbot';
// import NutritionMain from './components/nutritions/NutritionMain';
// import NutritionList from './components/nutritions/NutritionList';
import NutritionMain from './components/nutritions/NutritionMain';
// import NutritionList from './components/nutritions/NutritionList';
// import ProgressItem from './components/progress/ProgressItem';

function AppWrapper() {
  return (
    <LoadingProvider>
      <App />
    </LoadingProvider>
  );
}


function App() {
  const { isLoading } = useLoading();
        

  return (
    
    <>
   
      {isLoading && <GlobalLoader />}
    
      <Navbar />
      <Routes>


    <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />



        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/nutrition"
          element={
            <ProtectedRoute>
              <NutritionMain />
            </ProtectedRoute>
          }
        />

      <Route
  path="/nutrition/edit/:id"
  element={
    <ProtectedRoute>
      <NutritionEdit />
    </ProtectedRoute>
  }
/>
    
            
        <Route path="*" element={<Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
  path="/workouts"
  element={
    <ProtectedRoute>
      <WorkoutMain />
    </ProtectedRoute>
  }
/>

<Route
  path="/workouts/new"
  element={
    <ProtectedRoute>
      <WorkoutForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/workouts/edit/:id"
  element={
    <ProtectedRoute>
      <WorkoutEdit />
    </ProtectedRoute>
  }
/>

<Route
  path="/workouts/:id"
  element={
    <ProtectedRoute>
      <WorkoutDetail />
    </ProtectedRoute>
  }
/>

{/* 📊 Progress Routes */}
<Route
  path="/progress"
  element={
    <ProtectedRoute>
      <ProgressMain />
    </ProtectedRoute>
  }
/>

<Route
  path="/progress/new"
  element={
    <ProtectedRoute>
      <ProgressForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/progress/edit/:id"
  element={
    <ProtectedRoute>
      <ProgressEdit />
    </ProtectedRoute>
  }
/>

{/* <Route
  path="/progress/:id"
  element={
    <ProtectedRoute>
      <ProgressItem />
    </ProtectedRoute>
  }
/> */}

  
      </Routes>
          <ToastContainer
      position="top-center"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored" 
    />
    <FloatingChatbot />
    </>
  );
}

export default AppWrapper;

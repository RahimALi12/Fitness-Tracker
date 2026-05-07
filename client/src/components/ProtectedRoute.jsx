import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); // ✅ loading bhi lelo
  const location = useLocation();

  if (loading) {
    // 🔄 Wait while AuthContext checks token/user
    return <div>Loading...</div>;
  }

  if (!user) {
    // ❌ If no user after loading, redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children; // ✅ All good, render page
};

export default ProtectedRoute;

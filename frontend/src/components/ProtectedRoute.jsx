import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../AppContext';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('cloudcart_token') || useContext(AppContext).token;

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

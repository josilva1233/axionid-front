import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserDetail from './pages/UserDetail';
import ForgotPassword from './pages/ForgotPassword';
import Onboarding from './pages/Onboarding';
import CompleteProfile from './pages/CompleteProfile';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('@AxionID:token');
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/dashboard/user/:id" element={<PrivateRoute><UserDetail /></PrivateRoute>} />
        <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
        <Route path="/complete-profile" element={<PrivateRoute><CompleteProfile /></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}
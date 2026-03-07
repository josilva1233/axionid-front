import React from 'react'; // Adicione esta linhad
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("@AxionID:token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};
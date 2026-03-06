import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("@AxionID:token");

  // Se não houver token, redireciona para o login na raiz
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

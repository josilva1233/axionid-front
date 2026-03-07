import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('@AxionID:token');

  // Se não houver token, redireciona para o login na raizww
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Se houver token, renderiza a página (Dashboard)
  return children;
};
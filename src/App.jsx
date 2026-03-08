import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
// REMOVIDO: import UserDetail from './pages/UserDetail'; 
import ForgotPassword from './pages/ForgotPassword'; 
import { ProtectedRoute } from './components/ProtectedRoute'; 
import CompleteProfile from './pages/CompleteProfile';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rota de Completar Perfil */}
        <Route 
          path="/complete-profile" 
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          } 
        />

        {/* Dashboard Protegido (Agora o UserDetail vive aqui dentro) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* ROTA REMOVIDA: /dashboard/user/:id não é mais necessária */}

        {/* Fallback Global */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
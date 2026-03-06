import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserDetail from './pages/UserDetail';
import MyProfile from './pages/UserDropdown'; // <-- ADICIONADO
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

        {/* Rotas Protegidas (Exigem Login) */}
        <Route 
          path="/complete-profile" 
          element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} 
        />

        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
        />

        {/* Nova Rota: Meu Perfil */}
        <Route 
          path="/profile" 
          element={<ProtectedRoute><MyProfile /></ProtectedRoute>} 
        />

        <Route 
          path="/dashboard/user/:id" 
          element={<ProtectedRoute><UserDetail /></ProtectedRoute>} 
        />

        {/* Fallback Global */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
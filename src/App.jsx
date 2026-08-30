// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword'; 
import { ProtectedRoute } from './components/ProtectedRoute'; 
import CompleteProfile from './pages/CompleteProfile';
import TermsCheck from './components/TermsCheck';
import TermManagement from './pages/TermManagement';
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

        {/* Rota de Verificação de Termos */}
        <Route 
          path="/terms-check" 
          element={
            <ProtectedRoute>
              <TermsCheck>
                <Navigate to="/dashboard" replace />
              </TermsCheck>
            </ProtectedRoute>
          } 
        />

        {/* Rota de Completar Perfil */}
        <Route 
          path="/complete-profile" 
          element={
            <ProtectedRoute>
              <TermsCheck>
                <CompleteProfile />
              </TermsCheck>
            </ProtectedRoute>
          } 
        />

        {/* Dashboard Protegido */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <TermsCheck>
                <Dashboard />
              </TermsCheck>
            </ProtectedRoute>
          } 
        />

        {/* Fallback Global */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
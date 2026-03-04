import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserDetail from './pages/UserDetail';
import ForgotPassword from './pages/ForgotPassword'; // <-- 1. IMPORTAR O NOVO COMPONENTE
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
        
        {/* 2. ADICIONAR ROTA DE RECUPERAÇÃO DE SENHA */}
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

        {/* Dashboard Protegido */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Detalhes do Usuário */}
        <Route 
          path="/dashboard/user/:id" 
          element={
            <ProtectedRoute>
              <UserDetail />
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
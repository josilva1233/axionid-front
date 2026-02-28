import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { ProtectedRoute } from './components/ProtectedRoute'; 
import CompleteProfile from './pages/CompleteProfile';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Rotas Públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 2. Rota de Completar Perfil
            DICA: Se o usuário estiver sendo expulso para o login, 
            remova temporariamente o <ProtectedRoute> desta rota para testar.
        */}
        <Route 
          path="/complete-profile" 
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          } 
        />

        {/* 3. Dashboard Protegido */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* 4. Redirecionamento Global (Sempre por último) 
            Ele captura qualquer URL não definida acima.
        */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserDetail from './pages/UserDetail';
import { ProtectedRoute } from './components/ProtectedRoute'; 
import CompleteProfile from './pages/CompleteProfile';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ESTA É A CORREÇÃO: O Laravel redireciona para /login. 
          Se não houver essa rota exata, o React limpa os parâmetros da URL.
        */}
        <Route path="/login" element={<Login />} />

        {/* Rotas Públicas Adicionais */}
        <Route path="/register" element={<Register />} />
        
        {/* Redireciona a raiz para o login. 
          Assim, se o usuário acessar apenas 'domain.com', ele cai no login.
        */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rota de Completar Perfil 
          Middleware auth:sanctum no Laravel exige que o token já esteja no Header
        */}
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
{/* NOVA ROTA DE DETALHES */}
        <Route 
          path="/dashboard/user/:id" 
          element={
            <ProtectedRoute>
              <UserDetail />
            </ProtectedRoute>
          } 
        />
        {/* Fallback Global: 
          Qualquer rota digitada errada agora joga para /login sem perder o estado.
        */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
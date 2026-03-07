import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

// Importando os componentes padronizados
import Sidebar from '../components/dashboard/Sidebar';
import UserDropdown from '../components/dashboard/UserDropdown';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [role] = useState(localStorage.getItem('@AxionID:role'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, userRes] = await Promise.all([
          api.get('/api/v1/me'),
          api.get(`/api/v1/users/${id}`)
        ]);
        setCurrentUser(profileRes.data);
        setUser(userRes.data.data);
      } catch (err) {
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleLogout = async () => {
    try { await api.post('/api/v1/logout'); } 
    finally { localStorage.clear(); navigate('/login'); }
  };

  if (loading) return <div className="loading-state">Carregando...</div>;

  return (
    // Esta classe "dashboard-layout" deve ter display: flex no seu CSS
    <div className="dashboard-layout animate-in">
      
      <Sidebar 
        activeTab="users" 
        setActiveTab={() => navigate('/dashboard')} 
        role={role} 
        onLogout={handleLogout} 
      />

      {/* O main-wrapper garante que o conteúdo não fique embaixo da sidebar */}
      <div className="main-wrapper">
        <header className="main-header">
          <div className="d-flex align-items-center gap-3">
             <button className="btn-back" onClick={() => navigate('/dashboard')}>
               ←
             </button>
             <h2 className="brand mb-0">Detalhes do Usuário</h2>
          </div>
          
          {currentUser && (
            <UserDropdown user={currentUser} onLogout={handleLogout} />
          )}
        </header>

        <main className="content-area p-4">
          <div className="content-card detail-main-card">
            
            {/* Cabeçalho do Perfil (Avatar + Nome) */}
            <div className="profile-info-section mb-4">
              <div className="avatar-display">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="profile-name-data">
                <h3>{user.name}</h3>
                <span className="badge-role">{user.is_admin ? 'Admin' : 'Operacional'}</span>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-box">
                <label>E-MAIL CORPORATIVO</label>
                <p>{user.email}</p>
              </div>

              <div className="info-box">
                <label>DOCUMENTO</label>
                <p>{user.cpf_cnpj || 'Não informado'}</p>
              </div>

              <div className="info-box">
                <label>STATUS DE VALIDAÇÃO</label>
                <p className={user.profile_completed ? 'text-success' : 'text-warning'}>
                   {user.profile_completed ? '✓ Perfil Completo' : '⚠ Cadastro Pendente'}
                </p>
              </div>
            </div>

            {/* Ações (Estilizadas como no Dashboard) */}
            <div className="actions-footer mt-5 pt-4 border-top border-secondary border-opacity-10">
               <button 
                 onClick={() => {/* lógica de status */}} 
                 className="btn-primary"
               >
                 {user.is_active ? 'Suspender Usuário' : 'Ativar Usuário'}
               </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
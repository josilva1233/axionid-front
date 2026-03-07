import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

// Importando os componentes padronizados do Dashboard
import Sidebar from '../components/dashboard/Sidebar';
import UserDropdown from '../components/dashboard/UserDropdown';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Estados para o usuário detalhado (o que está sendo editado)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Estados para o usuário logado (o que aparece no Header/Sidebar)
  const [currentUser, setCurrentUser] = useState(null);
  const [role] = useState(localStorage.getItem('@AxionID:role'));

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Carrega perfil do admin logado e os detalhes do usuário alvo em paralelo
      const [profileRes, userRes] = await Promise.all([
        api.get('/api/v1/me'),
        api.get(`/api/v1/users/${id}`)
      ]);
      
      setCurrentUser(profileRes.data);
      setUser(userRes.data.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar informações.");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const res = await api.get(`/api/v1/users/${id}`);
      setUser(res.data.data);
    } catch (err) { console.error(err); }
  };

  // --- Handlers de Ação ---
  const handleLogout = async () => {
    try { await api.post('/api/v1/logout'); } 
    finally { localStorage.clear(); navigate('/login'); }
  };

  const handleDelete = async () => {
    const confirmName = window.prompt(`Para excluir permanentemente "${user.name}", digite o NOME abaixo:`);
    if (confirmName !== user.name) {
      if (confirmName !== null) alert("Nome incorreto.");
      return;
    }
    setActionLoading(true);
    try {
      await api.delete(`/api/v1/users/${id}`);
      alert("Usuário excluído!");
      navigate('/dashboard', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Erro na exclusão.");
    } finally { setActionLoading(false); }
  };

  const handleToggleStatus = async () => {
    if (!window.confirm(`Deseja alterar o status de ${user.name}?`)) return;
    setActionLoading(true);
    try {
      await api.patch(`/api/v1/users/${id}/toggle-status`);
      fetchUserDetails();
    } catch (err) { alert("Erro ao mudar status."); } 
    finally { setActionLoading(false); }
  };

  const handlePromoteAction = async (type) => {
    const endpoint = type === 'promote' ? 'promote' : 'remove-admin';
    if (!window.confirm("Confirmar alteração de privilégios?")) return;
    setActionLoading(true);
    try {
      await api.post(`/api/v1/users/${id}/${endpoint}`);
      fetchUserDetails();
    } catch (err) { alert("Erro na operação."); } 
    finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <span className="text-primary fw-bold">Carregando detalhes...</span>
    </div>
  );

  return (
    <div className="dashboard-layout animate-in">
      {/* SIDEBAR PADRONIZADA */}
      <Sidebar 
        activeTab="users" 
        setActiveTab={() => navigate('/dashboard')} 
        role={role} 
        onLogout={handleLogout} 
      />

      <div className="main-wrapper">
        {/* HEADER PADRONIZADO */}
        <header className="main-header">
          <h2 className="brand">
            <button className="btn-back me-3" onClick={() => navigate('/dashboard')}>←</button>
            Detalhes do Usuário
          </h2>
          {currentUser && (
            <UserDropdown user={currentUser} onLogout={handleLogout} />
          )}
        </header>

        <main className="content-area p-4">
          <div className="detail-grid">
            
            {/* CARD: PERFIL */}
            <section className="info-card">
              <div className="profile-header">
                <div className="avatar-large">{user.name?.charAt(0)}</div>
                <div>
                  <h3>{user.name}</h3>
                  <span className={`badge ${user.is_admin ? 'success' : 'operacional'}`}>
                    {user.is_admin ? 'Administrador' : 'Operacional'}
                  </span>
                </div>
              </div>

              <div className="info-list">
                <div className="info-item"><label>E-mail Corporativo</label><span>{user.email}</span></div>
                <div className="info-item"><label>Documento</label><span>{user.cpf_cnpj || 'Não informado'}</span></div>
                <div className="info-item">
                  <label>Status de Validação</label>
                  <span className={user.profile_completed ? 'text-success' : 'text-warning'}>
                    {user.profile_completed ? '✓ Perfil Completo' : '⚠ Cadastro Pendente'}
                  </span>
                </div>
              </div>
            </section>

            {/* CARD: ENDEREÇO */}
            <section className="info-card">
              <h4 className="section-title">Endereço de Registro</h4>
              {user.address ? (
                <div className="info-list" style={{marginTop: '20px'}}>
                  <div className="info-item"><label>CEP</label><span>{user.address.zip_code}</span></div>
                  <div className="info-item"><label>Logradouro</label><span>{user.address.street}, {user.address.number}</span></div>
                  <div className="info-item"><label>Bairro</label><span>{user.address.neighborhood}</span></div>
                  <div className="info-item"><label>Localidade</label><span>{user.address.city} - {user.address.state}</span></div>
                </div>
              ) : (
                <div className="empty-state">Nenhum endereço vinculado.</div>
              )}
            </section>

            {/* ZONA DE AÇÕES */}
            <section className="actions-section">
              <h4>Gerenciamento Crítico</h4>
              <div className="actions-group">
                {user.is_admin ? (
                  <button onClick={() => handlePromoteAction('remove')} disabled={actionLoading} className="btn-action btn-suspend">
                    Revogar Admin
                  </button>
                ) : (
                  <button onClick={() => handlePromoteAction('promote')} disabled={actionLoading} className="btn-action btn-promote">
                    Promover a Administrador
                  </button>
                )}

                <button onClick={handleToggleStatus} disabled={actionLoading} className="btn-action btn-suspend">
                  {user.is_active ? 'Suspender Acesso' : 'Reativar Acesso'}
                </button>

                <button onClick={handleDelete} disabled={actionLoading} className="btn-action btn-delete-ghost">
                  {actionLoading ? 'Processando...' : 'Excluir Identidade'}
                </button>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}
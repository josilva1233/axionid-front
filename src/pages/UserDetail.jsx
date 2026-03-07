import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Row, Col } from 'react-bootstrap';
import api from '../services/api';

// Reaproveitando componentes que você já usa no Dashboard
import Sidebar from '../components/dashboard/Sidebar';
import UserDropdown from '../components/dashboard/UserDropdown';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [role] = useState(localStorage.getItem('@AxionID:role'));
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // Para o Header
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Carregar dados do perfil logado (para o Header/Dropdown)
  const loadProfile = useCallback(async () => {
    try {
      const profileRes = await api.get('/api/v1/me');
      setCurrentUser(profileRes.data);
    } catch (err) {
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/users/${id}`);
      setUser(res.data.data);
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadProfile();
    fetchUserDetails();
  }, [loadProfile, fetchUserDetails]);

  // --- Handlers de Ações ---
  const handleLogout = async () => {
    try { await api.post('/api/v1/logout'); }
    finally { localStorage.clear(); navigate('/login'); }
  };

  const handleDelete = async () => {
    const confirmName = window.prompt(`Para excluir permanentemente "${user.name}", digite o NOME dele:`);
    if (confirmName !== user.name) return;

    setActionLoading(true);
    try {
      await api.delete(`/api/v1/users/${id}`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao excluir.");
    } finally { setActionLoading(false); }
  };

  const handleToggleStatus = async () => {
    setActionLoading(true);
    try {
      await api.patch(`/api/v1/users/${id}/toggle-status`);
      fetchUserDetails();
    } catch (err) { alert("Erro ao mudar status."); }
    finally { setActionLoading(false); }
  };

  const handlePromoteDemote = async (action) => {
    const path = action === 'promote' ? 'promote' : 'remove-admin';
    setActionLoading(true);
    try {
      await api.post(`/api/v1/users/${id}/${path}`);
      fetchUserDetails();
    } catch (err) { alert("Erro na operação."); }
    finally { setActionLoading(false); }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout animate-in">
      {/* Sidebar idêntica ao Dashboard */}
      <Sidebar 
        activeTab="users" 
        setActiveTab={() => navigate('/dashboard')} 
        role={role} 
        onLogout={handleLogout} 
      />

      <div className="main-wrapper">
        <header className="main-header">
          <h2 className="brand">
            <button className="btn-back me-3" onClick={() => navigate('/dashboard')} style={{padding: '5px 15px', fontSize: '14px'}}>
              ← Voltar
            </button>
            Detalhes do Usuário
          </h2>

          {currentUser && (
            <UserDropdown user={currentUser} onLogout={handleLogout} />
          )}
        </header>

        <main className="content-area p-4">
          <div className="tab-wrapper">
            
            {actionLoading && (
               <div className="loading-overlay" style={{zIndex: 10, borderRadius: '12px'}}>
                  <div className="spinner"></div>
               </div>
            )}

            <div className="detail-grid">
              <Row className="g-4">
                {/* Coluna da Esquerda: Perfil */}
                <Col lg={6}>
                  <section className="content-card h-100">
                    <div className="profile-header mb-4">
                      <div className="avatar-large">{user.name?.charAt(0)}</div>
                      <div>
                        <h3 className="text-white mb-1">{user.name}</h3>
                        <span className={`badge ${user.is_admin ? 'bg-primary' : 'bg-secondary'}`}>
                          {user.is_admin ? 'Administrador' : 'Operacional'}
                        </span>
                      </div>
                    </div>

                    <div className="info-list">
                      <div className="info-item mb-3">
                        <label className="text-dim small text-uppercase fw-bold">E-mail Corporativo</label>
                        <div className="text-white">{user.email}</div>
                      </div>
                      <div className="info-item mb-3">
                        <label className="text-dim small text-uppercase fw-bold">Documento</label>
                        <div className="text-white">{user.cpf_cnpj || 'Não informado'}</div>
                      </div>
                      <div className="info-item">
                        <label className="text-dim small text-uppercase fw-bold">Status</label>
                        <div className={user.is_active ? 'text-success' : 'text-danger'}>
                          {user.is_active ? '● Ativo no Sistema' : '○ Acesso Suspenso'}
                        </div>
                      </div>
                    </div>
                  </section>
                </Col>

                {/* Coluna da Direita: Endereço */}
                <Col lg={6}>
                  <section className="content-card h-100">
                    <h4 className="text-white mb-4 border-bottom border-secondary pb-2">Endereço de Registro</h4>
                    {user.address ? (
                      <div className="info-list">
                        <div className="info-item mb-2"><label className="text-dim small">CEP:</label> <span className="text-white ms-2">{user.address.zip_code}</span></div>
                        <div className="info-item mb-2"><label className="text-dim small">Rua:</label> <span className="text-white ms-2">{user.address.street}, {user.address.number}</span></div>
                        <div className="info-item mb-2"><label className="text-dim small">Bairro:</label> <span className="text-white ms-2">{user.address.neighborhood}</span></div>
                        <div className="info-item"><label className="text-dim small">Cidade:</label> <span className="text-white ms-2">{user.address.city} - {user.address.state}</span></div>
                      </div>
                    ) : (
                      <div className="text-dim italic">Nenhum endereço vinculado.</div>
                    )}
                  </section>
                </Col>

                {/* Zona de Perigo / Ações */}
                <Col xs={12}>
                  <section className="content-card border-danger border-opacity-25">
                    <h4 className="text-danger mb-3" style={{fontSize: '1.1rem'}}>Gerenciamento Crítico</h4>
                    <div className="d-flex flex-wrap gap-3">
                      {user.is_admin ? (
                        <button onClick={() => handlePromoteDemote('demote')} className="btn-back">Revogar Admin</button>
                      ) : (
                        <button onClick={() => handlePromoteDemote('promote')} className="btn-primary">Promover Admin</button>
                      )}

                      <button onClick={handleToggleStatus} className="btn-back">
                        {user.is_active ? 'Suspender Acesso' : 'Reativar Acesso'}
                      </button>

                      <button onClick={handleDelete} className="btn-back text-danger border-danger border-opacity-25">
                        Excluir Identidade
                      </button>
                    </div>
                  </section>
                </Col>
              </Row>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
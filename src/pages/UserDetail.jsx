import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/users/${id}`); 
      setUser(res.data.data); 
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar detalhes.");
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmName = window.prompt(`Para excluir permanentemente o usuário "${user.name}", digite o NOME dele abaixo:`);
    
    if (confirmName !== user.name) {
      if (confirmName !== null) alert("O nome digitado não confere. Operação cancelada.");
      return;
    }

    setActionLoading(true);
    try {
      await api.delete(`/api/v1/users/${id}`);
      alert("Usuário excluído com sucesso!");
      navigate('/dashboard', { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao excluir usuário.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!window.confirm("Remover privilégios administrativos deste usuário?")) return;
    setActionLoading(true);
    try {
      const response = await api.post(`/api/v1/users/${id}/remove-admin`);
      alert("Sucesso: " + response.data.message);
      fetchUserDetails(); 
    } catch (error) {
      alert(error.response?.data?.message || "Erro ao remover admin");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!window.confirm("Promover este usuário a Administrador?")) return;
    setActionLoading(true);
    try {
      await api.post(`/api/v1/users/${id}/promote`);
      alert("Usuário promovido!");
      fetchUserDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao promover.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const acao = user.is_active ? "suspender" : "ativar";
    if (!window.confirm(`Deseja realmente ${acao} este usuário?`)) return;
    
    setActionLoading(true);
    try {
      await api.patch(`/api/v1/users/${id}/toggle-status`);
      alert("Status atualizado!");
      fetchUserDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao mudar status.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="loading-state">Carregando detalhes...</div>;

  return (
  <div className="dashboard-layout animate-in">
    <aside className="sidebar">
      <div className="sidebar-brand" onClick={() => navigate('/dashboard')}>
        <div className="brand"><h1>Axion<span>ID</span></h1></div>
      </div>
      <nav className="sidebar-nav">
        <button className="nav-item active" onClick={() => navigate('/dashboard')}>
          <span className="nav-icon">←</span> <span>Voltar ao Painel</span>
        </button>
      </nav>
    </aside>

    <div className="main-wrapper">
      <header className="main-header">
        <h2>Gestão de Identidade</h2>
        <div className="header-user">
          <div className="nav-avatar">{user.name?.charAt(0)}</div>
        </div>
      </header>

      <main className="content-area">
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
              <div className="info-item"><label>Documento Identificador</label><span>{user.cpf_cnpj || 'Não informado'}</span></div>
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

          {/* SEÇÃO DE AÇÕES (ZONA DE PERIGO) */}
          <section className="actions-section">
            <h4>Gerenciamento Crítico</h4>
            <div className="actions-group">
              {user.is_admin ? (
                <button onClick={handleRemoveAdmin} disabled={actionLoading} className="btn-action btn-suspend">
                  Revogar Admin
                </button>
              ) : (
                <button onClick={handlePromote} disabled={actionLoading} className="btn-action btn-promote">
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

// Estilos auxiliares para manter a limpeza do JSX
const infoItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '12px'
};

const labelStyle = {
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  color: 'var(--text-dim)',
  fontWeight: 'bold',
  letterSpacing: '0.5px'
};
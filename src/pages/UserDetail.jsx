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
    <div className="dashboard-layout">
      {/* Reutilizando a estrutura de Sidebar apenas para manter o Branding e Navegação */}
      <aside className="sidebar">
        <div className="sidebar-brand" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>
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
          <div className="header-info">
            <h2>Detalhes da Identidade</h2>
          </div>
          <div className="header-user">
             <div className="nav-avatar">{user.name?.charAt(0)}</div>
          </div>
        </header>

        <main className="content-area animate-in">
          <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* CARD: INFORMAÇÕES BÁSICAS */}
            <div className="table-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div className="nav-avatar" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                  {user.name?.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{user.name}</h3>
                  <span className={`badge ${user.is_admin ? 'success' : 'operacional'}`}>
                    {user.is_admin ? 'Administrador' : 'Operacional'}
                  </span>
                </div>
              </div>

              <div className="info-list">
                <div style={infoItemStyle}><label style={labelStyle}>E-mail</label><span>{user.email}</span></div>
                <div style={infoItemStyle}><label style={labelStyle}>CPF/CNPJ</label><span>{user.cpf_cnpj || 'Não informado'}</span></div>
                <div style={infoItemStyle}>
                  <label style={labelStyle}>Status do Perfil</label>
                  <span style={{ color: user.profile_completed ? 'var(--success)' : 'var(--warning)', fontWeight: 'bold' }}>
                    {user.profile_completed ? '✓ Validado' : '⚠ Pendente'}
                  </span>
                </div>
              </div>
            </div>

            {/* CARD: ENDEREÇO */}
            <div className="table-card" style={{ padding: '24px' }}>
              <h3 style={{ marginBottom: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                Endereço Registrado
              </h3>
              {user.address ? (
                <div className="info-list">
                  <div style={infoItemStyle}><label style={labelStyle}>CEP</label><span>{user.address.zip_code}</span></div>
                  <div style={infoItemStyle}><label style={labelStyle}>Rua</label><span>{user.address.street}, {user.address.number}</span></div>
                  <div style={infoItemStyle}><label style={labelStyle}>Bairro</label><span>{user.address.neighborhood}</span></div>
                  <div style={infoItemStyle}><label style={labelStyle}>Cidade/UF</label><span>{user.address.city} - {user.address.state}</span></div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Nenhum endereço cadastrado.</p>
              )}
            </div>

            {/* CARD: AÇÕES ADMINISTRATIVAS */}
            <div className="table-card actions-card" style={{ padding: '24px', gridColumn: '1 / -1' }}>
              <h3 style={{ marginBottom: '15px' }}>Gerenciamento de Conta</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                
                {user.is_admin ? (
                  <button 
                    onClick={handleRemoveAdmin} 
                    disabled={actionLoading || user.id === parseInt(localStorage.getItem('@AxionID:id'))}
                    className="btn-secondary"
                    style={{ border: '1px solid var(--danger)', color: 'var(--danger)' }}
                  >
                    Remover Privilégios de Admin
                  </button>
                ) : (
                  <button 
                    onClick={handlePromote} 
                    disabled={actionLoading}
                    className="btn-primary"
                  >
                    Promover a Administrador
                  </button>
                )}

                <button 
                  onClick={handleToggleStatus} 
                  disabled={actionLoading || user.id === parseInt(localStorage.getItem('@AxionID:id'))}
                  className="btn-secondary"
                >
                  {user.is_active ? 'Suspender Conta' : 'Reativar Conta'}
                </button>

                <button 
                  onClick={handleDelete}
                  disabled={actionLoading || user.id === parseInt(localStorage.getItem('@AxionID:id'))}
                  className="btn-danger"
                  style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  {actionLoading ? 'Excluindo...' : 'Excluir Usuário Permanentemente'}
                </button>
              </div>
              <p style={{ marginTop: '15px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                * Mudanças de status afetam o acesso imediato. Exclusões são irreversíveis e apagam todo o histórico do usuário.
              </p>
            </div>

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
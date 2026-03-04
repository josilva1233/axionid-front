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

  // --- NOVA FUNÇÃO DE DELETAR ---
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

  if (loading) return <div className="loading-screen">Carregando detalhes...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            ← Voltar
          </button>
          <h2>Detalhes da Identidade</h2>
        </div>
      </header>

      <main className="detail-content animate-in">
        <div className="detail-grid">
          
          <div className="detail-card">
            <div className="card-header">
              <div className="avatar-large">{user.name?.charAt(0)}</div>
              <div className="user-titles">
                <h3>{user.name}</h3>
                <span className={`badge ${user.is_admin ? 'admin' : 'operacional'}`}>
                  {user.is_admin ? 'Administrador' : 'Operacional'}
                </span>
              </div>
            </div>

            <div className="info-list">
              <div className="info-item">
                <label>E-mail</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>CPF/CNPJ</label>
                <span>{user.cpf_cnpj || 'Não informado'}</span>
              </div>
              <div className="info-item">
                <label>Status do Perfil</label>
                <span className={user.profile_completed ? 'text-success' : 'text-warning'}>
                  {user.profile_completed ? '✓ Validado' : '⚠ Pendente'}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3>Endereço Registrado</h3>
            {user.address ? (
              <div className="info-list">
                <div className="info-item"><label>CEP</label><span>{user.address.zip_code}</span></div>
                <div className="info-item"><label>Rua</label><span>{user.address.street}, {user.address.number}</span></div>
                <div className="info-item"><label>Bairro</label><span>{user.address.neighborhood}</span></div>
                <div className="info-item"><label>Cidade/UF</label><span>{user.address.city} - {user.address.state}</span></div>
              </div>
            ) : (
              <p className="empty-msg">Nenhum endereço cadastrado.</p>
            )}
          </div>

          <div className="detail-card actions-card">
            <h3>Ações Administrativas</h3>
            <div className="actions-buttons-vertical">
              
              {user.is_admin ? (
                <button 
                  onClick={handleRemoveAdmin} 
                  disabled={actionLoading || user.id === parseInt(localStorage.getItem('@AxionID:id'))}
                  className="btn-danger-outline-full"
                >
                  Remover Privilégios de Admin
                </button>
              ) : (
                <button 
                  onClick={handlePromote} 
                  disabled={actionLoading}
                  className="btn-promote-full"
                >
                  Promover a Administrador
                </button>
              )}

              <button 
                onClick={handleToggleStatus} 
                disabled={actionLoading || user.id === parseInt(localStorage.getItem('@AxionID:id'))}
                className={user.is_active ? 'btn-suspend-full' : 'btn-activate-full'}
              >
                {user.is_active ? 'Suspender Conta' : 'Reativar Conta'}
              </button>

              {/* NOVO BOTÃO DE DELETAR */}
              <button 
                onClick={handleDelete}
                disabled={actionLoading || user.id === parseInt(localStorage.getItem('@AxionID:id'))}
                className="btn-delete-full"
                style={{ marginTop: '10px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
              >
                {actionLoading ? 'Excluindo...' : 'Excluir Usuário Permanentemente'}
              </button>

              <small className="help-text">
                * Usuários suspensos não conseguem realizar login. Exclusões são irreversíveis.
              </small>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
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
    // Chamada direta para o ID específico
    const res = await api.get(`/api/v1/users/${id}`); 
    
    // O Laravel agora retorna o objeto direto em res.data.data
    setUser(res.data.data); 
    
    console.log("Endereço carregado:", res.data.data.address);
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar detalhes. Verifique se a rota /api/v1/users/{id} existe.");
    navigate('/dashboard');
  } finally {
    setLoading(false);
  }
};

  const handlePromote = async () => {
    if (!window.confirm("Promover este usuário a Administrador?")) return;
    setActionLoading(true);
    try {
      await api.post(`/api/v1/users/${id}/promote`);
      alert("Usuário promovido com sucesso!");
      fetchUserDetails(); // Recarrega os dados
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
          
          {/* CARD 1: INFORMAÇÕES PESSOAIS */}
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

{/* CARD 2: ENDEREÇO */}
<div className="detail-card">
  <h3>Endereço Registrado</h3>
  {user.address ? (
    <div className="info-list">
      <div className="info-item">
        <label>CEP</label>
        <span>{user.address.zip_code}</span>
      </div>
      <div className="info-item">
        <label>Rua</label>
        <span>{user.address.street}, {user.address.number}</span>
      </div>
      <div className="info-item">
        <label>Bairro</label>
        <span>{user.address.neighborhood}</span>
      </div>
      <div className="info-item">
        <label>Cidade/UF</label>
        <span>{user.address.city} - {user.address.state}</span>
      </div>
      {user.address.complement && (
        <div className="info-item">
          <label>Complemento</label>
          <span>{user.address.complement}</span>
        </div>
      )}
    </div>
  ) : (
    <div className="empty-address-box">
      <p className="empty-msg">Nenhum endereço cadastrado por este usuário.</p>
      {/* Botão opcional se quiser permitir que o admin adicione um endereço manual no futuro */}
    </div>
  )}
</div>

          {/* CARD 3: AÇÕES DE ADMIN */}
          <div className="detail-card actions-card">
            <h3>Ações Administrativas</h3>
            <div className="actions-buttons-vertical">
              
              {!user.is_admin && (
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

              <small className="help-text">
                * Usuários suspensos não conseguem realizar login no sistema.
              </small>
            </div>
          </div>

          <div className="admin-actions">
  <h3>Ações Administrativas</h3>
  
  <div className="btn-group-vertical">
    {/* Botão de Alternar Admin */}
    {user.is_admin ? (
      <button 
        className="btn-danger-outline" 
        onClick={() => handleRemoveAdmin(user.id)}
      >
        Remover Administrador
      </button>
    ) : (
      <button 
        className="btn-success-outline" 
        onClick={() => handlePromoteAdmin(user.id)}
      >
        Tornar Administrador
      </button>
    )}

    {/* Botão de Suspender (Já existente no seu print) */}
    <button className="btn-suspend" onClick={() => handleToggleStatus(user.id)}>
      {user.is_active ? 'Suspender Conta' : 'Ativar Conta'}
    </button>
  </div>
  
  <p className="helper-text">* Usuários suspensos não conseguem realizar login.</p>
</div>

        </div>
      </main>
    </div>
  );
}
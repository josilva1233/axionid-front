import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function UserDetailContent({ userId, onBack }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/users/${userId}`);
      setUser(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar detalhes.");
      onBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUserDetails();
  }, [userId]);

  const handleToggleStatus = async () => {
    const acao = user.is_active ? "suspender" : "ativar";
    if (!window.confirm(`Deseja realmente ${acao} este usuário?`)) return;
    setActionLoading(true);
    try {
      await api.patch(`/api/v1/users/${userId}/toggle-status`);
      fetchUserDetails();
    } catch (err) {
      alert("Erro ao mudar status.");
    } finally {
      setActionLoading(false);
    }
  };

  // ... (Mantenha as outras funções handleDelete, handlePromote, handleRemoveAdmin aqui dentro)

  if (loading) return <div className="loading-state p-5 text-center">Carregando detalhes...</div>;

  return (
    <div className="animate-in">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn-back" onClick={onBack}>← Voltar</button>
        <h3 className="text-white mb-0">Detalhes do Usuário</h3>
      </div>

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
            <div className="info-item"><label>E-mail</label><span>{user.email}</span></div>
            <div className="info-item"><label>Documento</label><span>{user.cpf_cnpj || 'Não informado'}</span></div>
          </div>
        </section>

        {/* CARD: ENDEREÇO */}
        <section className="info-card">
          <h4 className="section-title">Endereço</h4>
          {user.address ? (
            <div className="info-list mt-3">
              <div className="info-item"><label>Cidade</label><span>{user.address.city} - {user.address.state}</span></div>
              <div className="info-item"><label>Rua</label><span>{user.address.street}, {user.address.number}</span></div>
            </div>
          ) : (
            <div className="empty-state">Nenhum endereço vinculado.</div>
          )}
        </section>

        {/* AÇÕES */}
        <section className="actions-section mt-4">
          <h4 className="text-danger">Zona de Perigo</h4>
          <div className="actions-group d-flex gap-2 flex-wrap mt-3">
            <button onClick={handleToggleStatus} disabled={actionLoading} className="btn-action btn-suspend">
              {user.is_active ? 'Suspender' : 'Ativar'}
            </button>
            <button onClick={() => {/* delete */}} className="btn-action btn-delete-ghost">Excluir</button>
          </div>
        </section>
      </div>
    </div>
  );
}
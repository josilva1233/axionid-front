import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Memoizando a busca para evitar renderizações desnecessárias
  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/users/${id}`);
      setUser(res.data.data);
    } catch (err) {
      console.error("Erro ao buscar detalhes:", err);
      alert("Usuário não encontrado ou erro na conexão.");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  // Função genérica para requisições de ação (promover, suspender, etc)
  const handleAction = async (method, url, confirmMsg, successMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const response = await api[method](url);
      alert(successMsg || response.data?.message || "Operação realizada!");
      fetchUserDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Ocorreu um erro na operação.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmName = window.prompt(
      `ATENÇÃO: Para excluir permanentemente "${user.name}", digite o NOME completo abaixo:`
    );

    if (confirmName !== user.name) {
      if (confirmName !== null) alert("O nome não confere. Operação cancelada.");
      return;
    }

    setActionLoading(true);
    try {
      await api.delete(`/api/v1/users/${id}`);
      alert("Identidade excluída com sucesso.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao excluir.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loader"></div>
      <p>Sincronizando dados da identidade...</p>
    </div>
  );

  return (
    <div className="dashboard-layout animate-in">
      <aside className="sidebar">
        <header className="sidebar-brand" onClick={() => navigate("/dashboard")}>
          <div className="brand">
            <h1>Axion<span>ID</span></h1>
          </div>
        </header>
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate("/dashboard")}>
            <span className="nav-icon">←</span> <span>Voltar ao Painel</span>
          </button>
        </nav>
      </aside>

      <div className="main-wrapper">
        <header className="main-header">
          <div className="header-info">
            <h2>Gestão de Identidade</h2>
            <p className="breadcrumb">Usuários / {user.name}</p>
          </div>
          <div className="header-user">
            <div className="nav-avatar">{user.name?.charAt(0)}</div>
          </div>
        </header>

        <main className="content-area">
          <div className="detail-grid">
            
            {/* CARD: PERFIL PRINCIPAL */}
            <section className="info-card profile-main">
              <div className="profile-header">
                <div className="avatar-large">{user.name?.charAt(0)}</div>
                <div className="profile-titles">
                  <h3>{user.name}</h3>
                  <div className="badges-row">
                    <span className={`badge ${user.is_admin ? "admin" : "user"}`}>
                      {user.is_admin ? "Administrador" : "Operacional"}
                    </span>
                    <span className={`badge ${user.is_active ? "active" : "inactive"}`}>
                      {user.is_active ? "Ativo" : "Suspenso"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="info-list">
                <div className="info-group">
                  <label>E-mail Corporativo</label>
                  <p>{user.email}</p>
                </div>
                <div className="info-group">
                  <label>Documento Identificador (CPF/CNPJ)</label>
                  <p>{user.cpf_cnpj || "Não vinculado"}</p>
                </div>
                <div className="info-group">
                  <label>Status de Validação</label>
                  <p className={user.profile_completed ? "status-ok" : "status-pending"}>
                    {user.profile_completed ? "✓ Perfil Verificado" : "⚠ Cadastro Incompleto"}
                  </p>
                </div>
              </div>
            </section>

            {/* CARD: ENDEREÇO */}
            <section className="info-card">
              <h4 className="card-title">Endereço de Registro</h4>
              {user.address ? (
                <div className="info-list">
                  <div className="info-group">
                    <label>CEP</label>
                    <p>{user.address.zip_code}</p>
                  </div>
                  <div className="info-group">
                    <label>Logradouro</label>
                    <p>{user.address.street}, {user.address.number}</p>
                  </div>
                  <div className="info-group">
                    <label>Bairro</label>
                    <p>{user.address.neighborhood}</p>
                  </div>
                  <div className="info-group">
                    <label>Localidade</label>
                    <p>{user.address.city} — {user.address.state}</p>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>Nenhum endereço vinculado a esta conta.</p>
                </div>
              )}
            </section>

            {/* SEÇÃO DE AÇÕES (ZONA DE GERENCIAMENTO) */}
            <section className="info-card danger-zone">
              <h4 className="card-title">Gerenciamento Crítico</h4>
              <p className="card-subtitle">Ações que impactam o acesso direto do usuário ao sistema.</p>
              
              <div className="actions-stack">
                {user.is_admin ? (
                  <button
                    onClick={() => handleAction('post', `/api/v1/users/${id}/remove-admin`, "Revogar privilégios de administrador?", "Privilégios removidos.")}
                    disabled={actionLoading}
                    className="btn-action btn-outline"
                  >
                    Revogar Acesso Admin
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction('post', `/api/v1/users/${id}/promote`, "Promover usuário a administrador?", "Usuário promovido com sucesso.")}
                    disabled={actionLoading}
                    className="btn-action btn-promote"
                  >
                    Promover a Administrador
                  </button>
                )}

                <button
                  onClick={() => handleAction('patch', `/api/v1/users/${id}/toggle-status`, `Deseja ${user.is_active ? 'suspender' : 'reativar'} este acesso?`, "Status atualizado.")}
                  disabled={actionLoading}
                  className={`btn-action ${user.is_active ? "btn-suspend" : "btn-activate"}`}
                >
                  {user.is_active ? "Suspender Acesso" : "Reativar Identidade"}
                </button>

                <div className="divider"></div>

                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="btn-action btn-danger"
                >
                  {actionLoading ? "Excluindo..." : "Excluir Identidade Permanentemente"}
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
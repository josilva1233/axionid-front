import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyDetails = async () => {
      try {
        setLoading(true);
        // Ajuste o endpoint conforme seu backend (/me ou /auth/me)
        const res = await api.get("/api/v1/auth/me"); 
        
        // Verifique se o seu Laravel retorna dentro de .data ou .data.data
        const userData = res.data.data || res.data;
        setUser(userData);
      } catch (err) {
        console.error("Erro ao carregar perfil", err);
        // Se der erro de autenticação, volta pro login
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchMyDetails();
  }, [navigate]);

  if (loading) return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <span className="text-primary fw-bold">Carregando seu perfil...</span>
    </div>
  );

  if (!user) return <div className="p-5 text-white">Usuário não encontrado.</div>;

  return (
    <div className="dashboard-layout animate-in">
      <div className="main-wrapper" style={{ marginLeft: 0 }}>
        <header className="main-header">
          <h2 className="brand">Meu Perfil</h2>
          <button className="btn-back" onClick={() => navigate(-1)}>
            Voltar
          </button>
        </header>

        <main className="content-area p-4">
          <div className="detail-grid">
            {/* Card de Informações Principais */}
            <div className="info-card">
              <div className="profile-header">
                <div className="avatar-large">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="mb-0">{user.name}</h3>
                  <span className="user-role">{user.role}</span>
                </div>
              </div>

              <div className="info-list">
                <div className="info-item">
                  <label>E-mail</label>
                  <span>{user.email}</span>
                </div>
                <div className="info-item">
                  <label>Status da Conta</label>
                  <span className="status-badge complete">Ativo</span>
                </div>
                <div className="info-item">
                  <label>Membro desde</label>
                  <span>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Card de Segurança/Ações (Opcional) */}
            <div className="info-card">
               <h4 className="mb-4">Segurança</h4>
               <p className="text-dim small">
                 Para alterar sua senha ou dados sensíveis, entre em contato com o administrador do sistema.
               </p>
               <div className="actions-buttons-vertical mt-4">
                  <button className="btn-promote-full" disabled>
                    Alterar Senha
                  </button>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/v1/auth/me"); 
        const userData = res.data.data || res.data;
        setUser(userData);
      } catch (err) {
        console.error("Erro ao carregar perfil", err);
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchMyDetails();
  }, [navigate]);

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;
  if (!user) return <div className="p-5 text-white">Usuário não encontrado.</div>;

  return (
    <div className="dashboard-layout animate-in">
      <div className="main-wrapper" style={{ marginLeft: 0 }}>
        <header className="main-header">
          <h2 className="brand">Meu Perfil</h2>
          <button className="btn-back" onClick={() => navigate(-1)}>Voltar</button>
        </header>
        <main className="content-area p-4">
          <div className="info-card">
            <div className="profile-header">
              <div className="avatar-large">{user.name?.charAt(0).toUpperCase()}</div>
              <div>
                <h3 className="mb-0">{user.name}</h3>
                <span className="user-role">{user.role}</span>
              </div>
            </div>
            <div className="info-list mt-4">
              <div className="info-item"><label>E-mail</label><span>{user.email}</span></div>
              <div className="info-item"><label>Membro desde</label><span>{new Date(user.created_at).toLocaleDateString()}</span></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
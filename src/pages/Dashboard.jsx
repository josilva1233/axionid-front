import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import UserTable from "../components/UserTable";
import AuditTable from "../components/AuditTable";
import api from "../services/api";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, admins: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "users" ? "/api/v1/users" : "/api/v1/audit-logs";
      const res = await api.get(endpoint);
      setData(res.data.data);
      
      // Se for a aba de usuários, atualizamos os mini-cards de stats
      if (activeTab === "users") {
        const users = res.data.data;
        setStats({
          total: users.length,
          active: users.filter(u => u.is_active).length,
          admins: users.filter(u => u.is_admin).length
        });
      }
    } catch (err) {
      console.error("Erro ao sincronizar dashboard", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="dashboard-layout animate-in">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        role="admin" // Idealmente viria do seu Contexto de Auth
        onLogout={() => { /* sua lógica de logout */ }}
      />

      <div className="main-wrapper">
        <header className="main-header">
          <div className="header-info">
            <h2>Painel de Controle</h2>
            <p className="breadcrumb">AxionID / {activeTab === "users" ? "Gestão de Usuários" : "Auditoria"}</p>
          </div>
        </header>

        <main className="content-area">
          {/* MINI CARDS DE INDICADORES */}
          {activeTab === "users" && (
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total de Identidades</span>
                <span className="stat-value">{stats.total}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Acessos Ativos</span>
                <span className="stat-value text-success">{stats.active}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Administradores</span>
                <span className="stat-value text-primary">{stats.admins}</span>
              </div>
            </div>
          )}

          {/* RENDERIZAÇÃO DINÂMICA DA TABELA */}
          <section className="table-section">
            {loading ? (
              <div className="loader-container"><div className="loader"></div></div>
            ) : activeTab === "users" ? (
              <UserTable users={data} />
            ) : (
              <AuditTable logs={data} />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
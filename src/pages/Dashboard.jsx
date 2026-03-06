import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import UserTable from "../components/UserTable";
import AuditTable from "../components/AuditTable";
import api from "../services/api";

export default function Dashboard() {

  const [activeTab, setActiveTab] = useState("users");
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {

      const endpoint =
        activeTab === "users"
          ? "/api/v1/users"
          : "/api/v1/audit-logs";

      const res = await api.get(endpoint);

      setData(res.data.data);

      if (activeTab === "users") {

        const users = res.data.data;

        setStats({
          total: users.length,
          active: users.filter(u => u.is_active).length,
          admins: users.filter(u => u.is_admin).length
        });

      }

    } catch (err) {

      console.error("Erro ao carregar dashboard:", err);

    } finally {

      setLoading(false);

    }

  }, [activeTab]);

  useEffect(() => {

    fetchData();

  }, [fetchData]);

  return (
    <div className="dashboard-layout">

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role="admin"
        onLogout={() => console.log("logout")}
      />

      <div className="main-wrapper">

        <header className="main-header">
          <h2>Painel de Controle</h2>
        </header>

        <main className="content-area">

          {activeTab === "users" && (
            <div className="stats-grid">

              <div className="stat-card">
                <span>Total</span>
                <strong>{stats.total}</strong>
              </div>

              <div className="stat-card">
                <span>Ativos</span>
                <strong>{stats.active}</strong>
              </div>

              <div className="stat-card">
                <span>Admins</span>
                <strong>{stats.admins}</strong>
              </div>

            </div>
          )}

          {loading ? (
            <p>Carregando...</p>
          ) : activeTab === "users" ? (
            <UserTable users={data} />
          ) : (
            <AuditTable logs={data} />
          )}

        </main>

      </div>

    </div>
  );
}

import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Spinner, Pagination, Form, Row, Col } from "react-bootstrap";
import api from "../services/api";

import Sidebar from "../components/dashboard/Sidebar";
import UserTable from "../components/dashboard/UserTable";
import AuditTable from "../components/dashboard/AuditTable";
import UserDropdown from "../components/dashboard/UserDropdown";
import UserDetail from "../components/dashboard/UserDetail"; // Importação corrigida

const WelcomeOperacional = ({ user }) => (
  <div className="text-center py-5 animate-in">
    <div className="mb-4">
      <div className="display-4 text-primary">👋</div>
    </div>
    <h2 className="text-white mb-2">Bem-vindo, {user?.name}!</h2>
    <p className="text-dim">
      Você está logado no painel operacional da <strong>AxionID</strong>.<br />
      Utilize o menu lateral para navegar ou o avatar no topo para ver seu perfil.
    </p>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem("@AxionID:role"));
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState(null);

  // Estados para o Componente UserDetail
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    completed: "",
    method: "",
    date: "",
  });

  // --- LÓGICA DE CARREGAMENTO ---

  const loadUsers = useCallback(async (page = 1) => {
    if (role !== "admin") return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (filters.name) params.append("name", filters.name);
      if (filters.completed !== "") params.append("completed", filters.completed);

      const res = await api.get(`/api/v1/users?${params.toString()}`);
      setUsers(res.data.data || res.data);
      setPaginationData(res.data.current_page ? {
        current: res.data.current_page,
        last: res.data.last_page,
        total: res.data.total,
      } : null);
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
    }
  }, [role, filters.name, filters.completed]);

  const loadAuditLogs = useCallback(async (page = 1) => {
    if (role !== "admin") return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page });
      if (filters.method) params.append("method", filters.method);
      if (filters.date) params.append("date", filters.date);

      const res = await api.get(`/api/v1/audit-logs?${params.toString()}`);
      setAuditLogs(res.data.data || res.data);
      setPaginationData(res.data.current_page ? {
        current: res.data.current_page,
        last: res.data.last_page,
        total: res.data.total,
      } : null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters.method, filters.date, role]);

  // --- LÓGICA DO USER DETAIL (API) ---

  const handleViewDetail = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/users/${id}`);
      setSelectedUser(res.data.data);
    } catch (err) {
      alert("Erro ao buscar detalhes");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (type) => {
    setActionLoading(true);
    try {
      if (type === 'promote') await api.post(`/api/v1/users/${selectedUser.id}/promote`);
      if (type === 'toggle-status') await api.patch(`/api/v1/users/${selectedUser.id}/toggle-status`);
      if (type === 'delete') {
        if (!window.confirm("Confirmar exclusão?")) return;
        await api.delete(`/api/v1/users/${selectedUser.id}`);
        setSelectedUser(null);
        loadUsers();
        return;
      }
      handleViewDetail(selectedUser.id); // Atualiza os dados após ação
    } catch (err) {
      alert("Erro na operação");
    } finally {
      setActionLoading(false);
    }
  };

  // --- EFFECTS E HANDLERS ---

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileRes = await api.get("/api/v1/me");
        setCurrentUser(profileRes.data);
      } catch (err) { navigate("/login"); }
    };
    loadProfile();
  }, [navigate]);

  useEffect(() => {
    if (role === "admin") {
      setCurrentPage(1);
      activeTab === "users" ? loadUsers(1) : loadAuditLogs(1);
    }
  }, [activeTab, role, loadUsers, loadAuditLogs]);

  const handleLogout = async () => {
    try { await api.post("/api/v1/logout"); } 
    finally { localStorage.clear(); navigate("/login"); }
  };

  const clearFilters = () => {
    setFilters({ name: "", method: "", date: "", completed: "" });
    setCurrentPage(1);
  };

  // --- RENDER ---

  return (
    <div className="dashboard-layout animate-in">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setSelectedUser(null); setCurrentPage(1); }} 
        role={role} 
        onLogout={handleLogout} 
      />

      <div className="main-wrapper">
        <header className="main-header">
          <h2 className="brand">
            {selectedUser ? "Detalhes do Usuário" : (activeTab === "users" ? "Gestão de Usuários" : "Auditoria")}
          </h2>
          {currentUser && <UserDropdown user={currentUser} onLogout={handleLogout} />}
        </header>

        <main className="content-area p-4">
          {selectedUser ? (
            <UserDetail 
              user={selectedUser} 
              onBack={() => setSelectedUser(null)}
              onAction={handleUserAction}
              actionLoading={actionLoading}
            />
          ) : (
            <>
              {/* Filtros omitidos aqui por brevidade, mas devem permanecer conforme seu código */}
              
              <div className={`tab-wrapper position-relative ${loading ? "is-loading" : ""}`}>
                {loading && <div className="loading-overlay"><Spinner animation="border" variant="primary" /></div>}
                
                <div className="content-card">
                  {activeTab === "users" ? (
                    role === "admin" ? <UserTable users={users} onViewDetail={handleViewDetail} /> : <WelcomeOperacional user={currentUser} />
                  ) : (
                    role === "admin" && <AuditTable logs={auditLogs} />
                  )}
                </div>
                {/* Paginação aqui */}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
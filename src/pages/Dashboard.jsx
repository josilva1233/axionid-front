import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import api from "../services/api";
import { useDashboardData } from "../hooks/useDashboardData";

import Sidebar from "../components/dashboard/Sidebar";
import UserTable from "../components/dashboard/UserTable";
import GroupTable from "../components/dashboard/GroupTable";
import GroupForm from "../components/dashboard/GroupForm";
import AuditTable from "../components/dashboard/AuditTable";
import UserDropdown from "../components/dashboard/UserDropdown";
import UserDetail from "../components/dashboard/UserDetail";
import GroupDetail from "../components/dashboard/GroupDetail";
import DashboardFilters from "../components/dashboard/DashboardFilters";

const WelcomeOperacional = ({ user }) => (
  <div className="text-center py-5 animate-in">
    <h2 className="text-white mb-2">Bem-vindo, {user?.name}!</h2>
    <p className="text-dim">Você está no painel operacional da AxionID.</p>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem("@AxionID:role"));
  const [activeTab, setActiveTab] = useState("users");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { 
    loading, users, groups, auditLogs, filters, 
    setFilters, loadUsers, loadGroups, loadAuditLogs 
  } = useDashboardData(role);

  const isGlobalAdmin = role === "admin" || currentUser?.is_admin === true;

  // --- EFEITOS DE CARREGAMENTO ---
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/api/v1/me");
        setCurrentUser(res.data);
      } catch { navigate("/login"); }
    };
    loadProfile();
  }, [navigate]);

  useEffect(() => {
    if (activeTab === "users") loadUsers(currentPage);
    else if (activeTab === "audit") loadAuditLogs(currentPage);
    else if (activeTab === "groups") loadGroups(currentPage);
  }, [activeTab, currentPage, loadUsers, loadGroups, loadAuditLogs]);

  // --- HANDLERS DE USUÁRIO ---
  const handleViewDetail = async (id) => {
    setActionLoading(true); 
    try {
      const res = await api.get(`/api/v1/admin/users/${id}`);
      setSelectedUser(res.data.data || res.data); 
    } catch (err) {
      alert("Erro ao buscar detalhes do usuário");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserAction = async (type) => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      if (type === "promote") await api.post(`/api/v1/admin/users/${selectedUser.id}/promote`);
      if (type === "remove-admin") await api.post(`/api/v1/admin/users/${selectedUser.id}/remove-admin`);
      if (type === "toggle-status") await api.patch(`/api/v1/admin/users/${selectedUser.id}/toggle-status`);
      
      handleViewDetail(selectedUser.id);
      loadUsers(currentPage);
    } catch (err) { alert("Erro ao processar ação."); } finally { setActionLoading(false); }
  };

  // --- NOVA FUNÇÃO: GERENCIAR GRUPOS (INCLUIR/REMOVER USUÁRIOS) ---
  const handleGroupUpdate = async () => {
    // Esta função força o recarregamento dos grupos após adicionar um usuário
    await loadGroups(currentPage);
    // Se quiser fechar o detalhe ou manter aberto, você decide:
    // setSelectedGroupId(null); 
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleLogout = async () => {
    try { await api.post("/api/v1/logout"); } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <div className="dashboard-layout animate-in">
      <Sidebar 
        activeTab={activeTab} role={role} onLogout={handleLogout} 
        setActiveTab={(tab) => { 
            setActiveTab(tab); setCurrentPage(1); 
            setSelectedUser(null); setSelectedGroupId(null); 
        }} 
      />

      <div className="main-wrapper">
        <header className="main-header d-flex justify-content-between align-items-center p-3">
          <h2 className="brand mb-0" style={{ fontSize: "1.25rem" }}>AxionID Admin</h2>
          {currentUser && <UserDropdown user={currentUser} onLogout={handleLogout} />}
        </header>

        <main className="content-area p-4">
          {selectedUser ? (
            <UserDetail 
              user={selectedUser} onBack={() => setSelectedUser(null)} 
              onAction={handleUserAction} actionLoading={actionLoading}
            />
          ) : selectedGroupId ? (
            <GroupDetail 
              group={groups.find(g => g.id === selectedGroupId)} 
              onBack={() => setSelectedGroupId(null)}
              isGlobalAdmin={isGlobalAdmin}
              currentUser={currentUser}
              onUpdate={handleGroupUpdate} // <-- CORREÇÃO: Passando a função que faltava
            />
          ) : (
            <>
              {!showGroupForm && (
                <DashboardFilters 
                  activeTab={activeTab} role={role} filters={filters} 
                  onFilterChange={handleFilterChange} 
                  onClear={() => { setFilters({name: "", completed: "", method: "", date: ""}); setCurrentPage(1); }}
                  onNewGroup={() => setShowGroupForm(true)}
                />
              )}

              <div className={`tab-wrapper position-relative ${loading || actionLoading ? "is-loading" : ""}`}>
                {(loading || actionLoading) && (
                    <div className="loading-overlay"><Spinner animation="border" variant="primary" /></div>
                )}
                
                <div className="content-card">
                  {activeTab === "users" && (
                    role === "admin" ? (
                      <UserTable users={users} onViewDetail={handleViewDetail} />
                    ) : ( <WelcomeOperacional user={currentUser} /> )
                  )}

                  {activeTab === "audit" && <AuditTable logs={auditLogs} />}

                  {activeTab === "groups" && (
                    showGroupForm ? (
                      <GroupForm onCancel={() => setShowGroupForm(false)} onUpdate={handleGroupUpdate} />
                    ) : (
                      <GroupTable 
                        groups={groups} 
                        onViewDetail={setSelectedGroupId} 
                        isGlobalAdmin={isGlobalAdmin}
                        currentUser={currentUser}
                      />
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
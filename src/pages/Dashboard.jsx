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

  // Carregamento de Perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/api/v1/me");
        setCurrentUser(res.data);
      } catch { navigate("/login"); }
    };
    loadProfile();
  }, [navigate]);

  // Carregamento de Dados das Tabelas
  useEffect(() => {
    if (activeTab === "users") loadUsers(currentPage);
    else if (activeTab === "audit") loadAuditLogs(currentPage);
    else if (activeTab === "groups") loadGroups(currentPage);
  }, [activeTab, currentPage, loadUsers, loadGroups, loadAuditLogs]);

  // --- FUNÇÕES PARA O COMPONENTE GROUPDETAIL (NOMES SINCRONIZADOS) ---

  const handleAddUserToGroup = async (email) => {
    if (!selectedGroupId) return;
    setActionLoading(true);
    try {
      // Endpoint ajustado para seu backend (geralmente via e-mail ou user_id)
      await api.post(`/api/v1/groups/${selectedGroupId}/members`, { email });
      await loadGroups(currentPage); // Recarrega dados
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao adicionar usuário.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveUserFromGroup = async (userId, userName) => {
    if (!window.confirm(`Remover ${userName} do grupo?`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/v1/groups/${selectedGroupId}/members/${userId}`);
      await loadGroups(currentPage);
    } catch (err) {
      alert("Erro ao remover usuário.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGroupMemberRole = async (userId, type) => {
    setActionLoading(true);
    try {
      // type pode ser 'promote' ou 'demote'
      await api.patch(`/api/v1/groups/${selectedGroupId}/members/${userId}/role`, { action: type });
      await loadGroups(currentPage);
    } catch (err) {
      alert("Erro ao alterar cargo do membro.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    setActionLoading(true);
    try {
      await api.delete(`/api/v1/groups/${groupId}`);
      setSelectedGroupId(null);
      loadGroups(1);
    } catch (err) {
      alert("Erro ao excluir grupo.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="dashboard-layout animate-in">
      <Sidebar 
        activeTab={activeTab} role={role} onLogout={handleLogout} 
        setActiveTab={(tab) => { 
            setActiveTab(tab); 
            setSelectedUser(null); 
            setSelectedGroupId(null); 
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
                user={selectedUser} 
                onBack={() => setSelectedUser(null)} 
            />
          ) : selectedGroupId ? (
            <GroupDetail 
              group={groups.find(g => g.id === selectedGroupId)} 
              onBack={() => setSelectedGroupId(null)}
              isSystemAdmin={isGlobalAdmin}
              currentUserId={currentUser?.id}
              actionLoading={actionLoading}
              // MAPEAMENTO EXATO DAS PROPS QUE VOCÊ ENVIOU NO GROUPDETAIL:
              onAddUser={handleAddUserToGroup}
              onRemoveUser={handleRemoveUserFromGroup}
              onPromoteUser={(uid) => handleGroupMemberRole(uid, 'promote')}
              onDemoteUser={(uid) => handleGroupMemberRole(uid, 'demote')}
              onDeleteGroup={handleDeleteGroup}
            />
          ) : (
            <>
              <DashboardFilters 
                activeTab={activeTab} role={role} filters={filters} 
                onFilterChange={(e) => setFilters({...filters, [e.target.name]: e.target.value})} 
                onClear={() => setFilters({name:"", completed:"", method:"", date:""})}
                onNewGroup={() => setShowGroupForm(true)}
              />

              <div className={`tab-wrapper position-relative ${loading || actionLoading ? "is-loading" : ""}`}>
                {(loading || actionLoading) && (
                    <div className="loading-overlay"><Spinner animation="border" variant="primary" /></div>
                )}
                
                <div className="content-card">
                  {activeTab === "users" && (
                    <UserTable 
                        users={users} 
                        onViewDetail={async (id) => {
                            setActionLoading(true);
                            const res = await api.get(`/api/v1/admin/users/${id}`);
                            setSelectedUser(res.data.data || res.data);
                            setActionLoading(false);
                        }} 
                    />
                  )}
                  {activeTab === "audit" && <AuditTable logs={auditLogs} />}
                  {activeTab === "groups" && (
                    showGroupForm ? (
                      <GroupForm onCancel={() => setShowGroupForm(false)} onUpdate={() => loadGroups(1)} />
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
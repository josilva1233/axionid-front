import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
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
import PermissionTable from "../components/dashboard/PermissionTable";
import PermissionForm from "../components/dashboard/PermissionForm";

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

  const [permissions, setPermissions] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  const {
    loading, users, groups, auditLogs, filters,
    setFilters, loadUsers, loadGroups, loadAuditLogs,
  } = useDashboardData(role);

  const isGlobalAdmin = role === "admin" || currentUser?.is_admin === true;

  const loadPermissions = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/admin/permissions");
      setPermissions(res.data.data || res.data || []);
    } catch (err) {
      setPermissions([]); 
    }
  }, []);

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
    else if (activeTab === "permissions") loadPermissions();
  }, [activeTab, currentPage, loadUsers, loadGroups, loadAuditLogs, loadPermissions]);

  // --- FUNÇÕES DE GESTÃO DE USUÁRIOS (CORRIGIDAS) ---

  const handleUpdateUser = async (userId, data) => {
    setActionLoading(true);
    try {
      // Ajustado para bater com Route::put('/users/{id}/update-manual')
      await api.put(`/api/v1/admin/users/${userId}/update-manual`, data);
      alert("Dados atualizados com sucesso!");
      
      const res = await api.get(`/api/v1/admin/users/${userId}`);
      setSelectedUser(res.data.data || res.data);
      loadUsers(currentPage);
    } catch (err) {
      alert("Erro ao atualizar dados.");
    } finally { setActionLoading(false); }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Excluir permanentemente ${userName}?`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/v1/admin/users/${userId}`);
      alert("Usuário removido!");
      setSelectedUser(null);
      loadUsers(currentPage);
    } catch (err) {
      alert("Erro ao excluir.");
    } finally { setActionLoading(false); }
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    // Sincronizado com Route::post('/users/{id}/promote') e '/users/{id}/remove-admin'
    const endpoint = currentStatus ? "remove-admin" : "promote";
    const actionText = currentStatus ? "rebaixar para usuário comum" : "promover a administrador";

    if (!window.confirm(`Deseja realmente ${actionText}?`)) return;

    setActionLoading(true);
    try {
      await api.post(`/api/v1/admin/users/${userId}/${endpoint}`);
      alert("Nível de acesso alterado!");
      
      const res = await api.get(`/api/v1/admin/users/${userId}`);
      setSelectedUser(res.data.data || res.data);
      loadUsers(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || "Erro na operação de privilégios.");
    } finally { setActionLoading(false); }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    // Sincronizado com Route::patch('/users/{id}/toggle-status')
    const action = currentStatus ? "suspender" : "ativar";
    if (!window.confirm(`Deseja ${action} o acesso?`)) return;
    
    setActionLoading(true);
    try {
      await api.patch(`/api/v1/admin/users/${userId}/toggle-status`);
      alert(`Usuário ${action}ado!`);
      
      const res = await api.get(`/api/v1/admin/users/${userId}`);
      setSelectedUser(res.data.data || res.data);
      loadUsers(currentPage);
    } catch (err) {
      alert("Erro ao alterar status.");
    } finally { setActionLoading(false); }
  };

  // --- FUNÇÕES DE GRUPOS ---
  const handleGroupMemberRole = async (userId, type) => {
    setActionLoading(true);
    try {
      const endpoint = `/api/v1/groups/${selectedGroupId}/members/${userId}/${type}`;
      const res = await api.patch(endpoint);
      alert(res.data.message || "Operação realizada com sucesso!");
      await loadGroups(currentPage);
    } catch (err) { 
      alert(err.response?.data?.message || "Erro ao alterar cargo no grupo."); 
    } finally { setActionLoading(false); }
  };

  const handleAddUserToGroup = async (email) => {
    if (!selectedGroupId) return;
    setActionLoading(true);
    try {
      const userToInvite = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!userToInvite) return alert("Usuário não encontrado.");
      await api.post(`/api/v1/groups/${selectedGroupId}/members`, { user_id: userToInvite.id });
      await loadGroups(currentPage);
    } catch (err) { alert("Erro ao adicionar."); }
    finally { setActionLoading(false); }
  };

  const handleRemoveUserFromGroup = async (userId, userName) => {
    if (!window.confirm(`Remover ${userName}?`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/v1/groups/${selectedGroupId}/members/${userId}`);
      await loadGroups(currentPage);
    } catch (err) { alert("Erro ao remover."); }
    finally { setActionLoading(false); }
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
          setShowPermissionModal(false);
          setShowGroupForm(false);
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
              actionLoading={actionLoading}
              onUpdate={handleUpdateUser}
              onAction={async (type) => {
                if (type === "promote") await handleToggleAdmin(selectedUser.id, false);
                else if (type === "remove-admin") await handleToggleAdmin(selectedUser.id, true);
                else if (type === "toggle-status") await handleToggleStatus(selectedUser.id, selectedUser.is_active);
                else if (type === "delete") await handleDeleteUser(selectedUser.id, selectedUser.name);
              }}
            />
          ) : selectedGroupId ? (
            <GroupDetail
              group={groups.find((g) => g.id === selectedGroupId)}
              onBack={() => setSelectedGroupId(null)}
              isSystemAdmin={isGlobalAdmin}
              currentUserId={currentUser?.id}
              actionLoading={actionLoading}
              onAddUser={handleAddUserToGroup}
              onRemoveUser={handleRemoveUserFromGroup}
              onPromoteUser={(uid) => handleGroupMemberRole(uid, "promote")}
              onDemoteUser={(uid) => handleGroupMemberRole(uid, "demote")}
              onDeleteGroup={(id) => api.delete(`/api/v1/groups/${id}`).then(() => { setSelectedGroupId(null); loadGroups(1); })}
            />
          ) : (
            <>
              {activeTab !== "permissions" && (
                <DashboardFilters
                  activeTab={activeTab} role={role} filters={filters}
                  onFilterChange={(e) => setFilters({ ...filters, [e.target.name]: e.target.value })}
                  onClear={() => setFilters({ name: "", completed: "", method: "", date: "" })}
                  onNewGroup={() => setShowGroupForm(true)}
                />
              )}

              <div className={`tab-wrapper position-relative ${loading || actionLoading ? "is-loading" : ""}`}>
                {(loading || actionLoading) && (
                  <div className="loading-overlay"><Spinner animation="border" variant="primary" /></div>
                )}

                <div className="content-card">
                  {activeTab === "users" && (
                    <UserTable 
                      users={users} 
                      onViewDetail={(id) => api.get(`/api/v1/admin/users/${id}`).then(res => setSelectedUser(res.data.data || res.data))}
                      onDeleteUser={handleDeleteUser}
                      onToggleAdmin={handleToggleAdmin}
                      isGlobalAdmin={isGlobalAdmin}
                    />
                  )}
                  {activeTab === "audit" && <AuditTable logs={auditLogs} />}
                  {activeTab === "groups" && (
                    showGroupForm ? (
                      <GroupForm onCancel={() => setShowGroupForm(false)} onUpdate={() => { setShowGroupForm(false); loadGroups(1); }} />
                    ) : (
                      <GroupTable groups={groups} onViewDetail={setSelectedGroupId} isGlobalAdmin={isGlobalAdmin} currentUser={currentUser} />
                    )
                  )}
                  {activeTab === "permissions" && <PermissionTable permissions={permissions} loading={loading} />}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
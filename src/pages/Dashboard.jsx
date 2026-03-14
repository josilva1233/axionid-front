import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Spinner, Modal, Form, Button } from "react-bootstrap";
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

  // Estados para Permissões
  const [permissions, setPermissions] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false); // Usado para controlar a exibição do PermissionForm
  const [newPermission, setNewPermission] = useState({ name: "", label: "" });

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
      console.error("Erro ao carregar permissões:", err);
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

  // --- FUNÇÃO ADICIONAR PERMISSÃO (Agora recebe dados do PermissionForm) ---
  const handleCreatePermission = async (data) => {
    setActionLoading(true);
    try {
      await api.post("/api/v1/admin/permissions", data);
      setShowPermissionModal(false);
      await loadPermissions(); 
      alert("Permissão criada com sucesso!");
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao criar permissão.");
    } finally { setActionLoading(false); }
  };

  // --- CORREÇÃO: ALTERAR CARGO NO GRUPO (PROMOTE/DEMOTE) ---
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

  // --- OUTROS HANDLERS ---
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
          setShowPermissionModal(false); // Reseta o form ao trocar de aba
          setShowGroupForm(false); // Reseta o form ao trocar de aba
        }}
      />

      <div className="main-wrapper">
        <header className="main-header d-flex justify-content-between align-items-center p-3">
          <h2 className="brand mb-0" style={{ fontSize: "1.25rem" }}>AxionID Admin</h2>
          {currentUser && <UserDropdown user={currentUser} onLogout={handleLogout} />}
        </header>

        <main className="content-area p-4">
          
          {/* Cabeçalho da Aba de Permissões */}
          {activeTab === "permissions" && !selectedUser && !selectedGroupId && (
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="text-white mb-0">Gestão de Permissões</h4>
              {!showPermissionModal && (
                <button 
                  className="btn-primary-axion px-4 py-2" 
                  onClick={() => setShowPermissionModal(true)}
                >
                  + Nova Permissão
                </button>
              )}
            </div>
          )}

          {selectedUser ? (
            <UserDetail user={selectedUser} onBack={() => setSelectedUser(null)} />
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

              {/* Inclusão do PermissionForm (Estilo Card igual ao GroupForm) */}
              {activeTab === "permissions" && showPermissionModal && (
                <PermissionForm 
                  loading={actionLoading}
                  onCancel={() => setShowPermissionModal(false)}
                  onSave={handleCreatePermission} 
                />
              )}

              <div className={`tab-wrapper position-relative ${loading || actionLoading ? "is-loading" : ""}`}>
                {(loading || actionLoading) && (
                  <div className="loading-overlay"><Spinner animation="border" variant="primary" /></div>
                )}

                <div className="content-card">
                  {activeTab === "users" && <UserTable users={users} onViewDetail={(id) => api.get(`/api/v1/admin/users/${id}`).then(res => setSelectedUser(res.data.data || res.data))} />}
                  {activeTab === "audit" && <AuditTable logs={auditLogs} />}
                  {activeTab === "groups" && (
                    showGroupForm ? (
                      <GroupForm onCancel={() => setShowGroupForm(false)} onUpdate={() => { setShowGroupForm(false); loadGroups(1); }} />
                    ) : (
                      <GroupTable groups={groups} onViewDetail={setSelectedGroupId} isGlobalAdmin={isGlobalAdmin} currentUser={currentUser} />
                    )
                  )}
                  {activeTab === "permissions" && (
                    <PermissionTable permissions={permissions} loading={loading} />
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
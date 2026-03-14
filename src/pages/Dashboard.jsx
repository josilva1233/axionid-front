import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react"; // useCallback adicionado
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
import PermissionTable from "../components/dashboard/PermissionTable";

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
  const [showPermissionForm, setShowPermissionForm] = useState(false);

  const {
    loading,
    users,
    groups,
    auditLogs,
    filters,
    setFilters,
    loadUsers,
    loadGroups,
    loadAuditLogs,
  } = useDashboardData(role);

  // Função para carregar permissões da API
  const loadPermissions = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/permissions");
      setPermissions(res.data.data || res.data);
    } catch (err) {
      console.error("Erro ao carregar permissões:", err);
    }
  }, []);

  // Define se é Admin Global
  const isGlobalAdmin = role === "admin" || currentUser?.is_admin === true;

  // Carrega Perfil do Usuário Logado
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/api/v1/me");
        setCurrentUser(res.data);
      } catch {
        navigate("/login");
      }
    };
    loadProfile();
  }, [navigate]);

  // Gerenciador central de carga de dados conforme a Aba Ativa
  useEffect(() => {
    if (activeTab === "users") loadUsers(currentPage);
    else if (activeTab === "audit") loadAuditLogs(currentPage);
    else if (activeTab === "groups") loadGroups(currentPage);
    else if (activeTab === "permissions") loadPermissions();
  }, [activeTab, currentPage, loadUsers, loadGroups, loadAuditLogs, loadPermissions]);

  // --- FUNÇÕES DE GERENCIAMENTO DE GRUPOS ---

  const handleAddUserToGroup = async (email) => {
    if (!selectedGroupId) return;
    setActionLoading(true);
    try {
      const userToInvite = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );

      if (!userToInvite) {
        alert("Usuário não encontrado na lista atual.");
        return;
      }

      await api.post(`/api/v1/groups/${selectedGroupId}/members`, {
        user_id: userToInvite.id,
      });

      alert("Membro adicionado!");
      await loadGroups(currentPage);
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao adicionar membro.");
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
      alert("Erro ao remover membro.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleGroupMemberRole = async (userId, type) => {
    setActionLoading(true);
    try {
      const endpoint = `/api/v1/groups/${selectedGroupId}/members/${userId}/${type}`;
      await api.patch(endpoint);
      await loadGroups(currentPage);
    } catch (err) {
      alert("Erro ao alterar cargo.");
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

  const handleViewUserDetail = async (id) => {
    setActionLoading(true);
    try {
      const res = await api.get(`/api/v1/admin/users/${id}`);
      setSelectedUser(res.data.data || res.data);
    } catch (err) {
      alert("Erro ao buscar detalhes.");
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
        activeTab={activeTab}
        role={role}
        onLogout={handleLogout}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedUser(null);
          setSelectedGroupId(null);
        }}
      />

      <div className="main-wrapper">
        <header className="main-header d-flex justify-content-between align-items-center p-3">
          <h2 className="brand mb-0" style={{ fontSize: "1.25rem" }}>
            AxionID Admin
          </h2>
          {currentUser && (
            <UserDropdown user={currentUser} onLogout={handleLogout} />
          )}
        </header>

        <main className="content-area p-4">
          {/* 1. Detalhe do Usuário */}
          {selectedUser && (
            <UserDetail
              user={selectedUser}
              onBack={() => setSelectedUser(null)}
            />
          )}

          {/* 2. Detalhe do Grupo */}
          {!selectedUser && selectedGroupId && (
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
              onDeleteGroup={handleDeleteGroup}
            />
          )}

          {/* 3. Visão das Abas Principais */}
          {!selectedUser && !selectedGroupId && (
            <>
              <DashboardFilters
                activeTab={activeTab}
                role={role}
                filters={filters}
                onFilterChange={(e) =>
                  setFilters({ ...filters, [e.target.name]: e.target.value })
                }
                onClear={() =>
                  setFilters({ name: "", completed: "", method: "", date: "" })
                }
                onNewGroup={() => setShowGroupForm(true)}
              />

              <div className={`tab-wrapper position-relative ${loading || actionLoading ? "is-loading" : ""}`}>
                {(loading || actionLoading) && (
                  <div className="loading-overlay">
                    <Spinner animation="border" variant="primary" />
                  </div>
                )}

                <div className="content-card">
                  {activeTab === "users" && (
                    <UserTable users={users} onViewDetail={handleViewUserDetail} />
                  )}
                  
                  {activeTab === "audit" && (
                    <AuditTable logs={auditLogs} />
                  )}

                  {activeTab === "groups" && (
                    showGroupForm ? (
                      <GroupForm
                        onCancel={() => setShowGroupForm(false)}
                        onUpdate={() => {
                          setShowGroupForm(false);
                          loadGroups(1);
                        }}
                      />
                    ) : (
                      <GroupTable
                        groups={groups}
                        onViewDetail={setSelectedGroupId}
                        isGlobalAdmin={isGlobalAdmin}
                        currentUser={currentUser}
                      />
                    )
                  )}

                  {activeTab === "permissions" && (
                    <div className="animate-in">
                      <div className="d-flex justify-content-between align-items-center mb-4 p-2">
                        <h5 className="text-white mb-0">Permissões do Sistema</h5>
                        <button
                          className="btn-primary-axion btn-sm px-3"
                          onClick={() => setShowPermissionForm(true)}
                        >
                          Nova Permissão
                        </button>
                      </div>
                      <PermissionTable permissions={permissions} loading={loading} />
                    </div>
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
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

  // ... outros states
  const [permissions, setPermissions] = useState([]); // ADICIONE ESTA LINHA
  const [showPermissionForm, setShowPermissionForm] = useState(false);

  // Função para carregar permissões da API
  const loadPermissions = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/permissions");
      // Ajuste conforme a estrutura do seu retorno (res.data ou res.data.data)
      setPermissions(res.data.data || res.data);
    } catch (err) {
      console.error("Erro ao carregar permissões:", err);
    }
  }, []);

  // No seu useEffect que monitora as abas, adicione a chamada:
  useEffect(() => {
    if (activeTab === "users") loadUsers(currentPage);
    else if (activeTab === "audit") loadAuditLogs(currentPage);
    else if (activeTab === "groups") loadGroups(currentPage);
    else if (activeTab === "permissions") loadPermissions(); // ADICIONE ESTA LINHA
  }, [
    activeTab,
    currentPage,
    loadUsers,
    loadGroups,
    loadAuditLogs,
    loadPermissions,
  ]);

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

  // Define se é Admin Global para ignorar travas de edição
  const isGlobalAdmin = role === "admin" || currentUser?.is_admin === true;

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

  useEffect(() => {
    if (activeTab === "users") loadUsers(currentPage);
    else if (activeTab === "audit") loadAuditLogs(currentPage);
    else if (activeTab === "groups") loadGroups(currentPage);
  }, [activeTab, currentPage, loadUsers, loadGroups, loadAuditLogs]);

  // --- FUNÇÕES DE GERENCIAMENTO DE GRUPOS (ALINHADAS COM OPENAPI) ---

  const handleAddUserToGroup = async (email) => {
    if (!selectedGroupId) return;
    setActionLoading(true);
    try {
      // O seu Swagger exige user_id. Buscamos o ID na nossa lista de usuários pelo e-mail
      const userToInvite = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );

      if (!userToInvite) {
        alert(
          "Usuário não encontrado na lista. Ele precisa estar cadastrado no sistema.",
        );
        return;
      }

      await api.post(`/api/v1/groups/${selectedGroupId}/members`, {
        user_id: userToInvite.id,
      });

      alert("Membro adicionado com sucesso!");
      await loadGroups(currentPage); // Recarrega para atualizar a lista de membros no componente
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
      // URLs conforme seu OpenAPI: .../members/{user_id}/promote ou .../members/{user_id}/demote
      const endpoint = `/api/v1/groups/${selectedGroupId}/members/${userId}/${type}`;
      await api.patch(endpoint);
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

  // --- FUNÇÕES DE USUÁRIOS ---

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
        {activeTab === "permissions" && (
          <div className="content-card">
            <div className="d-flex justify-content-between align-items-center mb-4 p-3 border-bottom-theme">
              <h5 className="text-white mb-0">
                Controle de Acessos & Permissões
              </h5>
            </div>
            <PermissionTable permissions={permissions} loading={loading} />
          </div>
        )}
        <main className="content-area p-4">
          {selectedUser ? (
            <UserDetail
              user={selectedUser}
              onBack={() => setSelectedUser(null)}
            />
          ) : selectedGroupId ? (
            <GroupDetail
              group={groups.find((g) => g.id === selectedGroupId)}
              onBack={() => setSelectedGroupId(null)}
              isSystemAdmin={isGlobalAdmin} // Alinhado com a prop do seu GroupDetail
              currentUserId={currentUser?.id}
              actionLoading={actionLoading}
              onAddUser={handleAddUserToGroup}
              onRemoveUser={handleRemoveUserFromGroup}
              onPromoteUser={(uid) => handleGroupMemberRole(uid, "promote")}
              onDemoteUser={(uid) => handleGroupMemberRole(uid, "demote")}
              onDeleteGroup={handleDeleteGroup}
            />
          ) : (
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

              <div
                className={`tab-wrapper position-relative ${loading || actionLoading ? "is-loading" : ""}`}
              >
                {(loading || actionLoading) && (
                  <div className="loading-overlay">
                    <Spinner animation="border" variant="primary" />
                  </div>
                )}

                <div className="content-card">
                  {activeTab === "users" && (
                    <UserTable
                      users={users}
                      onViewDetail={handleViewUserDetail}
                    />
                  )}
                  {activeTab === "audit" && <AuditTable logs={auditLogs} />}
                  {activeTab === "groups" &&
                    (showGroupForm ? (
                      <GroupForm
                        onCancel={() => setShowGroupForm(false)}
                        onUpdate={() => loadGroups(1)}
                      />
                    ) : (
                      <GroupTable
                        groups={groups}
                        onViewDetail={setSelectedGroupId}
                        isGlobalAdmin={isGlobalAdmin}
                        currentUser={currentUser}
                      />
                    ))}
                </div>
              </div>
            </>
          )}
        </main>
        {activeTab === "permissions" && (
          <div className="animate-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="text-white mb-0">Gestão de Permissões</h3>
              <button
                className="btn-primary-axion px-4"
                onClick={() => setShowPermissionForm(true)}
              >
                Nova Permissão
              </button>
            </div>

            <div className="content-card">
              <PermissionTable permissions={permissions} loading={loading} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

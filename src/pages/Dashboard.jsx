import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Spinner, Modal, Form, Button } from "react-bootstrap"; // Importações para o Modal
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

  // --- PERMISSÕES ---
  const [permissions, setPermissions] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [newPermission, setNewPermission] = useState({ name: "", label: "" });

  const {
    loading, users, groups, auditLogs, filters, 
    setFilters, loadUsers, loadGroups, loadAuditLogs 
  } = useDashboardData(role);

  const isGlobalAdmin = role === "admin" || currentUser?.is_admin === true;

  const loadPermissions = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/admin/permissions");
      setPermissions(res.data.data || res.data || []);
    } catch (err) {
      console.error("Erro ao carregar permissões:", err);
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

  // --- FUNÇÃO ADICIONAR PERMISSÃO (NOVO) ---
  const handleCreatePermission = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.post("/api/v1/admin/permissions", newPermission);
      setShowPermissionModal(false);
      setNewPermission({ name: "", label: "" });
      loadPermissions();
    } catch (err) {
      alert("Erro ao criar permissão. Verifique se o slug já existe.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- FUNÇÕES DE GRUPO ---
  const handleGroupMemberRole = async (userId, type) => {
    setActionLoading(true);
    try {
      // Corrigido para bater com api.php: /{group_id}/members/{user_id}/promote ou /demote
      // Nota: No seu PHP o demote usa a variável {group_id} mas o promote usa {id}. 
      // Ajustamos para a rota que você definiu.
      const url = type === 'promote' 
        ? `/api/v1/groups/${selectedGroupId}/members/${userId}/promote`
        : `/api/v1/groups/${selectedGroupId}/members/${userId}/demote`;
        
      await api.patch(url);
      loadGroups(currentPage);
    } catch (err) {
      alert("Erro ao alterar privilégios no grupo.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddUserToGroup = async (email) => {
    if (!selectedGroupId) return;
    setActionLoading(true);
    try {
      const userToInvite = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!userToInvite) return alert("Usuário não encontrado.");
      await api.post(`/api/v1/groups/${selectedGroupId}/members`, { user_id: userToInvite.id });
      loadGroups(currentPage);
    } catch (err) { alert("Erro ao adicionar."); }
    finally { setActionLoading(false); }
  };

  const handleRemoveUserFromGroup = async (userId, userName) => {
    if (!window.confirm(`Remover ${userName}?`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/v1/groups/${selectedGroupId}/members/${userId}`);
      loadGroups(currentPage);
    } catch (err) { alert("Erro ao remover."); }
    finally { setActionLoading(false); }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm("Excluir grupo?")) return;
    setActionLoading(true);
    try {
      await api.delete(`/api/v1/groups/${groupId}`);
      setSelectedGroupId(null);
      loadGroups(1);
    } catch (err) { alert("Erro ao excluir."); }
    finally { setActionLoading(false); }
  };

  const handleViewUserDetail = async (id) => {
    setActionLoading(true);
    try {
      const res = await api.get(`/api/v1/admin/users/${id}`);
      setSelectedUser(res.data.data || res.data);
    } catch (err) { alert("Erro ao buscar detalhes."); }
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
        }}
      />

      <div className="main-wrapper">
        <header className="main-header d-flex justify-content-between align-items-center p-3">
          <h2 className="brand mb-0" style={{ fontSize: "1.25rem" }}>AxionID Admin</h2>
          {currentUser && <UserDropdown user={currentUser} onLogout={handleLogout} />}
        </header>

        <main className="content-area p-4">
          {/* Botão Nova Permissão no topo (quando aba ativa) */}
          {activeTab === "permissions" && !selectedUser && !selectedGroupId && (
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="text-white mb-0">Gestão de Permissões</h3>
              <button className="btn-primary-axion px-4" onClick={() => setShowPermissionModal(true)}>
                + Nova Permissão
              </button>
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
              onDeleteGroup={handleDeleteGroup}
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
                  {activeTab === "users" && <UserTable users={users} onViewDetail={handleViewUserDetail} />}
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

      {/* Modal para Adicionar Permissão */}
      <Modal show={showPermissionModal} onHide={() => setShowPermissionModal(false)} centered contentClassName="bg-dark text-white border-secondary">
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title>Criar Nova Permissão</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreatePermission}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nome Amigável (Label)</Form.Label>
              <Form.Control 
                type="text" placeholder="Ex: Deletar Usuários" required
                value={newPermission.label}
                onChange={(e) => setNewPermission({...newPermission, label: e.target.value})}
                className="bg-secondary border-0 text-white"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Slug do Sistema (Name)</Form.Label>
              <Form.Control 
                type="text" placeholder="Ex: users.delete" required
                value={newPermission.name}
                onChange={(e) => setNewPermission({...newPermission, name: e.target.value})}
                className="bg-secondary border-0 text-white"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-light" onClick={() => setShowPermissionModal(false)}>Cancelar</Button>
            <Button variant="primary" type="submit" disabled={actionLoading}>
              {actionLoading ? "Salvando..." : "Criar Permissão"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
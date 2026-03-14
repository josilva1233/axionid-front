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
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);

  // Configuração do Alerta Customizado (Axion Style)
  const AxionAlert = Swal.mixin({
    background: '#111214',
    color: '#ffffff',
    confirmButtonColor: '#6f42c1', 
    cancelButtonColor: '#343a40',
    customClass: {
      popup: 'border border-secondary rounded-4',
      confirmButton: 'px-4 py-2 rounded-3 fw-bold mx-2',
      cancelButton: 'px-4 py-2 rounded-3 fw-bold mx-2'
    }
  });

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

  // --- GESTÃO DE USUÁRIOS ---
  const handleUpdateUser = async (userId, data) => {
    setActionLoading(true);
    try {
      await api.put(`/api/v1/admin/users/${userId}/update-manual`, data);
      AxionAlert.fire({ icon: 'success', title: 'Atualizado!', text: 'Dados salvos.', timer: 1500, showConfirmButton: false });
      const res = await api.get(`/api/v1/admin/users/${userId}`);
      setSelectedUser(res.data.data || res.data);
      loadUsers(currentPage);
    } catch (err) {
      AxionAlert.fire('Erro!', 'Falha ao atualizar.', 'error');
    } finally { setActionLoading(false); }
  };

  const handleDeleteUser = async (userId, userName) => {
    const result = await AxionAlert.fire({
      title: 'Excluir usuário?',
      text: `Remover permanentemente ${userName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir'
    });
    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        await api.delete(`/api/v1/admin/users/${userId}`);
        AxionAlert.fire('Removido!', '', 'success');
        setSelectedUser(null);
        loadUsers(currentPage);
      } catch (err) { AxionAlert.fire('Erro!', 'Falha ao excluir.', 'error'); }
      finally { setActionLoading(false); }
    }
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    const endpoint = currentStatus ? "remove-admin" : "promote";
    const result = await AxionAlert.fire({
      title: 'Alterar Privilégios?',
      text: currentStatus ? "Remover cargo de administrador?" : "Promover a administrador?",
      icon: 'question',
      showCancelButton: true
    });
    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        await api.post(`/api/v1/admin/users/${userId}/${endpoint}`);
        AxionAlert.fire('Sucesso!', 'Acesso atualizado.', 'success');
        const res = await api.get(`/api/v1/admin/users/${userId}`);
        setSelectedUser(res.data.data || res.data);
        loadUsers(currentPage);
      } catch (err) { AxionAlert.fire('Erro!', 'Operação negada.', 'error'); }
      finally { setActionLoading(false); }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? "suspender" : "ativar";
    const result = await AxionAlert.fire({
      title: 'Mudar status?',
      text: `Deseja ${action} este usuário?`,
      icon: 'warning',
      showCancelButton: true
    });
    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        await api.patch(`/api/v1/admin/users/${userId}/toggle-status`);
        AxionAlert.fire('Feito!', `Usuário ${action}ado.`, 'success');
        const res = await api.get(`/api/v1/admin/users/${userId}`);
        setSelectedUser(res.data.data || res.data);
        loadUsers(currentPage);
      } catch (err) { AxionAlert.fire('Erro!', 'Falha no status.', 'error'); }
      finally { setActionLoading(false); }
    }
  };

  // --- GESTÃO DE PERMISSÕES ---
  const handleCreatePermission = async (data) => {
    setActionLoading(true);
    try {
      await api.post("/api/v1/admin/permissions", data);
      AxionAlert.fire({ icon: 'success', title: 'Criada!', text: 'Permissão registrada.', timer: 2000, showConfirmButton: false });
      setShowPermissionForm(false);
      loadPermissions();
    } catch (err) {
      AxionAlert.fire('Erro!', 'Falha ao criar. Verifique se o slug é único.', 'error');
    } finally { setActionLoading(false); }
  };

  const handleDeletePermission = async (id) => {
    const result = await AxionAlert.fire({ title: 'Excluir?', text: "Esta ação é permanente.", icon: 'warning', showCancelButton: true });
    if (result.isConfirmed) {
      try {
        await api.delete(`/api/v1/admin/permissions/${id}`);
        loadPermissions();
        AxionAlert.fire('Removida!', '', 'success');
      } catch (err) { AxionAlert.fire('Erro', 'Não foi possível excluir.', 'error'); }
    }
  };

  // --- LOGOUT ---
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
          setShowPermissionForm(false);
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
              user={selectedUser} onBack={() => setSelectedUser(null)} actionLoading={actionLoading} onUpdate={handleUpdateUser}
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
              isSystemAdmin={isGlobalAdmin} currentUserId={currentUser?.id} actionLoading={actionLoading}
            />
          ) : (
            <>
              <DashboardFilters
                activeTab={activeTab} role={role} filters={filters}
                onFilterChange={(e) => setFilters({ ...filters, [e.target.name]: e.target.value })}
                onClear={() => setFilters({ name: "", completed: "", method: "", date: "" })}
                onNewGroup={() => setShowGroupForm(true)}
                onNewPermission={() => setShowPermissionForm(true)}
              />

              <div className={`tab-wrapper position-relative ${loading || actionLoading ? "is-loading" : ""}`}>
                {(loading || actionLoading) && (
                  <div className="loading-overlay"><Spinner animation="border" variant="primary" /></div>
                )}

                <div className="content-card">
                  {activeTab === "users" && (
                    <UserTable 
                      users={users} 
                      onViewDetail={(id) => api.get(`/api/v1/admin/users/${id}`).then(res => setSelectedUser(res.data.data || res.data))}
                      onDeleteUser={handleDeleteUser} onToggleAdmin={handleToggleAdmin} isGlobalAdmin={isGlobalAdmin}
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
                  {activeTab === "permissions" && (
                    showPermissionForm ? (
                      <PermissionForm onCancel={() => setShowPermissionForm(false)} onSubmit={handleCreatePermission} />
                    ) : (
                      <PermissionTable permissions={permissions} loading={loading} onDelete={handleDeletePermission} />
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
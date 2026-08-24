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
import OperationView from "../components/dashboard/OperationView";
import ServiceOrderTable from "../components/dashboard/ServiceOrderTable";
import ServiceOrderForm from "../components/dashboard/ServiceOrderForm";
import ServiceOrderDetail from "../components/dashboard/ServiceOrderDetail";
import Pagination from "../components/dashboard/Pagination";
import PermissionDetail from "../components/dashboard/PermissionDetail";

import '../dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [role] = useState(localStorage.getItem("@AxionID:role"));
  const [activeTab, setActiveTab] = useState("users");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Estados para paginação
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [groupsCurrentPage, setGroupsCurrentPage] = useState(1);
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1);
  const [permissionsCurrentPage, setPermissionsCurrentPage] = useState(1);

  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#343a40",
    customClass: {
      popup: "border border-secondary rounded-4",
      confirmButton: "px-4 py-2 rounded-3 fw-bold mx-2",
      cancelButton: "px-4 py-2 rounded-3 fw-bold mx-2",
    },
  });

  const {
    loading,
    users,
    groups,
    auditLogs,
    serviceOrders,
    permissions,
    usersPagination,
    groupsPagination,
    auditPagination,
    ordersPagination,
    permissionsPagination,
    filters,
    setFilters,
    loadUsers,
    loadGroups,
    loadAuditLogs,
    loadServiceOrders,
    loadPermissions,
  } = useDashboardData(role);

  const isGlobalAdmin = role === "admin" || currentUser?.is_admin === true;

  // ============ HANDLERS PARA TABS E FILTROS ============
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedUser(null);
    setSelectedGroupId(null);
    setShowPermissionModal(false);
    setShowGroupForm(false);
    setSelectedOrder(null);
    setSelectedPermission(null);
    setUsersCurrentPage(1);
    setGroupsCurrentPage(1);
    setAuditCurrentPage(1);
    setOrdersCurrentPage(1);
    setPermissionsCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ 
      name: "", 
      completed: "", 
      user: "",
      url: "",
      method: "", 
      start_date: "",
      end_date: "",
      protocol: "",
      title: "",
      applicant: "",
      priority: "",
      status: "",
      label: "",
      perm_name: ""
    });
    setUsersCurrentPage(1);
    setGroupsCurrentPage(1);
    setAuditCurrentPage(1);
    setOrdersCurrentPage(1);
    setPermissionsCurrentPage(1);
  };

  // ============ HANDLERS DE ORDENS DE SERVIÇO ============
  const handleOpenOrderDetail = async (orderId) => {
    setActionLoading(true);
    setShowOrderForm(false);
    try {
      const res = await api.get(`/api/v1/service-orders/${orderId}`);
      setSelectedOrder(res.data.data || res.data);
    } catch (err) {
      AxionAlert.fire(
        "Erro",
        "Não foi possível carregar os detalhes desta OS.",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const onUpdateStatus = async (orderId, newStatus) => {
    if (!orderId) {
      return AxionAlert.fire(
        "Erro",
        "Não foi possível identificar o ID da OS.",
        "error",
      );
    }

    try {
      setActionLoading(true);
      const res = await api.put(`/api/v1/service-orders/${orderId}`, {
        status: newStatus,
      });
      const updatedOrder = res.data.data || res.data;
      setSelectedOrder(updatedOrder);
      await loadServiceOrders(ordersCurrentPage);
      
      AxionAlert.fire({
        icon: "success",
        title: "Status Atualizado!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Erro na API:", err);
      AxionAlert.fire("Erro", err.response?.data?.message || "Falha ao atualizar no servidor.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditOrder = async (orderId, data) => {
    try {
      setActionLoading(true);
      await api.put(`/api/v1/service-orders/${orderId}`, data);
      await loadServiceOrders(ordersCurrentPage);
      AxionAlert.fire({
        icon: "success",
        title: "OS atualizada!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      AxionAlert.fire("Erro", err.response?.data?.message || "Falha ao atualizar OS.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const result = await AxionAlert.fire({
      title: "Excluir OS?",
      text: "Esta ação não pode ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar",
      background: "#111214",
      color: "#ffffff",
      confirmButtonColor: "#6366f1",
    });
    
    if (result.isConfirmed) {
      try {
        setActionLoading(true);
        await api.delete(`/api/v1/service-orders/${orderId}`);
        await loadServiceOrders(ordersCurrentPage);
        AxionAlert.fire({
          icon: "success",
          title: "Deletado!",
          text: "Ordem de serviço removida.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (e) {
        AxionAlert.fire("Erro", "Falha ao excluir a OS.", "error");
      } finally {
        setActionLoading(false);
      }
    }
  };

  // ============ HANDLERS DE PERMISSÕES ============
  const handleCreatePermission = async (data) => {
    setActionLoading(true);
    try {
      await api.post("/api/v1/admin/permissions", data);
      AxionAlert.fire({
        icon: "success",
        title: "Criada!",
        text: "Permissão registrada.",
        timer: 2000,
        showConfirmButton: false,
      });
      setShowPermissionModal(false);
      loadPermissions(permissionsCurrentPage);
    } catch (err) {
      AxionAlert.fire("Erro!", "Não foi possível criar a permissão.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPermissionDetail = async (permissionId) => {
    try {
      setActionLoading(true);
      const res = await api.get(`/api/v1/admin/permissions/${permissionId}`);
      setSelectedPermission(res.data.data || res.data);
    } catch (err) {
      AxionAlert.fire("Erro", "Não foi possível carregar os detalhes da permissão.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditPermission = async (permissionId, data) => {
    try {
      setActionLoading(true);
      await api.put(`/api/v1/admin/permissions/${permissionId}`, data);
      await loadPermissions(permissionsCurrentPage);
      const res = await api.get(`/api/v1/admin/permissions/${permissionId}`);
      setSelectedPermission(res.data.data || res.data);
      AxionAlert.fire({
        icon: "success",
        title: "Permissão atualizada!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      AxionAlert.fire("Erro", err.response?.data?.message || "Falha ao atualizar permissão.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePermission = async (permissionId) => {
    try {
      setActionLoading(true);
      await api.delete(`/api/v1/admin/permissions/${permissionId}`);
      setSelectedPermission(null);
      await loadPermissions(permissionsCurrentPage);
      AxionAlert.fire({
        icon: "success",
        title: "Permissão excluída!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      AxionAlert.fire("Erro", err.response?.data?.message || "Falha ao excluir permissão.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ============ LOAD PROFILE ============
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

  // ============ CARREGAR DADOS POR ABA ============
  useEffect(() => {
    const loadData = async () => {
      if (activeTab === "users") {
        await loadUsers(usersCurrentPage);
      } else if (activeTab === "audit") {
        await loadAuditLogs(auditCurrentPage);
      } else if (activeTab === "groups") {
        await loadGroups(groupsCurrentPage);
      } else if (activeTab === "permissions") {
        await loadPermissions(permissionsCurrentPage);
      } else if (activeTab === "orders") {
        await loadServiceOrders(ordersCurrentPage);
      }
    };

    loadData();
  }, [
    activeTab,
    usersCurrentPage,
    groupsCurrentPage,
    auditCurrentPage,
    ordersCurrentPage,
    permissionsCurrentPage,
    loadUsers,
    loadGroups,
    loadAuditLogs,
    loadPermissions,
    loadServiceOrders,
  ]);

  // ============ RECARREGAR ORDENS QUANDO FILTROS MUDAREM ============
  useEffect(() => {
    if (activeTab === "orders") {
      loadServiceOrders(1);
      setOrdersCurrentPage(1);
    }
  }, [
    filters.protocol,
    filters.title,
    filters.applicant,
    filters.priority,
    filters.status,
    loadServiceOrders,
    activeTab,
  ]);

  // ============ RECARREGAR USUÁRIOS QUANDO FILTROS MUDAREM ============
  useEffect(() => {
    if (activeTab === "users") {
      loadUsers(1);
      setUsersCurrentPage(1);
    }
  }, [filters.name, filters.completed, loadUsers, activeTab]);

  // ============ RECARREGAR GRUPOS QUANDO FILTROS MUDAREM ============
  useEffect(() => {
    if (activeTab === "groups") {
      loadGroups(1);
      setGroupsCurrentPage(1);
    }
  }, [filters.name, loadGroups, activeTab]);

  // ============ RECARREGAR AUDIT QUANDO FILTROS MUDAREM ============
  useEffect(() => {
    if (activeTab === "audit") {
      loadAuditLogs(1);
      setAuditCurrentPage(1);
    }
  }, [
    filters.user,
    filters.url,
    filters.method,
    filters.start_date,
    filters.end_date,
    loadAuditLogs,
    activeTab,
  ]);

  // ============ RECARREGAR PERMISSÕES QUANDO FILTROS MUDAREM ============
  useEffect(() => {
    if (activeTab === "permissions") {
      loadPermissions(1);
      setPermissionsCurrentPage(1);
    }
  }, [
    filters.label,
    filters.perm_name,
    loadPermissions,
    activeTab,
  ]);

  // ============ ATUALIZAR FORM DATA QUANDO USUÁRIO SELECIONADO ============
  useEffect(() => {
    if (selectedUser) {
      const userData = selectedUser.data || selectedUser;
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        cpf_cnpj: userData.cpf_cnpj || "",
        zip_code: userData.address?.zip_code || "",
        street: userData.address?.street || "",
        number: userData.address?.number || "",
        neighborhood: userData.address?.neighborhood || "",
        city: userData.address?.city || "",
        state: userData.address?.state || "",
        complement: userData.address?.complement || "",
      });
    }
  }, [selectedUser]);

  // ============ HANDLERS DE PAGINAÇÃO ============
  const handleUsersPageChange = (page) => {
    setUsersCurrentPage(page);
  };

  const handleGroupsPageChange = (page) => {
    setGroupsCurrentPage(page);
  };

  const handleAuditPageChange = (page) => {
    setAuditCurrentPage(page);
  };

  const handleOrdersPageChange = (page) => {
    setOrdersCurrentPage(page);
  };

  const handlePermissionsPageChange = (page) => {
    setPermissionsCurrentPage(page);
  };

  // ============ HANDLERS DE USUÁRIOS ============
  const handleUpdateUser = async (userId, data) => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await api.put(`/api/v1/admin/users/${userId}/update-manual`, data);
      AxionAlert.fire({
        icon: "success",
        title: "Sucesso!",
        text: "Perfil atualizado.",
        timer: 1500,
        showConfirmButton: false,
      });
      const res = await api.get(`/api/v1/admin/users/${userId}`);
      setSelectedUser(res.data.data || res.data);
      setIsEditing(false);
      loadUsers(usersCurrentPage);
    } catch (err) {
      AxionAlert.fire(
        "Erro!",
        "Não foi possível salvar as alterações.",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const result = await AxionAlert.fire({
      title: "Excluir usuário?",
      text: `Deseja realmente remover permanentemente ${userName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        await api.delete(`/api/v1/admin/users/${userId}`);
        AxionAlert.fire("Removido!", "Usuário deletado do sistema.", "success");
        setSelectedUser(null);
        loadUsers(usersCurrentPage);
      } catch (err) {
        AxionAlert.fire("Erro!", "Falha ao excluir usuário.", "error");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    const endpoint = currentStatus ? "remove-admin" : "promote";
    const actionText = currentStatus
      ? "rebaixar para usuário comum"
      : "promover a administrador";

    const result = await AxionAlert.fire({
      title: "Alterar Privilégios?",
      text: `Deseja realmente ${actionText}?`,
      icon: "question",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        await api.post(`/api/v1/admin/users/${userId}/${endpoint}`);
        AxionAlert.fire("Sucesso!", "Nível de acesso alterado.", "success");
        const res = await api.get(`/api/v1/admin/users/${userId}`);
        setSelectedUser(res.data.data || res.data);
        loadUsers(usersCurrentPage);
      } catch (err) {
        AxionAlert.fire("Erro!", "Não foi possível alterar o cargo.", "error");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? "suspender" : "ativar";

    const result = await AxionAlert.fire({
      title: "Status da Conta",
      text: `Deseja ${action} o acesso deste usuário?`,
      icon: "warning",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        await api.patch(`/api/v1/admin/users/${userId}/toggle-status`);
        AxionAlert.fire(
          "Concluído!",
          `Usuário agora está ${currentStatus ? "inativo" : "ativo"}.`,
          "success",
        );
        const res = await api.get(`/api/v1/admin/users/${userId}`);
        setSelectedUser(res.data.data || res.data);
        loadUsers(usersCurrentPage);
      } catch (err) {
        AxionAlert.fire("Erro!", "Falha ao atualizar status.", "error");
      } finally {
        setActionLoading(false);
      }
    }
  };

  // ============ HANDLERS DE GRUPOS ============
  const handleGroupMemberRole = async (userId, type) => {
    setActionLoading(true);
    try {
      await api.patch(
        `/api/v1/groups/${selectedGroupId}/members/${userId}/${type}`,
      );
      AxionAlert.fire("Sucesso!", "Cargo no grupo atualizado.", "success");
      await loadGroups(groupsCurrentPage);
    } catch (err) {
      AxionAlert.fire("Erro", "Erro ao alterar cargo no grupo.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddUserToGroup = async (email) => {
    if (!selectedGroupId) return;
    setActionLoading(true);
    try {
      const userToInvite = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase(),
      );
      if (!userToInvite) {
        return AxionAlert.fire("Aviso", "Usuário não encontrado.", "info");
      }
      await api.post(`/api/v1/groups/${selectedGroupId}/members`, {
        user_id: userToInvite.id,
      });
      await loadGroups(groupsCurrentPage);
    } catch (err) {
      AxionAlert.fire("Erro", "Erro ao adicionar.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveUserFromGroup = async (userId, userName) => {
    const result = await AxionAlert.fire({
      title: "Remover do grupo?",
      text: `Deseja remover ${userName}?`,
      icon: "warning",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        await api.delete(`/api/v1/groups/${selectedGroupId}/members/${userId}`);
        await loadGroups(groupsCurrentPage);
        AxionAlert.fire("Removido!", "", "success");
      } catch (err) {
        AxionAlert.fire("Erro", "Erro ao remover.", "error");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleAddPermissionToGroup = async (permissionName) => {
    if (!selectedGroupId || !permissionName) return;
    setActionLoading(true);
    try {
      await api.post(`/api/v1/admin/groups/${selectedGroupId}/permissions`, {
        permission_name: permissionName,
      });
      AxionAlert.fire({
        icon: "success",
        title: "Permissão Atribuída",
        text: "A chave foi vinculada ao grupo.",
        timer: 1500,
        showConfirmButton: false,
      });
      await loadGroups(groupsCurrentPage);
    } catch (err) {
      AxionAlert.fire(
        "Erro",
        "Não foi possível vincular a permissão.",
        "error",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemovePermissionFromGroup = async (permissionId) => {
    if (!selectedGroupId) return;

    const result = await AxionAlert.fire({
      title: "Remover Permissão?",
      text: "O grupo perderá acesso a esta funcionalidade.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, remover",
    });

    if (result.isConfirmed) {
      setActionLoading(true);
      try {
        await api.delete(
          `/api/v1/admin/groups/${selectedGroupId}/permissions/${permissionId}`,
        );
        AxionAlert.fire("Removido!", "Permissão desvinculada.", "success");
        await loadGroups(groupsCurrentPage);
      } catch (err) {
        AxionAlert.fire("Erro", "Falha ao remover permissão.", "error");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSidebarToggle = (collapsed) => {
    setIsSidebarCollapsed(collapsed);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeTab={activeTab}
        role={role}
        onLogout={handleLogout}
        setActiveTab={handleTabChange}
        onToggle={handleSidebarToggle}
      />

      <div className={`main-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        <header className="main-header">
          <h2 className="brand mb-0">
            AxionID
            <span
              className={`role-badge ${role === "admin" ? "admin" : "user"}`}
            >
              {role === "admin" ? "Admin" : "Comum"}
            </span>
          </h2>

          {currentUser && (
            <UserDropdown user={currentUser} onLogout={handleLogout} />
          )}
        </header>

        <main className="content-area">
          {selectedUser ? (
            <UserDetail
              user={selectedUser}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              formData={formData}
              setFormData={setFormData}
              onBack={() => setSelectedUser(null)}
              actionLoading={actionLoading}
              handleSave={() => {
                const userId = selectedUser?.id;
                if (!userId) {
                  return AxionAlert.fire(
                    "Erro",
                    "ID do usuário não identificado.",
                    "error",
                  );
                }
                handleUpdateUser(userId, formData);
              }}
              onAction={async (type) => {
                if (type === "promote") {
                  await handleToggleAdmin(selectedUser.id, false);
                } else if (type === "remove-admin") {
                  await handleToggleAdmin(selectedUser.id, true);
                } else if (type === "toggle-status") {
                  await handleToggleStatus(
                    selectedUser.id,
                    selectedUser.is_active,
                  );
                } else if (type === "delete") {
                  await handleDeleteUser(selectedUser.id, selectedUser.name);
                }
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
              onDeleteGroup={(id) =>
                api.delete(`/api/v1/groups/${id}`).then(() => {
                  setSelectedGroupId(null);
                  loadGroups(1);
                  setGroupsCurrentPage(1);
                })
              }
              allAvailablePermissions={permissions || []}
              onAddPermission={handleAddPermissionToGroup}
              onRemovePermission={handleRemovePermissionFromGroup}
            />
          ) : (
            <>
              <DashboardFilters
                activeTab={activeTab}
                onNewOrder={() => setShowOrderForm(true)}
                user={selectedUser}
                role={role}
                filters={filters}
                onFilterChange={(e) => {
                  console.log('Filtro alterado:', e.target.name, e.target.value);
                  setFilters({ ...filters, [e.target.name]: e.target.value });
                }}
                onClear={handleClearFilters}
                onNewGroup={() => setShowGroupForm(true)}
                onNewPermission={() => setShowPermissionModal(true)}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                actionLoading={actionLoading}
                handleSave={() => {
                  const userId = selectedUser?.data?.id || selectedUser?.id;
                  if (!userId) {
                    return AxionAlert.fire(
                      "Erro",
                      "ID do usuário não identificado.",
                      "error"
                    );
                  }
                  handleUpdateUser(userId, formData);
                }}
                onBack={() => {
                  setSelectedUser(null);
                  setIsEditing(false);
                }}
              />

              {activeTab === "permissions" && showPermissionModal && (
                <PermissionForm
                  loading={actionLoading}
                  onCancel={() => setShowPermissionModal(false)}
                  onSave={handleCreatePermission}
                />
              )}

              {activeTab === "orders" && (
                <>
                  {showOrderForm && (
                    <ServiceOrderForm
                      groups={groups}
                      onSuccess={() => {
                        setShowOrderForm(false);
                        loadServiceOrders(ordersCurrentPage);
                      }}
                      onCancel={() => setShowOrderForm(false)}
                    />
                  )}

                  {!showOrderForm && selectedOrder && selectedOrder.id && (
                    <ServiceOrderDetail
                      order={selectedOrder}
                      onBack={() => setSelectedOrder(null)}
                      onUpdateStatus={onUpdateStatus}
                      isSystemAdmin={isGlobalAdmin}
                      onDeleteOrder={async (id) => {
                        const result = await AxionAlert.fire({
                          title: "Excluir OS?",
                          text: "Esta ação não pode ser desfeita!",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonText: "Sim, excluir!",
                          cancelButtonText: "Cancelar",
                          background: "#111214",
                          color: "#ffffff",
                          confirmButtonColor: "#6366f1",
                        });
                        if (result.isConfirmed) {
                          try {
                            setActionLoading(true);
                            await api.delete(`/api/v1/service-orders/${id}`);
                            setSelectedOrder(null);
                            loadServiceOrders(ordersCurrentPage);
                            AxionAlert.fire({
                              icon: "success",
                              title: "Deletado!",
                              text: "Ordem de serviço removida.",
                              timer: 1500,
                              showConfirmButton: false,
                            });
                          } catch (e) {
                            AxionAlert.fire("Erro", "Falha ao excluir.", "error");
                          } finally {
                            setActionLoading(false);
                          }
                        }
                      }}
                    />
                  )}

                  {!showOrderForm && !selectedOrder && (
                    <div className="animate-in">
                      <ServiceOrderTable
                        orders={serviceOrders}
                        loading={actionLoading || loading}
                        onViewDetail={(id) => {
                          setShowOrderForm(false);
                          handleOpenOrderDetail(id);
                        }}
                        onEdit={handleEditOrder}
                        onDelete={handleDeleteOrder}
                        currentUser={currentUser}
                      />

                      {ordersPagination?.last > 1 && (
                        <Pagination
                          currentPage={ordersPagination.current}
                          lastPage={ordersPagination.last}
                          total={ordersPagination.total}
                          onPageChange={handleOrdersPageChange}
                          loading={loading}
                        />
                      )}
                    </div>
                  )}
                </>
              )}

              <div
                className={`tab-wrapper ${loading || actionLoading ? "is-loading" : ""}`}
              >
                {(loading || actionLoading) && (
                  <div className="loading-overlay">
                    <Spinner animation="border" variant="primary" />
                  </div>
                )}

                <div className="content-card">
                  {activeTab === "users" && (
                    isGlobalAdmin ? (
                      <>
                        <UserTable
                          users={users}
                          onViewDetail={(id) =>
                            api
                              .get(`/api/v1/admin/users/${id}`)
                              .then((res) =>
                                setSelectedUser(res.data.data || res.data),
                              )
                          }
                          onDeleteUser={handleDeleteUser}
                          onToggleAdmin={handleToggleAdmin}
                          isGlobalAdmin={isGlobalAdmin}
                        />
                        <Pagination
                          currentPage={usersPagination?.current || 1}
                          lastPage={usersPagination?.last || 1}
                          total={usersPagination?.total || 0}
                          onPageChange={handleUsersPageChange}
                          loading={loading}
                        />
                      </>
                    ) : (
                      <OperationView />
                    )
                  )}

                  {activeTab === "audit" && (
                    <>
                      <AuditTable logs={auditLogs} />
                      <Pagination
                        currentPage={auditPagination?.current || 1}
                        lastPage={auditPagination?.last || 1}
                        total={auditPagination?.total || 0}
                        onPageChange={handleAuditPageChange}
                        loading={loading}
                      />
                    </>
                  )}

                  {activeTab === "groups" && (
                    showGroupForm ? (
                      <GroupForm
                        onCancel={() => setShowGroupForm(false)}
                        onSave={async (data) => {
                          try {
                            setActionLoading(true);
                            await api.post("/api/v1/groups", data);
                            setShowGroupForm(false);
                            await loadGroups(groupsCurrentPage);
                            AxionAlert.fire({
                              icon: "success",
                              title: "Grupo Criado!",
                              text: `O grupo "${data.name}" foi criado com sucesso.`,
                              timer: 1500,
                              showConfirmButton: false,
                            });
                          } catch (err) {
                            console.error("Erro ao criar grupo:", err);
                            AxionAlert.fire(
                              "Erro",
                              err.response?.data?.message ||
                                "Não foi possível criar o grupo.",
                              "error",
                            );
                          } finally {
                            setActionLoading(false);
                          }
                        }}
                        loading={actionLoading}
                      />
                    ) : (
                      <>
                        <GroupTable
                          groups={groups}
                          onViewDetail={setSelectedGroupId}
                          isGlobalAdmin={isGlobalAdmin}
                          currentUser={currentUser}
                        />
                        <Pagination
                          currentPage={groupsPagination?.current || 1}
                          lastPage={groupsPagination?.last || 1}
                          total={groupsPagination?.total || 0}
                          onPageChange={handleGroupsPageChange}
                          loading={loading}
                        />
                      </>
                    )
                  )}

                  {activeTab === "permissions" && (
                    selectedPermission ? (
                      <PermissionDetail
                        permission={selectedPermission}
                        onBack={() => setSelectedPermission(null)}
                        onEdit={handleEditPermission}
                        onDelete={handleDeletePermission}
                        isSystemAdmin={isGlobalAdmin}
                        actionLoading={actionLoading}
                      />
                    ) : (
                      <>
                        <PermissionTable
                          permissions={permissions}
                          loading={loading}
                          currentUser={currentUser}
                          onViewDetail={handleOpenPermissionDetail}
                          onDelete={handleDeletePermission}
                        />
                        {permissionsPagination?.last > 1 && (
                          <Pagination
                            currentPage={permissionsPagination.current}
                            lastPage={permissionsPagination.last}
                            total={permissionsPagination.total}
                            onPageChange={handlePermissionsPageChange}
                            loading={loading}
                          />
                        )}
                      </>
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
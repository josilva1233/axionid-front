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
  const [serviceOrders, setServiceOrders] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [permissions, setPermissions] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Estados para paginação - ADICIONE ESTES STATES
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [groupsCurrentPage, setGroupsCurrentPage] = useState(1);
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);

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
    usersPagination, // ← ADICIONE
    groupsPagination, // ← ADICIONE
    auditPagination, // ← ADICIONE
    filters,
    setFilters,
    loadUsers,
    loadGroups,
    loadAuditLogs,
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

  const loadServiceOrders = useCallback(async () => {
    setActionLoading(true);
    try {
      const res = await api.get("/api/v1/service-orders");
      setServiceOrders(res.data.data || res.data || []);
    } catch (err) {
      setServiceOrders([]);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const handleOpenOrderDetail = async (orderId) => {
    setActionLoading(true);
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
      const res = await api.patch(`/api/v1/service-orders/${orderId}`, {
        status: newStatus,
      });
      const updatedOrder = res.data.data || res.data;
      setSelectedOrder(updatedOrder);
      loadServiceOrders();

      AxionAlert.fire({
        icon: "success",
        title: "Status Atualizado!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Erro na API:", err);
      AxionAlert.fire("Erro", "Falha ao atualizar no servidor.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ATUALIZE O useEffect com as páginas corretas
  useEffect(() => {
    if (activeTab === "users") loadUsers(usersCurrentPage);
    else if (activeTab === "audit") loadAuditLogs(auditCurrentPage);
    else if (activeTab === "groups") loadGroups(groupsCurrentPage);
    else if (activeTab === "permissions") loadPermissions();
    else if (activeTab === "orders") loadServiceOrders();
  }, [
    activeTab,
    usersCurrentPage,
    groupsCurrentPage,
    auditCurrentPage,
    loadUsers,
    loadGroups,
    loadAuditLogs,
    loadPermissions,
    loadServiceOrders,
  ]);

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

  // Funções para mudar de página - ADICIONE ESTAS FUNÇÕES
  const handleUsersPageChange = (page) => {
    setUsersCurrentPage(page);
  };

  const handleGroupsPageChange = (page) => {
    setGroupsCurrentPage(page);
  };

  const handleAuditPageChange = (page) => {
    setAuditCurrentPage(page);
  };

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
      loadPermissions();
    } catch (err) {
      AxionAlert.fire("Erro!", "Não foi possível criar a permissão.", "error");
    } finally {
      setActionLoading(false);
    }
  };

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
      if (!userToInvite)
        return AxionAlert.fire("Aviso", "Usuário não encontrado.", "info");
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

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeTab={activeTab}
        role={role}
        onLogout={handleLogout}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedUser(null);
          setSelectedGroupId(null);
          setShowPermissionModal(false);
          setShowGroupForm(false);
          setSelectedOrder(null);
          // Resetar páginas ao trocar de aba
          setUsersCurrentPage(1);
          setGroupsCurrentPage(1);
          setAuditCurrentPage(1);
        }}
      />

      <div className="main-wrapper">
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
                if (!userId)
                  return AxionAlert.fire(
                    "Erro",
                    "ID do usuário não identificado.",
                    "error",
                  );
                handleUpdateUser(userId, formData);
              }}
              onAction={async (type) => {
                if (type === "promote")
                  await handleToggleAdmin(selectedUser.id, false);
                else if (type === "remove-admin")
                  await handleToggleAdmin(selectedUser.id, true);
                else if (type === "toggle-status")
                  await handleToggleStatus(
                    selectedUser.id,
                    selectedUser.is_active,
                  );
                else if (type === "delete")
                  await handleDeleteUser(selectedUser.id, selectedUser.name);
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
                onFilterChange={(e) =>
                  setFilters({ ...filters, [e.target.name]: e.target.value })
                }
                onClear={() => {
                  setFilters({ name: "", completed: "", method: "", date: "" });
                  // Resetar páginas ao limpar filtros
                  setUsersCurrentPage(1);
                  setGroupsCurrentPage(1);
                  setAuditCurrentPage(1);
                }}
                onNewGroup={() => setShowGroupForm(true)}
                onNewPermission={() => setShowPermissionModal(true)}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                actionLoading={actionLoading}
                handleSave={() => {
                  const userId = selectedUser?.data?.id || selectedUser?.id;
                  if (!userId)
                    return AxionAlert.fire(
                      "Erro",
                      "ID do usuário não identificado.",
                      "error",
                    );
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
                  {/* Formulário de criação */}
                  {showOrderForm && (
                    <ServiceOrderForm
                      groups={groups}
                      onSuccess={() => {
                        setShowOrderForm(false);
                        loadServiceOrders();
                      }}
                      onCancel={() => setShowOrderForm(false)}
                    />
                  )}

                  {/* Detalhes da OS */}
                  {!showOrderForm && selectedOrder && selectedOrder.id && (
                    <ServiceOrderDetail
                      order={selectedOrder}
                      onBack={() => {
                        setSelectedOrder(null);
                        // Não precisa resetar showOrderForm aqui, pois já é false
                      }}
                      onUpdateStatus={onUpdateStatus}
                      isSystemAdmin={isGlobalAdmin}
                      onDeleteOrder={async (id) => {
                        const result = await AxionAlert.fire({
                          title: "Excluir OS?",
                          text: "Esta ação não pode ser desfeita!",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonText: "Sim, excluir!",
                        });
                        if (result.isConfirmed) {
                          try {
                            await api.delete(`/api/v1/service-orders/${id}`);
                            setSelectedOrder(null);
                            loadServiceOrders();
                            AxionAlert.fire(
                              "Deletado!",
                              "Ordem de serviço removida.",
                              "success",
                            );
                          } catch (e) {
                            AxionAlert.fire(
                              "Erro",
                              "Falha ao excluir.",
                              "error",
                            );
                          }
                        }
                      }}
                    />
                  )}

                  {/* Lista de chamados */}
                  {!showOrderForm && !selectedOrder && (
                    <div className="animate-in">
                      <div className="orders-header">
                        <h4 className="text-white mb-0">Gestão de Chamados</h4>
                        <button
                          className="btn-primary-sm"
                          onClick={() => {
                            setShowOrderForm(true);
                            setSelectedOrder(null); // Garante que selectedOrder é null
                          }}
                        >
                          <i className="bi bi-plus-lg me-2"></i> Nova OS
                        </button>
                      </div>

                      <ServiceOrderTable
                        orders={serviceOrders}
                        loading={actionLoading}
                        onViewDetail={(id) => {
                          setShowOrderForm(false); // Fecha formulário se estiver aberto
                          handleOpenOrderDetail(id);
                        }}
                      />
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
                  {activeTab === "users" &&
                    (isGlobalAdmin ? (
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
                        {/* ADICIONE A PAGINAÇÃO AQUI */}
                        <Pagination
                          currentPage={usersPagination.current}
                          lastPage={usersPagination.last}
                          total={usersPagination.total}
                          onPageChange={handleUsersPageChange}
                          loading={loading}
                        />
                      </>
                    ) : (
                      <OperationView />
                    ))}

                  {activeTab === "audit" && (
                    <>
                      <AuditTable logs={auditLogs} />
                      {/* ADICIONE A PAGINAÇÃO AQUI */}
                      <Pagination
                        currentPage={auditPagination.current}
                        lastPage={auditPagination.last}
                        total={auditPagination.total}
                        onPageChange={handleAuditPageChange}
                        loading={loading}
                      />
                    </>
                  )}

                  {activeTab === "groups" &&
                    (showGroupForm ? (
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
                        {/* ADICIONE A PAGINAÇÃO AQUI */}
                        <Pagination
                          currentPage={groupsPagination.current}
                          lastPage={groupsPagination.last}
                          total={groupsPagination.total}
                          onPageChange={handleGroupsPageChange}
                          loading={loading}
                        />
                      </>
                    ))}

                  {activeTab === "permissions" && (
                    <PermissionTable
                      permissions={permissions}
                      loading={loading}
                      currentUser={currentUser}
                    />
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

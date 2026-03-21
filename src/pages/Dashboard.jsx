import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Spinner } from "react-bootstrap";
import Swal from "sweetalert2"; // Importado SweetAlert2
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
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [serviceOrders, setServiceOrders] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Exemplo de como deve estar no Dashboard.js
const handleOpenDetail = (fullOrderObject) => {
   setSelectedOrder(fullOrderObject); // Certifique-se de que aqui vai o objeto todo, não só o ID
};

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

const onUpdateStatus = async (idFromChild, newStatus) => {
  // Se o idFromChild não vier, tentamos pegar do selectedOrder
  const orderId = idFromChild || selectedOrder?.id || selectedOrder?._id;

  if (!orderId) {
    console.error("Estado do selectedOrder no erro:", selectedOrder);
    return AxionAlert.fire("Erro", "Não foi possível identificar o ID da OS.", "error");
  }

  try {
    setActionLoading(true);
    // Sua rota no Laravel espera PATCH /api/v1/service-orders/{id}
    const res = await api.patch(`/api/v1/service-orders/${orderId}`, { 
      status: newStatus 
    });

    // IMPORTANTE: Pegar o retorno da API que já vem com o técnico preenchido
    const updatedOrder = res.data.data || res.data;
    
    // Atualiza o estado para refletir na tela de detalhes imediatamente
    setSelectedOrder(updatedOrder);
    
    // Atualiza a lista da tabela ao fundo
    loadServiceOrders();

    AxionAlert.fire({
      icon: "success",
      title: "Status Atualizado!",
      timer: 1500,
      showConfirmButton: false
    });
  } catch (err) {
    console.error("Erro na API:", err);
    AxionAlert.fire("Erro", "Falha ao atualizar no servidor.", "error");
  } finally {
    setActionLoading(false);
  }
};




// No seu Dashboard.jsx

// 1. Função para abrir o detalhe buscando dados frescos da API
const handleOpenOrderDetail = async (orderId) => {
  setActionLoading(true);
  try {
    // Busca a OS específica com os relacionamentos (certifique-se que o backend retorna with(['user', 'technician', 'group']))
    const res = await api.get(`/api/v1/service-orders/${orderId}`);
    setSelectedOrder(res.data.data || res.data);
  } catch (err) {
    AxionAlert.fire("Erro", "Não foi possível carregar os detalhes desta OS.", "error");
  } finally {
    setActionLoading(false);
  }
};

// 2. No seu retorno (JSX) do Dashboard, onde você renderiza o conteúdo:
{activeTab === "orders" && (
  selectedOrder ? (
    <ServiceOrderDetail
      order={selectedOrder}
      onBack={() => setSelectedOrder(null)}
      onUpdateStatus={onUpdateStatus}
      isSystemAdmin={isGlobalAdmin}
      actionLoading={actionLoading}
      onDeleteOrder={async (id) => {
        const result = await AxionAlert.fire({
          title: 'Excluir OS?',
          text: "Esta ação não pode ser desfeita!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sim, excluir!'
        });
        if (result.isConfirmed) {
          try {
            await api.delete(`/api/v1/service-orders/${id}`);
            setSelectedOrder(null);
            loadServiceOrders();
            AxionAlert.fire('Deletado!', 'Ordem de serviço removida.', 'success');
          } catch (e) {
             AxionAlert.fire('Erro', 'Falha ao excluir.', 'error');
          }
        }
      }}
    />
  ) : (
    <ServiceOrderTable 
      orders={serviceOrders} 
      onViewDetail={(id) => handleOpenOrderDetail(id)} // Use a nova função aqui!
      loading={actionLoading}
    />
  )
)}





  // Estados para Permissões
  const [permissions, setPermissions] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Configuração Customizada do SweetAlert2 (Tema AxionID)
  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6f42c1",
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

  useEffect(() => {
    if (activeTab === "users") loadUsers(currentPage);
    else if (activeTab === "audit") loadAuditLogs(currentPage);
    else if (activeTab === "groups") loadGroups(currentPage);
    else if (activeTab === "permissions") loadPermissions();
    // ADICIONE ESTA LINHA:
    else if (activeTab === "orders") loadServiceOrders();
  }, [
    activeTab,
    currentPage,
    loadUsers,
    loadGroups,
    loadAuditLogs,
    loadPermissions,
    loadServiceOrders,
  ]);

  useEffect(() => {
    // Função para carregar dados baseada na aba ativa
    const loadTabContent = () => {
      if (activeTab === "users") loadUsers(currentPage);
      else if (activeTab === "audit") loadAuditLogs(currentPage);
      else if (activeTab === "groups") {
        loadGroups(currentPage);
        loadPermissions(); // Carrega permissões para o select do grupo
      } else if (activeTab === "permissions") loadPermissions();
      else if (activeTab === "orders") loadServiceOrders(); // Certifique-se que esta função existe
    };

    loadTabContent();
  }, [
    activeTab,
    currentPage,
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
    if (activeTab === "users") loadUsers(currentPage);
    else if (activeTab === "audit") loadAuditLogs(currentPage);
    else if (activeTab === "groups") loadGroups(currentPage);
    else if (activeTab === "permissions") loadPermissions();
    if (activeTab === "groups") {
      loadPermissions();
    }
  }, [
    activeTab,
    currentPage,
    loadUsers,
    loadGroups,
    loadAuditLogs,
    loadPermissions,
  ]);

  // Adicione isso logo abaixo dos seus outros UseEffects
  useEffect(() => {
    if (selectedUser) {
      const userData = selectedUser.data || selectedUser;

      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        cpf_cnpj: userData.cpf_cnpj || "",
        // ✅ ADICIONE ESTAS LINHAS ABAIXO:
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
  // --- GESTÃO DE USUÁRIOS (CORREÇÕES SWEETALERT E PRIVILÉGIOS) ---

  const handleUpdateUser = async (userId, data) => {
    console.log("Dados que estou enviando:", data);
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
      loadUsers(currentPage);
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
        loadUsers(currentPage);
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
        loadUsers(currentPage);
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
        loadUsers(currentPage);
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

  // --- FUNÇÕES DE GRUPOS ---
  const handleGroupMemberRole = async (userId, type) => {
    setActionLoading(true);
    try {
      await api.patch(
        `/api/v1/groups/${selectedGroupId}/members/${userId}/${type}`,
      );
      AxionAlert.fire("Sucesso!", "Cargo no grupo atualizado.", "success");
      await loadGroups(currentPage);
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
      await loadGroups(currentPage);
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
        await loadGroups(currentPage);
        AxionAlert.fire("Removido!", "", "success");
      } catch (err) {
        AxionAlert.fire("Erro", "Erro ao remover.", "error");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // --- GESTÃO DE PERMISSÕES NOS GRUPOS (ACL) ---

  const handleAddPermissionToGroup = async (permissionName) => {
    if (!selectedGroupId || !permissionName) return;
    setActionLoading(true);
    try {
      // Chama o método attachPermissionToRole do seu Controller PHP
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

      await loadGroups(currentPage); // Atualiza a lista para mostrar a nova chave na tabela
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
        // Chama o método detachPermissionFromRole do seu Controller PHP
        await api.delete(
          `/api/v1/admin/groups/${selectedGroupId}/permissions/${permissionId}`,
        );
        AxionAlert.fire("Removido!", "Permissão desvinculada.", "success");
        await loadGroups(currentPage);
      } catch (err) {
        AxionAlert.fire("Erro", "Falha ao remover permissão.", "error");
      } finally {
        setActionLoading(false);
      }
    }
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
          setShowPermissionModal(false);
          setShowGroupForm(false);
        }}
      />

      <div className="main-wrapper">
        <header className="main-header d-flex justify-content-between align-items-center p-3">
          <h2
            className="brand mb-0"
            style={{
              fontSize: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            AxionID
            <span
              style={{
                fontSize: "0.75rem",
                padding: "2px 8px",
                borderRadius: "4px",
                background:
                  role === "admin"
                    ? "rgba(111, 66, 193, 0.2)"
                    : "rgba(108, 117, 125, 0.2)",
                color: role === "admin" ? "#a180e6" : "#adb5bd",
                border: `1px solid ${role === "admin" ? "rgba(111, 66, 193, 0.3)" : "rgba(108, 117, 125, 0.3)"}`,
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {role === "admin" ? "Admin" : "Comum"}
            </span>
          </h2>

          {currentUser && (
            <UserDropdown user={currentUser} onLogout={handleLogout} />
          )}
        </header>

        <main className="content-area p-4">
          {selectedUser ? (
            <UserDetail
              user={selectedUser}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              formData={formData} // Passe o estado
              setFormData={setFormData} // Passe o setter
              onBack={() => setSelectedUser(null)}
              actionLoading={actionLoading}
              handleSave={() => {
                const userId = selectedUser?.id;

                console.log("🚀 Salvando:", userId);
                console.log("📦 Dados:", formData);

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
                })
              }
              // ✅ ADICIONE ESTAS 3 LINHAS ABAIXO:
              allAvailablePermissions={permissions || []}
              onAddPermission={handleAddPermissionToGroup}
              onRemovePermission={handleRemovePermissionFromGroup}
            />
          ) : (
            <>
              {/* Remova a trava {activeTab !== "permissions" && ... } e deixe apenas o componente: */}
              {(role === "admin" || activeTab !== "users") && (
                <DashboardFilters
                  activeTab={activeTab}
                  onNewOrder={() => setShowOrderForm(true)}
                  user={selectedUser}
                  role={role}
                  filters={filters}
                  onFilterChange={(e) =>
                    setFilters({ ...filters, [e.target.name]: e.target.value })
                  }
                  onClear={() =>
                    setFilters({
                      name: "",
                      completed: "",
                      method: "",
                      date: "",
                    })
                  }
                  onNewGroup={() => setShowGroupForm(true)}
                  onNewPermission={() => setShowPermissionModal(true)}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  actionLoading={actionLoading}
                  // COPIE E COLE ESTA PARTE:
                  handleSave={() => {
                    // Busca o ID independente da estrutura (seja selectedUser.id ou selectedUser.data.id)
                    const userId = selectedUser?.data?.id || selectedUser?.id;

                    console.log("🚀 Tentando salvar ID:", userId);
                    console.log("📦 Dados do formulário:", formData);

                    if (!userId) {
                      return AxionAlert.fire(
                        "Erro",
                        "ID do usuário não identificado.",
                        "error",
                      );
                    }

                    // DISPARA A FUNÇÃO COM OS DADOS DO ESTADO
                    handleUpdateUser(userId, formData);
                  }}
                  onBack={() => {
                    setSelectedUser(null);
                    setIsEditing(false);
                  }}
                />
              )}

              {/* O Form só aparece se a aba for permissões E o modal estiver aberto */}
              {activeTab === "permissions" && showPermissionModal && (
                <PermissionForm
                  loading={actionLoading}
                  onCancel={() => setShowPermissionModal(false)}
                  onSave={handleCreatePermission}
                />
              )}

              {activeTab === "orders" &&
                (showOrderForm ? (
                  <ServiceOrderForm
                    groups={groups}
                    onSuccess={() => {
                      setShowOrderForm(false);
                      loadServiceOrders();
                    }}
                    onCancel={() => setShowOrderForm(false)}
                  />
                ) : selectedOrder ? (
                  /* ✅ NOVA TELA DE DETALHE INCLUÍDA AQUI */
                  <ServiceOrderDetail
                    order={selectedOrder}
                    onBack={() => setSelectedOrder(null)}
                    onUpdateStatus={async (id, newStatus) => {
                      // Tenta pegar o ID passado pelo botão, se não houver, pega o da OS aberta
                      const orderId = id || selectedOrder?.id;

                      if (!orderId) {
                        return AxionAlert.fire(
                          "Erro",
                          "Não foi possível identificar a OS.",
                          "error",
                        );
                      }

                      try {
                        setActionLoading(true);
                        // ✅ Usamos PATCH para bater com a rota criada acima
                        await api.patch(`/api/v1/service-orders/${orderId}`, {
                          status: newStatus,
                        });

                        AxionAlert.fire(
                          "Sucesso",
                          "Atendimento iniciado!",
                          "success",
                        );
                        loadServiceOrders(); // Recarrega a lista
                        setSelectedOrder(null); // Fecha o modal/detalhe
                      } catch (err) {
                        AxionAlert.fire(
                          "Erro",
                          "Falha ao atualizar status.",
                          "error",
                        );
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    isSystemAdmin={isGlobalAdmin}
                  />
                ) : (
                  <div className="animate-in">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="text-white mb-0">Gestão de Chamados</h4>
                      <button
                        className="bw-btn-table-action px-3"
                        onClick={() => setShowOrderForm(true)}
                      >
                        <i className="bi bi-plus-lg me-2"></i> Nova OS
                      </button>
                    </div>

                    <ServiceOrderTable
                      orders={serviceOrders}
                      loading={actionLoading}
                      /* ✅ FUNÇÃO PARA SELECIONAR A OS NA TABELA */
                      onViewDetail={(order) => setSelectedOrder(order)}
                    />
                  </div>
                ))}

              <div
                className={`tab-wrapper position-relative ${loading || actionLoading ? "is-loading" : ""}`}
              >
                {(loading || actionLoading) && (
                  <div className="loading-overlay">
                    <Spinner animation="border" variant="primary" />
                  </div>
                )}

                <div className="content-card">
                  {/* No Dashboard.js, dentro da área de conteúdo */}
                  {activeTab === "users" &&
                    (isGlobalAdmin ? (
                      /* SE FOR ADMIN: Exibe a tabela de gestão */
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
                    ) : (
                      /* SE NÃO FOR ADMIN (COMUM): Exibe a tela de Operação/IA */
                      <OperationView />
                    ))}
                  {activeTab === "audit" && <AuditTable logs={auditLogs} />}
                  {activeTab === "groups" &&
                    (showGroupForm ? (
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
                    ))}
                  {activeTab === "permissions" && (
                    <PermissionTable
                      permissions={permissions}
                      loading={loading}
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

// Dashboard.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import { useDashboardData } from "../hooks/useDashboardData";
import { usePermissions } from "../hooks/usePermissions";
// Components
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
import AIChat from "../components/dashboard/AIChat";
import TermManagement from "./TermManagement";
import TermAcceptances from "./TermAcceptances";
// Styles
import '../index.css';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ========== ESTADO PARA TERMOS DE USO ==========
  const [showTermAcceptances, setShowTermAcceptances] = useState(false);
  const [selectedTermId, setSelectedTermId] = useState(null);

  // ========== ESTADO PARA ENDEREÇO ==========
  const [showAddressBanner, setShowAddressBanner] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({
    zip_code: "",
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    complement: "",
  });
  const [addressLoading, setAddressLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // ========== ESTADO LOCAL PARA TODAS AS PERMISSÕES ==========
  const [allPermissions, setAllPermissions] = useState([]);

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
      popup: "border border-gray-700 rounded-xl",
      confirmButton: "px-4 py-2 rounded-full font-bold mx-2 bg-indigo-500 hover:bg-indigo-400 transition-colors",
      cancelButton: "px-4 py-2 rounded-full font-bold mx-2 bg-gray-700 hover:bg-gray-600 transition-colors",
    },
  });

  // =========================================================
  // 🔥 HOOK DE PERMISSÕES
  // =========================================================
  const {
    canAccessTab,
    canAccessAnyTab,
    getFirstAvailableTab,
    loading: permissionsLoading,
  } = usePermissions();

  // =========================================================
  // 🔥 CONTROLAR ABA INICIAL BASEADA NAS PERMISSÕES
  // =========================================================
  useEffect(() => {
    if (!permissionsLoading) {
      if (!canAccessAnyTab()) {
        console.warn("Usuário sem permissões de acesso");
      } else {
        const firstTab = getFirstAvailableTab();
        if (!canAccessTab(activeTab)) {
          setActiveTab(firstTab);
        }
      }
    }
  }, [permissionsLoading, canAccessAnyTab, getFirstAvailableTab, canAccessTab, activeTab]);

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

  // ========== CARREGAR TODAS AS PERMISSÕES ==========
  useEffect(() => {
    const fetchAllPermissions = async () => {
      try {
        const res = await api.get('/api/v1/admin/permissions?per_page=1000');
        const data = res.data.data || res.data;
        setAllPermissions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar todas as permissões:", err);
        setAllPermissions([]);
      }
    };
    fetchAllPermissions();
  }, []);

  // ============ FUNÇÃO PARA BUSCAR ENDEREÇO PELO CEP ============
  const fetchAddressByCep = useCallback(async (cep) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        AxionAlert.fire({
          icon: "warning",
          title: "CEP não encontrado",
          text: "Verifique o número informado.",
          confirmButtonColor: "#6366f1",
        });
        setAddressForm(prev => ({
          ...prev,
          street: '',
          neighborhood: '',
          city: '',
          state: '',
        }));
        return;
      }

      setAddressForm(prev => ({
        ...prev,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }));

    } catch (error) {
      AxionAlert.fire({
        icon: "error",
        title: "Erro ao buscar CEP",
        text: "Não foi possível conectar ao serviço de CEP.",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setLoadingCep(false);
    }
  }, [AxionAlert]);

  // ============ LOAD PROFILE ============
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/api/v1/me");
        setCurrentUser(res.data);

        const address = res.data.address || {};
        const hasAddress = address.street || address.number || address.zip_code;
        if (!hasAddress && !res.data.is_admin) {
          setShowAddressBanner(true);
        } else {
          setShowAddressBanner(false);
        }
      } catch {
        navigate("/login");
      }
    };
    loadProfile();
  }, [navigate]);

  // ============ HANDLERS PARA ENDEREÇO ============
  const handleOpenAddressModal = () => {
    const address = currentUser?.address || {};
    setAddressForm({
      zip_code: address.zip_code || "",
      street: address.street || "",
      number: address.number || "",
      neighborhood: address.neighborhood || "",
      city: address.city || "",
      state: address.state || "",
      complement: address.complement || "",
    });
    setShowAddressModal(true);
    setShowAddressBanner(false);
  };

  const handleSaveAddress = async () => {
    setAddressLoading(true);
    try {
      await api.put("/api/v1/update-profile", addressForm);
      const res = await api.get("/api/v1/me");
      setCurrentUser(res.data);
      setShowAddressModal(false);
      setShowAddressBanner(false);
      AxionAlert.fire({
        icon: "success",
        title: "Endereço atualizado!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Erro ao salvar endereço:", err.response?.data || err.message);
      AxionAlert.fire({
        icon: "error",
        title: "Erro ao salvar",
        text: err.response?.data?.message || "Não foi possível salvar o endereço. Tente novamente.",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setAddressLoading(false);
    }
  };

  // ============ HANDLERS PARA TABS E FILTROS ============
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSelectedUser(null);
    setSelectedGroupId(null);
    setShowPermissionModal(false);
    setShowGroupForm(false);
    setSelectedOrder(null);
    setSelectedPermission(null);
    setShowTermAcceptances(false);
    setSelectedTermId(null);
    setUsersCurrentPage(1);
    setGroupsCurrentPage(1);
    setAuditCurrentPage(1);
    setOrdersCurrentPage(1);
    setPermissionsCurrentPage(1);
  }, []);

  // ============ HANDLERS PARA TERMOS DE USO ============
  const handleViewTermAcceptances = useCallback((termId) => {
    setSelectedTermId(termId);
    setShowTermAcceptances(true);
    setActiveTab('terms');
  }, []);

  const handleBackFromAcceptances = useCallback(() => {
    setShowTermAcceptances(false);
    setSelectedTermId(null);
  }, []);

  const handleClearFilters = useCallback(() => {
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
  }, [setFilters]);

  // ============ HANDLERS DE ORDENS DE SERVIÇO ============
  const handleOpenOrderDetail = useCallback(async (orderId) => {
    setActionLoading(true);
    setShowOrderForm(false);
    try {
      const res = await api.get(`/api/v1/service-orders/${orderId}`);
      setSelectedOrder(res.data.data || res.data);
    } catch (err) {
      AxionAlert.fire("Erro", "Não foi possível carregar os detalhes desta OS.", "error");
    } finally {
      setActionLoading(false);
    }
  }, [AxionAlert]);

  const onUpdateStatus = useCallback(async (orderId, newStatus) => {
    if (!orderId) {
      return AxionAlert.fire("Erro", "Não foi possível identificar o ID da OS.", "error");
    }

    try {
      setActionLoading(true);
      const res = await api.put(`/api/v1/service-orders/${orderId}`, { status: newStatus });
      const updatedOrder = res.data.data || res.data;
      setSelectedOrder(updatedOrder);
      await loadServiceOrders(ordersCurrentPage);
      AxionAlert.fire({ icon: "success", title: "Status Atualizado!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      console.error("Erro na API:", err);
      AxionAlert.fire("Erro", err.response?.data?.message || "Falha ao atualizar no servidor.", "error");
    } finally {
      setActionLoading(false);
    }
  }, [AxionAlert, loadServiceOrders, ordersCurrentPage]);

  const handleEditOrder = useCallback(async (orderId, data) => {
    try {
      setActionLoading(true);
      await api.put(`/api/v1/service-orders/${orderId}`, data);
      await loadServiceOrders(ordersCurrentPage);
      AxionAlert.fire({ icon: "success", title: "OS atualizada!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      AxionAlert.fire("Erro", err.response?.data?.message || "Falha ao atualizar OS.", "error");
    } finally {
      setActionLoading(false);
    }
  }, [AxionAlert, loadServiceOrders, ordersCurrentPage]);

  const handleDeleteOrder = useCallback(async (orderId) => {
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
        AxionAlert.fire({ icon: "success", title: "Deletado!", text: "Ordem de serviço removida.", timer: 1500, showConfirmButton: false });
      } catch (e) {
        AxionAlert.fire("Erro", "Falha ao excluir a OS.", "error");
      } finally {
        setActionLoading(false);
      }
    }
  }, [AxionAlert, loadServiceOrders, ordersCurrentPage]);

  // ============ HANDLERS DE PERMISSÕES ============
  const handleCreatePermission = useCallback(async (data) => {
    setActionLoading(true);
    try {
      await api.post("/api/v1/admin/permissions", data);
      AxionAlert.fire({ icon: "success", title: "Criada!", text: "Permissão registrada.", timer: 2000, showConfirmButton: false });
      setShowPermissionModal(false);
      loadPermissions(permissionsCurrentPage);
      const res = await api.get('/api/v1/admin/permissions?per_page=1000');
      setAllPermissions(res.data.data || res.data);
    } catch (err) {
      AxionAlert.fire("Erro!", "Não foi possível criar a permissão.", "error");
    } finally {
      setActionLoading(false);
    }
  }, [AxionAlert, loadPermissions, permissionsCurrentPage]);

  const handleOpenPermissionDetail = useCallback(async (permissionId) => {
    try {
      setActionLoading(true);
      const res = await api.get(`/api/v1/admin/permissions/${permissionId}`);
      setSelectedPermission(res.data.data || res.data);
    } catch (err) {
      AxionAlert.fire("Erro", "Não foi possível carregar os detalhes da permissão.", "error");
    } finally {
      setActionLoading(false);
    }
  }, [AxionAlert]);

  const handleEditPermission = useCallback(async (permissionId, data) => {
    try {
      setActionLoading(true);
      await api.put(`/api/v1/admin/permissions/${permissionId}`, data);
      await loadPermissions(permissionsCurrentPage);
      const res = await api.get(`/api/v1/admin/permissions/${permissionId}`);
      setSelectedPermission(res.data.data || res.data);
      const allRes = await api.get('/api/v1/admin/permissions?per_page=1000');
      setAllPermissions(allRes.data.data || allRes.data);
      AxionAlert.fire({ icon: "success", title: "Permissão atualizada!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      AxionAlert.fire("Erro", err.response?.data?.message || "Falha ao atualizar permissão.", "error");
    } finally {
      setActionLoading(false);
    }
  }, [AxionAlert, loadPermissions, permissionsCurrentPage]);

  const handleDeletePermission = useCallback(async (permissionId) => {
    try {
      setActionLoading(true);
      await api.delete(`/api/v1/admin/permissions/${permissionId}`);
      setSelectedPermission(null);
      await loadPermissions(permissionsCurrentPage);
      const res = await api.get('/api/v1/admin/permissions?per_page=1000');
      setAllPermissions(res.data.data || res.data);
      AxionAlert.fire({ icon: "success", title: "Permissão excluída!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      AxionAlert.fire("Erro", err.response?.data?.message || "Falha ao excluir permissão.", "error");
    } finally {
      setActionLoading(false);
    }
  }, [AxionAlert, loadPermissions, permissionsCurrentPage]);

  // ============ HANDLERS DE PERMISSÕES EM GRUPOS ============
  const handleAddPermissionToGroup = useCallback(async (permissionId, permissionName) => {
    if (!selectedGroupId || !permissionName) {
      AxionAlert.fire("Erro", "Dados inválidos para vincular permissão.", "error");
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/api/v1/admin/groups/${selectedGroupId}/permissions`, { permission_name: permissionName });
      AxionAlert.fire({ icon: "success", title: "Permissão Atribuída", text: "A chave foi vinculada ao grupo.", timer: 1500, showConfirmButton: false });
      await loadGroups(groupsCurrentPage);
    } catch (err) {
      console.error("Erro ao vincular permissão:", err.response?.data);
      const message = err.response?.data?.message || "Não foi possível vincular a permissão.";
      AxionAlert.fire("Erro", message, "error");
    } finally {
      setActionLoading(false);
    }
  }, [AxionAlert, loadGroups, groupsCurrentPage, selectedGroupId]);

  const handleRemovePermissionFromGroup = useCallback(async (permissionId) => {
    if (!selectedGroupId) {
      AxionAlert.fire("Erro", "Grupo não selecionado.", "error");
      return;
    }

    const numericId = Number(permissionId);
    if (isNaN(numericId)) {
      AxionAlert.fire("Erro", "ID da permissão inválido.", "error");
      return;
    }

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
        await api.delete(`/api/v1/admin/groups/${selectedGroupId}/permissions/${numericId}`);
        AxionAlert.fire("Removido!", "Permissão desvinculada.", "success");
        await loadGroups(groupsCurrentPage);
      } catch (err) {
        console.error("Erro ao remover permissão:", err.response?.data);
        AxionAlert.fire("Erro", err.response?.data?.message || "Falha ao remover permissão.", "error");
      } finally {
        setActionLoading(false);
      }
    }
  }, [AxionAlert, loadGroups, groupsCurrentPage, selectedGroupId]);

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
    filters, // <--- ADICIONADO AQUI
    loadUsers,
    loadGroups,
    loadAuditLogs,
    loadPermissions,
    loadServiceOrders,
  ]);

  // ============ RESETAR PÁGINA PARA 1 QUANDO FILTROS MUDAREM ============
  useEffect(() => {
    setUsersCurrentPage(1);
    setGroupsCurrentPage(1);
    setAuditCurrentPage(1);
    setOrdersCurrentPage(1);
    setPermissionsCurrentPage(1);
  }, [filters]);

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
  const handleUsersPageChange = useCallback((page) => setUsersCurrentPage(page), []);
  const handleGroupsPageChange = useCallback((page) => setGroupsCurrentPage(page), []);
  const handleAuditPageChange = useCallback((page) => setAuditCurrentPage(page), []);
  const handleOrdersPageChange = useCallback((page) => setOrdersCurrentPage(page), []);
  const handlePermissionsPageChange = useCallback((page) => setPermissionsCurrentPage(page), []);

  // ============ HANDLERS DE USUÁRIOS ============
  const handleUpdateUser = useCallback(async (userId, data) => {
    if (!userId) return;
    setActionLoading(true);
    try {
      await api.put(`/api/v1/admin/users/${userId}/update-manual`, data);
      AxionAlert.fire({ icon: "success", title: "Sucesso!", text: "Perfil atualizado.", timer: 1500, showConfirmButton: false });
      const res = await api.get(`/api/v1/admin/users/${userId}`);
      setSelectedUser(res.data.data || res.data);
      setIsEditing(false);
      loadUsers(usersCurrentPage);
    } catch (err) {
      AxionAlert.fire("Erro!", "Não foi possível salvar as alterações.", "error");
    } finally {
      setActionLoading(false);
    }
  }, [AxionAlert, loadUsers, usersCurrentPage]);

  const handleDeleteUser = useCallback(async (userId, userName) => {
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
  }, [AxionAlert, loadUsers, usersCurrentPage]);

  const handleToggleAdmin = useCallback(async (userId, currentStatus) => {
    const endpoint = currentStatus ? "remove-admin" : "promote";
    const actionText = currentStatus ? "rebaixar para usuário comum" : "promover a administrador";
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
  }, [AxionAlert, loadUsers, usersCurrentPage]);

  const handleToggleStatus = useCallback(async (userId, currentStatus) => {
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
        AxionAlert.fire("Concluído!", `Usuário agora está ${currentStatus ? "inativo" : "ativo"}.`, "success");
        const res = await api.get(`/api/v1/admin/users/${userId}`);
        setSelectedUser(res.data.data || res.data);
        loadUsers(usersCurrentPage);
      } catch (err) {
        AxionAlert.fire("Erro!", "Falha ao atualizar status.", "error");
      } finally {
        setActionLoading(false);
      }
    }
  }, [AxionAlert, loadUsers, usersCurrentPage]);

  // ============ HANDLERS DE GRUPOS ============
  const handleGroupMemberRole = useCallback(async (userId, type) => {
    setActionLoading(true);
    try {
      await api.patch(`/api/v1/groups/${selectedGroupId}/members/${userId}/${type}`);
      AxionAlert.fire("Sucesso!", "Cargo no grupo atualizado.", "success");
      await loadGroups(groupsCurrentPage);
    } catch (err) {
      AxionAlert.fire("Erro", "Erro ao alterar cargo no grupo.", "error");
    } finally {
      setActionLoading(false);
    }
  }, [AxionAlert, loadGroups, groupsCurrentPage, selectedGroupId]);

  const handleAddUserToGroup = useCallback(async (email) => {
    if (!selectedGroupId) return;
    setActionLoading(true);
    try {
      const userToInvite = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!userToInvite) {
        return AxionAlert.fire("Aviso", "Usuário não encontrado.", "info");
      }
      await api.post(`/api/v1/groups/${selectedGroupId}/members`, { user_id: userToInvite.id });
      await loadGroups(groupsCurrentPage);
    } catch (err) {
      AxionAlert.fire("Erro", "Erro ao adicionar.", "error");
    } finally {
      setActionLoading(false);
    }
  }, [AxionAlert, loadGroups, groupsCurrentPage, selectedGroupId, users]);

  const handleRemoveUserFromGroup = useCallback(async (userId, userName) => {
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
  }, [AxionAlert, loadGroups, groupsCurrentPage, selectedGroupId]);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate("/login");
  }, [navigate]);

  // ============ COMPONENTE DE LOADING PERSONALIZADO ============
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '150ms' }}></div>
        </div>
      </div>
    </div>
  );

  // ============ RENDER PRINCIPAL ============
  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar
        activeTab={activeTab}
        role={role}
        onLogout={handleLogout}
        setActiveTab={handleTabChange}
        onToggle={setSidebarCollapsed}
      />

      <div
        className="flex-1 min-h-screen bg-slate-900 transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? '70px' : '250px',
          width: `calc(100% - ${sidebarCollapsed ? '70px' : '250px'})`
        }}
      >
        <header className="flex justify-between items-center px-8 py-4 bg-slate-800/50 border-b border-slate-700/50 min-h-[72px] sticky top-0 z-50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Axion<span className="text-blue-500">ID</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${role === "admin" ? "bg-blue-500/20 text-blue-400" : "bg-slate-700 text-slate-300"}`}>
                {role === "admin" ? "Admin" : "Comum"}
              </span>
            </h1>
          </div>
          {currentUser && <UserDropdown user={currentUser} onLogout={handleLogout} />}
        </header>

        <main className="p-6 max-w-7xl mx-auto w-full">
          {/* ========== BANNER DE ENDEREÇO INCOMPLETO ========== */}
          {showAddressBanner && currentUser && !currentUser.is_admin && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-yellow-400 text-2xl">⚠️</span>
                <div>
                  <p className="text-yellow-200 font-semibold">Endereço incompleto</p>
                  <p className="text-yellow-200/70 text-sm">Para melhor identificação, complete seu endereço de registro.</p>
                </div>
              </div>
              <button onClick={handleOpenAddressModal} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all">
                Completar Endereço ➜
              </button>
            </div>
          )}

          {/* ========== MODAL DE ENDEREÇO ========== */}
          {showAddressModal && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="bg-slate-800/95 border border-slate-700/50 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                  <h3 className="text-lg font-bold text-white">📍 Completar Endereço</h3>
                  <button onClick={() => setShowAddressModal(false)} className="text-slate-400 hover:text-slate-200 text-2xl">✕</button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
                  <form className="space-y-4">
                    {/* CEP com auto completar */}
                    <div className="relative">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">CEP</label>
                      <input
                        type="text"
                        value={addressForm.zip_code}
                        onChange={(e) => setAddressForm({ ...addressForm, zip_code: e.target.value })}
                        onBlur={(e) => fetchAddressByCep(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="00000-000"
                        disabled={loadingCep}
                      />
                      {loadingCep && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin inline-block"></span>
                        </div>
                      )}
                    </div>

                    {/* Rua */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rua</label>
                      <input
                        type="text"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Rua das Flores"
                      />
                    </div>

                    {/* Número e Bairro */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Número</label>
                        <input
                          type="text"
                          value={addressForm.number}
                          onChange={(e) => setAddressForm({ ...addressForm, number: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="123"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Bairro</label>
                        <input
                          type="text"
                          value={addressForm.neighborhood}
                          onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="Centro"
                        />
                      </div>
                    </div>

                    {/* Cidade e Estado */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Cidade</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="São Paulo"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Estado</label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          placeholder="SP"
                          maxLength={2}
                        />
                      </div>
                    </div>

                    {/* Complemento */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Complemento</label>
                      <input
                        type="text"
                        value={addressForm.complement}
                        onChange={(e) => setAddressForm({ ...addressForm, complement: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Apto 101"
                      />
                    </div>
                  </form>
                </div>
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/50">
                  <button onClick={() => setShowAddressModal(false)} disabled={addressLoading} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 transition-all">Cancelar</button>
                  <button onClick={handleSaveAddress} disabled={addressLoading} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-all flex items-center gap-2">
                    {addressLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Salvando...
                      </>
                    ) : (
                      "💾 Salvar Endereço"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========== CONTEÚDO PRINCIPAL ========== */}
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
                if (!userId) return AxionAlert.fire("Erro", "ID do usuário não identificado.", "error");
                handleUpdateUser(userId, formData);
              }}
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
              onDeleteGroup={(id) =>
                api.delete(`/api/v1/groups/${id}`).then(() => {
                  setSelectedGroupId(null);
                  loadGroups(1);
                  setGroupsCurrentPage(1);
                })
              }
              allAvailablePermissions={allPermissions}
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
                onFilterChange={(e) => setFilters({ ...filters, [e.target.name]: e.target.value })}
                onClear={handleClearFilters}
                onNewGroup={() => setShowGroupForm(true)}
                onNewPermission={() => setShowPermissionModal(true)}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                actionLoading={actionLoading}
                handleSave={() => {
                  const userId = selectedUser?.data?.id || selectedUser?.id;
                  if (!userId) return AxionAlert.fire("Erro", "ID do usuário não identificado.", "error");
                  handleUpdateUser(userId, formData);
                }}
                onBack={() => { setSelectedUser(null); setIsEditing(false); }}
              />

              {activeTab === "permissions" && showPermissionModal && (
                <PermissionForm loading={actionLoading} onCancel={() => setShowPermissionModal(false)} onSave={handleCreatePermission} />
              )}

              {activeTab === "orders" && (
                <>
                  {showOrderForm && (
                    <ServiceOrderForm groups={groups} onSuccess={() => { setShowOrderForm(false); loadServiceOrders(ordersCurrentPage); }} onCancel={() => setShowOrderForm(false)} />
                  )}

                  {!showOrderForm && selectedOrder && selectedOrder.id && (
                    <ServiceOrderDetail
                      order={selectedOrder}
                      onBack={() => setSelectedOrder(null)}
                      onUpdateStatus={onUpdateStatus}
                      isSystemAdmin={isGlobalAdmin}
                      currentUser={currentUser}
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
                            AxionAlert.fire({ icon: "success", title: "Deletado!", text: "Ordem de serviço removida.", timer: 1500, showConfirmButton: false });
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
                    <div className="transition-all duration-300 ease-in opacity-100">
                      <ServiceOrderTable
                        orders={serviceOrders}
                        loading={actionLoading || loading}
                        onViewDetail={(id) => { setShowOrderForm(false); handleOpenOrderDetail(id); }}
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

              {/* ========== 🔥 TERMOS DE USO ========== */}
              {activeTab === "terms" && isGlobalAdmin && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                  {showTermAcceptances ? (
                    <TermAcceptances 
                      termId={selectedTermId}
                      onBack={handleBackFromAcceptances}
                    />
                  ) : (
                    <TermManagement 
                      onViewUsers={handleViewTermAcceptances}
                    />
                  )}
                </div>
              )}

              {/* ========== 🔥 ABA DA IA ========== */}
              {activeTab === "ai" && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                  <AIChat />
                </div>
              )}

              <div className={`relative ${loading || actionLoading ? "opacity-60 pointer-events-none" : ""}`}>
                {(loading || actionLoading) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-xl z-10">
                    <LoadingSpinner />
                  </div>
                )}

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden p-6">
                  {activeTab === "users" && (
                    isGlobalAdmin ? (
                      <>
                        <UserTable
                          users={users}
                          onViewDetail={(id) => api.get(`/api/v1/admin/users/${id}`).then((res) => setSelectedUser(res.data.data || res.data))}
                          onDeleteUser={handleDeleteUser}
                          onToggleAdmin={handleToggleAdmin}
                          isGlobalAdmin={isGlobalAdmin}
                        />
                        <Pagination currentPage={usersPagination?.current || 1} lastPage={usersPagination?.last || 1} total={usersPagination?.total || 0} onPageChange={handleUsersPageChange} loading={loading} />
                      </>
                    ) : (
                      <OperationView />
                    )
                  )}

                  {activeTab === "audit" && (
                    <>
                      <AuditTable logs={auditLogs} />
                      <Pagination currentPage={auditPagination?.current || 1} lastPage={auditPagination?.last || 1} total={auditPagination?.total || 0} onPageChange={handleAuditPageChange} loading={loading} />
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
                            AxionAlert.fire({ icon: "success", title: "Grupo Criado!", text: `O grupo "${data.name}" foi criado com sucesso.`, timer: 1500, showConfirmButton: false });
                          } catch (err) {
                            console.error("Erro ao criar grupo:", err);
                            AxionAlert.fire("Erro", err.response?.data?.message || "Não foi possível criar o grupo.", "error");
                          } finally {
                            setActionLoading(false);
                          }
                        }}
                        loading={actionLoading}
                      />
                    ) : (
                      <>
                        <GroupTable groups={groups} onViewDetail={setSelectedGroupId} isGlobalAdmin={isGlobalAdmin} currentUser={currentUser} />
                        <Pagination currentPage={groupsPagination?.current || 1} lastPage={groupsPagination?.last || 1} total={groupsPagination?.total || 0} onPageChange={handleGroupsPageChange} loading={loading} />
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
                        <PermissionTable permissions={permissions} loading={loading} currentUser={currentUser} onViewDetail={handleOpenPermissionDetail} onDelete={handleDeletePermission} />
                        {permissionsPagination?.last > 1 && (
                          <Pagination currentPage={permissionsPagination.current} lastPage={permissionsPagination.last} total={permissionsPagination.total} onPageChange={handlePermissionsPageChange} loading={loading} />
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
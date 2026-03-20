import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { Spinner } from "react-bootstrap";
import Swal from "sweetalert2";
import api from "../services/api";
import { useDashboardData } from "../hooks/useDashboardData";

// Componentes
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
  
  // Estados de Seleção
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Estados de UI
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [serviceOrders, setServiceOrders] = useState([]);
  const [permissions, setPermissions] = useState([]);

  // Mixin de Alerta Padronizado
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

  // --- CARREGAMENTO DE DADOS ---

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

  const loadPermissions = useCallback(async () => {
    try {
      const res = await api.get("/api/v1/admin/permissions");
      setPermissions(res.data.data || res.data || []);
    } catch (err) {
      setPermissions([]);
    }
  }, []);

  // Efeito centralizado para troca de abas
  useEffect(() => {
    const fetchData = () => {
      switch (activeTab) {
        case "users": loadUsers(currentPage); break;
        case "audit": loadAuditLogs(currentPage); break;
        case "groups": 
          loadGroups(currentPage); 
          loadPermissions(); 
          break;
        case "permissions": loadPermissions(); break;
        case "orders": loadServiceOrders(); break;
        default: break;
      }
    };
    fetchData();
  }, [activeTab, currentPage, loadUsers, loadGroups, loadAuditLogs, loadPermissions, loadServiceOrders]);

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

  // --- GESTÃO DE ORDENS DE SERVIÇO ---

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const id = orderId || selectedOrder?.id;
    if (!id) return;

    try {
      setActionLoading(true);
      await api.patch(`/api/v1/service-orders/${id}`, { status: newStatus });
      
      AxionAlert.fire({
        icon: "success",
        title: "Status Atualizado!",
        timer: 1500,
        showConfirmButton: false,
      });

      loadServiceOrders();
      // Atualiza o detalhe se estiver aberto
      if (selectedOrder) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      AxionAlert.fire("Erro", "Falha ao atualizar no servidor.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteOrder = async (id) => {
    const result = await AxionAlert.fire({
      title: "Excluir OS?",
      text: "Esta ação não pode ser desfeita.",
      icon: "warning",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      try {
        setActionLoading(true);
        await api.delete(`/api/v1/service-orders/${id}`);
        AxionAlert.fire("Excluída!", "A ordem foi removida.", "success");
        setSelectedOrder(null);
        loadServiceOrders();
      } catch (err) {
        AxionAlert.fire("Erro", "Falha ao excluir.", "error");
      } finally {
        setActionLoading(false);
      }
    }
  };

  // --- RENDERS ---

  return (
    <div className="dashboard-layout animate-in">
      <Sidebar
        activeTab={activeTab}
        role={role}
        onLogout={() => { localStorage.clear(); navigate("/login"); }}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedUser(null);
          setSelectedGroupId(null);
          setSelectedOrder(null); // Reseta seleção ao trocar de aba
          setShowOrderForm(false);
        }}
      />

      <div className="main-wrapper">
        <header className="main-header d-flex justify-content-between align-items-center p-3">
          <h2 className="brand mb-0" style={{ fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
            AxionID
            <span className={`badge-role ${role === 'admin' ? 'admin' : 'common'}`}>
              {role === "admin" ? "Admin" : "Comum"}
            </span>
          </h2>
          {currentUser && <UserDropdown user={currentUser} onLogout={() => { localStorage.clear(); navigate("/login"); }} />}
        </header>

        <main className="content-area p-4">
          
          {/* VISÃO DE DETALHE: USUÁRIO */}
          {selectedUser && (
            <UserDetail 
              user={selectedUser} 
              onBack={() => setSelectedUser(null)} 
              // ... outras props de user detail
            />
          )}

          {/* VISÃO DE DETALHE: GRUPO */}
          {selectedGroupId && !selectedUser && (
            <GroupDetail 
              group={groups.find(g => g.id === selectedGroupId)}
              onBack={() => setSelectedGroupId(null)}
              // ... outras props de group detail
            />
          )}

          {/* VISÃO DE DETALHE: ORDEM DE SERVIÇO */}
          {activeTab === "orders" && selectedOrder && (
            <ServiceOrderDetail
              order={selectedOrder}
              onBack={() => setSelectedOrder(null)}
              onUpdateStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              actionLoading={actionLoading}
              isSystemAdmin={isGlobalAdmin}
            />
          )}

          {/* VISÃO DE LISTAGEM / TABELAS */}
          {!selectedUser && !selectedGroupId && !selectedOrder && (
            <>
              <DashboardFilters 
                activeTab={activeTab} 
                onNewOrder={() => setShowOrderForm(true)}
                onNewGroup={() => setShowGroupForm(true)}
                // ... outras props de filtros
              />

              <div className={`tab-wrapper ${loading || actionLoading ? "is-loading" : ""}`}>
                {(loading || actionLoading) && (
                  <div className="loading-overlay"><Spinner animation="border" variant="primary" /></div>
                )}

                <div className="content-card">
                  {activeTab === "users" && (
                    isGlobalAdmin ? <UserTable users={users} onViewDetail={id => api.get(`/api/v1/admin/users/${id}`).then(res => setSelectedUser(res.data.data || res.data))} /> : <OperationView />
                  )}

                  {activeTab === "orders" && (
                    showOrderForm ? (
                      <ServiceOrderForm 
                        groups={groups} 
                        onSuccess={() => { setShowOrderForm(false); loadServiceOrders(); }} 
                        onCancel={() => setShowOrderForm(false)} 
                      />
                    ) : (
                      <ServiceOrderTable 
                        orders={serviceOrders} 
                        loading={actionLoading} 
                        onViewDetail={(order) => setSelectedOrder(order)} 
                      />
                    )
                  )}

                  {activeTab === "groups" && (
                    showGroupForm ? <GroupForm onCancel={() => setShowGroupForm(false)} onUpdate={() => { setShowGroupForm(false); loadGroups(1); }} /> : <GroupTable groups={groups} onViewDetail={setSelectedGroupId} />
                  )}

                  {activeTab === "audit" && <AuditTable logs={auditLogs} />}
                  {activeTab === "permissions" && <PermissionTable permissions={permissions} />}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
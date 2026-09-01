// pages/Dashboard.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
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
// 🔥 IMPORTAR A PÁGINA DE ACESSO NEGADO
import AccessDenied from "./AccessDenied";

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
  const termManagementRef = useRef(null);

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

  // 🔥 ESTADO PARA CONTROLAR SE TEM ACESSO
  const [hasAccess, setHasAccess] = useState(null);

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
    hasAnyPermission, // 🔥 JÁ DISPONÍVEL
  } = usePermissions();

  // =========================================================
  // 🔥 VERIFICAR PERMISSÃO DE ACESSO AO SISTEMA
  // =========================================================
  useEffect(() => {
    if (currentUser && !permissionsLoading) {
      const access = hasAnyPermission();
      setHasAccess(access);
      if (!access) {
        // Redireciona para a página de acesso negado
        navigate('/access-denied', { replace: true });
      }
    }
  }, [currentUser, permissionsLoading, hasAnyPermission, navigate]);

  // =========================================================
  // 🔥 CONTROLAR ABA INICIAL BASEADA NAS PERMISSÕES
  // =========================================================
  useEffect(() => {
    if (!permissionsLoading) {
      if (!canAccessAnyTab()) {
        // Se não tiver nenhuma aba, isso já será tratado pelo redirecionamento acima
      } else {
        const firstTab = getFirstAvailableTab();
        if (!canAccessTab(activeTab)) {
          setActiveTab(firstTab);
        }
      }
    }
  }, [permissionsLoading, canAccessAnyTab, getFirstAvailableTab, canAccessTab, activeTab]);

  // ... (restante do código, incluindo useDashboardData, handlers, etc.)

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

  // ... (todos os outros hooks e handlers permanecem iguais)

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

  // =============================================================
  // 🔥 RENDERIZAÇÃO CONDICIONAL – SE NÃO TIVER ACESSO, MOSTRA DENIED
  // =============================================================
  if (currentUser === null || permissionsLoading || hasAccess === null) {
    // Ainda carregando
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <LoadingSpinner />
      </div>
    );
  }

  // Se não tiver permissão, exibe a página de acesso negado (já redirecionamos, mas por segurança)
  if (!hasAccess) {
    return <AccessDenied />;
  }

  // =============================================================
  // RENDERIZAÇÃO PRINCIPAL (quando tem acesso)
  // =============================================================
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
        {/* ... todo o resto do JSX permanece igual a partir daqui */}
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
          {/* ... todo o conteúdo do main (banner de endereço, modais, etc.) permanece igual */}
          {/* ... (todo o restante do código que estava dentro do return) */}
        </main>
      </div>
    </div>
  );
}
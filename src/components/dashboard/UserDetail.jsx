// components/dashboard/UserDetail.jsx
import { useEffect, useState } from "react";
import UserPermissionManager from "./UserPermissionManager";
import api from "../../services/api";
import Swal from "sweetalert2";

export default function UserDetail({
  user,
  isEditing = false,
  formData = {},
  setFormData = () => {},
  onAction = () => {},
  actionLoading = false,
  onBack = () => {},
  setIsEditing = () => {},
  handleSave = () => {},
  isDark = false,
}) {
  // 🔥 Estados para permissões
  const [userPermissions, setUserPermissions] = useState([]);
  const [allAvailablePermissions, setAllAvailablePermissions] = useState([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  // 🔥 Carregar permissões do usuário
  const loadUserPermissions = async (userId) => {
    if (!userId) return;
    setPermissionsLoading(true);
    try {
      const response = await api.get(`/api/v1/admin/users/${userId}/permissions`);
      setUserPermissions(response.data.permissions || []);
    } catch (error) {
      if (user?.permissions) {
        setUserPermissions(user.permissions);
      }
    } finally {
      setPermissionsLoading(false);
    }
  };

  // 🔥 Carregar todas as permissões disponíveis
  const loadAllPermissions = async () => {
    try {
      const response = await api.get('/api/v1/admin/permissions', {
        params: { per_page: 100 }
      });
      setAllAvailablePermissions(response.data.data || []);
    } catch (error) {
      setAllAvailablePermissions([
        { id: 1, name: 'users.view', label: 'Visualizar Usuários', description: 'Permite visualizar usuários' },
        { id: 2, name: 'users.create', label: 'Criar Usuários', description: 'Permite criar novos usuários' },
        { id: 3, name: 'users.edit', label: 'Editar Usuários', description: 'Permite editar usuários' },
        { id: 4, name: 'users.delete', label: 'Excluir Usuários', description: 'Permite excluir usuários' },
        { id: 5, name: 'groups.manage', label: 'Gerenciar Grupos', description: 'Permite gerenciar grupos' },
        { id: 6, name: 'orders.view', label: 'Visualizar OS', description: 'Permite visualizar ordens de serviço' },
        { id: 7, name: 'orders.create', label: 'Criar OS', description: 'Permite criar ordens de serviço' },
        { id: 8, name: 'orders.edit', label: 'Editar OS', description: 'Permite editar ordens de serviço' },
      ]);
    }
  };

  // 🔥 Adicionar permissão ao usuário
  const handleAddPermission = async (userId, permissionId) => {
    try {
      await api.post(`/api/v1/admin/users/${userId}/permissions`, {
        permission_id: permissionId
      });
      await loadUserPermissions(userId);
      Swal.fire({
        icon: "success",
        title: "Permissão adicionada!",
        timer: 1500,
        showConfirmButton: false,
        background: isDark ? "#111214" : "#ffffff",
        color: isDark ? "#ffffff" : "#1f2937",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.message || "Não foi possível adicionar a permissão.",
        background: isDark ? "#111214" : "#ffffff",
        color: isDark ? "#ffffff" : "#1f2937",
      });
    }
  };

  // 🔥 Remover permissão do usuário
  const handleRemovePermission = async (userId, permissionId) => {
    try {
      await api.delete(`/api/v1/admin/users/${userId}/permissions/${permissionId}`);
      await loadUserPermissions(userId);
      Swal.fire({
        icon: "success",
        title: "Permissão removida!",
        timer: 1500,
        showConfirmButton: false,
        background: isDark ? "#111214" : "#ffffff",
        color: isDark ? "#ffffff" : "#1f2937",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: error.response?.data?.message || "Não foi possível remover a permissão.",
        background: isDark ? "#111214" : "#ffffff",
        color: isDark ? "#ffffff" : "#1f2937",
      });
    }
  };

  // 🔥 Carregar dados quando o usuário mudar
  useEffect(() => {
    if (user && setFormData) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        cpf_cnpj: user.cpf_cnpj || "",
        zip_code: user.address?.zip_code || "",
        street: user.address?.street || "",
        number: user.address?.number || "",
        neighborhood: user.address?.neighborhood || "",
        city: user.localidade || user.address?.city || "",
        state: user.uf || user.address?.state || "",
        complement: user.address?.complement || "",
      });
    }
    
    if (user?.id) {
      loadUserPermissions(user.id);
      loadAllPermissions();
    }
  }, [user]);

  if (!user) return null;

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          }));
        }
      } catch (error) {
        // silencioso
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ============ CLASSES DE TEMA ============
  const bgPage = isDark ? 'bg-slate-900' : 'bg-gray-100';
  const bgCard = isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200';
  const bgCardEditing = isDark ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-blue-400/50 shadow-lg shadow-blue-200/50';
  const bgInput = isDark ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder-slate-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400';
  const bgInputDisabled = isDark ? 'bg-slate-800/30 border-slate-700/30 text-slate-500' : 'bg-gray-100 border-gray-200 text-gray-500';
  const textHeading = isDark ? 'text-white' : 'text-gray-800';
  const textSub = isDark ? 'text-slate-400' : 'text-gray-600';
  const textLabel = isDark ? 'text-slate-400' : 'text-gray-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-gray-400';
  const borderSubtle = isDark ? 'border-slate-700/50' : 'border-gray-200';

  // ============ RENDER ============
  return (
    <div className={`${bgPage} rounded-xl min-h-screen`}>
      {/* ============ HEADER ============ */}
      <div className={`flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r ${isDark ? 'from-slate-800/50 to-slate-900/50 border-b border-slate-700/50' : 'from-gray-50/80 to-white border-b border-gray-200'} rounded-t-xl`}>
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className={`inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border ${isDark ? 'border-slate-700/50 bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800'} transition-all whitespace-nowrap text-xs sm:text-sm`}
          >
            ← Voltar
          </button>

          <div className={`w-px h-6 sm:h-8 ${isDark ? 'bg-slate-700/50' : 'bg-gray-300'}`}></div>

          <div className="min-w-0">
            <h2 className={`text-base sm:text-xl font-bold ${textHeading} truncate`}>
              {user.name}
            </h2>
            <span className={`font-mono text-xs ${textMuted}`}>ID: {user.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isEditing ? (
            <button
              className="inline-flex items-center gap-1 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Editar
            </button>
          ) : (
            <>
              <button
                className={`inline-flex items-center gap-1 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full ${isDark ? 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} font-semibold text-xs sm:text-sm transition-all hover:-translate-y-0.5 whitespace-nowrap`}
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
              <button
                className="inline-flex items-center gap-1 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-green-600 hover:bg-green-500 text-white font-semibold text-xs sm:text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                onClick={handleSave}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Salvando...
                  </>
                ) : (
                  <>💾 Salvar</>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ============ GRID PRINCIPAL ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-3 sm:p-6">
        {/* ============ COLUNA ESQUERDA ============ */}
        <div className="space-y-4 sm:space-y-6">
          {/* Card Principal */}
          <div className={`${bgCard} border rounded-xl p-4 sm:p-6 transition-all ${isEditing ? bgCardEditing : ''}`}>
            {/* Profile Header */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 min-w-[48px] sm:min-w-[64px] rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg sm:text-2xl font-bold text-white shadow-lg shadow-blue-500/20">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400'} border rounded-lg text-base sm:text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${isEditing ? 'border-blue-500/50' : 'border-transparent'} disabled:opacity-100 disabled:cursor-default`}
                />
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5">
                  <span className={`inline-flex px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${user.is_admin ? isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700" : isDark ? "bg-slate-700/50 text-slate-300" : "bg-gray-200 text-gray-700"}`}>
                    {user.is_admin ? "Administrador" : "Operacional"}
                  </span>
                  {!user.is_active && (
                    <span className="inline-flex px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-red-500/20 text-red-400">
                      Suspenso
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Informações */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1 sm:mb-1.5 ${textLabel}`}>
                  📧 E-mail Corporativo
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 ${bgInput} rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default`}
                />
              </div>
              <div>
                <label className={`block text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-1 sm:mb-1.5 ${textLabel}`}>
                  📄 Documento
                </label>
                <input
                  type="text"
                  value={user.cpf_cnpj || "Não informado"}
                  disabled
                  className={`w-full px-2 sm:px-3 py-2 sm:py-2.5 ${bgInputDisabled} rounded-lg text-xs sm:text-sm cursor-not-allowed`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============ COLUNA DIREITA ============ */}
        <div className="space-y-4 sm:space-y-6">
          {/* Endereço */}
          <div className={`${bgCard} border rounded-xl p-4 sm:p-6 transition-all ${isEditing ? bgCardEditing : ''}`}>
            <h4 className={`text-xs sm:text-sm font-bold flex items-center gap-2 mb-3 sm:mb-4 ${textHeading}`}>
              📍 Endereço de Registro
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 sm:gap-3">
              <div className="col-span-2 sm:col-span-2">
                <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-0.5 sm:mb-1 ${textLabel}`}>
                  CEP
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code || ""}
                  onChange={handleChange}
                  onBlur={handleCepBlur}
                  disabled={!isEditing}
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 ${bgInput} rounded-lg font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default`}
                  placeholder="00000-000"
                />
              </div>
              <div className="col-span-4 sm:col-span-4">
                <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-0.5 sm:mb-1 ${textLabel}`}>
                  Rua
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 ${bgInput} rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default`}
                />
              </div>
              <div className="col-span-1">
                <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-0.5 sm:mb-1 ${textLabel}`}>
                  Nº
                </label>
                <input
                  type="text"
                  name="number"
                  value={formData.number || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 ${bgInput} rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default`}
                />
              </div>
              <div className="col-span-5">
                <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-0.5 sm:mb-1 ${textLabel}`}>
                  Bairro
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 ${bgInput} rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default`}
                />
              </div>
              <div className="col-span-3">
                <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-0.5 sm:mb-1 ${textLabel}`}>
                  Cidade
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 ${bgInput} rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default`}
                />
              </div>
              <div className="col-span-2">
                <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-0.5 sm:mb-1 ${textLabel}`}>
                  UF
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  maxLength="2"
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 ${bgInput} rounded-lg text-xs sm:text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default`}
                />
              </div>
              <div className="col-span-6">
                <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-0.5 sm:mb-1 ${textLabel}`}>
                  Complemento
                </label>
                <input
                  type="text"
                  name="complement"
                  value={formData.complement || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 ${bgInput} rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ GERENCIADOR DE PERMISSÕES ============ */}
      <div className="px-3 sm:px-6 pb-4 sm:pb-6">
        <UserPermissionManager
          user={user}
          userPermissions={userPermissions}
          allAvailablePermissions={allAvailablePermissions}
          onAddPermission={handleAddPermission}
          onRemovePermission={handleRemovePermission}
          actionLoading={permissionsLoading || actionLoading}
          isDark={isDark}
        />
      </div>

      {/* ============ AÇÕES CRÍTICAS ============ */}
      <div className="px-3 sm:px-6 pb-4 sm:pb-6">
        <div className={`${bgCard} border rounded-xl p-4 sm:p-6`}>
          <h4 className={`text-xs sm:text-sm font-bold flex items-center gap-2 mb-3 sm:mb-4 ${textHeading}`}>
            ⚡ Gestão de Acesso e Privilégios
          </h4>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {user.is_admin ? (
              <button
                onClick={() => onAction("remove-admin")}
                disabled={actionLoading}
                className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg text-[11px] sm:text-sm font-semibold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Revogar Privilégios Admin
              </button>
            ) : (
              <button
                onClick={() => onAction("promote")}
                disabled={actionLoading}
                className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg text-[11px] sm:text-sm font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Promover a Administrador
              </button>
            )}
            <button
              onClick={() => onAction("toggle-status")}
              disabled={actionLoading}
              className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg text-[11px] sm:text-sm font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {user.is_active ? "Suspender Acesso" : "Reativar Acesso"}
            </button>
            <button
              onClick={() => onAction("delete")}
              disabled={actionLoading}
              className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg text-[11px] sm:text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {actionLoading ? "Processando..." : "Excluir Identidade"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
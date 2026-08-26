import { useEffect } from "react";
import UserPermissionManager from "./UserPermissionManager";

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
  // Novas props para permissões
  userPermissions = [],
  allAvailablePermissions = [],
  onAddPermission = () => {},
  onRemovePermission = () => {},
}) {
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
  }, [user, setFormData]);

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
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ============ RENDER ============
  return (
    <div className="bg-slate-900 rounded-xl min-h-screen">
      {/* ============ HEADER ============ */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-slate-700/50 rounded-t-xl">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700/50 bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all whitespace-nowrap text-sm"
          >
            ← Voltar
          </button>

          <div className="w-px h-8 bg-slate-700/50"></div>

          <div>
            <h2 className="text-xl font-bold text-white">
              {user.name}
            </h2>
            <span className="font-mono text-xs text-slate-500">ID: {user.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <button
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
              onClick={() => setIsEditing(true)}
            >
              ✏️ Editar
            </button>
          ) : (
            <>
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-semibold text-sm transition-all hover:-translate-y-0.5"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    💾 Salvar Alterações
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ============ GRID PRINCIPAL ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* ============ COLUNA ESQUERDA ============ */}
        <div className="space-y-6">
          {/* Card Principal */}
          <div className={`bg-slate-800/50 border rounded-xl p-6 transition-all ${isEditing ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-slate-700/50'}`}>
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 min-w-[64px] rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/20">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 bg-slate-800/50 border rounded-lg text-white text-lg font-bold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all ${
                    isEditing ? 'border-blue-500/50' : 'border-transparent'
                  } disabled:opacity-100 disabled:cursor-default`}
                />
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                    user.is_admin
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-slate-700/50 text-slate-300"
                  }`}>
                    {user.is_admin ? "Administrador" : "Operacional"}
                  </span>
                  {!user.is_active && (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400">
                      Suspenso
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Informações */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  📧 E-mail Corporativo
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  📄 Documento
                </label>
                <input
                  type="text"
                  value={user.cpf_cnpj || "Não informado"}
                  disabled
                  className="w-full px-3 py-2.5 bg-slate-800/30 border border-slate-700/30 rounded-lg text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ============ COLUNA DIREITA ============ */}
        <div className="space-y-6">
          {/* Endereço */}
          <div className={`bg-slate-800/50 border rounded-xl p-6 transition-all ${isEditing ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-slate-700/50'}`}>
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              📍 Endereço de Registro
            </h4>

            <div className="grid grid-cols-6 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code || ""}
                  onChange={handleChange}
                  onBlur={handleCepBlur}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default"
                  placeholder="00000-000"
                />
              </div>
              <div className="col-span-4">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Rua
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Nº
                </label>
                <input
                  type="text"
                  name="number"
                  value={formData.number || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default"
                />
              </div>
              <div className="col-span-5">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default"
                />
              </div>
              <div className="col-span-4">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  UF
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  maxLength="2"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default"
                />
              </div>
              <div className="col-span-6">
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  name="complement"
                  value={formData.complement || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-60 disabled:cursor-default"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ GERENCIADOR DE PERMISSÕES ============ */}
      <div className="px-6 pb-6">
        <UserPermissionManager
          user={user}
          userPermissions={userPermissions}
          allAvailablePermissions={allAvailablePermissions}
          onAddPermission={onAddPermission}
          onRemovePermission={onRemovePermission}
          actionLoading={actionLoading}
        />
      </div>

      {/* ============ AÇÕES CRÍTICAS ============ */}
      <div className="px-6 pb-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            ⚡ Gestão de Acesso e Privilégios
          </h4>
          <div className="flex flex-wrap gap-3">
            {user.is_admin ? (
              <button
                onClick={() => onAction("remove-admin")}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Revogar Privilégios Admin
              </button>
            ) : (
              <button
                onClick={() => onAction("promote")}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Promover a Administrador
              </button>
            )}
            <button
              onClick={() => onAction("toggle-status")}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {user.is_active ? "Suspender Acesso" : "Reativar Acesso"}
            </button>
            <button
              onClick={() => onAction("delete")}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? "Processando..." : "Excluir Identidade"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
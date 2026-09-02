// components/dashboard/GroupPermissionManager.jsx
import { useState } from "react";
import Swal from "sweetalert2";

export default function GroupPermissionManager({
  group,
  permissions,
  onAddPermission,
  onRemovePermission,
  actionLoading,
  canManage = true,
  isDark = false, // 🔥 NOVA PROP
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // 🔥 SweetAlert com tema
  const AxionAlert = Swal.mixin({
    background: isDark ? "#111214" : "#ffffff",
    color: isDark ? "#ffffff" : "#1f2937",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#343a40",
    customClass: {
      popup: `border ${isDark ? 'border-slate-700' : 'border-gray-200'} rounded-xl`,
      confirmButton: "px-4 py-2 rounded-full font-bold mx-2 bg-indigo-500 hover:bg-indigo-400 transition-colors",
      cancelButton: "px-4 py-2 rounded-full font-bold mx-2 bg-slate-700 hover:bg-slate-600 transition-colors",
    },
  });

  // ============ CLASSES DE TEMA ============
  const bgCard = isDark 
    ? 'bg-slate-800/50 border-slate-700/50' 
    : 'bg-white/80 border-gray-200';
  const bgHeader = isDark 
    ? 'bg-slate-800/30 border-slate-700/50' 
    : 'bg-gray-100/80 border-gray-200';
  const textHeading = isDark ? 'text-white' : 'text-gray-800';
  const textSub = isDark ? 'text-slate-500' : 'text-gray-400';
  const textLabel = isDark ? 'text-slate-400' : 'text-gray-500';
  const textBody = isDark ? 'text-slate-200' : 'text-gray-700';
  const textCode = isDark ? 'text-slate-500' : 'text-gray-400';
  const badgeEmpty = isDark ? 'text-slate-500' : 'text-gray-500';
  const btnAdd = isDark 
    ? 'text-white bg-blue-600 hover:bg-blue-500' 
    : 'text-white bg-blue-600 hover:bg-blue-500';
  const permissionBg = isDark 
    ? 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-700/30' 
    : 'bg-gray-100/80 border-gray-200 hover:bg-gray-200';
  const permissionSelected = isDark 
    ? 'bg-blue-500/20 border-blue-500/30' 
    : 'bg-blue-100/80 border-blue-300/50';
  const modalBg = isDark ? 'bg-slate-800/95 border-slate-700/50' : 'bg-white/95 border-gray-200';
  const modalHeader = isDark ? 'bg-slate-800/50' : 'bg-gray-50';
  const modalBorder = isDark ? 'border-slate-700/50' : 'border-gray-200';
  const overlayBg = isDark ? 'bg-black/70' : 'bg-black/50';
  const inputBg = isDark 
    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder-slate-500' 
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400';
  const focusRing = 'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50';
  const btnCancel = isDark 
    ? 'text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50' 
    : 'text-gray-600 hover:text-gray-800 bg-gray-200 hover:bg-gray-300';
  const btnSubmit = 'text-white bg-blue-600 hover:bg-blue-500';
  const removeBtn = isDark 
    ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' 
    : 'text-red-600 hover:text-red-700 hover:bg-red-50';
  const infoBoxBg = isDark 
    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' 
    : 'bg-blue-50/80 border-blue-300/30 text-blue-700';
  const emptyIcon = isDark ? 'text-slate-500' : 'text-gray-400';

  // =========================================================
  // UTILITÁRIOS – extrair IDs e filtrar permissões
  // =========================================================
  const getGroupPermissionIds = () => {
    if (!group?.permissions || group.permissions.length === 0) return [];
    return group.permissions.map(gp => {
      if (gp.id) return Number(gp.id);
      if (gp.permission_id) return Number(gp.permission_id);
      if (gp.pivot?.permission_id) return Number(gp.pivot.permission_id);
      if (typeof gp === 'number') return gp;
      return null;
    }).filter(id => id !== null);
  };

  const getAvailablePermissions = () => {
    if (!permissions || permissions.length === 0) return [];
    const groupIds = getGroupPermissionIds();
    if (groupIds.length === 0) return permissions;
    return permissions.filter(perm => {
      const permId = Number(perm.id || perm.permission_id);
      return !groupIds.includes(permId);
    });
  };

  const getFilteredPermissions = () => {
    const available = getAvailablePermissions();
    if (!searchTerm.trim()) return available;
    const term = searchTerm.toLowerCase();
    return available.filter(perm =>
      (perm.name?.toLowerCase() || '').includes(term) ||
      (perm.label?.toLowerCase() || '').includes(term) ||
      (perm.permission_name?.toLowerCase() || '').includes(term)
    );
  };

  const getPermissionData = (perm) => ({
    id: perm.id || perm.permission_id,
    name: perm.name || perm.permission_name,
    label: perm.label || perm.permission_label || perm.name || 'Sem nome'
  });

  const filteredPermissions = getFilteredPermissions();
  const hasAvailablePermissions = filteredPermissions.length > 0;

  // =========================================================
  // HANDLERS
  // =========================================================
  const handleAddPermission = async () => {
    if (!selectedPermission) {
      AxionAlert.fire("Erro", "Selecione uma permissão para adicionar.", "error");
      return;
    }

    const selectedPerm = permissions.find(p => String(p.id) === selectedPermission);
    if (!selectedPerm) {
      AxionAlert.fire("Erro", "Permissão não encontrada.", "error");
      return;
    }

    await onAddPermission(selectedPermission, selectedPerm.name);
    setShowAddModal(false);
    setSelectedPermission("");
    setSearchTerm("");
  };

  const handleRemovePermission = async (permissionId, permissionName) => {
    const result = await AxionAlert.fire({
      title: "Remover Permissão?",
      text: `Deseja remover a permissão "${permissionName}" deste grupo?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, remover",
      cancelButtonText: "Cancelar",
      background: isDark ? "#111214" : "#ffffff",
      color: isDark ? "#ffffff" : "#1f2937",
    });

    if (result.isConfirmed) {
      await onRemovePermission(Number(permissionId));
    }
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className={`border rounded-xl overflow-hidden ${bgCard}`}>
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b ${bgHeader}`}>
        <h5 className={`text-sm font-bold flex items-center gap-2 ${textHeading}`}>
          🔒 Permissões do Grupo
        </h5>
        {canManage && (
          <button
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${btnAdd}`}
            onClick={() => setShowAddModal(true)}
            disabled={actionLoading}
          >
            ➕ Adicionar Permissão
          </button>
        )}
      </div>

      <div className="p-4">
        {!group?.permissions || group.permissions?.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-8 ${badgeEmpty}`}>
            <span className="text-4xl mb-3 opacity-60">🚫</span>
            <p className="text-sm">Nenhuma permissão vinculada a este grupo.</p>
            {canManage && (
              <button
                className={`inline-flex items-center gap-2 px-4 py-2 mt-3 rounded-lg text-sm font-medium transition-all ${
                  isDark 
                    ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20' 
                    : 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100'
                }`}
                onClick={() => setShowAddModal(true)}
              >
                ➕ Adicionar primeira permissão
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {group.permissions.map((perm) => {
              const data = getPermissionData(perm);
              return (
                <div
                  key={data.id}
                  className={`flex items-center justify-between gap-3 p-3 border rounded-lg transition-all group ${permissionBg}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-blue-400">🔑</span>
                    <div className="min-w-0">
                      <div className={`text-sm font-medium truncate ${textBody}`}>{data.label}</div>
                      <code className={`text-xs font-mono truncate block ${textCode}`}>{data.name}</code>
                    </div>
                  </div>
                  {canManage && (
                    <button
                      className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-md transition-all ${removeBtn}`}
                      onClick={() => handleRemovePermission(data.id, data.label)}
                      disabled={actionLoading}
                      title="Remover permissão"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de adição */}
      {showAddModal && (
        <>
          <div
            className={`fixed inset-0 ${overlayBg} backdrop-blur-sm z-[1050]`}
            onClick={() => { setShowAddModal(false); setSelectedPermission(""); setSearchTerm(""); }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[1060] p-4">
            <div className={`border rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden ${modalBg}`}>
              {/* Header do modal */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${modalBorder} ${modalHeader}`}>
                <h3 className={`text-lg font-bold flex items-center gap-2 ${textHeading}`}>
                  🔑 Adicionar Permissão ao Grupo
                </h3>
                <button
                  onClick={() => { setShowAddModal(false); setSelectedPermission(""); setSearchTerm(""); }}
                  className={`${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
                <div className={`flex items-start gap-3 p-3 border rounded-lg text-sm mb-4 ${infoBoxBg}`}>
                  <span className="text-lg">ℹ️</span>
                  <span>Selecione uma permissão para vincular ao grupo <strong className={isDark ? 'text-white' : 'text-gray-800'}>{group?.name}</strong></span>
                </div>
                <div className="mb-4">
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${textLabel}`}>
                    🔍 Buscar Permissão
                  </label>
                  <input
                    type="text"
                    placeholder="Digite o nome ou chave da permissão..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-3 py-2.5 ${inputBg} rounded-lg text-sm ${focusRing} transition-all`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${textLabel}`}>
                    Permissões Disponíveis ({filteredPermissions.length})
                  </label>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1.5">
                    {!hasAvailablePermissions ? (
                      <div className={`flex flex-col items-center justify-center py-8 ${badgeEmpty}`}>
                        <span className="text-3xl mb-2">📭</span>
                        <p className="text-sm">
                          {permissions.length === 0 ? "Nenhuma permissão cadastrada no sistema." : "Todas as permissões já estão vinculadas a este grupo."}
                        </p>
                      </div>
                    ) : (
                      filteredPermissions.map((perm) => {
                        const data = getPermissionData(perm);
                        const permId = String(data.id);
                        return (
                          <div
                            key={permId}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedPermission === permId ? permissionSelected : permissionBg
                            }`}
                            onClick={() => setSelectedPermission(permId)}
                          >
                            <div>
                              <div className={`text-sm font-medium ${textBody}`}>{data.label}</div>
                              <code className={`text-xs font-mono ${textCode}`}>{data.name}</code>
                            </div>
                            {selectedPermission === permId && <span className="text-blue-400 text-xl">✓</span>}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${modalBorder} ${modalHeader}`}>
                <button
                  onClick={() => { setShowAddModal(false); setSelectedPermission(""); setSearchTerm(""); }}
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${btnCancel}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddPermission}
                  disabled={actionLoading || !selectedPermission}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none flex items-center gap-2 ${btnSubmit}`}
                >
                  {actionLoading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Vinculando...</>
                  ) : (
                    <>🔗 Vincular Permissão</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
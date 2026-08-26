// components/dashboard/GroupPermissionManager.jsx
import { useState } from "react";
import Swal from "sweetalert2";

export default function GroupPermissionManager({
  group,
  permissions,
  onAddPermission,
  onRemovePermission,
  actionLoading,
  canManage = true
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#343a40",
    customClass: {
      popup: "border border-slate-700 rounded-xl",
      confirmButton: "px-4 py-2 rounded-full font-bold mx-2 bg-indigo-500 hover:bg-indigo-400 transition-colors",
      cancelButton: "px-4 py-2 rounded-full font-bold mx-2 bg-slate-700 hover:bg-slate-600 transition-colors",
    },
  });

  // Extrai IDs das permissões do grupo (suporta diferentes estruturas)
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

  // Filtra permissões já vinculadas ao grupo
  const getAvailablePermissions = () => {
    if (!permissions || permissions.length === 0) return [];
    const groupIds = getGroupPermissionIds();
    if (groupIds.length === 0) return permissions;
    return permissions.filter(perm => {
      const permId = Number(perm.id || perm.permission_id);
      return !groupIds.includes(permId);
    });
  };

  // Filtro por busca
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

  const filteredPermissions = getFilteredPermissions();
  const hasAvailablePermissions = filteredPermissions.length > 0;

  // Normaliza dados da permissão para exibição
  const getPermissionData = (perm) => ({
    id: perm.id || perm.permission_id,
    name: perm.name || perm.permission_name,
    label: perm.label || perm.permission_label || perm.name || 'Sem nome'
  });

  // ===== HANDLERS =====
  const handleAddPermission = async () => {
    if (!selectedPermission) {
      AxionAlert.fire("Erro", "Selecione uma permissão para adicionar.", "error");
      return;
    }

    // Busca a permissão selecionada para obter o nome
    const selectedPerm = permissions.find(p => String(p.id) === selectedPermission);
    if (!selectedPerm) {
      AxionAlert.fire("Erro", "Permissão não encontrada.", "error");
      return;
    }

    // Chama a função do pai passando ID e nome
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
    });
    if (result.isConfirmed) {
      await onRemovePermission(permissionId);
    }
  };

  // ===== RENDER ===== (mesmo código original, sem alterações)
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
        <h5 className="text-sm font-bold text-white flex items-center gap-2">🔒 Permissões do Grupo</h5>
        {canManage && (
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowAddModal(true)}
            disabled={actionLoading}
          >
            ➕ Adicionar Permissão
          </button>
        )}
      </div>

      {/* Lista de permissões atuais */}
      <div className="p-4">
        {!group?.permissions || group.permissions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <span className="text-4xl mb-3 opacity-60">🚫</span>
            <p className="text-sm">Nenhuma permissão vinculada a este grupo.</p>
            {canManage && (
              <button
                className="inline-flex items-center gap-2 px-4 py-2 mt-3 rounded-lg text-sm font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
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
                <div key={data.id} className="flex items-center justify-between gap-3 p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg hover:bg-slate-700/30 transition-all group">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-blue-400">🔑</span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">{data.label}</div>
                      <code className="text-xs text-slate-500 font-mono truncate block">{data.name}</code>
                    </div>
                  </div>
                  {canManage && (
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
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

      {/* Modal de adição (mesmo código original) */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1050]"
            onClick={() => { setShowAddModal(false); setSelectedPermission(""); setSearchTerm(""); }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[1060] p-4">
            <div className="bg-slate-800/95 border border-slate-700/50 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">🔑 Adicionar Permissão ao Grupo</h3>
                <button
                  onClick={() => { setShowAddModal(false); setSelectedPermission(""); setSearchTerm(""); }}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm mb-4">
                  <span className="text-lg">ℹ️</span>
                  <span>Selecione uma permissão para vincular ao grupo <strong className="text-white">{group?.name}</strong></span>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">🔍 Buscar Permissão</label>
                  <input
                    type="text"
                    placeholder="Digite o nome ou chave da permissão..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Permissões Disponíveis ({filteredPermissions.length})</label>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1.5">
                    {!hasAvailablePermissions ? (
                      <div className="flex flex-col items-center justify-center py-8 text-slate-500">
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
                              selectedPermission === permId ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-slate-800/30 border border-slate-700/30 hover:bg-slate-700/30'
                            }`}
                            onClick={() => setSelectedPermission(permId)}
                          >
                            <div>
                              <div className="text-sm font-medium text-slate-200">{data.label}</div>
                              <code className="text-xs text-slate-500 font-mono">{data.name}</code>
                            </div>
                            {selectedPermission === permId && <span className="text-blue-400 text-xl">✓</span>}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/50 bg-slate-800/50">
                <button
                  onClick={() => { setShowAddModal(false); setSelectedPermission(""); setSearchTerm(""); }}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddPermission}
                  disabled={actionLoading || !selectedPermission}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none flex items-center gap-2"
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
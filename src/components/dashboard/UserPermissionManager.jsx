// components/dashboard/UserPermissionManager.jsx
import { useState } from "react";

export default function UserPermissionManager({
  user,
  userPermissions = [],
  allAvailablePermissions = [],
  onAddPermission,
  onRemovePermission,
  actionLoading,
}) {
  const [selectedPermission, setSelectedPermission] = useState("");

  const handleAssignPermission = () => {
    if (selectedPermission && onAddPermission) {
      onAddPermission(user.id, selectedPermission);
      setSelectedPermission("");
    }
  };

  const availablePermissions = allAvailablePermissions.filter(
    permission => !userPermissions.some(up => up.id === permission.id)
  );

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mt-4 transition-colors hover:border-blue-500/30">
      {/* Título */}
      <h5 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
        🔒 Permissões Específicas do Usuário
      </h5>

      {/* Descrição */}
      <div className="mb-4">
        <p className="text-sm text-slate-400">
          Estas permissões são atribuídas diretamente ao usuário, além das permissões herdadas dos grupos.
        </p>
      </div>

      {/* Tabela de Permissões */}
      <div className="overflow-x-auto rounded-lg bg-slate-800/30 border border-slate-700/30 mb-4">
        <table className="w-full border-collapse text-sm min-w-[600px]">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-700/30">
                Permissão
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-700/30">
                Label
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-700/30">
                Descrição
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-700/30 w-[120px]">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {userPermissions?.length > 0 ? (
              userPermissions.map((permission) => (
                <tr key={permission.id} className="border-b border-slate-700/20 hover:bg-slate-800/30 transition-all">
                  <td className="px-4 py-3 align-middle">
                    <code className="font-mono text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                      {permission.name}
                    </code>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <strong className="text-white text-sm">{permission.label}</strong>
                  </td>
                  <td className="px-4 py-3 align-middle text-slate-400 text-sm">
                    {permission.description || "Sem descrição"}
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => onRemovePermission && onRemovePermission(user.id, permission.id)}
                      disabled={actionLoading}
                    >
                      ❌ Remover
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <span>ℹ️</span>
                    <span>Nenhuma permissão direta atribuída a este usuário.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Formulário de Atribuição */}
      {availablePermissions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-end gap-3 mt-4">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              📌 Atribuir Nova Permissão
            </label>
            <select
              className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value)}
              disabled={actionLoading}
            >
              <option value="">Selecione uma permissão...</option>
              {availablePermissions.map(permission => (
                <option key={permission.id} value={permission.id}>
                  {permission.label} ({permission.name})
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <button
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
              onClick={handleAssignPermission}
              disabled={!selectedPermission || actionLoading}
            >
              {actionLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Atribuindo...
                </>
              ) : (
                <>
                  ➕ Atribuir Permissão
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
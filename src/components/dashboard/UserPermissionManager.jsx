// components/dashboard/UserPermissionManager.jsx
import { useState } from "react";

export default function UserPermissionManager({
  user,
  userPermissions = [],
  allAvailablePermissions = [],
  onAddPermission,
  onRemovePermission,
  actionLoading,
  isDark = false, // 🔥 NOVA PROP
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

  // Classes base para tema
  const bgCard = isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200';
  const bgTable = isDark ? 'bg-slate-800/30 border-slate-700/30' : 'bg-gray-50/80 border-gray-200';
  const bgHeader = isDark ? 'bg-slate-800/50' : 'bg-gray-100/80';
  const textHeading = isDark ? 'text-slate-400 border-slate-700/30' : 'text-gray-500 border-gray-200';
  const textBody = isDark ? 'text-slate-400' : 'text-gray-600';
  const textStrong = isDark ? 'text-white' : 'text-gray-800';
  const textMuted = isDark ? 'text-slate-500' : 'text-gray-400';
  const bgInput = isDark ? 'bg-slate-800/50 border-slate-700/50 text-slate-200' : 'bg-white border-gray-300 text-gray-800';
  const inputFocus = 'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50';

  return (
    <div
      className={`border rounded-xl p-6 mt-4 transition-colors hover:border-blue-500/30 ${bgCard}`}
    >
      {/* Título */}
      <h5 className={`text-sm font-bold flex items-center gap-2 mb-4 ${textStrong}`}>
        🔒 Permissões Específicas do Usuário
      </h5>

      {/* Descrição */}
      <div className="mb-4">
        <p className={`text-sm ${textBody}`}>
          Estas permissões são atribuídas diretamente ao usuário, além das permissões herdadas dos grupos.
        </p>
      </div>

      {/* Tabela de Permissões */}
      <div className={`overflow-x-auto rounded-lg border ${bgTable} mb-4`}>
        <table className="w-full border-collapse text-sm min-w-[600px]">
          <thead className={bgHeader}>
            <tr>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide border-b ${textHeading}`}>
                Permissão
              </th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide border-b ${textHeading}`}>
                Label
              </th>
              <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide border-b ${textHeading}`}>
                Descrição
              </th>
              <th className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide border-b ${textHeading} w-[120px]`}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {userPermissions?.length > 0 ? (
              userPermissions.map((permission) => (
                <tr
                  key={permission.id}
                  className={`border-b transition-all ${
                    isDark
                      ? 'border-slate-700/20 hover:bg-slate-800/30'
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 align-middle">
                    <code
                      className={`font-mono text-xs px-2 py-1 rounded ${
                        isDark
                          ? 'text-slate-400 bg-slate-800/50'
                          : 'text-gray-600 bg-gray-100'
                      }`}
                    >
                      {permission.name}
                    </code>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <strong className={`text-sm ${textStrong}`}>
                      {permission.label}
                    </strong>
                  </td>
                  <td className={`px-4 py-3 align-middle text-sm ${textBody}`}>
                    {permission.description || "Sem descrição"}
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <button
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isDark
                          ? 'text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30'
                          : 'text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300'
                      }`}
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
                <td colSpan="4" className={`px-6 py-8 text-center ${textMuted}`}>
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
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
              isDark ? 'text-slate-400' : 'text-gray-500'
            }`}>
              📌 Atribuir Nova Permissão
            </label>
            <select
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none ${inputFocus} transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed ${bgInput}`}
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
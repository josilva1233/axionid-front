// components/dashboard/UserTable.jsx
export default function UserTable({
  users,
  onViewDetail,
  onDeleteUser,
  onToggleAdmin,
  isGlobalAdmin,
  onManagePermissions,
  isDark = false,
}) {
  if (!isGlobalAdmin) {
    return null;
  }

  return (
    <div
      className={`
        overflow-x-auto rounded-xl border transition-colors hover:border-blue-500/30
        ${isDark
          ? 'bg-slate-800/50 border-slate-700/50'
          : 'bg-white/80 border-gray-200'
        }
        -webkit-overflow-scrolling: touch
      `}
    >
      <table className="w-full border-collapse text-sm min-w-[700px]">
        <thead
          className={`sticky top-0 z-10 ${
            isDark ? 'bg-slate-800/80' : 'bg-gray-100/80'
          }`}
        >
          <tr>
            <th
              className={`px-3 sm:px-[18px] py-3 sm:py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[50px] sm:w-[70px] ${
                isDark
                  ? 'text-slate-400 border-slate-700/50'
                  : 'text-gray-500 border-gray-200'
              }`}
            >
              ID
            </th>
            <th
              className={`px-3 sm:px-[18px] py-3 sm:py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap min-w-[120px] sm:min-w-[180px] ${
                isDark
                  ? 'text-slate-400 border-slate-700/50'
                  : 'text-gray-500 border-gray-200'
              }`}
            >
              Nome
            </th>
            <th
              className={`
                px-3 sm:px-[18px] py-3 sm:py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap min-w-[140px] sm:min-w-[220px]
                hidden sm:table-cell
                ${isDark
                  ? 'text-slate-400 border-slate-700/50'
                  : 'text-gray-500 border-gray-200'
                }
              `}
            >
              E-mail
            </th>
            <th
              className={`px-3 sm:px-[18px] py-3 sm:py-4 text-center text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[80px] sm:w-[100px] ${
                isDark
                  ? 'text-slate-400 border-slate-700/50'
                  : 'text-gray-500 border-gray-200'
              }`}
            >
              Nível
            </th>
            <th
              className={`px-3 sm:px-[18px] py-3 sm:py-4 text-center text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[80px] sm:w-[100px] ${
                isDark
                  ? 'text-slate-400 border-slate-700/50'
                  : 'text-gray-500 border-gray-200'
              }`}
            >
              Status
            </th>
            <th
              className={`px-3 sm:px-[18px] py-3 sm:py-4 text-right text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap min-w-[140px] sm:min-w-[200px] ${
                isDark
                  ? 'text-slate-400 border-slate-700/50'
                  : 'text-gray-500 border-gray-200'
              }`}
            >
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((u) => (
              <tr
                key={u.id}
                className={`border-b transition-all cursor-default ${
                  isDark
                    ? 'border-slate-700/30 hover:bg-slate-800/30'
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <td
                  className={`px-3 sm:px-[18px] py-2.5 sm:py-3.5 align-middle font-mono text-sm ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}
                >
                  #{u.id}
                </td>
                <td className="px-3 sm:px-[18px] py-2.5 sm:py-3.5 align-middle break-words">
                  <strong className={`block text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {u.name}
                  </strong>
                </td>
                <td
                  className={`
                    px-3 sm:px-[18px] py-2.5 sm:py-3.5 align-middle break-all
                    hidden sm:table-cell
                    ${isDark ? 'text-slate-400' : 'text-gray-600'}
                  `}
                >
                  {u.email}
                </td>
                <td className="px-3 sm:px-[18px] py-2.5 sm:py-3.5 align-middle text-center">
                  <button
                    className={`inline-flex px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold transition-all hover:scale-105 whitespace-nowrap ${
                      u.is_admin
                        ? isDark
                          ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        : isDark
                          ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => onToggleAdmin && onToggleAdmin(u.id, u.is_admin)}
                    title="Clique para alterar nível"
                  >
                    {u.is_admin ? 'ADMIN' : 'USER'}
                  </button>
                </td>
                <td className="px-3 sm:px-[18px] py-2.5 sm:py-3.5 align-middle text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                        u.is_active ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span
                      className={`text-[10px] sm:text-xs font-medium ${
                        u.is_active
                          ? isDark
                            ? 'text-green-400'
                            : 'text-green-700'
                          : isDark
                            ? 'text-red-400'
                            : 'text-red-700'
                      }`}
                    >
                      {u.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </td>
                <td className="px-3 sm:px-[18px] py-2.5 sm:py-3.5 align-middle text-right">
                  <div className="flex items-center justify-end gap-1 flex-wrap">
                    <button
                      className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all hover:-translate-y-0.5 whitespace-nowrap ${
                        isDark
                          ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30'
                          : 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                      }`}
                      onClick={() => onViewDetail(u.id)}
                      title="Visualizar Detalhes"
                    >
                      👁️ <span className="hidden xs:inline">Detalhes</span>
                    </button>
                    {onManagePermissions && (
                      <button
                        className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all hover:-translate-y-0.5 whitespace-nowrap ${
                          isDark
                            ? 'text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/30'
                            : 'text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 hover:border-purple-300'
                        }`}
                        onClick={() => onManagePermissions(u.id)}
                        title="Gerenciar Permissões"
                      >
                        🔒 <span className="hidden xs:inline">Permissões</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center">
                <div
                  className={`flex flex-col items-center justify-center ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}
                >
                  <div className="text-5xl mb-4 opacity-60">🔍</div>
                  <p className="text-center">Nenhum usuário encontrado.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
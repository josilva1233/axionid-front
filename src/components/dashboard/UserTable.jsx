// components/dashboard/UserTable.jsx
export default function UserTable({
  users,
  onViewDetail,
  onDeleteUser,
  onToggleAdmin,
  isGlobalAdmin,
  onManagePermissions // Nova prop para gerenciar permissões
}) {
  if (!isGlobalAdmin) {
    return null;
  }

return (
  <div className="overflow-x-auto rounded-xl bg-slate-800/50 border border-slate-700/50 transition-colors hover:border-blue-500/30">
    {/* Header */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          Usuários
          <span className="text-sm font-normal text-slate-400">
            ({users?.length || 0} {users?.length !== 1 ? 'usuários' : 'usuário'})
          </span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Gerencie os usuários do sistema, incluindo seus níveis de acesso e status de atividade.
        </p>
      </div>
    </div>

    {/* Error */}
    {error && (
      <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
        <span className="text-lg">⚠️</span>
        <span>{error}</span>
        <button 
          onClick={() => setError('')}
          className="ml-auto text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      </div>
    )}

    <table className="w-full border-collapse text-sm min-w-[800px] table-fixed">
      <thead className="bg-slate-800/80 sticky top-0 z-10">
        <tr>
          <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[70px]">
            ID
          </th>
          <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap">
            Nome do Usuário
          </th>
          <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap">
            E-mail Corporativo
          </th>
          <th className="px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[100px]">
            Nível
          </th>
          <th className="px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[100px]">
            Status
          </th>
          <th className="px-[18px] py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[180px]">
            Ações
          </th>
        </tr>
      </thead>
      <tbody>
        {users && users.length > 0 ? (
          users.map((u) => (
            <tr key={u.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-all cursor-default">
              <td className="px-[18px] py-3.5 align-middle font-mono text-sm text-slate-400">
                #{u.id}
              </td>
              <td className="px-[18px] py-3.5 align-middle">
                <strong className="text-white">
                  {u.name}
                </strong>
              </td>
              <td className="px-[18px] py-3.5 align-middle text-slate-400">
                {u.email}
              </td>
              <td className="px-[18px] py-3.5 align-middle text-center">
                <button
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 ${
                    u.is_admin
                      ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                  }`}
                  onClick={() => onToggleAdmin && onToggleAdmin(u.id, u.is_admin)}
                  title="Clique para alterar nível"
                >
                  {u.is_admin ? "ADMIN" : "USER"}
                </button>
              </td>
              <td className="px-[18px] py-3.5 align-middle text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      u.is_active ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className={`text-xs font-medium ${
                    u.is_active ? "text-green-400" : "text-red-400"
                  }`}>
                    {u.is_active ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </td>
              <td className="px-[18px] py-3.5 align-middle text-right">
                <div className="flex items-center justify-end gap-1 flex-wrap">
                  <button
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all hover:-translate-y-0.5"
                    onClick={() => onViewDetail(u.id)}
                    title="Visualizar Detalhes"
                  >
                    👁️ Detalhes
                  </button>
                  {onManagePermissions && (
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all hover:-translate-y-0.5"
                      onClick={() => onManagePermissions(u.id)}
                      title="Gerenciar Permissões"
                    >
                      🔒 Permissões
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="px-6 py-12 text-center">
              <div className="flex flex-col items-center justify-center text-slate-400">
                <div className="text-5xl mb-4 opacity-60">
                  🔍
                </div>
                <p className="text-center">
                  Nenhum usuário encontrado.
                </p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);
}
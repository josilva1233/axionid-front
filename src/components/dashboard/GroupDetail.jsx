import { useState } from "react";
import GroupPermissionManager from "./GroupPermissionManager";

export default function GroupDetail({
  group,
  onBack,
  onAddUser,
  onRemoveUser,
  onPromoteUser,
  onDemoteUser,
  onDeleteGroup,
  actionLoading,
  onAddPermission,
  onRemovePermission,
  allAvailablePermissions = [],
  currentUserId,
  isSystemAdmin,
  isDark = false, // 🔥 NOVA PROP
}) {
  const [emailToAdd, setEmailToAdd] = useState("");

  // ============ CLASSES DE TEMA ============
  const bgPage = isDark ? 'bg-slate-900' : 'bg-gray-100';
  const bgHeader = isDark 
    ? 'from-slate-800/50 to-slate-900/50 border-slate-700/50' 
    : 'from-gray-100/80 to-white border-gray-200';
  const bgCard = isDark 
    ? 'bg-slate-800/50 border-slate-700/50' 
    : 'bg-white/80 border-gray-200';
  const bgCardHeader = isDark 
    ? 'bg-slate-800/30 border-slate-700/50' 
    : 'bg-gray-100/80 border-gray-200';
  const bgTableHeader = isDark ? 'bg-slate-800/50' : 'bg-gray-100/80';
  const borderRow = isDark 
    ? 'border-slate-700/30 hover:bg-slate-800/30' 
    : 'border-gray-100 hover:bg-gray-50';
  const textHeading = isDark ? 'text-white' : 'text-gray-800';
  const textSub = isDark ? 'text-slate-400' : 'text-gray-500';
  const textMuted = isDark ? 'text-slate-500' : 'text-gray-400';
  const textBody = isDark ? 'text-slate-200' : 'text-gray-700';
  const textLabel = isDark ? 'text-slate-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-slate-700/50' : 'border-gray-200';
  const bgInput = isDark 
    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder-slate-500' 
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400';
  const focusRing = 'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50';
  const btnBack = isDark 
    ? 'border-slate-700/50 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' 
    : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-800';
  const btnDelete = isDark 
    ? 'text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 hover:text-red-300' 
    : 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100 hover:text-red-700';
  const badgeAdmin = isDark 
    ? 'bg-purple-500/20 text-purple-400' 
    : 'bg-purple-100 text-purple-700';
  const badgeMember = isDark 
    ? 'bg-slate-700/50 text-slate-300' 
    : 'bg-gray-200 text-gray-700';
  const btnPromote = isDark 
    ? 'text-green-400 bg-green-500/10 border-green-500/20 hover:bg-green-500/20' 
    : 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100';
  const btnDemote = isDark 
    ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20' 
    : 'text-yellow-700 bg-yellow-50 border-yellow-200 hover:bg-yellow-100';
  const btnRemove = isDark 
    ? 'text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20' 
    : 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100';
  const dangerZoneBg = isDark 
    ? 'bg-slate-800/50 border-red-500/20' 
    : 'bg-gray-50 border-red-200';
  const textEmpty = isDark ? 'text-slate-400' : 'text-gray-500';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailToAdd) return;
    onAddUser(emailToAdd);
    setEmailToAdd("");
  };

  const handleDelete = () => {
    if (!group?.id) return;
    if (window.confirm(`ATENÇÃO: Deseja realmente excluir o grupo "${group.name}"?`)) {
      onDeleteGroup(group.id);
    }
  };

  // ============ LOADING ============
  if (!group) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[60vh] ${bgPage} rounded-xl`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className={`${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Carregando dados do grupo...</p>
          <button
            onClick={onBack}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-transparent transition-all ${btnBack}`}
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  const isGroupAdmin = group.users?.some(
    (u) => u.id === currentUserId && u.pivot?.role === "admin"
  );
  const canManage = isSystemAdmin || isGroupAdmin;

  // ============ RENDER ============
  return (
    <div className={`${bgPage} rounded-xl min-h-screen`}>
      {/* ============ HEADER ============ */}
      <div className={`flex flex-wrap items-center justify-between gap-3 px-6 py-5 bg-gradient-to-r ${bgHeader} border-b rounded-t-xl`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-transparent transition-all whitespace-nowrap text-sm ${btnBack}`}
          >
            ← Voltar
          </button>

          <div className={`w-px h-8 ${isDark ? 'bg-slate-700/50' : 'bg-gray-300'}`}></div>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 min-w-[56px] rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/20">
              {group.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${textHeading}`}>
                Gerenciar Grupo: <span className="text-blue-400">{group.name?.toUpperCase()}</span>
              </h2>
              <div className={`flex flex-wrap items-center gap-3 text-sm ${textSub}`}>
                <span className="font-mono text-xs">ID: {group.id}</span>
                <span className="flex items-center gap-1">
                  👥 {group.users?.length || 0} membros
                </span>
                {group.description && (
                  <span className={`${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{group.description}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${btnDelete}`}
            >
              🗑️ {actionLoading ? "..." : "Excluir Grupo"}
            </button>
          )}
        </div>
      </div>

      {/* ============ GRID PRINCIPAL ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* ============ COLUNA ESQUERDA - MEMBROS ============ */}
        <div className="lg:col-span-2">
          <div className={`border rounded-xl overflow-hidden ${bgCard}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${bgCardHeader}`}>
              <h5 className={`text-sm font-bold flex items-center gap-2 ${textHeading}`}>
                👥 Membros Atuais
              </h5>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isDark ? 'text-blue-400 bg-blue-500/15' : 'text-blue-700 bg-blue-100'
              }`}>
                {group.users?.length || 0} membros
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className={bgTableHeader}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${textLabel}`}>NOME</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${textLabel}`}>FUNÇÃO</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${textLabel}`}>E-MAIL</th>
                    <th className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide ${textLabel}`}>AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {group.users?.length > 0 ? (
                    group.users.map((user) => {
                      const isCurrentUser = user.id === currentUserId;
                      const canManageUser = canManage && !isCurrentUser;

                      return (
                        <tr key={user.id} className={`border-b transition-all ${borderRow}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xs font-bold text-white">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <strong className={textHeading}>{user.name}</strong>
                              {isCurrentUser && (
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  isDark ? 'text-blue-400 bg-blue-500/15' : 'text-blue-700 bg-blue-100'
                                }`}>
                                  Você
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                              user.pivot?.role === "admin" ? badgeAdmin : badgeMember
                            }`}>
                              {user.pivot?.role === "admin" ? "Administrador" : "Membro"}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            {user.email}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              {canManageUser && (
                                <>
                                  {user.pivot?.role === "admin" ? (
                                    <button
                                      onClick={() => onDemoteUser && onDemoteUser(user.id)}
                                      disabled={actionLoading}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${btnDemote}`}
                                      title="Remover privilégios de administrador"
                                    >
                                      🛡️ Revogar Admin
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => onPromoteUser && onPromoteUser(user.id)}
                                      disabled={actionLoading}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${btnPromote}`}
                                      title="Promover a administrador"
                                    >
                                      ⭐ Tornar Admin
                                    </button>
                                  )}
                                  <button
                                    onClick={() => onRemoveUser(user.id, user.name)}
                                    disabled={actionLoading}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${btnRemove}`}
                                    title="Remover do grupo"
                                  >
                                    ❌ Remover
                                  </button>
                                </>
                              )}
                              {!canManageUser && isCurrentUser && (
                                <span className={`inline-flex items-center gap-1 text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                                  🔒 Você
                                </span>
                              )}
                              {!canManageUser && !isCurrentUser && (
                                <span className={`inline-flex items-center gap-1 text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                                  🔒 Restrito
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className={`px-6 py-8 text-center ${textEmpty}`}>
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-3xl">👥</span>
                          <p>Nenhum membro vinculado a este grupo.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ============ COLUNA DIREITA - ADICIONAR MEMBRO ============ */}
        <div className="space-y-4">
          <div className={`border rounded-xl p-6 ${bgCard}`}>
            <h5 className={`text-sm font-bold flex items-center gap-2 mb-4 ${textHeading}`}>
              ➕ Adicionar Membro
            </h5>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wide mb-1.5 ${textLabel}`}>
                  📧 E-mail do Usuário
                </label>
                <input
                  type="email"
                  className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm ${focusRing} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  value={emailToAdd}
                  onChange={(e) => setEmailToAdd(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                  disabled={!canManage || actionLoading}
                />
                <small className={`block text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                  Digite o e-mail corporativo do usuário para adicioná-lo ao grupo
                </small>
              </div>

              <button
                type="submit"
                disabled={!canManage || actionLoading || !emailToAdd}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Processando...
                  </>
                ) : (
                  <>
                    ➕ Inserir no Grupo
                  </>
                )}
              </button>
            </form>

            {!canManage && (
              <div className={`mt-4 flex items-center gap-2 p-3 rounded-lg text-sm ${
                isDark ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
              } border`}>
                ⚠️ Você não tem permissão para gerenciar este grupo
              </div>
            )}
          </div>

          {/* Informações do Grupo */}
          <div className={`border rounded-xl p-6 ${bgCard}`}>
            <h5 className={`text-sm font-bold flex items-center gap-2 mb-4 ${textHeading}`}>
              ℹ️ Informações do Grupo
            </h5>
            <div className="space-y-3">
              <div>
                <span className={`block text-xs font-semibold uppercase tracking-wide ${textLabel}`}>Criado por</span>
                <span className={isDark ? 'text-slate-200' : 'text-gray-800'}>{group.creator?.name || "Sistema"}</span>
              </div>
              <div>
                <span className={`block text-xs font-semibold uppercase tracking-wide ${textLabel}`}>Data de criação</span>
                <span className={isDark ? 'text-slate-200' : 'text-gray-800'}>
                  {new Date(group.created_at).toLocaleDateString("pt-BR", {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </span>
              </div>
              {group.description && (
                <div>
                  <span className={`block text-xs font-semibold uppercase tracking-wide ${textLabel}`}>Descrição</span>
                  <span className={isDark ? 'text-slate-200' : 'text-gray-800'}>{group.description}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============ GERENCIADOR DE PERMISSÕES ============ */}
      <div className="px-6 pb-6">
        <GroupPermissionManager
          group={group}
          permissions={allAvailablePermissions}
          onAddPermission={onAddPermission}
          onRemovePermission={onRemovePermission}
          actionLoading={actionLoading}
          canManage={canManage}
          isDark={isDark} // 🔥
        />
      </div>

      {/* ============ ZONA DE PERIGO ============ */}
      {canManage && (
        <div className="px-6 pb-6">
          <div className={`${dangerZoneBg} border rounded-xl p-6 hover:border-red-500/30 transition-all`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[200px]">
                <h5 className="text-sm font-bold text-red-400 flex items-center gap-2">
                  ⚠️ Zona de Perigo
                </h5>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Uma vez excluído, o grupo e todos os seus vínculos não podem ser recuperados.
                  Esta ação é irreversível.
                </p>
              </div>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${btnDelete}`}
              >
                🗑️ {actionLoading ? "..." : "Excluir Grupo Permanentemente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
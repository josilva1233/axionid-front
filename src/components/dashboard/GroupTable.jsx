// components/dashboard/GroupTable.jsx
import React from "react";
import Swal from "sweetalert2";

export default function GroupTable({
  groups,
  loading,
  onViewDetail,
  onDelete,
  currentUser,
}) {
  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#343a40",
    customClass: {
      popup: "border border-slate-700 rounded-xl",
      confirmButton:
        "px-4 py-2 rounded-full font-bold mx-2 bg-indigo-500 hover:bg-indigo-400 transition-colors",
      cancelButton:
        "px-4 py-2 rounded-full font-bold mx-2 bg-slate-700 hover:bg-slate-600 transition-colors",
    },
  });

  // ============ EXCLUIR GRUPO ============
  const handleDelete = async (group) => {
    const result = await AxionAlert.fire({
      title: "Excluir Grupo?",
      text: `Deseja remover permanentemente o grupo "${group.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      if (onDelete) {
        await onDelete(group.id);
      }
    }
  };

  const isSystemAdmin =
    currentUser?.is_admin === 1 || currentUser?.is_admin === true;

  return (
    <div className="overflow-x-auto rounded-xl bg-slate-800/50 border border-slate-700/50 transition-colors hover:border-blue-500/30">
      <table className="w-full border-collapse text-sm min-w-[800px] table-fixed">
        <thead className="bg-slate-800/80 sticky top-0 z-10">
          <tr>
            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[70px]">
              ID
            </th>
            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap">
              Nome do Grupo
            </th>
            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[150px]">
              Criador
            </th>
            <th className="px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[100px]">
              Membros
            </th>
            <th className="px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[130px]">
              Meu Status
            </th>
            <th className="px-[18px] py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[100px]">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.length > 0 ? (
            groups.map((g) => {
              const canManage =
                isSystemAdmin ||
                g.creator_id === currentUser?.id ||
                g.users?.some(
                  (u) => u.id === currentUser?.id && u.pivot?.role === "admin"
                );

              const memberCount = g.users_count || g.users?.length || 0;

              return (
                <tr
                  key={g.id}
                  className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-all cursor-default"
                >
                  <td className="px-[18px] py-3.5 align-middle font-mono text-sm text-slate-400">
                    #{g.id}
                  </td>
                  <td className="px-[18px] py-3.5 align-middle">
                    <div>
                      <strong className="text-blue-400 block">
                        {g.name.toUpperCase()}
                      </strong>
                      {g.description && (
                        <span className="text-slate-500 text-xs block">
                          {g.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-[18px] py-3.5 align-middle">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-300">
                        {g.creator?.name || "Sistema"}
                      </span>
                      {g.creator?.id === currentUser?.id && (
                        <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded-full">
                          Você
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-[18px] py-3.5 align-middle text-center">
                    <span className="text-sm font-semibold text-white">
                      {memberCount}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">
                      membro{memberCount !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-[18px] py-3.5 align-middle text-center">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        isSystemAdmin
                          ? "bg-purple-500/20 text-purple-400"
                          : canManage
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-slate-700/50 text-slate-300"
                      }`}
                    >
                      {isSystemAdmin
                        ? "Admin Global"
                        : canManage
                        ? "Administrador"
                        : "Membro"}
                    </span>
                  </td>
                  <td className="px-[18px] py-3.5 align-middle text-right">
                    {canManage ? (
                      <div className="relative inline-block">
                        <button
                          className="inline-flex items-center justify-center w-9 h-9 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all"
                          onClick={() => {
                            const dropdown = document.getElementById(
                              `dropdown-${g.id}`
                            );
                            if (dropdown) {
                              dropdown.classList.toggle("hidden");
                            }
                          }}
                          aria-label="Ações do grupo"
                        >
                          <span className="text-xl">⋯</span>
                        </button>
                        <div
                          id={`dropdown-${g.id}`}
                          className="absolute right-0 mt-1 w-48 bg-slate-800/95 border border-slate-700/50 rounded-lg shadow-xl hidden z-20 overflow-hidden"
                        >
                          <button
                            onClick={() => onViewDetail(g.id)}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 transition-all text-left"
                          >
                            👥 Gerenciar Membros
                          </button>

                          {isSystemAdmin && (
                            <>
                              <div className="h-px bg-slate-700/50"></div>
                              <button
                                onClick={() => handleDelete(g)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all text-left"
                              >
                                🗑️ Excluir Grupo
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        🔒 Read-only
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <div className="text-5xl mb-4 opacity-60">
                    {loading ? "⏳" : "📁"}
                  </div>
                  <p className="text-center">
                    {loading ? "Carregando grupos..." : "Nenhum grupo encontrado."}
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
// components/dashboard/PermissionTable.jsx
import React from "react";
import Swal from "sweetalert2";

export default function PermissionTable({
  permissions,
  loading,
  currentUser,
  onViewDetail,
  onDelete
}) {
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

  const handleDelete = async (perm) => {
    const result = await AxionAlert.fire({
      title: "Excluir Permissão?",
      text: `Deseja remover permanentemente a permissão "${perm.label}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      background: "#111214",
      color: "#ffffff",
      confirmButtonColor: "#6366f1",
    });

    if (result.isConfirmed) {
      if (onDelete) await onDelete(perm.id);
    }
  };

  const isSystemAdmin = currentUser?.is_admin === 1 || currentUser?.is_admin === true;

  return (
    <div className="overflow-x-auto rounded-xl bg-slate-800/50 border border-slate-700/50 transition-colors hover:border-blue-500/30">
      <table className="w-full border-collapse text-sm min-w-[900px] table-fixed">
        <thead className="bg-slate-800/80 sticky top-0 z-10">
          <tr>
            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[70px]">
              ID
            </th>
            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap">
              Permissão (Label)
            </th>
            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[200px]">
              Chave do Sistema (Slug)
            </th>
            <th className="px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[100px]">
              Tipo
            </th>
            <th className="px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[100px]">
              Status
            </th>
            <th className="px-[18px] py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[100px]">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {permissions.length > 0 ? (
            permissions.map((perm) => (
              <tr key={perm.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-all cursor-default">
                <td className="px-[18px] py-3.5 align-middle font-mono text-sm text-slate-400">
                  #{perm.id}
                </td>
                <td className="px-[18px] py-3.5 align-middle">
                  <strong className="text-blue-400 block text-sm">
                    {perm.label?.toUpperCase() || "SEM NOME"}
                  </strong>
                </td>
                <td className="px-[18px] py-3.5 align-middle">
                  <code className="font-mono text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                    {perm.name}
                  </code>
                </td>
                <td className="px-[18px] py-3.5 align-middle text-center">
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                    IAM
                  </span>
                </td>
                <td className="px-[18px] py-3.5 align-middle text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-xs font-medium text-green-400">Ativo</span>
                  </div>
                </td>
                <td className="px-[18px] py-3.5 align-middle text-right">
                  <div className="relative inline-block">
                    <button
                      className="inline-flex items-center justify-center w-9 h-9 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all"
                      onClick={() => {
                        const dropdown = document.getElementById(`dropdown-${perm.id}`);
                        if (dropdown) {
                          dropdown.classList.toggle('hidden');
                        }
                      }}
                      aria-label="Ações da Permissão"
                    >
                      <span className="text-xl">⋯</span>
                    </button>
                    <div
                      id={`dropdown-${perm.id}`}
                      className="absolute right-0 mt-1 w-48 bg-slate-800/95 border border-slate-700/50 rounded-lg shadow-xl hidden z-20 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          const dropdown = document.getElementById(`dropdown-${perm.id}`);
                          if (dropdown) dropdown.classList.add('hidden');
                          onViewDetail(perm.id);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 transition-all text-left"
                      >
                        👁️ Ver Detalhes
                      </button>

                      {isSystemAdmin ? (
                        <>
                          <div className="h-px bg-slate-700/50"></div>
                          <button
                            onClick={() => {
                              const dropdown = document.getElementById(`dropdown-${perm.id}`);
                              if (dropdown) dropdown.classList.add('hidden');
                              handleDelete(perm);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all text-left"
                          >
                            🗑️ Excluir Permissão
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="h-px bg-slate-700/50"></div>
                          <div className="px-4 py-2.5 text-xs text-slate-500 flex items-center gap-1">
                            🔒 Somente leitura
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <div className="text-5xl mb-4 opacity-60">
                    {loading ? "⏳" : "🛡️"}
                  </div>
                  <p className="text-center">
                    {loading ? "Carregando permissões..." : "Nenhuma permissão identificada no sistema."}
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
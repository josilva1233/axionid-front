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
            <th className="px-[18px] py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[180px]">
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
                  {isSystemAdmin ? (
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all hover:-translate-y-0.5"
                        onClick={() => onViewDetail(perm.id)}
                        title="Visualizar e Editar Permissão"
                      >
                        👁️ Detalhes
                      </button>
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all hover:-translate-y-0.5"
                        onClick={() => handleDelete(perm)}
                        title="Excluir Permissão"
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      🔒 Read-only
                    </span>
                  )}
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
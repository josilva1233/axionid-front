// components/dashboard/PermissionTable.jsx
import React from "react";
import Swal from "sweetalert2";

export default function PermissionTable({
  permissions,
  loading,
  currentUser,
  onViewDetail,
  onDelete,
  isDark = false, // 🔥 NOVA PROP
}) {
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
  const bgTable = isDark 
    ? 'bg-slate-800/50 border-slate-700/50' 
    : 'bg-white/80 border-gray-200';
  const bgHeader = isDark 
    ? 'bg-slate-800/80' 
    : 'bg-gray-100/80';
  const textHeader = isDark 
    ? 'text-slate-400 border-slate-700/50' 
    : 'text-gray-500 border-gray-200';
  const borderRow = isDark 
    ? 'border-slate-700/30 hover:bg-slate-800/30' 
    : 'border-gray-100 hover:bg-gray-50';
  const textId = isDark ? 'text-slate-400' : 'text-gray-500';
  const textLabel = isDark ? 'text-blue-400' : 'text-blue-700';
  const textSlug = isDark 
    ? 'text-slate-400 bg-slate-800/50' 
    : 'text-gray-600 bg-gray-100';
  const badgeType = isDark 
    ? 'bg-purple-500/20 text-purple-400' 
    : 'bg-purple-100 text-purple-700';
  const textStatus = isDark ? 'text-green-400' : 'text-green-700';
  const btnMore = isDark 
    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50' 
    : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100';
  const dropdownBg = isDark 
    ? 'bg-slate-800/95 border-slate-700/50' 
    : 'bg-white/95 border-gray-200';
  const dropdownText = isDark 
    ? 'text-slate-300 hover:bg-slate-700/50' 
    : 'text-gray-700 hover:bg-gray-100';
  const dropdownSeparator = isDark 
    ? 'bg-slate-700/50' 
    : 'bg-gray-200';
  const textEmpty = isDark ? 'text-slate-400' : 'text-gray-500';

  const handleDelete = async (perm) => {
    const result = await AxionAlert.fire({
      title: "Excluir Permissão?",
      text: `Deseja remover permanentemente a permissão "${perm.label}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      background: isDark ? "#111214" : "#ffffff",
      color: isDark ? "#ffffff" : "#1f2937",
      confirmButtonColor: "#6366f1",
    });

    if (result.isConfirmed) {
      if (onDelete) await onDelete(perm.id);
    }
  };

  // Função para toggle do dropdown (sem conflito)
  const toggleDropdown = (id) => {
    const dropdown = document.getElementById(`dropdown-${id}`);
    if (dropdown) {
      dropdown.classList.toggle('hidden');
    }
  };

  const isSystemAdmin = currentUser?.is_admin === 1 || currentUser?.is_admin === true;

  return (
    <div className={`overflow-x-auto rounded-xl border transition-colors hover:border-blue-500/30 ${bgTable}`}>
      <table className="w-full border-collapse text-sm min-w-[900px] table-fixed">
        <thead className={`sticky top-0 z-10 ${bgHeader}`}>
          <tr>
            <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[70px] ${textHeader}`}>
              ID
            </th>
            <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap ${textHeader}`}>
              Permissão (Label)
            </th>
            <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[200px] ${textHeader}`}>
              Chave do Sistema (Slug)
            </th>
            <th className={`px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[100px] ${textHeader}`}>
              Tipo
            </th>
            <th className={`px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[100px] ${textHeader}`}>
              Status
            </th>
            <th className={`px-[18px] py-4 text-right text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[100px] ${textHeader}`}>
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {permissions.length > 0 ? (
            permissions.map((perm) => (
              <tr key={perm.id} className={`border-b transition-all cursor-default ${borderRow}`}>
                <td className={`px-[18px] py-3.5 align-middle font-mono text-sm ${textId}`}>
                  #{perm.id}
                </td>
                <td className="px-[18px] py-3.5 align-middle">
                  <strong className={`block text-sm ${textLabel}`}>
                    {perm.label?.toUpperCase() || "SEM NOME"}
                  </strong>
                </td>
                <td className="px-[18px] py-3.5 align-middle">
                  <code className={`font-mono text-xs px-2 py-1 rounded ${textSlug}`}>
                    {perm.name}
                  </code>
                </td>
                <td className="px-[18px] py-3.5 align-middle text-center">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badgeType}`}>
                    IAM
                  </span>
                </td>
                <td className="px-[18px] py-3.5 align-middle text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className={`text-xs font-medium ${textStatus}`}>Ativo</span>
                  </div>
                </td>
                <td className="px-[18px] py-3.5 align-middle text-right">
                  <div className="relative inline-block">
                    <button
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-md transition-all ${btnMore}`}
                      onClick={() => toggleDropdown(perm.id)}
                      aria-label="Ações da Permissão"
                    >
                      <span className="text-xl">⋯</span>
                    </button>
                    <div
                      id={`dropdown-${perm.id}`}
                      className={`absolute right-0 mt-1 w-48 border rounded-lg shadow-xl hidden z-20 overflow-hidden ${dropdownBg}`}
                    >
                      <button
                        onClick={() => {
                          const dropdown = document.getElementById(`dropdown-${perm.id}`);
                          if (dropdown) dropdown.classList.add('hidden');
                          onViewDetail(perm.id);
                        }}
                        className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all text-left ${dropdownText}`}
                      >
                        👁️ Ver Detalhes
                      </button>

                      {isSystemAdmin ? (
                        <>
                          <div className={`h-px ${dropdownSeparator}`}></div>
                          <button
                            onClick={() => {
                              const dropdown = document.getElementById(`dropdown-${perm.id}`);
                              if (dropdown) dropdown.classList.add('hidden');
                              handleDelete(perm);
                            }}
                            className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all text-left ${
                              isDark 
                                ? 'text-red-400 hover:bg-red-500/10' 
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                          >
                            🗑️ Excluir Permissão
                          </button>
                        </>
                      ) : (
                        <>
                          <div className={`h-px ${dropdownSeparator}`}></div>
                          <div className={`px-4 py-2.5 text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'} flex items-center gap-1`}>
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
                <div className={`flex flex-col items-center justify-center ${textEmpty}`}>
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
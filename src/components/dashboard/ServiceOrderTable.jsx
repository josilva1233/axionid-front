// components/dashboard/ServiceOrderTable.jsx
import React from "react";
import Swal from "sweetalert2";

export default function ServiceOrderTable({
  orders,
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

  const getStatusBadge = (status) => {
    const styles = {
      open: { bg: "bg-blue-500/15", text: "text-blue-400", dot: "bg-blue-400", label: "Aberto" },
      in_progress: { bg: "bg-yellow-500/15", text: "text-yellow-400", dot: "bg-yellow-400", label: "Em Atendimento" },
      resolved: { bg: "bg-green-500/15", text: "text-green-400", dot: "bg-green-400", label: "Resolvido" },
      closed: { bg: "bg-slate-700/30", text: "text-slate-400", dot: "bg-slate-400", label: "Fechado" },
      canceled: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400", label: "Cancelado" },
    };
    const current = styles[status] || styles.open;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${current.bg} ${current.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
        {current.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: { bg: "bg-green-500/15", text: "text-green-400", dot: "bg-green-400", label: "Baixa" },
      medium: { bg: "bg-yellow-500/15", text: "text-yellow-400", dot: "bg-yellow-400", label: "Média" },
      high: { bg: "bg-orange-500/15", text: "text-orange-400", dot: "bg-orange-400", label: "Alta" },
      urgent: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400", label: "Urgente" },
    };
    const current = styles[priority] || styles.medium;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${current.bg} ${current.text}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
        {current.label}
      </span>
    );
  };

  const handleDelete = async (order) => {
    const result = await AxionAlert.fire({
      title: "Excluir OS?",
      text: `Deseja remover permanentemente a OS "${order.protocol}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      background: "#111214",
      color: "#ffffff",
      confirmButtonColor: "#6366f1",
    });

    if (result.isConfirmed) {
      if (onDelete) await onDelete(order.id);
    }
  };

  const isSystemAdmin =
    currentUser?.is_admin === 1 || currentUser?.is_admin === true;

  return (
    <div className="overflow-x-auto rounded-xl bg-slate-800/50 border border-slate-700/50 transition-colors hover:border-blue-500/30">
      <table className="w-full border-collapse text-sm min-w-[900px] table-fixed">
        <thead className="bg-slate-800/80 sticky top-0 z-10">
          <tr>
            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[70px]">
              ID
            </th>
            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[140px]">
              Protocolo
            </th>
            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap">
              Título / Assunto
            </th>
            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[140px]">
              Solicitante
            </th>
            <th className="px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[110px]">
              Prioridade
            </th>
            <th className="px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[120px]">
              Status
            </th>
            <th className="px-[18px] py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[100px]">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((os) => (
              <tr
                key={os.id}
                className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-all cursor-default"
              >
                <td className="px-[18px] py-3.5 align-middle font-mono text-sm text-slate-400">
                  #{os.id}
                </td>
                <td className="px-[18px] py-3.5 align-middle">
                  <code className="font-mono text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                    {os.protocol}
                  </code>
                </td>
                <td className="px-[18px] py-3.5 align-middle">
                  <div>
                    <strong className="text-blue-400 block text-sm">
                      {os.title.toUpperCase()}
                    </strong>
                    <small className="text-slate-500 text-xs">
                      {new Date(os.created_at).toLocaleDateString("pt-BR")}
                    </small>
                  </div>
                </td>
                <td className="px-[18px] py-3.5 align-middle">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">👤</span>
                    <span className="text-slate-300 text-sm">
                      {os.user?.name || "Usuário Externo"}
                    </span>
                  </div>
                </td>
                <td className="px-[18px] py-3.5 align-middle text-center">
                  {getPriorityBadge(os.priority)}
                </td>
                <td className="px-[18px] py-3.5 align-middle text-center">
                  {getStatusBadge(os.status)}
                </td>
                <td className="px-[18px] py-3.5 align-middle text-right">
                  <div className="relative inline-block">
                    <button
                      className="inline-flex items-center justify-center w-9 h-9 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all"
                      onClick={() => {
                        const dropdown = document.getElementById(
                          `dropdown-${os.id}`
                        );
                        if (dropdown) {
                          dropdown.classList.toggle("hidden");
                        }
                      }}
                      aria-label="Ações da Ordem de Serviço"
                    >
                      <span className="text-xl">⋯</span>
                    </button>
                    <div
                      id={`dropdown-${os.id}`}
                      className="absolute right-0 mt-1 w-48 bg-slate-800/95 border border-slate-700/50 rounded-lg shadow-xl hidden z-20 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          const dropdown = document.getElementById(
                            `dropdown-${os.id}`
                          );
                          if (dropdown) dropdown.classList.add("hidden");
                          onViewDetail(os.id);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 transition-all text-left"
                      >
                        👁️ Ver Detalhes
                      </button>

                      {isSystemAdmin && (
                        <>
                          <div className="h-px bg-slate-700/50"></div>
                          <button
                            onClick={() => {
                              const dropdown = document.getElementById(
                                `dropdown-${os.id}`
                              );
                              if (dropdown) dropdown.classList.add("hidden");
                              handleDelete(os);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-all text-left"
                          >
                            🗑️ Excluir OS
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <div className="text-5xl mb-4 opacity-60">
                    {loading ? "⏳" : "📋"}
                  </div>
                  <p className="text-center">
                    {loading
                      ? "Carregando chamados..."
                      : "Nenhum chamado encontrado."}
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
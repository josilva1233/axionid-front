// components/dashboard/ServiceOrderTable.jsx
import React from "react";
import Swal from "sweetalert2";

export default function ServiceOrderTable({
  orders,
  loading,
  onViewDetail,
  onDelete,
  currentUser,
  isDark = false, // 🔥 NOVA PROP
}) {
  // 🔥 Ajuste do SweetAlert para tema
  const AxionAlert = Swal.mixin({
    background: isDark ? "#111214" : "#ffffff",
    color: isDark ? "#ffffff" : "#1f2937",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#343a40",
    customClass: {
      popup: `border ${isDark ? 'border-slate-700' : 'border-gray-200'} rounded-xl`,
      confirmButton:
        "px-4 py-2 rounded-full font-bold mx-2 bg-indigo-500 hover:bg-indigo-400 transition-colors",
      cancelButton:
        "px-4 py-2 rounded-full font-bold mx-2 bg-slate-700 hover:bg-slate-600 transition-colors",
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
  const textProtocol = isDark 
    ? 'text-slate-400 bg-slate-800/50' 
    : 'text-gray-600 bg-gray-100';
  const textTitle = isDark ? 'text-blue-400' : 'text-blue-700';
  const textDate = isDark ? 'text-slate-500' : 'text-gray-400';
  const textUserIcon = isDark ? 'text-slate-400' : 'text-gray-500';
  const textUserName = isDark ? 'text-slate-300' : 'text-gray-700';
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

  // 🔥 CORRIGIDO: Adicionar 'completed' e 'resolved' (ambos com mesmo estilo)
  const getStatusBadge = (status) => {
    const styles = {
      open: { bg: "bg-blue-500/15", text: "text-blue-400", dot: "bg-blue-400", label: "Aberto" },
      in_progress: { bg: "bg-yellow-500/15", text: "text-yellow-400", dot: "bg-yellow-400", label: "Em Atendimento" },
      resolved: { bg: "bg-green-500/15", text: "text-green-400", dot: "bg-green-400", label: "Resolvido" },
      completed: { bg: "bg-green-500/15", text: "text-green-400", dot: "bg-green-400", label: "Resolvido" },
      closed: { bg: "bg-slate-700/30", text: "text-slate-400", dot: "bg-slate-400", label: "Fechado" },
      canceled: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400", label: "Cancelado" },
      cancelled: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400", label: "Cancelado" },
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
      background: isDark ? "#111214" : "#ffffff",
      color: isDark ? "#ffffff" : "#1f2937",
      confirmButtonColor: "#6366f1",
    });

    if (result.isConfirmed) {
      if (onDelete) await onDelete(order.id);
    }
  };

  const isSystemAdmin =
    currentUser?.is_admin === 1 || currentUser?.is_admin === true;

  // Função para toggle do dropdown (sem conflito)
  const toggleDropdown = (id) => {
    const dropdown = document.getElementById(`dropdown-${id}`);
    if (dropdown) {
      dropdown.classList.toggle("hidden");
    }
  };

  return (
    <div className={`overflow-x-auto rounded-xl border transition-colors hover:border-blue-500/30 ${bgTable}`}>
      <table className="w-full border-collapse text-sm min-w-[900px] table-fixed">
        <thead className={`sticky top-0 z-10 ${bgHeader}`}>
          <tr>
            <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[70px] ${textHeader}`}>
              ID
            </th>
            <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap min-w-[130px] ${textHeader}`}>
              Protocolo
            </th>
            <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap min-w-[200px] ${textHeader}`}>
              Título / Assunto
            </th>
            <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap min-w-[150px] ${textHeader}`}>
              Solicitante
            </th>
            <th className={`px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[110px] ${textHeader}`}>
              Prioridade
            </th>
            <th className={`px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[120px] ${textHeader}`}>
              Status
            </th>
            <th className={`px-[18px] py-4 text-right text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[100px] ${textHeader}`}>
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {orders && orders.length > 0 ? (
            orders.map((os) => (
              <tr
                key={os.id}
                className={`border-b transition-all cursor-default ${borderRow}`}
              >
                <td className={`px-[18px] py-3.5 align-middle font-mono text-sm ${textId}`}>
                  #{os.id}
                </td>
                
                {/* 🔥 Adicionado break-all para protocolos longos */}
                <td className="px-[18px] py-3.5 align-middle break-all">
                  <code className={`font-mono text-xs px-2 py-1 rounded break-all ${textProtocol}`}>
                    {os.protocol}
                  </code>
                </td>
                
                {/* 🔥 Adicionado break-words para títulos longos */}
                <td className="px-[18px] py-3.5 align-middle break-words">
                  <div>
                    <strong className={`block text-sm ${textTitle}`}>
                      {os.title?.toUpperCase() || 'SEM TÍTULO'}
                    </strong>
                    <small className={`text-xs ${textDate}`}>
                      {new Date(os.created_at).toLocaleDateString("pt-BR")}
                    </small>
                  </div>
                </td>
                
                {/* 🔥 Adicionado break-words para nomes longos */}
                <td className="px-[18px] py-3.5 align-middle break-words">
                  <div className="flex items-center gap-1.5">
                    <span className={`flex-shrink-0 ${textUserIcon}`}>👤</span>
                    <span className={`text-sm ${textUserName}`}>
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
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-md transition-all ${btnMore}`}
                      onClick={() => toggleDropdown(os.id)}
                      aria-label="Ações da Ordem de Serviço"
                    >
                      <span className="text-xl">⋯</span>
                    </button>
                    <div
                      id={`dropdown-${os.id}`}
                      className={`absolute right-0 mt-1 w-48 border rounded-lg shadow-xl hidden z-20 overflow-hidden ${dropdownBg}`}
                    >
                      <button
                        onClick={() => {
                          const dropdown = document.getElementById(`dropdown-${os.id}`);
                          if (dropdown) dropdown.classList.add("hidden");
                          onViewDetail(os.id);
                        }}
                        className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all text-left ${dropdownText}`}
                      >
                        👁️ Ver Detalhes
                      </button>

                      {isSystemAdmin && (
                        <>
                          <div className={`h-px ${dropdownSeparator}`}></div>
                          <button
                            onClick={() => {
                              const dropdown = document.getElementById(`dropdown-${os.id}`);
                              if (dropdown) dropdown.classList.add("hidden");
                              handleDelete(os);
                            }}
                            className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all text-left ${
                              isDark 
                                ? 'text-red-400 hover:bg-red-500/10' 
                                : 'text-red-600 hover:bg-red-50'
                            }`}
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
                <div className={`flex flex-col items-center justify-center ${textEmpty}`}>
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
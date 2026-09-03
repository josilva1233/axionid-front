// components/dashboard/AuditTable.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";

export default function AuditTable({ 
  logs, 
  loading, 
  onViewDetail, 
  onDelete, 
  currentUser,
  isDark = false, // 🔥 NOVA PROP
}) {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

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
  const textDate = isDark ? 'text-slate-400' : 'text-gray-500';
  const textUserName = isDark ? 'text-blue-400' : 'text-blue-700';
  const textUserEmail = isDark ? 'text-slate-500' : 'text-gray-500';
  const textUrl = isDark ? 'text-slate-400 bg-slate-800/50' : 'text-gray-600 bg-gray-100';
  const textIp = isDark ? 'text-slate-400' : 'text-gray-500';
  const btnDetail = isDark 
    ? 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30' 
    : 'text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300';
  const btnDelete = isDark 
    ? 'text-red-400 bg-red-500/10 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30' 
    : 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300';
  const textEmpty = isDark ? 'text-slate-400' : 'text-gray-500';

  // ============ MODAL ============
  const modalOverlay = isDark ? 'bg-black/70' : 'bg-black/50';
  const modalBg = isDark ? 'bg-slate-800/95 border-slate-700/50' : 'bg-white/95 border-gray-200';
  const modalHeader = isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-50 border-gray-200';
  const modalFooter = isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-50 border-gray-200';
  const modalTitle = isDark ? 'text-white' : 'text-gray-800';
  const modalLabel = isDark ? 'text-slate-400' : 'text-gray-500';
  const modalValue = isDark ? 'text-slate-200 bg-slate-900/50' : 'text-gray-800 bg-gray-100/80';
  const modalValueCode = isDark ? 'text-slate-200 bg-slate-900/50' : 'text-gray-800 bg-gray-100/80';
  const modalValuePre = isDark ? 'text-slate-300 bg-slate-900/50' : 'text-gray-700 bg-gray-100/80';
  const modalBtnClose = isDark 
    ? 'text-slate-400 hover:text-slate-200' 
    : 'text-gray-400 hover:text-gray-600';

  const handleViewDetail = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const handleDelete = async (log) => {
    const result = await AxionAlert.fire({
      title: "Excluir Registro?",
      text: `Deseja remover permanentemente este registro de auditoria?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      background: isDark ? "#111214" : "#ffffff",
      color: isDark ? "#ffffff" : "#1f2937",
      confirmButtonColor: "#6366f1",
    });

    if (result.isConfirmed) {
      setDeleteLoading(true);
      try {
        if (onDelete) await onDelete(log.id);
        AxionAlert.fire({
          icon: "success",
          title: "Registro excluído!",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        AxionAlert.fire("Erro", "Falha ao excluir registro.", "error");
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const getMethodBadgeClass = (method) => {
    const methodColors = {
      GET: { bg: "bg-blue-500/15", text: "text-blue-400", dot: "bg-blue-400" },
      POST: { bg: "bg-green-500/15", text: "text-green-400", dot: "bg-green-400" },
      PUT: { bg: "bg-yellow-500/15", text: "text-yellow-400", dot: "bg-yellow-400" },
      PATCH: { bg: "bg-yellow-500/15", text: "text-yellow-400", dot: "bg-yellow-400" },
      DELETE: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400" },
    };
    return methodColors[method] || methodColors.GET;
  };

  const isSystemAdmin = currentUser?.is_admin === 1 || currentUser?.is_admin === true;

  // ============ MODAL CUSTOMIZADO ============
  const DetailModal = ({ isOpen, onClose, log }) => {
    if (!isOpen || !log) return null;

    const methodStyle = getMethodBadgeClass(log.method?.toUpperCase());

    return (
      <>
        {/* Overlay */}
        <div 
          className={`fixed inset-0 ${modalOverlay} backdrop-blur-sm z-[1050]`}
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-[1060] p-4">
          <div className={`border rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden ${modalBg}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${modalHeader}`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${modalTitle}`}>
                <span>📜</span>
                Detalhes do Registro de Auditoria
              </h3>
              <button
                onClick={onClose}
                className={`transition-colors ${modalBtnClose}`}
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
              <div className="space-y-4">
                {/* ID */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${modalLabel}`}>
                    ID do Registro
                  </label>
                  <code className={`block font-mono text-sm px-3 py-2 rounded-lg ${modalValueCode}`}>
                    #{log.id}
                  </code>
                </div>

                {/* Data/Hora */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${modalLabel}`}>
                    Data/Hora
                  </label>
                  <div className={`font-mono text-sm px-3 py-2 rounded-lg ${modalValue}`}>
                    {log.created_at 
                      ? new Date(log.created_at).toLocaleString('pt-BR') 
                      : 'n/a'}
                  </div>
                </div>

                {/* Usuário */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${modalLabel}`}>
                    Usuário
                  </label>
                  <div className={`px-3 py-2 rounded-lg ${modalValue}`}>
                    <div className={`font-semibold ${isDark ? 'text-slate-200' : 'text-gray-800'} break-words`}>
                      {log.user ? log.user.name : 'Sistema / API'}
                    </div>
                    {log.user && (
                      <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'} break-all`}>{log.user.email}</div>
                    )}
                  </div>
                </div>

                {/* Método */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${modalLabel}`}>
                    Método HTTP
                  </label>
                  <div className={`px-3 py-2 rounded-lg ${modalValue}`}>
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${methodStyle.bg} ${methodStyle.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${methodStyle.dot}`} />
                      {log.method?.toUpperCase() || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* URL */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${modalLabel}`}>
                    URL
                  </label>
                  <code className={`block font-mono text-sm px-3 py-2 rounded-lg break-all ${modalValueCode}`}>
                    {log.url}
                  </code>
                </div>

                {/* IP */}
                <div>
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${modalLabel}`}>
                    Endereço IP
                  </label>
                  <div className={`font-mono text-sm px-3 py-2 rounded-lg ${modalValue}`}>
                    {log.ip_address || 'n/a'}
                  </div>
                </div>

                {/* User Agent */}
                {log.user_agent && (
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${modalLabel}`}>
                      User Agent
                    </label>
                    <div className={`text-sm px-3 py-2 rounded-lg break-all ${isDark ? 'text-slate-400 bg-slate-900/50' : 'text-gray-500 bg-gray-100/80'}`}>
                      {log.user_agent}
                    </div>
                  </div>
                )}

                {/* Payload */}
                {log.payload && (
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1 ${modalLabel}`}>
                      Payload
                    </label>
                    <pre className={`text-sm font-mono px-3 py-2 rounded-lg overflow-x-auto ${modalValuePre}`}>
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${modalFooter}`}>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isDark 
                    ? 'text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50' 
                    : 'text-gray-600 hover:text-gray-800 bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Fechar
              </button>
              {isSystemAdmin && (
                <button
                  onClick={() => {
                    onClose();
                    handleDelete(log);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isDark 
                      ? 'text-red-400 hover:text-red-300 bg-red-600/20 hover:bg-red-600/30' 
                      : 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
                  }`}
                >
                  🗑️ Excluir Registro
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  // ============ RENDER ============
  return (
    <>
      <div className={`overflow-x-auto rounded-xl border transition-colors hover:border-blue-500/30 ${bgTable}`}>
        <table className="w-full border-collapse text-sm min-w-[900px] table-fixed">
          <thead className={`sticky top-0 z-10 ${bgHeader}`}>
            <tr>
              <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[80px] ${textHeader}`}>
                ID
              </th>
              <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[160px] ${textHeader}`}>
                Data / Hora
              </th>
              <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[200px] ${textHeader}`}>
                Usuário / Origem
              </th>
              <th className={`px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[100px] ${textHeader}`}>
                Método
              </th>
              <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap min-w-[250px] ${textHeader}`}>
                Recurso (URL)
              </th>
              <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[140px] ${textHeader}`}>
                Endereço IP
              </th>
              {isSystemAdmin && (
                <th className={`px-[18px] py-4 text-end text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[180px] ${textHeader}`}>
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {logs && logs.length > 0 ? (
              logs.map((log) => {
                const methodStyle = getMethodBadgeClass(log.method?.toUpperCase());
                return (
                  <tr key={log.id} className={`border-b transition-all cursor-default ${borderRow}`}>
                    <td className={`px-[18px] py-3.5 align-middle font-mono text-sm ${textId}`}>
                      #{log.id}
                    </td>
                    <td className={`px-[18px] py-3.5 align-middle font-mono text-xs ${textDate}`}>
                      {log.created_at 
                        ? new Date(log.created_at).toLocaleString('pt-BR') 
                        : 'n/a'}
                    </td>
                    <td className="px-[18px] py-3.5 align-middle break-words">
                      <div>
                        <strong className={`${textUserName} break-words`}>
                          {log.user ? log.user.name : 'Sistema / API'}
                        </strong>
                        <br />
                        <small className={`text-xs ${textUserEmail} break-all`}>
                          {log.user ? log.user.email : 'n/a'}
                        </small>
                      </div>
                    </td>
                    <td className="px-[18px] py-3.5 align-middle text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${methodStyle.bg} ${methodStyle.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${methodStyle.dot}`} />
                        {log.method?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td className="px-[18px] py-3.5 align-middle break-all">
                      <code className={`font-mono text-xs px-2 py-1 rounded break-all ${textUrl}`}>
                        {log.url}
                      </code>
                    </td>
                    <td className={`px-[18px] py-3.5 align-middle font-mono text-xs ${textIp}`}>
                      {log.ip_address || 'n/a'}
                    </td>
                    {isSystemAdmin && (
                      <td className="px-[18px] py-3.5 align-middle text-end">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          <button
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all hover:-translate-y-0.5 ${btnDetail}`}
                            onClick={() => handleViewDetail(log)}
                            title="Ver Detalhes"
                          >
                            👁️ Detalhes
                          </button>
                          <button
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all hover:-translate-y-0.5 ${btnDelete}`}
                            onClick={() => handleDelete(log)}
                            title="Excluir Registro"
                            disabled={deleteLoading}
                          >
                            🗑️ Excluir
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isSystemAdmin ? 7 : 6} className="px-6 py-12">
                  <div className={`flex flex-col items-center justify-center ${textEmpty}`}>
                    <div className="text-5xl mb-4 opacity-60">
                      {loading ? "⏳" : "🔒"}
                    </div>
                    <p className="text-center">
                      {loading 
                        ? "Carregando registros de auditoria..." 
                        : "Nenhum registro de auditoria encontrado para os filtros selecionados."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        log={selectedLog}
      />
    </>
  );
}
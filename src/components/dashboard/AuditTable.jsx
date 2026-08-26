// components/dashboard/AuditTable.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";

export default function AuditTable({ logs, loading, onViewDetail, onDelete, currentUser }) {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
  });

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
      background: "#111214",
      color: "#ffffff",
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1050]"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-[1060] p-4">
          <div className="bg-slate-800/95 border border-slate-700/50 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📜</span>
                Detalhes do Registro de Auditoria
              </h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
              <div className="space-y-4">
                {/* ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    ID do Registro
                  </label>
                  <code className="block font-mono text-sm text-slate-200 bg-slate-900/50 px-3 py-2 rounded-lg">
                    #{log.id}
                  </code>
                </div>

                {/* Data/Hora */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Data/Hora
                  </label>
                  <div className="font-mono text-sm text-slate-200 bg-slate-900/50 px-3 py-2 rounded-lg">
                    {log.created_at 
                      ? new Date(log.created_at).toLocaleString('pt-BR') 
                      : 'n/a'}
                  </div>
                </div>

                {/* Usuário */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Usuário
                  </label>
                  <div className="bg-slate-900/50 px-3 py-2 rounded-lg">
                    <div className="font-semibold text-slate-200">
                      {log.user ? log.user.name : 'Sistema / API'}
                    </div>
                    {log.user && (
                      <div className="text-sm text-slate-400">{log.user.email}</div>
                    )}
                  </div>
                </div>

                {/* Método */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Método HTTP
                  </label>
                  <div className="bg-slate-900/50 px-3 py-2 rounded-lg">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${methodStyle.bg} ${methodStyle.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${methodStyle.dot}`} />
                      {log.method?.toUpperCase() || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    URL
                  </label>
                  <code className="block font-mono text-sm text-slate-200 bg-slate-900/50 px-3 py-2 rounded-lg break-all">
                    {log.url}
                  </code>
                </div>

                {/* IP */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Endereço IP
                  </label>
                  <div className="font-mono text-sm text-slate-200 bg-slate-900/50 px-3 py-2 rounded-lg">
                    {log.ip_address || 'n/a'}
                  </div>
                </div>

                {/* User Agent */}
                {log.user_agent && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      User Agent
                    </label>
                    <div className="text-sm text-slate-400 bg-slate-900/50 px-3 py-2 rounded-lg break-all">
                      {log.user_agent}
                    </div>
                  </div>
                )}

                {/* Payload */}
                {log.payload && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Payload
                    </label>
                    <pre className="text-sm font-mono text-slate-300 bg-slate-900/50 px-3 py-2 rounded-lg overflow-x-auto">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/50 bg-slate-800/50">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 transition-all"
              >
                Fechar
              </button>
              {isSystemAdmin && (
                <button
                  onClick={() => {
                    onClose();
                    handleDelete(log);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 bg-red-600/20 hover:bg-red-600/30 transition-all"
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
      <div className="overflow-x-auto rounded-xl bg-slate-800/50 border border-slate-700/50 transition-colors hover:border-blue-500/30">
        <table className="w-full border-collapse text-sm min-w-[900px] table-fixed">
          <thead className="bg-slate-800/80 sticky top-0 z-10">
            <tr>
              <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[80px]">
                ID
              </th>
              <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[160px]">
                Data / Hora
              </th>
              <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap">
                Usuário / Origem
              </th>
              <th className="px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[100px]">
                Método
              </th>
              <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap">
                Recurso (URL)
              </th>
              <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[140px]">
                Endereço IP
              </th>
              {isSystemAdmin && (
                <th className="px-[18px] py-4 text-end text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[180px]">
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
                  <tr key={log.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-all cursor-default">
                    <td className="px-[18px] py-3.5 align-middle font-mono text-sm text-slate-400">
                      #{log.id}
                    </td>
                    <td className="px-[18px] py-3.5 align-middle font-mono text-xs text-slate-400">
                      {log.created_at 
                        ? new Date(log.created_at).toLocaleString('pt-BR') 
                        : 'n/a'}
                    </td>
                    <td className="px-[18px] py-3.5 align-middle">
                      <div>
                        <strong className="text-blue-400">
                          {log.user ? log.user.name : 'Sistema / API'}
                        </strong>
                        <br />
                        <small className="text-slate-500 text-xs">
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
                    <td className="px-[18px] py-3.5 align-middle">
                      <code className="font-mono text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                        {log.url}
                      </code>
                    </td>
                    <td className="px-[18px] py-3.5 align-middle font-mono text-xs text-slate-400">
                      {log.ip_address || 'n/a'}
                    </td>
                    {isSystemAdmin && (
                      <td className="px-[18px] py-3.5 align-middle text-end">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all hover:-translate-y-0.5"
                            onClick={() => handleViewDetail(log)}
                            title="Ver Detalhes"
                          >
                            👁️ Detalhes
                          </button>
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all hover:-translate-y-0.5"
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
                  <div className="flex flex-col items-center justify-center text-slate-400">
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
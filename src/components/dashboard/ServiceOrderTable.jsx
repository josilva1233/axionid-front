// components/dashboard/ServiceOrderTable.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";

export default function ServiceOrderTable({ orders, loading, onViewDetail, onEdit, onDelete, currentUser }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    status: "",
    priority: "",
    description: ""
  });
  const [editLoading, setEditLoading] = useState(false);

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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${current.bg} ${current.text}`}>
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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${current.bg} ${current.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
        {current.label}
      </span>
    );
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setEditForm({
      title: order.title,
      status: order.status,
      priority: order.priority,
      description: order.description || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) {
      AxionAlert.fire("Erro", "Título é obrigatório.", "error");
      return;
    }

    setEditLoading(true);
    try {
      if (onEdit) await onEdit(editingOrder.id, editForm);
      AxionAlert.fire({
        icon: "success",
        title: "OS atualizada!",
        timer: 1500,
        showConfirmButton: false,
      });
      setShowEditModal(false);
    } catch (err) {
      AxionAlert.fire("Erro", "Falha ao atualizar OS.", "error");
    } finally {
      setEditLoading(false);
    }
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

  const isSystemAdmin = currentUser?.is_admin === 1 || currentUser?.is_admin === true;

  // ============ MODAL DE EDIÇÃO ============
  const EditModal = () => {
    if (!showEditModal) return null;

    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1050]"
          onClick={() => setShowEditModal(false)}
        />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-[1060] p-4">
          <div className="bg-slate-800/95 border border-slate-700/50 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                ✏️ Editar Ordem de Serviço
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
              <form className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    📌 Título <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Título da OS"
                    disabled={editLoading}
                  />
                  <small className="block text-xs text-slate-500 mt-1">
                    Título descritivo da Ordem de Serviço
                  </small>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    📊 Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={editLoading}
                  >
                    <option value="open">Aberto</option>
                    <option value="in_progress">Em Atendimento</option>
                    <option value="resolved">Resolvido</option>
                    <option value="closed">Fechado</option>
                    <option value="canceled">Cancelado</option>
                  </select>
                  <small className="block text-xs text-slate-500 mt-1">
                    Status atual da Ordem de Serviço
                  </small>
                </div>

                {/* Prioridade */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    🚩 Prioridade
                  </label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={editLoading}
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                  <small className="block text-xs text-slate-500 mt-1">
                    Nível de prioridade da Ordem de Serviço
                  </small>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    📝 Descrição
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-y disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Descrição detalhada da OS..."
                    disabled={editLoading}
                  />
                  <small className="block text-xs text-slate-500 mt-1">
                    Detalhes adicionais sobre a Ordem de Serviço
                  </small>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/50 bg-slate-800/50">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editLoading || !editForm.title.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none flex items-center gap-2"
              >
                {editLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    💾 Salvar Alterações
                  </>
                )}
              </button>
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
              <th className="px-[18px] py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[200px]">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((os) => (
                <tr key={os.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-all cursor-default">
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
                        {new Date(os.created_at).toLocaleDateString('pt-BR')}
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
                    <div className="flex items-center justify-end gap-1 flex-wrap">
                      <button
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all hover:-translate-y-0.5"
                        onClick={() => onViewDetail(os.id)}
                        title="Ver Detalhes"
                      >
                        👁️ Detalhes
                      </button>
                      {isSystemAdmin && (
                        <>
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/30 transition-all hover:-translate-y-0.5"
                            onClick={() => handleEdit(os)}
                            title="Editar OS"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all hover:-translate-y-0.5"
                            onClick={() => handleDelete(os)}
                            title="Excluir OS"
                          >
                            🗑️ Excluir
                          </button>
                        </>
                      )}
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
                      {loading ? "Carregando chamados..." : "Nenhuma Ordem de Serviço encontrada."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Edição */}
      <EditModal />
    </>
  );
}
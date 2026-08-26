// components/dashboard/GroupTable.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";

export default function GroupTable({
  groups,
  loading,
  onViewDetail,
  onEdit,
  onDelete,
  currentUser
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
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

  // ============ ABRIR MODAL DE EDIÇÃO ============
  const handleOpenEditModal = (group) => {
    setEditingGroup(group);
    setEditForm({
      name: group.name || "",
      description: group.description || "",
    });
    setShowEditModal(true);
  };

  // ============ FECHAR MODAL ============
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingGroup(null);
    setEditForm({ name: "", description: "" });
  };

  // ============ SALVAR EDIÇÃO ============
  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      AxionAlert.fire({
        icon: "warning",
        title: "Campo Obrigatório",
        text: "O nome do grupo é obrigatório.",
        confirmButtonColor: "#6366f1",
      });
      return;
    }

    setEditLoading(true);
    try {
      if (onEdit) {
        await onEdit(editingGroup.id, editForm);
      }

      AxionAlert.fire({
        icon: "success",
        title: "Grupo Atualizado!",
        text: `O grupo "${editForm.name}" foi atualizado com sucesso.`,
        timer: 2000,
        showConfirmButton: false,
      });

      handleCloseEditModal();
    } catch (err) {
      AxionAlert.fire({
        icon: "error",
        title: "Erro!",
        text: err.response?.data?.message || "Falha ao atualizar grupo.",
        confirmButtonColor: "#6366f1",
      });
    } finally {
      setEditLoading(false);
    }
  };

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

  const isSystemAdmin = currentUser?.is_admin === 1 || currentUser?.is_admin === true;

  // ============ MODAL DE EDIÇÃO ============
  const EditModal = () => {
    if (!showEditModal) return null;

    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1050]"
          onClick={handleCloseEditModal}
        />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-[1060] p-4">
          <div className="bg-slate-800/95 border border-slate-700/50 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                ✏️ Editar Grupo
              </h3>
              <button
                onClick={handleCloseEditModal}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
              <form className="space-y-4">
                {/* Nome do Grupo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    📌 Nome do Grupo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Ex: Administradores, TI, RH"
                    disabled={editLoading}
                  />
                  <small className="block text-xs text-slate-500 mt-1">
                    Nome único para identificar o grupo
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
                    placeholder="Descreva a finalidade deste grupo..."
                    disabled={editLoading}
                  />
                  <small className="block text-xs text-slate-500 mt-1">
                    Opcional: descreva as responsabilidades do grupo
                  </small>
                </div>

                {/* Informações adicionais */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      # ID do Grupo
                    </span>
                    <span className="font-mono text-sm text-slate-200">
                      #{editingGroup?.id || "---"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      👤 Criado por
                    </span>
                    <span className="text-sm text-slate-200">
                      {editingGroup?.creator?.name || "Sistema"}
                    </span>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/50 bg-slate-800/50">
              <button
                onClick={handleCloseEditModal}
                disabled={editLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editLoading || !editForm.name.trim()}
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
                const canManage = isSystemAdmin ||
                  g.creator_id === currentUser?.id ||
                  g.users?.some((u) => u.id === currentUser?.id && u.pivot?.role === "admin");

                const memberCount = g.users_count || g.users?.length || 0;

                return (
                  <tr key={g.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-all cursor-default">
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
                        <span className="text-slate-300">{g.creator?.name || "Sistema"}</span>
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
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        isSystemAdmin
                          ? "bg-purple-500/20 text-purple-400"
                          : canManage
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-slate-700/50 text-slate-300"
                      }`}>
                        {isSystemAdmin ? "Admin Global" : canManage ? "Administrador" : "Membro"}
                      </span>
                    </td>
                    <td className="px-[18px] py-3.5 align-middle text-right">
                      {canManage ? (
                        <div className="relative inline-block">
                          <button
                            className="inline-flex items-center justify-center w-9 h-9 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all"
                            onClick={() => {
                              // Toggle dropdown
                              const dropdown = document.getElementById(`dropdown-${g.id}`);
                              if (dropdown) {
                                dropdown.classList.toggle('hidden');
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
                                  onClick={() => handleOpenEditModal(g)}
                                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 transition-all text-left"
                                >
                                  ✏️ Editar Grupo
                                </button>
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

      {/* Modal de Edição */}
      <EditModal />
    </>
  );
}
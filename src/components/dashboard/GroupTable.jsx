// components/dashboard/GroupTable.jsx
import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";

// ============================================================
// 🔥 COMPONENTE MODAL DE EDIÇÃO (separado)
// ============================================================
const EditGroupModal = React.memo(({
  isOpen,
  onClose,
  editingGroup,
  editForm,
  setEditForm,
  onSave,
  editLoading,
  isDark,
}) => {
  if (!isOpen || !editingGroup) return null;

  // Classes de tema
  const modalBg = isDark ? 'bg-slate-800/95 border-slate-700/50' : 'bg-white/95 border-gray-200';
  const modalHeader = isDark ? 'bg-slate-800/50' : 'bg-gray-50';
  const modalBorder = isDark ? 'border-slate-700/50' : 'border-gray-200';
  const textHeading = isDark ? 'text-white' : 'text-gray-800';
  const textLabel = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgInput = isDark 
    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder-slate-500' 
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400';
  const focusRing = 'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50';
  const btnCancel = isDark 
    ? 'text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50' 
    : 'text-gray-600 hover:text-gray-800 bg-gray-200 hover:bg-gray-300';
  const overlayBg = isDark ? 'bg-black/70' : 'bg-black/50';
  const infoBoxBg = isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-100/80 border-gray-200';
  const infoText = isDark ? 'text-slate-200' : 'text-gray-800';
  const infoLabel = isDark ? 'text-slate-400' : 'text-gray-500';

  return (
    <>
      <div className={`fixed inset-0 ${overlayBg} backdrop-blur-sm z-[1050]`} onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[1060] p-4">
        <div className={`border rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden ${modalBg}`}>
          <div className={`flex items-center justify-between px-6 py-4 border-b ${modalBorder} ${modalHeader}`}>
            <h3 className={`text-lg font-bold flex items-center gap-2 ${textHeading}`}>
              ✏️ Editar Grupo
            </h3>
            <button
              onClick={onClose}
              className={`${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
            <form className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${textLabel}`}>
                  📌 Nome do Grupo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm ${focusRing} transition-all`}
                  placeholder="Ex: Administradores, TI, RH"
                  autoFocus // 🔥 Adiciona foco automático ao abrir
                />
                <small className={`block text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                  Nome único para identificar o grupo
                </small>
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${textLabel}`}>
                  📝 Descrição
                </label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm ${focusRing} transition-all resize-y`}
                  placeholder="Descreva a finalidade deste grupo..."
                />
                <small className={`block text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                  Opcional: descreva as responsabilidades do grupo
                </small>
              </div>

              <div className={`${infoBoxBg} border rounded-lg p-4 space-y-2`}>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-1 ${infoLabel}`}>
                    # ID do Grupo
                  </span>
                  <span className={`font-mono text-sm ${infoText}`}>
                    #{editingGroup?.id || "---"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-1 ${infoLabel}`}>
                    👤 Criado por
                  </span>
                  <span className={`text-sm ${infoText}`}>
                    {editingGroup?.creator?.name || "Sistema"}
                  </span>
                </div>
              </div>
            </form>
          </div>

          <div className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${modalBorder} ${modalHeader}`}>
            <button
              onClick={onClose}
              disabled={editLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${btnCancel}`}
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              disabled={editLoading || !editForm.name.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none flex items-center gap-2"
            >
              {editLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Salvando...
                </>
              ) : (
                <>💾 Salvar Alterações</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

// ============================================================
// 🔥 COMPONENTE PRINCIPAL
// ============================================================
export default function GroupTable({
  groups,
  loading,
  onViewDetail,
  onEdit,
  onDelete,
  currentUser,
  isDark = false,
}) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [editLoading, setEditLoading] = useState(false);

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
  const textName = isDark ? 'text-blue-400' : 'text-blue-700';
  const textDesc = isDark ? 'text-slate-500' : 'text-gray-500';
  const textCreator = isDark ? 'text-slate-300' : 'text-gray-700';
  const badgeYou = isDark 
    ? 'text-blue-400 bg-blue-500/15' 
    : 'text-blue-700 bg-blue-100';
  const textMemberCount = isDark ? 'text-white' : 'text-gray-800';
  const textMemberLabel = isDark ? 'text-slate-500' : 'text-gray-400';
  const badgeAdminGlobal = isDark 
    ? 'bg-purple-500/20 text-purple-400' 
    : 'bg-purple-100 text-purple-700';
  const badgeAdmin = isDark 
    ? 'bg-blue-500/20 text-blue-400' 
    : 'bg-blue-100 text-blue-700';
  const badgeMember = isDark 
    ? 'bg-slate-700/50 text-slate-300' 
    : 'bg-gray-200 text-gray-700';
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
  const dropdownDanger = isDark 
    ? 'text-red-400 hover:bg-red-500/10' 
    : 'text-red-600 hover:bg-red-50';
  const textReadOnly = isDark ? 'text-slate-500' : 'text-gray-400';
  const textEmpty = isDark ? 'text-slate-400' : 'text-gray-500';

  // ============ ABRIR MODAL ============
  const handleOpenEditModal = (group) => {
    setEditLoading(false); // 🔥 RESETA O LOADING
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
      background: isDark ? "#111214" : "#ffffff",
      color: isDark ? "#ffffff" : "#1f2937",
    });

    if (result.isConfirmed) {
      if (onDelete) {
        await onDelete(group.id);
      }
    }
  };

  const isSystemAdmin = currentUser?.is_admin === 1 || currentUser?.is_admin === true;

  // ============ TOGGLE DROPDOWN ============
  const toggleDropdown = (id) => {
    const dropdown = document.getElementById(`dropdown-${id}`);
    if (dropdown) {
      dropdown.classList.toggle('hidden');
    }
  };

  // ============ RENDER ============
  return (
    <>
      <div className={`overflow-x-auto rounded-xl border transition-colors hover:border-blue-500/30 ${bgTable}`}>
        <table className="w-full border-collapse text-sm min-w-[800px] table-fixed">
          <thead className={`sticky top-0 z-10 ${bgHeader}`}>
            <tr>
              <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[70px] ${textHeader}`}>
                ID
              </th>
              <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap ${textHeader}`}>
                Nome do Grupo
              </th>
              <th className={`px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[150px] ${textHeader}`}>
                Criador
              </th>
              <th className={`px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[100px] ${textHeader}`}>
                Membros
              </th>
              <th className={`px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[130px] ${textHeader}`}>
                Meu Status
              </th>
              <th className={`px-[18px] py-4 text-right text-[11px] font-semibold uppercase tracking-wide border-b-2 whitespace-nowrap w-[100px] ${textHeader}`}>
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
                  <tr key={g.id} className={`border-b transition-all cursor-default ${borderRow}`}>
                    <td className={`px-[18px] py-3.5 align-middle font-mono text-sm ${textId}`}>
                      #{g.id}
                    </td>
                    <td className="px-[18px] py-3.5 align-middle">
                      <div>
                        <strong className={`block ${textName}`}>
                          {g.name.toUpperCase()}
                        </strong>
                        {g.description && (
                          <span className={`text-xs block ${textDesc}`}>
                            {g.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-[18px] py-3.5 align-middle">
                      <div className="flex items-center gap-1.5">
                        <span className={textCreator}>{g.creator?.name || "Sistema"}</span>
                        {g.creator?.id === currentUser?.id && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeYou}`}>
                            Você
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-[18px] py-3.5 align-middle text-center">
                      <span className={`text-sm font-semibold ${textMemberCount}`}>
                        {memberCount}
                      </span>
                      <span className={`text-xs ml-1 ${textMemberLabel}`}>
                        membro{memberCount !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="px-[18px] py-3.5 align-middle text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        isSystemAdmin
                          ? badgeAdminGlobal
                          : canManage
                          ? badgeAdmin
                          : badgeMember
                      }`}>
                        {isSystemAdmin ? "Admin Global" : canManage ? "Administrador" : "Membro"}
                      </span>
                    </td>
                    <td className="px-[18px] py-3.5 align-middle text-right">
                      {canManage ? (
                        <div className="relative inline-block">
                          <button
                            className={`inline-flex items-center justify-center w-9 h-9 rounded-md transition-all ${btnMore}`}
                            onClick={() => toggleDropdown(g.id)}
                            aria-label="Ações do grupo"
                          >
                            <span className="text-xl">⋯</span>
                          </button>
                          <div
                            id={`dropdown-${g.id}`}
                            className={`absolute right-0 mt-1 w-48 border rounded-lg shadow-xl hidden z-20 overflow-hidden ${dropdownBg}`}
                          >
                            <button
                              onClick={() => onViewDetail(g.id)}
                              className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all text-left ${dropdownText}`}
                            >
                              👥 Gerenciar Membros
                            </button>

                            {isSystemAdmin && (
                              <>
                                <div className={`h-px ${dropdownSeparator}`}></div>
                                <button
                                  onClick={() => handleOpenEditModal(g)}
                                  className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all text-left ${dropdownText}`}
                                >
                                  ✏️ Editar Grupo
                                </button>
                                <button
                                  onClick={() => handleDelete(g)}
                                  className={`flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-all text-left ${dropdownDanger}`}
                                >
                                  🗑️ Excluir Grupo
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center gap-1 text-xs ${textReadOnly}`}>
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
                  <div className={`flex flex-col items-center justify-center ${textEmpty}`}>
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

      {/* ========== MODAL DE EDIÇÃO ========== */}
      <EditGroupModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        editingGroup={editingGroup}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveEdit}
        editLoading={editLoading}
        isDark={isDark}
      />
    </>
  );
}
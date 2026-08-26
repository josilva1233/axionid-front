// components/dashboard/PermissionDetail.jsx
import React, { useState } from "react";
import Swal from "sweetalert2";

export default function PermissionDetail({
  permission,
  onBack,
  onEdit,
  onDelete,
  isSystemAdmin,
  actionLoading
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: permission?.name || "",
    label: permission?.label || "",
    description: permission?.description || "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  if (!permission) {
    return (
      <div className="bg-slate-900 rounded-xl">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700/50 bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all"
            onClick={onBack}
          >
            ← Voltar
          </button>
          <span className="text-slate-400">Permissão não encontrada</span>
        </div>
      </div>
    );
  }

  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || !editForm.label.trim()) {
      AxionAlert.fire("Erro", "Nome e label são obrigatórios.", "error");
      return;
    }

    setEditLoading(true);
    try {
      if (onEdit) await onEdit(permission.id, editForm);
      AxionAlert.fire({
        icon: "success",
        title: "Permissão atualizada!",
        timer: 1500,
        showConfirmButton: false,
      });
      setIsEditing(false);
    } catch (err) {
      AxionAlert.fire("Erro", "Falha ao atualizar permissão.", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteModal(false);
    const result = await AxionAlert.fire({
      title: "Excluir Permissão?",
      text: `Deseja remover permanentemente a permissão "${permission.label}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      background: "#111214",
      color: "#ffffff",
      confirmButtonColor: "#6366f1",
    });

    if (result.isConfirmed) {
      if (onDelete) await onDelete(permission.id);
    }
  };

  // ============ MODAL DE EXCLUSÃO ============
  const DeleteModal = () => {
    if (!showDeleteModal) return null;

    return (
      <>
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1050]" onClick={() => setShowDeleteModal(false)} />
        <div className="fixed inset-0 flex items-center justify-center z-[1060] p-4">
          <div className="bg-slate-800/95 border border-slate-700/50 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-800/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                ⚠️ Confirmar Exclusão
              </h3>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-slate-200 transition-colors">
                <span className="text-2xl">✕</span>
              </button>
            </div>
            <div className="p-6">
              <p className="text-slate-300">
                Tem certeza que deseja excluir a permissão
                <strong className="text-blue-400 block mt-2 text-lg">
                  "{permission.label}"
                </strong>
                ?
              </p>
              <div className="flex items-start gap-3 mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-sm">
                <span className="text-lg">⚠️</span>
                <span>
                  Esta ação é <strong>irreversível</strong>. Todos os grupos que
                  utilizam esta permissão perderão o acesso.
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700/50 bg-slate-800/50">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></span>
                    Excluindo...
                  </>
                ) : (
                  <>
                    🗑️ Sim, Excluir Permanentemente
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
    <div className="bg-slate-900 rounded-xl min-h-screen">
      {/* ============ HEADER ============ */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-b border-slate-700/50 rounded-t-xl">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700/50 bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all whitespace-nowrap text-sm"
          >
            ← Voltar
          </button>

          <div className="w-px h-8 bg-slate-700/50"></div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl">
              🛡️
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">
                {permission.label?.toUpperCase() || "SEM NOME"}
              </h4>
              <span className="font-mono text-xs text-slate-500">
                #{permission.id} • {permission.name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isSystemAdmin && !isEditing && (
            <>
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
                onClick={() => setIsEditing(true)}
                title="Editar Permissão"
              >
                ✏️ Editar
              </button>
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-sm border border-red-500/20 transition-all hover:-translate-y-0.5"
                onClick={() => setShowDeleteModal(true)}
                title="Excluir Permissão"
              >
                🗑️ Excluir
              </button>
            </>
          )}
          {isEditing && (
            <>
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 font-semibold text-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    name: permission.name,
                    label: permission.label,
                    description: permission.description || "",
                  });
                }}
                disabled={editLoading}
              >
                Cancelar
              </button>
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-600 hover:bg-green-500 text-white font-semibold text-sm transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSaveEdit}
                disabled={editLoading}
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
            </>
          )}
        </div>
      </div>

      {/* ============ BODY ============ */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============ COLUNA PRINCIPAL ============ */}
          <div className="lg:col-span-2">
            <div className={`bg-slate-800/50 border rounded-xl p-6 transition-all ${isEditing ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-slate-700/50'}`}>
              <h5 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                ℹ️ Informações da Permissão
              </h5>

              <div className="space-y-4">
                {/* Chave do Sistema */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    🔑 Chave do Sistema (Slug)
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      placeholder="ex: users.create"
                    />
                  ) : (
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg px-3 py-2.5">
                      <code className="font-mono text-sm text-slate-300">{permission.name}</code>
                    </div>
                  )}
                  <span className="block text-xs text-slate-500 mt-1">
                    Identificador único usado no código
                  </span>
                </div>

                {/* Label */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    📝 Label (Nome Exibido)
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.label}
                      onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                      placeholder="ex: Criar Usuários"
                    />
                  ) : (
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg px-3 py-2.5">
                      <strong className="text-blue-400">{permission.label?.toUpperCase() || "SEM NOME"}</strong>
                    </div>
                  )}
                  <span className="block text-xs text-slate-500 mt-1">
                    Nome exibido para os usuários
                  </span>
                </div>

                {/* Descrição */}
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    📄 Descrição
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-y"
                      placeholder="Descreva o que esta permissão concede..."
                    />
                  ) : (
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg px-3 py-2.5">
                      <span className="text-slate-300">
                        {permission.description || (
                          <span className="text-slate-500 italic">Nenhuma descrição fornecida</span>
                        )}
                      </span>
                    </div>
                  )}
                  <span className="block text-xs text-slate-500 mt-1">
                    Opcional: detalhes sobre a permissão
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ============ COLUNA LATERAL ============ */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h5 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                🛡️ Status e Metadados
              </h5>

              <div className="space-y-3">
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    # ID da Permissão
                  </label>
                  <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg px-3 py-2.5 font-mono text-sm text-slate-300">
                    #{permission.id}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    🏷️ Tipo
                  </label>
                  <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg px-3 py-2.5">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                      IAM
                    </span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    🔵 Status
                  </label>
                  <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-sm font-medium text-green-400">Ativo</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    📅 Criado em
                  </label>
                  <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg px-3 py-2.5 font-mono text-sm text-slate-300">
                    {permission.created_at
                      ? new Date(permission.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'n/a'}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    🔄 Última atualização
                  </label>
                  <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg px-3 py-2.5 font-mono text-sm text-slate-300">
                    {permission.updated_at
                      ? new Date(permission.updated_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'n/a'}
                  </div>
                </div>
              </div>
            </div>

            {/* Zona de Perigo */}
            {isSystemAdmin && (
              <div className="bg-slate-800/50 border border-red-500/20 rounded-xl p-6 hover:border-red-500/30 transition-all">
                <h5 className="text-sm font-bold text-red-400 flex items-center gap-2 mb-3">
                  ⚠️ Zona de Perigo
                </h5>
                <div className="flex flex-col gap-3">
                  <div>
                    <h6 className="text-sm font-semibold text-red-400 flex items-center gap-1.5">
                      🗑️ Excluir Permissão
                    </h6>
                    <p className="text-xs text-slate-400">
                      Esta ação é irreversível. Todos os grupos que usam esta
                      permissão perderão o acesso.
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 transition-all hover:-translate-y-0.5"
                    onClick={() => setShowDeleteModal(true)}
                    title="Excluir Permissão"
                  >
                    🗑️ Excluir Permanentemente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Exclusão */}
      <DeleteModal />
    </div>
  );
}
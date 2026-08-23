// components/dashboard/PermissionTable.jsx
import React from "react";
import Swal from "sweetalert2";

export default function PermissionTable({ 
  permissions, 
  loading, 
  currentUser, 
  onViewDetail,  // ← NOVO: para abrir o detalhe
  onDelete 
}) {
  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
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
    <>
      <div className="permission-table-container">
        <table className="permission-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>PERMISSÃO (LABEL)</th>
              <th>CHAVE DO SISTEMA (SLUG)</th>
              <th className="text-center">TIPO</th>
              <th className="text-center">STATUS</th>
              <th className="text-end">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {permissions.length > 0 ? (
              permissions.map((perm) => (
                <tr key={perm.id}>
                  <td className="mono-text">#{perm.id}</td>
                  <td>
                    <strong className="text-primary">{perm.label?.toUpperCase() || "SEM NOME"}</strong>
                  </td>
                  <td>
                    <code className="permission-code">{perm.name}</code>
                  </td>
                  <td className="text-center">
                    <span className="badge-iam">IAM</span>
                  </td>
                  <td className="text-center">
                    <div className="status-badge">
                      <span className="status-dot" style={{ backgroundColor: "var(--success)" }}></span>
                      <span>Ativo</span>
                    </div>
                  </td>
                  <td className="text-end">
                    {isSystemAdmin ? (
                      <div className="actions-wrapper">
                        {/* Botão Visualizar/Editar - Abre o PermissionDetail */}
                        <button
                          className="btn-table-action"
                          onClick={() => onViewDetail(perm.id)}
                          title="Visualizar e Editar Permissão"
                        >
                          <i className="bi bi-eye"></i> Detalhes
                        </button>
                        <button
                          className="btn-table-action btn-table-action-danger"
                          onClick={() => handleDelete(perm)}
                          title="Excluir Permissão"
                        >
                          <i className="bi bi-trash3-fill"></i> Excluir
                        </button>
                      </div>
                    ) : (
                      <span className="readonly-badge">
                        <i className="bi bi-lock-fill me-1"></i> Read-only
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  <div className="empty-state">
                    <div className="empty-icon">{loading ? "⏳" : "🛡️"}</div>
                    <p>
                      {loading ? "Carregando permissões..." : "Nenhuma permissão identificada no sistema."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
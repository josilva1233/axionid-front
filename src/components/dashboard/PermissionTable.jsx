import React from "react";

export default function PermissionTable({ permissions, loading, currentUser, onEdit }) {
  return (
    <div className="table-responsive">
      <table className="axion-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>NOME DA PERMISSÃO (LABEL)</th>
            <th>CHAVE DO SISTEMA (SLUG)</th>
            <th className="text-center">TIPO</th>
            <th className="text-center">STATUS</th>
            <th className="text-end">AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {permissions.length > 0 ? (
            permissions.map((perm) => {
              const isSystemAdmin = currentUser?.is_admin === 1 || currentUser?.is_admin === true;

              return (
                <tr key={perm.id}>
                  <td className="mono-text">
                    #{perm.id}
                  </td>
                  <td>
                    <strong className="text-primary">
                      {perm.label ? perm.label.toUpperCase() : "SEM NOME"}
                    </strong>
                  </td>
                  <td>
                    <code className="permission-code">
                      {perm.name}
                    </code>
                  </td>
                  <td className="text-center">
                    <span className="badge-operacional">
                      IAM
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="status-indicator-wrapper">
                      <span className="status-indicator success" />
                      <span className="status-text">Ativo</span>
                    </div>
                  </td>
                  <td className="text-end">
                    {isSystemAdmin ? (
                      <button
                        className="btn-table-action"
                        onClick={() => onEdit && onEdit(perm)}
                        title="Editar Permissão"
                      >
                        <i className="bi bi-pencil-square me-1"></i>
                        Editar
                      </button>
                    ) : (
                      <span className="readonly-badge">
                        <i className="bi bi-lock-fill me-1"></i> Read-only
                      </span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-5 text-dim">
                <div className="empty-state">
                  <span className="empty-icon">{loading ? "⏳" : "🛡️"}</span>
                  <p className="mt-2 mb-0">
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
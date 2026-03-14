import React from "react";

export default function PermissionTable({ permissions, loading }) {
  return (
    <div className="table-responsive">
      <table className="axion-table w-100">
        <thead>
          <tr>
            <th>NOME DA PERMISSÃO (LABEL)</th>
            <th>CHAVE DO SISTEMA (SLUG)</th>
            <th className="text-end">CRIADO EM</th>
          </tr>
        </thead>
        <tbody>
          {permissions.length > 0 ? (
            permissions.map((perm) => (
              <tr key={perm.id} className="animate-in">
                <td>
                  <div className="d-flex align-items-center">
                    <i className="bi bi-shield-lock me-2 text-primary"></i>
                    <strong className="text-white">{perm.label}</strong>
                  </div>
                </td>
                <td>
                  <code className="bg-dark px-2 py-1 rounded text-info" style={{ fontSize: '0.85rem' }}>
                    {perm.name}
                  </code>
                </td>
                <td className="text-end text-dim">
                  {perm.created_at ? new Date(perm.created_at).toLocaleDateString('pt-BR') : 'Sistema'}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center py-5 text-dim italic">
                {loading ? "Carregando permissões..." : "Nenhuma permissão encontrada."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
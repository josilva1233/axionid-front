// components/dashboard/UserPermissionManager.jsx
import { useState } from "react";

export default function UserPermissionManager({
  user,
  userPermissions = [],
  allAvailablePermissions = [],
  onAddPermission,
  onRemovePermission,
  actionLoading,
}) {
  const [selectedPermission, setSelectedPermission] = useState("");

  const handleAssignPermission = () => {
    if (selectedPermission && onAddPermission) {
      onAddPermission(user.id, selectedPermission);
      setSelectedPermission("");
    }
  };

  const availablePermissions = allAvailablePermissions.filter(
    permission => !userPermissions.some(up => up.id === permission.id)
  );

  return (
    <div className="info-card mt-4">
      <h5 className="card-title">
        <i className="bi bi-shield-check me-2"></i>
        Permissões Específicas do Usuário
      </h5>
      
      <div className="row">
        <div className="col-md-12 mb-4">
          <p className="text-dim small">
            Estas permissões são atribuídas diretamente ao usuário, além das permissões herdadas dos grupos.
          </p>
        </div>
      </div>

      <div className="table-responsive mb-4">
        <table className="axion-table">
          <thead>
            <tr>
              <th>PERMISSÃO</th>
              <th>LABEL</th>
              <th>DESCRIÇÃO</th>
              <th className="text-end">AÇÕES</th>
            </tr>
          </thead>
          <tbody>
            {userPermissions?.length > 0 ? (
              userPermissions.map((permission) => (
                <tr key={permission.id}>
                  <td>
                    <code className="permission-code">{permission.name}</code>
                  </td>
                  <td>
                    <strong className="text-white">{permission.label}</strong>
                  </td>
                  <td className="text-dim">
                    {permission.description || "Sem descrição"}
                  </td>
                  <td className="text-end">
                    <button
                      className="btn-delete-permanent btn-sm"
                      onClick={() => onRemovePermission && onRemovePermission(user.id, permission.id)}
                      disabled={actionLoading}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Remover
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-5 text-dim">
                  <i className="bi bi-info-circle me-2"></i>
                  Nenhuma permissão direta atribuída a este usuário.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {availablePermissions.length > 0 && (
        <div className="row align-items-end">
          <div className="col-md-8">
            <label className="input-label">Atribuir Nova Permissão</label>
            <select
              className="custom-input-dark"
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value)}
            >
              <option value="">Selecione uma permissão...</option>
              {availablePermissions.map(permission => (
                <option key={permission.id} value={permission.id}>
                  {permission.label} ({permission.name})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <button
              className="btn-primary w-100"
              onClick={handleAssignPermission}
              disabled={!selectedPermission || actionLoading}
            >
              {actionLoading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="bi bi-plus-circle me-2"></i>
              )}
              Atribuir Permissão
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
// components/dashboard/GroupPermissionManager.jsx
import { useState } from "react";
import { Form, Spinner, Modal, Alert } from "react-bootstrap";
import Swal from "sweetalert2";
//import "../../GroupPermissionManager.css";

export default function GroupPermissionManager({ 
  group, 
  permissions, 
  onAddPermission, 
  onRemovePermission,
  actionLoading 
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
    cancelButtonColor: "#343a40",
  });

  // Filtrar permissões disponíveis (que o grupo ainda não tem)
  const availablePermissions = permissions.filter(
    perm => !group.permissions?.some(gp => gp.id === perm.id)
  );

  const filteredPermissions = availablePermissions.filter(perm =>
    perm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perm.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPermission = async () => {
    if (!selectedPermission) {
      AxionAlert.fire("Erro", "Selecione uma permissão para adicionar.", "error");
      return;
    }
    
    await onAddPermission(selectedPermission);
    setShowAddModal(false);
    setSelectedPermission("");
    setSearchTerm("");
  };

  const handleRemovePermission = async (permissionId, permissionName) => {
    const result = await AxionAlert.fire({
      title: "Remover Permissão?",
      text: `Deseja remover a permissão "${permissionName}" deste grupo?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, remover",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      await onRemovePermission(permissionId);
    }
  };

  return (
    <div className="group-permission-manager">
      <div className="manager-header">
        <h5 className="manager-title">
          <i className="bi bi-shield-lock-fill"></i>
          Permissões do Grupo
        </h5>
        <button
          className="btn-add-permission"
          onClick={() => setShowAddModal(true)}
          disabled={actionLoading}
        >
          <i className="bi bi-plus-lg me-2"></i> Adicionar Permissão
        </button>
      </div>

      {group.permissions?.length === 0 ? (
        <div className="empty-permissions">
          <i className="bi bi-shield-slash"></i>
          <p>Nenhuma permissão vinculada a este grupo.</p>
          <button
            className="btn-add-first"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i> Adicionar primeira permissão
          </button>
        </div>
      ) : (
        <div className="permissions-list">
          {group.permissions?.map((perm) => (
            <div key={perm.id} className="permission-item">
              <div className="permission-info">
                <div className="permission-icon">
                  <i className="bi bi-key-fill"></i>
                </div>
                <div className="permission-details">
                  <div className="permission-name">{perm.label || perm.name}</div>
                  <code className="permission-slug">{perm.name}</code>
                </div>
              </div>
              <button
                className="btn-remove"
                onClick={() => handleRemovePermission(perm.id, perm.label || perm.name)}
                disabled={actionLoading}
                title="Remover permissão"
              >
                <i className="bi bi-trash3-fill"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal para adicionar permissão */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered className="permission-modal">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-plus-circle-fill text-primary me-2"></i>
            Adicionar Permissão ao Grupo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info" className="alert-info-custom">
            <i className="bi bi-info-circle-fill me-2"></i>
            Selecione uma permissão para vincular ao grupo <strong>{group?.name}</strong>
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label className="form-label-custom">
              <i className="bi bi-search me-1"></i> Buscar Permissão
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o nome ou chave da permissão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="form-label-custom">Permissões Disponíveis</Form.Label>
            <div className="permissions-select-list">
              {filteredPermissions.length === 0 ? (
                <div className="empty-list">
                  <i className="bi bi-inbox"></i>
                  <p className="mt-2 mb-0 small">Nenhuma permissão disponível para adicionar</p>
                </div>
              ) : (
                filteredPermissions.map((perm) => (
                  <div
                    key={perm.id}
                    className={`permission-option ${selectedPermission === perm.name ? 'selected' : ''}`}
                    onClick={() => setSelectedPermission(perm.name)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="permission-option-title">{perm.label || perm.name}</div>
                        <code className="permission-option-slug">{perm.name}</code>
                      </div>
                      {selectedPermission === perm.name && (
                        <i className="bi bi-check-circle-fill permission-option-check"></i>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Form.Group>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setShowAddModal(false);
                setSelectedPermission("");
                setSearchTerm("");
              }}
              disabled={actionLoading}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleAddPermission}
              disabled={actionLoading || !selectedPermission}
            >
              {actionLoading ? <Spinner animation="border" size="sm" /> : (
                <>
                  <i className="bi bi-link me-2"></i> Vincular Permissão
                </>
              )}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
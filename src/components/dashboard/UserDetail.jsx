import React from "react";
import UserPermissionManager from "./UserPermissionManager";

export default function UserDetail({
  user, isEditing, formData, setFormData, onAction, actionLoading, 
  onBack, setIsEditing, handleSave, userPermissions, allAvailablePermissions, 
  onAddPermission, onRemovePermission
}) {
  
  const FormField = ({ label, name, type = "text", value, onChange, disabled, ...props }) => (
    <div className="form-group-wrapper">
      <label className="input-label">{label}</label>
      <input
        type={type} name={name} value={value || ""} 
        onChange={onChange} disabled={disabled}
        className="custom-input-dark" {...props}
      />
    </div>
  );

  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev, street: data.logradouro, neighborhood: data.bairro, 
          city: data.localidade, state: data.uf
        }));
      }
    } catch (err) { console.error("Erro CEP:", err); }
  };

  if (!user) return null;

  return (
    <div className="user-detail-container">
      <header className="user-detail-header">
        <div className="header-left">
          <button className="btn-back" onClick={onBack}><i className="bi bi-arrow-left me-2"></i> Voltar</button>
          <div className="vertical-divider" />
          <div className="user-title-block">
            <span className="user-name-text">{user.name}</span>
            <span className="user-id-text">ID: {user.id}</span>
          </div>
        </div>
        <div className="header-actions">
          {!isEditing ? (
            <button className="btn-edit" onClick={() => setIsEditing(true)}><i className="bi bi-pencil me-2"></i> Editar</button>
          ) : (
            <>
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
              <button className="btn-save-changes" onClick={handleSave} disabled={actionLoading}>
                {actionLoading ? "Salvando..." : "Salvar Alterações"}
              </button>
            </>
          )}
        </div>
      </header>

      <div className="detail-grid">
        <section className="info-card">
          <div className="profile-header">
            <div className="avatar-large">{user.name?.charAt(0).toUpperCase()}</div>
            <div className="profile-info">
              <h3>{formData.name}</h3>
              <span className={`badge ${user.is_admin ? "badge-success" : "badge-operacional"}`}>
                {user.is_admin ? "Administrador" : "Operacional"}
              </span>
            </div>
          </div>
          <FormField label="E-mail" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} disabled={!isEditing} />
        </section>

        <section className="info-card">
          <h4 className="card-title">Endereço de Registro</h4>
          <div className="address-grid">
            <FormField label="CEP" name="zip_code" value={formData.zip_code} onChange={(e) => setFormData({...formData, zip_code: e.target.value})} onBlur={handleCepBlur} disabled={!isEditing} />
            <FormField label="Rua" name="street" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} disabled={!isEditing} className="full-width" />
            <FormField label="Nº" name="number" value={formData.number} onChange={(e) => setFormData({...formData, number: e.target.value})} disabled={!isEditing} />
            <FormField label="Bairro" name="neighborhood" value={formData.neighborhood} onChange={(e) => setFormData({...formData, neighborhood: e.target.value})} disabled={!isEditing} />
            <FormField label="Cidade" name="city" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} disabled={!isEditing} />
            <FormField label="UF" name="state" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} disabled={!isEditing} maxLength="2" />
          </div>
        </section>
      </div>

      <UserPermissionManager {...{ user, userPermissions, allAvailablePermissions, onAddPermission, onRemovePermission, actionLoading }} />
    </div>
  );
}
import { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";

export default function GroupForm({ onSave, onCancel, loading, initialData }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("O nome do grupo é obrigatório.");
    onSave(formData);
  };

  return (
    <div className="animate-in w-100">
      {/* CABEÇALHO DE NAVEGAÇÃO */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom-theme">
        <div className="d-flex align-items-center gap-3">
          <div className="avatar-icon-bg">
            <i className="bi bi-people-fill text-white"></i>
          </div>
          <div>
            <h4 className="text-white mb-0 fw-bold">
              {initialData ? "Editar Grupo" : "Criar Novo Grupo"}
            </h4>
            <p className="text-dim small mb-0">Propriedades e finalidade do grupo operacional</p>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button 
            type="button"
            className="btn-critical-secondary px-3 py-2" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="group-form-element"
            className="btn-save-confirm px-4 py-2" 
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : <><i className="bi bi-check-lg me-2"></i> Salvar Grupo</>}
          </button>
        </div>
      </div>

      <div className="detail-grid-single">
        {/* CARD: INFORMAÇÕES DO GRUPO */}
        <section className="info-card p-4">
          <form id="group-form-element" onSubmit={handleSubmit} className="row g-4">
            
            {/* NOME DO GRUPO */}
            <div className="col-12">
              <label className="text-dim small d-block mb-2 text-uppercase fw-bold">
                Nome de Identificação
              </label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                disabled={loading}
                className="custom-input-dark w-100 fs-5 fw-semibold" 
                placeholder="Ex: SUPORTE TÉCNICO N1"
                required
              />
            </div>

            {/* DESCRIÇÃO */}
            <div className="col-12">
              <label className="text-dim small d-block mb-2 text-uppercase fw-bold">
                Finalidade / Descrição
              </label>
              <textarea 
                name="description" 
                rows={5}
                value={formData.description} 
                onChange={handleChange} 
                disabled={loading}
                className="custom-input-dark w-100 no-resize" 
                placeholder="Descreva brevemente as responsabilidades deste grupo..."
              />
            </div>
          </form>
        </section>

        {/* NOTA INFORMATIVA */}
        <div className="alert-info-dim p-3 d-flex align-items-center gap-3 mt-3">
          <i className="bi bi-info-circle-fill text-primary"></i>
          <span className="text-dim small">
            Campos obrigatórios devem ser preenchidos para garantir a indexação correta no banco de dados.
          </span>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // Estado para mostrar qual campo falhou

  const [formData, setFormData] = useState({
    cpf_cnpj: '',      // Adicionado para salvar o documento
    zip_code: '',      // CEP
    street: '',        // Rua
    number: '',        // Número
    neighborhood: '',  // Bairro
    city: '',          // Cidade
    state: '',         // UF
    complement: ''     // Opcional
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Limpa o erro do campo quando o usuário volta a digitar
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const response = await api.post('/api/v1/complete-profile', formData);
    navigate('/dashboard', { replace: true });
  } catch (error) {
    if (error.response && error.response.status === 422) {
      // Isso vai imprimir no console exatamente qual campo a API não aceitou
      console.error("Erros de Validação:", error.response.data.errors);
      
      // Transforma os erros em uma string legível para o usuário
      const messages = Object.values(error.response.data.errors).flat().join('\n');
      alert("Erro de validação:\n" + messages);
    } else {
      alert("Erro ao conectar com o servidor.");
    }
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="auth-container">
      <div className="auth-card animate-in">
        <div className="brand"><h1>Axion<span>ID</span></h1></div>
        <h3>Finalizar Cadastro</h3>
        <p className="subtitle">Preencha os dados abaixo para liberar seu acesso.</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input 
              name="cpf_cnpj" 
              placeholder="CPF ou CNPJ (apenas números)" 
              onChange={handleChange} 
              className={errors.cpf_cnpj ? 'input-error' : ''}
              required 
            />
            {errors.cpf_cnpj && <span className="error-msg">{errors.cpf_cnpj[0]}</span>}
          </div>

          <div className="input-row">
            <div className="input-group">
              <input name="zip_code" placeholder="CEP" onChange={handleChange} required />
              {errors.zip_code && <span className="error-msg">{errors.zip_code[0]}</span>}
            </div>
            <input name="state" placeholder="UF" onChange={handleChange} required style={{ width: '80px' }} />
          </div>

          <input name="street" placeholder="Endereço (Rua/Avenida)" onChange={handleChange} required />
          
          <div className="input-row">
            <input name="number" placeholder="Número" onChange={handleChange} required />
            <input name="neighborhood" placeholder="Bairro" onChange={handleChange} required />
          </div>

          <input name="city" placeholder="Cidade" onChange={handleChange} required />

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Salvando dados...' : 'Concluir e Acessar'}
          </button>
        </form>
      </div>
    </div>
  );
}
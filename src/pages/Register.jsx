import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tempKey = searchParams.get('t') || ''; 
  const isSocialRegistration = searchParams.get('from_google') === 'true';

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    google_id: '',
    cpf_cnpj: '',
    password: '',
    password_confirmation: '',
    from_google: isSocialRegistration
  });

  // 1. BUSCA DADOS E TRAVA NO ESTADO
  useEffect(() => {
    if (tempKey) {
      console.log("Tentando buscar dados para a chave:", tempKey);
      
      api.get(`/api/v1/auth/temp-data/${tempKey}`)
        .then(res => {
          // SE ESTE LOG APARECER VAZIO, O PROBLEMA É NO LARAVEL (CACHE)
          console.log("RESPOSTA DO SERVIDOR (CACHE):", res.data);

          if (res.data) {
            setFormData(prev => {
              const newData = {
                ...prev,
                name: res.data.name || '',
                email: res.data.email || '',
                google_id: res.data.google_id || ''
              };
              console.log("ESTADO ATUALIZADO COM SUCESSO:", newData);
              return newData;
            });
          }
        })
        .catch(err => {
          console.error("ERRO AO BUSCAR CACHE:", err.response?.data || err.message);
        });
    }
  }, [tempKey]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Verificação final antes do POST
    console.log("CONFERÊNCIA FINAL ANTES DE ENVIAR:", formData);

    if (!formData.name || !formData.email || !formData.google_id) {
        alert("Erro crítico: Dados do Google não encontrados no formulário. Verifique o console.");
        return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/v1/register', formData);
      alert('Sucesso!');
      navigate('/dashboard');
    } catch (error) {
      console.error("ERRO 422:", error.response?.data);
      alert("Falha no registro: " + JSON.stringify(error.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Passo {step} de 3</h2>
      <form onSubmit={handleRegister}>
        
        {step === 1 && (
          <div>
            <label>Nome:</label>
            <input name="name" value={formData.name} onChange={handleChange} readOnly={isSocialRegistration} />
            <br />
            <label>Email:</label>
            <input name="email" value={formData.email} onChange={handleChange} readOnly={isSocialRegistration} />
            <br />
            <button type="button" onClick={() => setStep(2)}>Próximo</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <label>CPF/CNPJ:</label>
            <input name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange} required />
            <br />
            <button type="button" onClick={() => setStep(1)}>Voltar</button>
            <button type="button" onClick={() => setStep(3)}>Próximo</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <label>Senha:</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            <br />
            <label>Confirme a Senha:</label>
            <input type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required />
            <br />
            <button type="button" onClick={() => setStep(2)}>Voltar</button>
            <button type="submit" disabled={loading}>FINALIZAR</button>
          </div>
        )}
      </form>
    </div>
  );
}
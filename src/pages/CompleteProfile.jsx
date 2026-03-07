export default function CompleteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    cpf_cnpj: '', zip_code: '', street: '', number: '', 
    neighborhood: '', city: '', state: '', password: '', password_confirmation: ''
  });

  const handleZipCodeBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev, street: data.logradouro, neighborhood: data.bairro,
          city: data.localidade, state: data.uf, zip_code: cep
        }));
      }
    } catch (err) { console.error("CEP error"); }
  };

  const canAdvanceStep1 = formData.cpf_cnpj.length >= 11;
  const canAdvanceStep2 = formData.zip_code && formData.street && formData.number;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="stepper-bar">
          <div className="progress" style={{ width: `${(step / 3) * 100}%`, height: '4px', background: 'var(--primary)', transition: '0.3s' }} />
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {step === 1 && (
            <div className="step">
              <h2>Identificação</h2>
              <input 
                name="cpf_cnpj" 
                value={formData.cpf_cnpj} 
                onChange={e => setFormData({...formData, cpf_cnpj: e.target.value})} 
                placeholder="CPF ou CNPJ"
              />
              <button type="button" disabled={!canAdvanceStep1} onClick={() => setStep(2)}>Próximo</button>
            </div>
          )}

          {step === 2 && (
            <div className="step">
              <h2>Endereço</h2>
              <input name="zip_code" onBlur={handleZipCodeBlur} placeholder="CEP" />
              <input name="street" value={formData.street} readOnly />
              <input name="number" placeholder="Número" onChange={e => setFormData({...formData, number: e.target.value})} />
              <div className="d-flex gap-2">
                <button onClick={() => setStep(1)}>Voltar</button>
                <button disabled={!canAdvanceStep2} onClick={() => setStep(3)}>Próximo</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step">
              <h2>Segurança</h2>
              <input type="password" placeholder="Nova Senha" onChange={e => setFormData({...formData, password: e.target.value})} />
              <input type="password" placeholder="Confirmar Senha" onChange={e => setFormData({...formData, password_confirmation: e.target.value})} />
              <button onClick={async () => {
                setLoading(true);
                try {
                   await api.post('/api/v1/complete-profile', formData);
                   navigate('/dashboard');
                } catch (err) { alert("Erro ao salvar"); }
                finally { setLoading(false); }
              }}>{loading ? 'Salvando...' : 'Finalizar'}</button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
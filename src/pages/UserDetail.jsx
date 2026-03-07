import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api.get(`/api/v1/users/${id}`)
      .then(res => setUser(res.data.data))
      .catch(() => navigate('/dashboard'));
  }, [id, navigate]);

  if (!user) return <div className="auth-container"><div className="loader"></div></div>;

  return (
    <div className="dashboard-layout">
      <div className="main-wrapper p-4">
        <button onClick={() => navigate(-1)} className="btn-primary" style={{width:'auto', marginBottom:'20px'}}>Voltar</button>
        <div className="info-card">
          <h3>Detalhes de {user.name}</h3>
          <hr style={{margin:'15px 0', borderColor:'var(--border)'}} />
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Documento:</strong> {user.cpf_cnpj}</p>
          <p><strong>Status:</strong> <span className={`badge ${user.is_active ? 'success' : 'danger'}`}>{user.is_active ? 'Ativo' : 'Inativo'}</span></p>
        </div>
      </div>
    </div>
  );
}
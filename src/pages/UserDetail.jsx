import React, { useEffect, useState } from 'react';
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

  if (!user) return <div className="p-5">Carregando...</div>;

  return (
    <div className="p-5 animate-in">
      <button onClick={() => navigate(-1)} className="btn-primary mb-4">Voltar</button>
      <div className="info-card">
        <h2>{user.name}</h2>
        <p>Email: {user.email}</p>
        <p>Documento: {user.cpf_cnpj}</p>
        <p>Status: {user.is_active ? 'Ativo' : 'Bloqueado'}</p>
      </div>
    </div>
  );
}
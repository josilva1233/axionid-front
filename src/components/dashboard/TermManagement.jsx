import { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';

export default function TermManagement() {
  const [terms, setTerms] = useState([]);
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/v1/admin/terms');
      const termsData = response.data.data || response.data;
      setTerms(Array.isArray(termsData) ? termsData : []);
      setFilteredTerms(Array.isArray(termsData) ? termsData : []);
    } catch (err) {
      console.error('Erro ao carregar termos:', err);
      setError('Erro ao carregar termos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl text-white font-bold mb-4">Gerenciamento de Termos</h1>
      {error && <p className="text-red-400">{error}</p>}
      {loading ? <p className="text-slate-400">Carregando...</p> : null}
    </div>
  );
}
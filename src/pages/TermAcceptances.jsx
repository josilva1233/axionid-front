// src/pages/TermAcceptances.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

export default function TermAcceptances() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pegar o term_id da URL se existir
  const searchParams = new URLSearchParams(location.search);
  const termId = searchParams.get('term_id');
  
  const [acceptances, setAcceptances] = useState([]);
  const [term, setTerm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAcceptances();
  }, [termId]);

  const loadAcceptances = async () => {
    setLoading(true);
    try {
      const params = termId ? { term_id: termId } : {};
      const response = await api.get('/api/v1/admin/terms/acceptances', { params });
      setAcceptances(response.data.data || []);
      
      // Se tiver termId, buscar o termo específico
      if (termId) {
        const termResponse = await api.get(`/api/v1/admin/terms/${termId}`);
        setTerm(termResponse.data);
      }
    } catch (err) {
      console.error('Erro:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/term-management');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#4D6BFE] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ← Voltar
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            👥 Usuários que aceitaram os termos
          </h1>
          {term && (
            <p className="text-sm text-slate-400 mt-1">
              Termo v{term.version} - {term.is_active ? '⭐ Ativo' : 'Inativo'}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Tabela */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        {acceptances.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <p className="text-lg">📭 Nenhum usuário aceitou os termos ainda</p>
            <p className="text-sm mt-1">Aguardando aceitações dos usuários</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">
                    Versão
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                    Data de Aceitação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {acceptances.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-slate-300 font-medium">
                          {item.user?.name || '—'}
                        </p>
                        {item.user?.is_admin && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {item.user?.email || '—'}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="px-2 py-1 text-xs bg-[#4D6BFE]/20 text-[#4D6BFE] rounded">
                        v{item.term?.version || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 hidden lg:table-cell">
                      {item.accepted_at 
                        ? new Date(item.accepted_at).toLocaleString('pt-BR')
                        : '—'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total */}
      {acceptances.length > 0 && (
        <div className="mt-4 text-sm text-slate-400">
          Total: {acceptances.length} usuário(s)
        </div>
      )}
    </div>
  );
}
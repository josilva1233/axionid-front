// src/components/TermsCheck.jsx

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

export default function TermsCheck({ children }) {
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [termContent, setTermContent] = useState(null);
  const [termId, setTermId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Rotas que não precisam verificar termos
  const excludedRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

  useEffect(() => {
    if (excludedRoutes.includes(location.pathname)) {
      setLoading(false);
      return;
    }

    checkTermsStatus();
  }, [location.pathname]);

  const checkTermsStatus = async () => {
    try {
      const response = await api.get('/api/v1/terms/check');
      const data = response.data;

      if (data.needs_acceptance) {
        setNeedsAcceptance(true);
        setTermContent(data.term.content);
        setTermId(data.term.id);
      } else {
        setNeedsAcceptance(false);
      }
    } catch (err) {
      console.error('Erro ao verificar termos:', err);
      // Se não autenticado, não bloqueia
      if (err.response?.status === 401) {
        setNeedsAcceptance(false);
      } else {
        setError('Erro ao verificar termos de uso');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!termId) {
      setError('Termo inválido');
      return;
    }

    setAccepting(true);
    setError('');

    try {
      await api.post('/api/v1/terms/accept', { term_id: termId });
      setNeedsAcceptance(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao aceitar os termos');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-[#4D6BFE] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Verificando termos de uso...</p>
        </div>
      </div>
    );
  }

  // Se não precisa aceitar, renderiza os filhos
  if (!needsAcceptance) {
    return children;
  }

  // Tela de aceitação dos termos
  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900 px-4 py-3 overflow-y-auto">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#4D6BFE] flex items-center justify-center text-white font-black text-lg shadow-md">
            A
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Axion<span className="text-[#4D6BFE]">ID</span>
          </span>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-xl p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-white">Termos de Uso</h2>
            <p className="text-slate-400 text-sm mt-1">
              Leia atentamente os termos abaixo antes de continuar
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {/* Conteúdo dos Termos */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <div className="prose prose-invert prose-sm max-w-none">
              {termContent ? (
                <div className="text-slate-300 whitespace-pre-wrap">{termContent}</div>
              ) : (
                <p className="text-slate-400 text-center">Carregando termos...</p>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                // Logout se não aceitar
                api.post('/api/v1/logout').finally(() => {
                  localStorage.clear();
                  navigate('/login');
                });
              }}
              className="flex-1 py-2 px-4 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/50 rounded-lg text-slate-300 text-sm font-medium transition-colors"
            >
              Sair da Plataforma
            </button>

            <button
              onClick={handleAccept}
              disabled={accepting}
              className="flex-1 py-2 px-4 bg-[#4D6BFE] hover:bg-[#3D5AFE] active:bg-[#2E4BDB] text-white font-medium text-sm rounded-lg transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {accepting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Aceitando...</span>
                </>
              ) : (
                'Aceitar Termos de Uso'
              )}
            </button>
          </div>

          <p className="text-center text-xs text-slate-500">
            Ao aceitar, você concorda com os termos e políticas descritos acima
          </p>
        </div>
      </div>
    </div>
  );
}
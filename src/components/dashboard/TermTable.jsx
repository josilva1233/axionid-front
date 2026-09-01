// src/components/dashboard/TermTable.jsx
import React from 'react';

export default function TermTable({
  terms,
  acceptanceCounts,
  onViewUsers,
  onToggleStatus,
  onEdit,
  onDelete,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '150ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!terms || terms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <span className="text-5xl mb-4 opacity-60">📭</span>
        <p className="text-sm">Nenhum termo cadastrado.</p>
        <p className="text-xs text-slate-600 mt-1">Clique em "Novo Termo" para criar o primeiro.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] table-fixed">
        <thead className="bg-slate-800/80 sticky top-0 z-10">
          <tr>
            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[150px]">
              Versão
            </th>
            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[120px]">
              Status
            </th>
            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap hidden md:table-cell">
              Criado por
            </th>
            <th className="px-[18px] py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap hidden lg:table-cell w-[130px]">
              Data
            </th>
            <th className="px-[18px] py-4 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[130px]">
              Usuários
            </th>
            <th className="px-[18px] py-4 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b-2 border-slate-700/50 whitespace-nowrap w-[200px]">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {terms.map((term) => {
            const acceptanceCount = acceptanceCounts[term.id] || 0;
            return (
              <tr key={term.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-all">
                <td className="px-[18px] py-3.5 align-middle">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-sm font-medium ${
                      term.is_active ? 'text-blue-400' : 'text-slate-300'
                    }`}>
                      v{term.version}
                    </span>
                    {term.is_active && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-green-500/20 text-green-400 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        Ativo
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-[18px] py-3.5 align-middle">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    term.is_active 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-slate-700/50 text-slate-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      term.is_active ? 'bg-green-400 animate-pulse' : 'bg-slate-400'
                    }`}></span>
                    {term.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-[18px] py-3.5 align-middle text-slate-300 hidden md:table-cell">
                  {term.creator?.name || '—'}
                </td>
                <td className="px-[18px] py-3.5 align-middle text-slate-400 hidden lg:table-cell">
                  {formatDate(term.created_at)}
                </td>
                <td className="px-[18px] py-3.5 align-middle text-center">
                  <button
                    onClick={() => onViewUsers(term.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg transition-all"
                  >
                    <span>{acceptanceCount}</span>
                    <span>usuário{acceptanceCount !== 1 ? 's' : ''}</span>
                  </button>
                </td>
                <td className="px-[18px] py-3.5 align-middle text-right">
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <button
                      onClick={() => onViewUsers(term.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-all"
                      title="Ver usuários que aceitaram"
                    >
                      👥 Ver
                    </button>
                    <button
                      onClick={() => onToggleStatus(term)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                        term.is_active
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      {term.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => onEdit(term)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-all"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => onDelete(term.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                        acceptanceCount > 0
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                      }`}
                      disabled={acceptanceCount === 0}
                      title={acceptanceCount === 0 ? 'Não é possível excluir um termo que já foi aceito' : 'Excluir termo'}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                  {acceptanceCount > 0 && (
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 justify-end">
                      <span>⚠️</span>
                      <span>{acceptanceCount} aceitaram</span>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
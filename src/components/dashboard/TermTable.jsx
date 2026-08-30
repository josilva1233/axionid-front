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
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#4D6BFE] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Carregando termos...</p>
        </div>
      </div>
    );
  }

  if (!terms || terms.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-lg text-slate-400 font-medium">Nenhum termo cadastrado</p>
        <p className="text-sm text-slate-500 mt-1">Clique em "Novo Termo" para criar o primeiro.</p>
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
      <table className="w-full min-w-[800px]">
        <thead className="bg-slate-700/50 border-b border-slate-700/50">
          <tr>
            <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Versão
            </th>
            <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">
              Criado por
            </th>
            <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">
              Data
            </th>
            <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Usuários
            </th>
            <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/30">
          {terms.map((term) => {
            const acceptanceCount = acceptanceCounts[term.id] || 0;
            return (
              <tr key={term.id} className="hover:bg-slate-700/30 transition-colors group">
                <td className="px-4 md:px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      term.is_active ? 'text-[#4D6BFE]' : 'text-slate-300'
                    }`}>
                      v{term.version}
                    </span>
                    {term.is_active && (
                      <span className="inline-block px-2 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded-full animate-pulse">
                        ● Ativo
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full ${
                    term.is_active 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      term.is_active ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                    }`}></span>
                    {term.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 md:px-6 py-4 text-sm text-slate-300 hidden md:table-cell">
                  {term.creator?.name || '—'}
                </td>
                <td className="px-4 md:px-6 py-4 text-sm text-slate-400 hidden lg:table-cell">
                  {formatDate(term.created_at)}
                </td>
                <td className="px-4 md:px-6 py-4">
                  <button
                    onClick={() => onViewUsers(term.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4D6BFE]/10 hover:bg-[#4D6BFE]/20 text-[#4D6BFE] text-xs rounded-lg transition-colors group/btn"
                  >
                    <span className="font-medium">{acceptanceCount}</span>
                    <span>usuário{acceptanceCount !== 1 ? 's' : ''}</span>
                    <svg 
                      className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </td>
                <td className="px-4 md:px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => onViewUsers(term.id)}
                      className="px-2.5 py-1 text-xs bg-[#4D6BFE]/20 text-[#4D6BFE] hover:bg-[#4D6BFE]/30 rounded transition-colors flex items-center gap-1"
                      title="Ver usuários que aceitaram"
                    >
                      <span className="text-sm">👥</span>
                      Ver
                    </button>
                    <button
                      onClick={() => onToggleStatus(term)}
                      className={`px-2.5 py-1 text-xs rounded transition-colors ${
                        term.is_active
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      {term.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      onClick={() => onEdit(term)}
                      className="px-2.5 py-1 text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => onDelete(term.id)}
                      className={`px-2.5 py-1 text-xs rounded transition-colors ${
                        acceptanceCount > 0
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={acceptanceCount === 0}
                      title={acceptanceCount === 0 ? 'Não é possível excluir um termo que já foi aceito' : ''}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                  {acceptanceCount > 0 && (
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{acceptanceCount} usuário{acceptanceCount !== 1 ? 's' : ''} aceitaram</span>
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
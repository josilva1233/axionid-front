import React from 'react';

export default function CategoryTable({
  categories,
  loading,
  onViewDetail,
  onDelete,
  isDark = false,
}) {
  const bgTable = isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200';
  const bgHeader = isDark ? 'bg-slate-800/80' : 'bg-gray-100/80';
  const textHeader = isDark ? 'text-slate-400 border-slate-700/50' : 'text-gray-500 border-gray-200';
  const borderRow = isDark ? 'border-slate-700/30 hover:bg-slate-800/30' : 'border-gray-100 hover:bg-gray-50';

  return (
    <div className={`overflow-x-auto rounded-xl border transition-colors hover:border-blue-500/30 ${bgTable}`}>
      <table className="w-full border-collapse text-sm min-w-[700px]">
        <thead className={`sticky top-0 z-10 ${bgHeader}`}>
          <tr>
            <th className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 ${textHeader}`}>ID</th>
            <th className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 ${textHeader}`}>Nome</th>
            <th className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 ${textHeader}`}>Descrição</th>
            <th className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide border-b-2 ${textHeader}`}>Grupo Padrão</th>
            <th className={`px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide border-b-2 ${textHeader}`}>SLA (1ª resp)</th>
            <th className={`px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide border-b-2 ${textHeader}`}>SLA (resolução)</th>
            <th className={`px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide border-b-2 ${textHeader}`}>Prioridade</th>
            <th className={`px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wide border-b-2 ${textHeader}`}>Status</th>
            <th className={`px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide border-b-2 ${textHeader}`}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => {
            const indent = '—'.repeat(cat.level || 0);
            const isActive = cat.is_active;
            const bgStatus = isActive
              ? isDark ? 'bg-green-500/15 text-green-400' : 'bg-green-100 text-green-700'
              : isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-100 text-red-700';
            return (
              <tr key={cat.id} className={`border-b transition-all ${borderRow}`}>
                <td className="px-4 py-3 align-middle font-mono text-sm">{cat.id}</td>
                <td className="px-4 py-3 align-middle">
                  <span className="font-medium">{indent} {cat.name}</span>
                  {cat.children?.length > 0 && <span className="ml-2 text-xs text-blue-400">({cat.children.length} sub)</span>}
                </td>
                <td className="px-4 py-3 align-middle text-xs truncate max-w-[150px]">{cat.description || '-'}</td>
                <td className="px-4 py-3 align-middle text-xs">{cat.default_group?.name || '-'}</td>
                <td className="px-4 py-3 align-middle text-center text-xs font-mono">{cat.sla_first_response_hours}h</td>
                <td className="px-4 py-3 align-middle text-center text-xs font-mono">{cat.sla_resolution_hours}h</td>
                <td className="px-4 py-3 align-middle text-center text-xs font-medium uppercase">{cat.default_priority}</td>
                <td className="px-4 py-3 align-middle text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${bgStatus}`}>
                    {isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle text-right">
                  <button onClick={() => onViewDetail(cat)} className="text-blue-400 hover:text-blue-300 mr-2">✏️</button>
                  <button onClick={() => onDelete(cat.id)} className="text-red-400 hover:text-red-300">🗑️</button>
                </td>
              </tr>
            );
          })}
          {categories.length === 0 && !loading && (
            <tr>
              <td colSpan="9" className="py-8 text-center text-slate-400">Nenhuma categoria cadastrada.</td>
            </tr>
          )}
          {loading && (
            <tr>
              <td colSpan="9" className="py-8 text-center text-slate-400">Carregando...</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
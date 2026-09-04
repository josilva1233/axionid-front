import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';

export default function CategoryForm({
  category = null, // se null, é criação
  onSuccess,
  onCancel,
  isDark = false,
}) {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: '',
    default_group_id: '',
    sla_first_response_hours: 4,
    sla_resolution_hours: 24,
    default_priority: 'medium',
    is_active: true,
  });

  const AxionAlert = Swal.mixin({
    background: isDark ? '#111214' : '#ffffff',
    color: isDark ? '#ffffff' : '#1f2937',
    confirmButtonColor: '#6366f1',
    customClass: {
      popup: `border ${isDark ? 'border-slate-700' : 'border-gray-200'} rounded-xl`,
      confirmButton: 'px-4 py-2 rounded-full font-bold bg-indigo-500 hover:bg-indigo-400',
      cancelButton: 'px-4 py-2 rounded-full font-bold bg-slate-700 hover:bg-slate-600',
    },
  });

  // Carregar dados iniciais (grupos e categorias pai)
  useEffect(() => {
    const loadAux = async () => {
      try {
        const [groupsRes, catsRes] = await Promise.all([
          api.get('/api/v1/groups'),
          api.get('/api/v1/categories'),
        ]);
        setGroups(groupsRes.data.data || []);
        // Filtra a própria categoria (para evitar auto-referência)
        let cats = catsRes.data || [];
        if (category) {
          cats = cats.filter(c => c.id !== category.id);
        }
        setParentOptions(cats);
      } catch (err) {
        console.error('Erro ao carregar dados auxiliares', err);
      }
    };
    loadAux();
  }, [category]);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parent_id: category.parent_id || '',
        default_group_id: category.default_group_id || '',
        sla_first_response_hours: category.sla_first_response_hours || 4,
        sla_resolution_hours: category.sla_resolution_hours || 24,
        default_priority: category.default_priority || 'medium',
        is_active: category.is_active !== undefined ? category.is_active : true,
      });
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData };
      payload.sla_first_response_hours = parseInt(payload.sla_first_response_hours);
      payload.sla_resolution_hours = parseInt(payload.sla_resolution_hours);
      payload.is_active = Boolean(payload.is_active);

      if (category) {
        await api.put(`/api/v1/admin/categories/${category.id}`, payload);
      } else {
        await api.post('/api/v1/admin/categories', payload);
      }
      AxionAlert.fire('Sucesso!', category ? 'Categoria atualizada.' : 'Categoria criada.', 'success');
      if (onSuccess) onSuccess();
    } catch (err) {
      AxionAlert.fire('Erro', err.response?.data?.message || 'Falha ao salvar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const bgCard = isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200';
  const textLabel = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgInput = isDark
    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder-slate-500'
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400';
  const btnCancel = isDark
    ? 'text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50'
    : 'text-gray-600 hover:text-gray-800 bg-gray-200 hover:bg-gray-300';

  return (
    <div className={`border rounded-xl p-6 mb-6 transition-colors hover:border-blue-500/30 ${bgCard}`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {category ? '✏️ Editar Categoria' : '➕ Nova Categoria'}
        </h4>
        <button onClick={onCancel} className={`text-xs font-medium px-3 py-1.5 rounded-full ${btnCancel}`} disabled={loading}>✕ Fechar</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 block ${textLabel}`}>Nome *</label>
            <input type="text" className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50`}
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required disabled={loading} />
          </div>
          <div>
            <label className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 block ${textLabel}`}>Categoria Pai</label>
            <select className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50`}
              value={formData.parent_id} onChange={e => setFormData({...formData, parent_id: e.target.value})} disabled={loading}>
              <option value="">Nenhuma (raiz)</option>
              {parentOptions.map(p => (
                <option key={p.id} value={p.id}>{'—'.repeat(p.level || 0)} {p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 block ${textLabel}`}>Descrição</label>
          <textarea rows={2} className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50`}
            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} disabled={loading} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 block ${textLabel}`}>Grupo Padrão</label>
            <select className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50`}
              value={formData.default_group_id} onChange={e => setFormData({...formData, default_group_id: e.target.value})} disabled={loading}>
              <option value="">Nenhum</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div>
            <label className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 block ${textLabel}`}>Prioridade Padrão</label>
            <select className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50`}
              value={formData.default_priority} onChange={e => setFormData({...formData, default_priority: e.target.value})} disabled={loading}>
              <option value="low">🔵 Baixa</option>
              <option value="medium">🟡 Média</option>
              <option value="high">🟠 Alta</option>
              <option value="urgent">🔴 Urgente</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 block ${textLabel}`}>SLA 1ª Resposta (horas)</label>
            <input type="number" min="1" max="720" className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50`}
              value={formData.sla_first_response_hours} onChange={e => setFormData({...formData, sla_first_response_hours: e.target.value})} required disabled={loading} />
          </div>
          <div>
            <label className={`text-[11px] font-semibold uppercase tracking-wide mb-1.5 block ${textLabel}`}>SLA Resolução (horas)</label>
            <input type="number" min="1" max="720" className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50`}
              value={formData.sla_resolution_hours} onChange={e => setFormData({...formData, sla_resolution_hours: e.target.value})} required disabled={loading} />
          </div>
          <div className="flex items-center">
            <label className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              <input type="checkbox" className="w-4 h-4 accent-blue-500"
                checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} disabled={loading} />
              Ativo
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/50">
          <button type="button" className={`px-5 py-2 rounded-full text-sm font-medium ${btnCancel}`} onClick={onCancel} disabled={loading}>Cancelar</button>
          <button type="submit" className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition disabled:opacity-50" disabled={loading}>
            {loading ? 'Salvando...' : category ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </form>
    </div>
  );
}
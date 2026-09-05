// components/dashboard/ServiceOrderForm.jsx
import { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

export default function ServiceOrderForm({
  groups: groupsProp,
  onSuccess,
  onCancel,
  isDark = false,
}) {
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [canCreateForOthers, setCanCreateForOthers] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    group_id: "",
    category_id: "",
    user_id: "",
    attachment: null,
  });

  const AxionAlert = Swal.mixin({
    background: isDark ? "#111214" : "#ffffff",
    color: isDark ? "#ffffff" : "#1f2937",
    confirmButtonColor: "#6366f1",
    customClass: {
      popup: `border ${isDark ? 'border-slate-700' : 'border-gray-200'} rounded-xl`,
      confirmButton: "px-4 py-2 rounded-full font-bold mx-2 bg-indigo-500 hover:bg-indigo-400 transition-colors",
      cancelButton: "px-4 py-2 rounded-full font-bold mx-2 bg-slate-700 hover:bg-slate-600 transition-colors",
    },
  });

  // ============ CLASSES DE TEMA ============
  const bgCard = isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200';
  const textHeading = isDark ? 'text-white' : 'text-gray-800';
  const textLabel = isDark ? 'text-slate-400' : 'text-gray-500';
  const textMuted = isDark ? 'text-slate-400' : 'text-gray-500';
  const bgInput = isDark
    ? 'bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder-slate-500'
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400';
  const borderColor = isDark ? 'border-slate-700/50' : 'border-gray-200';
  const focusRing = 'focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50';
  const textFile = isDark ? 'text-green-400' : 'text-green-600';
  const btnCancel = isDark
    ? 'text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50'
    : 'text-gray-600 hover:text-gray-800 bg-gray-200 hover:bg-gray-300';

  // ============ CARREGAR DADOS ============

  // Categorias
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await api.get('/api/v1/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Erro ao carregar categorias', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Grupos
  useEffect(() => {
    if (groupsProp && Array.isArray(groupsProp) && groupsProp.length > 0) {
      setGroups(groupsProp);
      return;
    }

    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const response = await api.get("/api/v1/service-orders/groups/available");
        let groupsData = [];
        if (response.data && response.data.data) {
          groupsData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          groupsData = response.data;
        }
        if (!Array.isArray(groupsData)) groupsData = [];
        setGroups(groupsData);
      } catch (error) {
        setGroups([]);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, [groupsProp]);

  // Usuários (apenas se tiver permissão)
  useEffect(() => {
    const checkPermissionAndLoadUsers = async () => {
      try {
        // Verificar permissão via API (ou via hook usePermissions)
        const res = await api.get('/api/v1/me/permissions');
        const perms = res.data.permissions || [];
        const hasPermission = perms.includes('orders.create_for_others') || perms.includes('*');
        setCanCreateForOthers(hasPermission);

        if (hasPermission) {
          setLoadingUsers(true);
          const usersRes = await api.get('/api/v1/admin/users?per_page=1000');
          setUsers(usersRes.data.data || []);
          setLoadingUsers(false);
        }
      } catch (err) {
        console.error('Erro ao verificar permissões', err);
        setCanCreateForOthers(false);
      }
    };
    checkPermissionAndLoadUsers();
  }, []);

  // ============ HANDLERS ============

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      AxionAlert.fire("Erro", "O título é obrigatório.", "error");
      return;
    }
    if (!formData.description.trim()) {
      AxionAlert.fire("Erro", "A descrição é obrigatória.", "error");
      return;
    }
    if (!formData.category_id) {
      AxionAlert.fire("Erro", "Selecione uma categoria.", "error");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("priority", formData.priority);
      data.append("category_id", formData.category_id);
      if (formData.group_id) data.append("group_id", formData.group_id);
      if (formData.user_id) data.append("user_id", formData.user_id);
      if (formData.attachment) data.append("attachment", formData.attachment);

      const response = await api.post("/api/v1/service-orders", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      AxionAlert.fire({
        icon: "success",
        title: "Chamado criado!",
        text: `Protocolo: ${response.data.protocol || response.data.id}`,
        timer: 2000,
        showConfirmButton: false,
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      AxionAlert.fire(
        "Erro",
        err.response?.data?.message || "Não foi possível criar o chamado.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        AxionAlert.fire("Erro", "Arquivo muito grande. Máximo 5MB.", "error");
        e.target.value = "";
        return;
      }
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        AxionAlert.fire("Erro", "Apenas arquivos PDF, JPG ou PNG são permitidos.", "error");
        e.target.value = "";
        return;
      }
      setFormData({ ...formData, attachment: file });
    }
  };

  const groupsArray = Array.isArray(groups) ? groups : [];

  return (
    <div className={`border rounded-xl p-6 mb-6 transition-colors hover:border-blue-500/30 ${bgCard}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className={`text-sm font-bold flex items-center gap-2 ${textHeading}`}>
          ➕ Abrir Novo Chamado
        </h4>
        <button
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${btnCancel}`}
          onClick={onCancel}
          disabled={loading}
        >
          ✕ Fechar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Categoria */}
        <div>
          <label className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${textLabel}`}>
            <span className="text-blue-500">●</span>
            Categoria <span className="text-red-400">*</span>
          </label>
          <select
            className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm ${focusRing} transition-all appearance-none`}
            value={formData.category_id}
            onChange={(e) => {
              const catId = e.target.value;
              const cat = categories.find(c => c.id === parseInt(catId));
              setFormData({
                ...formData,
                category_id: catId,
                priority: cat?.default_priority || 'medium',
                group_id: cat?.default_group_id || '',
              });
            }}
            disabled={loading || loadingCategories}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {'—'.repeat(cat.level || 0)} {cat.name}
              </option>
            ))}
          </select>
          {loadingCategories && <span className="text-xs text-slate-400">Carregando categorias...</span>}
        </div>

        {/* Título */}
        <div>
          <label className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${textLabel}`}>
            <span className="text-blue-500">●</span>
            Título do Chamado <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm ${focusRing} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="Ex: Problema com acesso ao sistema..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        {/* Descrição */}
        <div>
          <label className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${textLabel}`}>
            <span className="text-blue-500">●</span>
            Descrição <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={5}
            className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm ${focusRing} transition-all resize-y disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="Descreva detalhadamente o problema..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        {/* Campos de prioridade, grupo e solicitante */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${textLabel}`}>
              <span className="text-blue-500">●</span>
              Prioridade
            </label>
            <select
              className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm ${focusRing} transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              disabled={loading}
            >
              <option value="low">🔵 Baixa</option>
              <option value="medium">🟡 Média</option>
              <option value="high">🟠 Alta</option>
              <option value="urgent">🔴 Urgente</option>
            </select>
          </div>

          <div>
            <label className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${textLabel}`}>
              <span className="text-blue-500">●</span>
              Grupo Responsável
            </label>
            <select
              className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm ${focusRing} transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
              value={formData.group_id}
              onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
              disabled={loading || loadingGroups}
            >
              <option value="">Selecionar grupo (opcional)</option>
              {loadingGroups ? (
                <option value="" disabled>⏳ Carregando grupos...</option>
              ) : groupsArray.length === 0 ? (
                <option value="" disabled>❌ Nenhum grupo disponível</option>
              ) : (
                groupsArray.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))
              )}
            </select>
            {loadingGroups && <span className={`text-xs ml-1 ${textMuted}`}>Carregando...</span>}
          </div>

          {/* 🔥 CAMPO DE SOLICITANTE (visível apenas com permissão) */}
          {canCreateForOthers && (
            <div>
              <label className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${textLabel}`}>
                <span className="text-blue-500">●</span>
                Solicitante (opcional)
              </label>
              <select
                className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm ${focusRing} transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                disabled={loading || loadingUsers}
              >
                <option value="">Mesmo usuário (eu)</option>
                {loadingUsers ? (
                  <option value="" disabled>⏳ Carregando usuários...</option>
                ) : (
                  users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))
                )}
              </select>
              {loadingUsers && <span className={`text-xs ml-1 ${textMuted}`}>Carregando...</span>}
              <p className={`text-[10px] ${textMuted} mt-1`}>Apenas administradores e técnicos autorizados podem escolher outro usuário.</p>
            </div>
          )}
        </div>

        {/* Anexo */}
        <div>
          <label className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide mb-1.5 ${textLabel}`}>
            <span className="text-blue-500">●</span>
            Anexo (PDF, JPG, PNG - máx 5MB)
          </label>
          <input
            type="file"
            className={`w-full px-3 py-2.5 ${bgInput} rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${textLabel}`}
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={loading}
          />
          {formData.attachment && (
            <div className={`mt-2 flex items-center gap-2 text-sm ${textFile}`}>
              <span>✅</span>
              <span>Arquivo: <strong>{formData.attachment.name}</strong></span>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className={`flex flex-wrap items-center justify-end gap-3 mt-6 pt-4 border-t ${borderColor}`}>
          <button
            type="button"
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${btnCancel}`}
            onClick={onCancel}
            disabled={loading}
          >
            ✕ Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Criando...
              </>
            ) : (
              <>✅ Criar Chamado</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
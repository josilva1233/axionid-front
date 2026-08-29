// components/dashboard/ServiceOrderForm.jsx
import { useState, useEffect } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

export default function ServiceOrderForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groups, setGroups] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    group_id: "",
    attachment: null,
  });

  const AxionAlert = Swal.mixin({
    background: "#111214",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
    customClass: {
      popup: "border border-slate-700 rounded-xl",
      confirmButton: "px-4 py-2 rounded-full font-bold mx-2 bg-indigo-500 hover:bg-indigo-400 transition-colors",
      cancelButton: "px-4 py-2 rounded-full font-bold mx-2 bg-slate-700 hover:bg-slate-600 transition-colors",
    },
  });

  // 🔥 CARREGAR GRUPOS AO ABRIR O FORMULÁRIO
  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        console.log("🔄 Buscando grupos disponíveis...");
        const response = await api.get("/service-orders/groups/available");
        console.log("✅ Resposta da API:", response.data);
        
        const groupsData = response.data.data || response.data || [];
        setGroups(groupsData);
        
        if (groupsData.length === 0) {
          console.warn("⚠️ Nenhum grupo encontrado!");
          // 🔥 Fallback: dados mock para teste
          setGroups([
            { id: 1, name: "Grupo Financeiro" },
            { id: 2, name: "Suporte Técnico" },
            { id: 3, name: "Administrativo" },
            { id: 4, name: "Infraestrutura" },
            { id: 5, name: "Desenvolvimento" },
          ]);
        } else {
          console.log(`📊 ${groupsData.length} grupos carregados`);
        }
      } catch (error) {
        console.error("❌ Erro ao carregar grupos:", error);
        console.error("Detalhes:", error.response?.data);
        // 🔥 Fallback: usar dados mock
        setGroups([
          { id: 1, name: "Grupo Financeiro" },
          { id: 2, name: "Suporte Técnico" },
          { id: 3, name: "Administrativo" },
          { id: 4, name: "Infraestrutura" },
          { id: 5, name: "Desenvolvimento" },
        ]);
      } finally {
        setLoadingGroups(false);
      }
    };
    
    fetchGroups();
  }, []);

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

    setLoading(true);
    
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("priority", formData.priority);
      if (formData.group_id) {
        data.append("group_id", formData.group_id);
        console.log("📌 Grupo selecionado:", formData.group_id);
      }
      if (formData.attachment) {
        data.append("attachment", formData.attachment);
      }
      
      console.log("📤 Enviando dados:", {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        group_id: formData.group_id,
        attachment: formData.attachment?.name || "Nenhum"
      });

      const response = await api.post("/service-orders", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log("✅ Chamado criado:", response.data);
      
      AxionAlert.fire({
        icon: "success",
        title: "Chamado criado!",
        text: `Protocolo: ${response.data.protocol || response.data.id}`,
        timer: 2000,
        showConfirmButton: false,
      });
      
      if (onSuccess) onSuccess();
      
    } catch (err) {
      console.error("❌ Erro ao criar OS:", err);
      console.error("Detalhes:", err.response?.data);
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

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6 transition-colors hover:border-blue-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          ➕ Abrir Novo Chamado
        </h4>
        <button
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 transition-all"
          onClick={onCancel}
          disabled={loading}
        >
          ✕ Fechar
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            <span className="text-blue-500">●</span>
            Título do Chamado <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Ex: Problema com acesso ao sistema, Solicitação de equipamento..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            <span className="text-blue-500">●</span>
            Descrição <span className="text-red-400">*</span>
          </label>
          <textarea
            rows={4}
            className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-y disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Descreva detalhadamente o problema ou solicitação..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        {/* Prioridade e Grupo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              <span className="text-blue-500">●</span>
              Prioridade
            </label>
            <select
              className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
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
            <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
              <span className="text-blue-500">●</span>
              Grupo Responsável
            </label>
            <select
              className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              value={formData.group_id}
              onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
              disabled={loading || loadingGroups}
            >
              <option value="">Selecionar grupo (opcional)</option>
              {loadingGroups ? (
                <option value="" disabled>⏳ Carregando grupos...</option>
              ) : groups.length === 0 ? (
                <option value="" disabled>❌ Nenhum grupo disponível</option>
              ) : (
                groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))
              )}
            </select>
            {loadingGroups && (
              <span className="text-xs text-slate-400 ml-1">Carregando...</span>
            )}
          </div>
        </div>

        {/* Anexo */}
        <div>
          <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            <span className="text-blue-500">●</span>
            Anexo (PDF, JPG, PNG - máx 5MB)
          </label>
          <input
            type="file"
            className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={loading}
          />
          {formData.attachment && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-400">
              <span>✅</span>
              <span>Arquivo selecionado: <strong>{formData.attachment.name}</strong></span>
              <span className="text-slate-400 text-xs">
                ({(formData.attachment.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-wrap items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-700/50">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-600/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onCancel}
            disabled={loading}
          >
            ✕ Cancelar
          </button>
          
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Criando...
              </>
            ) : (
              <>
                ✅ Criar Chamado
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
import { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import api from "../services/api";

// --- Configurações de status e prioridade (já existentes) ---
const STATUS_CONFIG = {
  pending: { bg: "bg-yellow-500/15", text: "text-yellow-400", dot: "bg-yellow-400", label: "PENDENTE", icon: "⏳" },
  open: { bg: "bg-blue-500/15", text: "text-blue-400", dot: "bg-blue-400", label: "EM ABERTO", icon: "📂" },
  in_progress: { bg: "bg-indigo-500/15", text: "text-indigo-400", dot: "bg-indigo-400", label: "EM ATENDIMENTO", icon: "🔧" },
  resolved: { bg: "bg-green-500/15", text: "text-green-400", dot: "bg-green-400", label: "RESOLVIDO", icon: "✅" },
  closed: { bg: "bg-slate-700/30", text: "text-slate-400", dot: "bg-slate-400", label: "FECHADO", icon: "🔒" },
};

const PRIORITY_CONFIG = {
  low: { bg: "bg-green-500/15", text: "text-green-400", dot: "bg-green-400", label: "Baixa", icon: "🔵" },
  medium: { bg: "bg-blue-500/15", text: "text-blue-400", dot: "bg-blue-400", label: "Média", icon: "🟡" },
  high: { bg: "bg-orange-500/15", text: "text-orange-400", dot: "bg-orange-400", label: "Alta", icon: "🟠" },
  urgent: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-400", label: "URGENTE", icon: "🔴" },
};

// --- Badges (mantidos) ---
const StatusBadge = ({ status }) => {
  const item = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm ${item.bg} ${item.text}`}>
      <span>{item.icon}</span> {item.label}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  const item = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low;
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm ${item.bg} ${item.text}`}>
      <span>{item.icon}</span> {item.label}
    </span>
  );
};

// --- Componente de anexo (mantido) ---
const AttachmentPreview = ({ order, baseUrl }) => {
  const fileName = order.attachment_path?.split("/").pop() || "anexo";
  const fullUrl = `${baseUrl}/storage/${order.attachment_path}`;

  if (!order.attachment_path) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-700/50">
      <h6 className="text-blue-400 mb-3 font-bold flex items-center gap-2">
        <span>📎</span> Anexo da Solicitação
      </h6>
      <div className="bg-slate-800/30 rounded-2xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-blue-400 text-4xl">📄</span>
            <div>
              <h6 className="text-white font-bold mb-1">{fileName}</h6>
              <small className="text-slate-400">
                {order.attachment_path?.includes('.pdf') ? 'Documento PDF' : 'Arquivo anexado'}
              </small>
            </div>
          </div>
          <a
            href={fullUrl}
            download={fileName}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            ⬇️ Download
          </a>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function ServiceOrderDetail({
  order,
  onBack,
  onUpdateStatus,
  onDeleteOrder,
  actionLoading,
  isSystemAdmin,
}) {
  const baseUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "http://163.176.168.224";

  // ----- Estados para mensagens -----
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // ----- Carregar mensagens -----
  const loadMessages = useCallback(async () => {
    if (!order?.id) return;
    setLoadingMessages(true);
    try {
      const res = await api.get(`/api/v1/service-orders/${order.id}/messages`);
      const data = res.data.data || res.data;
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      Swal.fire("Erro", "Não foi possível carregar as mensagens.", "error");
    } finally {
      setLoadingMessages(false);
    }
  }, [order?.id]);

  // ----- Enviar mensagem -----
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;
    setSendingMessage(true);
    try {
      const res = await api.post(`/api/v1/service-orders/${order.id}/messages`, {
        message: newMessage.trim(),
      });
      const newMsg = res.data.data || res.data;
      setMessages(prev => [newMsg, ...prev]); // adiciona no topo (mais recente)
      setNewMessage("");
      Swal.fire({
        icon: "success",
        title: "Mensagem enviada!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      Swal.fire("Erro", error.response?.data?.message || "Falha ao enviar mensagem.", "error");
    } finally {
      setSendingMessage(false);
    }
  }, [newMessage, order?.id]);

  // ----- Atualizar mensagem -----
  const updateMessage = useCallback(async (messageId, newText) => {
    if (!newText.trim()) return;
    try {
      const res = await api.put(`/api/v1/service-orders/${order.id}/messages/${messageId}`, {
        message: newText.trim(),
      });
      const updated = res.data.data || res.data;
      setMessages(prev =>
        prev.map(msg => (msg.id === messageId ? updated : msg))
      );
      setEditingMessageId(null);
      setEditMessageText("");
      Swal.fire({
        icon: "success",
        title: "Mensagem atualizada!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Erro ao atualizar mensagem:", error);
      Swal.fire("Erro", error.response?.data?.message || "Falha ao atualizar mensagem.", "error");
    }
  }, [order?.id]);

  // ----- Excluir mensagem -----
  const deleteMessage = useCallback(async (messageId) => {
    const result = await Swal.fire({
      title: "Excluir mensagem?",
      text: "Esta ação não pode ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      background: "#111214",
      color: "#ffffff",
      confirmButtonColor: "#6366f1",
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/v1/service-orders/${order.id}/messages/${messageId}`);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      Swal.fire({
        icon: "success",
        title: "Mensagem removida!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Erro ao excluir mensagem:", error);
      Swal.fire("Erro", error.response?.data?.message || "Falha ao excluir mensagem.", "error");
    }
  }, [order?.id]);

  // ----- Carregar mensagens ao montar -----
  useEffect(() => {
    if (order?.id) {
      loadMessages();
    }
  }, [order?.id, loadMessages]);

  // ----- Formatação de data/hora -----
  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ----- Verifica se o usuário pode editar/excluir mensagem -----
  const canModifyMessage = (message) => {
    // admin pode tudo, ou o próprio autor
    return isSystemAdmin || (message.user_id === order?.user?.id);
    // Nota: se você tiver um usuário logado no contexto, use currentUser.id
    // Aqui estou assumindo que o autor da OS é o mesmo que pode editar mensagens.
    // Para mais precisão, você pode passar o currentUser via props.
    // Vou melhorar isso depois.
  };

  // Se não houver ordem, mostra loading
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <h5 className="text-slate-400 mb-4">Carregando detalhes da OS...</h5>
        <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-700/50 bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all" onClick={onBack}>
          ← Voltar
        </button>
      </div>
    );
  }

  const formattedDate = new Date(order.created_at).toLocaleString("pt-BR", {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="bg-slate-900 rounded-xl min-h-screen">
      {/* ============ HEADER ============ */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/50 border-b border-blue-500/20 rounded-t-xl">
        <div className="px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-700/50 bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all"
                onClick={onBack}
              >
                ← Voltar
              </button>
              <div className="bg-blue-500/20 px-4 py-2 rounded-full">
                <strong className="text-blue-400 text-lg font-mono">#{order.protocol || order.id}</strong>
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-white text-xl font-bold mb-1">{order.title}</h2>
              <div className="flex flex-wrap gap-3 text-slate-400 text-sm">
                <span>📅 {formattedDate}</span>
                <span># ID: {order.id}</span>
              </div>
            </div>
            {isSystemAdmin && (
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                onClick={() => onDeleteOrder(order.id)}
                disabled={actionLoading}
              >
                🗑️ Excluir
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============ CONTEÚDO ============ */}
      <div className="px-6 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============ COLUNA PRINCIPAL ============ */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-lg">
              {/* Status e Prioridade */}
              <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-slate-700/50">
                <StatusBadge status={order.status} />
                <PriorityBadge priority={order.priority} />
              </div>

              {/* Descrição */}
              <div>
                <h6 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                  💬 Descrição da Solicitação
                </h6>
                <div className="bg-slate-800/30 rounded-2xl p-4">
                  <p className="text-slate-300 leading-relaxed mb-0">
                    {order.description || "Sem descrição fornecida."}
                  </p>
                </div>
              </div>

              {/* Anexo */}
              <AttachmentPreview order={order} baseUrl={baseUrl} />
            </div>

            {/* ======== SEÇÃO DE MENSAGENS ======== */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-lg">
              <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                💬 Mensagens
                <span className="text-sm text-slate-400 font-normal">
                  ({messages.length})
                </span>
              </h4>

              {/* Campo para nova mensagem */}
              <div className="flex flex-col gap-3 mb-6">
                <textarea
                  className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/30 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                  rows="2"
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sendingMessage}
                />
                <div className="flex justify-end">
                  <button
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                  >
                    {sendingMessage ? "Enviando..." : "📤 Enviar"}
                  </button>
                </div>
              </div>

              {/* Lista de mensagens */}
              {loadingMessages ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  Nenhuma mensagem ainda. Seja o primeiro a comentar!
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar do usuário */}
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-lg flex-shrink-0">
                          {msg.user?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold text-sm">
                                {msg.user?.name || "Usuário"}
                              </span>
                              <span className="text-slate-500 text-xs">
                                {formatDateTime(msg.created_at)}
                              </span>
                            </div>
                            {/* Ações (editar/excluir) */}
                            {canModifyMessage(msg) && (
                              <div className="flex items-center gap-1">
                                <button
                                  className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors rounded-full hover:bg-blue-500/10"
                                  onClick={() => {
                                    setEditingMessageId(msg.id);
                                    setEditMessageText(msg.message);
                                  }}
                                  disabled={sendingMessage}
                                >
                                  ✏️
                                </button>
                                <button
                                  className="p-1.5 text-slate-400 hover:text-red-400 transition-colors rounded-full hover:bg-red-500/10"
                                  onClick={() => deleteMessage(msg.id)}
                                  disabled={sendingMessage}
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>
                          {/* Conteúdo da mensagem ou campo de edição */}
                          {editingMessageId === msg.id ? (
                            <div className="mt-2 flex flex-col gap-2">
                              <textarea
                                className="w-full px-3 py-2 bg-slate-700/50 border border-blue-500/30 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                                rows="2"
                                value={editMessageText}
                                onChange={(e) => setEditMessageText(e.target.value)}
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  className="px-4 py-1.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-sm transition-all"
                                  onClick={() => {
                                    setEditingMessageId(null);
                                    setEditMessageText("");
                                  }}
                                >
                                  Cancelar
                                </button>
                                <button
                                  className="px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-sm transition-all"
                                  onClick={() => updateMessage(msg.id, editMessageText)}
                                  disabled={!editMessageText.trim()}
                                >
                                  Salvar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-slate-300 text-sm mt-1 whitespace-pre-wrap">
                              {msg.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ============ COLUNA LATERAL (Gestão) ============ */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-lg">
              <h4 className="text-white font-bold text-center mb-4 flex items-center justify-center gap-2">
                ⚙️ Gestão da Ordem
              </h4>

              {/* Solicitante */}
              <div className="mb-4 p-3 bg-slate-800/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-lg">
                    {order.user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h6 className="text-white font-bold mb-0.5 truncate">{order.user?.name || "Usuário não identificado"}</h6>
                    <small className="text-slate-400 truncate block">{order.user?.email || "Email não disponível"}</small>
                  </div>
                </div>
              </div>

              {/* Grupo */}
              <div className="mb-4 p-3 bg-slate-800/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-full">
                    <span className="text-blue-400 text-xl">👥</span>
                  </div>
                  <div>
                    <h6 className="text-slate-400 text-xs uppercase font-semibold mb-0.5">Grupo Responsável</h6>
                    <p className="text-white font-bold mb-0">{order.group?.name || "Sem grupo vinculado"}</p>
                  </div>
                </div>
              </div>

              {/* Técnico */}
              <div className="mb-4 p-3 bg-slate-800/30 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <span className="text-green-400 text-xl">👤</span>
                  </div>
                  <div className="flex-1">
                    <h6 className="text-slate-400 text-xs uppercase font-semibold mb-0.5">Técnico Designado</h6>
                    {order.technician ? (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 font-bold flex items-center justify-center text-sm">
                          {order.technician.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-bold mb-0 text-sm">{order.technician.name}</p>
                          <small className="text-slate-400 text-xs">Responsável pelo atendimento</small>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <span className="text-slate-500 text-3xl block mb-2">👤</span>
                        <p className="text-slate-400 text-sm mb-3">Aguardando técnico</p>
                        <button
                          className="w-full py-2.5 rounded-full border border-blue-500/30 bg-transparent text-blue-400 hover:bg-blue-500/10 transition-all font-medium"
                          onClick={() => onUpdateStatus(order.id, "in_progress")}
                          disabled={actionLoading}
                        >
                          ✅ Assumir este chamado
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Select */}
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <label className="text-slate-400 text-xs uppercase font-bold block mb-3">
                  Alterar Status
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-blue-500/30 rounded-full text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                  value={order.status}
                  onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                  disabled={actionLoading}
                >
                  <option value="pending">⏳ Pendente</option>
                  <option value="open">📂 Em Aberto</option>
                  <option value="in_progress">🔧 Em Atendimento</option>
                  <option value="resolved">✅ Resolvido</option>
                  <option value="closed">🔒 Fechado</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
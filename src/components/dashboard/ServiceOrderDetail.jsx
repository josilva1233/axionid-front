// components/dashboard/ServiceOrderDetail.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../services/api";
import Swal from "sweetalert2";

// ---- Configurações de status e prioridade ----
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

// ============ COMPONENTE PRINCIPAL ============
export default function ServiceOrderDetail({
  order,
  onBack,
  onUpdateStatus,
  onDeleteOrder,
  actionLoading,
  isSystemAdmin,
  currentUser,
}) {
  const baseUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "http://163.176.168.224";

  // ---- Estados para mensagens ----
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newAttachment, setNewAttachment] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // ---- Paginação das mensagens ----
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // ---- Estado LOCAL para controlar o status e tempo ----
  const [localOrder, setLocalOrder] = useState(order);
  const [timeUntilClose, setTimeUntilClose] = useState(null);
  const [isResolved, setIsResolved] = useState(false);
  const autoCloseTimerRef = useRef(null);

  // ---- Atualizar estado local quando o order prop mudar ----
  useEffect(() => {
    setLocalOrder(order);
  }, [order]);

  // ---- Carregar mensagens (com paginação) ----
  const loadMessages = useCallback(
    async (pageNum = 1, append = false) => {
      if (!localOrder?.id) return;
      setLoadingMessages(true);
      try {
        const res = await api.get(`/api/v1/${localOrder.id}/messages`, {
          params: { page: pageNum, per_page: 15 },
        });
        const { data, current_page, last_page } = res.data;
        const newMessages = data || [];
        setMessages((prev) => (append ? [...prev, ...newMessages] : newMessages));
        setPage(current_page);
        setTotalPages(last_page);
        setHasMore(current_page < last_page);
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
        Swal.fire("Erro", "Não foi possível carregar as mensagens.", "error");
      } finally {
        setLoadingMessages(false);
      }
    },
    [localOrder?.id]
  );

  // ---- Carregar mais mensagens ----
  const loadMore = () => {
    if (hasMore && !loadingMessages) {
      loadMessages(page + 1, true);
    }
  };

  // ---- Verificar se o chamado está resolvido e calcular tempo restante ----
  const checkResolvedStatus = useCallback(() => {
    if (localOrder?.status === 'resolved' && localOrder?.resolved_at) {
      setIsResolved(true);
      
      const resolvedDate = new Date(localOrder.resolved_at);
      const twoDaysLater = new Date(resolvedDate);
      twoDaysLater.setDate(twoDaysLater.getDate() + 2);
      
      const now = new Date();
      const timeDiff = twoDaysLater - now;
      
      if (timeDiff > 0) {
        setTimeUntilClose(timeDiff);
        return true;
      } else {
        setTimeUntilClose(0);
        // Fechar automaticamente
        handleAutoClose();
        return false;
      }
    } else {
      setIsResolved(false);
      setTimeUntilClose(null);
      return false;
    }
  }, [localOrder]);

  // ---- Função para fechar automaticamente o chamado ----
  const handleAutoClose = useCallback(async () => {
    if (!localOrder?.id || localOrder.status === 'closed') return;
    
    try {
      const response = await api.put(`/api/v1/service-orders/${localOrder.id}`, {
        status: 'closed'
      });
      
      const updatedOrder = response.data.data || response.data;
      
      // Atualizar estado local
      setLocalOrder(prev => ({ ...prev, ...updatedOrder }));
      
      // Notificar componente pai
      if (onUpdateStatus) {
        onUpdateStatus(localOrder.id, 'closed', updatedOrder);
      }
      
      setIsResolved(false);
      setTimeUntilClose(null);
      
      Swal.fire({
        icon: 'info',
        title: 'Chamado Fechado Automaticamente',
        text: 'O chamado foi fechado automaticamente após 2 dias de resolução.',
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Erro ao fechar chamado automaticamente:', error);
    }
  }, [localOrder, onUpdateStatus]);

  // ---- Iniciar timer para verificar quando fechar o chamado ----
  useEffect(() => {
    // Limpar timer anterior
    if (autoCloseTimerRef.current) {
      clearInterval(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }

    // Verificar status inicial
    const isResolvedNow = checkResolvedStatus();

    // Se estiver resolvido e ainda tem tempo, iniciar timer
    if (isResolvedNow && timeUntilClose > 0) {
      autoCloseTimerRef.current = setInterval(() => {
        const resolvedDate = new Date(localOrder.resolved_at);
        const twoDaysLater = new Date(resolvedDate);
        twoDaysLater.setDate(twoDaysLater.getDate() + 2);
        
        const now = new Date();
        const remaining = twoDaysLater - now;
        
        if (remaining <= 0) {
          setTimeUntilClose(0);
          handleAutoClose();
          if (autoCloseTimerRef.current) {
            clearInterval(autoCloseTimerRef.current);
            autoCloseTimerRef.current = null;
          }
        } else {
          setTimeUntilClose(remaining);
        }
      }, 60000); // Verificar a cada minuto
    }

    return () => {
      if (autoCloseTimerRef.current) {
        clearInterval(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, [localOrder?.status, localOrder?.resolved_at, checkResolvedStatus, handleAutoClose, timeUntilClose]);

  // ---- Formatar tempo restante ----
  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return "Fechando...";
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;
    
    if (days > 0) {
      return `${days}d ${remainingHours}h ${remainingMinutes}min`;
    } else if (hours > 0) {
      return `${hours}h ${remainingMinutes}min`;
    } else {
      return `${minutes}min`;
    }
  };

  // ---- Enviar mensagem (com suporte a anexo) ----
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() && !newAttachment) return;

    setSendingMessage(true);
    try {
      const formData = new FormData();
      formData.append("message", newMessage.trim() || " ");
      if (newAttachment) {
        formData.append("attachment", newAttachment);
      }

      const res = await api.post(`/api/v1/${localOrder.id}/messages`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const newMsg = res.data.data || res.data;
      
      setMessages((prev) => {
        if (newMsg && !newMsg.user && currentUser) {
          newMsg.user = {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email
          };
        }
        return [newMsg, ...prev];
      });
      
      setNewMessage("");
      setNewAttachment(null);
      const fileInput = document.getElementById("message-attachment");
      if (fileInput) fileInput.value = "";
      
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
  }, [newMessage, newAttachment, localOrder?.id, currentUser]);

  // ---- Atualizar mensagem ----
  const updateMessage = useCallback(
    async (messageId, newText) => {
      if (!newText.trim()) return;
      try {
        const res = await api.put(`/api/v1/${localOrder.id}/messages/${messageId}`, {
          message: newText.trim(),
        });
        const updated = res.data.data || res.data;
        setMessages((prev) => prev.map((msg) => (msg.id === messageId ? updated : msg)));
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
    },
    [localOrder?.id]
  );

  // ---- Excluir mensagem ----
  const deleteMessage = useCallback(
    async (messageId) => {
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
        await api.delete(`/api/v1/${localOrder.id}/messages/${messageId}`);
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
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
    },
    [localOrder?.id]
  );

  // ---- Verifica se o usuário pode modificar a mensagem ----
  const canModifyMessage = (message) => {
    return isSystemAdmin || (message.user_id === currentUser?.id);
  };

  // ---- Formatação de data/hora ----
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

  // ---- Carregar mensagens ao montar ----
  useEffect(() => {
    if (localOrder?.id) {
      loadMessages(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localOrder?.id]);

  // ---- Função para marcar como resolvido ----
  const handleMarkAsResolved = useCallback(async () => {
    if (!localOrder?.id) return;
    
    const result = await Swal.fire({
      title: "Marcar como Resolvido?",
      text: "O chamado será marcado como resolvido e será fechado automaticamente em 2 dias.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sim, resolver",
      cancelButtonText: "Cancelar",
      background: "#111214",
      color: "#ffffff",
      confirmButtonColor: "#22c55e",
    });
    
    if (!result.isConfirmed) return;
    
    try {
      const now = new Date().toISOString();
      const response = await api.put(`/api/v1/service-orders/${localOrder.id}`, {
        status: 'resolved',
        resolved_at: now
      });
      
      const updatedOrder = response.data.data || response.data;
      
      // 🔥 ATUALIZAR ESTADO LOCAL IMEDIATAMENTE
      setLocalOrder(prev => ({ ...prev, ...updatedOrder }));
      
      // 🔥 NOTIFICAR COMPONENTE PAI
      if (onUpdateStatus) {
        onUpdateStatus(localOrder.id, 'resolved', updatedOrder);
      }
      
      // 🔥 ATUALIZAR STATUS LOCAL
      setIsResolved(true);
      const resolvedDate = new Date(now);
      const twoDaysLater = new Date(resolvedDate);
      twoDaysLater.setDate(twoDaysLater.getDate() + 2);
      setTimeUntilClose(twoDaysLater - new Date());
      
      Swal.fire({
        icon: "success",
        title: "✅ Chamado Resolvido!",
        text: "O chamado será fechado automaticamente em 2 dias.",
        timer: 3000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Erro ao marcar como resolvido:", error);
      Swal.fire(
        "Erro", 
        error.response?.data?.message || "Não foi possível marcar o chamado como resolvido.", 
        "error"
      );
    }
  }, [localOrder, onUpdateStatus]);

  // ---- Se não houver ordem, mostra loading ----
  if (!localOrder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <h5 className="text-slate-400 mb-4">Carregando detalhes da OS...</h5>
        <button
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-700/50 bg-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all"
          onClick={onBack}
        >
          ← Voltar
        </button>
      </div>
    );
  }

  const formattedDate = new Date(localOrder.created_at).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
                <strong className="text-blue-400 text-lg font-mono">#{localOrder.protocol || localOrder.id}</strong>
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <h2 className="text-white text-xl font-bold mb-1">{localOrder.title}</h2>
              <div className="flex flex-wrap gap-3 text-slate-400 text-sm">
                <span>📅 {formattedDate}</span>
                <span># ID: {localOrder.id}</span>
              </div>
            </div>
            {isSystemAdmin && (
              <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                onClick={() => onDeleteOrder(localOrder.id)}
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
              <div className="flex flex-wrap gap-3 mb-4 pb-4 border-b border-slate-700/50">
                <StatusBadge status={localOrder.status} />
                <PriorityBadge priority={localOrder.priority} />
                
                {isResolved && timeUntilClose > 0 && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm bg-green-500/15 text-green-400">
                    <span>⏳</span> Fecha em: {formatTimeRemaining(timeUntilClose)}
                  </span>
                )}
                {isResolved && timeUntilClose === 0 && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm bg-yellow-500/15 text-yellow-400 animate-pulse">
                    <span>⏳</span> Fechando...
                  </span>
                )}
              </div>

              <div>
                <h6 className="text-blue-400 font-bold mb-3 flex items-center gap-2">💬 Descrição da Solicitação</h6>
                <div className="bg-slate-800/30 rounded-2xl p-4">
                  <p className="text-slate-300 leading-relaxed mb-0">{localOrder.description || "Sem descrição fornecida."}</p>
                </div>
              </div>

              <AttachmentPreview order={localOrder} baseUrl={baseUrl} />
            </div>

            {/* ======== SEÇÃO DE MENSAGENS ======== */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-lg">
              <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                💬 Mensagens
                <span className="text-sm text-slate-400 font-normal">({messages.length})</span>
                <button
                  className="ml-auto text-xs text-slate-400 hover:text-blue-400 transition-colors"
                  onClick={() => loadMessages(1, false)}
                  disabled={loadingMessages}
                >
                  🔄 Atualizar
                </button>
              </h4>

              {/* Campo para nova mensagem COM ANEXO */}
              <div className="flex flex-col gap-3 mb-6">
                <textarea
                  className="w-full px-4 py-3 bg-slate-800/50 border border-blue-500/30 rounded-2xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                  rows="2"
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sendingMessage || localOrder.status === 'closed'}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    id="message-attachment"
                    type="file"
                    className="flex-1 min-w-[200px] px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 transition-all"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => setNewAttachment(e.target.files[0] || null)}
                    disabled={sendingMessage || localOrder.status === 'closed'}
                  />
                  <button
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={sendMessage}
                    disabled={(!newMessage.trim() && !newAttachment) || sendingMessage || localOrder.status === 'closed'}
                  >
                    {sendingMessage ? "Enviando..." : "📤 Enviar"}
                  </button>
                </div>
                {newAttachment && (
                  <div className="text-sm text-green-400 flex items-center gap-2">
                    <span>✅</span> Anexo selecionado: <strong>{newAttachment.name}</strong>
                  </div>
                )}
                {localOrder.status === 'closed' && (
                  <div className="text-sm text-yellow-400 flex items-center gap-2">
                    <span>⚠️</span> Chamado fechado - não é possível enviar mensagens
                  </div>
                )}
              </div>

              {/* Lista de mensagens */}
              {loadingMessages && messages.length === 0 ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-slate-400">Nenhuma mensagem ainda. Seja o primeiro a comentar!</div>
              ) : (
                <>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {messages.map((msg) => {
                      const messageUser = msg.user || { name: 'Usuário Desconhecido' };
                      const userName = messageUser.name || 'Usuário Desconhecido';
                      const userInitial = userName.charAt(0)?.toUpperCase() || '?';
                      
                      return (
                        <div
                          key={msg.id}
                          className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-lg flex-shrink-0">
                              {userInitial}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-bold text-sm">{userName}</span>
                                  <span className="text-slate-500 text-xs">{formatDateTime(msg.created_at)}</span>
                                </div>
                                {canModifyMessage(msg) && localOrder.status !== 'closed' && (
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
                                <p className="text-slate-300 text-sm mt-1 whitespace-pre-wrap">{msg.message}</p>
                              )}
                              {msg.attachment_path && (
                                <div className="mt-2">
                                  <a
                                    href={`${baseUrl}/storage/${msg.attachment_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                                  >
                                    📎 Ver anexo
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {hasMore && (
                    <div className="flex justify-center mt-4">
                      <button
                        className="px-6 py-2 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-sm transition-all disabled:opacity-50"
                        onClick={loadMore}
                        disabled={loadingMessages}
                      >
                        {loadingMessages ? "Carregando..." : "📥 Carregar mais mensagens"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ============ COLUNA LATERAL (Gestão) ============ */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-lg">
              <h4 className="text-white font-bold text-center mb-4 flex items-center justify-center gap-2">⚙️ Gestão da Ordem</h4>

              <div className="mb-4 p-3 bg-slate-800/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-lg">
                    {localOrder.user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h6 className="text-white font-bold mb-0.5 truncate">{localOrder.user?.name || "Usuário não identificado"}</h6>
                    <small className="text-slate-400 truncate block">{localOrder.user?.email || "Email não disponível"}</small>
                  </div>
                </div>
              </div>

              <div className="mb-4 p-3 bg-slate-800/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-full">
                    <span className="text-blue-400 text-xl">👥</span>
                  </div>
                  <div>
                    <h6 className="text-slate-400 text-xs uppercase font-semibold mb-0.5">Grupo Responsável</h6>
                    <p className="text-white font-bold mb-0">{localOrder.group?.name || "Sem grupo vinculado"}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4 p-3 bg-slate-800/30 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <span className="text-green-400 text-xl">👤</span>
                  </div>
                  <div className="flex-1">
                    <h6 className="text-slate-400 text-xs uppercase font-semibold mb-0.5">Técnico Designado</h6>
                    {localOrder.technician ? (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 font-bold flex items-center justify-center text-sm">
                          {localOrder.technician.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-bold mb-0 text-sm">{localOrder.technician.name}</p>
                          <small className="text-slate-400 text-xs">Responsável pelo atendimento</small>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <span className="text-slate-500 text-3xl block mb-2">👤</span>
                        <p className="text-slate-400 text-sm mb-3">Aguardando técnico</p>
                        <button
                          className="w-full py-2.5 rounded-full border border-blue-500/30 bg-transparent text-blue-400 hover:bg-blue-500/10 transition-all font-medium"
                          onClick={() => onUpdateStatus(localOrder.id, "in_progress")}
                          disabled={actionLoading}
                        >
                          ✅ Assumir este chamado
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botão para marcar como resolvido - APENAS PARA STATUS QUE NÃO SÃO RESOLVIDO OU FECHADO */}
              {localOrder.status !== 'resolved' && localOrder.status !== 'closed' && (
                <div className="mt-4 mb-4">
                  <button
                    className="w-full py-2.5 rounded-full bg-green-600 hover:bg-green-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleMarkAsResolved}
                    disabled={actionLoading}
                  >
                    ✅ Marcar como Resolvido
                  </button>
                  <p className="text-xs text-slate-400 text-center mt-2">
                    ⏳ Será fechado automaticamente em 2 dias
                  </p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <label className="text-slate-400 text-xs uppercase font-bold block mb-3">Alterar Status</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-blue-500/30 rounded-full text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                  value={localOrder.status}
                  onChange={(e) => {
                    // 🔥 BLOQUEAR seleção manual do status "resolved"
                    if (e.target.value === 'resolved') {
                      Swal.fire({
                        icon: 'info',
                        title: 'Ação não permitida',
                        text: 'O status "Resolvido" não pode ser selecionado manualmente. Use o botão "Marcar como Resolvido".',
                        timer: 3000,
                        showConfirmButton: false,
                      });
                      return;
                    }
                    onUpdateStatus(localOrder.id, e.target.value);
                  }}
                  disabled={actionLoading || localOrder.status === 'closed'}
                >
                  <option value="pending">⏳ Pendente</option>
                  <option value="open">📂 Em Aberto</option>
                  <option value="in_progress">🔧 Em Atendimento</option>
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
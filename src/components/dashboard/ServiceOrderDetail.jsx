import { useState } from "react";

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

export default function ServiceOrderDetail({
  order,
  onBack,
  onUpdateStatus,
  onDeleteOrder,
  actionLoading,
  isSystemAdmin,
}) {
  const baseUrl = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "http://163.176.168.224";

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
          </div>

          {/* ============ COLUNA LATERAL ============ */}
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
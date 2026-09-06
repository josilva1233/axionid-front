// src/components/dashboard/ReportsDashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import Swal from 'sweetalert2';

// 🔥 REGISTRO OBRIGATÓRIO
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportsDashboard({ isDark = false }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportOrders, setReportOrders] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const AxionAlert = Swal.mixin({
    background: isDark ? '#111214' : '#ffffff',
    color: isDark ? '#ffffff' : '#1f2937',
  });

  useEffect(() => {
    fetchDashboard();
    fetchTechnicians();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/v1/reports/dashboard');
      setData(res.data);
    } catch (err) {
      AxionAlert.fire('Erro', 'Não foi possível carregar os dados do dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/api/v1/reports/technicians');
      setTechnicians(res.data);
    } catch (err) {
      console.error('Erro ao carregar técnicos', err);
    }
  };

  const fetchOrdersReport = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange.start) params.append('start_date', dateRange.start);
      if (dateRange.end) params.append('end_date', dateRange.end);
      const res = await api.get(`/api/v1/reports/orders?${params.toString()}`);
      setReportOrders(res.data.data || []);
    } catch (err) {
      AxionAlert.fire('Erro', 'Falha ao carregar relatório de chamados.', 'error');
    }
  };

  // 🔥 SAFEGUARDS – Verifica se data existe antes de acessar
  const totals = data?.totals || { orders: 0, users: 0, categories: 0, groups: 0 };
  const slaBreached = data?.sla_breached || 0;
  const ordersByStatus = data?.orders_by_status || {};
  const ordersByPriority = data?.orders_by_priority || {};
  const ordersByCategory = data?.orders_by_category || [];
  const last7Days = data?.last_7_days || {};

  // Dados para gráficos (com fallback vazio)
  const statusChartData = {
    labels: Object.keys(ordersByStatus).length ? Object.keys(ordersByStatus) : ['Nenhum'],
    datasets: [{
      label: 'Chamados por Status',
      data: Object.keys(ordersByStatus).length ? Object.values(ordersByStatus) : [0],
      backgroundColor: ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'],
    }]
  };

  const priorityChartData = {
    labels: Object.keys(ordersByPriority).length ? Object.keys(ordersByPriority) : ['Nenhum'],
    datasets: [{
      label: 'Chamados por Prioridade',
      data: Object.keys(ordersByPriority).length ? Object.values(ordersByPriority) : [0],
      backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],
    }]
  };

  const categoryChartData = {
    labels: ordersByCategory.length ? ordersByCategory.map(item => item.category) : ['Nenhum'],
    datasets: [{
      label: 'Top Categorias',
      data: ordersByCategory.length ? ordersByCategory.map(item => item.total) : [0],
      backgroundColor: '#8b5cf6',
    }]
  };

  const last7DaysData = {
    labels: Object.keys(last7Days).length ? Object.keys(last7Days) : ['Nenhum'],
    datasets: [{
      label: 'Chamados nos últimos 7 dias',
      data: Object.keys(last7Days).length ? Object.values(last7Days) : [0],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true,
      tension: 0.3,
    }]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`p-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
      <h2 className="text-2xl font-bold mb-6">📊 Painel de Relatórios</h2>

      {/* Cards de Totais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
          <p className="text-sm text-slate-400">Total Chamados</p>
          <p className="text-2xl font-bold">{totals.orders}</p>
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
          <p className="text-sm text-slate-400">Usuários</p>
          <p className="text-2xl font-bold">{totals.users}</p>
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
          <p className="text-sm text-slate-400">Categorias</p>
          <p className="text-2xl font-bold">{totals.categories}</p>
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
          <p className="text-sm text-slate-400">SLAs Estourados</p>
          <p className="text-2xl font-bold text-red-400">{slaBreached}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
          <h3 className="font-semibold mb-3">Status dos Chamados</h3>
          <Doughnut data={statusChartData} />
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
          <h3 className="font-semibold mb-3">Prioridades</h3>
          <Doughnut data={priorityChartData} />
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
          <h3 className="font-semibold mb-3">Top Categorias</h3>
          <Bar data={categoryChartData} />
        </div>
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
          <h3 className="font-semibold mb-3">Chamados (últimos 7 dias)</h3>
          <Line data={last7DaysData} />
        </div>
      </div>

      {/* Desempenho dos Técnicos */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'} mb-6`}>
        <h3 className="font-semibold mb-3">👨‍💻 Desempenho dos Técnicos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-700/50' : 'border-gray-200'}`}>
                <th className="text-left py-2 px-3">Técnico</th>
                <th className="text-center py-2 px-3">Atribuídos</th>
                <th className="text-center py-2 px-3">Concluídos</th>
                <th className="text-center py-2 px-3">Taxa de Conclusão</th>
                <th className="text-center py-2 px-3">Tempo Médio (h)</th>
              </tr>
            </thead>
            <tbody>
              {technicians.length > 0 ? (
                technicians.map((tech) => (
                  <tr key={tech.id} className={`border-b ${isDark ? 'border-slate-700/30' : 'border-gray-100'}`}>
                    <td className="py-2 px-3">{tech.name}</td>
                    <td className="text-center py-2 px-3">{tech.total_assigned}</td>
                    <td className="text-center py-2 px-3">{tech.total_completed}</td>
                    <td className="text-center py-2 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tech.completion_rate >= 80 ? 'bg-green-500/20 text-green-400' :
                        tech.completion_rate >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {tech.completion_rate}%
                      </span>
                    </td>
                    <td className="text-center py-2 px-3">{tech.avg_resolution_hours}h</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-slate-400">Nenhum técnico com chamados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Relatório de Chamados */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/80 border-gray-200'}`}>
        <h3 className="font-semibold mb-3">📋 Relatório de Chamados</h3>
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="date"
            className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-white' : 'bg-white border-gray-300'}`}
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <input
            type="date"
            className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-white' : 'bg-white border-gray-300'}`}
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
          <button
            onClick={fetchOrdersReport}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition"
          >
            Filtrar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-700/50' : 'border-gray-200'}`}>
                <th className="text-left py-2 px-3">Protocolo</th>
                <th className="text-left py-2 px-3">Título</th>
                <th className="text-left py-2 px-3">Solicitante</th>
                <th className="text-center py-2 px-3">Status</th>
                <th className="text-center py-2 px-3">Prioridade</th>
                <th className="text-center py-2 px-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {reportOrders.length > 0 ? (
                reportOrders.map((order) => (
                  <tr key={order.id} className={`border-b ${isDark ? 'border-slate-700/30' : 'border-gray-100'}`}>
                    <td className="py-2 px-3 font-mono text-xs">{order.protocol}</td>
                    <td className="py-2 px-3">{order.title}</td>
                    <td className="py-2 px-3">{order.user?.name}</td>
                    <td className="text-center py-2 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-center py-2 px-3">{order.priority}</td>
                    <td className="text-center py-2 px-3">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-slate-400">Nenhum chamado encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ServiceOrderForm = ({ onSuccess, groups = [] }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'low',
        group_id: '',
        attachment: null
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, attachment: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        // Usamos FormData para suportar o envio de arquivos
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('priority', formData.priority);
        if (formData.group_id) data.append('group_id', formData.group_id);
        if (formData.attachment) data.append('attachment', formData.attachment);

        try {
            await axios.post('/api/v1/service-orders', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ type: 'success', text: 'Chamado aberto com sucesso!' });
            setFormData({ title: '', description: '', priority: 'low', group_id: '', attachment: null });
            if (onSuccess) onSuccess();
        } catch (err) {
            setMessage({ type: 'error', text: 'Erro ao abrir chamado. Verifique os dados.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Novo Chamado (OS)</h3>
            
            {message && (
                <div className={`p-3 mb-4 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Título do Problema</label>
                    <input
                        type="text" name="title" required
                        value={formData.title} onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Impressora não liga"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição Detalhada</label>
                    <textarea
                        name="description" required rows="3"
                        value={formData.description} onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Descreva o que está acontecendo..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                        <select
                            name="priority" value={formData.priority} onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                        >
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                            <option value="urgent">Urgente</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vincular a Grupo (Opcional)</label>
                        <select
                            name="group_id" value={formData.group_id} onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                        >
                            <option value="">Somente eu (Privado)</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Anexo (Imagem ou PDF)</label>
                    <input
                        type="file" onChange={handleFileChange}
                        className="mt-1 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit" disabled={loading}
                        className={`w-full py-2 px-4 rounded-md text-white font-bold transition-colors ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? 'Enviando...' : 'Abrir Ordem de Serviço'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ServiceOrderForm;
import React from 'react';

const ServiceOrderTable = ({ orders, onEdit }) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full leading-normal">
                <thead>
                    <tr>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Protocolo / Título
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Prioridade
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Ações
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((os) => (
                        <tr key={os.id}>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                <div className="flex flex-col">
                                    <p className="text-blue-600 font-mono font-bold">{os.protocol}</p>
                                    <p className="text-gray-900 whitespace-no-wrap">{os.title}</p>
                                </div>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                <span className={`font-bold ${os.priority === 'high' ? 'text-red-500' : 'text-gray-500'}`}>
                                    {os.priority.toUpperCase()}
                                </span>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                                <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                                    os.status === 'completed' ? 'text-green-900' : 'text-orange-900'
                                }`}>
                                    <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${
                                        os.status === 'completed' ? 'bg-green-200' : 'bg-orange-200'
                                    }`}></span>
                                    <span className="relative text-xs">{os.status}</span>
                                </span>
                            </td>
                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                                <button 
                                    onClick={() => onEdit(os)}
                                    className="text-indigo-600 hover:text-indigo-900 font-semibold"
                                >
                                    Ver Detalhes
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ServiceOrderTable;
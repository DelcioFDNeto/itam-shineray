// src/components/MoveAssetModal.jsx
import React, { useState, useEffect } from 'react';
import { X, ArrowRight, User, MapPin, Save, AlertCircle } from 'lucide-react';
import { getEmployees } from '../services/employeeService';

const MoveAssetModal = ({ isOpen, onClose, asset, onConfirm }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estado do Formulário
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [formData, setFormData] = useState({
    newHolderName: '',
    newHolderCpf: '',
    newSector: '',
    newLocation: asset?.location || 'Matriz',
    newStatus: 'Em Uso',
    reason: ''
  });

  // Carrega funcionários ao abrir
  useEffect(() => {
    if (isOpen) {
      const fetchEmps = async () => {
        const data = await getEmployees();
        setEmployees(data);
      };
      fetchEmps();
      // Resetar form com dados atuais se quiser, ou deixar limpo para forçar escolha
    }
  }, [isOpen]);

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    setSelectedEmployeeId(empId);
    
    const emp = employees.find(ep => ep.id === empId);
    if (emp) {
      setFormData(prev => ({
        ...prev,
        newHolderName: emp.name,
        newHolderCpf: emp.cpf,
        newSector: emp.sector,
        newLocation: emp.branch || prev.newLocation // Já sugere a filial do funcionário
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.newHolderName) return alert("Selecione um responsável.");
    
    setLoading(true);
    await onConfirm(formData);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gray-900 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <ArrowRight className="text-shineray" /> Movimentar Ativo
          </h3>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Resumo da Mudança Visual */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
            <div className="w-1/2 pr-2 border-r border-gray-200">
                <p className="text-gray-400 font-bold uppercase mb-1">Origem (Atual)</p>
                <p className="font-bold text-gray-700 truncate">{asset.clientName || asset.assignedTo || "Estoque"}</p>
                <p className="text-gray-500">{asset.location}</p>
            </div>
            <div className="w-1/2 pl-4">
                <p className="text-shineray font-bold uppercase mb-1">Destino (Novo)</p>
                <p className="font-bold text-gray-900 truncate">{formData.newHolderName || "..."}</p>
                <p className="text-gray-500">{formData.newLocation}</p>
            </div>
          </div>

          {/* Seleção de Funcionário */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Novo Responsável</label>
            <div className="relative">
                <select 
                    className="w-full p-2.5 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"
                    onChange={handleEmployeeChange}
                    value={selectedEmployeeId}
                    required
                >
                    <option value="">Selecione da lista...</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} - {emp.sector}</option>
                    ))}
                </select>
                <User size={16} className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Localização */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nova Localização</label>
                <div className="relative">
                    <select 
                        className="w-full p-2.5 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"
                        value={formData.newLocation}
                        onChange={e => setFormData({...formData, newLocation: e.target.value})}
                    >
                        <option value="Matriz">Matriz</option>
                        <option value="Castanhal">Castanhal</option>
                        <option value="Ananindeua">Ananindeua</option>
                        <option value="Fábrica">Fábrica</option>
                        <option value="Home Office">Home Office</option>
                    </select>
                    <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            {/* Status */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Novo Status</label>
                <select 
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none bg-white"
                    value={formData.newStatus}
                    onChange={e => setFormData({...formData, newStatus: e.target.value})}
                >
                    <option value="Em Uso">Em Uso</option>
                    <option value="Disponível">Disponível (Devolução)</option>
                    <option value="Manutenção">Manutenção</option>
                </select>
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Motivo / Observação</label>
            <textarea 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none h-20 text-sm"
                placeholder="Ex: Promoção, Troca de equipamento, Admissão..."
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
                required
            ></textarea>
          </div>

          <div className="pt-2 flex gap-3">
            <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition"
            >
                Cancelar
            </button>
            <button 
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
                {loading ? "Processando..." : <><Save size={18} /> Confirmar Transferência</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default MoveAssetModal;
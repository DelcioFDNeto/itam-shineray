// src/pages/EmployeeManager.jsx
import React, { useState, useEffect } from 'react';
// CORREÇÃO AQUI: Importando createEmployee para bater com seu serviço existente
import { getEmployees, createEmployee, deleteEmployee } from '../services/employeeService';
import { 
  Users, Plus, Trash2, Search, MapPin, Briefcase, User 
} from 'lucide-react';

const EmployeeManager = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    sector: '',
    branch: 'Matriz - Belém'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Erro ao carregar equipe:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.sector) return alert("Preencha nome e setor!");

    try {
      // CORREÇÃO AQUI: Usando createEmployee
      await createEmployee(formData);
      alert("Colaborador adicionado!");
      setFormData({ name: '', cpf: '', sector: '', branch: 'Matriz - Belém' }); 
      setIsModalOpen(false); 
      loadData(); 
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja remover este colaborador da lista?")) {
      try {
        await deleteEmployee(id);
        loadData();
      } catch (error) {
        alert("Erro ao excluir.");
      }
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.sector?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Users className="text-shineray" /> Gestão de Equipe
          </h1>
          <p className="text-sm text-gray-500">Cadastre os colaboradores para vincular aos ativos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition shadow-lg"
        >
          <Plus size={20} /> Novo Colaborador
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou setor..." 
          className="flex-1 outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-gray-500 col-span-3 text-center py-10">Carregando...</p>
        ) : filteredEmployees.length === 0 ? (
          <p className="text-gray-500 col-span-3 text-center py-10">Nenhum colaborador encontrado.</p>
        ) : (
          filteredEmployees.map(emp => (
            <div key={emp.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all relative group">
              <button 
                onClick={() => handleDelete(emp.id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                title="Excluir"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <User size={20} className="text-gray-700" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{emp.name}</h3>
                  <p className="text-xs text-gray-500">{emp.cpf || "CPF não informado"}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Briefcase size={14} /> {emp.sector}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <MapPin size={14} /> {emp.branch || emp.location || "Local não definido"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-black p-4 text-white flex justify-between items-center">
              <h3 className="font-bold">Novo Colaborador</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                <input 
                  required
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
                  placeholder="Ex: João da Silva"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Setor / Cargo</label>
                <input 
                  required
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
                  placeholder="Ex: Vendas"
                  value={formData.sector}
                  onChange={e => setFormData({...formData, sector: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filial</label>
                <select 
                  className="w-full p-3 border rounded-lg outline-none bg-white"
                  value={formData.branch}
                  onChange={e => setFormData({...formData, branch: e.target.value})}
                >
                    <option value="Matriz - Belém">Matriz - Belém</option>
                    <option value="Fábrica / CD - Benfica">Fábrica / CD - Benfica</option>
                    <option value="Filial Ananindeua">Filial Ananindeua</option>
                    <option value="Filial Castanhal">Filial Castanhal</option>
                    <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CPF (Opcional)</label>
                <input 
                  className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-black"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-shineray hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors mt-2">
                Salvar Colaborador
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmployeeManager;
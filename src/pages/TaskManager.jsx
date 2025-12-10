// src/pages/TaskManager.jsx
import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/taskService';
import { 
  CheckSquare, Plus, Trash2, Calendar, User, 
  CheckCircle, Clock, AlertCircle, Layers, Menu 
} from 'lucide-react';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('A. Levantamento');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // As seções do Master ITAM
  const sections = [
    'A. Levantamento', 'B. Inventário', 'C. Contas e Serviços',
    'D. Aquisição', 'E. Manutenção', 'F. Descarte',
    'G. Segurança', 'H. Relatórios', 'I. Auditoria'
  ];

  const [formData, setFormData] = useState({
    description: '', responsible: 'TI', status: 'Pendente',
    startDate: '', endDate: '', notes: '', section: 'A. Levantamento'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // --- LÓGICA DO PROGRESSO ---
  const currentTasks = tasks.filter(t => t.section === activeSection);
  const completedTasks = currentTasks.filter(t => t.status === 'Concluído').length;
  const totalTasks = currentTasks.length;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // --- AÇÕES ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask({ ...formData, section: activeSection });
      setIsModalOpen(false);
      setFormData({ description: '', responsible: 'TI', status: 'Pendente', startDate: '', endDate: '', notes: '', section: activeSection });
      loadData();
    } catch (error) { alert("Erro ao salvar."); }
  };

  const handleStatusChange = async (task, newStatus) => {
    try { await updateTask(task.id, { status: newStatus }); loadData(); } catch (error) { alert("Erro ao atualizar."); }
  };

  const handleDelete = async (id) => {
    if(confirm("Excluir esta tarefa?")) { await deleteTask(id); loadData(); }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Concluído': return 'bg-green-100 text-green-700 border-green-200';
      case 'Em andamento': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-50 overflow-hidden">
      
      {/* ÁREA DE NAVEGAÇÃO (HÍBRIDA) 
          - Mobile: Barra Horizontal no Topo (overflow-x-auto)
          - Desktop: Barra Lateral Fixa (w-72)
      */}
      <div className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-row md:flex-col shrink-0 z-10">
        
        {/* Título do Menu (Só Desktop) */}
        <div className="hidden md:block p-6 border-b border-gray-100">
            <h2 className="font-black text-lg flex items-center gap-2 text-gray-900">
                <Layers className="text-shineray" /> Planejamento
            </h2>
            <p className="text-xs text-gray-400 mt-1">Master ITAM Shineray</p>
        </div>

        {/* Lista de Abas (Com Scroll Horizontal no Mobile) */}
        <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto p-2 space-x-2 md:space-x-0 md:space-y-1 w-full scrollbar-hide">
            {sections.map(section => {
                const secTasks = tasks.filter(t => t.section === section);
                const secDone = secTasks.filter(t => t.status === 'Concluído').length;
                const secProg = secTasks.length > 0 ? Math.round((secDone / secTasks.length) * 100) : 0;
                const shortName = section.split('. ')[1]; // Remove "A. "

                return (
                    <button 
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={`
                            whitespace-nowrap flex-shrink-0 px-4 py-3 rounded-lg text-sm font-bold flex items-center justify-between transition-all
                            ${activeSection === section 
                                ? 'bg-black text-white shadow-md' 
                                : 'text-gray-500 hover:bg-gray-100 bg-white border border-gray-100 md:border-0'}
                        `}
                    >
                        <span className="mr-3">{shortName}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${activeSection === section ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                            {secProg}%
                        </span>
                    </button>
                )
            })}
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-24">
        
        {/* Header da Seção */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
            <div className="w-full md:w-auto">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 truncate">{activeSection}</h1>
                <div className="flex items-center gap-4 w-full md:w-96">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-green-600 whitespace-nowrap">{progress}% Feito</span>
                </div>
            </div>
            
            {/* Botão Nova Tarefa (Fixo no rodapé em telas muito pequenas ou normal aqui) */}
            <button 
                onClick={() => setIsModalOpen(true)} 
                className="w-full md:w-auto bg-shineray hover:bg-red-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-colors active:scale-95"
            >
                <Plus size={20} /> Nova Tarefa
            </button>
        </div>

        {/* Lista de Tarefas */}
        <div className="space-y-3">
            {currentTasks.length === 0 ? (
                <div className="text-center py-10 md:py-20 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400 mx-2">
                    <CheckSquare size={48} className="mx-auto mb-2 opacity-20"/>
                    <p className="text-sm">Nenhuma tarefa registrada nesta seção.</p>
                </div>
            ) : (
                currentTasks.map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-4">
                        
                        {/* Linha Superior (Mobile): Checkbox + Texto */}
                        <div className="flex items-start gap-3 flex-1">
                            <button 
                                onClick={() => handleStatusChange(task, task.status === 'Concluído' ? 'Pendente' : 'Concluído')}
                                className={`mt-1 p-1 rounded-full shrink-0 transition-colors ${task.status === 'Concluído' ? 'text-green-500 bg-green-50' : 'text-gray-300 hover:text-gray-500'}`}
                            >
                                {task.status === 'Concluído' ? <CheckCircle size={24} className="fill-current"/> : <AlertCircle size={24}/>}
                            </button>

                            <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-gray-900 text-sm md:text-base break-words ${task.status === 'Concluído' ? 'line-through text-gray-400' : ''}`}>
                                    {task.description}
                                </h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><User size={12}/> {task.responsible}</span>
                                    {task.endDate && <span className="flex items-center gap-1 text-orange-600 font-medium"><Calendar size={12}/> {new Date(task.endDate).toLocaleDateString('pt-BR')}</span>}
                                </div>
                                {task.notes && <p className="mt-1 text-xs italic text-gray-400 break-words line-clamp-2 md:line-clamp-none">- {task.notes}</p>}
                            </div>
                        </div>

                        {/* Linha Inferior (Mobile): Badge + Delete */}
                        <div className="flex items-center justify-between md:justify-end gap-3 pl-10 md:pl-0 border-t md:border-0 border-gray-50 pt-2 md:pt-0">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getStatusColor(task.status)}`}>
                                {task.status}
                            </span>
                            <button onClick={() => handleDelete(task.id)} className="text-gray-300 hover:text-red-500 p-2 active:scale-95"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* MODAL RESPONSIVO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-black p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm md:text-base truncate pr-4">Nova: {activeSection.split('. ')[1]}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/20 rounded">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Descrição</label>
                    <input required className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-black" placeholder="O que precisa ser feito?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Responsável</label>
                        <input className="w-full p-3 border rounded-xl outline-none" value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</label>
                        <select className="w-full p-3 border rounded-xl bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                            <option>Pendente</option>
                            <option>Em andamento</option>
                            <option>Concluído</option>
                            <option>Atrasado</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Início</label><input type="date" className="w-full p-3 border rounded-xl" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
                    <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Prazo</label><input type="date" className="w-full p-3 border rounded-xl" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} /></div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Observações</label>
                    <textarea className="w-full p-3 border rounded-xl" rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                </div>

                <button type="submit" className="w-full bg-shineray hover:bg-red-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg mt-2">
                    Salvar Tarefa
                </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
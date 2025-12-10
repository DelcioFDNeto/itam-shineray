// src/pages/LicenseManager.jsx
import React, { useState, useEffect } from 'react';
import { getLicenses, createLicense, deleteLicense, assignLicense, unassignLicense } from '../services/licenseService';
import { useAssets } from '../hooks/useAssets'; 
import { 
  Key, ShieldCheck, Plus, Trash2, Search, Monitor, 
  X, Copy
} from 'lucide-react';

const LicenseManager = () => {
  const [licenses, setLicenses] = useState([]);
  const { assets } = useAssets(); // Puxa seus ativos para o dropdown
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modais
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    softwareName: '',
    key: '',
    type: 'Vitalícia',
    totalSeats: 1,
    expirationDate: ''
  });

  // Assign State
  const [selectedAssetId, setSelectedAssetId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getLicenses();
      setLicenses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- AÇÕES ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createLicense(formData);
      alert("Licença cadastrada!");
      setIsFormOpen(false);
      setFormData({ softwareName: '', key: '', type: 'Vitalícia', totalSeats: 1, expirationDate: '' });
      loadData();
    } catch (error) {
      alert("Erro ao salvar.");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Excluir esta licença?")) {
      await deleteLicense(id);
      loadData();
    }
  };

  const handleAssign = async () => {
    if (!selectedAssetId || !selectedLicense) return;
    
    const used = selectedLicense.assignedAssets?.length || 0;
    if (used >= selectedLicense.totalSeats) return alert("Todas as ativações foram usadas!");

    const assetObj = assets.find(a => a.id === selectedAssetId);
    
    try {
      await assignLicense(selectedLicense.id, assetObj.id, `${assetObj.model} (${assetObj.internalId})`);
      alert("Ativo vinculado!");
      setIsAssignOpen(false);
      loadData();
    } catch (error) {
      alert("Erro ao vincular.");
    }
  };

  const handleUnassign = async (license, assetObj) => {
    if (confirm(`Remover a licença de ${assetObj.name}?`)) {
      await unassignLicense(license.id, assetObj);
      loadData();
    }
  };

  const getUsageColor = (used, total) => {
    const percentage = (used / total) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const filteredLicenses = licenses.filter(l => 
    l.softwareName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-shineray" /> Licenças & Software
          </h1>
          <p className="text-sm text-gray-500">Gestão de chaves, contratos e ativações.</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-black text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition shadow-lg">
          <Plus size={20} /> Nova Licença
        </button>
      </div>

      {/* FILTRO */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar software (Office, Windows, Adobe...)" 
          className="flex-1 outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LISTA DE LICENÇAS */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? <p className="text-center text-gray-500">Carregando...</p> : 
         filteredLicenses.map(license => {
           const used = license.assignedAssets?.length || 0;
           const total = parseInt(license.totalSeats) || 1;
           const percentage = Math.min((used / total) * 100, 100);
           const isExpired = license.expirationDate && new Date(license.expirationDate) < new Date();

           return (
             <div key={license.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    
                    {/* Infos Principais */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Key size={20}/></div>
                            <h3 className="font-bold text-lg text-gray-900">{license.softwareName}</h3>
                            {isExpired && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">VENCIDA</span>}
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{license.type}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm font-mono bg-gray-50 p-2 rounded w-fit border border-gray-100">
                            <span className="text-gray-500">KEY:</span>
                            <span className="font-bold text-gray-800 select-all">{license.key}</span>
                            <button onClick={() => {navigator.clipboard.writeText(license.key); alert("Copiado!")}} className="text-gray-400 hover:text-black ml-2"><Copy size={14}/></button>
                        </div>
                    </div>

                    {/* Barra de Uso */}
                    <div className="flex-1 max-w-md">
                        <div className="flex justify-between text-xs font-bold uppercase mb-1">
                            <span className="text-gray-500">Utilização</span>
                            <span className={`${used >= total ? 'text-red-600' : 'text-green-600'}`}>{used} / {total} Ativos</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div className={`h-2.5 rounded-full ${getUsageColor(used, total)}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                        
                        {/* Lista de Usados */}
                        <div className="mt-3 flex flex-wrap gap-2">
                            {license.assignedAssets?.map((asset, idx) => (
                                <div key={idx} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-[10px] border border-gray-200">
                                    <Monitor size={10} className="text-gray-500"/>
                                    <span className="font-bold text-gray-700">{asset.name}</span>
                                    <button onClick={() => handleUnassign(license, asset)} className="text-gray-400 hover:text-red-500 ml-1"><X size={10}/></button>
                                </div>
                            ))}
                            {used < total && (
                                <button 
                                    onClick={() => { setSelectedLicense(license); setIsAssignOpen(true); }}
                                    className="flex items-center gap-1 bg-black text-white px-2 py-1 rounded text-[10px] hover:bg-gray-800"
                                >
                                    <Plus size={10}/> Vincular
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Excluir */}
                    <div className="flex flex-col justify-between items-end border-l border-gray-100 pl-4">
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Validade</p>
                            <p className="text-sm font-bold text-gray-800">
                                {license.expirationDate ? new Date(license.expirationDate).toLocaleDateString('pt-BR') : 'Permanente'}
                            </p>
                        </div>
                        <button onClick={() => handleDelete(license.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                    </div>
                </div>
             </div>
           );
         })
        }
      </div>

      {/* MODAL NOVA LICENÇA */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-black p-4 text-white flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><Key size={18}/> Cadastrar Software</h3>
              <button onClick={() => setIsFormOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome do Software</label><input required className="w-full p-2 border rounded" placeholder="Ex: Microsoft Office 2021 Home" value={formData.softwareName} onChange={e => setFormData({...formData, softwareName: e.target.value})} /></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Chave de Ativação (Key)</label><input required className="w-full p-2 border rounded font-mono bg-gray-50" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" value={formData.key} onChange={e => setFormData({...formData, key: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label><select className="w-full p-2 border rounded bg-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}><option>Vitalícia</option><option>Assinatura Anual</option><option>Assinatura Mensal</option><option>OEM</option><option>Open License (Volume)</option></select></div>
                    <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantidade (Seats)</label><input type="number" min="1" required className="w-full p-2 border rounded" value={formData.totalSeats} onChange={e => setFormData({...formData, totalSeats: e.target.value})} /></div>
                </div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiração (Opcional)</label><input type="date" className="w-full p-2 border rounded" value={formData.expirationDate} onChange={e => setFormData({...formData, expirationDate: e.target.value})} /></div>
                <button type="submit" className="w-full bg-shineray hover:bg-red-700 text-white font-bold py-3 rounded-lg mt-2">Salvar</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VINCULAR ATIVO */}
      {isAssignOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-black p-4 text-white flex justify-between items-center">
              <h3 className="font-bold">Vincular a Ativo</h3>
              <button onClick={() => setIsAssignOpen(false)}><X size={20}/></button>
            </div>
            <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">Selecione qual máquina receberá uma ativação de <strong>{selectedLicense?.softwareName}</strong>.</p>
                <select className="w-full p-3 border rounded-lg bg-white mb-4" value={selectedAssetId} onChange={e => setSelectedAssetId(e.target.value)}>
                    <option value="">Selecione um ativo...</option>
                    {assets.sort((a, b) => a.model.localeCompare(b.model)).map(asset => (
                        <option key={asset.id} value={asset.id}>{asset.model} ({asset.internalId})</option>
                    ))}
                </select>
                <button onClick={handleAssign} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg">Confirmar Vínculo</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LicenseManager;
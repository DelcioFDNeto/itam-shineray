// src/pages/AuditPage.jsx
import React, { useState, useMemo } from 'react';
import { useAssets } from '../hooks/useAssets';
import QRScanner from '../components/QRScanner';
import { 
  ClipboardCheck, MapPin, Scan, CheckCircle, XCircle, AlertTriangle, ArrowLeft 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuditPage = () => {
  const { assets, loading } = useAssets();
  const navigate = useNavigate();
  
  const [selectedLocation, setSelectedLocation] = useState('');
  const [scannedIds, setScannedIds] = useState(new Set()); // Usa Set para evitar duplicados
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);

  // --- LÓGICA DE AUDITORIA ---
  // 1. O que esperamos encontrar? (Filtra pelo local selecionado)
  const expectedAssets = useMemo(() => {
      if (!selectedLocation) return [];
      return assets.filter(a => a.location === selectedLocation && a.status !== 'Baixado');
  }, [assets, selectedLocation]);

  // 2. Classificação dos itens
  const auditResult = useMemo(() => {
      const found = [];
      const missing = [];
      const intruders = []; // Itens bipados que são de OUTRO lugar

      // Verifica os esperados
      expectedAssets.forEach(asset => {
          if (scannedIds.has(asset.internalId)) {
              found.push(asset);
          } else {
              missing.push(asset);
          }
      });

      // Verifica intrusos (Bipados que não estão na lista de esperados)
      scannedIds.forEach(id => {
          const asset = assets.find(a => a.internalId === id);
          // Se o ativo existe no sistema MAS não era esperado neste local
          if (asset && asset.location !== selectedLocation) {
              intruders.push(asset);
          }
      });

      return { found, missing, intruders };
  }, [expectedAssets, scannedIds, assets, selectedLocation]);

  // --- PROGRESSO ---
  const progress = expectedAssets.length > 0 
      ? Math.round((auditResult.found.length / expectedAssets.length) * 100) 
      : 0;

  // --- AÇÃO DO SCANNER ---
  const handleScan = (code) => {
      if (!code) return;
      
      // Adiciona ao Set de escaneados
      setScannedIds(prev => {
          const newSet = new Set(prev);
          newSet.add(code);
          return newSet;
      });
      
      setLastScanned(code);
      // Feedback visual ou sonoro pode ser adicionado aqui
  };

  // Lista única de locais para o dropdown
  const locations = [...new Set(assets.map(a => a.location).filter(Boolean))].sort();

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-sm">
            <ArrowLeft size={20} />
        </button>
        <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="text-shineray" /> Auditoria de Inventário
            </h1>
            <p className="text-sm text-gray-500">Conferência física de ativos por localidade</p>
        </div>
      </div>

      {/* Seleção de Local */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin size={16} /> Selecione o Local para Auditar
          </label>
          <select 
            className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-black outline-none font-medium"
            value={selectedLocation}
            onChange={(e) => {
                setSelectedLocation(e.target.value);
                setScannedIds(new Set()); // Reseta ao mudar de local
            }}
          >
              <option value="">-- Selecione --</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
      </div>

      {selectedLocation && (
          <div className="space-y-6">
              
              {/* Painel de Controle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black text-white p-6 rounded-2xl relative overflow-hidden">
                      <div className="relative z-10">
                          <p className="text-gray-400 text-xs font-bold uppercase mb-1">Progresso</p>
                          <h2 className="text-4xl font-black">{progress}%</h2>
                          <p className="text-sm mt-1 text-gray-300">
                              {auditResult.found.length} de {expectedAssets.length} encontrados
                          </p>
                      </div>
                      {/* Barra de Progresso Visual */}
                      <div className="absolute bottom-0 left-0 h-2 bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>

                  <button 
                    onClick={() => setIsScannerOpen(true)}
                    className="bg-shineray hover:bg-red-700 text-white p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors shadow-lg shadow-red-900/20"
                  >
                      <Scan size={40} />
                      <span className="font-bold text-lg uppercase">Iniciar Leitura</span>
                  </button>
              </div>

              {/* Feedback Último Scan */}
              {lastScanned && (
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-center animate-pulse">
                      <p className="text-xs text-blue-600 font-bold uppercase">Último Bip:</p>
                      <p className="text-lg font-mono font-black text-blue-900">{lastScanned}</p>
                  </div>
              )}

              {/* Listas de Resultados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Faltantes */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-red-50 p-3 border-b border-red-100 flex justify-between items-center">
                          <h3 className="font-bold text-red-800 text-sm flex items-center gap-2">
                              <XCircle size={16} /> Pendentes / Faltam ({auditResult.missing.length})
                          </h3>
                      </div>
                      <div className="max-h-60 overflow-y-auto p-2">
                          {auditResult.missing.map(asset => (
                              <div key={asset.id} className="p-2 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                  <p className="font-bold text-xs text-gray-900">{asset.model}</p>
                                  <p className="font-mono text-[10px] text-gray-500">{asset.internalId}</p>
                              </div>
                          ))}
                          {auditResult.missing.length === 0 && <p className="p-4 text-center text-xs text-green-600 font-bold">Tudo encontrado!</p>}
                      </div>
                  </div>

                  {/* Encontrados */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="bg-green-50 p-3 border-b border-green-100 flex justify-between items-center">
                          <h3 className="font-bold text-green-800 text-sm flex items-center gap-2">
                              <CheckCircle size={16} /> Conferidos ({auditResult.found.length})
                          </h3>
                      </div>
                      <div className="max-h-60 overflow-y-auto p-2">
                          {auditResult.found.map(asset => (
                              <div key={asset.id} className="p-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 flex justify-between">
                                  <div>
                                      <p className="font-bold text-xs text-gray-900">{asset.model}</p>
                                      <p className="font-mono text-[10px] text-gray-500">{asset.internalId}</p>
                                  </div>
                                  <CheckCircle size={14} className="text-green-500" />
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Intrusos (Se houver) */}
                  {auditResult.intruders.length > 0 && (
                      <div className="md:col-span-2 bg-yellow-50 rounded-xl border border-yellow-200 overflow-hidden">
                          <div className="bg-yellow-100 p-3 flex justify-between items-center">
                              <h3 className="font-bold text-yellow-800 text-sm flex items-center gap-2">
                                  <AlertTriangle size={16} /> Intrusos (Pertencem a outro local)
                              </h3>
                              <span className="bg-yellow-200 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">{auditResult.intruders.length}</span>
                          </div>
                          <div className="p-2">
                              {auditResult.intruders.map(asset => (
                                  <div key={asset.id} className="p-2 bg-white rounded border border-yellow-100 mb-2 flex justify-between items-center">
                                      <div>
                                          <p className="font-bold text-xs text-gray-900">{asset.model} ({asset.internalId})</p>
                                          <p className="text-[10px] text-gray-500">Local correto: <strong>{asset.location}</strong></p>
                                      </div>
                                      <button className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 font-bold">
                                          Transferir p/ cá
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}

              </div>
          </div>
      )}

      {/* SCANNER MODAL */}
      {isScannerOpen && (
          <QRScanner 
            onClose={() => setIsScannerOpen(false)} 
            onScan={handleScan} // Passa a função que impede navegação
          />
      )}
    </div>
  );
};

export default AuditPage;
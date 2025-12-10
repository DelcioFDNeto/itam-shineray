// src/pages/ImportData.jsx
import React, { useState, useEffect } from 'react';
import { importAssetsBatch } from '../services/importService';
import { generateCleanData } from '../utils/dataMerger'; 
import { Upload, CheckCircle, AlertTriangle, FileJson, Loader2, Database, ShieldAlert } from 'lucide-react';

const ImportData = () => {
  const [status, setStatus] = useState('idle');
  const [log, setLog] = useState('');
  const [previewData, setPreviewData] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [errorDetails, setErrorDetails] = useState(null);

  useEffect(() => {
    // PROTEÇÃO CONTRA TELA BRANCA
    try {
      console.log("Tentando gerar dados...");
      const data = generateCleanData();
      
      if (!data || !Array.isArray(data)) {
        throw new Error("O arquivo dataMerger não retornou uma lista válida. Verifique seus arquivos JSON.");
      }

      setPreviewData(data);
      setLog(`${data.length} registros prontos.`);
    } catch (err) {
      console.error("ERRO FATAL NA IMPORTAÇÃO:", err);
      setStatus('error');
      setLog('Erro crítico ao processar os arquivos JSON.');
      setErrorDetails(err.message);
    }
  }, []);

  const processInChunks = async (allAssets) => {
    const CHUNK_SIZE = 450; // Reduzi um pouco por segurança
    const totalChunks = Math.ceil(allAssets.length / CHUNK_SIZE);
    let totalImported = 0;

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = start + CHUNK_SIZE;
      const chunk = allAssets.slice(start, end);

      setLog(`Processando lote ${i + 1} de ${totalChunks}...`);
      await importAssetsBatch(chunk);
      
      totalImported += chunk.length;
      setProgress({ current: i + 1, total: totalChunks });
    }
    return totalImported;
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;
    if (!window.confirm(`Confirmar envio de ${previewData.length} ativos para o banco?`)) return;

    setStatus('loading');
    try {
      const totalCount = await processInChunks(previewData);
      setStatus('success');
      setLog(`Sucesso! ${totalCount} ativos sincronizados.`);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setLog(`Falha no envio: ${error.message}`);
    }
  };

  // SE HOUVER ERRO CRÍTICO, MOSTRA ISTO EM VEZ DE TELA BRANCA
  if (status === 'error' && errorDetails) {
    return (
        <div className="p-8 max-w-2xl mx-auto mt-10 bg-red-50 rounded-xl border border-red-200 text-center">
            <ShieldAlert size={48} className="text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Erro ao Ler Arquivos</h2>
            <p className="text-red-600 mb-4">{log}</p>
            <div className="bg-white p-4 rounded text-left font-mono text-xs text-red-500 overflow-auto max-h-40 border border-red-100">
                {errorDetails}
            </div>
            <p className="text-sm text-gray-500 mt-4">Verifique se <code>src/data/rawMaster.json</code> existe e é um JSON válido.</p>
        </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto mt-10 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gray-900 rounded-lg text-white"><Database size={24} /></div>
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Importação</h1>
            <p className="text-gray-500 text-sm">Carga Massiva (JSON → Firestore)</p>
        </div>
      </div>

      <div className="bg-gray-50 p-5 rounded-lg mb-6 border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FileJson size={18} /> Resumo:
        </h3>
        {previewData.length > 0 ? (
            <div className="flex justify-between items-center bg-white p-3 rounded border border-gray-200">
                <span className="text-gray-600">Registros Encontrados:</span>
                <span className="font-bold text-blue-600 text-xl">{previewData.length}</span>
            </div>
        ) : (
            <div className="flex items-center gap-2 text-gray-500 py-2">
                <Loader2 className="animate-spin" size={16} /> <p className="text-sm">Analisando arquivos...</p>
            </div>
        )}
      </div>

      {status === 'success' && (
        <div className="bg-green-50 p-4 rounded-lg mb-6 flex items-center gap-3 text-green-800 border border-green-200">
          <CheckCircle size={24} /> <p className="font-medium text-sm">{log}</p>
        </div>
      )}

      {status === 'loading' && (
         <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
            </div>
            <p className="text-center text-xs text-blue-600 font-medium animate-pulse">{log}</p>
         </div>
      )}

      <button
        onClick={handleImport}
        disabled={status === 'loading' || previewData.length === 0 || status === 'success'}
        className={`w-full py-4 rounded-lg font-bold text-white transition-all flex justify-center items-center gap-2 shadow-sm
            ${status === 'success' ? 'bg-green-600 cursor-default' : 'bg-gray-900 hover:bg-gray-800'}
            ${(status === 'loading' || previewData.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {status === 'loading' ? 'Processando...' : status === 'success' ? 'Concluído' : 'Iniciar Importação'}
      </button>
    </div>
  );
};

export default ImportData;
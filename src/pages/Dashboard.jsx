// src/pages/Dashboard.jsx
import React, { useMemo } from 'react';
import { useAssets } from '../hooks/useAssets';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip 
} from 'recharts';
import { 
  Server, DollarSign, Activity, AlertTriangle, 
  CalendarClock, ClipboardCheck 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { assets, loading } = useAssets();
  const navigate = useNavigate();

  // --- CÁLCULOS ESTATÍSTICOS (MEMOIZED) ---
  const stats = useMemo(() => {
    if (!assets.length) return null;

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // 1. Contagens Básicas
    const totalAssets = assets.length;
    // const inUse = assets.filter(a => a.status === 'Em Uso').length; // (Opcional se for usar Pizza)
    const maintenance = assets.filter(a => a.status === 'Manutenção').length;

    // 2. Valor Total (Limpeza de string R$)
    const totalValue = assets.reduce((acc, curr) => {
        const cleanVal = curr.valor ? String(curr.valor).replace(/[^\d,]/g, '').replace(',', '.') : '0';
        return acc + parseFloat(cleanVal || 0);
    }, 0);

    // 3. Lógica de Garantia (1 Ano)
    let expiredCount = 0;
    let warningCount = 0;
    
    const warrantyAssets = assets.filter(a => {
        // Filtra ativos que têm data e não são promocionais
        if (!a.purchaseDate || a.purchaseDate === '---') return false;
        const isPromo = a.category === 'Promocional' || a.internalId?.includes('PRM');
        return !isPromo;
    }).map(asset => {
        const purchase = new Date(asset.purchaseDate);
        if (isNaN(purchase.getTime())) return null;

        const expiration = new Date(purchase);
        expiration.setFullYear(expiration.getFullYear() + 1); // +1 Ano de validade

        let status = 'ok';
        if (today > expiration) {
            status = 'expired';
            expiredCount++;
        } else if (expiration < thirtyDaysFromNow) {
            status = 'warning';
            warningCount++;
        }

        return { ...asset, warrantyStatus: status, expirationDate: expiration };
    }).filter(Boolean);

    // Top 5 Ativos Críticos (Para a lista lateral)
    const criticalAssets = warrantyAssets
        .filter(a => a.warrantyStatus !== 'ok')
        .sort((a, b) => a.expirationDate - b.expirationDate)
        .slice(0, 10); // Mostra até 10

    // 4. Dados para o Gráfico de Barras (Por Filial)
    const branchCount = assets.reduce((acc, curr) => {
        let loc = curr.location || 'Não Def.';
        // Agrupamento simples de nomes
        if(loc.includes('Matriz')) loc = 'Matriz';
        else if(loc.includes('Castanhal')) loc = 'Castanhal';
        else if(loc.includes('Ananindeua')) loc = 'Ananindeua';
        else if(loc.includes('Fábrica') || loc.includes('Benfica')) loc = 'Fábrica';
        else if(loc.includes('Ceará') || loc.includes('CE')) loc = 'Ceará';
        else loc = 'Outros';
        
        acc[loc] = (acc[loc] || 0) + 1;
        return acc;
    }, {});

    const barData = Object.keys(branchCount).map(key => ({
        name: key, ativos: branchCount[key]
    })).sort((a, b) => b.ativos - a.ativos); // Ordena do maior para o menor

    return { 
        totalAssets, maintenance, totalValue, 
        expiredCount, warningCount, criticalAssets,
        barData 
    };
  }, [assets]);

  if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Carregando indicadores...</div>;
  if (!stats) return <div className="p-8 text-center text-gray-500">Sem dados. Cadastre ativos primeiro.</div>;

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      
      {/* HEADER + BOTÃO AUDITORIA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900">Dashboard Gerencial</h1>
          <p className="text-sm text-gray-500">Panorama da infraestrutura de TI Shineray</p>
        </div>
        <button 
            onClick={() => navigate('/audit')} 
            className="w-full md:w-auto bg-black text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
            <ClipboardCheck size={20} /> Nova Auditoria
        </button>
      </div>

      {/* CARDS DE KPI (GRID RESPONSIVO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. Garantia (Destaque) */}
        <div className="bg-gradient-to-br from-red-50 to-white border border-red-100 p-6 rounded-2xl shadow-sm flex justify-between items-center relative overflow-hidden group hover:border-red-200 transition-colors">
            <div className="relative z-10">
                <p className="text-red-800 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                    <AlertTriangle size={12} /> Garantias Vencidas
                </p>
                <h2 className="text-4xl font-black text-red-600">{stats.expiredCount}</h2>
                {stats.warningCount > 0 && (
                    <p className="text-xs text-orange-600 font-bold mt-1 bg-orange-100 px-2 py-0.5 rounded-full w-fit">
                        + {stats.warningCount} vencendo
                    </p>
                )}
            </div>
            <div className="p-3 bg-red-100 rounded-xl text-red-500 relative z-10 group-hover:scale-110 transition-transform">
                <CalendarClock size={28} />
            </div>
        </div>

        {/* 2. Total de Ativos */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center hover:border-gray-300 transition-colors">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total de Ativos</p>
                <h2 className="text-4xl font-black text-gray-900">{stats.totalAssets}</h2>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl text-gray-600"><Server size={28} /></div>
        </div>

        {/* 3. Valor Patrimonial */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center hover:border-gray-300 transition-colors">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Valor Patrimonial</p>
                <h2 className="text-2xl font-bold text-green-700 truncate">
                    {stats.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </h2>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-green-600"><DollarSign size={28} /></div>
        </div>

        {/* 4. Em Manutenção */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center hover:border-gray-300 transition-colors">
            <div>
                <p className="text-gray-400 text-xs font-bold uppercase mb-1">Em Manutenção</p>
                <h2 className="text-4xl font-bold text-orange-500">{stats.maintenance}</h2>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl text-orange-500"><Activity size={28} /></div>
        </div>
      </div>

      {/* ÁREA DE GRÁFICOS E LISTAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRÁFICO DE BARRAS (Filiais) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-[400px] flex flex-col">
            <h3 className="font-bold text-gray-800 mb-6 text-lg">Distribuição por Filial</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} interval={0} />
                        <YAxis fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip 
                            cursor={{fill: '#f9fafb'}} 
                            contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}} 
                        />
                        <Bar dataKey="ativos" fill="#111827" radius={[6, 6, 0, 0]} barSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* LISTA DE ALERTAS CRÍTICOS */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-[400px] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 bg-red-50 flex justify-between items-center">
                <h3 className="font-bold text-red-800 flex items-center gap-2">
                    <AlertTriangle size={18} /> Atenção Necessária
                </h3>
                <span className="bg-white px-2 py-1 rounded text-[10px] font-bold text-red-800 shadow-sm">
                    {stats.criticalAssets.length} Prioritários
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {stats.criticalAssets.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
                        <div className="p-3 bg-green-50 rounded-full text-green-500"><ClipboardCheck size={32}/></div>
                        <p>Tudo em dia! ✅</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {stats.criticalAssets.map(asset => (
                            <div 
                                key={asset.id} 
                                onClick={() => navigate(`/assets/${asset.id}`)}
                                className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition cursor-pointer group"
                            >
                                <div>
                                    <p className="font-bold text-sm text-gray-900 group-hover:text-shineray transition-colors">
                                        {asset.model}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-mono">{asset.internalId}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                                        asset.warrantyStatus === 'expired' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {asset.warrantyStatus === 'expired' ? 'Vencida' : 'Vence logo'}
                                    </span>
                                    <p className="text-[10px] text-gray-400 mt-1 font-medium">
                                        {asset.expirationDate.toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
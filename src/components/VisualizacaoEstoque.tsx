import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Database, PackageCheck, Search, RefreshCcw, 
  Layers, Box, AlertCircle, X, MapPin, Info 
} from 'lucide-react';

interface EstoqueLocal {
  quantidade: number;
  locais: { nome: string };
}

interface ProdutoEstoque {
  id: string;
  nome: string;
  barcode: string;
  estoque_producao: number;
  estoque_unitarizado: number;
  categorias?: { nome: string } | null;
  estoque_insumos?: EstoqueLocal[]; // Nova relação
}

export function VisualizacaoEstoque() {
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [abaInterna, setAbaInterna] = useState<'materia-prima' | 'unitarizado'>('materia-prima');
  const [erro, setErro] = useState<string | null>(null);
  
  // Estado para o Modal de Detalhes
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoEstoque | null>(null);

  useEffect(() => {
    fetchEstoque();
  }, []);

  async function fetchEstoque() {
  setLoading(true);
  setErro(null);
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        id, 
        nome, 
        barcode,
        estoque_producao, 
        estoque_unitarizado,
        categorias ( nome ),
        estoque_insumos (
          quantidade,
          locais ( nome )
        )
      `)
      .order('nome', { ascending: true });

    if (error) throw error;
    setProdutos(data as any);
    
  } catch (err: any) {
    console.error("Erro:", err);
    setErro("Erro ao carregar locais. Verifique se as tabelas estão vinculadas.");
  } finally {
    setLoading(false);
  }
}

  const produtosFiltrados = produtos.filter(p => 
    p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    p.barcode?.includes(busca)
  );

  return (
    <div className="relative min-h-screen bg-gray-50/50 pb-20">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* HEADER */}
        <div className="bg-gray-900 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex bg-gray-800 p-1 rounded-xl">
              <button
                onClick={() => setAbaInterna('materia-prima')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                  abaInterna === 'materia-prima' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Database size={18} /> MATÉRIA-PRIMA
              </button>
              <button
                onClick={() => setAbaInterna('unitarizado')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                  abaInterna === 'unitarizado' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                <PackageCheck size={18} /> UNITARIZADO
              </button>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Nome ou Código de Barras..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm outline-none focus:border-blue-500"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>
        </div>

        {erro && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm font-bold">
            <AlertCircle size={20} /> {erro}
          </div>
        )}

        {/* LISTA DE PRODUTOS */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <RefreshCcw className="animate-spin text-blue-600 mb-4" size={40} />
              <p className="text-gray-400 font-bold tracking-widest uppercase">Consultando Inventário...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {produtosFiltrados.map((produto) => (
                <div 
                  key={produto.id} 
                  onClick={() => setProdutoSelecionado(produto)}
                  className="group border-2 border-gray-100 rounded-2xl p-5 hover:border-blue-500 hover:shadow-md transition-all bg-white cursor-pointer relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">
                        {produto.categorias?.nome || 'GERAL'}
                      </p>
                      <h3 className="font-black text-gray-800 uppercase text-xs sm:text-sm leading-tight break-words pr-4">
                        {produto.nome}
                      </h3>
                    </div>
                    <div className={`p-2 rounded-lg ${abaInterna === 'materia-prima' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                      {abaInterna === 'materia-prima' ? <Layers size={16} /> : <Box size={16} />}
                    </div>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-[8px] font-bold text-gray-400 uppercase">Saldo Total</p>
                      <p className={`text-2xl font-black ${abaInterna === 'materia-prima' ? 'text-blue-700' : 'text-green-700'}`}>
                        {abaInterna === 'materia-prima' ? (produto.estoque_producao || 0) : (produto.estoque_unitarizado || 0)}
                        <span className="text-[10px] ml-1 opacity-50">UN</span>
                      </p>
                    </div>
                    <div className="text-[8px] font-black text-gray-300 group-hover:text-blue-500 transition-colors flex items-center gap-1">
                      VER DETALHES <Info size={10} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE DETALHES (OVERLAY) */}
      {produtoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{produtoSelecionado.categorias?.nome || 'Insumo'}</p>
                <h2 className="text-lg font-black uppercase tracking-tighter leading-tight mt-1">{produtoSelecionado.nome}</h2>
              </div>
              <button onClick={() => setProdutoSelecionado(null)} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* BLOCO DE SALDO MESTRE */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-3xl border border-blue-100">
                  <p className="text-[9px] font-black text-blue-500 uppercase mb-1">Matéria-Prima</p>
                  <p className="text-3xl font-black text-blue-700">{produtoSelecionado.estoque_producao || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-3xl border border-green-100">
                  <p className="text-[9px] font-black text-green-500 uppercase mb-1">Unitarizado</p>
                  <p className="text-3xl font-black text-green-700">{produtoSelecionado.estoque_unitarizado || 0}</p>
                </div>
              </div>

              {/* LOCALIZAÇÃO DETALHADA */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <MapPin size={14} className="text-red-500" /> Distribuição por Local
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {produtoSelecionado.estoque_insumos && produtoSelecionado.estoque_insumos.length > 0 ? (
                    produtoSelecionado.estoque_insumos.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="font-bold text-gray-700 text-sm uppercase">{item.locais?.nome || 'Local Não Identificado'}</span>
                        <span className={`font-black text-sm ${item.quantidade < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {item.quantidade} UN
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-2xl text-center text-gray-400 text-[10px] font-bold uppercase">
                      Nenhuma localização registrada no estoque_insumos
                    </div>
                  )}
                </div>
              </div>

              {/* CÓDIGO DE BARRAS */}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400">
                <span className="uppercase">Código de Barras</span>
                <span className="font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">{produtoSelecionado.barcode || '---'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
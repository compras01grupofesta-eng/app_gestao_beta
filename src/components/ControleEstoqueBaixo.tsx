import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  AlertOctagon, 
  Search, 
  PackageSearch, // Ícone corrigido aqui
  RefreshCcw
} from 'lucide-react';

interface ProdutoEstoqueBaixo {
  id: string;
  nome: string;
  estoque_producao: number;
  estoque_unitarizado: number;
  estoque_minimo: number;
  categorias?: { nome: string } | null;
}

export function ControleEstoqueBaixo() {
  const [produtos, setProdutos] = useState<ProdutoEstoqueBaixo[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarEstoqueCritico();
  }, []);

  async function carregarEstoqueCritico() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          id, nome, estoque_producao, estoque_unitarizado, estoque_minimo,
          categorias ( nome )
        `);

      if (error) throw error;

      if (data) {
        const criticos = (data as any[]).filter((p) => {
          const min = p.estoque_minimo || 10;
          return (p.estoque_producao || 0) <= min || (p.estoque_unitarizado || 0) <= 5;
        }) as ProdutoEstoqueBaixo[];
        setProdutos(criticos);
      }
    } catch (err) {
      console.error("Erro ao carregar estoque crítico:", err);
    } finally {
      setLoading(false);
    }
  }

  const produtosFiltrados = produtos.filter(p => 
    p.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
      <div className="bg-red-600 p-4 flex justify-between items-center">
        <h2 className="text-white font-black flex items-center gap-2 uppercase tracking-wider">
          <AlertOctagon size={20} /> Estoque Crítico
        </h2>
        <button onClick={carregarEstoqueCritico} className="text-white/80 hover:text-white">
          <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Filtrar alertas..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-xl text-sm outline-none focus:border-red-500"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {produtosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <PackageSearch className="mx-auto text-gray-200 mb-2" size={32} />
              <p className="text-gray-400 text-xs font-bold">Nenhum alerta no momento.</p>
            </div>
          ) : (
            produtosFiltrados.map(produto => (
              <div key={produto.id} className="p-3 bg-red-50 rounded-xl border border-red-100 flex justify-between items-center">
                <div className="max-w-[60%]">
                  <p className="font-black text-gray-800 text-xs uppercase truncate">{produto.nome}</p>
                  <p className="text-[9px] text-red-400 font-bold uppercase">{produto.categorias?.nome || 'Geral'}</p>
                </div>
                <div className="flex gap-2">
                  <div className="text-center min-w-[45px]">
                    <p className="text-[8px] font-black text-gray-400 uppercase">Bruto</p>
                    <p className={`text-sm font-black ${(produto.estoque_producao || 0) <= (produto.estoque_minimo || 10) ? 'text-red-600' : 'text-gray-600'}`}>
                      {produto.estoque_producao || 0}
                    </p>
                  </div>
                  <div className="text-center border-l pl-2 min-w-[45px]">
                    <p className="text-[8px] font-black text-gray-400 uppercase">Pronto</p>
                    <p className={`text-sm font-black ${(produto.estoque_unitarizado || 0) <= 5 ? 'text-red-600' : 'text-gray-600'}`}>
                      {produto.estoque_unitarizado || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
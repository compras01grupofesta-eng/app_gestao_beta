import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Package, 
  Database, 
  MapPin, 
  Ruler, 
  CheckCircle2,
  AlertCircle,
  Archive
} from 'lucide-react';

interface Local {
  id: string;
  nome: string;
}

export function CadastroInsumos() {
  const [loading, setLoading] = useState(false);
  const [locais, setLocais] = useState<Local[]>([]);
  
  // Estado do Formulário
  const [nome, setNome] = useState('');
  const [estoqueProducao, setEstoqueProducao] = useState<number>(0); // Nome atualizado
  const [unidadeMedida, setUnidadeMedida] = useState('un');
  const [localId, setLocalId] = useState('');

  useEffect(() => {
    carregarLocais();
  }, []);

  async function carregarLocais() {
    const { data } = await supabase
      .from('locais')
      .select('id, nome')
      .order('nome');
    if (data) setLocais(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!nome || !localId) {
      alert("Por favor, preencha o nome e o local de armazenamento.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('insumos')
        .insert([{
          nome: nome.toUpperCase(),
          estoque_producao: estoqueProducao, // Coluna atualizada conforme sua instrução
          unidade_medida: unidadeMedida,
          local_id: localId
        }]);

      if (error) throw error;

      alert("✅ Insumo cadastrado na Matéria-Prima!");
      
      // Reset formulário
      setNome('');
      setEstoqueProducao(0);
      setUnidadeMedida('un');
      setLocalId('');

    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar insumo. Verifique se a coluna no banco já foi alterada para 'estoque_producao'.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <header className="flex justify-between items-end">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-100">
            <Archive className="text-white" size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-gray-800 uppercase tracking-tighter">
              Cadastro de Insumos
            </h2>
            <p className="text-gray-500 font-medium">Gestão de Matéria-Prima e Materiais de Apoio</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* COLUNA 1: DADOS DO MATERIAL */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Package size={14} className="text-amber-500" /> Nome do Insumo
            </label>
            <input 
              required
              type="text"
              placeholder="Ex: EMBALAGEM PLÁSTICA 10X15"
              className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 outline-none border-2 border-transparent focus:border-amber-500 focus:bg-white transition-all"
              value={nome}
              onChange={e => setNome(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Ruler size={14} /> Unidade
              </label>
              <select 
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 outline-none border-2 border-transparent focus:border-amber-500 transition-all cursor-pointer"
                value={unidadeMedida}
                onChange={e => setUnidadeMedida(e.target.value)}
              >
                <option value="un">UN</option>
                <option value="kg">KG</option>
                <option value="m">MT</option>
                <option value="ct">CENTO</option>
                <option value="pt">PACOTE</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Database size={14} /> Estoque Produção
              </label>
              <input 
                type="number"
                placeholder="0"
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 outline-none border-2 border-transparent focus:border-amber-500 transition-all"
                value={estoqueProducao}
                onChange={e => setEstoqueProducao(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* COLUNA 2: LOCALIZAÇÃO E CONFIRMAÇÃO */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <MapPin size={14} className="text-red-500" /> Localização no Galpão
              </label>
              <select 
                required
                className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-700 outline-none border-2 border-transparent focus:border-amber-500 transition-all cursor-pointer"
                value={localId}
                onChange={e => setLocalId(e.target.value)}
              >
                <option value="">Selecione o local...</option>
                {locais.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.nome}</option>
                ))}
              </select>
            </div>

            <div className="p-5 bg-amber-50 rounded-3xl border border-amber-100">
              <div className="flex gap-3">
                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-amber-800 uppercase tracking-tight">Atenção ao Saldo</p>
                  <p className="text-[10px] font-medium text-amber-700 leading-tight">
                    Ao cadastrar com estoque inicial, este valor será contabilizado imediatamente no relatório de matéria-prima.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-black text-white py-5 rounded-[1.8rem] font-black uppercase tracking-[0.15em] text-xs shadow-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-3 disabled:opacity-20 active:scale-95"
          >
            {loading ? "SALVANDO..." : <><CheckCircle2 size={18} /> Confirmar Cadastro</>}
          </button>
        </div>

      </form>
    </div>
  );
}
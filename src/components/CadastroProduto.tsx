import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  PackagePlus, Save, MapPin, 
  Plus, Trash2, ListTree, Edit3, Tags 
} from 'lucide-react';

interface Categoria { id: string; nome: string; }
interface Local { id: string; nome: string; }
interface InsumoMestre { id: string; nome: string; } // Interface para a tabela 'insumos'

interface Props {
  produtoParaEditar?: any;
  onSucesso?: () => void;
}

export function CadastroProduto({ produtoParaEditar, onSucesso }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  const [listaInsumos, setListaInsumos] = useState<InsumoMestre[]>([]); // Busca da tabela 'insumos'
  const [loading, setLoading] = useState(false);
  
  // Estados do Produto Principal (Tabela: produtos)
  const [nome, setNome] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [tipo, setTipo] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [nivelDificuldade, setNivelDificuldade] = useState('1');
  const [qtdPadrao, setQtdPadrao] = useState('50');
  const [localId, setLocalId] = useState('');

  // Estado da Ficha Técnica (Relaciona Produto com Insumos)
  const [composicao, setComposicao] = useState<{insumo_id: string, quantidade: number}[]>([]);

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    if (produtoParaEditar) preencherEdicao();
  }, [produtoParaEditar]);

  async function carregarDadosIniciais() {
    const { data: cats } = await supabase.from('categorias').select('id, nome').order('nome');
    const { data: locs } = await supabase.from('locais').select('id, nome').order('nome');
    // BUSCA APENAS DA TABELA DE INSUMOS PARA A FICHA TÉCNICA
    const { data: ins } = await supabase.from('insumos').select('id, nome').order('nome');
    
    if (cats) setCategorias(cats);
    if (locs) setLocais(locs);
    if (ins) setListaInsumos(ins);
  }

  async function preencherEdicao() {
    setNome(produtoParaEditar.nome || '');
    setSku(produtoParaEditar.sku || '');
    setBarcode(produtoParaEditar.barcode || '');
    setTipo(produtoParaEditar.tipo || '');
    setTamanho(produtoParaEditar.tamanho || '');
    setCategoriaId(produtoParaEditar.categoria_id || '');
    setLocalId(produtoParaEditar.local_id || '');
    setNivelDificuldade(String(produtoParaEditar.nivel_dificuldade || '1'));
    setQtdPadrao(String(produtoParaEditar.qtd_padrao || '50'));

    // Busca o que este produto consome na tabela de ligação
    const { data: comp } = await supabase
      .from('produto_composicao')
      .select('insumo_id, quantidade_consumida')
      .eq('produto_pai_id', produtoParaEditar.id);
    
    if (comp) {
      setComposicao(comp.map(c => ({ insumo_id: c.insumo_id, quantidade: c.quantidade_consumida })));
    }
  }

  async function handleNovoLocal() {
    const novoNome = prompt("Digite o nome do novo local:");
    if (!novoNome) return;
    const { data, error } = await supabase.from('locais').insert([{ nome: novoNome.toUpperCase() }]).select();
    if (error) alert("Erro: " + error.message);
    else if (data) {
      setLocais([...locais, data[0]]);
      setLocalId(data[0].id);
    }
  }

  const adicionarInsumo = () => setComposicao([...composicao, { insumo_id: '', quantidade: 1 }]);
  const removerInsumo = (index: number) => setComposicao(composicao.filter((_, i) => i !== index));
  const atualizarInsumo = (index: number, campo: string, valor: any) => {
    const novaComp = [...composicao];
    novaComp[index] = { ...novaComp[index], [campo]: valor };
    setComposicao(novaComp);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const dados = { 
      nome: nome.toUpperCase(), sku: sku || null, barcode: barcode || null, 
      tipo: tipo || null, tamanho: tamanho || null, categoria_id: categoriaId,
      nivel_dificuldade: parseInt(nivelDificuldade), qtd_padrao: parseInt(qtdPadrao),
      local_id: localId || null 
    };

    try {
      let prodId = produtoParaEditar?.id;

      if (produtoParaEditar) {
        await supabase.from('produtos').update(dados).eq('id', prodId);
        await supabase.from('produto_composicao').delete().eq('produto_pai_id', prodId);
      } else {
        const { data, error } = await supabase.from('produtos').insert([dados]).select().single();
        if (error) throw error;
        prodId = data.id;
      }

      // Salva a lista de insumos que acompanham o produto
      if (composicao.length > 0) {
        const inserts = composicao.filter(c => c.insumo_id).map(c => ({
          produto_pai_id: prodId,
          insumo_id: c.insumo_id, // ID da tabela 'insumos'
          quantidade_consumida: c.quantidade
        }));
        await supabase.from('produto_composicao').insert(inserts);
      }

      alert(produtoParaEditar ? '✅ Alterações Salvas!' : '✅ Produto Cadastrado!');
      if (!produtoParaEditar) reset();
      if (onSucesso) onSucesso();
    } catch (err: any) {
      alert('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const reset = () => {
    setNome(''); setSku(''); setBarcode(''); setTipo(''); setTamanho('');
    setCategoriaId(''); setLocalId(''); setComposicao([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 p-4">
      <header className="flex items-center gap-3 mb-2">
        <div className={`${produtoParaEditar ? 'bg-amber-500' : 'bg-blue-600'} p-2 rounded-lg shadow-lg`}>
          {produtoParaEditar ? <Edit3 className="text-white" size={24} /> : <PackagePlus className="text-white" size={24} />}
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
            {produtoParaEditar ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <p className="text-gray-500 text-sm">Vincule o produto principal aos seus insumos.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BLOCO 1: DADOS DO PRODUTO PRINCIPAL */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Nome do Produto Principal (Ex: Balão Vermelho)</label>
              <input required className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-blue-500" value={nome} onChange={e => setNome(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">SKU</label>
              <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-blue-500" value={sku} onChange={e => setSku(e.target.value)} />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Cód. Barras Principal</label>
              <input className="w-full p-4 bg-gray-50 rounded-2xl font-mono text-sm outline-none focus:ring-2 ring-blue-500" value={barcode} onChange={e => setBarcode(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
            {/* NOVO CAMPO: SELEÇÃO DE CATEGORIA */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
                <span><Tags size={14} className="inline mr-1 text-blue-500" /> Categoria</span>
              </label>
              <select required className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-blue-500" value={categoriaId} onChange={e => setCategoriaId(e.target.value)}>
                <option value="">Selecione...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block flex justify-between items-center">
                <span><MapPin size={14} className="inline mr-1 text-blue-500" /> Local no Galpão</span>
                <button type="button" onClick={handleNovoLocal} className="text-blue-600 hover:underline text-[9px]">+ NOVO LOCAL</button>
              </label>
              <select required className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-blue-500" value={localId} onChange={e => setLocalId(e.target.value)}>
                <option value="">Selecione...</option>
                {locais.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
              </select>
            </div>

            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Tipo</label>
                <input className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-blue-500" value={tipo} onChange={e => setTipo(e.target.value)} placeholder="Ex: Metalizado" />
            </div>
            <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Tamanho</label>
                <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-blue-500" value={tamanho} onChange={e => setTamanho(e.target.value)}>
                    <option value="">Opcional</option>
                    <option value="5">5"</option><option value="9">9"</option><option value="P">P</option><option value="M">M</option><option value="G">G</option>
                </select>
            </div>
          </div>
        </div>

        {/* BLOCO 2: INSUMOS QUE ACOMPANHAM (Tabela 'insumos') */}
        <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl text-white space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <ListTree size={18} className="text-blue-400" /> Insumos do Kit (Sacola, Encarte, etc)
            </h3>
            <button type="button" onClick={adicionarInsumo} className="bg-blue-600 p-2 rounded-xl hover:bg-blue-500 transition-all">
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {composicao.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 bg-gray-800 p-4 rounded-2xl border border-gray-700 items-end">
                <div className="flex-1 w-full">
                  <label className="text-[9px] font-black text-gray-500 uppercase mb-2 block">Selecionar Insumo</label>
                  <select 
                    className="w-full bg-gray-900 p-3 rounded-xl text-sm font-bold border border-gray-700 text-white outline-none"
                    value={item.insumo_id}
                    onChange={e => atualizarInsumo(index, 'insumo_id', e.target.value)}
                  >
                    <option value="">Selecione na lista de insumos...</option>
                    {listaInsumos.map(ins => <option key={ins.id} value={ins.id}>{ins.nome}</option>)}
                  </select>
                </div>
                <div className="w-32">
                  <label className="text-[9px] font-black text-gray-500 uppercase mb-2 block">Qtd p/ 1 Unid</label>
                  <input 
                    type="number" step="0.1"
                    className="w-full bg-gray-900 p-3 rounded-xl text-sm font-black border border-gray-700 text-blue-400 outline-none"
                    value={item.quantidade}
                    onChange={e => atualizarInsumo(index, 'quantidade', parseFloat(e.target.value))}
                  />
                </div>
                <button type="button" onClick={() => removerInsumo(index)} className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            {composicao.length === 0 && <p className="text-center text-gray-600 text-[10px] font-black py-4">NENHUM INSUMO ADICIONADO AO PRODUTO</p>}
          </div>
        </div>

        {/* BLOCO 3: CONFIG DE PRODUÇÃO */}
        <div className="bg-blue-50/50 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 border border-blue-100">
          <div>
            <label className="text-[10px] font-black text-blue-600 uppercase mb-2 block">Dificuldade da Montagem ({nivelDificuldade})</label>
            <input type="range" min="1" max="5" className="w-full accent-blue-600" value={nivelDificuldade} onChange={e => setNivelDificuldade(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-black text-blue-600 uppercase mb-2 block text-right">Qtd Padrão (Fardo)</label>
            <input type="number" className="w-full p-4 bg-white border border-blue-100 rounded-2xl font-black text-blue-700 text-sm outline-none" value={qtdPadrao} onChange={e => setQtdPadrao(e.target.value)} />
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit"
          className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl transition-all ${
            produtoParaEditar ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
          } text-white flex items-center justify-center gap-3`}
        >
          {loading ? 'SALVANDO...' : <><Save size={20} /> {produtoParaEditar ? 'Salvar Alterações' : 'Concluir Cadastro'}</>}
        </button>
      </form>
    </div>
  );
}
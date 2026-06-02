import { useState } from 'react';
import {  
  Package, 
  AlertTriangle, 
  PlusCircle, 
  Truck, 
  Users, 
  UserPlus, 
  ArrowUpRight, 
  ArrowDownLeft,
  BarChart3,
  LineChart,
  Banknote,
  ClipboardIcon,
  Contact
} from 'lucide-react';

// IMPORTANTE: Verifique se esses arquivos existem na pasta /components
// Se algum deles não existir, o React dará tela branca.
import { VisualizacaoEstoque } from './components/VisualizacaoEstoque';
import { ControleEstoqueBaixo } from './components/ControleEstoqueBaixo';
import { CadastroProduto } from './components/CadastroProduto';
import { EntradaEstoque } from './components/EntradaEstoque';
import { CadastroFreelancer } from './components/CadastroFreelancer';
import { CadastroFuncionario } from './components/CadastroFuncionario';
import { MontagemKit } from './components/MontagemKit';
import { DevolucaoProducao } from './components/DevolucaoProducao';
import { Dashboard } from './components/Dashboard';
import { KitsProntos } from './components/KitsProntos';
import { HistoricoProducao } from './components/HistoricoProducao';
import { PagamentosFreelancer } from './components/PagamentosFreelancer';
import { PlanejamentoDiario } from './components/PlanejamentoDiario';
import { CartoesDistribuicao } from './components/CartoesDistribuicao';
import { CadastroInsumos } from './components/CadastroInsumos';
import { EntradaInsumos } from './components/EntradaInsumos';

export default function App() {
  const [activeTab, setActiveTab] = useState('estoque_vis');

  // Estrutura de Menu
  const menuSections = [
    {
      title: "Análise",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} />, component: <Dashboard /> },
      ]
    },
    {
      title: "Gerência de Estoque",
      items: [
        { id: 'estoque_vis', label: 'Estoque', icon: <Package size={18} />, component: <VisualizacaoEstoque /> },
        { id: 'estoque_baixo', label: 'Estoque Baixo', icon: <AlertTriangle size={18} />, component: <ControleEstoqueBaixo /> },
        { id: 'prod_cadastro', label: 'Cadastro de Produto', icon: <PlusCircle size={18} />, component: <CadastroProduto /> },
        { id: 'estoque_entrada', label: 'Entrada de Estoque', icon: <Truck size={18} />, component: <EntradaEstoque /> },
        { id: 'insumos_cadastro', label: 'Cadastro de Insumos', icon: <Package size={18} />, component: <CadastroInsumos /> },
        { id: 'insumos_entrada', label: 'Entrada de Insumos', icon: <ArrowUpRight size={18} />, component: <EntradaInsumos /> },
      ]
    },
    {
      title: "Gerência de Pessoas",
      items: [
        { id: 'free_cadastro', label: 'Gerenciar Freelancers', icon: <Users size={18} />, component: <CadastroFreelancer /> },
        { id: 'func_cadastro', label: 'Gerenciar Funcionários', icon: <UserPlus size={18} />, component: <CadastroFuncionario /> },
        { id: 'free_pagamento', label: 'Pagamentos Freelancer', icon: <Banknote size={18} />, component: <PagamentosFreelancer /> },
      ]
    },
    {
      title: "Produção / Unitarização",
      items: [
        { id: 'planj_dia', label: 'Planejamento Diario', icon: <ClipboardIcon size={18} />, component: <PlanejamentoDiario /> },
        { id: 'card_dist', label: 'Cartoes Distribuicao', icon: < Contact size={18} />, component: <CartoesDistribuicao /> },
        { id: 'saida_prod', label: 'Bipagem de Kit', icon: <ArrowUpRight size={18} />, component: <MontagemKit /> },
        { id: 'kits_prontos', label: 'Kits Prontos', icon: <Truck size={18} />, component: <KitsProntos /> },
        { id: 'retorno_prod', label: 'Devolução Produção', icon: <ArrowDownLeft size={18} />, component: <DevolucaoProducao /> },
        { id: 'hist_prod', label: 'Historico Producão', icon: <LineChart size={18} />, component: <HistoricoProducao /> },
      ]
    }
  ];

  // Função para renderizar o conteúdo com proteção contra erro
  const renderContent = () => {
    let activeComponent = null;
    menuSections.forEach(section => {
      const found = section.items.find(item => item.id === activeTab);
      if (found) activeComponent = found.component;
    });
    return activeComponent || <div className="p-10">Erro ao carregar componente.</div>;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen shadow-sm z-10">
        
        {/* LOGO GRUPO FESTA */}
        <div className="p-8 border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 shrink-0 border border-gray-100">
              <img 
                src="/src/assets/logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "https://ui-avatars.com/api/?name=Grupo+Festa&background=ef4444&color=fff";
                }}
              />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-black text-xl tracking-tighter uppercase leading-none text-gray-800">
                Grupo <span className="text-red-600">Festa</span>
              </h1>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Gestão de Produção
              </p>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-4 py-2 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                {section.title}
              </h3>
              
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer group ${
                    activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                    : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Servidor Ativo</span>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto h-screen">
        <div className="p-10 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

    </div>
  );
}
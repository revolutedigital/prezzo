import Link from "next/link";
import { ArrowRight, Calculator, TrendingUp, Clock, Shield, Users, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm fixed w-full top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Prezzo</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#funcionalidades" className="text-gray-600 hover:text-blue-600 transition">Funcionalidades</a>
            <a href="#beneficios" className="text-gray-600 hover:text-blue-600 transition">Benefícios</a>
            <a href="#industrias" className="text-gray-600 hover:text-blue-600 transition">Indústrias</a>
          </nav>
          <Link
            href="/login"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-medium"
          >
            Acessar Sistema
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Precifique Seus Produtos com
              <span className="text-blue-500"> Precisão Absoluta</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Sistema completo de gestão de custos para indústrias. Calcule matéria-prima, mão de obra e margem de lucro em tempo real. Tome decisões baseadas em dados reais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-blue-500 text-white px-8 py-4 rounded-lg hover:bg-blue-600 transition font-semibold text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#funcionalidades"
                className="bg-white text-gray-900 px-8 py-4 rounded-lg hover:bg-gray-50 transition font-semibold text-lg border-2 border-gray-200"
              >
                Conhecer Funcionalidades
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-500 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Precisão nos Cálculos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">60%</div>
              <div className="text-blue-100">Redução de Tempo</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-blue-100">Controle de Custos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Disponibilidade</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Funcionalidades Completas</h2>
            <p className="text-xl text-gray-600">Tudo que você precisa para gerenciar seus custos em um só lugar</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border-2 border-gray-100 hover:border-blue-500 transition hover:shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cálculo Automático de Custos</h3>
              <p className="text-gray-600 leading-relaxed">
                Cadastre matérias-primas, defina composições e calcule custos automaticamente. Sistema considera mão de obra, custos de máquina e margem de lucro.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl border-2 border-gray-100 hover:border-blue-500 transition hover:shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Orçamentos Profissionais</h3>
              <p className="text-gray-600 leading-relaxed">
                Crie orçamentos detalhados com margens personalizadas. Acompanhe propostas, gerencie clientes e converta mais vendas.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl border-2 border-gray-100 hover:border-blue-500 transition hover:shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gestão de Variações</h3>
              <p className="text-gray-600 leading-relaxed">
                Gerencie múltiplas variações de produtos com composições diferentes. Mantenha histórico de custos e compare versões.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl border-2 border-gray-100 hover:border-blue-500 transition hover:shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Controle de Mão de Obra</h3>
              <p className="text-gray-600 leading-relaxed">
                Cadastre tipos de mão de obra com custos por hora. Sistema calcula automaticamente o custo total baseado no tempo necessário.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl border-2 border-gray-100 hover:border-blue-500 transition hover:shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Segurança Total</h3>
              <p className="text-gray-600 leading-relaxed">
                Dados criptografados, backup automático e controle de acesso por usuário. Seus custos protegidos com máxima segurança.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl border-2 border-gray-100 hover:border-blue-500 transition hover:shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-usuário</h3>
              <p className="text-gray-600 leading-relaxed">
                Trabalhe em equipe com controle de permissões. Cada usuário acessa apenas o que precisa, mantendo organização e segurança.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industrias" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Indústrias Atendidas</h2>
            <p className="text-xl text-gray-600">Solução completa para diversos segmentos industriais</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Metalúrgica",
              "Plásticos",
              "Móveis",
              "Confecção",
              "Alimentos",
              "Cosméticos",
              "Embalagens",
              "Eletrônicos",
              "Construção Civil"
            ].map((industry) => (
              <div key={industry} className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 transition">
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {industry}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Por que escolher o Prezzo?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Elimine Erros de Cálculo</h3>
                    <p className="text-gray-600">Sistema automatizado que elimina erros humanos e garante precisão absoluta nos seus custos.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Economize Tempo</h3>
                    <p className="text-gray-600">Reduza de horas para minutos o tempo gasto com cálculos de custos e criação de orçamentos.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Aumente Sua Margem</h3>
                    <p className="text-gray-600">Identifique oportunidades de otimização e ajuste suas margens com base em dados reais.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Decisões Baseadas em Dados</h3>
                    <p className="text-gray-600">Tenha visibilidade completa dos seus custos e tome decisões estratégicas fundamentadas.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-12 rounded-2xl text-white">
              <h3 className="text-3xl font-bold mb-6">Comece Hoje Mesmo</h3>
              <p className="text-blue-50 mb-8 text-lg">
                Transforme a forma como sua indústria gerencia custos e precifica produtos. Sistema pronto para usar.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition font-semibold text-lg"
              >
                Acessar o Sistema
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="mt-8 pt-8 border-t border-blue-400">
                <p className="text-sm text-blue-50">
                  ✓ Sem instalação<br />
                  ✓ Acesso imediato<br />
                  ✓ Suporte completo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="text-xl font-bold text-white">Prezzo</span>
              </div>
              <p className="text-sm">
                Sistema completo de gestão de custos para indústrias.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#funcionalidades" className="hover:text-blue-500 transition">Funcionalidades</a></li>
                <li><a href="#industrias" className="hover:text-blue-500 transition">Indústrias</a></li>
                <li><a href="#beneficios" className="hover:text-blue-500 transition">Benefícios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-blue-500 transition">Sobre</a></li>
                <li><a href="#" className="hover:text-blue-500 transition">Contato</a></li>
                <li><a href="#" className="hover:text-blue-500 transition">Suporte</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Acesso</h4>
              <Link
                href="/login"
                className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition text-sm font-medium"
              >
                Entrar no Sistema
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>© 2024 Prezzo. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

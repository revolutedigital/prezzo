"use client";

import Link from "next/link";
import { ArrowRight, Calculator, TrendingUp, Clock, Shield, Users, BarChart3, Zap, DollarSign, Target, LineChart } from "lucide-react";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Cursor follower */}
      <div
        className="fixed w-96 h-96 pointer-events-none z-0 transition-transform duration-1000 ease-out"
        style={{
          left: mousePos.x - 192,
          top: mousePos.y - 192,
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <header className="fixed w-full top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 relative">
              <div className="absolute inset-0 bg-blue-500 animate-pulse"></div>
              <span className="relative z-10 flex items-center justify-center h-full font-mono font-bold text-black text-lg">P</span>
            </div>
            <span className="text-xl font-mono font-bold tracking-tighter">PREZZO</span>
          </div>
          <nav className="hidden md:flex gap-8 items-center font-mono text-sm">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors uppercase tracking-wider">Features</a>
            <a href="#benefits" className="text-gray-400 hover:text-white transition-colors uppercase tracking-wider">Benefits</a>
            <a href="#industries" className="text-gray-400 hover:text-white transition-colors uppercase tracking-wider">Industries</a>
          </nav>
          <Link
            href="/login"
            className="bg-white text-black px-6 py-2 font-mono text-sm font-bold uppercase tracking-wider hover:bg-blue-500 hover:text-white transition-all duration-300"
          >
            Login →
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-6 pt-32 pb-20">
        {/* Grid background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        {/* Geometric shapes */}
        <div className="absolute top-40 right-20 w-72 h-72 border-2 border-blue-500/20 rotate-45" style={{ transform: `translateY(${scrollY * 0.3}px) rotate(45deg)` }}></div>
        <div className="absolute bottom-40 left-20 w-96 h-96 border border-white/5" style={{ transform: `translateY(${-scrollY * 0.2}px)` }}></div>

        <div className="container mx-auto relative z-10">
          <div className="max-w-5xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 mb-12 border border-blue-500/30 bg-blue-500/5 px-4 py-2">
              <div className="w-2 h-2 bg-blue-500 animate-pulse"></div>
              <span className="font-mono text-xs uppercase tracking-widest text-blue-400">Sistema Profissional</span>
            </div>

            {/* Headline */}
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black mb-10 leading-[0.9] tracking-tighter">
              <span className="block text-white">DESCUBRA</span>
              <span className="block text-white">O CUSTO</span>
              <span className="block text-blue-500">REAL.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-2xl leading-relaxed font-light">
              Chega de precificar no achômetro. <span className="text-white font-medium">Calcule custos exatos</span> de matéria-prima, mão de obra e margem de lucro em <span className="text-blue-500">segundos</span>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-20">
              <Link
                href="/login"
                className="group relative bg-blue-500 text-black px-10 py-5 font-mono font-bold uppercase tracking-wider text-sm overflow-hidden hover:bg-white transition-colors duration-300"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Começar Agora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </Link>
              <a
                href="#features"
                className="border-2 border-white/20 text-white px-10 py-5 font-mono font-bold uppercase tracking-wider text-sm hover:border-blue-500 hover:bg-blue-500/10 transition-all duration-300"
              >
                Ver Funcionalidades
              </a>
            </div>

            {/* Stats inline */}
            <div className="grid grid-cols-3 gap-8 max-w-xl">
              <div className="border-l-2 border-blue-500 pl-4">
                <div className="text-4xl font-black font-mono text-blue-500 mb-1">95%</div>
                <div className="text-xs font-mono uppercase tracking-wider text-gray-500">Precisão</div>
              </div>
              <div className="border-l-2 border-white/20 pl-4">
                <div className="text-4xl font-black font-mono text-white mb-1">60%</div>
                <div className="text-xs font-mono uppercase tracking-wider text-gray-500">Economia</div>
              </div>
              <div className="border-l-2 border-white/20 pl-4">
                <div className="text-4xl font-black font-mono text-white mb-1">24/7</div>
                <div className="text-xs font-mono uppercase tracking-wider text-gray-500">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32 px-6 bg-white text-black">
        <div className="container mx-auto">
          {/* Title */}
          <div className="mb-20">
            <div className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-4">Features</div>
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-6">
              TUDO QUE<br />VOCÊ PRECISA
            </h2>
            <div className="w-24 h-1 bg-blue-500"></div>
          </div>

          {/* Features Grid - Asymmetric */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group bg-black text-white p-8 relative overflow-hidden hover:bg-blue-500 transition-colors duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 translate-x-16 -translate-y-16"></div>
              <Calculator className="w-12 h-12 mb-6 relative z-10" />
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Cálculo Automático</h3>
              <p className="text-gray-400 group-hover:text-gray-200 leading-relaxed">
                Cadastre matérias-primas, defina composições e calcule custos automaticamente.
              </p>
            </div>

            <div className="group bg-black text-white p-8 md:mt-12 relative overflow-hidden hover:bg-blue-500 transition-colors duration-500">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 -translate-x-16 translate-y-16"></div>
              <BarChart3 className="w-12 h-12 mb-6 relative z-10" />
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Orçamentos Pro</h3>
              <p className="text-gray-400 group-hover:text-gray-200 leading-relaxed">
                Crie orçamentos detalhados com margens personalizadas e converta mais vendas.
              </p>
            </div>

            <div className="group bg-black text-white p-8 relative overflow-hidden hover:bg-blue-500 transition-colors duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 translate-x-16 -translate-y-16"></div>
              <TrendingUp className="w-12 h-12 mb-6 relative z-10" />
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Gestão Variações</h3>
              <p className="text-gray-400 group-hover:text-gray-200 leading-relaxed">
                Gerencie múltiplas variações de produtos com composições diferentes.
              </p>
            </div>

            <div className="group bg-black text-white p-8 md:mt-12 relative overflow-hidden hover:bg-blue-500 transition-colors duration-500">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 -translate-x-16 translate-y-16"></div>
              <Clock className="w-12 h-12 mb-6 relative z-10" />
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Mão de Obra</h3>
              <p className="text-gray-400 group-hover:text-gray-200 leading-relaxed">
                Cadastre tipos de mão de obra com custos por hora e cálculo automático.
              </p>
            </div>

            <div className="group bg-black text-white p-8 relative overflow-hidden hover:bg-blue-500 transition-colors duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 translate-x-16 -translate-y-16"></div>
              <Shield className="w-12 h-12 mb-6 relative z-10" />
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Segurança Total</h3>
              <p className="text-gray-400 group-hover:text-gray-200 leading-relaxed">
                Dados criptografados, backup automático e controle de acesso por usuário.
              </p>
            </div>

            <div className="group bg-black text-white p-8 md:mt-12 relative overflow-hidden hover:bg-blue-500 transition-colors duration-500">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 -translate-x-16 translate-y-16"></div>
              <Users className="w-12 h-12 mb-6 relative z-10" />
              <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Multi-usuário</h3>
              <p className="text-gray-400 group-hover:text-gray-200 leading-relaxed">
                Trabalhe em equipe com controle de permissões e organização total.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Split */}
      <section id="benefits" className="relative py-32 px-6 bg-black">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Left - Benefits List */}
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-blue-500 mb-4">Benefits</div>
              <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-16 leading-tight">
                POR QUE<br />PREZZO?
              </h2>

              <div className="space-y-8">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h3 className="text-2xl font-black uppercase mb-3">Zero Erros</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Sistema automatizado que elimina erros humanos e garante precisão absoluta.
                  </p>
                </div>

                <div className="border-l-4 border-white/20 pl-6 hover:border-blue-500 transition-colors">
                  <h3 className="text-2xl font-black uppercase mb-3">Economize Tempo</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Reduza de horas para minutos o tempo gasto com cálculos de custos.
                  </p>
                </div>

                <div className="border-l-4 border-white/20 pl-6 hover:border-blue-500 transition-colors">
                  <h3 className="text-2xl font-black uppercase mb-3">Aumente Margem</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Identifique oportunidades de otimização e ajuste suas margens com dados reais.
                  </p>
                </div>

                <div className="border-l-4 border-white/20 pl-6 hover:border-blue-500 transition-colors">
                  <h3 className="text-2xl font-black uppercase mb-3">Decisões Data-Driven</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Tenha visibilidade completa dos seus custos e tome decisões estratégicas.
                  </p>
                </div>
              </div>
            </div>

            {/* Right - CTA Block */}
            <div className="relative">
              <div className="sticky top-32">
                <div className="bg-blue-500 p-12 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'linear-gradient(rgba(0,0,0,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.2) 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}></div>
                  </div>

                  <div className="relative z-10">
                    <div className="text-black font-mono text-xs uppercase tracking-widest mb-6">Get Started</div>
                    <h3 className="text-5xl font-black text-black mb-6 leading-tight">
                      COMECE<br />HOJE
                    </h3>
                    <p className="text-black/80 text-lg mb-10 leading-relaxed">
                      Transforme a forma como sua indústria gerencia custos e precifica produtos.
                    </p>

                    <Link
                      href="/login"
                      className="inline-block bg-black text-white px-10 py-5 font-mono font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-black transition-colors duration-300 mb-10"
                    >
                      Acessar Sistema →
                    </Link>

                    <div className="space-y-3 border-t-2 border-black/20 pt-8">
                      <div className="flex items-center gap-3 text-black font-mono text-sm">
                        <div className="w-1.5 h-1.5 bg-black"></div>
                        <span>Acesso imediato</span>
                      </div>
                      <div className="flex items-center gap-3 text-black font-mono text-sm">
                        <div className="w-1.5 h-1.5 bg-black"></div>
                        <span>Sem instalação</span>
                      </div>
                      <div className="flex items-center gap-3 text-black font-mono text-sm">
                        <div className="w-1.5 h-1.5 bg-black"></div>
                        <span>Suporte completo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="relative py-32 px-6 bg-white text-black">
        <div className="container mx-auto">
          <div className="mb-16">
            <div className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-4">Industries</div>
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter">
              TODOS OS<br />SETORES
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
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
            ].map((industry, index) => (
              <div
                key={industry}
                className="border border-black/10 p-6 hover:bg-black hover:text-white transition-colors duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold uppercase tracking-wider text-sm">{industry}</span>
                  <div className="w-2 h-2 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black border-t border-white/10 py-16 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-500">
                  <span className="flex items-center justify-center h-full font-mono font-bold text-black text-lg">P</span>
                </div>
                <span className="text-2xl font-mono font-bold tracking-tighter">PREZZO</span>
              </div>
              <p className="text-gray-400 text-sm max-w-md mb-6 font-mono">
                Sistema completo de gestão de custos para indústrias.
              </p>
            </div>

            <div>
              <h4 className="text-white font-mono font-bold mb-4 text-sm uppercase tracking-wider">Produto</h4>
              <ul className="space-y-2 font-mono text-sm">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#industries" className="text-gray-400 hover:text-white transition-colors">Industries</a></li>
                <li><a href="#benefits" className="text-gray-400 hover:text-white transition-colors">Benefits</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-mono font-bold mb-4 text-sm uppercase tracking-wider">Empresa</h4>
              <ul className="space-y-2 font-mono text-sm">
                <li><Link href="/sobre" className="text-gray-400 hover:text-white transition-colors">Sobre</Link></li>
                <li><Link href="/contato" className="text-gray-400 hover:text-white transition-colors">Contato</Link></li>
                <li>
                  <Link href="/login" className="text-blue-500 hover:text-white transition-colors">
                    Login →
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs font-mono">© 2024 PREZZO. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6 text-xs font-mono text-gray-500">
              <Link href="/privacy" className="hover:text-white transition-colors">PRIVACY</Link>
              <Link href="/terms" className="hover:text-white transition-colors">TERMS</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

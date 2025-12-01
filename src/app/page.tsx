"use client";

import Link from "next/link";
import { ArrowRight, Calculator, TrendingUp, Clock, Shield, Users, BarChart3, Check, Star, Zap, Award } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-in-section').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-gray-200/50 bg-white/70 backdrop-blur-xl fixed w-full top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">Prezzo</span>
          </div>
          <nav className="hidden md:flex gap-10 items-center">
            <a href="#funcionalidades" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm tracking-wide">Funcionalidades</a>
            <a href="#beneficios" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm tracking-wide">Benefícios</a>
            <a href="#industrias" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium text-sm tracking-wide">Indústrias</a>
          </nav>
          <Link
            href="/login"
            className="relative bg-gradient-to-r from-blue-500 to-blue-600 text-white px-7 py-2.5 rounded-xl hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 font-semibold text-sm tracking-wide group overflow-hidden"
          >
            <span className="relative z-10">Acessar Sistema</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-blue-600/5 rounded-full blur-3xl"></div>
        </div>

        <div className={`container mx-auto max-w-7xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200/50 rounded-full mb-8 group hover:bg-blue-100 transition-colors duration-300">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700 tracking-wide">Sistema de Precificação Inteligente</span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                Precifique Seus Produtos
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                com Precisão Absoluta
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
              Sistema completo de gestão de custos para indústrias. <span className="font-medium text-gray-800">Calcule matéria-prima, mão de obra e margem de lucro</span> em tempo real. Tome decisões baseadas em dados reais.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-12">
              <Link
                href="/login"
                className="group relative bg-gradient-to-r from-blue-500 to-blue-600 text-white px-10 py-5 rounded-2xl hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 overflow-hidden min-w-[240px]"
              >
                <span className="relative z-10">Começar Agora</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <a
                href="#funcionalidades"
                className="group bg-white text-gray-900 px-10 py-5 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-bold text-lg border-2 border-gray-300 hover:border-gray-400 hover:shadow-xl min-w-[240px]"
              >
                Conhecer Funcionalidades
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Sem instalação</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Acesso imediato</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Dados seguros</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 text-white overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            <div className="group fade-in-section">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8" />
              </div>
              <div className="text-6xl font-bold mb-3 bg-gradient-to-br from-white to-blue-100 bg-clip-text text-transparent">95%</div>
              <div className="text-blue-50 font-medium text-lg">Precisão nos Cálculos</div>
            </div>
            <div className="group fade-in-section">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8" />
              </div>
              <div className="text-6xl font-bold mb-3 bg-gradient-to-br from-white to-blue-100 bg-clip-text text-transparent">60%</div>
              <div className="text-blue-50 font-medium text-lg">Redução de Tempo</div>
            </div>
            <div className="group fade-in-section">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="text-6xl font-bold mb-3 bg-gradient-to-br from-white to-blue-100 bg-clip-text text-transparent">100%</div>
              <div className="text-blue-50 font-medium text-lg">Controle de Custos</div>
            </div>
            <div className="group fade-in-section">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8" />
              </div>
              <div className="text-6xl font-bold mb-3 bg-gradient-to-br from-white to-blue-100 bg-clip-text text-transparent">24/7</div>
              <div className="text-blue-50 font-medium text-lg">Disponibilidade</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-32 px-4 bg-gradient-to-b from-white to-gray-50/50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20 fade-in-section">
            <div className="inline-block px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-6">
              <span className="text-sm font-semibold text-blue-700 tracking-wide">FUNCIONALIDADES</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Tudo que Você Precisa
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
              Gerencie seus custos em um só lugar com ferramentas profissionais
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group fade-in-section bg-white p-10 rounded-3xl border border-gray-200 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Cálculo Automático de Custos</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Cadastre matérias-primas, defina composições e calcule custos automaticamente. Sistema considera mão de obra, custos de máquina e margem de lucro.
              </p>
            </div>
            <div className="group fade-in-section bg-white p-10 rounded-3xl border border-gray-200 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Orçamentos Profissionais</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Crie orçamentos detalhados com margens personalizadas. Acompanhe propostas, gerencie clientes e converta mais vendas.
              </p>
            </div>
            <div className="group fade-in-section bg-white p-10 rounded-3xl border border-gray-200 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Gestão de Variações</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Gerencie múltiplas variações de produtos com composições diferentes. Mantenha histórico de custos e compare versões.
              </p>
            </div>
            <div className="group fade-in-section bg-white p-10 rounded-3xl border border-gray-200 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Controle de Mão de Obra</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Cadastre tipos de mão de obra com custos por hora. Sistema calcula automaticamente o custo total baseado no tempo necessário.
              </p>
            </div>
            <div className="group fade-in-section bg-white p-10 rounded-3xl border border-gray-200 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Segurança Total</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Dados criptografados, backup automático e controle de acesso por usuário. Seus custos protegidos com máxima segurança.
              </p>
            </div>
            <div className="group fade-in-section bg-white p-10 rounded-3xl border border-gray-200 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">Multi-usuário</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
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
      <section id="beneficios" className="py-32 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="fade-in-section">
              <div className="inline-block px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-6">
                <span className="text-sm font-semibold text-blue-700 tracking-wide">BENEFÍCIOS</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-bold mb-12 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                Por que escolher<br />o Prezzo?
              </h2>
              <div className="space-y-8">
                <div className="group flex gap-5 p-6 rounded-2xl hover:bg-blue-50/50 transition-all duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Elimine Erros de Cálculo</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">Sistema automatizado que elimina erros humanos e garante precisão absoluta nos seus custos.</p>
                  </div>
                </div>
                <div className="group flex gap-5 p-6 rounded-2xl hover:bg-blue-50/50 transition-all duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Economize Tempo</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">Reduza de horas para minutos o tempo gasto com cálculos de custos e criação de orçamentos.</p>
                  </div>
                </div>
                <div className="group flex gap-5 p-6 rounded-2xl hover:bg-blue-50/50 transition-all duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Aumente Sua Margem</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">Identifique oportunidades de otimização e ajuste suas margens com base em dados reais.</p>
                  </div>
                </div>
                <div className="group flex gap-5 p-6 rounded-2xl hover:bg-blue-50/50 transition-all duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Decisões Baseadas em Dados</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">Tenha visibilidade completa dos seus custos e tome decisões estratégicas fundamentadas.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative fade-in-section">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl blur-2xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-12 md:p-16 rounded-3xl text-white shadow-2xl shadow-blue-500/25 overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                  <Star className="w-12 h-12 mb-6 text-yellow-300" fill="currentColor" />
                  <h3 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Comece Hoje Mesmo</h3>
                  <p className="text-blue-50 mb-10 text-xl leading-relaxed">
                    Transforme a forma como sua indústria gerencia custos e precifica produtos. Sistema pronto para usar.
                  </p>
                  <Link
                    href="/login"
                    className="group inline-flex items-center gap-3 bg-white text-blue-600 px-10 py-5 rounded-2xl hover:bg-blue-50 transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    Acessar o Sistema
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <div className="mt-10 pt-10 border-t border-white/20">
                    <div className="flex flex-col gap-3 text-base text-blue-50">
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-blue-200" />
                        <span className="font-medium">Sem instalação</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-blue-200" />
                        <span className="font-medium">Acesso imediato</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-blue-200" />
                        <span className="font-medium">Suporte completo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-400 py-20 px-4 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">P</span>
                </div>
                <span className="text-3xl font-bold text-white">Prezzo</span>
              </div>
              <p className="text-gray-400 text-lg mb-6 max-w-md leading-relaxed">
                Sistema completo de gestão de custos para indústrias. Calcule, gerencie e otimize seus processos de precificação.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Produto</h4>
              <ul className="space-y-3">
                <li><a href="#funcionalidades" className="hover:text-blue-400 transition-colors duration-200 text-base">Funcionalidades</a></li>
                <li><a href="#industrias" className="hover:text-blue-400 transition-colors duration-200 text-base">Indústrias</a></li>
                <li><a href="#beneficios" className="hover:text-blue-400 transition-colors duration-200 text-base">Benefícios</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-base">Preços</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Empresa</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-base">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-base">Contato</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors duration-200 text-base">Suporte</a></li>
                <li>
                  <Link href="/login" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium text-base">
                    Acessar Sistema
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">© 2024 Prezzo. Todos os direitos reservados.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-blue-400 transition-colors duration-200">Privacidade</a>
              <a href="#" className="hover:text-blue-400 transition-colors duration-200">Termos</a>
              <a href="#" className="hover:text-blue-400 transition-colors duration-200">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

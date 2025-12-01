"use client";

import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    empresa: "",
    mensagem: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    alert("Mensagem enviada! Entraremos em contato em breve.");
    setFormData({ nome: "", email: "", empresa: "", mensagem: "" });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed w-full top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500">
              <span className="flex items-center justify-center h-full font-mono font-bold text-black text-lg">P</span>
            </div>
            <span className="text-xl font-mono font-bold tracking-tighter">PREZZO</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-mono text-sm uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-16">
            <div className="font-mono text-xs uppercase tracking-widest text-blue-500 mb-4">Contact</div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6">FALE<br />CONOSCO</h1>
            <div className="w-24 h-1 bg-blue-500"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-gray-400 mb-2">Nome</label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 font-mono text-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 font-mono text-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-gray-400 mb-2">Empresa</label>
                  <input
                    type="text"
                    value={formData.empresa}
                    onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 font-mono text-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-wider text-gray-400 mb-2">Mensagem</label>
                  <textarea
                    required
                    rows={6}
                    value={formData.mensagem}
                    onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 font-mono text-white focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-black px-10 py-4 font-mono font-bold uppercase tracking-wider hover:bg-white transition-colors duration-300"
                >
                  Enviar Mensagem
                </button>
              </form>
            </div>

            <div className="space-y-8">
              <div className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <Mail className="w-6 h-6 text-blue-500" />
                  <h3 className="font-mono font-bold uppercase text-xl">Email</h3>
                </div>
                <p className="text-gray-400 font-mono">contato@prezzo.com.br</p>
              </div>

              <div className="border-l-4 border-white/20 pl-6">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="w-6 h-6 text-white" />
                  <h3 className="font-mono font-bold uppercase text-xl">Suporte</h3>
                </div>
                <p className="text-gray-400 font-mono">Resposta em até 24h</p>
              </div>

              <div className="mt-12 p-8 bg-blue-500">
                <h3 className="text-2xl font-black text-black mb-4 uppercase">Pronto para Começar?</h3>
                <p className="text-black/80 font-mono mb-6">Acesse o sistema agora mesmo.</p>
                <Link
                  href="/login"
                  className="inline-block bg-black text-white px-8 py-3 font-mono font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-black transition-colors duration-300"
                >
                  Acessar Sistema →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

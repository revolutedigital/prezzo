import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Sobre | Prezzo",
  description: "Conheça a história e missão do Prezzo",
};

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500">
              <span className="flex items-center justify-center h-full font-mono font-bold text-black text-lg">P</span>
            </div>
            <span className="text-xl font-mono font-bold tracking-tighter">PREZZO</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-mono text-sm uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Title */}
          <div className="mb-16">
            <div className="font-mono text-xs uppercase tracking-widest text-blue-500 mb-4">About</div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6">
              SOBRE O<br />PREZZO
            </h1>
            <div className="w-24 h-1 bg-blue-500"></div>
          </div>

          {/* Story */}
          <div className="space-y-12 font-mono text-lg leading-relaxed text-gray-300">
            <section>
              <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">Nossa História</h2>
              <p className="mb-4">
                O Prezzo nasceu da experiência real de empresários que enfrentaram os desafios da precificação industrial no dia a dia.
              </p>
              <p>
                Fundado por <span className="text-white font-bold">Giovanni Mannelli</span>, empresário à frente da Brafiltros, empresa especializada em filtração industrial, e <span className="text-white font-bold">Igor Rosso Silveira</span>, fundador da Revolute Digital, agência que já investiu mais de R$ 15 milhões em tráfego pago e atendeu mais de 300 clientes.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">O Problema</h2>
              <p className="mb-4">
                Gerenciar custos de produção é complexo. Matérias-primas, mão de obra, máquinas, margens - cada centavo precisa ser contabilizado com precisão.
              </p>
              <p>
                Planilhas manuais levam horas, são propensas a erros e não escalam. Sistemas empresariais são caros e complexos demais para a maioria das indústrias.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">A Solução</h2>
              <p className="mb-4">
                Criamos um sistema profissional de gestão de custos e precificação que é <span className="text-blue-500 font-bold">simples de usar, mas poderoso o suficiente</span> para dar controle total sobre cada aspecto da sua precificação.
              </p>
              <p>
                Automatizamos cálculos, eliminamos erros humanos e damos visibilidade completa de onde sua margem está vazando.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">Nossa Missão</h2>
              <p>
                Dar para cada indústria, independente do tamanho, <span className="text-white font-bold">o poder de precificar com precisão absoluta</span>, tomar decisões baseadas em dados reais e maximizar suas margens de lucro.
              </p>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-20 p-12 bg-blue-500">
            <h3 className="text-4xl font-black text-black mb-6 uppercase">Pronto para Começar?</h3>
            <p className="text-black/80 text-lg mb-8 font-mono">
              Transforme a forma como sua indústria gerencia custos e precifica produtos.
            </p>
            <Link
              href="/login"
              className="inline-block bg-black text-white px-10 py-5 font-mono font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-black transition-colors duration-300"
            >
              Acessar Sistema →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

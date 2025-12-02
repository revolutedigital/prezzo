import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidade | Prezzo",
  description: "Política de privacidade do Prezzo",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed w-full top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500">
              <span className="flex items-center justify-center h-full font-mono font-bold text-black text-lg">
                P
              </span>
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

      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-16">
            <div className="font-mono text-xs uppercase tracking-widest text-blue-500 mb-4">
              Legal
            </div>
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6">
              POLÍTICA DE
              <br />
              PRIVACIDADE
            </h1>
            <div className="w-24 h-1 bg-blue-500 mb-6"></div>
            <p className="font-mono text-gray-400">Última atualização: Dezembro 2024</p>
          </div>

          <div className="space-y-8 font-mono leading-relaxed text-gray-300">
            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase">1. Coleta de Dados</h2>
              <p>
                Coletamos apenas os dados necessários para operar o sistema: nome, email,
                informações de empresa e dados de custos/produtos inseridos por você.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase">2. Uso dos Dados</h2>
              <p>
                Seus dados são usados exclusivamente para prover os serviços do Prezzo. Não
                vendemos, compartilhamos ou utilizamos seus dados para outros fins.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase">3. Segurança</h2>
              <p>
                Utilizamos criptografia e medidas de segurança padrão da indústria para proteger
                seus dados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase">4. Seus Direitos</h2>
              <p>
                Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento
                através do contato@prezzo.com.br
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase">5. Cookies</h2>
              <p>
                Utilizamos apenas cookies essenciais para autenticação e funcionamento do sistema.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase">6. LGPD</h2>
              <p>Estamos em conformidade com a Lei Geral de Proteção de Dados (LGPD).</p>
            </section>
          </div>

          <div className="mt-16 p-8 border border-white/10">
            <p className="font-mono text-gray-400 text-sm">
              Para dúvidas sobre privacidade, entre em contato:{" "}
              <span className="text-blue-500">contato@prezzo.com.br</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

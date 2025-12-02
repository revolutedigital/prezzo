import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Termos de Uso | Prezzo",
  description: "Termos de uso do Prezzo",
};

export default function TermsPage() {
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
              TERMOS DE
              <br />
              USO
            </h1>
            <div className="w-24 h-1 bg-blue-500 mb-6"></div>
            <p className="font-mono text-gray-400">Última atualização: Dezembro 2024</p>
          </div>

          <div className="space-y-8 font-mono leading-relaxed text-gray-300">
            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase">
                1. Aceitação dos Termos
              </h2>
              <p>Ao acessar e usar o Prezzo, você concorda com estes termos de uso.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase">2. Uso do Serviço</h2>
              <p>
                O Prezzo é um sistema de gestão de custos e precificação. Você é responsável pela
                precisão dos dados inseridos e pelas decisões tomadas baseadas neles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase">3. Conta de Usuário</h2>
              <p>
                Você é responsável por manter a segurança da sua conta e senha. Não compartilhe suas
                credenciais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase">
                4. Propriedade dos Dados
              </h2>
              <p>
                Você mantém total propriedade sobre seus dados. Nós apenas armazenamos e processamos
                conforme necessário para prover o serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase">
                5. Limitação de Responsabilidade
              </h2>
              <p>
                O Prezzo é fornecido &quot;como está&quot;. Não nos responsabilizamos por decisões
                de negócio tomadas com base nos dados do sistema.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase">6. Cancelamento</h2>
              <p>
                Você pode cancelar sua conta a qualquer momento. Seus dados serão excluídos conforme
                nossa política de privacidade.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-white mb-4 uppercase">7. Modificações</h2>
              <p>
                Reservamo-nos o direito de modificar estes termos. Mudanças significativas serão
                comunicadas por email.
              </p>
            </section>
          </div>

          <div className="mt-16 p-8 border border-white/10">
            <p className="font-mono text-gray-400 text-sm">
              Dúvidas sobre os termos? Entre em contato:{" "}
              <span className="text-blue-500">contato@prezzo.com.br</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

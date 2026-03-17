export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <a href="/" className="text-orange-400 hover:text-orange-300 text-sm mb-8 inline-block">
          ← Voltar ao início
        </a>

        <h1 className="text-3xl font-bold text-white mb-8">
          Política de Privacidade
        </h1>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Dados Coletados</h2>
            <p>
              Coletamos as seguintes informações fornecidas voluntariamente pelo
              participante: nome completo, endereço de e-mail, número de telefone
              (WhatsApp), endereço IP e informações do navegador.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. Finalidade</h2>
            <p>
              Os dados coletados são utilizados para: gerenciamento da participação
              no sorteio, envio dos números da sorte via WhatsApp, comunicação sobre
              o resultado do sorteio, e envio de comunicações de marketing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. Rastreamento (UTM)</h2>
            <p>
              Utilizamos parâmetros UTM para fins de análise de campanhas de
              marketing. Estes dados são usados internamente para medir a eficácia
              das nossas ações de divulgação.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Meta Pixel</h2>
            <p>
              Utilizamos o Meta Pixel (Facebook Pixel) para rastrear conversões e
              otimizar nossas campanhas publicitárias. Este pixel coleta dados
              anônimos sobre a interação dos visitantes com nosso site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Compartilhamento</h2>
            <p>
              Não compartilhamos seus dados pessoais com terceiros, exceto quando
              necessário para a operação do sorteio (ex: envio de mensagens via
              WhatsApp através da API da Meta).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Seus Direitos</h2>
            <p>
              Você pode solicitar a exclusão dos seus dados a qualquer momento
              entrando em contato conosco. A exclusão dos dados implica na
              desistência da participação no sorteio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">7. Segurança</h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus dados
              pessoais contra acesso não autorizado, perda ou destruição.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

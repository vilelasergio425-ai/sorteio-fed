export default function RegulamentoPage() {
  return (
    <main className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <a href="/" className="text-orange-400 hover:text-orange-300 text-sm mb-8 inline-block">
          ← Voltar ao início
        </a>

        <h1 className="text-3xl font-bold text-white mb-8">
          Regulamento do Sorteio
        </h1>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Do Sorteio</h2>
            <p>
              Este sorteio é uma promoção 100% gratuita, sem necessidade de compra
              ou pagamento de qualquer valor para participação.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. Participação</h2>
            <p>
              Para participar, o interessado deve preencher o formulário de
              inscrição com nome completo, e-mail válido e número de WhatsApp ativo.
              Cada participante receberá 100 (cem) números da sorte, gerados
              aleatoriamente no intervalo de 0 a 99.999.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. Números Duplicados</h2>
            <p>
              Os números gerados podem se repetir entre diferentes participantes.
              Isso não configura erro ou irregularidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Confirmação</h2>
            <p>
              A confirmação de participação é realizada exclusivamente via WhatsApp.
              O participante receberá uma mensagem com o link para visualizar seus
              números da sorte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Premiação</h2>
            <p>
              O prêmio consiste em 01 (um) iPhone 17 Pro Max 256GB, cor Titânio
              Natural. O vencedor será contactado pelo mesmo número de WhatsApp
              utilizado na inscrição.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Isenção de Responsabilidade</h2>
            <p>
              Este sorteio NÃO possui qualquer vínculo, patrocínio ou endosso da
              Apple Inc., suas subsidiárias ou afiliadas. iPhone é uma marca
              registrada da Apple Inc.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">7. Uso de Dados</h2>
            <p>
              Os dados fornecidos serão utilizados exclusivamente para fins de
              comunicação relacionada ao sorteio e ações de marketing. Consulte
              nossa{' '}
              <a href="/privacidade" className="text-orange-400 hover:text-orange-300">
                Política de Privacidade
              </a>{' '}
              para mais detalhes.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

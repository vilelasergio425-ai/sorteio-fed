import LeadForm from '@/components/LeadForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-600/20 via-transparent to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 py-12 sm:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            {/* Left - Text + Form */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-block bg-orange-500/20 text-orange-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
                SORTEIO 100% GRATUITO
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Concorra a um{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                  iPhone 17 Pro Max
                </span>
              </h1>

              <p className="text-gray-300 text-lg sm:text-xl mb-8 max-w-lg mx-auto lg:mx-0">
                Preencha seus dados e receba{' '}
                <strong className="text-white">100 números da sorte</strong>{' '}
                diretamente no seu WhatsApp. Sem pegadinhas!
              </p>

              <div className="flex justify-center lg:justify-start">
                <LeadForm />
              </div>
            </div>

            {/* Right - Image */}
            <div className="flex-1 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl blur-2xl opacity-30" />
                <img
                  src="/iphone.png"
                  alt="iPhone 17 Pro Max"
                  className="relative w-full max-w-sm object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Como funciona?
        </h2>

        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Preencha seus dados',
              desc: 'Informe seu nome, e-mail e WhatsApp no formulário acima.',
            },
            {
              step: '2',
              title: 'Receba seus números',
              desc: 'Enviamos 100 números da sorte direto no seu WhatsApp.',
            },
            {
              step: '3',
              title: 'Aguarde o sorteio',
              desc: 'Se algum dos seus números for sorteado, você ganha!',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="text-center bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50"
            >
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                {item.title}
              </h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm space-y-2">
          <p>
            Este sorteio NÃO possui qualquer vínculo com a Apple Inc. ou suas
            subsidiárias.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/regulamento"
              className="hover:text-gray-300 transition"
            >
              Regulamento
            </a>
            <a
              href="/privacidade"
              className="hover:text-gray-300 transition"
            >
              Política de Privacidade
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

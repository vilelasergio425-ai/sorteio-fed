declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export function trackEvent(event: string, data?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, data);
  }
}

export function trackLead(leadData?: {
  nome?: string;
  email?: string;
  telefone?: string;
}) {
  trackEvent('Lead', {
    content_name: 'Sorteio iPhone 17 Pro Max',
    ...(leadData && {
      fn: leadData.nome,
      em: leadData.email,
      ph: leadData.telefone?.replace(/\D/g, ''),
    }),
  });
}

export function trackCompleteRegistration(leadData?: {
  nome?: string;
  email?: string;
  telefone?: string;
}) {
  trackEvent('CompleteRegistration', {
    content_name: 'Sorteio iPhone 17 Pro Max',
    status: 'confirmed',
    ...(leadData && {
      fn: leadData.nome,
      em: leadData.email,
      ph: leadData.telefone?.replace(/\D/g, ''),
    }),
  });
}

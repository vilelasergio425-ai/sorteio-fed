declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

async function sha256(value: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(value.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function trackEvent(event: string, data?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, data);
  }
}

export async function trackLead(leadData?: {
  nome?: string;
  email?: string;
  telefone?: string;
}) {
  const hashedData: Record<string, string> = {};

  if (leadData?.nome) {
    hashedData.fn = await sha256(leadData.nome);
  }
  if (leadData?.email) {
    hashedData.em = await sha256(leadData.email);
  }
  if (leadData?.telefone) {
    hashedData.ph = await sha256(leadData.telefone.replace(/\D/g, ''));
  }

  trackEvent('Lead', {
    content_name: 'Sorteio iPhone 17 Pro Max',
    ...hashedData,
  });
}

export async function trackCompleteRegistration(leadData?: {
  nome?: string;
  email?: string;
  telefone?: string;
}) {
  const hashedData: Record<string, string> = {};

  if (leadData?.nome) {
    hashedData.fn = await sha256(leadData.nome);
  }
  if (leadData?.email) {
    hashedData.em = await sha256(leadData.email);
  }
  if (leadData?.telefone) {
    hashedData.ph = await sha256(leadData.telefone.replace(/\D/g, ''));
  }

  trackEvent('CompleteRegistration', {
    content_name: 'Sorteio iPhone 17 Pro Max',
    status: 'confirmed',
    ...hashedData,
  });
}

import { prisma } from './prisma';

async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (error) {
      if (i === retries) throw error;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error('fetch failed after retries');
}

export async function sendWhatsAppMessage(
  leadId: string,
  nome: string,
  telefone: string,
  link: string,
) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'sorteio_quarta';

  if (!token || !phoneId) {
    console.log('WhatsApp not configured, skipping message');
    return;
  }

  const phone = telefone.startsWith('55') ? telefone : `55${telefone}`;

  const payload = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'pt_BR' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: link },
          ],
        },
      ],
    },
  };

  try {
    const res = await fetchWithRetry(
      `https://graph.facebook.com/v22.0/${phoneId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json();

    await prisma.whatsappLog.create({
      data: {
        leadId,
        status: res.ok ? 'sent' : 'failed',
        payload: payload as object,
        response: data as object,
      },
    });

    return data;
  } catch (error) {
    await prisma.whatsappLog.create({
      data: {
        leadId,
        status: 'error',
        payload: payload as object,
        response: { error: String(error) },
      },
    });
  }
}

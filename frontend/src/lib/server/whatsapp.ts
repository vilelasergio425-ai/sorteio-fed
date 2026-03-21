import { prisma } from './prisma';

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
    const res = await fetch(
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

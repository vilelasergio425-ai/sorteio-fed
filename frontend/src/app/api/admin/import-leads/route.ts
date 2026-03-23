import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { validateAdminKey } from '@/lib/server/admin-guard';
import { generateNumbers } from '@/lib/server/numbers';
import { sendWhatsAppMessage } from '@/lib/server/whatsapp';
import { randomBytes } from 'crypto';

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

function normalizePhone(raw: string): string {
  // Remove everything except digits
  let phone = raw.replace(/\D/g, '');
  // Remove leading 55 country code for comparison
  if (phone.startsWith('55') && phone.length > 11) {
    phone = phone.substring(2);
  }
  return phone;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  // Remove country code if present
  let phone = digits;
  if (phone.startsWith('55') && phone.length > 11) {
    phone = phone.substring(2);
  }
  if (phone.length === 11) {
    return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7)}`;
  }
  if (phone.length === 10) {
    return `(${phone.substring(0, 2)}) ${phone.substring(2, 6)}-${phone.substring(6)}`;
  }
  return phone;
}

export async function POST(req: NextRequest) {
  const unauthorized = validateAdminKey(req);
  if (unauthorized) return unauthorized;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Arquivo vazio ou formato invalido' }, { status: 400 });
    }

    // Find active sorteio
    const sorteioAtivo = await prisma.sorteio.findFirst({ where: { ativo: true } });

    // Get all existing phone numbers for duplicate check
    const existingLeads = await prisma.lead.findMany({
      select: { telefoneRaw: true },
    });
    const existingPhones = new Set(existingLeads.map((l) => l.telefoneRaw));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://caminhopremiado.com';

    let imported = 0;
    let duplicates = 0;
    let skipped = 0;
    let whatsappSent = 0;
    let whatsappFailed = 0;

    for (const row of rows) {
      const nome = row['Nome'] || '';
      const email = row['Email'] || '';
      // Try multiple phone columns
      const phoneRaw = row['Número do WhatsApp'] || row['Telefone'] || row['Numero do WhatsApp'] || '';

      if (!nome || !phoneRaw) {
        skipped++;
        continue;
      }

      const telefoneRaw = normalizePhone(phoneRaw);

      if (!telefoneRaw || telefoneRaw.length < 10) {
        skipped++;
        continue;
      }

      // Check duplicate
      if (existingPhones.has(telefoneRaw)) {
        duplicates++;
        continue;
      }

      // Mark as existing to avoid duplicates within same CSV
      existingPhones.add(telefoneRaw);

      const telefone = formatPhone(phoneRaw);
      const token = randomBytes(8).toString('hex');
      const numbers = generateNumbers();

      try {
        const lead = await prisma.lead.create({
          data: {
            nome,
            email: email || '',
            telefone,
            telefoneRaw,
            confirmado: true,
            ip: 'csv-import',
            userAgent: 'csv-import',
            sorteioId: sorteioAtivo?.id || null,
            numbers: {
              createMany: {
                data: numbers.map((n) => ({ numero: n })),
              },
            },
            access: {
              create: { token },
            },
            utms: {
              create: {
                utmSource: 'facebook',
                utmMedium: 'lead_form',
                utmCampaign: null,
                utmContent: null,
                utmTerm: null,
              },
            },
            confirmations: {
              create: {},
            },
          },
        });

        imported++;

        // Send WhatsApp with delay
        const link = `${baseUrl}/p/${token}`;
        try {
          await sendWhatsAppMessage(lead.id, nome, telefoneRaw, link);
          whatsappSent++;
        } catch {
          whatsappFailed++;
        }

        // 1.5s delay between messages to avoid rate limiting
        await new Promise((r) => setTimeout(r, 1500));
      } catch (err) {
        console.error('Error importing lead:', err);
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      total: rows.length,
      imported,
      duplicates,
      skipped,
      whatsappSent,
      whatsappFailed,
    });
  } catch (error) {
    console.error('Error importing leads:', error);
    return NextResponse.json({ message: 'Erro ao importar' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { validateAdminKey } from '@/lib/server/admin-guard';

export async function GET(req: NextRequest) {
  const unauthorized = validateAdminKey(req);
  if (unauthorized) return unauthorized;

  try {
    const pixels = await prisma.metaPixel.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(pixels);
  } catch (error) {
    console.error('Error getting pixels:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = validateAdminKey(req);
  if (unauthorized) return unauthorized;

  try {
    const { pixelId, nome } = await req.json();

    if (!pixelId || !nome) {
      return NextResponse.json({ message: 'pixelId e nome são obrigatórios' }, { status: 400 });
    }

    const pixel = await prisma.metaPixel.create({
      data: { pixelId, nome },
    });

    return NextResponse.json(pixel, { status: 201 });
  } catch (error) {
    console.error('Error creating pixel:', error);
    return NextResponse.json({ message: 'Erro ao criar pixel' }, { status: 500 });
  }
}

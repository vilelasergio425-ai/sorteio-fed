import { NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';

export async function GET() {
  try {
    const pixels = await prisma.metaPixel.findMany({
      where: { ativo: true },
      select: { pixelId: true },
    });
    return NextResponse.json(pixels.map((p) => p.pixelId));
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

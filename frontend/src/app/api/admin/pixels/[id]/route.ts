import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/server/prisma';
import { validateAdminKey } from '@/lib/server/admin-guard';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = validateAdminKey(req);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const body = await req.json();

    const pixel = await prisma.metaPixel.update({
      where: { id },
      data: {
        ...(body.nome !== undefined && { nome: body.nome }),
        ...(body.ativo !== undefined && { ativo: body.ativo }),
      },
    });

    return NextResponse.json(pixel);
  } catch (error) {
    console.error('Error updating pixel:', error);
    return NextResponse.json({ message: 'Erro ao atualizar pixel' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = validateAdminKey(req);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    await prisma.metaPixel.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pixel:', error);
    return NextResponse.json({ message: 'Erro ao deletar pixel' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

export function validateAdminKey(req: NextRequest): NextResponse | null {
  const apiKey = req.headers.get('x-api-key');
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey || apiKey !== adminKey) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function createLead(data: {
  nome: string;
  email: string;
  telefone: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}) {
  const res = await fetch(`${API_URL}/lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || 'Erro ao criar lead');
  }

  return res.json();
}

export async function getParticipant(token: string) {
  const res = await fetch(`${API_URL}/participant/${token}`);

  if (!res.ok) {
    throw new Error('Participante não encontrado');
  }

  return res.json();
}

// Admin API
const ADMIN_API_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || '';

async function adminFetch(path: string) {
  const res = await fetch(`${API_URL}/admin${path}`, {
    headers: { 'x-api-key': ADMIN_API_KEY },
  });

  if (!res.ok) throw new Error('Erro na API admin');
  return res.json();
}

export async function getOverview() {
  return adminFetch('/overview');
}

export async function getLeads(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return adminFetch(`/leads${query}`);
}

export async function getLeadDetail(id: string) {
  return adminFetch(`/leads/${id}`);
}

export async function getCampaigns() {
  return adminFetch('/campaigns');
}

// Pixels
export async function getPixels() {
  return adminFetch('/pixels');
}

export async function createPixel(data: { pixelId: string; nome: string }) {
  const res = await fetch(`${API_URL}/admin/pixels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ADMIN_API_KEY,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar pixel');
  return res.json();
}

export async function updatePixel(
  id: string,
  data: { nome?: string; ativo?: boolean },
) {
  const res = await fetch(`${API_URL}/admin/pixels/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ADMIN_API_KEY,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar pixel');
  return res.json();
}

export async function deletePixel(id: string) {
  const res = await fetch(`${API_URL}/admin/pixels/${id}`, {
    method: 'DELETE',
    headers: { 'x-api-key': ADMIN_API_KEY },
  });
  if (!res.ok) throw new Error('Erro ao deletar pixel');
  return res.json();
}

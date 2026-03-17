export function maskName(nome: string): string {
  if (nome.length <= 3) return nome[0] + '***';
  return nome.substring(0, 3) + '***';
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (user.length <= 2) return user[0] + '***@' + domain;
  return user.substring(0, 2) + '***@' + domain;
}

export function maskPhone(telefone: string): string {
  const digits = telefone.replace(/\D/g, '');
  if (digits.length < 4) return '****';
  const last4 = digits.slice(-4);
  return `(${digits.slice(0, 2)}) *****-${last4}`;
}

export function maskName(nome: string): string {
  if (nome.length <= 3) return nome[0] + '***';
  return nome.substring(0, 3) + '***';
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***@***';
  const masked = local.substring(0, 2) + '***';
  return `${masked}@${domain}`;
}

export function maskPhone(telefone: string): string {
  const digits = telefone.replace(/\D/g, '');
  if (digits.length < 10) return '***';
  const ddd = digits.substring(0, 2);
  const last4 = digits.substring(digits.length - 4);
  return `(${ddd}) *****-${last4}`;
}

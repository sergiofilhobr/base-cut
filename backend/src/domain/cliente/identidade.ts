export function normalizarTelefone(valor: string): string | null {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 13) return null;
  return digitos;
}

export function normalizarEmail(valor: string): string | null {
  const email = valor.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

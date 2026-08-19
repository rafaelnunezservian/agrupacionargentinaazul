// Utilidades compartidas para el número de WhatsApp de un integrante de equipo.
// El link nunca se guarda armado en Firestore — se deriva acá, igual criterio
// que los valores monetarios derivados de InvestmentSection (research.md §12.3).

/** Deja solo dígitos y corta a 10 (número de área + línea, sin 0 ni 15, sin 54/9). */
export function sanitizeWhatsappInput(value) {
  return (value ?? '').replace(/\D/g, '').slice(0, 10);
}

/** Arma el link de wa.me asumiendo Argentina (54) + celular (9) + los 10 dígitos. */
export function buildWhatsappUrl(number) {
  const digits = sanitizeWhatsappInput(number);
  if (digits.length !== 10) return null;
  return `https://wa.me/549${digits}`;
}

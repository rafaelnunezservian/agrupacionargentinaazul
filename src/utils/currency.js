// Formato de moneda para los valores (almacenados y derivados) de
// InvestmentSection (FR-016 a FR-018, data-model.md → InvestmentSection).

/** Formatea un número como pesos argentinos, sin decimales: "$4.000.000". */
export function formatArs(amount) {
  const value = Number(amount) || 0;
  return `$${Math.round(value).toLocaleString('es-AR')}`;
}

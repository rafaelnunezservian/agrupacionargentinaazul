import { buildWhatsappUrl } from '../../utils/whatsapp';

// Catálogo fijo de tipos de acceso del linktree (specs/002-linktree-qr,
// research.md §4, FR-025, FR-034). Agregar un tipo nuevo más adelante es una
// entrada más acá (+ su ícono en LinkIcons.jsx) — no requiere tocar el resto
// del código.
export const LINK_TYPE_LABELS = {
  website: 'Página web',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  email: 'Email',
};

export const ALL_LINK_TYPES = Object.keys(LINK_TYPE_LABELS);

/**
 * Tipos que el admin puede elegir al agregar un acceso nuevo — 'website' es
 * singleton (se crea solo, ver ensureWebsiteLink en src/firebase/links.js) y
 * nunca se ofrece en el selector de alta.
 */
export const CREATABLE_LINK_TYPES = ALL_LINK_TYPES.filter((type) => type !== 'website');

/**
 * Arma el href final de un acceso según su `type` (FR-034). Devuelve `null`
 * si el acceso no tiene un destino válido con los datos cargados (p. ej. un
 * WhatsApp con número inválido) — el caller decide si igual lo muestra.
 */
export function getLinkHref(link) {
  switch (link?.type) {
    case 'whatsapp':
      return buildWhatsappUrl(link.value, link.whatsappMessage);
    case 'email':
      return link.value ? `mailto:${link.value}` : null;
    case 'website':
    case 'instagram':
    case 'facebook':
    case 'tiktok':
    case 'youtube':
      return link.value || null;
    default:
      return null;
  }
}

// Íconos SVG inline por tipo de acceso (research.md §4, FR-034). El proyecto
// no usa ninguna librería de íconos (ver Footer.jsx, que resuelve sus links
// sociales con texto plano) — no se justifica agregar una por esta
// funcionalidad, así que cada trazo es propio, minimalista, trazo simple
// (viewBox 24x24, stroke="currentColor").

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const ICONS = {
  website: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-6-4-9s1.5-6.5 4-9z" />
    </svg>
  ),
  whatsapp: (
    <svg {...iconProps}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  instagram: (
    <svg {...iconProps}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),
  facebook: (
    <svg {...iconProps}>
      <path d="M14.5 21v-7h2.4l.4-3H14.5V9c0-.9.2-1.5 1.6-1.5H17.5V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4V11H9v3h2.3v7z" />
    </svg>
  ),
  tiktok: (
    <svg {...iconProps}>
      <path d="M13 3v11.5a2.8 2.8 0 1 1-2-2.7" />
      <path d="M13 3c.3 2.2 2 4 4.3 4.3" />
    </svg>
  ),
  youtube: (
    <svg {...iconProps}>
      <rect x="3" y="6" width="18" height="12" rx="4" />
      <path d="M10.5 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none" />
    </svg>
  ),
  email: (
    <svg {...iconProps}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="M4.5 6.5l7.5 6 7.5-6" />
    </svg>
  ),
};

/**
 * Ícono del tipo de acceso indicado. Si `type` no está en el catálogo (no
 * debería pasar, ver linkTypes.js), no renderiza nada en vez de romper.
 */
const LinkTypeIcon = ({ type, className }) => {
  const icon = ICONS[type];
  if (!icon) return null;
  return <span className={className} aria-hidden="true">{icon}</span>;
};

export default LinkTypeIcon;

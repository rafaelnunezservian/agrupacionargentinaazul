import { LINK_TYPE_LABELS, getLinkHref } from './linkTypes';
import LinkTypeIcon from './LinkIcons';

/**
 * Un acceso de la página pública `/links`: ícono del tipo + texto visible,
 * resolviendo su `href` según `type` (FR-032, FR-034). Si el acceso no tiene
 * un destino válido con los datos cargados (p. ej. WhatsApp con número
 * inválido), no se renderiza — mejor omitirlo que ofrecer un link roto.
 */
const LinkButton = ({ link }) => {
  const href = getLinkHref(link);
  if (!href) return null;

  const isExternal = link.type !== 'email';

  return (
    <a
      className="links-page-button"
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      <span className="links-page-button-icon">
        <LinkTypeIcon type={link.type} />
      </span>
      <span className="links-page-button-label">{link.label || LINK_TYPE_LABELS[link.type]}</span>
    </a>
  );
};

export default LinkButton;

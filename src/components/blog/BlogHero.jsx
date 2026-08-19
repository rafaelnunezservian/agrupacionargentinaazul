import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './BlogHero.css';

/**
 * Banner/hero del blog (FR-020): port del `intro-header` del theme Hexo
 * "livemylife" a React, con la paleta y la tipografía de Argentina Azul.
 *
 * Replica tres piezas del diseño de referencia:
 *  - la barra de navegación transparente que flota sobre el hero y se
 *    convierte en barra blanca fija al hacer scroll (`is-fixed` / `is-visible`
 *    de `hux-blog.js`, activo solo en desktop ≥1170px como en el original);
 *  - el bloque de encabezado, con dos variantes: `site` para el listado
 *    (`/blog`) y `post` para el detalle (`/blog/:slug`, con subtítulo y meta);
 *  - la animación de olas (`wave.css`): mismo path SVG, mismos cuatro trazos
 *    con sus delays y duraciones escalonados.
 */

// Umbral del theme original (`hux-blog.js`, var MQL): abajo de este ancho la
// barra no se fija al hacer scroll, queda estática sobre el hero.
const DESKTOP_NAV_BREAKPOINT = 1170;

const NAV_LINKS = [
  { label: 'Inicio', to: '/' },
  { label: 'Blog', to: '/blog' },
  { label: 'Acuicultura', to: '/aquadeal' },
];

const BlogHero = ({
  variant = 'site',
  title,
  subtitle,
  meta,
  backgroundImageUrl,
}) => {
  const [isFixed, setIsFixed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const previousTopRef = useRef(0);
  const isFixedRef = useRef(false);

  useEffect(() => {
    // Port del scroll handler de `hux-blog.js`: al bajar, la barra se despega
    // y se esconde justo arriba del viewport; al subir, reaparece deslizándose.
    const handleScroll = () => {
      if (window.innerWidth <= DESKTOP_NAV_BREAKPOINT) {
        isFixedRef.current = false;
        setIsFixed(false);
        setIsVisible(false);
        return;
      }

      const currentTop = window.scrollY;
      const headerHeight = navRef.current?.offsetHeight ?? 0;

      if (currentTop < previousTopRef.current) {
        // Scroll hacia arriba: si ya estaba despegada, se desliza a la vista
        if (currentTop > 0 && isFixedRef.current) {
          setIsVisible(true);
        } else {
          isFixedRef.current = false;
          setIsFixed(false);
          setIsVisible(false);
        }
      } else {
        // Scroll hacia abajo: se esconde y, pasada la altura de la barra, se despega
        setIsVisible(false);
        if (currentTop > headerHeight && !isFixedRef.current) {
          isFixedRef.current = true;
          setIsFixed(true);
        }
      }

      previousTopRef.current = currentTop;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // La foto va limpia, sin velo de color encima: el contraste del texto lo
  // resuelven los degradados locales de `BlogHero.css` (uno arriba, detrás de
  // la barra, y otro detrás del bloque de encabezado).
  const headerStyle = backgroundImageUrl
    ? { backgroundImage: `url(${backgroundImageUrl})` }
    : undefined;

  return (
    <>
      <nav
        ref={navRef}
        className={`blog-navbar${isFixed ? ' is-fixed' : ''}${isVisible ? ' is-visible' : ''}`}
      >
        <div className="blog-navbar-inner">
          <div className="blog-navbar-header">
            <button
              type="button"
              className="blog-navbar-toggle"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="blog-navbar-icon-bar" />
              <span className="blog-navbar-icon-bar" />
              <span className="blog-navbar-icon-bar" />
            </button>
            <Link to="/" className="blog-navbar-brand">
              Argentina Azul
            </Link>
          </div>

          <div className={`blog-navbar-menu${menuOpen ? ' in' : ''}`}>
            <ul className="blog-navbar-collapse">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <header
        className={`blog-hero${backgroundImageUrl ? ' blog-hero-with-image' : ''}`}
        style={headerStyle}
      >
        <div className="blog-hero-signature">
          <div className="container">
            <div className="blog-hero-column">
              {variant === 'post' ? (
                <div className="blog-hero-post-heading">
                  <h1>{title}</h1>
                  {subtitle && <h2 className="blog-hero-subheading">{subtitle}</h2>}
                  {meta && <span className="blog-hero-meta">{meta}</span>}
                </div>
              ) : (
                <div className="blog-hero-site-heading">
                  <h1>{title}</h1>
                  {subtitle && <span className="blog-hero-subheading">{subtitle}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Olas: mismo path y mismos cuatro trazos escalonados de `wave.css` */}
        <div className="blog-hero-wave-overlay" aria-hidden="true">
          <svg
            className="blog-hero-waves"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 24 150 28"
            preserveAspectRatio="none"
            shapeRendering="auto"
          >
            <defs>
              <path
                id="blog-hero-gentle-wave"
                d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
              />
            </defs>
            <g className="blog-hero-parallax">
              <use xlinkHref="#blog-hero-gentle-wave" x="48" y="0" fill="var(--blog-wave-1)" />
              <use xlinkHref="#blog-hero-gentle-wave" x="48" y="3" fill="var(--blog-wave-2)" />
              <use xlinkHref="#blog-hero-gentle-wave" x="48" y="5" fill="var(--blog-wave-3)" />
              <use xlinkHref="#blog-hero-gentle-wave" x="48" y="7" fill="var(--blog-wave-4)" />
            </g>
          </svg>
        </div>
      </header>
    </>
  );
};

export default BlogHero;

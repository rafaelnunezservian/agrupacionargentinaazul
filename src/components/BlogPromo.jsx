import { Link } from 'react-router-dom';
import './BlogPromo.css';

/**
 * Acceso al blog desde el home, entre el equipo y el llamado a sumarse.
 * Es una banda estática a propósito: no consulta entradas, así que no
 * depende de que haya contenido publicado ni suma estados de carga o error
 * a la portada.
 */
function BlogPromo() {
  return (
    <section className="blog-promo section" id="blog-promo">
      <div className="container blog-promo-content">
        <span className="blog-promo-eyebrow animate-on-scroll">Novedades</span>

        <h2 className="blog-promo-title animate-on-scroll">
          Blog de la Agrupación<br />
          <span className="blog-promo-highlight">Argentina Azul</span>
        </h2>

        <p className="blog-promo-subtitle animate-on-scroll">
          Lo que hacemos, lo que aprendemos y lo que está pasando con nuestro mar.
          Jornadas, producción acuícola y conciencia marítima, contado por quienes
          están en el territorio.
        </p>

        <div className="blog-promo-actions animate-on-scroll">
          <Link to="/blog" className="blog-promo-cta">
            Leer el blog
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default BlogPromo;

import { useEffect, useState } from 'react';
import { listActiveLinks } from '../../firebase/links';
import { isDegradedReadError } from '../../firebase/errors';
import LinkButton from './LinkButton';
import './LinksPage.css';

/**
 * Página pública tipo "linktree" (FR-022), destino del código QR de gráfica.
 * Muestra los accesos activos de la agrupación, ordenados — el acceso
 * "Página web" siempre queda primero (order fijo en 0, ver
 * src/firebase/links.js). Degrada a un estado controlado ante error de
 * lectura, nunca rompe la página (FR-021, mismo criterio que el resto del
 * sitio).
 */
const LinksPage = () => {
  const [links, setLinks] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  useEffect(() => {
    let cancelled = false;

    listActiveLinks()
      .then((data) => {
        if (cancelled) return;
        setLinks(data);
        setStatus('ready');
      })
      .catch((error) => {
        if (cancelled) return;
        if (isDegradedReadError(error)) {
          setLinks([]);
          setStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="links-page">
      <div className="links-page-card">
        <img
          src="/logo-agrupacion-argentina-azul.png"
          alt="Agrupación Argentina Azul"
          className="links-page-logo"
        />
        <h1>Agrupación Argentina Azul</h1>
        <p className="links-page-tagline">Militancia por la conciencia marítima.</p>

        {status === 'loading' && <p className="links-page-status">Cargando…</p>}

        {status === 'error' && (
          <p className="links-page-status">
            No pudimos cargar los enlaces en este momento. Volvé a intentar en unos minutos.
          </p>
        )}

        {status === 'ready' && (
          <nav className="links-page-list" aria-label="Accesos de la agrupación">
            {links.map((link) => (
              <LinkButton key={link.id} link={link} />
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};

export default LinksPage;

import { useEffect, useRef, useState } from 'react';
import { listTeamMembers } from '../firebase/team';
import { buildWhatsappUrl } from '../utils/whatsapp';
import './Team.css';

/**
 * Imagen con degradación controlada: si no hay `src` o falla la carga,
 * muestra un placeholder en vez de un ícono de imagen rota (FR-021).
 */
const TeamPhoto = ({ src, alt, className }) => {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return <div className={`${className} team-photo-placeholder`} aria-hidden="true" />;
  }

  return <img src={src} alt={alt} className={className} onError={() => setErrored(true)} />;
};

/** Botón de contacto por WhatsApp, debajo del badge de rol, si el integrante cargó número. */
const WhatsAppButton = ({ number }) => {
  const url = buildWhatsappUrl(number);
  if (!url) return null;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="team-whatsapp-btn">
      <span className="team-whatsapp-btn-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </span>
      <span>Contactar</span>

    </a>
  );
};

/** Tarjeta destacada del Presidente: ícono, insignia y afiliación fijos en el diseño (research.md §12.2). */
const LeaderCard = ({ member }) => (
  <div className="team-card team-card-leader animate-on-scroll">
    <div className="leadership-glow"></div>
    <div className="team-card-image">
      <TeamPhoto src={member.photoUrl} alt={member.name} />
      <div className="team-card-overlay"></div>
      <div className="leadership-icon president-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
    </div>
    <div className="team-card-content">
      <div className="name-container">
        <h3 className="team-card-name">{member.name}</h3>
        <div className="name-underline"></div>
      </div>
      <div className="team-card-roles">
        <span className="team-role-badge role-president">
          <span className="badge-icon">★</span>
          Presidente
        </span>
      </div>
      <p className="team-card-position">
        Fundación Argentina Azul<br />
        Agrupación Argentina Azul
      </p>
      {member.bio && <p className="team-card-bio">{member.bio}</p>}
      <WhatsAppButton number={member.whatsappNumber} />
      <div className="card-shine"></div>
    </div>
  </div>
);

/** Tarjeta estándar: único formato para todo integrante sin rol destacado (FR-007a). */
const StandardCard = ({ member }) => (
  <div className="team-card animate-on-scroll">
    <div className="team-card-image">
      <TeamPhoto src={member.photoUrl} alt={member.name} />
      <div className="team-card-overlay"></div>
    </div>
    <div className="team-card-content">
      <div className="name-container">
        <h3 className="team-card-name">{member.name}</h3>
        <div className="name-underline"></div>
      </div>
      <div className="team-card-roles">
        <span className="team-role-badge role-standard">{member.role}</span>
      </div>
      {member.bio && <p className="team-card-bio">{member.bio}</p>}
      <WhatsAppButton number={member.whatsappNumber} />
      <div className="card-shine"></div>
    </div>
  </div>
);

/**
 * Sección destacada del Partner Tecnológico: 100% fija en el código, no es
 * administrable desde el panel (decisión del cliente tras la Fase 3 — vuelve
 * a estar tal cual estaba antes de esta funcionalidad).
 */
const PartnerSection = () => (
  <div className="tech-partner-section animate-on-scroll">
    <div className="tech-partner-header">
      <div className="tech-badge-wrapper">
        <span className="tech-badge">Partner Tecnológico Oficial</span>
        <div className="tech-badge-glow"></div>
      </div>
      <h3 className="tech-title">Desarrollo de Software</h3>
    </div>

    <div className="tech-partner-card">
      <div className="tech-partner-visual">
        <div className="tech-avatar-container">
          <div className="tech-avatar-ring"></div>
          <div className="tech-avatar-ring ring-2"></div>
          <img src="/rafael.jpg" alt="Rafael Núñez - Partner Tecnológico" className="tech-avatar" />
        </div>
        <div className="tech-particles">
          <span></span><span></span><span></span>
          <span></span><span></span><span></span>
        </div>
      </div>

      <div className="tech-partner-info">
        <h4 className="tech-partner-name">Rafael Núñez</h4>
        <p className="tech-partner-role">Proveedor Oficial de Software</p>
        <p className="tech-partner-description">
          Desarrollo de proyectos y soluciones integrales en Software.
          Especializado en crear experiencias digitales de alto impacto
        </p>

        <div className="tech-services">
          <div className="tech-service">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>Desarrollo Web</span>
          </div>
          <div className="tech-service">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <span>Aplicaciones</span>
          </div>
          <div className="tech-service">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span>Soluciones Integrales</span>
          </div>
        </div>

        <div className="tech-contact-buttons">
          <a
            href="https://www.linkedin.com/in/isaac-nunez-dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="tech-linkedin-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Conectar en LinkedIn
          </a>

          <a
            href="https://wa.me/5491170061908?text=Hola%20Rafael%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20tus%20servicios%20de%20desarrollo."
            target="_blank"
            rel="noopener noreferrer"
            className="tech-whatsapp-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  </div>
);

const Team = () => {
  const sectionRef = useRef(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    listTeamMembers('home')
      .then((data) => {
        if (!cancelled) setMembers(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [members]);

  return (
    <section className="team section" id="team" ref={sectionRef}>
      <div className="team-bg"></div>

      <div className="container">
        <div className="team-header animate-on-scroll">
          <span className="team-badge">Quiénes Somos</span>
          <h2 className="section-title">Nuestro Equipo</h2>
          <p className="team-subtitle">
            Líderes comprometidos con el desarrollo marítimo argentino
          </p>
        </div>

        {error ? (
          <p className="team-empty-state">No pudimos cargar el equipo en este momento.</p>
        ) : loading ? (
          <p className="team-empty-state">Cargando equipo…</p>
        ) : members.length === 0 ? (
          <p className="team-empty-state">Todavía no hay integrantes cargados.</p>
        ) : (
          <div className="team-grid">
            {members.map((member) =>
              member.featuredRole === 'presidente' ? (
                <LeaderCard key={member.id} member={member} />
              ) : (
                <StandardCard key={member.id} member={member} />
              )
            )}
          </div>
        )}

        {/* Partner Tecnológico: sección fija, siempre visible, no depende de Firestore. */}
        <PartnerSection />
      </div>
    </section>
  );
};

export default Team;

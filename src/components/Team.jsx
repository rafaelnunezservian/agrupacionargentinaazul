import { useEffect, useRef } from 'react';
import './Team.css';

const Team = () => {
  const sectionRef = useRef(null);

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
  }, []);

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

        <div className="team-grid">
          {/* Carlos Lionel Traboulsi */}
          <div className="team-card team-card-leader animate-on-scroll">
            <div className="leadership-glow"></div>
            <div className="team-card-image">
              <img src="/trabulsi.jpg" alt="Carlos Lionel Traboulsi" />
              <div className="team-card-overlay"></div>
              <div className="leadership-icon president-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
            </div>
            <div className="team-card-content">
              <div className="name-container">
                <h3 className="team-card-name">Carlos Lionel Traboulsi</h3>
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
              <p className="team-card-bio">
                Abogado y político democristiano argentino. Autor del Proyecto Modelo de Desarrollo Argentina Azul.
              </p>
              <div className="card-shine"></div>
            </div>
          </div>

          {/* Gabriel Pollio */}
          <div className="team-card team-card-coordinator animate-on-scroll">
            <div className="leadership-glow coordinator-glow"></div>
            <div className="team-card-image">
              <img src="/gabriel-actualizado.jpeg" alt="Gabriel Pollio" />
              <div className="team-card-overlay"></div>
              <div className="leadership-icon coordinator-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6M6 12H1m11 0h6"/>
                  <path d="M4.22 4.22l4.24 4.24m7.07 0l4.24-4.24M4.22 19.78l4.24-4.24m7.07 0l4.24 4.24"/>
                </svg>
              </div>
            </div>
            <div className="team-card-content">
              <div className="name-container">
                <h3 className="team-card-name">Gabriel Pollio</h3>
                <div className="name-underline"></div>
              </div>
              <div className="team-card-roles">
                <span className="team-role-badge role-coordinator">
                  <span className="badge-icon">◆</span>
                  Coordinador
                </span>
              </div>
              <p className="team-card-position">
                Agrupación Argentina Azul<br />
                Provincia de Buenos Aires
              </p>
              <div className="achievements">
                <div className="achievement-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <span>Liderazgo Regional</span>
                </div>
              </div>
              <div className="card-shine"></div>
            </div>
          </div>

          {/* Matías Cortiña */}
          <div className="team-card team-card-communication animate-on-scroll">
            <div className="leadership-glow communication-glow"></div>
            <div className="team-card-image">
              <img src="/matias.jpg" alt="Matías Cortiña" />
              <div className="team-card-overlay"></div>
              <div className="leadership-icon communication-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
            </div>
            <div className="team-card-content">
              <div className="name-container">
                <h3 className="team-card-name">Matías Cortiña</h3>
                <div className="name-underline"></div>
              </div>
              <div className="team-card-roles">
                <span className="team-role-badge role-communication">
                  <span className="badge-icon">●</span>
                  Dirección de Comunicación Institucional
                </span>
              </div>
              <div className="card-shine"></div>
            </div>
          </div>
        </div>

        {/* Partner Tecnológico - Sección Destacada */}
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
                <img 
                  src="/rafael.jpg" 
                  alt="Rafael Núñez - Partner Tecnológico"
                  className="tech-avatar"
                />
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
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  <span>Desarrollo Web</span>
                </div>
                <div className="tech-service">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <path d="M8 21h8M12 17v4"/>
                  </svg>
                  <span>Aplicaciones</span>
                </div>
                <div className="tech-service">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
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
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
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
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Consultar por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;

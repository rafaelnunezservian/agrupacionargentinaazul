import { useEffect, useRef } from 'react';
import './About.css';

const About = () => {
  const contentRef = useRef(null);

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

    const elements = contentRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="about section" id="about">
      <div className="about-bg-decoration"></div>

      <div className="container" ref={contentRef}>
        <div className="about-header animate-on-scroll">
          <span className="about-badge">Modelo de Desarrollo Nacional</span>
          <h2 className="section-title">
            ¿Qué es Argentina Azul?
          </h2>
        </div>
        
        <div className="about-content">
          <div className="about-main animate-on-scroll">
            <p className="text-highlight">
              Un <strong>plan nacional sustentable</strong> que posiciona al mar como protagonista del desarrollo argentino.
            </p>
            <p>
              Mientras construíamos un país de espaldas al océano, dejamos sumergido 
              un territorio <strong>2.5 veces más grande</strong> que nuestras provincias continentales.
            </p>
            <p>
              Argentina Azul propone una <strong>nueva matriz productiva e industrial</strong> que integra 
              más de <strong>6.5 millones de km²</strong> de mar a nuestra identidad nacional.
            </p>
            <div className="about-quote animate-on-scroll">
              <blockquote>
                "Dos argentinas y media se encuentran sumergidas y las tenemos que reflotar"
              </blockquote>
              <cite>— Fundación Argentina Azul</cite>
            </div>
          </div>

          <div className="about-pillars animate-on-scroll">
            <h3>Los Cuatro Ejes del Modelo</h3>
            <div className="pillars-grid">
              <div className="pillar-item animate-on-scroll" style={{'--delay': '0.1s'}}>
                <div className="pillar-icon-wrapper">
                  <svg className="pillar-svg" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
                    <path d="M32 12v40M22 22l10-10 10 10M22 42l10 10 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h4>Conocimiento</h4>
                <p>Educación como herramienta fundamental para ejercer nuestra soberanía marítima</p>
              </div>
              <div className="pillar-item animate-on-scroll" style={{'--delay': '0.2s'}}>
                <div className="pillar-icon-wrapper">
                  <svg className="pillar-svg" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
                    <path d="M20 44V28l12-8 12 8v16M20 44h24M26 44v-8h12v8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4>Industria Genuina</h4>
                <p>Integración campo-mar con agregado de valor a la producción nacional</p>
              </div>
              <div className="pillar-item animate-on-scroll" style={{'--delay': '0.3s'}}>
                <div className="pillar-icon-wrapper">
                  <svg className="pillar-svg" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
                    <path d="M12 36c8-8 16 4 24-4s12 0 16-4M12 28c8-8 16 4 24-4s12 0 16-4M12 44c8-8 16 4 24-4s12 0 16-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h4>El Mar</h4>
                <p>Océano, vías fluviales y costas como motor de desarrollo integral</p>
              </div>
              <div className="pillar-item animate-on-scroll" style={{'--delay': '0.4s'}}>
                <div className="pillar-icon-wrapper">
                  <svg className="pillar-svg" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
                    <path d="M32 16v8M32 40v8M16 32h8M40 32h8M22 22l6 6M36 36l6 6M42 22l-6 6M28 36l-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    <circle cx="32" cy="32" r="6" stroke="currentColor" strokeWidth="2.5"/>
                  </svg>
                </div>
                <h4>Medio Ambiente</h4>
                <p>Desarrollo sostenible protegiendo nuestra biodiversidad marina única</p>
              </div>
            </div>
          </div>

          <div className="about-vision animate-on-scroll">
            <div className="vision-card">
              <h3>País Bicontinental y Marítimo</h3>
              <p>
                Argentina debe ser entendida como un país con <strong>tres territorios</strong>: 
                el continental emergido, el marítimo sumergido (2.5x más grande), 
                y el antártico. El cambio está en el mar.
              </p>
              <div className="vision-stats">
                <div className="vision-stat">
                  <span className="stat-value">6800</span>
                  <span className="stat-desc">km de costa</span>
                </div>
                <div className="vision-stat">
                  <span className="stat-value">95%</span>
                  <span className="stat-desc">comercio por mar</span>
                </div>
                <div className="vision-stat">
                  <span className="stat-value">∞</span>
                  <span className="stat-desc">oportunidades</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

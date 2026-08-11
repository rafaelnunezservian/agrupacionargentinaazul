import { useEffect, useRef } from 'react';
import './Hero.css';

const Hero = () => {
  const statsRef = useRef(null);

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

    const stats = document.querySelectorAll('.stat-item');
    stats.forEach((stat) => observer.observe(stat));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="hero" id="hero">
      <video className="hero-video" autoPlay muted loop playsInline>
        <source src="/video.mp4" type="video/mp4" />
      </video>
      
      <div className="hero-overlay"></div>

      <div className="container hero-content">
        <h1 className="hero-title">
          <span className="hero-title-small">El cambio está</span>
          <span className="hero-title-large">en el mar</span>
        </h1>
        
        <p className="hero-subtitle">
          Dos argentinas y media sumergidas.<br />
          Es tiempo de reflotar nuestro futuro.
        </p>

        <div className="hero-stats" ref={statsRef}>
          <div className="stat-item">
            <span className="stat-number">6800</span>
            <span className="stat-label">km de costa</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">6.5M</span>
            <span className="stat-label">km² de mar</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">2.5x</span>
            <span className="stat-label">el territorio</span>
          </div>
        </div>

        <div className="hero-cta mb-10">
          <button className="btn btn-primary" onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}>
            Descubrí más
          </button>
        </div>
      </div>

      <div className="scroll-indicator">
        <svg className="scroll-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14m0 0l-7-7m7 7l7-7"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;

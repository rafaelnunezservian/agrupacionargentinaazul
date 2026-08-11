import './AcuiTeam.css';

const team = [
  {
    name: 'Gabriel Pollio',
    role: 'Director del Proyecto',
    image: '/gabriel-actualizado.jpeg',
    alt: 'Gabriel Pollio'
  },
  {
    name: 'Matías Cortiña',
    role: 'Comunicación y Gestión',
    image: '/matias.jpg',
    alt: 'Matías Cortiña'
  },
  {
    name: 'Guadalupe Polio',
    role: 'Community manager y gestora de redes del equipo',
    image: '/guadalupe-polio.jpg',
    alt: 'Guadalupe Polio'
  },
  {
    name: 'Rafael Núñez',
    role: 'Desarrollador de Sistemas & IA',
    image: '/rafael.jpg',
    alt: 'Rafael Núñez'
  },
];

function AcuiTeam() {
  return (
    <section className="acui-team" id="acui-equipo">
      <div className="acui-team-container">
        <div className="acui-team-header animate-on-scroll">
          <span className="acui-section-badge">Nuestro Equipo</span>
          <h2 className="acui-section-title">Quiénes Somos</h2>
          <p className="acui-section-subtitle">
            El equipo detrás de Aquadeal Argentina, trabajando para acercar
            la acuicultura controlada a todo el país.
          </p>
        </div>

        <div className="acui-team-grid">
          {team.map((member, i) => (
            <div className="acui-team-card animate-on-scroll" key={i}>
              <div className="acui-team-photo-frame">
                <img
                  src={member.image}
                  alt={member.alt}
                  className="acui-team-photo"
                  loading="lazy"
                />
              </div>
              <h3 className="acui-team-name">{member.name}</h3>
              <span className="acui-team-role">{member.role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AcuiTeam;

import { useEffect, useState } from 'react';
import { listTeamMembers } from '../../firebase/team';
import { buildWhatsappUrl } from '../../utils/whatsapp';
import './AcuiTeam.css';

/** Botón de contacto por WhatsApp, debajo del rol, si el integrante cargó número. */
const AcuiWhatsAppButton = ({ number }) => {
  const url = buildWhatsappUrl(number);
  if (!url) return null;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="acui-team-whatsapp-btn">
      <span>Contactar</span>
      <span className="acui-team-whatsapp-btn-icon">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </span>
    </a>
  );
};

/**
 * Imagen con degradación controlada: si no hay `src` o falla la carga,
 * se mantiene el marco con su fondo, sin ícono de imagen rota (FR-021).
 */
const AcuiTeamPhoto = ({ src, alt }) => {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="acui-team-photo"
      loading="lazy"
      onError={() => setErrored(true)}
    />
  );
};

function AcuiTeam() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    listTeamMembers('acuicultura')
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

  return (
    <section className="acui-team" id="acui-equipo">
      <div className="acui-team-container">
        <div className="acui-team-header ">
          <span className="acui-section-badge">Nuestro Equipo</span>
          <h2 className="acui-section-title">Quiénes Somos</h2>
          <p className="acui-section-subtitle">
            El equipo detrás de Aquadeal Argentina, trabajando para acercar
            la acuicultura controlada a todo el país.
          </p>
        </div>

        {error ? (
          <p className="acui-team-empty-state">No pudimos cargar el equipo en este momento.</p>
        ) : loading ? (
          <p className="acui-team-empty-state">Cargando equipo…</p>
        ) : members.length === 0 ? (
          <p className="acui-team-empty-state">Todavía no hay integrantes cargados.</p>
        ) : (
          <div className="acui-team-grid">
            {members.map((member) => (
              <div className="acui-team-card" key={member.id}>
                <div className="acui-team-photo-frame">
                  <AcuiTeamPhoto src={member.photoUrl} alt={member.name} />
                </div>
                <h3 className="acui-team-name">{member.name}</h3>
                <span className="acui-team-role">{member.role}</span>
                <AcuiWhatsAppButton number={member.whatsappNumber} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AcuiTeam;

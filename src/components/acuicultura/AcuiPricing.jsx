import { useEffect, useState } from 'react';
import { getInvestmentSection } from '../../firebase/investment';
import { formatArs } from '../../utils/currency';
import './AcuiPricing.css';

function AcuiPricing() {
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getInvestmentSection()
      .then((data) => {
        if (!cancelled) setSection(data);
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

  // Valores derivados en el frontend a partir de los precios cargados —
  // nunca almacenados, para que no puedan quedar inconsistentes
  // (data-model.md → InvestmentSection, research.md §12.3).
  const total = section ? (section.installmentAmount ?? 0) * (section.installmentCount ?? 0) : 0;
  const ahorroPromocional = section ? (section.regularPrice ?? 0) - total : 0;
  const ahorroContado = section ? total - (section.cashPrice ?? 0) : 0;

  const includes = [...(section?.includes ?? [])].sort((a, b) => a.order - b.order);

  return (
    <section className="acui-pricing" id="acui-inversion">
      <div className="acui-pricing-container">
        <div className="acui-pricing-header ">
          <span className="acui-section-badge">Tu Inversión</span>
          <h2 className="acui-section-title">{section?.headline || 'Invertí en Tu Futuro Productivo'}</h2>
          {section?.subtitle && <p className="acui-section-subtitle">{section.subtitle}</p>}
        </div>

        {error ? (
          <p className="acui-pricing-empty-state">No pudimos cargar la información de inversión en este momento.</p>
        ) : loading ? (
          <p className="acui-pricing-empty-state">Cargando información de inversión…</p>
        ) : !section ? (
          <p className="acui-pricing-empty-state">Todavía no hay información de inversión cargada.</p>
        ) : (
          <div className="acui-pricing-card ">
            <div className="acui-pricing-shimmer"></div>

            <div className="acui-pricing-card-header">
              {section.planLabel && <span className="acui-pricing-label">{section.planLabel}</span>}
              {section.discountBadge && (
                <div className="acui-pricing-discount-badge">{section.discountBadge}</div>
              )}
              <div className="acui-pricing-original">
                <span className="acui-pricing-original-text">Precio regular:</span>
                <span className="acui-pricing-original-price">{formatArs(section.regularPrice)}</span>
              </div>
              <div className="acui-pricing-amount">
                <span className="acui-pricing-installments">{section.installmentCount} cuotas de</span>
              </div>
              <div className="acui-pricing-amount">
                <span className="acui-pricing-currency">$</span>
                <span className="acui-pricing-value">
                  {Math.round(section.installmentAmount ?? 0).toLocaleString('es-AR')}
                </span>
                <span className="acui-pricing-period">ARS</span>
              </div>
              <p className="acui-pricing-desc">
                Total: {formatArs(total)} — Ahorrás {formatArs(ahorroPromocional)} con el precio promocional
              </p>

              <div className="acui-pricing-cash">
                <span className="acui-pricing-cash-icon">💵</span>
                <div>
                  <strong>Pago en efectivo: {formatArs(section.cashPrice)}</strong>
                  <span> — Ahorrás {formatArs(ahorroContado)} adicionales</span>
                </div>
              </div>
            </div>

            <div className="acui-pricing-divider"></div>

            {includes.length > 0 && (
              <div className="acui-pricing-includes">
                <h4>Todo lo que incluye:</h4>
                <ul>
                  {includes.map((item) => (
                    <li key={item.id}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {section.highlightText && (
              <div className="acui-pricing-highlight">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#ffc107">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>{section.highlightText}</span>
              </div>
            )}

            {/* CTA de WhatsApp fijo: no forma parte del modelo de datos (data-model.md → InvestmentSection, research.md §12.3) */}
            <a
              href="https://wa.me/5491133765421?text=Hola%2C%20quiero%20inscribirme%20en%20el%20programa%20de%20Acuicultura%202026"
              className="acui-pricing-cta"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Reservá Tu Lugar por WhatsApp
            </a>

            <p className="acui-pricing-spots">
              <span className="acui-pricing-spots-icon">⚡</span>
              Solo <strong>{section.spotsAvailable} cupos</strong> — No te quedes afuera
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AcuiPricing;

import { useEffect, useState } from 'react';
import { getInvestmentSection, saveInvestmentSection } from '../../firebase/investment';
import { getWriteErrorMessage } from '../../firebase/errors';
import { formatArs } from '../../utils/currency';
import './AdminInvestmentEditor.css';

const EMPTY_FORM = {
  planLabel: '',
  headline: '',
  subtitle: '',
  discountBadge: '',
  regularPrice: '',
  installmentAmount: '',
  installmentCount: '',
  cashPrice: '',
  highlightText: '',
  spotsAvailable: '',
};

// Ids locales para las filas de "includes" mientras se editan en el
// formulario (no se persisten como tal más allá del array final que se
// guarda — data-model.md → InvestmentSection.includes).
let nextLocalId = 0;
const makeLocalId = () => `local-${Date.now()}-${nextLocalId++}`;

const toFormValue = (value) => (value === null || value === undefined ? '' : String(value));

const isNonNegativeNumber = (value) => value !== '' && !Number.isNaN(Number(value)) && Number(value) >= 0;

/**
 * Editor de la sección de inversión "Invertí en Tu Futuro Productivo"
 * (FR-016 a FR-018, T047, T048). Documento singleton: no hay lista de
 * registros, el formulario carga y guarda el único documento existente.
 */
const AdminInvestmentEditor = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [includes, setIncludes] = useState([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getInvestmentSection();
        if (cancelled) return;

        if (data) {
          setForm({
            planLabel: toFormValue(data.planLabel),
            headline: toFormValue(data.headline),
            subtitle: toFormValue(data.subtitle),
            discountBadge: toFormValue(data.discountBadge),
            regularPrice: toFormValue(data.regularPrice),
            installmentAmount: toFormValue(data.installmentAmount),
            installmentCount: toFormValue(data.installmentCount),
            cashPrice: toFormValue(data.cashPrice),
            highlightText: toFormValue(data.highlightText),
            spotsAvailable: toFormValue(data.spotsAvailable),
          });
          setIncludes(
            [...(data.includes ?? [])]
              .sort((a, b) => a.order - b.order)
              .map((item) => ({ id: item.id ?? makeLocalId(), text: item.text ?? '' }))
          );
        }
      } catch (loadError) {
        if (!cancelled) setError(getWriteErrorMessage(loadError));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFieldChange = (field) => (event) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const addIncludeItem = () => {
    setSaved(false);
    setIncludes((prev) => [...prev, { id: makeLocalId(), text: '' }]);
  };

  const updateIncludeText = (id, text) => {
    setSaved(false);
    setIncludes((prev) => prev.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const removeIncludeItem = (id) => {
    setSaved(false);
    setIncludes((prev) => prev.filter((item) => item.id !== id));
  };

  const moveIncludeItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= includes.length) return;

    setSaved(false);
    setIncludes((prev) => {
      const reordered = [...prev];
      [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
      return reordered;
    });
  };

  // Valores derivados en vivo, mismo cálculo que la tarjeta pública
  // (data-model.md → "Valores derivados", research.md §12.3): solo vista
  // previa acá, nunca se guardan en Firestore.
  const preview = {
    total: (Number(form.installmentAmount) || 0) * (Number(form.installmentCount) || 0),
  };
  preview.ahorroPromocional = (Number(form.regularPrice) || 0) - preview.total;
  preview.ahorroContado = preview.total - (Number(form.cashPrice) || 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSaved(false);

    if (!form.headline.trim()) {
      setFormError('El encabezado es obligatorio.');
      return;
    }
    if (
      !isNonNegativeNumber(form.regularPrice) ||
      !isNonNegativeNumber(form.installmentAmount) ||
      !isNonNegativeNumber(form.installmentCount) ||
      !isNonNegativeNumber(form.cashPrice) ||
      !isNonNegativeNumber(form.spotsAvailable)
    ) {
      setFormError('Precio regular, cuota, cantidad de cuotas, precio al contado y cupos deben ser números válidos (0 o más).');
      return;
    }
    if (includes.some((item) => !item.text.trim())) {
      setFormError('Ningún ítem de "Todo lo que incluye" puede quedar vacío. Borralo si no lo necesitás.');
      return;
    }

    setSaving(true);
    try {
      await saveInvestmentSection({
        planLabel: form.planLabel.trim(),
        headline: form.headline.trim(),
        subtitle: form.subtitle.trim(),
        discountBadge: form.discountBadge.trim(),
        regularPrice: Number(form.regularPrice),
        installmentAmount: Number(form.installmentAmount),
        installmentCount: Math.round(Number(form.installmentCount)),
        cashPrice: Number(form.cashPrice),
        highlightText: form.highlightText.trim(),
        spotsAvailable: Math.round(Number(form.spotsAvailable)),
        includes: includes.map((item, index) => ({ id: item.id, text: item.text.trim(), order: index })),
      });
      setSaved(true);
    } catch (submitError) {
      setFormError(submitError?.code ? getWriteErrorMessage(submitError) : submitError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-investment-editor">
        <h2>Inversión</h2>
        <p className="admin-investment-editor-status">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="admin-investment-editor">
      <h2>Inversión</h2>

      {error && <p className="admin-investment-editor-error" role="alert">{error}</p>}

      <form className="admin-investment-form" onSubmit={handleSubmit}>
        <label htmlFor="inv-form-plan-label">Rótulo del plan</label>
        <input
          id="inv-form-plan-label"
          type="text"
          placeholder="Programa Intensivo 2026"
          value={form.planLabel}
          onChange={handleFieldChange('planLabel')}
          disabled={saving}
        />

        <label htmlFor="inv-form-headline">Encabezado *</label>
        <input
          id="inv-form-headline"
          type="text"
          value={form.headline}
          onChange={handleFieldChange('headline')}
          disabled={saving}
          required
        />

        <label htmlFor="inv-form-subtitle">Subtítulo</label>
        <textarea
          id="inv-form-subtitle"
          value={form.subtitle}
          onChange={handleFieldChange('subtitle')}
          disabled={saving}
          rows={2}
        />

        <label htmlFor="inv-form-discount-badge">Insignia de descuento</label>
        <input
          id="inv-form-discount-badge"
          type="text"
          placeholder="🔥 Descuento especial solo abril"
          value={form.discountBadge}
          onChange={handleFieldChange('discountBadge')}
          disabled={saving}
        />

        <div className="admin-investment-form-row">
          <div>
            <label htmlFor="inv-form-regular-price">Precio regular (ARS) *</label>
            <input
              id="inv-form-regular-price"
              type="number"
              min="0"
              step="1"
              value={form.regularPrice}
              onChange={handleFieldChange('regularPrice')}
              disabled={saving}
              required
            />
          </div>
          <div>
            <label htmlFor="inv-form-cash-price">Precio al contado (ARS) *</label>
            <input
              id="inv-form-cash-price"
              type="number"
              min="0"
              step="1"
              value={form.cashPrice}
              onChange={handleFieldChange('cashPrice')}
              disabled={saving}
              required
            />
          </div>
        </div>

        <div className="admin-investment-form-row">
          <div>
            <label htmlFor="inv-form-installment-amount">Monto de cada cuota (ARS) *</label>
            <input
              id="inv-form-installment-amount"
              type="number"
              min="0"
              step="1"
              value={form.installmentAmount}
              onChange={handleFieldChange('installmentAmount')}
              disabled={saving}
              required
            />
          </div>
          <div>
            <label htmlFor="inv-form-installment-count">Cantidad de cuotas *</label>
            <input
              id="inv-form-installment-count"
              type="number"
              min="0"
              step="1"
              value={form.installmentCount}
              onChange={handleFieldChange('installmentCount')}
              disabled={saving}
              required
            />
          </div>
        </div>

        <p className="admin-investment-form-preview">
          Total: {formatArs(preview.total)} · Ahorrás {formatArs(preview.ahorroPromocional)} con el precio
          promocional · Ahorrás {formatArs(preview.ahorroContado)} adicionales al contado
        </p>

        <label htmlFor="inv-form-highlight">Texto de highlight</label>
        <input
          id="inv-form-highlight"
          type="text"
          placeholder="prácticas con producción acuícola real"
          value={form.highlightText}
          onChange={handleFieldChange('highlightText')}
          disabled={saving}
        />

        <label htmlFor="inv-form-spots">Cupos disponibles *</label>
        <input
          id="inv-form-spots"
          type="number"
          min="0"
          step="1"
          value={form.spotsAvailable}
          onChange={handleFieldChange('spotsAvailable')}
          disabled={saving}
          required
        />

        <div className="admin-investment-includes">
          <div className="admin-investment-includes-header">
            <h3>Todo lo que incluye</h3>
            <button type="button" className="admin-investment-btn" onClick={addIncludeItem} disabled={saving}>
              + Agregar ítem
            </button>
          </div>

          {includes.length === 0 ? (
            <p className="admin-investment-editor-status">Todavía no hay ítems cargados.</p>
          ) : (
            <ul className="admin-investment-includes-list">
              {includes.map((item, index) => (
                <li key={item.id} className="admin-investment-includes-item">
                  <input
                    type="text"
                    value={item.text}
                    onChange={(event) => updateIncludeText(item.id, event.target.value)}
                    disabled={saving}
                    aria-label={`Ítem ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="admin-investment-btn admin-investment-btn-icon"
                    onClick={() => moveIncludeItem(index, -1)}
                    disabled={saving || index === 0}
                    aria-label="Mover arriba"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="admin-investment-btn admin-investment-btn-icon"
                    onClick={() => moveIncludeItem(index, 1)}
                    disabled={saving || index === includes.length - 1}
                    aria-label="Mover abajo"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="admin-investment-btn admin-investment-btn-danger"
                    onClick={() => removeIncludeItem(item.id)}
                    disabled={saving}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {formError && <p className="admin-investment-editor-error" role="alert">{formError}</p>}
        {saved && !formError && <p className="admin-investment-editor-saved">Cambios guardados.</p>}

        <div className="admin-investment-form-actions">
          <button type="submit" className="admin-investment-btn admin-investment-btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminInvestmentEditor;

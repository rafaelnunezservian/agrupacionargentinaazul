import { useEffect, useState } from 'react';
import {
  listLinks,
  ensureWebsiteLink,
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
  WEBSITE_LINK_ID,
} from '../../firebase/links';
import { getWriteErrorMessage } from '../../firebase/errors';
import { sanitizeWhatsappInput, buildWhatsappUrl } from '../../utils/whatsapp';
import { LINK_TYPE_LABELS, CREATABLE_LINK_TYPES, getLinkHref } from '../links/linkTypes';
import LinkTypeIcon from '../links/LinkIcons';
import ConfirmDialog from './ConfirmDialog';
import './AdminLinksEditor.css';

const EMPTY_FORM = {
  type: CREATABLE_LINK_TYPES[0],
  label: '',
  value: '',
  whatsappMessage: '',
};

/**
 * Editor del linktree autogestionable (FR-022 a FR-034): agregar, editar,
 * ocultar/mostrar, reordenar y eliminar accesos. El acceso "Página web" es
 * singleton (id fijo `website`) — se crea solo si falta, y no ofrece ni
 * eliminar ni cambiar de tipo (FR-023, FR-024).
 */
const AdminLinksEditor = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null); // null = form cerrado, 'new' = alta
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState(null);

  const websiteLink = links.find((link) => link.id === WEBSITE_LINK_ID) ?? null;
  const otherLinks = links.filter((link) => link.id !== WEBSITE_LINK_ID);
  const editingLink = editingId && editingId !== 'new' ? links.find((link) => link.id === editingId) : null;

  const loadLinks = async () => {
    setLoading(true);
    setError('');
    try {
      await ensureWebsiteLink();
      const data = await listLinks();
      setLinks(data);
    } catch (loadError) {
      setError(getWriteErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const openCreateForm = () => {
    setEditingId('new');
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const openEditForm = (link) => {
    setEditingId(link.id);
    setForm({
      type: link.type,
      label: link.label ?? '',
      value: link.value ?? '',
      whatsappMessage: link.whatsappMessage ?? '',
    });
    setFormError('');
  };

  const closeForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const handleFieldChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!form.label.trim() || !form.value.trim()) {
      setFormError('El texto visible y el destino son obligatorios.');
      return;
    }

    let sanitizedValue = form.value.trim();
    if (form.type === 'whatsapp') {
      sanitizedValue = sanitizeWhatsappInput(form.value);
      if (sanitizedValue.length !== 10) {
        setFormError(`El número de WhatsApp no es válido (${sanitizedValue.length}/10 dígitos).`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        type: form.type,
        label: form.label.trim(),
        value: sanitizedValue,
      };
      if (form.type === 'whatsapp') {
        payload.whatsappMessage = form.whatsappMessage.trim();
      }

      if (editingLink) {
        await updateLink(editingLink.id, payload);
      } else {
        await createLink({ ...payload, order: otherLinks.length + 1 });
      }

      closeForm();
      await loadLinks();
    } catch (submitError) {
      setFormError(submitError?.code ? getWriteErrorMessage(submitError) : submitError.message);
    } finally {
      setSaving(false);
    }
  };

  // Reordenamiento (FR-031): mueve un acceso una posición dentro de otherLinks
  // (la "Página web" nunca participa) y persiste con writeBatch.
  const move = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= otherLinks.length) return;

    const reordered = [...otherLinks];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setLinks(websiteLink ? [websiteLink, ...reordered] : reordered);

    try {
      await reorderLinks(reordered.map((link) => link.id));
    } catch (reorderError) {
      setError(getWriteErrorMessage(reorderError));
      await loadLinks();
    }
  };

  const toggleActive = async (link) => {
    try {
      await updateLink(link.id, { active: !link.active });
      await loadLinks();
    } catch (toggleError) {
      setError(getWriteErrorMessage(toggleError));
    }
  };

  const confirmDelete = async () => {
    const link = links.find((l) => l.id === deleteId);
    setDeleteId(null);
    if (!link) return;

    try {
      await deleteLink(link.id);
      if (editingId === link.id) closeForm();
      await loadLinks();
    } catch (deleteError) {
      setError(getWriteErrorMessage(deleteError));
    }
  };

  const deleteTarget = links.find((l) => l.id === deleteId);

  const renderRow = (link, { isWebsite, index } = {}) => (
    <li key={link.id} className="admin-links-list-item">
      <div className="admin-links-list-icon">
        <LinkTypeIcon type={link.type} />
      </div>

      <div className="admin-links-list-info">
        <strong>{link.label}</strong>
        <span>{LINK_TYPE_LABELS[link.type]}</span>
        {!getLinkHref(link) && (
          <span className="admin-links-badge admin-links-badge-warning">Destino inválido</span>
        )}
        {isWebsite && <span className="admin-links-badge">Fijo</span>}
        {!isWebsite && !link.active && <span className="admin-links-badge admin-links-badge-muted">Oculto</span>}
      </div>

      <div className="admin-links-list-actions">
        {!isWebsite && (
          <>
            <button
              type="button"
              className="admin-links-btn admin-links-btn-icon"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label="Mover arriba"
            >
              ↑
            </button>
            <button
              type="button"
              className="admin-links-btn admin-links-btn-icon"
              onClick={() => move(index, 1)}
              disabled={index === otherLinks.length - 1}
              aria-label="Mover abajo"
            >
              ↓
            </button>
          </>
        )}
        <button type="button" className="admin-links-btn" onClick={() => openEditForm(link)}>
          Editar
        </button>
        {!isWebsite && (
          <button type="button" className="admin-links-btn" onClick={() => toggleActive(link)}>
            {link.active ? 'Ocultar' : 'Mostrar'}
          </button>
        )}
        {!isWebsite && (
          <button
            type="button"
            className="admin-links-btn admin-links-btn-danger"
            onClick={() => setDeleteId(link.id)}
          >
            Eliminar
          </button>
        )}
      </div>
    </li>
  );

  return (
    <div className="admin-links-editor">
      <div className="admin-links-editor-header">
        <h2>Enlaces</h2>
        <button type="button" className="admin-links-btn admin-links-btn-primary" onClick={openCreateForm}>
          + Agregar enlace
        </button>
      </div>

      {error && <p className="admin-links-editor-error" role="alert">{error}</p>}

      {loading ? (
        <p className="admin-links-editor-status">Cargando…</p>
      ) : (
        <ul className="admin-links-list">
          {websiteLink && renderRow(websiteLink, { isWebsite: true })}
          {otherLinks.map((link, index) => renderRow(link, { index }))}
        </ul>
      )}

      {editingId && (
        <form className="admin-links-form" onSubmit={handleSubmit}>
          <h3>
            {editingLink?.id === WEBSITE_LINK_ID
              ? 'Editar página web'
              : editingLink
                ? 'Editar enlace'
                : 'Nuevo enlace'}
          </h3>

          {editingLink ? (
            <p className="admin-links-form-hint">Tipo: {LINK_TYPE_LABELS[form.type]}</p>
          ) : (
            <>
              <label htmlFor="links-form-type">Tipo *</label>
              <select id="links-form-type" value={form.type} onChange={handleFieldChange('type')} disabled={saving}>
                {CREATABLE_LINK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {LINK_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </>
          )}

          <label htmlFor="links-form-label">Texto visible *</label>
          <input
            id="links-form-label"
            type="text"
            placeholder={form.type === 'whatsapp' ? 'Ej: WhatsApp Agrupación' : `Ej: ${LINK_TYPE_LABELS[form.type]}`}
            value={form.label}
            onChange={handleFieldChange('label')}
            disabled={saving}
            required
          />

          {form.type === 'whatsapp' ? (
            <>
              <label htmlFor="links-form-value">Número de WhatsApp (sin 0 ni 15) *</label>
              <input
                id="links-form-value"
                type="tel"
                inputMode="numeric"
                placeholder="1170061908"
                value={form.value}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, value: sanitizeWhatsappInput(event.target.value) }))
                }
                disabled={saving}
                required
              />
              {form.value && (
                <p className="admin-links-form-hint">
                  {buildWhatsappUrl(form.value)
                    ? `Link: ${buildWhatsappUrl(form.value, form.whatsappMessage)}`
                    : `Faltan dígitos (${form.value.length}/10).`}
                </p>
              )}

              <label htmlFor="links-form-message">Mensaje predefinido (opcional)</label>
              <textarea
                id="links-form-message"
                value={form.whatsappMessage}
                onChange={handleFieldChange('whatsappMessage')}
                disabled={saving}
                rows={2}
              />
            </>
          ) : (
            <>
              <label htmlFor="links-form-value">{form.type === 'email' ? 'Email *' : 'URL *'}</label>
              <input
                id="links-form-value"
                type={form.type === 'email' ? 'email' : 'url'}
                placeholder={form.type === 'email' ? 'contacto@agrupacionargentinaazul.com' : 'https://...'}
                value={form.value}
                onChange={handleFieldChange('value')}
                disabled={saving}
                required
              />
            </>
          )}

          {formError && <p className="admin-links-editor-error" role="alert">{formError}</p>}

          <div className="admin-links-form-actions">
            <button type="button" className="admin-links-btn" onClick={closeForm} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="admin-links-btn admin-links-btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Eliminar enlace"
        message={deleteTarget ? `¿Eliminar "${deleteTarget.label}"? Esta acción no se puede deshacer.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminLinksEditor;

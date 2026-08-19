import { useEffect, useState } from 'react';
import {
  listTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  reorderTeamMembers,
} from '../../firebase/team';
import { uploadImage, deleteImageByUrl } from '../../firebase/images';
import { getWriteErrorMessage } from '../../firebase/errors';
import { buildWhatsappUrl, sanitizeWhatsappInput } from '../../utils/whatsapp';
import ConfirmDialog from './ConfirmDialog';
import './AdminTeamEditor.css';

// Partner Tecnológico dejó de ser un integrante administrable: su tarjeta es
// fija en el código (repo/src/components/Team.jsx), como estaba antes de
// esta funcionalidad. El único rol destacado asignable desde el panel es
// "Presidente".
const FEATURED_ROLE_OPTIONS = [
  { value: '', label: 'Ninguno (tarjeta estándar)' },
  { value: 'presidente', label: 'Presidente' },
];

const FEATURED_ROLE_LABELS = {
  presidente: 'Presidente',
};

const EMPTY_FORM = {
  name: '',
  role: '',
  bio: '',
  whatsappNumber: '',
  featuredRole: '',
};

/**
 * Editor de equipo reutilizable por sección (FR-004, FR-006, FR-007, FR-007a,
 * FR-009). Se monta en /admin/equipo-home y /admin/equipo-acuicultura con
 * distinta prop `section`.
 */
const AdminTeamEditor = ({ section }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null); // null = form cerrado, 'new' = alta
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState(null);

  const isHome = section === 'home';

  const loadMembers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listTeamMembers(section);
      setMembers(data);
    } catch (loadError) {
      setError(getWriteErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
    closeForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  const openCreateForm = () => {
    setEditingId('new');
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setFormError('');
  };

  const openEditForm = (member) => {
    setEditingId(member.id);
    setForm({
      name: member.name ?? '',
      role: member.role ?? '',
      bio: member.bio ?? '',
      whatsappNumber: member.whatsappNumber ?? '',
      featuredRole: member.featuredRole ?? '',
    });
    setPhotoFile(null);
    setFormError('');
  };

  const closeForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setFormError('');
  };

  const handleFieldChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  // Advertencia no bloqueante de featuredRole duplicado (FR-007a, research.md §8, T019).
  const duplicateFeaturedWarning =
    isHome && form.featuredRole
      ? members.find((member) => member.id !== editingId && member.featuredRole === form.featuredRole)
      : null;

  const editingMember = editingId && editingId !== 'new' ? members.find((m) => m.id === editingId) : null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!form.name.trim() || !form.role.trim()) {
      setFormError('Nombre y rol/cargo son obligatorios.');
      return;
    }

    setSaving(true);
    try {
      let photoUrl = editingMember?.photoUrl ?? null;

      if (photoFile) {
        // Subir la nueva antes de borrar la anterior (FR-009, research.md §5, T020).
        const uploadedUrl = await uploadImage(photoFile, `team/${section}`);
        if (editingMember?.photoUrl) {
          await deleteImageByUrl(editingMember.photoUrl);
        }
        photoUrl = uploadedUrl;
      }

      const payload = {
        section,
        name: form.name.trim(),
        role: form.role.trim(),
        bio: form.bio.trim(),
        whatsappNumber: sanitizeWhatsappInput(form.whatsappNumber),
        photoUrl,
        featuredRole: isHome ? form.featuredRole || null : null,
      };

      if (editingMember) {
        await updateTeamMember(editingMember.id, payload);
      } else {
        await createTeamMember({ ...payload, order: members.length });
      }

      closeForm();
      await loadMembers();
    } catch (submitError) {
      setFormError(submitError?.code ? getWriteErrorMessage(submitError) : submitError.message);
    } finally {
      setSaving(false);
    }
  };

  // Reordenamiento (FR-007, T021): mueve un integrante una posición y persiste
  // el nuevo orden de toda la sección con writeBatch.
  const move = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const reordered = [...members];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setMembers(reordered);

    try {
      await reorderTeamMembers(reordered.map((member) => member.id));
    } catch (reorderError) {
      setError(getWriteErrorMessage(reorderError));
      await loadMembers();
    }
  };

  const confirmDelete = async () => {
    const member = members.find((m) => m.id === deleteId);
    setDeleteId(null);
    if (!member) return;

    try {
      if (member.photoUrl) {
        await deleteImageByUrl(member.photoUrl);
      }
      await deleteTeamMember(member.id);
      if (editingId === member.id) closeForm();
      await loadMembers();
    } catch (deleteError) {
      setError(getWriteErrorMessage(deleteError));
    }
  };

  const deleteTarget = members.find((m) => m.id === deleteId);

  return (
    <div className="admin-team-editor">
      <div className="admin-team-editor-header">
        <h2>{isHome ? 'Equipo · Home' : 'Equipo · Acuicultura'}</h2>
        <button type="button" className="admin-team-btn admin-team-btn-primary" onClick={openCreateForm}>
          + Agregar integrante
        </button>
      </div>

      {error && <p className="admin-team-editor-error" role="alert">{error}</p>}

      {loading ? (
        <p className="admin-team-editor-status">Cargando…</p>
      ) : members.length === 0 ? (
        <p className="admin-team-editor-status">Todavía no hay integrantes cargados en esta sección.</p>
      ) : (
        <ul className="admin-team-list">
          {members.map((member, index) => (
            <li key={member.id} className="admin-team-list-item">
              <div className="admin-team-list-photo">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.name} />
                ) : (
                  <div className="admin-team-list-photo-placeholder" aria-hidden="true" />
                )}
              </div>

              <div className="admin-team-list-info">
                <strong>{member.name}</strong>
                <span>{member.role}</span>
                {member.featuredRole && (
                  <span className="admin-team-badge">{FEATURED_ROLE_LABELS[member.featuredRole]}</span>
                )}
              </div>

              <div className="admin-team-list-actions">
                <button
                  type="button"
                  className="admin-team-btn admin-team-btn-icon"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Mover arriba"
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="admin-team-btn admin-team-btn-icon"
                  onClick={() => move(index, 1)}
                  disabled={index === members.length - 1}
                  aria-label="Mover abajo"
                >
                  ↓
                </button>
                <button type="button" className="admin-team-btn" onClick={() => openEditForm(member)}>
                  Editar
                </button>
                <button
                  type="button"
                  className="admin-team-btn admin-team-btn-danger"
                  onClick={() => setDeleteId(member.id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingId && (
        <form className="admin-team-form" onSubmit={handleSubmit}>
          <h3>{editingMember ? 'Editar integrante' : 'Nuevo integrante'}</h3>

          <label htmlFor="team-form-name">Nombre *</label>
          <input
            id="team-form-name"
            type="text"
            value={form.name}
            onChange={handleFieldChange('name')}
            disabled={saving}
            required
          />

          <label htmlFor="team-form-role">Rol / cargo *</label>
          <input
            id="team-form-role"
            type="text"
            value={form.role}
            onChange={handleFieldChange('role')}
            disabled={saving}
            required
          />

          <label htmlFor="team-form-bio">Biografía</label>
          <textarea
            id="team-form-bio"
            value={form.bio}
            onChange={handleFieldChange('bio')}
            disabled={saving}
            rows={3}
          />

          <label htmlFor="team-form-whatsapp">WhatsApp (número, sin 0 ni 15)</label>
          <input
            id="team-form-whatsapp"
            type="tel"
            inputMode="numeric"
            placeholder="1170061908"
            value={form.whatsappNumber}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, whatsappNumber: sanitizeWhatsappInput(event.target.value) }))
            }
            disabled={saving}
          />
          {form.whatsappNumber && (
            <p className="admin-team-form-hint">
              {buildWhatsappUrl(form.whatsappNumber)
                ? `Link: ${buildWhatsappUrl(form.whatsappNumber)}`
                : `Faltan dígitos (${form.whatsappNumber.length}/10).`}
            </p>
          )}

          {isHome && (
            <>
              <label htmlFor="team-form-featured">Rol destacado</label>
              <select
                id="team-form-featured"
                value={form.featuredRole}
                onChange={handleFieldChange('featuredRole')}
                disabled={saving}
              >
                {FEATURED_ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {duplicateFeaturedWarning && (
                <p className="admin-team-form-warning">
                  Ya existe otro integrante ({duplicateFeaturedWarning.name}) con el rol destacado "
                  {FEATURED_ROLE_LABELS[form.featuredRole]}". Se puede guardar igual, pero van a coexistir dos
                  tarjetas con ese formato.
                </p>
              )}
            </>
          )}

          <label htmlFor="team-form-photo">Foto</label>
          {editingMember?.photoUrl && !photoFile && (
            <img src={editingMember.photoUrl} alt="Foto actual" className="admin-team-form-photo-preview" />
          )}
          <input
            id="team-form-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
            disabled={saving}
          />

          {formError && <p className="admin-team-editor-error" role="alert">{formError}</p>}

          <div className="admin-team-form-actions">
            <button type="button" className="admin-team-btn" onClick={closeForm} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="admin-team-btn admin-team-btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Eliminar integrante"
        message={deleteTarget ? `¿Eliminar a ${deleteTarget.name}? Esta acción no se puede deshacer.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default AdminTeamEditor;

import { useEffect, useState } from 'react';
import {
  listBlogPostsAdmin,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  publishBlogPost,
  unpublishBlogPost,
  isSlugAvailable,
  generateSlug,
} from '../../firebase/blog';
import { uploadImage, deleteImageByUrl } from '../../firebase/images';
import { getWriteErrorMessage } from '../../firebase/errors';
import ConfirmDialog from './ConfirmDialog';
import './AdminBlogEditor.css';

const EMPTY_FORM = { title: '', slug: '', body: '', authorName: '' };

const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * Editor de blog (FR-004, FR-010 a FR-015): listado admin (incluye
 * borradores) con formulario de alta/edición y acciones de
 * publicar/despublicar/eliminar (T030–T033).
 */
const AdminBlogEditor = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingSlug, setEditingSlug] = useState(null); // null = form cerrado, 'new' = alta
  const [form, setForm] = useState(EMPTY_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [authorFile, setAuthorFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteSlug, setDeleteSlug] = useState(null);
  const [publishingSlug, setPublishingSlug] = useState(null);

  const loadPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listBlogPostsAdmin();
      setPosts(data);
    } catch (loadError) {
      setError(getWriteErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const editingPost = editingSlug && editingSlug !== 'new' ? posts.find((p) => p.slug === editingSlug) : null;

  const openCreateForm = () => {
    setEditingSlug('new');
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setCoverFile(null);
    setAuthorFile(null);
    setFormError('');
  };

  const openEditForm = (post) => {
    setEditingSlug(post.slug);
    setForm({
      title: post.title ?? '',
      slug: post.slug,
      body: post.body ?? '',
      authorName: post.authorName ?? '',
    });
    setSlugTouched(true);
    setCoverFile(null);
    setAuthorFile(null);
    setFormError('');
  };

  const closeForm = () => {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setSlugTouched(false);
    setCoverFile(null);
    setAuthorFile(null);
    setFormError('');
  };

  // El slug se autogenera del título (FR-014, research.md §6) mientras el
  // admin no lo haya tocado a mano, y solo mientras la entrada es nueva —
  // una vez creada, el slug es el ID del documento y no se puede cambiar.
  const handleTitleChange = (event) => {
    const title = event.target.value;
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugTouched || editingPost ? prev.slug : generateSlug(title),
    }));
  };

  const handleSlugChange = (event) => {
    setSlugTouched(true);
    setForm((prev) => ({ ...prev, slug: generateSlug(event.target.value) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!form.title.trim() || !form.body.trim()) {
      setFormError('Título y cuerpo son obligatorios.');
      return;
    }
    if (!editingPost && !form.slug) {
      setFormError('El slug no puede quedar vacío.');
      return;
    }

    setSaving(true);
    try {
      let coverImageUrl = editingPost?.coverImageUrl ?? null;

      if (coverFile) {
        // Subir la nueva antes de borrar la anterior (FR-012, research.md §5, T032).
        const uploadedUrl = await uploadImage(coverFile, 'blog');
        if (editingPost?.coverImageUrl) {
          await deleteImageByUrl(editingPost.coverImageUrl);
        }
        coverImageUrl = uploadedUrl;
      }

      let authorPhotoUrl = editingPost?.authorPhotoUrl ?? null;

      if (authorFile) {
        const uploadedUrl = await uploadImage(authorFile, 'blog');
        if (editingPost?.authorPhotoUrl) {
          await deleteImageByUrl(editingPost.authorPhotoUrl);
        }
        authorPhotoUrl = uploadedUrl;
      }

      const authorName = form.authorName.trim();
      // Sin nombre de autor no tiene sentido conservar su foto: el bloque del
      // sidebar no se renderiza y la imagen quedaría huérfana en Storage.
      if (!authorName && authorPhotoUrl) {
        await deleteImageByUrl(authorPhotoUrl);
        authorPhotoUrl = null;
      }

      const authorFields = { authorName: authorName || null, authorPhotoUrl };

      if (editingPost) {
        await updateBlogPost(editingPost.slug, {
          title: form.title.trim(),
          body: form.body,
          coverImageUrl,
          ...authorFields,
        });
      } else {
        // Chequeo de disponibilidad antes de crear (research.md §6) — la
        // garantía real de unicidad es que el slug es el ID del documento.
        const available = await isSlugAvailable(form.slug);
        if (!available) {
          setFormError(`El slug "${form.slug}" ya está en uso. Probá con otro (por ejemplo "${form.slug}-2").`);
          setSaving(false);
          return;
        }
        await createBlogPost(form.slug, {
          title: form.title.trim(),
          body: form.body,
          coverImageUrl,
          ...authorFields,
        });
      }

      closeForm();
      await loadPosts();
    } catch (submitError) {
      setFormError(submitError?.code ? getWriteErrorMessage(submitError) : submitError.message);
    } finally {
      setSaving(false);
    }
  };

  // Publicar/despublicar (FR-013): bloquea la publicación sin portada con un
  // mensaje claro antes de intentar la escritura (la regla lo rechazaría
  // igual, pero esto da feedback inmediato sin esperar ese rechazo, T031).
  const handlePublishToggle = async (post) => {
    setError('');
    if (post.status !== 'published' && !post.coverImageUrl) {
      setError(`"${post.title}" necesita una imagen de portada antes de poder publicarse.`);
      return;
    }

    setPublishingSlug(post.slug);
    try {
      if (post.status === 'published') {
        await unpublishBlogPost(post.slug);
      } else {
        await publishBlogPost(post.slug, !!post.publishedAt);
      }
      await loadPosts();
    } catch (publishError) {
      setError(getWriteErrorMessage(publishError));
    } finally {
      setPublishingSlug(null);
    }
  };

  const confirmDelete = async () => {
    const post = posts.find((p) => p.slug === deleteSlug);
    setDeleteSlug(null);
    if (!post) return;

    try {
      if (post.coverImageUrl) {
        await deleteImageByUrl(post.coverImageUrl);
      }
      if (post.authorPhotoUrl) {
        await deleteImageByUrl(post.authorPhotoUrl);
      }
      await deleteBlogPost(post.slug);
      if (editingSlug === post.slug) closeForm();
      await loadPosts();
    } catch (deleteError) {
      setError(getWriteErrorMessage(deleteError));
    }
  };

  const deleteTarget = posts.find((p) => p.slug === deleteSlug);

  return (
    <div className="admin-blog-editor">
      <div className="admin-blog-editor-header">
        <h2>Blog</h2>
        <button type="button" className="admin-blog-btn admin-blog-btn-primary" onClick={openCreateForm}>
          + Nueva entrada
        </button>
      </div>

      {error && <p className="admin-blog-editor-error" role="alert">{error}</p>}

      {loading ? (
        <p className="admin-blog-editor-status">Cargando…</p>
      ) : posts.length === 0 ? (
        <p className="admin-blog-editor-status">Todavía no hay entradas cargadas.</p>
      ) : (
        <ul className="admin-blog-list">
          {posts.map((post) => (
            <li key={post.slug} className="admin-blog-list-item">
              <div className="admin-blog-list-cover">
                {post.coverImageUrl ? (
                  <img src={post.coverImageUrl} alt={post.title} />
                ) : (
                  <div className="admin-blog-list-cover-placeholder" aria-hidden="true" />
                )}
              </div>

              <div className="admin-blog-list-info">
                <strong>{post.title}</strong>
                <span>
                  <span className={`admin-blog-badge admin-blog-badge-${post.status}`}>
                    {post.status === 'published' ? 'Publicado' : 'Borrador'}
                  </span>
                  {post.updatedAt && ` · Actualizado ${formatDate(post.updatedAt)}`}
                </span>
              </div>

              <div className="admin-blog-list-actions">
                <button type="button" className="admin-blog-btn" onClick={() => openEditForm(post)}>
                  Editar
                </button>
                <button
                  type="button"
                  className="admin-blog-btn"
                  onClick={() => handlePublishToggle(post)}
                  disabled={publishingSlug === post.slug}
                >
                  {publishingSlug === post.slug
                    ? 'Guardando…'
                    : post.status === 'published'
                      ? 'Despublicar'
                      : 'Publicar'}
                </button>
                <button
                  type="button"
                  className="admin-blog-btn admin-blog-btn-danger"
                  onClick={() => setDeleteSlug(post.slug)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editingSlug && (
        <form className="admin-blog-form" onSubmit={handleSubmit}>
          <h3>{editingPost ? 'Editar entrada' : 'Nueva entrada'}</h3>

          <label htmlFor="blog-form-title">Título *</label>
          <input
            id="blog-form-title"
            type="text"
            value={form.title}
            onChange={handleTitleChange}
            disabled={saving}
            required
          />

          <label htmlFor="blog-form-slug">Slug (URL) *</label>
          <input
            id="blog-form-slug"
            type="text"
            value={form.slug}
            onChange={handleSlugChange}
            disabled={saving || !!editingPost}
            required
          />
          {editingPost && (
            <p className="admin-blog-form-hint">El slug no se puede cambiar después de creada la entrada.</p>
          )}

          <label htmlFor="blog-form-body">Cuerpo *</label>
          <textarea
            id="blog-form-body"
            value={form.body}
            onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
            disabled={saving}
            rows={10}
            required
          />

          <label htmlFor="blog-form-cover">
            Imagen de portada{editingPost?.status !== 'published' ? ' (requerida para publicar)' : ''}
          </label>
          {editingPost?.coverImageUrl && !coverFile && (
            <img src={editingPost.coverImageUrl} alt="Portada actual" className="admin-blog-form-cover-preview" />
          )}
          <input
            id="blog-form-cover"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setCoverFile(event.target.files?.[0] ?? null)}
            disabled={saving}
          />

          <label htmlFor="blog-form-author">Autor de la entrada (opcional)</label>
          <input
            id="blog-form-author"
            type="text"
            value={form.authorName}
            onChange={(event) => setForm((prev) => ({ ...prev, authorName: event.target.value }))}
            disabled={saving}
            placeholder="Nombre que se muestra en el sidebar de la nota"
          />

          <label htmlFor="blog-form-author-photo">Foto del autor (opcional)</label>
          {editingPost?.authorPhotoUrl && !authorFile && (
            <img
              src={editingPost.authorPhotoUrl}
              alt="Foto del autor"
              className="admin-blog-form-author-preview"
            />
          )}
          <input
            id="blog-form-author-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setAuthorFile(event.target.files?.[0] ?? null)}
            disabled={saving}
          />
          <p className="admin-blog-form-hint">
            Sin nombre de autor, ese bloque no aparece en el sidebar de la nota.
          </p>

          {formError && <p className="admin-blog-editor-error" role="alert">{formError}</p>}

          <div className="admin-blog-form-actions">
            <button type="button" className="admin-blog-btn" onClick={closeForm} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="admin-blog-btn admin-blog-btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={!!deleteSlug}
        title="Eliminar entrada"
        message={deleteTarget ? `¿Eliminar "${deleteTarget.title}"? Esta acción no se puede deshacer.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteSlug(null)}
      />
    </div>
  );
};

export default AdminBlogEditor;

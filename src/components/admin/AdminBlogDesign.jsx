import { useEffect, useMemo, useState } from 'react';
import { getBlogSettings, saveBlogSettings, DEFAULT_BLOG_SETTINGS } from '../../firebase/blogSettings';
import { uploadImage, deleteImageByUrl } from '../../firebase/images';
import { getWriteErrorMessage } from '../../firebase/errors';
import './AdminBlogDesign.css';

/**
 * URL de previsualización de un archivo recién elegido. Se crea una sola vez
 * por archivo y se revoca al cambiarlo: hacerlo en el render, como sería lo
 * directo, crea un blob nuevo en cada tecleo del formulario.
 */
const useFilePreview = (file) => {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);
  return url;
};

/**
 * Ajustes visuales del blog: la imagen que va de fondo en el banner de
 * `/blog` y los dos bloques fijos del sidebar del detalle (presidente y
 * coordinador). El autor de cada nota no se edita acá — es un campo por
 * entrada, en el editor de blog.
 *
 * Las imágenes siguen el mismo criterio que el resto del panel: se sube la
 * nueva antes de borrar la anterior, para no dejar el sitio sin imagen si
 * falla la subida (research.md §5).
 */
const AdminBlogDesign = () => {
  const [settings, setSettings] = useState(DEFAULT_BLOG_SETTINGS);
  const [heroFile, setHeroFile] = useState(null);
  const [presidentFile, setPresidentFile] = useState(null);
  const [coordinatorFile, setCoordinatorFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const heroPreview = useFilePreview(heroFile);
  const presidentPreview = useFilePreview(presidentFile);
  const coordinatorPreview = useFilePreview(coordinatorFile);

  useEffect(() => {
    let cancelled = false;
    getBlogSettings()
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch((loadError) => {
        if (!cancelled) setError(getWriteErrorMessage(loadError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateBlock = (block, field, value) => {
    setSettings((prev) => ({ ...prev, [block]: { ...prev[block], [field]: value } }));
  };

  /** Sube el archivo nuevo (si hay) y borra el anterior; devuelve la URL vigente. */
  const resolveImage = async (file, currentUrl) => {
    if (!file) return currentUrl ?? null;
    const uploadedUrl = await uploadImage(file, 'blog');
    if (currentUrl) {
      await deleteImageByUrl(currentUrl);
    }
    return uploadedUrl;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const heroImageUrl = await resolveImage(heroFile, settings.heroImageUrl);
      const presidentPhotoUrl = await resolveImage(presidentFile, settings.president.photoUrl);
      const coordinatorPhotoUrl = await resolveImage(coordinatorFile, settings.coordinator.photoUrl);

      const next = {
        heroImageUrl,
        president: {
          title: settings.president.title.trim() || DEFAULT_BLOG_SETTINGS.president.title,
          name: settings.president.name.trim(),
          text: settings.president.text.trim(),
          photoUrl: presidentPhotoUrl,
        },
        coordinator: {
          title: settings.coordinator.title.trim() || DEFAULT_BLOG_SETTINGS.coordinator.title,
          name: settings.coordinator.name.trim(),
          text: settings.coordinator.text.trim(),
          photoUrl: coordinatorPhotoUrl,
        },
      };

      await saveBlogSettings(next);
      setSettings(next);
      setHeroFile(null);
      setPresidentFile(null);
      setCoordinatorFile(null);
      setSuccess('Cambios guardados. Ya se ven en el sitio público.');
    } catch (submitError) {
      setError(submitError?.code ? getWriteErrorMessage(submitError) : submitError.message);
    } finally {
      setSaving(false);
    }
  };

  const removeHeroImage = () => {
    setHeroFile(null);
    setSettings((prev) => ({ ...prev, heroImageUrl: null }));
  };

  if (loading) {
    return (
      <div className="admin-blog-design">
        <h2>Blog · Diseño</h2>
        <p className="admin-blog-design-status">Cargando…</p>
      </div>
    );
  }

  const renderBlock = (key, file, setFile, preview, hint) => (
    <fieldset className="admin-blog-design-block">
      <legend>{settings[key].title || hint}</legend>

      <label htmlFor={`${key}-title`}>Título del bloque</label>
      <input
        id={`${key}-title`}
        type="text"
        value={settings[key].title}
        onChange={(event) => updateBlock(key, 'title', event.target.value)}
        placeholder={hint}
        disabled={saving}
      />

      <label htmlFor={`${key}-name`}>Nombre</label>
      <input
        id={`${key}-name`}
        type="text"
        value={settings[key].name}
        onChange={(event) => updateBlock(key, 'name', event.target.value)}
        disabled={saving}
      />

      <label htmlFor={`${key}-text`}>Leyenda</label>
      <textarea
        id={`${key}-text`}
        rows={3}
        value={settings[key].text}
        onChange={(event) => updateBlock(key, 'text', event.target.value)}
        disabled={saving}
      />

      <label htmlFor={`${key}-photo`}>Foto</label>
      <div className="admin-blog-design-photo-row">
        {(preview || settings[key].photoUrl) && (
          <img
            src={preview ?? settings[key].photoUrl}
            alt={settings[key].name || settings[key].title}
            className="admin-blog-design-photo-preview"
          />
        )}
        <input
          id={`${key}-photo`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          disabled={saving}
        />
      </div>

      <p className="admin-blog-design-hint">
        Si el nombre queda vacío, este bloque no se muestra en el sidebar.
      </p>
    </fieldset>
  );

  return (
    <div className="admin-blog-design">
      <h2>Blog · Diseño</h2>
      <p className="admin-blog-design-intro">
        Imagen del banner de <code>/blog</code> y bloques fijos del sidebar de cada entrada.
        El autor de cada nota se carga en la entrada, desde <strong>Blog</strong>.
      </p>

      <form onSubmit={handleSubmit}>
        <fieldset className="admin-blog-design-block">
          <legend>Imagen del banner de /blog</legend>

          <div className="admin-blog-design-hero-row">
            {(heroPreview || settings.heroImageUrl) && (
              <img
                src={heroPreview ?? settings.heroImageUrl}
                alt="Banner del blog"
                className="admin-blog-design-hero-preview"
              />
            )}
            <div className="admin-blog-design-hero-actions">
              <input
                id="hero-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setHeroFile(event.target.files?.[0] ?? null)}
                disabled={saving}
              />
              {settings.heroImageUrl && !heroFile && (
                <button
                  type="button"
                  className="admin-blog-design-btn"
                  onClick={removeHeroImage}
                  disabled={saving}
                >
                  Quitar imagen
                </button>
              )}
            </div>
          </div>

          <p className="admin-blog-design-hint">
            Sin imagen, el banner usa el degradado de marca. JPG, PNG o WebP de hasta 5 MB.
          </p>
        </fieldset>

        {renderBlock('president', presidentFile, setPresidentFile, presidentPreview, 'Sobre el presidente')}
        {renderBlock('coordinator', coordinatorFile, setCoordinatorFile, coordinatorPreview, 'Sobre el coordinador')}

        {error && <p className="admin-blog-design-error" role="alert">{error}</p>}
        {success && <p className="admin-blog-design-success" role="status">{success}</p>}

        <div className="admin-blog-design-actions">
          <button type="submit" className="admin-blog-design-btn admin-blog-design-btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBlogDesign;

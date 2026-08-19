import { useEffect, useState } from 'react';
import { listPublishedBlogPosts } from '../../firebase/blog';
import { getBlogSettings, DEFAULT_BLOG_SETTINGS } from '../../firebase/blogSettings';
import BlogPostCard from './BlogPostCard';
import BlogHero from './BlogHero';
import Footer from '../Footer';
import './BlogPage.css';

/**
 * Página pública de listado de blog (FR-020a): grilla de tarjetas MVP con las
 * entradas publicadas, con estado vacío controlado ante error o sin entradas
 * (FR-021). Por encima de la grilla va el hero fiel al diseño de referencia
 * (`BlogHero`, FR-020), que no altera el layout MVP del listado (FR-020a).
 */
const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_BLOG_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;

    listPublishedBlogPosts()
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // La imagen del banner se administra desde el panel. Si falla la lectura,
    // el hero cae al degradado de marca en vez de romper la página (FR-021).
    getBlogSettings()
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch(() => {
        if (!cancelled) setSettings(DEFAULT_BLOG_SETTINGS);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="blog-page">
      <BlogHero
        variant="site"
        title="Blog"
        subtitle="Noticias y notas de la Agrupación Argentina Azul"
        backgroundImageUrl={settings.heroImageUrl}
      />

      <div className="container blog-page-listing">
        {error ? (
          <p className="blog-page-empty-state">No pudimos cargar las entradas del blog en este momento.</p>
        ) : loading ? (
          <p className="blog-page-empty-state">Cargando entradas…</p>
        ) : posts.length === 0 ? (
          <p className="blog-page-empty-state">Todavía no hay entradas publicadas.</p>
        ) : (
          <div className="blog-page-grid">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BlogPage;

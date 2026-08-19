import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getPublishedBlogPost, listPublishedBlogPosts } from '../../firebase/blog';
import { getBlogSettings, DEFAULT_BLOG_SETTINGS } from '../../firebase/blogSettings';
import BlogHero from './BlogHero';
import Footer from '../Footer';
import './BlogPostPage.css';

const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
};

/** Palabras por minuto usadas por el theme de referencia para su "Reading Time". */
const WORDS_PER_MINUTE = 275;

/** Ancho debajo del cual el theme de referencia esconde la columna lateral. */
const ASIDE_BREAKPOINT = 1100;

/**
 * Página pública de detalle de una entrada (FR-011, FR-015, FR-020).
 *
 * Resuelve el slug con `getDoc`; un borrador, un slug inexistente o un error
 * de red se tratan todos como "no encontrado" (nunca exponen contenido ni
 * rompen la página, FR-021).
 *
 * La estructura replica la página de post del theme Hexo "livemylife": el
 * `intro-header` con la portada de fondo (`BlogHero variant="post"`), la
 * columna de artículo con su pager al pie, la columna lateral (`#sidebar`,
 * fija al hacer scroll como en `catalog.js`, oculta debajo de 1100px) y el
 * bloque de widgets debajo del artículo (`.sidebar-container`).
 *
 * La columna lateral lleva el índice del artículo —armado con los encabezados
 * del cuerpo, hoy vacío porque las entradas son texto plano (FR-011)— y los
 * bloques de presentación: presidente y coordinador, editables desde
 * "Blog · Diseño" del panel, y el autor de la entrada, cargado en la entrada
 * misma. Cada bloque sin datos simplemente no se renderiza, y si no queda
 * ninguno la columna desaparece y el artículo usa el ancho de tablet.
 */
const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [siblings, setSiblings] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_BLOG_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [headings, setHeadings] = useState([]);
  const [asideFixed, setAsideFixed] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState(null);

  const bodyRef = useRef(null);
  const asideRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setPost(null);
    setHeadings([]);

    getPublishedBlogPost(slug)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setNotFound(true);
        } else {
          setPost(data);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // El listado alimenta el pager (entrada anterior/siguiente) y el widget de
    // abajo. Si falla, la página se muestra igual, solo sin esa navegación
    // (FR-021).
    listPublishedBlogPosts()
      .then((data) => {
        if (!cancelled) setSiblings(data);
      })
      .catch(() => {
        if (!cancelled) setSiblings([]);
      });

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
  }, [slug]);

  const paragraphs = useMemo(
    () => (post?.body ?? '').split('\n').filter((line) => line.trim() !== ''),
    [post]
  );

  const readingMeta = useMemo(() => {
    if (!post) return '';
    const words = (post.body ?? '').trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
    const parts = [];
    if (post.publishedAt) parts.push(`Publicado el ${formatDate(post.publishedAt)}`);
    if (words > 0) parts.push(`${words} palabras`);
    if (words > 0) parts.push(`${minutes} min de lectura`);
    return parts.join(' · ');
  }, [post]);

  const { previousPost, nextPost, otherPosts } = useMemo(() => {
    // `listPublishedBlogPosts` viene ordenado por `publishedAt` desc: el
    // elemento anterior en el array es la entrada más nueva.
    const index = siblings.findIndex((item) => item.slug === slug);
    if (index === -1) {
      return { previousPost: null, nextPost: null, otherPosts: siblings.slice(0, 5) };
    }
    return {
      nextPost: siblings[index - 1] ?? null,
      previousPost: siblings[index + 1] ?? null,
      otherPosts: siblings.filter((item) => item.slug !== slug).slice(0, 5),
    };
  }, [siblings, slug]);

  /** Bloques de presentación de la columna lateral, en orden. */
  const asideBlocks = useMemo(() => {
    const candidates = [
      { key: 'president', ...settings.president },
      { key: 'coordinator', ...settings.coordinator },
      {
        key: 'author',
        title: 'Sobre el autor',
        name: post?.authorName ?? '',
        text: '',
        photoUrl: post?.authorPhotoUrl ?? null,
      },
    ];
    return candidates.filter((block) => (block.name ?? '').trim() !== '');
  }, [settings, post]);

  // Índice lateral: se arma con los encabezados que haya en el cuerpo ya
  // renderizado. Con entradas de texto plano (FR-011) el resultado es vacío
  // y el índice queda omitido.
  useEffect(() => {
    if (!post || !bodyRef.current) return;
    const found = Array.from(bodyRef.current.querySelectorAll('h2, h3')).map((element, index) => {
      if (!element.id) element.id = `blog-post-heading-${index}`;
      return { id: element.id, text: element.textContent, level: Number(element.tagName.slice(1)) };
    });
    setHeadings(found);
  }, [post, paragraphs]);

  // Port de `catalog.js`: pasada la posición original de la columna lateral,
  // esta queda fija; y port del scroll-spy, que marca el encabezado en curso.
  const handleAsideScroll = useCallback(() => {
    if (!asideRef.current || window.innerWidth < ASIDE_BREAKPOINT) {
      setAsideFixed(false);
      return;
    }

    const asideTop = asideRef.current.offsetTop;
    setAsideFixed(window.scrollY > asideTop - 60);

    if (headings.length === 0) return;
    const current = headings.reduce((selected, heading) => {
      const element = document.getElementById(heading.id);
      if (!element) return selected;
      return element.getBoundingClientRect().top <= 80 ? heading.id : selected;
    }, headings[0].id);
    setActiveHeadingId(current);
  }, [headings]);

  useEffect(() => {
    if (headings.length === 0) return undefined;
    handleAsideScroll();
    window.addEventListener('scroll', handleAsideScroll, { passive: true });
    window.addEventListener('resize', handleAsideScroll);
    return () => {
      window.removeEventListener('scroll', handleAsideScroll);
      window.removeEventListener('resize', handleAsideScroll);
    };
  }, [handleAsideScroll, headings.length]);

  if (loading) {
    return (
      <div className="blog-post-page">
        <p className="blog-post-page-empty-state">Cargando…</p>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="blog-post-page">
        <div className="container blog-post-page-empty-state">
          <p>No encontramos la entrada que buscás.</p>
          <Link to="/blog" className="blog-post-page-back-link">← Volver al blog</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const hasAside = headings.length > 0 || asideBlocks.length > 0;

  return (
    <div className="blog-post-page">
      <BlogHero
        variant="post"
        title={post.title}
        meta={readingMeta}
        backgroundImageUrl={post.coverImageUrl}
      />

      <article className="blog-post">
        <div className="container">
          <div className={`blog-post-row${hasAside ? ' blog-post-row-with-aside' : ''}`}>
            <div className="blog-post-container">
              <div className="blog-post-body" ref={bodyRef}>
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <hr />

              <ul className="blog-post-pager">
                <li className={`blog-post-pager-previous${previousPost ? '' : ' disabled'}`}>
                  {previousPost ? (
                    <Link to={`/blog/${previousPost.slug}`} title={previousPost.title}>
                      ← Entrada anterior
                    </Link>
                  ) : (
                    <span>← Entrada anterior</span>
                  )}
                </li>
                <li className={`blog-post-pager-next${nextPost ? '' : ' disabled'}`}>
                  {nextPost ? (
                    <Link to={`/blog/${nextPost.slug}`} title={nextPost.title}>
                      Entrada siguiente →
                    </Link>
                  ) : (
                    <span>Entrada siguiente →</span>
                  )}
                </li>
              </ul>
            </div>

            {hasAside && (
              <aside className="blog-post-aside" ref={asideRef}>
                <div className="blog-post-aside-inner">
                  {headings.length > 0 && (
                    <nav className={`blog-post-toc${asideFixed ? ' is-fixed' : ''}`}>
                      <strong className="blog-post-toc-title">Contenidos</strong>
                      <ol className="blog-post-toc-nav">
                        {headings.map((heading) => (
                          <li
                            key={heading.id}
                            className={`blog-post-toc-item blog-post-toc-level-${heading.level}${
                              activeHeadingId === heading.id ? ' active' : ''
                            }`}
                          >
                            <a href={`#${heading.id}`}>{heading.text}</a>
                          </li>
                        ))}
                      </ol>
                    </nav>
                  )}

                  {asideBlocks.map((block) => (
                    <section className="blog-post-about" key={block.key}>
                      <h2 className="blog-post-about-title">{block.title}</h2>
                      <div className="blog-post-about-person">
                        {block.photoUrl && (
                          <img
                            className="blog-post-about-photo"
                            src={block.photoUrl}
                            alt={block.name}
                            loading="lazy"
                          />
                        )}
                        <span className="blog-post-about-name">{block.name}</span>
                      </div>
                      {block.text && <p className="blog-post-about-text">{block.text}</p>}
                    </section>
                  ))}
                </div>
              </aside>
            )}

            <div className="blog-post-sidebar-container">
              {otherPosts.length > 0 && (
                <section>
                  <h5>
                    <Link to="/blog">Más entradas</Link>
                  </h5>
                  <ul className="blog-post-sidebar-list">
                    {otherPosts.map((item) => (
                      <li key={item.slug}>
                        <Link to={`/blog/${item.slug}`}>{item.title}</Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <hr />
              <Link to="/blog" className="blog-post-page-back-link">← Volver al blog</Link>
            </div>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPostPage;

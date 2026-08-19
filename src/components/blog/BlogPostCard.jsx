import { Link } from 'react-router-dom';

const formatDate = (timestamp) => {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
};

/**
 * Tarjeta MVP del listado público de blog (FR-020a): imagen de portada,
 * título y fecha, sin sidebar de widgets ni resumen. Fidelidad visual al
 * diseño de referencia queda fuera de esta tarjeta por decisión del spec
 * (User Story 3 se limita al hero y al detalle).
 */
const BlogPostCard = ({ post }) => (
  <Link to={`/blog/${post.slug}`} className="blog-post-card">
    <div className="blog-post-card-cover">
      {post.coverImageUrl ? (
        <img src={post.coverImageUrl} alt={post.title} loading="lazy" />
      ) : (
        <div className="blog-post-card-cover-placeholder" aria-hidden="true" />
      )}
    </div>
    <div className="blog-post-card-body">
      <h3 className="blog-post-card-title">{post.title}</h3>
      {post.publishedAt && <span className="blog-post-card-date">{formatDate(post.publishedAt)}</span>}
    </div>
  </Link>
);

export default BlogPostCard;

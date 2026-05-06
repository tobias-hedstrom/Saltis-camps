import { Link, useParams } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { formatDate } from "../utils/costCalculations";
import { CATEGORY_COLORS, categoryLabel } from "../utils/displayText";

export default function NewsDetail() {
  const { newsId } = useParams();
  const { getNews, getCamp } = useAppData();
  const post = getNews(newsId);

  if (!post) {
    return (
      <div className="news-detail">
        <Link to="/news" className="back-link">Tillbaka till nyheter</Link>
        <div className="card" style={{ marginTop: "2rem", textAlign: "center", padding: "3rem" }}>
          <h2>Nyheten hittades inte</h2>
          <p style={{ color: "var(--gray-500)", marginTop: "0.5rem" }}>
            Inlägget kan ha tagits bort.
          </p>
          <Link to="/news" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
            Tillbaka till nyheter
          </Link>
        </div>
      </div>
    );
  }

  // Support both old and new field names from cached localStorage data
  const publishDate = post.publishDate || post.date;
  const excerpt = post.excerpt || post.summary;
  const relatedCampId = post.relatedCampId || post.linkedCampId;
  const relatedCamp = relatedCampId ? getCamp(relatedCampId) : null;
  const color = CATEGORY_COLORS[post.category] ?? "#6b7280";

  return (
    <div className="news-detail">
      <Link to="/news" className="back-link">Tillbaka till nyheter</Link>

      {/* Hero image or placeholder */}
      {post.thumbnailImage ? (
        <div className="news-hero-image-wrap">
          <img src={post.thumbnailImage} alt={post.title} className="news-hero-image" />
        </div>
      ) : (
        <div className="news-hero-placeholder" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, borderColor: color + "33" }}>
          <span className="news-hero-category" style={{ color }}>{categoryLabel(post.category)}</span>
        </div>
      )}

      <div className="news-detail-body">
        {/* Meta */}
        <div className="news-detail-meta">
          <span
            className="news-category-badge"
            style={{
              background: color + "20",
              color,
            }}
          >
            {categoryLabel(post.category)}
          </span>
          <span className="news-date">{formatDate(publishDate)}</span>
        </div>

        <h1 className="news-detail-title">{post.title}</h1>

        {excerpt && (
          <p className="news-detail-excerpt">{excerpt}</p>
        )}

        {post.body && (
          <div className="news-detail-text">
            {post.body.split("\n").map((para, i) =>
              para.trim() ? <p key={i}>{para}</p> : <br key={i} />
            )}
          </div>
        )}

        {/* Image gallery */}
        {post.images?.length > 0 && (
          <div className="news-gallery-section">
            <h2>Bilder</h2>
            <div className="news-gallery">
              {post.images.map((img) => (
                <div key={img.id} className="news-gallery-item">
                  <img src={img.url} alt={img.caption || ""} className="news-gallery-img" />
                  {img.caption && (
                    <p className="news-gallery-caption">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related camp */}
        {relatedCamp && (
          <div className="news-related-camp card">
            <div className="news-related-label">Kopplat läger</div>
            <div className="news-related-name">{relatedCamp.name}</div>
            <div className="news-related-location">{relatedCamp.location}</div>
            <Link to={`/camps/${relatedCamp.id}`} className="btn btn-primary btn-sm" style={{ marginTop: "0.75rem" }}>
              Visa läger
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

import { Link, useParams } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { formatDate } from "../utils/costCalculations";

const CATEGORY_COLORS = {
  "Previous Camps": "#3182ce",
  "Camp Reminder": "#e53e3e",
  "Board News": "#805ad5",
  "General News": "#38a169",
};

export default function NewsDetail() {
  const { newsId } = useParams();
  const { getNews, getCamp } = useAppData();
  const post = getNews(newsId);

  if (!post) {
    return (
      <div className="news-detail">
        <Link to="/news" className="back-link">Back to News</Link>
        <div className="card" style={{ marginTop: "2rem", textAlign: "center", padding: "3rem" }}>
          <h2>News post not found</h2>
          <p style={{ color: "var(--gray-500)", marginTop: "0.5rem" }}>
            This post may have been removed.
          </p>
          <Link to="/news" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
            Back to News
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
      <Link to="/news" className="back-link">Back to News</Link>

      {/* Hero image or placeholder */}
      {post.thumbnailImage ? (
        <div className="news-hero-image-wrap">
          <img src={post.thumbnailImage} alt={post.title} className="news-hero-image" />
        </div>
      ) : (
        <div className="news-hero-placeholder" style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, borderColor: color + "33" }}>
          <span className="news-hero-category" style={{ color }}>{post.category}</span>
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
            {post.category}
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
            <h2>Photos</h2>
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
            <div className="news-related-label">Related Camp</div>
            <div className="news-related-name">{relatedCamp.name}</div>
            <div className="news-related-location">{relatedCamp.location}</div>
            <Link to={`/camps/${relatedCamp.id}`} className="btn btn-primary btn-sm" style={{ marginTop: "0.75rem" }}>
              View Camp Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

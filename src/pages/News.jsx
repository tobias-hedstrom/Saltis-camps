import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppData } from "../hooks/useAppData";
import { formatDate } from "../utils/costCalculations";
import { NEWS_CATEGORIES } from "../data/initialData";

const ALL_CATEGORIES = ["All", ...NEWS_CATEGORIES];

const CATEGORY_COLORS = {
  "Previous Camps": "#3182ce",
  "Camp Reminder":  "#e53e3e",
  "Board News":     "#805ad5",
  "General News":   "#38a169",
};

export default function News() {
  const { newsPosts } = useAppData();
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? newsPosts
      : newsPosts.filter((n) => n.category === activeCategory);

  const sorted = [...filtered].sort((a, b) => {
    const dateA = a.publishDate || a.date || "";
    const dateB = b.publishDate || b.date || "";
    return dateB.localeCompare(dateA);
  });

  const byCategory = (cat) => newsPosts.filter((n) => n.category === cat);

  return (
    <div className="news-page">
      <div className="page-header">
        <h1>News</h1>
        <p>Updates, photos, camp reminders, and board information.</p>
      </div>

      <div className="filter-tabs">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-tab ${activeCategory === cat ? "filter-tab-active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {activeCategory === "All" ? (
        <>
          {NEWS_CATEGORIES.map((cat) => {
            const posts = byCategory(cat);
            if (posts.length === 0) return null;
            return (
              <section key={cat} className="section">
                <div className="section-header">
                  <h2>{cat}</h2>
                </div>
                <div className="news-grid">
                  {posts.map((p) => (
                    <NewsCard key={p.id} post={p} />
                  ))}
                </div>
              </section>
            );
          })}
          {newsPosts.length === 0 && (
            <p className="empty-state">No news posts yet.</p>
          )}
        </>
      ) : (
        <section className="section">
          <div className="news-grid">
            {sorted.map((p) => (
              <NewsCard key={p.id} post={p} />
            ))}
          </div>
          {sorted.length === 0 && (
            <p className="empty-state">No news in this category.</p>
          )}
        </section>
      )}
    </div>
  );
}

function NewsCard({ post }) {
  const publishDate = post.publishDate || post.date;
  const excerpt = post.excerpt || post.summary;
  const relatedCampId = post.relatedCampId || post.linkedCampId;
  const color = CATEGORY_COLORS[post.category] ?? "#6b7280";

  return (
    <Link to={`/news/${post.id}`} className="news-card-link">
      <div className="news-card card">
        {/* Image or placeholder */}
        <div className="news-card-image">
          {post.thumbnailImage ? (
            <img src={post.thumbnailImage} alt={post.title} className="news-thumb-img" />
          ) : (
            <div
              className="news-thumb-placeholder"
              style={{ background: `linear-gradient(135deg, ${color}18, ${color}30)` }}
            >
              <span className="news-thumb-cat" style={{ color }}>{post.category}</span>
            </div>
          )}
        </div>

        <div className="news-card-body">
          <div className="news-card-meta">
            <span
              className="news-category-badge"
              style={{ background: color + "20", color }}
            >
              {post.category}
            </span>
            <span className="news-date">{formatDate(publishDate)}</span>
          </div>
          <h3 className="news-card-title">{post.title}</h3>
          <p className="news-card-summary">{excerpt}</p>

          <div className="news-card-actions">
            <span className="btn-link" style={{ pointerEvents: "none" }}>Read more</span>
            {relatedCampId && (
              <span className="news-has-camp">Related camp</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

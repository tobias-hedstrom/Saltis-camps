import { useState } from "react";
import { NEWS_CATEGORIES } from "../data/initialData";
import { ThumbnailUpload, GalleryUpload } from "./ImageUpload";

const emptyPost = {
  title: "",
  category: "General News",
  publishDate: new Date().toISOString().slice(0, 10),
  excerpt: "",
  body: "",
  thumbnailImage: null,
  images: [],
  relatedCampId: null,
};

export default function AdminNewsForm({ post, camps, onSave, onCancel }) {
  const [form, setForm] = useState(
    post
      ? {
          ...post,
          publishDate: post.publishDate || post.date || emptyPost.publishDate,
          excerpt: post.excerpt || post.summary || "",
          relatedCampId: post.relatedCampId || post.linkedCampId || null,
          thumbnailImage: post.thumbnailImage || null,
          images: post.images || [],
        }
      : emptyPost
  );

  function handleText(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      id: post?.id ?? `news-${Date.now()}`,
    });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>x</button>
        <h2>{post ? "Edit News Post" : "Add News Post"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group span-2">
              <label>Title</label>
              <input
                name="title"
                className="form-control"
                value={form.title}
                onChange={handleText}
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                className="form-control"
                value={form.category}
                onChange={handleText}
              >
                {NEWS_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Publish Date</label>
              <input
                type="date"
                name="publishDate"
                className="form-control"
                value={form.publishDate}
                onChange={handleText}
                required
              />
            </div>

            <div className="form-group">
              <label>Related Camp (optional)</label>
              <select
                className="form-control"
                value={form.relatedCampId || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, relatedCampId: e.target.value || null }))
                }
              >
                <option value="">None</option>
                {(camps ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group span-2">
              <label>Excerpt (shown on news cards)</label>
              <textarea
                name="excerpt"
                className="form-control"
                rows={2}
                value={form.excerpt}
                onChange={handleText}
                required
              />
            </div>

            <div className="form-group span-2">
              <label>Full Body Text</label>
              <textarea
                name="body"
                className="form-control"
                rows={6}
                value={form.body}
                onChange={handleText}
              />
            </div>

            <div className="form-group span-2">
              <ThumbnailUpload
                value={form.thumbnailImage}
                onChange={(url) => setForm((f) => ({ ...f, thumbnailImage: url }))}
              />
            </div>

            <div className="form-group span-2">
              <label>Gallery Images</label>
              <GalleryUpload
                images={form.images}
                onChange={(imgs) => setForm((f) => ({ ...f, images: imgs }))}
              />
            </div>
          </div>

          <div className="form-row" style={{ marginTop: "1.5rem" }}>
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {post ? "Save Changes" : "Publish Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

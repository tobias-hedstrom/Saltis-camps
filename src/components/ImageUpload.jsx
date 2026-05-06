// PROTOTYPE ONLY: images are read via FileReader and stored as base64 data URLs in localStorage.
// In production, upload images to a storage service (S3, Cloudflare R2, etc.) and store the URL.
// Keep uploaded images small (<500 KB) to avoid filling localStorage quota.

import { useRef } from "react";

/** Single image upload — replaces an existing image or adds a new one. */
export function ThumbnailUpload({ value, onChange, label = "Thumbnail Image" }) {
  const inputRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="img-upload-single">
      <label className="form-label-sm">{label}</label>
      <div className="img-upload-area" onClick={() => inputRef.current?.click()}>
        {value ? (
          <div className="img-upload-preview-wrap">
            <img src={value} alt="Thumbnail" className="img-upload-preview-img" />
          </div>
        ) : (
          <span className="img-upload-placeholder">Click to upload image</span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleFile}
        />
      </div>
      {value && (
        <button
          type="button"
          className="btn-link btn-link-danger"
          style={{ marginTop: "0.35rem", fontSize: "0.8rem" }}
          onClick={() => onChange(null)}
        >
          Remove image
        </button>
      )}
      <p className="img-upload-note">Prototype: stored as base64 in localStorage. Use small images.</p>
    </div>
  );
}

/** Multi-image gallery upload — adds images with optional captions. */
export function GalleryUpload({ images = [], onChange }) {
  const inputRef = useRef(null);

  function handleFiles(e) {
    const files = Array.from(e.target.files);
    const ts = Date.now();
    const readers = files.map(
      (file, i) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) =>
            resolve({ id: `img-${ts}-${i}`, url: ev.target.result, caption: "" });
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((newImgs) => onChange([...images, ...newImgs]));
    e.target.value = "";
  }

  function updateCaption(id, caption) {
    onChange(images.map((img) => (img.id === id ? { ...img, caption } : img)));
  }

  function removeImage(id) {
    onChange(images.filter((img) => img.id !== id));
  }

  return (
    <div className="gallery-upload">
      <div className="gallery-upload-list">
        {images.map((img) => (
          <div key={img.id} className="gallery-upload-item">
            <div className="gallery-upload-thumb-wrap">
              <img src={img.url} alt="" className="gallery-upload-thumb-img" />
            </div>
            <div className="gallery-upload-meta">
              <input
                className="form-control"
                placeholder="Caption (optional)"
                value={img.caption}
                onChange={(e) => updateCaption(img.id, e.target.value)}
              />
              <button
                type="button"
                className="btn-link btn-link-danger"
                style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}
                onClick={() => removeImage(img.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn-secondary btn-sm"
        style={{ marginTop: images.length > 0 ? "0.75rem" : "0" }}
        onClick={() => inputRef.current?.click()}
      >
        + Add Images
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleFiles}
      />
      <p className="img-upload-note">Prototype: stored as base64 in localStorage. Use small images.</p>
    </div>
  );
}

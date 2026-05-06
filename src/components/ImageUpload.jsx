// Images are uploaded to Supabase Storage when configured (production).
// Without Supabase, falls back to base64 in localStorage (local dev only).

import { useRef, useState } from "react";
import { db } from "../lib/supabase";

async function uploadFile(file) {
  if (db) {
    return await db.uploadImage(file);
  }
  // Fallback: base64 for local dev without Supabase
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

/** Single image upload — thumbnail. */
export function ThumbnailUpload({ value, onChange, label = "Thumbnail Image" }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="img-upload-single">
      <label className="form-label-sm">{label}</label>
      <div className="img-upload-area" onClick={() => !uploading && inputRef.current?.click()}>
        {uploading ? (
          <span className="img-upload-placeholder">Uploading...</span>
        ) : value ? (
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
      {value && !uploading && (
        <button
          type="button"
          className="btn-link btn-link-danger"
          style={{ marginTop: "0.35rem", fontSize: "0.8rem" }}
          onClick={() => onChange(null)}
        >
          Remove image
        </button>
      )}
      {!db && (
        <p className="img-upload-note">Local mode: stored as base64. Configure Supabase for persistent uploads.</p>
      )}
    </div>
  );
}

/** Multi-image gallery upload. */
export function GalleryUpload({ images = [], onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    e.target.value = "";
    setUploading(true);
    try {
      const ts = Date.now();
      const uploaded = await Promise.all(
        files.map(async (file, i) => {
          const url = await uploadFile(file);
          return { id: `img-${ts}-${i}`, url, caption: "" };
        })
      );
      onChange([...images, ...uploaded]);
    } catch (err) {
      console.error("Gallery upload failed:", err);
      alert("One or more images failed to upload. Please try again.");
    } finally {
      setUploading(false);
    }
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
        onClick={() => !uploading && inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "+ Add Images"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: "none" }}
        onChange={handleFiles}
      />
    </div>
  );
}

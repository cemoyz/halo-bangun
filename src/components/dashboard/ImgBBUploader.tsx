"use client";

import React, { useState, useEffect, useRef } from 'react';
import { formatSafeImageUrl } from '@/lib/imgbb';

interface ImgBBUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  placeholder?: string;
}

export default function ImgBBUploader({
  value,
  onChange,
  label = "Upload Foto (ImgBB)",
  folder = "cms",
  placeholder = "https://i.ibb.co/..."
}: ImgBBUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string>(value || '');
  const [imgLoadError, setImgLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview whenever value prop changes
  useEffect(() => {
    setPreview(value || '');
    setImgLoadError(false);
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 32MB
    if (file.size > 32 * 1024 * 1024) {
      setError("Ukuran file maksimal 32MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success && data.url) {
        setPreview(data.url);
        onChange(data.url);
      } else {
        setError(data.error || "Gagal mengunggah foto.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
          {label}
        </label>
      )}

      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Preview Box */}
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '8px',
          border: '1px dashed #d1d5db',
          background: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative'
        }}>
          {preview && !imgLoadError ? (
            <img
              src={formatSafeImageUrl(preview)}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => {
                setImgLoadError(true);
              }}
            />
          ) : (
            <i className="ri-image-add-line" style={{ fontSize: '28px', color: '#9ca3af' }}></i>
          )}

          {uploading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '12px'
            }}>
              <i className="ri-loader-4-line ri-spin" style={{ fontSize: '20px' }}></i>
            </div>
          )}
        </div>

        {/* Input & Action buttons */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => {
                setPreview(e.target.value);
                onChange(e.target.value);
              }}
              placeholder={placeholder}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '13px',
                outline: 'none',
                background: '#fff'
              }}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: uploading ? '#9ca3af' : '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: uploading ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <i className={uploading ? "ri-loader-4-line ri-spin" : "ri-upload-cloud-line"}></i>
              {uploading ? "Uploading..." : "Pilih File"}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>
              Format didukung: JPG, PNG, WEBP, GIF (Otomatis hosting CDN ImgBB)
            </span>
            {preview && (
              <button
                type="button"
                onClick={() => {
                  setPreview('');
                  onChange('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '11px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Hapus Foto
              </button>
            )}
          </div>

          {error && (
            <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
              <i className="ri-error-warning-line"></i> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


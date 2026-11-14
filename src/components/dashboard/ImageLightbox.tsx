'use client';

import React, { useEffect } from 'react';
import { formatSafeImageUrl } from '@/lib/imgbb';

interface ImageLightboxProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images = [],
  initialIndex = 0,
  isOpen,
  onClose,
  title,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && images.length > 1) {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
      if (e.key === 'ArrowLeft' && images.length > 1) {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, onClose]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.92)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(6px)',
        padding: '16px',
      }}
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ffffff',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
          zIndex: 10,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700 }}>
            {title || 'Dokumentasi Lapangan'}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            Foto {currentIndex + 1} dari {images.length}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: '#ffffff',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            transition: 'background 0.2s',
          }}
          title="Tutup (Esc)"
        >
          <i className="ri-close-line" />
        </button>
      </div>

      {/* Main Image Container */}
      <div
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={formatSafeImageUrl(currentImage)}
          alt="Dokumentasi Progres Lapangan"
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
          }}
        />

        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
            }}
            style={{
              position: 'absolute',
              left: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#ffffff',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}
            title="Sebelumnya (Panah Kiri)"
          >
            <i className="ri-arrow-left-s-line" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((prev) => (prev + 1) % images.length);
            }}
            style={{
              position: 'absolute',
              right: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#ffffff',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}
            title="Berikutnya (Panah Kanan)"
          >
            <i className="ri-arrow-right-s-line" />
          </button>
        )}
      </div>

      {/* Thumbnails Footer */}
      {images.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            display: 'flex',
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '12px',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <img
              key={idx}
              src={formatSafeImageUrl(img)}
              alt="Thumbnail"
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: '48px',
                height: '48px',
                objectFit: 'cover',
                borderRadius: '6px',
                cursor: 'pointer',
                border: idx === currentIndex ? '2px solid #f97316' : '2px solid transparent',
                opacity: idx === currentIndex ? 1 : 0.6,
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

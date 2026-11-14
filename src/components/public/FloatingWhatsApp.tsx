'use client';

import React, { useState } from 'react';

export default function FloatingWhatsApp({ phoneNumber }: { phoneNumber?: string }) {
  const [hovered, setHovered] = useState(false);
  const cleanPhone = (phoneNumber || '082135450404').replace(/^0/, '62').replace(/[^0-9]/g, '');

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      {/* Tooltip on hover */}
      {hovered && (
        <div
          style={{
            background: '#0f172a',
            color: '#f8fafc',
            padding: '8px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            border: '1px solid rgba(255,255,255,0.1)',
            whiteSpace: 'nowrap',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          💬 Tanya & Konsultasi Gratis Proyek
        </div>
      )}

      <a
        href={`https://wa.me/${cleanPhone}?text=Halo%20Bangun,%20saya%20ingin%20konsultasi%20mengenai%20layanan%20arsitektur%20/%20konstruksi%20/%20renovasi.`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '30px',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.45)',
          textDecoration: 'none',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          position: 'relative',
        }}
        aria-label="Hubungi WhatsApp Halo Bangun"
      >
        <i className="ri-whatsapp-fill"></i>
        {/* Pulsing indicator */}
        <span
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            border: '2px solid #ffffff',
          }}
        />
      </a>
    </div>
  );
}


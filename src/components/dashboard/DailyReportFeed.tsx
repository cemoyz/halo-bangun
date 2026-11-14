'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/dashboard/ui';
import { formatSafeImageUrl } from '@/lib/imgbb';
import { ImageLightbox } from './ImageLightbox';

export interface DailyReportItemData {
  id: number;
  task_name: string;
  category?: string | null;
  status: string;
  volume?: string | null;
  notes?: string | null;
}

export interface DailyReportData {
  id: number;
  project_id: number;
  day_number?: number | null;
  date: string | Date;
  weather: string;
  weather_details?: string | null;
  worker_count: number;
  manpower_details?: Array<{ role: string; count: number; unit?: string }> | null;
  materials_details?: Array<{ name: string; volume: string; unit?: string }> | null;
  supervisor_name?: string | null;
  contractor_name?: string | null;
  notes: string;
  obstacles?: string | null;
  solutions?: string | null;
  photos: string[];
  status: string;
  createdAt: string | Date;
  author?: { id: number; name: string; role: string } | null;
  project?: { id: number; name: string; location: string } | null;
  items?: DailyReportItemData[];
}

interface DailyReportFeedProps {
  reports: DailyReportData[];
  canEdit?: boolean;
  onEdit?: (report: DailyReportData) => void;
  onDelete?: (reportId: number) => void;
  showProjectName?: boolean;
}

const formatDateID = (dateStr: string | Date) => {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
};

const getWeatherBadge = (weather: string) => {
  switch (weather) {
    case 'Cerah':
      return { label: '☀️ Cerah', variant: 'warning' as const };
    case 'Berawan':
      return { label: '⛅ Berawan', variant: 'neutral' as const };
    case 'Hujan Ringan':
      return { label: '🌦️ Hujan Ringan', variant: 'info' as const };
    case 'Hujan Lebat':
      return { label: '🌧️ Hujan Lebat', variant: 'primary' as const };
    default:
      return { label: weather, variant: 'neutral' as const };
  }
};

export const DailyReportFeed: React.FC<DailyReportFeedProps> = ({
  reports = [],
  canEdit = false,
  onEdit,
  onDelete,
  showProjectName = false,
}) => {
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxTitle, setLightboxTitle] = useState('');

  const openLightbox = (images: string[], index: number, title: string) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxTitle(title);
    setLightboxOpen(true);
  };

  if (!reports || reports.length === 0) {
    return (
      <Card>
        <CardContent style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--dash-text-muted)' }}>
          <i className="ri-calendar-event-line" style={{ fontSize: '40px', display: 'block', marginBottom: '10px', color: '#94a3b8' }} />
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dash-text-main)' }}>
            Belum Ada Laporan Pengawasan Harian
          </div>
          <p style={{ fontSize: '12.5px', maxWidth: '420px', margin: '6px auto 0' }}>
            Pengawas lapangan (PM) akan mengunggah laporan dan dokumentasi foto harian secara berkala selama masa pengerjaan konstruksi.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {reports.map((report) => {
          const weatherBadge = getWeatherBadge(report.weather);
          const reportTitle = `${formatDateID(report.date)}${report.project ? ` - ${report.project.name}` : ''}`;

          return (
            <Card key={report.id} style={{ borderLeft: '4px solid #f97316' }}>
              {/* Header */}
              <CardHeader style={{ padding: '16px 20px', background: 'var(--dash-card-bg)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {report.day_number && (
                      <span
                        style={{
                          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          letterSpacing: '0.4px',
                          boxShadow: '0 2px 4px rgba(249, 115, 22, 0.25)',
                        }}
                      >
                        HARI KE-{report.day_number}
                      </span>
                    )}
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--dash-text-main)' }}>
                      {formatDateID(report.date)}
                    </span>
                    <Badge variant={weatherBadge.variant}>
                      {weatherBadge.label}
                      {report.weather_details ? ` (${report.weather_details})` : ''}
                    </Badge>
                    <Badge variant="info">
                      <i className="ri-team-line" style={{ marginRight: '4px' }} />
                      {report.worker_count} Pekerja Hadir
                    </Badge>
                    {report.status === 'DRAFT' && (
                      <Badge variant="neutral">Draf Internal</Badge>
                    )}
                  </div>
                  {showProjectName && report.project && (
                    <div style={{ fontSize: '12px', color: '#f97316', fontWeight: 600 }}>
                      <i className="ri-building-line" style={{ marginRight: '4px' }} />
                      {report.project.name}
                    </div>
                  )}
                  {report.author && (
                    <div style={{ fontSize: '11.5px', color: 'var(--dash-text-muted)' }}>
                      Diverifikasi oleh: <strong>{report.author.name}</strong> ({report.author.role === 'PM' ? 'Senior PM / Pengawas' : report.author.role})
                    </div>
                  )}
                </div>

                {/* Edit / Delete actions for PM & Owner */}
                {canEdit && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {onEdit && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onEdit(report)}
                        icon="ri-edit-line"
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Hapus laporan harian tanggal ${formatDateID(report.date)}?`)) {
                            onDelete(report.id);
                          }
                        }}
                        icon="ri-delete-bin-line"
                        style={{ color: '#ef4444' }}
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                )}
              </CardHeader>

              <CardContent style={{ padding: '20px' }}>
                {/* Ringkasan Pekerjaan Utama */}
                <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--dash-text-main)', marginBottom: '16px' }}>
                  {report.notes}
                </div>

                {/* Grid Foto Dokumentasi (Maksimal 3 Foto) with Lightbox */}
                {report.photos && report.photos.length > 0 && (
                  <div style={{ marginBottom: '18px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dash-text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="ri-image-2-line" style={{ color: '#f97316' }} />
                      <span>Dokumentasi Lapangan ({report.photos.length} Foto) • Klik untuk memperbesar</span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${Math.min(report.photos.length, 3)}, 1fr)`,
                        gap: '12px',
                      }}
                    >
                      {report.photos.slice(0, 3).map((photoUrl, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => openLightbox(report.photos, pIdx, reportTitle)}
                          style={{
                            aspectRatio: '16/10',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: 'pointer',
                            border: '1px solid var(--dash-border)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          }}
                          className="daily-photo-thumb"
                        >
                          <img
                            src={formatSafeImageUrl(photoUrl)}
                            alt={`Dokumentasi Lapangan ${pIdx + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.25s ease',
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0,0,0,0.25)',
                              opacity: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontSize: '22px',
                              transition: 'opacity 0.2s ease',
                            }}
                            className="photo-overlay"
                          >
                            <i className="ri-zoom-in-line" />
                          </div>
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '6px',
                              left: '6px',
                              background: 'rgba(0,0,0,0.65)',
                              color: '#ffffff',
                              fontSize: '10px',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            Foto #{pIdx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tabel Item Pekerjaan Hari Ini */}
                {report.items && report.items.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dash-text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="ri-checkbox-circle-line" style={{ color: '#10b981' }} />
                      <span>A. Rincian Fisik Pengerjaan Hari Ini</span>
                    </div>

                    <div style={{ overflowX: 'auto', border: '1px solid var(--dash-border)', borderRadius: '8px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: 'var(--dash-muted-bg)', borderBottom: '1px solid var(--dash-border)' }}>
                            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Item Pekerjaan</th>
                            <th style={{ padding: '8px 12px', fontWeight: 700, width: '110px' }}>Kategori</th>
                            <th style={{ padding: '8px 12px', fontWeight: 700, width: '120px' }}>Status</th>
                            <th style={{ padding: '8px 12px', fontWeight: 700, width: '130px' }}>Volume/Capaian</th>
                            <th style={{ padding: '8px 12px', fontWeight: 700 }}>Catatan Teknis</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.items.map((item, iIdx) => (
                            <tr
                              key={item.id || iIdx}
                              style={{
                                borderBottom: '1px solid var(--dash-border)',
                                background: iIdx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)',
                              }}
                            >
                              <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                                {item.task_name}
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <Badge variant="outline" style={{ fontSize: '10px' }}>
                                  {item.category || 'Konstruksi'}
                                </Badge>
                              </td>
                              <td style={{ padding: '8px 12px' }}>
                                <Badge
                                  variant={
                                    item.status === 'COMPLETED'
                                      ? 'success'
                                      : item.status === 'ON_HOLD'
                                      ? 'danger'
                                      : 'warning'
                                  }
                                  style={{ fontSize: '10.5px' }}
                                >
                                  {item.status === 'COMPLETED'
                                    ? '✓ Selesai'
                                    : item.status === 'ON_HOLD'
                                    ? 'Tertunda'
                                    : 'Sedang Berjalan'}
                                </Badge>
                              </td>
                              <td style={{ padding: '8px 12px', color: 'var(--dash-text-muted)' }}>
                                {item.volume || '-'}
                              </td>
                              <td style={{ padding: '8px 12px', color: 'var(--dash-text-muted)' }}>
                                {item.notes || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Section B: Bahan & Material */}
                {Array.isArray(report.materials_details) && report.materials_details.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dash-text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="ri-archive-line" style={{ color: '#f59e0b' }} />
                      <span>B. Bahan & Material Konstruksi Digunakan / Diterima ({report.materials_details.length} Jenis)</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {report.materials_details.map((mat: any, mIdx: number) => (
                        <div
                          key={mIdx}
                          style={{
                            background: 'var(--dash-muted-bg)',
                            border: '1px solid var(--dash-border)',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '11.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <i className="ri-inbox-archive-line" style={{ color: '#f97316' }} />
                          <span style={{ fontWeight: 600, color: 'var(--dash-text-main)' }}>{mat.name}</span>
                          <span style={{ color: '#0ea5e9', fontWeight: 800 }}>: {mat.volume} {mat.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section C: Tenaga Kerja Lapangan */}
                {Array.isArray(report.manpower_details) && report.manpower_details.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dash-text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="ri-user-settings-line" style={{ color: '#0ea5e9' }} />
                      <span>C. Rincian Tenaga Kerja Lapangan (Total: {report.worker_count} OH)</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {report.manpower_details.map((mp: any, mpIdx: number) => (
                        <div
                          key={mpIdx}
                          style={{
                            background: 'rgba(14, 165, 233, 0.08)',
                            border: '1px solid rgba(14, 165, 233, 0.25)',
                            borderRadius: '6px',
                            padding: '5px 12px',
                            fontSize: '11.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: 'var(--dash-text-main)',
                          }}
                        >
                          <i className="ri-user-3-line" style={{ color: '#0ea5e9' }} />
                          <span>{mp.role}: <strong>{mp.count} {mp.unit || 'OH'}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Kendala & Solusi Lapangan */}
                {(report.obstacles || report.solutions) && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginTop: '12px' }}>
                    {report.obstacles && (
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.06)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="ri-alert-line" />
                          <span>Kendala Lapangan:</span>
                        </div>
                        <div style={{ color: 'var(--dash-text-main)' }}>{report.obstacles}</div>
                      </div>
                    )}

                    {report.solutions && (
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(16, 185, 129, 0.06)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="ri-shield-check-line" />
                          <span>Solusi / Tindakan Mitigasi:</span>
                        </div>
                        <div style={{ color: 'var(--dash-text-main)' }}>{report.solutions}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Section E: Pengesahan & Tanda Tangan Lapangan */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '12px',
                    marginTop: '18px',
                    paddingTop: '16px',
                    borderTop: '1px dashed var(--dash-border)',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'var(--dash-muted-bg)',
                      border: '1px solid var(--dash-border)',
                      fontSize: '11.5px',
                    }}
                  >
                    <div style={{ color: 'var(--dash-text-muted)', fontWeight: 600 }}>Diperiksa Oleh (Supervisi / Pengawas):</div>
                    <div style={{ fontWeight: 800, color: 'var(--dash-text-main)', marginTop: '4px', fontSize: '13px' }}>
                      {report.supervisor_name || 'Arizal (PT. Sinergitama Konstruksi Indonesia)'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="ri-checkbox-circle-fill" /> Diverifikasi & Disetujui Pengawas
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'var(--dash-muted-bg)',
                      border: '1px solid var(--dash-border)',
                      fontSize: '11.5px',
                    }}
                  >
                    <div style={{ color: 'var(--dash-text-muted)', fontWeight: 600 }}>Diajukan Oleh (Kontraktor Pelaksana):</div>
                    <div style={{ fontWeight: 800, color: 'var(--dash-text-main)', marginTop: '4px', fontSize: '13px' }}>
                      {report.contractor_name || 'PT. Aulia Indoland Grup'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#f97316', fontWeight: 700, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <i className="ri-file-check-line" /> Disubmit Pelaksana Proyek
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <ImageLightbox
        isOpen={lightboxOpen}
        images={lightboxImages}
        initialIndex={lightboxIndex}
        title={lightboxTitle}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};

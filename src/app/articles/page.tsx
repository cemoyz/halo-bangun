import React from 'react';
import Link from 'next/link';
import HeaderOne from '@/sections/Common/Header/HeaderOne';
import BreadcumbTwo from '@/sections/Blog/BreadcumbTwo';
import FooterTwo from '@/sections/Common/Footer/FooterTwo';
import Scroll from '@/sections/Common/Scroll';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';
import prisma from '@/lib/prisma';
import { formatSafeImageUrl } from '@/lib/imgbb';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Artikel & Edukasi Konstruksi - Halo Bangun',
  description: 'Wawasan, tips material bangunan, manajemen Kurva S, dan panduan perizinan PBG di wilayah Yogyakarta, Jawa Tengah, dan Jawa Barat.',
};

// Fallback articles if DB has fewer items
const fallbackArticles = [
  {
    id: 101,
    title: 'Tips Menghemat Biaya Bangun Rumah Tanpa Mengorbankan Kualitas Struktur',
    slug: 'tips-hemat-biaya-bangun-rumah-berkualitas',
    excerpt: 'Strategi cerdas mengelola RAB, memilih material alternatif berstandar SNI, dan pentingnya perencanaan DED sebelum pembangunan fisik.',
    content: 'Membangun rumah impian tidak selalu harus menguras seluruh tabungan jika Anda memahami pos-pos krusial dalam anggaran RAB...',
    cover_image: '/main-assets/img/blog/blog_1_1.png',
    category: 'Manajemen Biaya',
    published_at: new Date('2026-02-15'),
    author: { name: 'Ir. Arga Pramudya, S.T.' },
    views: 420,
  },
  {
    id: 102,
    title: '5 Kesalahan Fatal Saat Renovasi Rumah yang Kerap Membengkakkan Biaya',
    slug: '5-kesalahan-fatal-saat-renovasi-rumah',
    excerpt: 'Hindari pembongkaran berulang, perubahan desain di tengah jalan, dan pemilihan tukang harian tanpa pengawas bersertifikat.',
    content: 'Renovasi seringkali dianggap lebih murah dibanding membangun dari nol, namun tanpa perencanaan struktur yang matang, biayanya bisa membengkak...',
    cover_image: '/main-assets/img/blog/blog_1_2.png',
    category: 'Renovasi & Perawatan',
    published_at: new Date('2026-02-10'),
    author: { name: 'Dimas Pratama, S.T.' },
    views: 315,
  },
  {
    id: 103,
    title: 'Pondasi Cakar Ayam vs Batu Kali: Mana yang Paling Tepat untuk Tanah Anda?',
    slug: 'perbandingan-pondasi-cakar-ayam-vs-batu-kali',
    excerpt: 'Membedah daya dukung tanah di kawasan Yogyakarta dan Jawa Tengah, serta rekomendasi pondasi rumah 1 lantai vs 2 lantai tahan gempa.',
    content: 'Kekuatan sebuah bangunan sangat bertumpu pada pondasinya. Kenali karakteristik tanah padas, lempung, dan pasir...',
    cover_image: '/main-assets/img/blog/blog_1_3.png',
    category: 'Struktur & Pondasi',
    published_at: new Date('2026-01-28'),
    author: { name: 'Tim Engineering Halo Bangun' },
    views: 580,
  },
];

export default async function ArticlesPage() {
  let dbArticles: any[] = [];
  try {
    dbArticles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { author: true },
      orderBy: { published_at: 'desc' },
    });
  } catch (e) {
    console.error('Error fetching articles:', e);
  }

  // Combine DB articles with fallbacks if needed to ensure full 6-grid layout
  const combinedArticles = [...dbArticles];
  for (const fb of fallbackArticles) {
    if (!combinedArticles.some((a) => a.slug === fb.slug) && combinedArticles.length < 6) {
      combinedArticles.push(fb);
    }
  }

  return (
    <>
      <HeaderOne />
      <BreadcumbTwo title="Artikel & Wawasan Konstruksi" pageName="ARTIKEL" />

      <section className="blog-area space-top space-extra-bottom">
        <div className="container">
          <div className="title-area text-center mb-50">
            <span className="sub-title">
              <img src="/main-assets/img/icon/section-subtitle-icon.svg" alt="img" />
              Pusat Edukasi & Berita
            </span>
            <h2 className="sec-title">Panduan & Wawasan Konstruksi Terpercaya</h2>
            <p className="sec-text" style={{ maxWidth: '680px', margin: '0 auto' }}>
              Pelajari standar material SNI, tips mengendalikan anggaran RAB, pemahaman grafik Kurva S, serta regulasi perizinan PBG bersama para pakar Halo Bangun.
            </p>
          </div>

          <div className="row gy-40 justify-content-center">
            {combinedArticles.map((art, idx) => {
              const pubDate = new Date(art.published_at || art.createdAt || Date.now());
              const day = pubDate.getDate().toString().padStart(2, '0');
              const month = pubDate.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
              const year = pubDate.getFullYear();

              return (
                <div className="col-md-6 col-lg-4" key={art.id || idx}>
                  <div className="blog-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div className="blog-img" style={{ height: '220px', overflow: 'hidden' }}>
                      <img
                        src={formatSafeImageUrl(art.cover_image || `/main-assets/img/blog/blog_1_${(idx % 3) + 1}.png`)}
                        alt={art.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div className="blog-date">
                        <Link href={`/articles/${art.slug}`}>
                          <span>{day}</span>{month}
                        </Link>
                        <div className="year">{year}</div>
                      </div>
                    </div>
                    <div className="blog-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div className="blog-meta">
                          <Link href={`/articles/${art.slug}`}>
                            <i className="ri-user-line me-1"></i>Oleh {art.author?.name || 'Halo Bangun'}
                          </Link>
                          <Link href={`/articles/${art.slug}`}>
                            <i className="ri-price-tag-3-line me-1"></i>{art.category || 'Konstruksi'}
                          </Link>
                        </div>
                        <h3 className="blog-title" style={{ fontSize: '18px', lineHeight: '1.4', marginBottom: '12px' }}>
                          <Link href={`/articles/${art.slug}`}>{art.title}</Link>
                        </h3>
                        <p className="blog-text" style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#64748b', marginBottom: '16px' }}>
                          {art.excerpt || (art.content ? art.content.substring(0, 110) + '...' : 'Pelajari panduan praktis pembangunan dan renovasi bersama Halo Bangun.')}
                        </p>
                      </div>
                      <Link href={`/articles/${art.slug}`} className="btn">
                        BACA SELENGKAPNYA <i className="ri-arrow-right-up-line"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-60">
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '36px 24px', maxWidth: '800px', margin: '0 auto' }}>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Butuh Konsultasi Langsung Mengenai Proyek Anda?
              </h4>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: 1.6 }}>
                Diskusikan rencana pembangunan, perhitungan estimasi anggaran RAB awal, dan jadwal survey lokasi gratis dengan tim arsitek dan pengawas Halo Bangun.
              </p>
              <Link href="https://wa.me/6282135450404" target="_blank" className="btn style3">
                KONSULTASI GRATIS VIA WHATSAPP <i className="ri-whatsapp-line ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FooterTwo />
      <Scroll />
      <FloatingWhatsApp />
    </>
  );
}

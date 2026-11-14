import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import HeaderOne from '@/sections/Common/Header/HeaderOne';
import BreadcumbThree from '@/sections/BlogDetails/BreadcumbThree';
import FooterTwo from '@/sections/Common/Footer/FooterTwo';
import Scroll from '@/sections/Common/Scroll';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';
import prisma from '@/lib/prisma';
import { formatSafeImageUrl } from '@/lib/imgbb';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) return { title: 'Artikel Tidak Ditemukan - Halo Bangun' };

  return {
    title: `${article.title} - Halo Bangun`,
    description: article.excerpt || article.title,
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { author: true },
  });

  if (!article) notFound();

  // Increment views
  try {
    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });
  } catch (err) {}

  // Fetch recent articles for sidebar
  const recentArticles = await prisma.article.findMany({
    where: {
      id: { not: article.id },
      status: 'PUBLISHED',
    },
    take: 4,
    orderBy: { published_at: 'desc' },
  });

  const pubDate = new Date(article.published_at || article.createdAt || Date.now());
  const day = pubDate.getDate().toString().padStart(2, '0');
  const month = pubDate.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();
  const year = pubDate.getFullYear();

  return (
    <>
      <HeaderOne />
      <BreadcumbThree title={article.title} />

      <section className="blog-area space-top space-extra-bottom">
        <div className="container">
          <div className="row gx-60">
            {/* Main Article Body */}
            <div className="col-xxl-8 col-lg-7">
              <div className="blog-single">
                <div className="blog-img" style={{ maxHeight: '450px', overflow: 'hidden', borderRadius: '12px' }}>
                  <img
                    src={formatSafeImageUrl(article.cover_image || '/main-assets/img/blog/blog_details1_1.png')}
                    alt={article.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div className="blog-date">
                    <Link href="/articles">
                      <span>{day}</span>{month}
                    </Link>
                    <div className="year">{year}</div>
                  </div>
                </div>

                <div className="blog-content mt-30">
                  <div className="blog-meta">
                    <Link href="/articles">
                      <i className="ri-user-line me-1"></i>Oleh {article.author?.name || 'Halo Bangun Engineering'}
                    </Link>
                    <Link href="/articles">
                      <i className="ri-eye-line me-1"></i>{(article.views || 0) + 1} Kali Dibaca
                    </Link>
                    <Link href="/articles">
                      <i className="ri-price-tag-3-line me-1"></i>{article.category || 'Konstruksi & Desain'}
                    </Link>
                  </div>

                  <h2 className="blog-title" style={{ fontSize: '28px', lineHeight: '1.3', marginTop: '16px', marginBottom: '24px' }}>
                    {article.title}
                  </h2>

                  {article.excerpt && (
                    <div
                      style={{
                        padding: '16px 20px',
                        background: '#f8fafc',
                        borderLeft: '4px solid #f97316',
                        borderRadius: '0 8px 8px 0',
                        fontSize: '15px',
                        fontStyle: 'italic',
                        color: '#475569',
                        marginBottom: '28px',
                        lineHeight: 1.6,
                      }}
                    >
                      {article.excerpt}
                    </div>
                  )}

                  <div className="article-body-content" style={{ fontSize: '16px', lineHeight: '1.8', color: '#334155' }}>
                    {article.content.split('\n\n').map((paragraph, pIdx) => {
                      if (!paragraph.trim()) return null;

                      if (paragraph.startsWith('### ') || paragraph.startsWith('## ')) {
                        const headingText = paragraph.replace(/^#+\s*/, '');
                        return (
                          <h3 key={pIdx} className="blog-inner-title" style={{ fontSize: '22px', fontWeight: 800, marginTop: '36px', marginBottom: '16px', color: '#0f172a' }}>
                            {headingText}
                          </h3>
                        );
                      }

                      if (paragraph.startsWith('> ')) {
                        const quoteText = paragraph.replace(/^>\s*/, '');
                        return (
                          <blockquote key={pIdx}>
                            <p>“{quoteText}”</p>
                            <cite>Halo Bangun Insight</cite>
                            <span className="desig">Standar Mutu & Integritas</span>
                          </blockquote>
                        );
                      }

                      return (
                        <p key={pIdx} className="mb-20" style={{ whiteSpace: 'pre-line' }}>
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>

                  {/* Share Article Section */}
                  <div
                    className="share-links clearfix mt-40 pt-30"
                    style={{ borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Bagikan Artikel:</span>
                      <div className="social-links" style={{ display: 'flex', gap: '8px' }}>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#22c55e', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                        >
                          <i className="ri-whatsapp-fill"></i>
                        </a>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#1877f2', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                        >
                          <i className="ri-facebook-fill"></i>
                        </a>
                        <a
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0a66c2', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                        >
                          <i className="ri-linkedin-fill"></i>
                        </a>
                      </div>
                    </div>

                    <Link href="/articles" className="btn style2" style={{ padding: '8px 20px', fontSize: '13px' }}>
                      <i className="ri-arrow-left-line me-1"></i> Semua Artikel
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-xxl-4 col-lg-5 mt-50 mt-lg-0">
              <aside className="sidebar-area">
                {/* Author Widget */}
                <div className="widget widget_author text-center" style={{ background: '#f8fafc', padding: '30px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                  <div style={{ width: '90px', height: '90px', margin: '0 auto 16px auto', borderRadius: '50%', overflow: 'hidden', border: '3px solid #f97316' }}>
                    <img src="/main-assets/img/team/team-1-1.png" alt="Author" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    {article.author?.name || 'Tim Halo Bangun'}
                  </h4>
                  <span style={{ fontSize: '12px', color: '#f97316', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {article.author?.role === 'OWNER' ? 'Direktur Utama' : article.author?.role === 'PM' ? 'Project Manager' : 'Konsultan Konstruksi'}
                  </span>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '14px 0 18px 0', lineHeight: 1.6 }}>
                    Berkomitmen membagikan edukasi seputar rancang bangun, manajemen proyek, dan standar mutu bangunan di Indonesia.
                  </p>
                  <Link href="https://wa.me/6282135450404" target="_blank" className="btn style3" style={{ width: '100%', padding: '10px 16px', fontSize: '13px' }}>
                    Tanya Penulis via WA <i className="ri-chat-1-line ms-1"></i>
                  </Link>
                </div>

                {/* Consultation Card Widget */}
                <div
                  className="widget widget_banner"
                  style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    color: '#fff',
                    padding: '30px 24px',
                    borderRadius: '16px',
                    marginBottom: '30px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ fontSize: '32px', color: '#f97316', marginBottom: '12px' }}>
                    <i className="ri-building-2-line"></i>
                  </div>
                  <h4 style={{ color: '#fff', fontSize: '20px', fontWeight: 800, marginBottom: '10px' }}>
                    Rencanakan Proyek Anda Bersama Kami
                  </h4>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '20px' }}>
                    Dapatkan estimasi RAB transparan, survey gratis di wilayah Yogyakarta & sekitarnya, serta garansi resmi.
                  </p>
                  <Link href="https://wa.me/6282135450404" target="_blank" className="btn style3" style={{ width: '100%', textAlign: 'center' }}>
                    KONSULTASI GRATIS <i className="ri-whatsapp-line ms-1"></i>
                  </Link>
                </div>

                {/* Recent Posts Widget */}
                {recentArticles.length > 0 && (
                  <div className="widget widget_recent_entries" style={{ background: '#f8fafc', padding: '30px 24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <h4 className="widget_title" style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', color: '#0f172a' }}>
                      Artikel Terkait Lainnya
                    </h4>
                    <div className="recent-post-wrap">
                      {recentArticles.map((ra) => (
                        <div key={ra.id} className="recent-post" style={{ display: 'flex', gap: '14px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                          <div className="media-img" style={{ width: '75px', height: '65px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                            <Link href={`/articles/${ra.slug}`}>
                              <img
                                src={formatSafeImageUrl(ra.cover_image || '/main-assets/img/blog/recent-post1.png')}
                                alt={ra.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </Link>
                          </div>
                          <div className="media-body">
                            <h5 className="post-title" style={{ fontSize: '13.5px', lineHeight: '1.4', fontWeight: 700, margin: '0 0 6px 0' }}>
                              <Link href={`/articles/${ra.slug}`} style={{ color: '#0f172a', textDecoration: 'none' }}>
                                {ra.title}
                              </Link>
                            </h5>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              <i className="ri-calendar-line me-1"></i>
                              {new Date(ra.published_at || ra.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
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

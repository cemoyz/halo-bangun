"use client";

import Link from "next/link";
import { DEFAULT_LANDING_DATA } from "@/lib/landingContent";

const FooterTwo = ({ data = undefined }) => {
    const footerData = data || DEFAULT_LANDING_DATA.footer;
    const waLink = footerData.whatsapp || `https://wa.me/62${(footerData.phone || '082135450404').replace(/^0/, '').replace(/[^0-9]/g, '')}`;
    const socials = footerData.socials || DEFAULT_LANDING_DATA.footer.socials;

    return (
        <div>
            <footer
                className="footer-wrapper footer-layout1 background-image"
                style={{ backgroundImage: "url('/main-assets/img/bg/footer-bg1-1.png')" }}
            >
                <div className="container">
                    <div className="footer-top-1">
                        <div className="footer-logo">
                            <Link href="/">
                                <img src="/main-assets/img/logo-white.svg" alt={footerData.companyName || "Halo Bangun"} />
                            </Link>
                        </div>
                        <div className="subscribe-box">
                            <p className="subscribe-box_text">
                                Dapatkan info edukasi konstruksi, tren arsitektur & promo pembangunan terbaru.
                            </p>
                            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                                <input
                                    className="form-control"
                                    type="email"
                                    placeholder="Masukkan email Anda..."
                                    required
                                />
                                <button type="submit" className="btn style2">
                                    LANGGANAN<i className="ri-arrow-right-up-line"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="widget-area">
                        <div className="row justify-content-between">
                            <div className="col-md-6 col-xl-3">
                                <div className="widget widget-about footer-widget">
                                    <h3 className="widget_title">{footerData.companyName || "Halo Bangun"}</h3>
                                    <p className="about-text">
                                        {footerData.tagline || "Perusahaan jasa konstruksi, arsitektur, dan renovasi terpercaya dengan standar mutu SNI, garansi tertulis, serta monitoring proyek berbasis Kurva S dan live CCTV."}
                                    </p>
                                    <h5 className="about-subtitle">JAM OPERASIONAL</h5>
                                    <p className="about-text">
                                        <span className="text-theme">{footerData.operationalHours || "Senin – Sabtu: 08:00 – 21:00 WIB"}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="col-md-6 col-xl-auto">
                                <div className="widget widget_nav_menu footer-widget">
                                    <h3 className="widget_title">Tautan Cepat</h3>
                                    <div className="menu-all-pages-container grid-style">
                                        <ul className="menu">
                                            <li>
                                                <Link href="/">Beranda</Link>
                                            </li>
                                            <li>
                                                <Link href="/about">Tentang Kami</Link>
                                            </li>
                                            <li>
                                                <Link href="/portfolio">Portofolio</Link>
                                            </li>
                                            <li>
                                                <Link href="/articles">Artikel Konstruksi</Link>
                                            </li>
                                            <li>
                                                <Link href="/login" style={{ color: '#f97316', fontWeight: 700 }}>Portal Klien</Link>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 col-xl-auto">
                                <div className="widget footer-widget widget-contact">
                                    <h3 className="widget_title">Kantor D.I. Yogyakarta</h3>
                                    <p className="contact-text">
                                        {footerData.addressYogyakarta || "Jl. Palagan Tentara Pelajar Km. 9, Sleman, D.I. Yogyakarta"}
                                    </p>
                                    <h3 className="widget_title" style={{ marginTop: '16px' }}>Kantor Jawa Barat</h3>
                                    <p className="footer-text">
                                        {footerData.addressJawaBarat || "Jl. Raya Pajajaran No. 88, Bogor, Jawa Barat"}
                                    </p>
                                    {footerData.email && (
                                        <p className="footer-text" style={{ marginTop: '8px' }}>
                                            <i className="ri-mail-line me-1"></i> {footerData.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6 col-xl-auto">
                                <div className="widget footer-widget">
                                    <h3 className="widget_title">Kontak WhatsApp</h3>
                                    <p className="footer-text">
                                        <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ color: '#22c55e', fontWeight: 700 }}>
                                            <i className="ri-whatsapp-line me-1"></i>{footerData.phone || "0821-3545-0404"}
                                        </a>
                                    </p>
                                    <h3 className="widget_title mt-3">Portal Klien</h3>
                                    <p className="footer-text">
                                        <Link href="/login" style={{ color: '#f97316' }}>
                                            Masuk ke Ruang Klien ↗
                                        </Link>
                                    </p>
                                    <h3 className="widget_title mt-3">Media Sosial</h3>
                                    <div className="social-btn style2">
                                        {socials.instagram && (
                                            <a href={socials.instagram} target="_blank" rel="noopener noreferrer">
                                                <i className="ri-instagram-line"></i>
                                            </a>
                                        )}
                                        {socials.facebook && (
                                            <a href={socials.facebook} target="_blank" rel="noopener noreferrer">
                                                <i className="ri-facebook-fill"></i>
                                            </a>
                                        )}
                                        {socials.youtube && (
                                            <a href={socials.youtube} target="_blank" rel="noopener noreferrer">
                                                <i className="ri-youtube-fill"></i>
                                            </a>
                                        )}
                                        {socials.linkedin && (
                                            <a href={socials.linkedin} target="_blank" rel="noopener noreferrer">
                                                <i className="ri-linkedin-fill"></i>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="copyright-wrap">
                        <div className="row gy-3 justify-content-md-between justify-content-center">
                            <div className="col-auto align-self-center">
                                <p className="copyright-text text-center">
                                    {footerData.copyright || "© 2026 Halo Bangun. Seluruh Hak Cipta Dilindungi."}
                                </p>
                            </div>
                            <div className="col-auto">
                                <div className="footer-links">
                                    <Link href="/about">Tentang Kami</Link>
                                    <Link href="/service">Layanan</Link>
                                    <Link href="/contact">Kontak</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default FooterTwo;

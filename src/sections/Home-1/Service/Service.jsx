"use client";

import Link from "next/link";
import { DEFAULT_LANDING_DATA } from "@/lib/landingContent";

const Service = ({ data }) => {
    const servicesData = data || DEFAULT_LANDING_DATA.services;
    const items = Array.isArray(servicesData.items) && servicesData.items.length > 0
        ? servicesData.items
        : DEFAULT_LANDING_DATA.services.items;

    return (
        <div className="service-area-1 space-top overflow-hidden" style={{ backgroundImage: "url('/main-assets/img/bg/service-bg1-1.png')" }} id="service-sec">
            <div className="container">
                <div className="row gy-30 gx-30">
                    <div className="col-xl-4 col-md-6">
                        <div className="title-area mb-0 text-left content-text-extra-style">
                            <span className="sub-title">
                                <img src="/main-assets/img/icon/section-subtitle-icon.svg" alt="img" /> {servicesData.badge || 'Layanan Unggulan'}
                            </span>
                            <h2 className="sec-title">{servicesData.title || 'Solusi Konstruksi Terpadu Satu Pintu'}</h2>
                            <p>{servicesData.subtitle || 'Dari konsepsi desain arsitektur 3D, pengurusan izin PBG, hingga pelaksanaan fisik bergaransi tertulis.'}</p>
                        </div>
                    </div>

                    {items.map((svc, idx) => {
                        const num = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
                        const isExternal = svc.link && svc.link.startsWith('http');
                        const defaultIcons = [
                            '/main-assets/img/icon/service-icon1-1.png',
                            '/main-assets/img/icon/service-icon1-2.png',
                            '/main-assets/img/icon/service-icon1-3.png',
                            '/main-assets/img/icon/service-icon1-4.png',
                            '/main-assets/img/icon/service-icon1-5.png',
                        ];
                        const iconSrc = defaultIcons[idx % defaultIcons.length];

                        return (
                            <div className="col-xl-4 col-md-6" key={svc.id || idx}>
                                <div className="service-card">
                                    <div className="service-card-shadow-text">
                                        LAYANAN - {num}
                                    </div>
                                    <div className="service-card_content">
                                        <div className="service-card_icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {svc.image ? (
                                                <img
                                                    src={svc.image}
                                                    alt={svc.title}
                                                    style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                                                />
                                            ) : svc.icon && svc.icon.startsWith('ri-') ? (
                                                <i className={svc.icon} style={{ fontSize: '36px', color: '#f97316' }}></i>
                                            ) : (
                                                <img src={iconSrc} alt={svc.title} />
                                            )}
                                        </div>
                                        <h4 className="service-card_title">
                                            <Link href={svc.link || '/service'}>{svc.title}</Link>
                                        </h4>
                                        <p className="service-card_text">{svc.description}</p>
                                        <div className="btn-wrap">
                                            <div className="icon-btn"><i className="ri-arrow-right-up-line"></i></div>
                                            {isExternal ? (
                                                <a href={svc.link} target="_blank" rel="noopener noreferrer" className="btn">
                                                    Konsultasi <i className="ri-whatsapp-line"></i>
                                                </a>
                                            ) : (
                                                <Link href={svc.link || '/service'} className="btn">
                                                    Lihat Detail <i className="ri-arrow-right-up-line"></i>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Service;

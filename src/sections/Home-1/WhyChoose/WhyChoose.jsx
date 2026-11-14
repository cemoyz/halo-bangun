"use client";

/* eslint-disable react/no-unescaped-entities */
import { DEFAULT_LANDING_DATA } from "@/lib/landingContent";

const WhyChoose = ({ data }) => {
    const wcuData = data || DEFAULT_LANDING_DATA.whyChoose;
    const items = Array.isArray(wcuData.items) && wcuData.items.length > 0
        ? wcuData.items
        : DEFAULT_LANDING_DATA.whyChoose.items;

    // Split items into left and right columns
    const half = Math.ceil(items.length / 2);
    const leftItems = items.slice(0, half);
    const rightItems = items.slice(half);

    const defaultIcons = [
        '/main-assets/img/icon/why-icon1-1.svg',
        '/main-assets/img/icon/why-icon1-2.svg',
        '/main-assets/img/icon/why-icon1-3.svg',
        '/main-assets/img/icon/why-icon1-4.svg',
        '/main-assets/img/icon/why-icon1-5.svg',
        '/main-assets/img/icon/why-icon1-6.svg',
    ];

    return (
        <div className="space-top text-center overflow-hidden shape-mockup-wrap">
            <div className="section-animation-shape1-1 shape-mockup animation-infinite background-image" data-bottom="0" style={{ backgroundImage: "url('/main-assets/img/shape/global-line-shape2.png')", bottom: '0px' }}>
            </div>
            <div className="container">
                <div className="title-area text-center">
                    <div className="shadow-title">Keunggulan</div>
                    <span className="sub-title"><img src="/main-assets/img/icon/section-subtitle-icon.svg" alt="img" /> {wcuData.badge || 'Kenapa Memilih Kami?'}</span>
                    <h2 className="sec-title">{wcuData.title || 'Standar Mutu Konstruksi & Transparansi Nyata'}</h2>
                    {wcuData.subtitle && <p style={{ maxWidth: '640px', margin: '8px auto 0 auto', color: '#64748b' }}>{wcuData.subtitle}</p>}
                </div>
                <div className="row gy-50 align-items-center">
                    <div className="col-xl-4 col-md-6">
                        <div className="wcu-card-wrap left-align">
                            {leftItems.map((item, idx) => (
                                <div className="wcu-card" key={item.id || idx}>
                                    <div className="wcu-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {item.icon && item.icon.startsWith('ri-') ? (
                                            <i className={item.icon} style={{ fontSize: '28px', color: '#f97316' }}></i>
                                        ) : (
                                            <img src={defaultIcons[idx % defaultIcons.length]} alt="icon" />
                                        )}
                                    </div>
                                    <div className="wcu-card-details">
                                        <h4 className="wcu-card-title">{item.title}</h4>
                                        <p className="wcu-card-text">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-xl-4 col-md-6 order-xl-3">
                        <div className="wcu-card-wrap right-align">
                            {rightItems.map((item, idx) => {
                                const iconIdx = (half + idx) % defaultIcons.length;
                                return (
                                    <div className="wcu-card" key={item.id || idx}>
                                        <div className="wcu-card-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {item.icon && item.icon.startsWith('ri-') ? (
                                                <i className={item.icon} style={{ fontSize: '28px', color: '#f97316' }}></i>
                                            ) : (
                                                <img src={defaultIcons[iconIdx]} alt="icon" />
                                            )}
                                        </div>
                                        <div className="wcu-card-details">
                                            <h4 className="wcu-card-title">{item.title}</h4>
                                            <p className="wcu-card-text">{item.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="col-xl-4">
                        <div className="wcu-thumb1-1">
                            <img src="/main-assets/img/normal/why_1-1.png" alt="img" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhyChoose;

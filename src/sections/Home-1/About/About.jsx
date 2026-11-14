"use client";

import Link from "next/link";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import { DEFAULT_LANDING_DATA } from "@/lib/landingContent";

const About = ({ data }) => {
    const aboutData = data || DEFAULT_LANDING_DATA.about;
    const { ref: counterRef, inView: counterInView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const features = Array.isArray(aboutData.features) ? aboutData.features : DEFAULT_LANDING_DATA.about.features;
    const mainImg = aboutData.mainImage || '/main-assets/img/normal/about_1-1.png';

    return (
        <div className="about-area-1 space overflow-hidden shape-mockup-wrap" ref={counterRef} id="about-sec">
            <div
                className="section-animation-shape1-1 shape-mockup animation-infinite background-image"
                data-bottom="0"
                style={{ backgroundImage: "url('/main-assets/img/shape/global-line-shape2.png')", bottom: '0px' }}
            ></div>
            <div
                className="about_shape_1-1 shape-mockup jump-reverse"
                data-bottom="0"
                data-right="0"
                style={{ bottom: '0px', right: '0px' }}
            >
                <img src="/main-assets/img/normal/about_shape_1-2.png" alt="img" />
            </div>
            <div className="container">
                <div className="row gx-60 align-items-center">
                    <div className="col-xl-6">
                        <div className="about-thumb1 mb-40 mb-lg-0">
                            <div className="about-img-1">
                                <img
                                    src={mainImg}
                                    alt="About Halo Bangun"
                                    style={{ borderRadius: '12px', width: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div className="about-counter-wrap jump">
                                <h3 className="about-counter-number">
                                    <span className="counter-number">
                                        {counterInView && (
                                            <CountUp
                                                end={aboutData.experienceYears || 12}
                                                duration={3}
                                            />
                                        )}
                                    </span>
                                    +
                                </h3>
                                <p className="about-counter-text">{aboutData.experienceLabel || 'Tahun Pengalaman'}</p>
                                <div className="about-counter-shape">
                                    <img src="/main-assets/img/normal/about_shape_1-1.png" alt="img" />
                                </div>
                                <div className="client-group-thumb">
                                    <img src="/main-assets/img/normal/client_group_1-1.png" alt="img" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-6">
                        <div className="about-content-wrap1">
                            <div className="title-area mb-25">
                                <span className="sub-title">
                                    <img src="/main-assets/img/icon/section-subtitle-icon.svg" alt="img" />
                                    {aboutData.badge || 'TENTANG HALO BANGUN'}
                                </span>
                                <h2 className="sec-title">{aboutData.title}</h2>
                                <p className="sec-text">
                                    {aboutData.description}
                                </p>
                            </div>
                            <div className="checklist mb-35">
                                <ul>
                                    {features.map((item, idx) => (
                                        <li key={idx}>
                                            <img
                                                src="/main-assets/img/icon/about-checklsit-icon1-1.svg"
                                                alt="check"
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="about-grid-wrap">
                                <div className="icon">
                                    <img src="/main-assets/img/icon/about-grid-icon1-1.svg" alt="img" />
                                </div>
                                <div className="about-grid-details">
                                    <h4 className="title">Misi Kami</h4>
                                    <p className="text">
                                        Memberikan ketenangan lahir batin bagi pemilik bangunan lewat transparansi Kurva S digital dan mutu tanpa kompromi.
                                    </p>
                                </div>
                            </div>
                            <div className="about-grid-wrap">
                                <div className="icon">
                                    <img src="/main-assets/img/icon/about-grid-icon1-2.svg" alt="img" />
                                </div>
                                <div className="about-grid-details">
                                    <h4 className="title">Visi Kami</h4>
                                    <p className="text">
                                        Menjadi tolok ukur kontraktor profesional dan terpercaya di Indonesia dalam hal kejujuran anggaran dan mutu konstruksi.
                                    </p>
                                </div>
                            </div>
                            <div className="btn-group mt-60">
                                <Link href="/about" className="btn style3">
                                    Pelajari Profil Lengkap <i className="ri-arrow-right-up-line"></i>
                                </Link>
                                {aboutData.phoneConsult && (
                                    <a
                                        href={`tel:${aboutData.phoneConsult.replace(/[^0-9]/g, '')}`}
                                        className="btn"
                                        style={{ background: '#f1f5f9', color: '#0f172a', marginLeft: '12px', border: '1px solid #cbd5e1' }}
                                    >
                                        <i className="ri-phone-line" style={{ color: '#2563eb' }}></i> {aboutData.phoneConsult}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;

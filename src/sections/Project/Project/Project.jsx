'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

const projectsData = [
    {
        id: 1,
        title: "Rumah Tinggal 2 Lantai Ibu Theresia",
        category: "Pembangunan Baru",
        catKey: "PEMBANGUNAN",
        location: "Sleman, D.I. Yogyakarta",
        date: "Selesai 2026",
        src: "/main-assets/img/project/project2_1.png",
    },
    {
        id: 2,
        title: "Renovasi Cafe & Roastery Reza",
        category: "Renovasi Komersial",
        catKey: "RENOVASI",
        location: "Solo Baru, Jawa Tengah",
        date: "Selesai 2026",
        src: "/main-assets/img/project/project2_2.png",
    },
    {
        id: 3,
        title: "Desain Arsitektur Villa Modern Tropis",
        category: "Jasa Arsitektur",
        catKey: "ARSITEKTUR",
        location: "Kaliurang, Yogyakarta",
        date: "Selesai 2025",
        src: "/main-assets/img/project/project2_3.png",
    },
    {
        id: 4,
        title: "Pembangunan Rumah Klasik Modern",
        category: "Pembangunan Baru",
        catKey: "PEMBANGUNAN",
        location: "Bandung, Jawa Barat",
        date: "Selesai 2025",
        src: "/main-assets/img/project/project2_4.png",
    },
    {
        id: 5,
        title: "Pembangunan Gedung Balai Warga",
        category: "Proyek Pemerintah & Fasum",
        catKey: "PEMERINTAH",
        location: "Sukoharjo, Jawa Tengah",
        date: "Selesai 2026",
        src: "/main-assets/img/project/project2_5.png",
    },
    {
        id: 6,
        title: "Desain Fasad & Interior Kantor",
        category: "Jasa Arsitektur",
        catKey: "ARSITEKTUR",
        location: "Semarang, Jawa Tengah",
        date: "Selesai 2025",
        src: "/main-assets/img/project/project2_6.png",
    },
    {
        id: 7,
        title: "Renovasi Rumah Tinggal & Rooftop",
        category: "Renovasi & Ekstensi",
        catKey: "RENOVASI",
        location: "Bantul, D.I. Yogyakarta",
        date: "Selesai 2026",
        src: "/main-assets/img/project/project2_7.png",
    },
    {
        id: 8,
        title: "Hunian Scandinavian Minimalis",
        category: "Pembangunan Baru",
        catKey: "PEMBANGUNAN",
        location: "Kulon Progo, DIY",
        date: "Selesai 2025",
        src: "/main-assets/img/project/project2_8.png",
    },
    {
        id: 9,
        title: "Desain Masterplan Kompleks Hunian",
        category: "Jasa Arsitektur",
        catKey: "ARSITEKTUR",
        location: "Cirebon, Jawa Barat",
        date: "Selesai 2025",
        src: "/main-assets/img/project/project2_9.png",
    },
];

const categories = [
    { key: "ALL", label: "Semua Kategori" },
    { key: "PEMBANGUNAN", label: "Pembangunan Baru" },
    { key: "ARSITEKTUR", label: "Desain Arsitektur" },
    { key: "RENOVASI", label: "Renovasi Bangunan" },
    { key: "PEMERINTAH", label: "Fasum & Pemerintah" },
];

const Project = () => {
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [photoIndex, setPhotoIndex] = useState(-1);

    const filteredProjects = selectedCategory === "ALL"
        ? projectsData
        : projectsData.filter((p) => p.catKey === selectedCategory);

    const images = filteredProjects.map((p) => p.src);

    const handleOpen = (index) => {
        setPhotoIndex(index);
    };

    useEffect(() => {
        if (photoIndex >= 0) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [photoIndex]);

    return (
        <section className="project-page space-top space-extra-bottom">
            <div className="container">
                {/* Category Filter Tabs */}
                <div className="portfolio-filter-tab text-center mb-50">
                    <div className="tab-menu" style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                        {categories.map((c) => (
                            <button
                                key={c.key}
                                type="button"
                                onClick={() => setSelectedCategory(c.key)}
                                className={`btn ${selectedCategory === c.key ? 'style3' : 'style2'}`}
                                style={{
                                    padding: '8px 20px',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    borderRadius: '50px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    border: selectedCategory === c.key ? 'none' : '1px solid #e2e8f0',
                                }}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="row gy-40 justify-content-center">
                    {filteredProjects.map((item, index) => (
                        <div className="col-md-6 col-lg-4" key={item.id}>
                            <div className="portfolio-card style2">
                                <div className="portfolio-card-thumb">
                                    <img src={item.src} alt={item.title} />
                                    <span className="portfolio-card-number">0{index + 1}</span>
                                    <button className="icon-btn popup-image" onClick={() => handleOpen(index)} title="Perbesar Foto">
                                        <i className="ri-eye-line"></i>
                                    </button>
                                </div>
                                <div className="portfolio-card-details">
                                    <span className="portfolio-card-subtitle">{item.category} • {item.location}</span>
                                    <h4 className="portfolio-card-title">
                                        <Link href="https://wa.me/6282135450404" target="_blank">{item.title}</Link>
                                    </h4>
                                    <p className="portofolio-card-text">{item.date} • Dikerjakan oleh Tim Halo Bangun</p>
                                    <Link href="https://wa.me/6282135450404" target="_blank" className="btn-with-icon">
                                        KONSULTASI PROYEK INI
                                        <span className="btn-icon">
                                            <i className="ri-arrow-right-up-line"></i>
                                        </span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-50">
                    <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
                        Punya rencana membangun hunian atau merenovasi tempat usaha Anda?
                    </p>
                    <Link href="https://wa.me/6282135450404" target="_blank" className="btn style3">
                        KONSULTASIKAN PROYEK ANDA SEKARANG <i className="ri-whatsapp-line ms-1"></i>
                    </Link>
                </div>
            </div>

            {photoIndex >= 0 && (
                <Lightbox
                    mainSrc={images[photoIndex]}
                    nextSrc={images[(photoIndex + 1) % images.length]}
                    prevSrc={images[(photoIndex + images.length - 1) % images.length]}
                    onCloseRequest={() => setPhotoIndex(-1)}
                    onMovePrevRequest={() =>
                        setPhotoIndex((photoIndex + images.length - 1) % images.length)
                    }
                    onMoveNextRequest={() =>
                        setPhotoIndex((photoIndex + 1) % images.length)
                    }
                />
            )}
        </section>
    );
};

export default Project;

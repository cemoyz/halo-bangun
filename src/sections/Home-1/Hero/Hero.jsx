"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import CountUp from "react-countup";
import { DEFAULT_LANDING_DATA } from "@/lib/landingContent";

const Hero = ({ data }) => {
  const heroData = data || DEFAULT_LANDING_DATA.hero;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides, setTotalSlides] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (sliderRef.current) {
      setTotalSlides(sliderRef.current.props.children.length);
    }
  }, []);

  const goToPrev = () => {
    if (sliderRef.current) {
      sliderRef.current.slickPrev();
    }
  };

  const goToNext = () => {
    if (sliderRef.current) {
      sliderRef.current.slickNext();
    }
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: false,
    fade: true,
    beforeChange: (current, next) => setCurrentSlide(next),
  };

  const bgImg = heroData.backgroundImage || '/main-assets/img/hero/hero_bg_1_1.png';

  return (
    <div
      className="hero-wrapper hero-1 shape-mockup-wrap background-image"
      id="hero"
      style={{ backgroundImage: `url('${bgImg}')` }}
    >
      {/* Slider */}
      <Slider {...settings} ref={sliderRef} className="hero-slider1">
        {/* Slide 1 - Dynamic Main */}
        <div className="hero-slide">
          <div className="container larger-no-space">
            <div className="row">
              <div className="col-lg-6">
                <div className="hero-style1">
                  {heroData.badgeText && (
                    <span style={{
                      display: 'inline-block',
                      background: 'rgba(249, 115, 22, 0.2)',
                      color: '#fb923c',
                      border: '1px solid rgba(249, 115, 22, 0.4)',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      marginBottom: '16px'
                    }}>
                      {heroData.badgeText}
                    </span>
                  )}
                  <h1 className="hero-title text-white">
                    {heroData.title}
                  </h1>
                  <p className="hero-text text-white">
                    {heroData.subtitle}
                  </p>
                  <div className="btn-group">
                    <Link href={heroData.primaryButtonLink || "https://wa.me/6282135450404"} className="btn style2">
                      {heroData.primaryButtonText || "Konsultasi Proyek via WA"} <i className="ri-whatsapp-line"></i>
                    </Link>
                    <Link href={heroData.secondaryButtonLink || "/login"} className="btn" style={{ background: '#f97316', color: '#fff', marginLeft: '12px' }}>
                      {heroData.secondaryButtonText || "Portal Klien"} <i className="ri-dashboard-line"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-thumb text-center">
            <img src="/main-assets/img/hero/hero_thumb_1_1.png" alt="img" />
          </div>
        </div>

        {/* Slide 2 - Transparansi & SNI */}
        <div className="hero-slide">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div className="hero-style1">
                  <h1 className="hero-title text-white">
                    Konstruksi Standar SNI dengan Garansi Tertulis
                  </h1>
                  <p className="hero-text text-white">
                    Rencana Anggaran Biaya (RAB) mengikat tanpa biaya tersembunyi, dilindungi perjanjian SPKPR resmi bermaterai.
                  </p>
                  <div className="btn-group">
                    <Link href="/portfolio" className="btn style2">
                      Portofolio Proyek <i className="ri-arrow-right-up-line"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-thumb text-center">
            <img src="/main-assets/img/hero/hero_thumb_1_2.png" alt="img" />
          </div>
        </div>

        {/* Slide 3 - Ruang Klien */}
        <div className="hero-slide">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div className="hero-style1">
                  <h1 className="hero-title text-white">
                    Transparansi Penuh Proyek di Ruang Klien
                  </h1>
                  <p className="hero-text text-white">
                    Akses mandiri dokumen proyek, pemantauan CCTV harian, jadwal termin pembayaran, dan persetujuan Addendum secara digital.
                  </p>
                  <div className="btn-group">
                    <Link href="/login" className="btn style2">
                      Masuk Portal Klien <i className="ri-arrow-right-up-line"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-thumb text-center">
            <img src="/main-assets/img/hero/hero_thumb_1_3.png" alt="img" />
          </div>
        </div>
      </Slider>

      {/* Custom navigation */}
      <div className="slider-controller-wrap">
        <div className="slider-btn-wrap">
          <div className="icon-box">
            <button onClick={goToPrev} className="slick-arrow default">
              <i className="ri-arrow-left-down-line"></i>
            </button>
            <button onClick={goToNext} className="slick-arrow default">
              <i className="ri-arrow-right-up-line"></i>
            </button>
          </div>
          <div className="slides-numbers">
            <span className="active">0{currentSlide + 1}</span> /
            <span className="total">0{totalSlides}</span>
          </div>
        </div>
      </div>

      {/* Other elements */}
      <div className="hero-bg-shape1-1"></div>
      <div className="hero-bg-shape1-2"></div>
      <div className="section-animation-shape1-1 shape-mockup animation-infinite background-image" style={{ backgroundImage: "url('/main-assets/img/shape/global-line-shape1.png')" }}>
      </div>
      <div className="section-animation-shape1-2 shape-mockup animation-infinite background-image" style={{ backgroundImage: "url('/main-assets/img/shape/global-line-shape1.png')" }}>
      </div>

      <div className="hero-shape1-1 shape-mockup movingX">
        <img src="/main-assets/img/hero/hero_shape_1_1.png" alt="img" />
      </div>

      {/* hero wrapper highlight */}
      <div
        className="hero-experience-wrap"
        style={{
          backgroundImage: "url('/main-assets/img/hero/hero_experience_wrap_bg_1_1.png')",
        }}
      >
        <span className="shadow-text">Halo Bangun</span>
        <div className="hero-experience-icon">
          <img src="/main-assets/img/hero/hero_experience_wrap_icon_1_1.png" alt="img" />
        </div>
        <h2 className="hero-experience-counter">
          <span className="counter-number">
            {heroData.statsNumber || '150+'}
          </span>
        </h2>
        <p className="hero-experience-text">{heroData.statsLabel || 'Proyek Selesai Tepat Waktu'}</p>
        <div className="media">
          <div className="icon">
            <img src="/main-assets/img/hero/hero_experience_wrap_icon_1_2.png" alt="img" />
          </div>
          <Link className="link-btn link-text" href="/about">
            Pelajari Profil <img src="/main-assets/img/icon/long-arrow-right.png" alt="img" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero;

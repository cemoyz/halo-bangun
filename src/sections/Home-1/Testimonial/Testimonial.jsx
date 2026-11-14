"use client";

import Link from "next/link";
import { useRef } from "react";
import Slider from "react-slick";
import { DEFAULT_LANDING_DATA } from "@/lib/landingContent";

const Testimonial = ({ data }) => {
    const testiData = data || DEFAULT_LANDING_DATA.testimonials;
    const items = Array.isArray(testiData.items) && testiData.items.length > 0
        ? testiData.items
        : DEFAULT_LANDING_DATA.testimonials.items;

    const settings = {
        dots: false,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        speed: 1500,
        autoplaySpeed: 5000,
    };

    const sliderRef = useRef(null);

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

    const defaultAvatars = [
        '/main-assets/img/testimonial/testi_1_1.png',
        '/main-assets/img/testimonial/testi_1_2.png',
        '/main-assets/img/testimonial/testi_1_3.png',
    ];

    return (
        <div
            className="testimonial-area-1 home-one-testimonial overflow-hidden space bg-smoke shape-mockup-wrap background-image"
            style={{ backgroundImage: "url('/main-assets/img/bg/testimonial-bg1-1.png')" }}
        >
            <div
                className="testimonial_shape_1-1 shape-mockup jump d-xxl-block d-none"
                style={{ top: '0px', right: '4%' }}
            >
                <img src="/main-assets/img/shape/sec-bg-shape2.png" alt="img" />
            </div>
            <div className="container">
                <div className="row gx-100 gy-60 flex-row-reverse">
                    <div className="col-xl-6">
                        <div className="title-area">
                            <span className="sub-title">
                                <img src="/main-assets/img/icon/section-subtitle-icon.svg" alt="img" />
                                {testiData.badge || 'Testimoni Klien'}
                            </span>
                            <h2 className="sec-title">{testiData.title || 'Apa Kata Klien Halo Bangun'}</h2>
                            {testiData.subtitle && <p style={{ color: '#64748b', marginTop: '6px' }}>{testiData.subtitle}</p>}
                        </div>

                        <Slider
                            {...settings}
                            className="row global-carousel testi-slider1"
                            data-slide-show="1"
                            ref={sliderRef}
                        >
                            {items.map((item, idx) => {
                                const avatarSrc = item.avatar || defaultAvatars[idx % defaultAvatars.length];
                                return (
                                    <div className="col-lg-6" key={idx}>
                                        <div className="testi-card">
                                            <div className="quote-icon">
                                                <img src="/main-assets/img/icon/quote.svg" alt="img" />
                                            </div>
                                            <div className="testi-card-thumb">
                                                <img
                                                    src={avatarSrc}
                                                    alt={item.name}
                                                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <div className="testi-card_content">
                                                <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                                                    {Array.from({ length: item.rating || 5 }).map((_, starIdx) => (
                                                        <i key={starIdx} className="ri-star-fill" style={{ color: '#f59e0b', fontSize: '16px' }}></i>
                                                    ))}
                                                </div>
                                                <h4 className="testi-card_title">{item.name}</h4>
                                                <p className="testi-card_text">
                                                    {item.comment}
                                                </p>
                                                <div className="testi-card-profile">
                                                    <h4 className="testi-profile-title">{item.role || item.name}</h4>
                                                    <span className="testi-profile-desig">
                                                        {item.project}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </Slider>

                        <div className="btn-wrap mt-70">
                            <div className="icon-box">
                                <button
                                    onClick={goToPrev}
                                    data-slick-prev=".testi-slider1"
                                    className="slick-arrow style2 default"
                                >
                                    <i className="ri-arrow-left-down-line"></i>
                                </button>
                                <button
                                    onClick={goToNext}
                                    data-slick-next=".testi-slider1"
                                    className="slick-arrow style2 default"
                                >
                                    <i className="ri-arrow-right-up-line"></i>
                                </button>
                            </div>
                            <div className="client-group-thumb">
                                <img src="/main-assets/img/normal/client_group_1-1.png" alt="img" />
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-6">
                        <div className="testimonial-thumb1">
                            <img src="/main-assets/img/normal/testimonial_2-1.png" alt="img" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Testimonial;

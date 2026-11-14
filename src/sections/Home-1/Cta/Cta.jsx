"use client";

import ContactDropdownTwo from "../../Common/ContactDropdown/ContactDropdownTwo";
import { DEFAULT_LANDING_DATA } from "@/lib/landingContent";

const Cta = ({ data }) => {
    const ctaData = data || DEFAULT_LANDING_DATA.cta;
    const waLink = ctaData.buttonLink || `https://wa.me/62${(ctaData.phoneNumber || '082135450404').replace(/^0/, '').replace(/[^0-9]/g, '')}`;

    return (
        <div className="cta-area-1">
            <div className="container">
                <div className="row gx-0 align-items-center">
                    <div className="col-lg-7">
                        <div className="cta-wrap-1 position-relative shape-mockup-wrap">
                            <div className="section-animation-shape1-1 shape-mockup animation-infinite background-image" data-top="0" data-left="0" style={{ backgroundImage: "url('/main-assets/img/shape/global-line-shape1.png')", top: '0px', left: '0px' }}>
                            </div>
                            <div className="title-area mb-40 cta-text-align">
                                <span className="sub-title"><img src="/main-assets/img/icon/section-subtitle-icon.svg" alt="img" />KONSULTASI GRATIS</span>
                                <h3 className="sec-title">{ctaData.title || 'Punya Rencana Bangun atau Renovasi?'}</h3>
                                {ctaData.subtitle && <p style={{ color: '#475569', marginTop: '8px' }}>{ctaData.subtitle}</p>}
                            </div>
                            <form action={waLink} method="GET" target="_blank" className="cta-contact-form">
                                <div className="row gy-15">
                                    <div className="col-12">
                                        <div className="form-group">
                                            <input type="text" className="form-control" name="text" id="name" placeholder="Nama Lengkap & Lokasi Proyek" />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-group">
                                            <input type="text" className="form-control" placeholder="Rencana Anggaran / Luas Bangunan" />
                                        </div>
                                    </div>
                                    <ContactDropdownTwo />
                                    <div className="form-btn col-12">
                                        <button type="submit" className="btn w-100">
                                            {ctaData.buttonText || 'KONSULTASI VIA WHATSAPP SEKARANG'} <i className="ri-whatsapp-line ms-2"></i>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="col-lg-5">
                        <div className="cta-thumb1-1">
                            <img src="/main-assets/img/normal/cta-thumb1-1.png" alt="img" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cta;

"use client";
import Link from "next/link";
import React, { useState } from "react";
import PopupVideo from "../../Common/PopupVideo/PopupVideo";

const ProcessThree = () => {
  const [popup, setPopup] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const openPopup = () => {
    setPopup(true);
    const iframe = document.getElementById("youtube-video");
    if (iframe) {
      iframe.src = "https://www.youtube.com/embed/Mp8IXI1kzvQ?si=UQVMsmBriHPfD6Vf";
    }
    setIsActive(true);
    document.body.style.overflow = 'hidden';
  };
  return (
    <>
      <section
        className="process-area-1 space-top bg-attachment process-bg-half"
        data-overlay="title"
        data-opacity="8"
        style={{ backgroundImage: "url('/main-assets/img/bg/process-bg1-1.png')" }}
      >
        <div className="process_shape_1-1 movingX shape-mockup d-lg-block d-none"></div>
        <div className="process_shape_1-2 moving shape-mockup d-lg-block d-none"></div>
        <div
          className="process_shape_1-3 shape-mockup jump-reverse d-xl-block d-none"
          style={{ bottom: '-50%', right: '0px' }}
        >
          <img src="/main-assets/img/shape/sec-bg-shape1.png" alt="img" />
        </div>
        <div className="container">
          <div className="row justify-content-between align-items-center">
            <div className="col-lg-4 col-md-6">
              <div className="title-area text-left content-text-extra-style">
                <span className="sub-title text-white">
                  <img src="/main-assets/img/icon/section-subtitle-icon.svg" alt="img" />
                  Alur Kerja Kami
                </span>
                <h2 className="sec-title text-white">
                  4 Langkah Mudah Mewujudkan Bangunan Impian Anda
                </h2>
              </div>
            </div>
            <div className="col-md-auto">
              <div className="sec-btn text-center">
                <a onClick={openPopup}
                  className=" play-btn-wrap"
                >
                  Tonton Video Profil
                  <span className="play-btn style2">
                    <i className="ri-play-fill"></i>
                  </span>
                </a>
              </div>
            </div>
          </div>
          <div className="process-card-wrap">
            <div className="row gy-30 gx-30">
              <div className="col-xl-3 col-md-6">
                <div className="process-card">
                  <div className="process-card-number">
                    <span> 01 </span>
                    LANGKAH
                  </div>
                  <h4 className="process-card-title">
                    Konsultasi & Survey Lokasi
                  </h4>
                  <p className="process-card-text">
                    Diskusi kebutuhan desain, pengukuran tanah langsung, serta analisis anggaran tanpa biaya awal.
                  </p>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="process-card">
                  <div className="process-card-number">
                    <span> 02 </span>
                    LANGKAH
                  </div>
                  <h4 className="process-card-title">
                    Desain Arsitektur & RAB Pasti
                  </h4>
                  <p className="process-card-text">
                    Pembuatan visual 3D, gambar kerja detail (DED), dan rincian anggaran yang mengikat tanpa biaya siluman.
                  </p>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="process-card">
                  <div className="process-card-number">
                    <span> 03 </span>
                    LANGKAH
                  </div>
                  <h4 className="process-card-title">
                    Konstruksi & Live Monitoring
                  </h4>
                  <p className="process-card-text">
                    Pelaksanaan kerja terstruktur sesuai Kurva S dengan pantauan CCTV langsung di dashboard klien.
                  </p>
                </div>
              </div>
              <div className="col-xl-3 col-md-6">
                <div className="process-card">
                  <div className="process-card-number">
                    <span> 04 </span>
                    LANGKAH
                  </div>
                  <h4 className="process-card-title">
                    Serah Terima & Garansi Resmi
                  </h4>
                  <p className="process-card-text">
                    Penandatanganan BAST resmi, serah terima kunci unit, dan proteksi garansi pemeliharaan tertulis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PopupVideo popup={popup} setPopup={setPopup} isActive={isActive} setIsActive={setIsActive}></PopupVideo>
    </>
  );
};

export default ProcessThree;

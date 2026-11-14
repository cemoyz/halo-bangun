"use client";
import Link from "next/link";
import PopupVideo from "../../Common/PopupVideo/PopupVideo";
import { useState } from "react";
import { DEFAULT_LANDING_DATA } from "@/lib/landingContent";

const Process = ({ data }) => {
  const [popup, setPopup] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const processData = data || DEFAULT_LANDING_DATA.process;
  const steps = Array.isArray(processData.steps) && processData.steps.length > 0
    ? processData.steps
    : DEFAULT_LANDING_DATA.process.steps;

  const openPopup = () => {
    setPopup(true);
    const iframe = document.getElementById("youtube-video");
    if (iframe) {
      iframe.src =
        "https://www.youtube.com/embed/Mp8IXI1kzvQ?si=UQVMsmBriHPfD6Vf";
    }
    setIsActive(true);
    document.body.style.overflow = 'hidden';
  };

  return (
    <>
      <section
        className="process-area-1 space-top bg-attachment process-bg-half shape-mockup-wrap background-image"
        data-overlay="title"
        data-opacity="8"
        style={{ backgroundImage: "url('/main-assets/img/bg/process-bg1-1.png')" }}
      >
        <div className="process_shape_1-1 movingX shape-mockup d-lg-block d-none"></div>
        <div className="process_shape_1-2 moving shape-mockup d-lg-block d-none"></div>
        <div
          className="process_shape_1-3 shape-mockup jump-reverse d-xl-block d-none"
          data-bottom="-50%"
          data-right="0"
          style={{ right: "0px", bottom: "-50%" }}
        >
          <img src="/main-assets/img/shape/sec-bg-shape1.png" alt="img" />
        </div>
        <div className="container">
          <div className="row justify-content-between align-items-center">
            <div className="col-lg-6 col-md-8">
              <div className="title-area content-text-extra-style">
                <span className="sub-title text-white">
                  <img src="/main-assets/img/icon/section-subtitle-icon.svg" alt="img" />
                  {processData.badge || 'Alur Kerja Proyek'}
                </span>
                <h2 className="sec-title text-white">
                  {processData.title || 'Tahapan Pembangunan Transparan & Terukur'}
                </h2>
                {processData.subtitle && (
                  <p className="text-white" style={{ opacity: 0.85, marginTop: '8px' }}>
                    {processData.subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="col-md-auto">
              <div className="sec-btn text-center">
                <a onClick={openPopup} className="play-btn-wrap" style={{ cursor: 'pointer' }}>
                  Video Profil
                  <span className="play-btn style2">
                    <i className="ri-play-fill"></i>
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className="process-card-wrap">
            <div className="row gy-30 gx-30">
              {steps.map((st, idx) => {
                const stepNum = st.step || `0${idx + 1}`;
                const colSize = steps.length > 4 ? "col-xl col-md-6" : "col-xl-3 col-md-6";
                return (
                  <div className={colSize} key={idx}>
                    <div className="process-card process-fixed-height">
                      <div className="process-card-number">
                        <span>{stepNum}</span>
                        TAHAP
                      </div>
                      <h4 className="process-card-title">
                        {st.title}
                      </h4>
                      <p className="process-card-text">
                        {st.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      <PopupVideo
        popup={popup}
        setPopup={setPopup}
        isActive={isActive}
        setIsActive={setIsActive}
      ></PopupVideo>
    </>
  );
};

export default Process;

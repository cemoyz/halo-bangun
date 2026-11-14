"use client";
import Link from "next/link";
import CountUp from "react-countup";

const AboutThree = () => {
  return (
    <div className="about-area-2 space-top overflow-hidden">
      <div className="container">
        <div className="row gx-60 align-items-center flex-row-reverse">
          <div className="col-xl-6">
            <div className="about-thumb2 mb-60 mb-xl-0">
              <div className="about-img-1">
                <img src="/main-assets/img/normal/about_2-1.png" alt="img" />
              </div>
              <div className="about-counter-wrap style2 jump-reverse">
                <div className="about-counter-wrap-bg">
                  <img src="/main-assets/img/normal/about_shape_2-2.png" alt="img" />
                </div>
                <div className="about-counter-icon">
                  <img
                    src="/main-assets/img/hero/hero_experience_wrap_icon_1_1.png"
                    alt="img"
                  />
                </div>
                <h3 className="about-counter-number">
                  <span className="counter-number"><CountUp start={0} end={10} /></span>+
                </h3>
                <p className="about-counter-text">Tahun Dedikasi</p>
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="title-area mb-25">
              <span className="sub-title">
                <img src="/main-assets/img/icon/section-subtitle-icon.svg" alt="img" />
                TENTANG HALO BANGUN
              </span>
              <h2 className="sec-title">
                MEMBANGUN DENGAN TRANSPARANSI & STANDAR KUALITAS SNI
              </h2>
              <p className="sec-text">
                Halo Bangun adalah perusahaan jasa arsitektur, konstruksi, dan renovasi modern. Kami hadir untuk menyelesaikan persoalan klasik industri bangunan dengan memberikan jaminan transparansi anggaran, laporan progres Kurva S berkala, hingga integrasi live monitor CCTV.
              </p>
            </div>
            <div className="checklist mb-35">
              <ul>
                <li>
                  <img src="/main-assets/img/icon/about-checklsit-icon1-1.svg" alt="img" />
                  RAB Mengikat & Transparan Tanpa Biaya Tersembunyi
                </li>
                <li>
                  <img src="/main-assets/img/icon/about-checklsit-icon1-1.svg" alt="img" />
                  Garansi Struktur Tertulis & Pemantauan Proyek Real-Time
                </li>
              </ul>
            </div>
            <div className="about-grid-wrap">
              <div className="icon">
                <img src="/main-assets/img/icon/about-grid-icon1-1.svg" alt="img" />
              </div>
              <div className="about-grid-details">
                <h4 className="title">Misi Kami</h4>
                <p className="text">
                  Memberikan hasil rancang bangun berkualitas tinggi, tepat anggaran, dan tepat waktu dengan tata kelola digital yang akuntabel.
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
                  Menjadi pelopor kontraktor terpercaya di Indonesia yang menggabungkan estetika arsitektur dan kepastian finansial bagi klien.
                </p>
              </div>
            </div>
            <div className="btn-group mt-60">
              <Link href="https://wa.me/6282135450404" target="_blank" className="btn style3">
                KONSULTASI SEKARANG <i className="ri-arrow-right-up-line"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutThree;

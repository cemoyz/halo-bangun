import Link from "next/link";

const TeamThree = () => {
  return (
    <div className="team-area-1 space shape-mockup-wrap">
      <div
        className="section-animation-shape1-1 shape-mockup animation-infinite background-image"
        style={{ backgroundImage: "url('/main-assets/img/shape/global-line-shape2.png')", bottom: '0px' }}
      ></div>
      <div className="container">
        <div className="row justify-content-between align-items-center">
          <div className="col-lg-7 col-md-7">
            <div className="title-area content-text-extra-style">
              <span className="sub-title">
                <img src="/main-assets/img/icon/section-subtitle-icon.svg" alt="img" />
                Tim Profesional
              </span>
              <h2 className="sec-title">Pimpinan & Tenaga Ahli Halo Bangun</h2>
            </div>
          </div>
          <div className="col-md-auto">
            <div className="sec-btn">
              <Link href="https://wa.me/6282135450404" target="_blank" className="btn">
                Konsultasi dengan Tim <i className="ri-arrow-right-up-line"></i>
              </Link>
            </div>
          </div>
        </div>

        <div className="row gy-30 justify-content-center">
          <div className="col-lg-4 col-md-6">
            <div
              className="team-card"
              style={{ backgroundImage: "url('/main-assets/img/bg/team-card-bg1-1.png')" }}
            >
              <div className="team-card_content max-width-reset-team">
                <h4 className="team-card_title">
                  <Link href="https://wa.me/6282135450404" target="_blank">Ir. Arga Pramudya, S.T.</Link>
                </h4>
                <span className="team-card_desig">Direktur Utama / Founder</span>
                <div className="team-social_wrap">
                  <div className="social-btn">
                    <Link href="https://facebook.com/halobangun">
                      <i className="ri-facebook-fill"></i>
                    </Link>
                    <Link href="https://instagram.com/halobangun">
                      <i className="ri-instagram-line"></i>
                    </Link>
                    <Link href="https://linkedin.com/company/halobangun">
                      <i className="ri-linkedin-fill"></i>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="team-card_img team-card-white-space-none">
                <img src="/main-assets/img/team/team-1-1.png" alt="img" />
              </div>
              <Link href="https://wa.me/6282135450404" target="_blank" className="contact-btn-wrap">
                <span className="number">0821-3545-0404</span>
                <div className="icon-btn">
                  <i className="ri-whatsapp-fill"></i>
                </div>
              </Link>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div
              className="team-card"
              style={{ backgroundImage: "url('/main-assets/img/bg/team-card-bg1-1.png')" }}
            >
              <div className="team-card_content max-width-reset-team">
                <h4 className="team-card_title">
                  <Link href="https://wa.me/6282135450404" target="_blank">Dimas Pratama, S.T.</Link>
                </h4>
                <span className="team-card_desig">Senior Project Manager</span>
                <div className="team-social_wrap">
                  <div className="social-btn">
                    <Link href="https://facebook.com/halobangun">
                      <i className="ri-facebook-fill"></i>
                    </Link>
                    <Link href="https://instagram.com/halobangun">
                      <i className="ri-instagram-line"></i>
                    </Link>
                    <Link href="https://linkedin.com/company/halobangun">
                      <i className="ri-linkedin-fill"></i>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="team-card_img team-card-white-space-none">
                <img src="/main-assets/img/team/team-1-2.png" alt="img" />
              </div>
              <Link href="https://wa.me/6282135450404" target="_blank" className="contact-btn-wrap">
                <span className="number">0821-3545-0404</span>
                <div className="icon-btn">
                  <i className="ri-whatsapp-fill"></i>
                </div>
              </Link>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div
              className="team-card"
              style={{ backgroundImage: "url('/main-assets/img/bg/team-card-bg1-1.png')" }}
            >
              <div className="team-card_content max-width-reset-team">
                <h4 className="team-card_title">
                  <Link href="https://wa.me/6282135450404" target="_blank">Ratna Dewi, S.E.</Link>
                </h4>
                <span className="team-card_desig">Head of Finance & Legal</span>
                <div className="team-social_wrap">
                  <div className="social-btn">
                    <Link href="https://facebook.com/halobangun">
                      <i className="ri-facebook-fill"></i>
                    </Link>
                    <Link href="https://instagram.com/halobangun">
                      <i className="ri-instagram-line"></i>
                    </Link>
                    <Link href="https://linkedin.com/company/halobangun">
                      <i className="ri-linkedin-fill"></i>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="team-card_img team-card-white-space-none">
                <img src="/main-assets/img/team/team-1-3.png" alt="img" />
              </div>
              <Link href="https://wa.me/6282135450404" target="_blank" className="contact-btn-wrap">
                <span className="number">0821-3545-0404</span>
                <div className="icon-btn">
                  <i className="ri-whatsapp-fill"></i>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamThree;

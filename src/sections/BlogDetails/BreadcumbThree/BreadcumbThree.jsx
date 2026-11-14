import Link from "next/link";

const BreadcumbThree = ({ title = "Detail Artikel" }) => {
  return (
    <div
      className="breadcumb-wrapper"
      style={{ backgroundImage: "url('/main-assets/img/bg/breadcrumb-bg.png')" }}
    >
      <div
        className="section-animation-shape1-1 shape-mockup animation-infinite"
        data-top="0"
        style={{ backgroundImage: "url('/main-assets/img/shape/global-line-shape1.png')" }}
      ></div>
      {/* bg animated image */}
      <div className="container">
        <div className="breadcumb-content">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h1 className="breadcumb-title">
                {title}
              </h1>
            </div>
            <div className="col-12">
              <ul className="breadcumb-menu">
                <li>
                  <Link href="/">
                    <i className="ri-home-4-fill"></i> BERANDA
                  </Link>
                </li>
                <li>
                  <Link href="/articles">ARTIKEL</Link>
                </li>
                <li className="active">{title}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreadcumbThree;

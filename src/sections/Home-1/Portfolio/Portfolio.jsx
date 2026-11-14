'use client'

import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // Important for styling
import 'slick-carousel/slick/slick.css'; // Slick Carousel styles
import 'slick-carousel/slick/slick-theme.css'; // Slick Carousel theme styles
import Link from 'next/link';

const projectItems = [
  {
    image: "/main-assets/img/project/project1_1.png",
    category: "Pembangunan Rumah",
    title: "Rumah Ibu Theresia - Sleman",
    date: "Progres 82% (On Track)",
  },
  {
    image: "/main-assets/img/project/project1_2.png",
    category: "Desain Arsitektur",
    title: "Ndalem Sukoharjo 1 & 2",
    date: "Konsep Japandi Javanese",
  },
  {
    image: "/main-assets/img/project/project1_3.png",
    category: "Renovasi Komersial",
    title: "Café Mas Reza Sambilegi",
    date: "Progres 78% (Finishing)",
  },
  {
    image: "/main-assets/img/project/project1_1.png",
    category: "Desain Arsitektur",
    title: "Asrama Mahasiswa Sumbawa Barat",
    date: "Perencanaan Fasilitas Publik",
  },
  {
    image: "/main-assets/img/project/project1_2.png",
    category: "Pembangunan Baru",
    title: "Kosan Eksklusif UMY Pak Fadli",
    date: "Hunian Mahasiswa Modern",
  },
  {
    image: "/main-assets/img/project/project1_3.png",
    category: "Masterplan Publik",
    title: "Penataan Kawasan XT Square",
    date: "Pemerintah Kota Yogyakarta",
  },
];

const Portfolio = () => {
  const [photoIndex, setPhotoIndex] = useState(-1);
  const images = projectItems.map(p => p.image);

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

  const settings = {
    dots: true,
    focusOnSelect: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    centerMode: true,
    centerPadding: "20%",
    autoplay: true,
    speed: 1500,
    autoplaySpeed: 5000,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          centerMode: false,
          centerPadding: "0%",
          dots: true,
        }
      },
      {
        breakpoint: 767,
        settings: {
          centerMode: false,
          centerPadding: "0%",
          dots: false,
        }
      }
    ]
  };

  const handleOpen = (index) => {
    setPhotoIndex(index);
  };

  return (
    <div className="portfolio-area-1 space">
      <div className="container">
        <div className="title-area text-center">
          <span className="sub-title">
            <img src="/main-assets/img/icon/section-subtitle-icon.svg" alt="img" /> Portofolio Pilihan
          </span>
          <h2 className="sec-title">Karya & Dokumentasi Proyek Nyata</h2>
          <p className="sec-text">Eksplorasi portofolio desain arsitektur, pembangunan baru, dan renovasi Halo Bangun di D.I. Yogyakarta, Jateng & Jabar.</p>
        </div>
        <div className="portfolio-slider1 overflow-hidden">
          <Slider {...settings}>
            {projectItems.map((item, index) => (
              <div key={index}>
                <div className="portfolio-card" style={{ margin: "0px 1rem" }}>
                  <div className="portfolio-card-thumb">
                    <img src={item.image} alt={item.title} />
                    <button className="icon-btn popup-image" onClick={() => handleOpen(index)}>
                      <i className="ri-eye-line"></i>
                    </button>
                  </div>
                  <div className="portfolio-card-details">
                    <div className="media-left">
                      <span className="portfolio-card-subtitle">{item.category}</span>
                      <h4 className="portfolio-card-title">
                        <Link href="/portfolio">
                          {item.title}
                        </Link>
                      </h4>
                      <p className="portofolio-card-text">
                        {item.date}
                      </p>
                    </div>
                  </div>
                  <Link href="/portfolio" className="btn">
                    Lihat Portofolio <i className="ri-arrow-right-up-line"></i>
                  </Link>
                </div>
              </div>
            ))}
          </Slider>
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
    </div>
  );
};

export default Portfolio;























// "use client";

// import Link from "next/link";
// import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import Lightbox from 'react-image-lightbox';
// import 'react-image-lightbox/style.css';
// import { useEffect, useState } from "react";

// const images = [
//   "/main-assets/img/project/project1_1.png",
//   "/main-assets/img/project/project1_2.png",
//   "/main-assets/img/project/project1_3.png",
//   "/main-assets/img/project/project1_1.png",
//   "/main-assets/img/project/project1_2.png",
//   "/main-assets/img/project/project1_3.png",
// ];

// const Portfolio = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [photoIndex, setPhotoIndex] = useState(0);

//   const settings = {
//     dots: true,
//     focusOnSelect: true,
//     infinite: true,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     arrows: false,
//     centerMode: true,
//     centerPadding: "20%",
//     autoplay: true,
//     speed: 1500,
//     autoplaySpeed: 5000,
//     responsive: [
//       {
//         breakpoint: 768,
//         settings: {
//           centerMode: false,
//           centerPadding: "0%",
//           dots: true,
//         }
//       }
//     ]
//   };

//   useEffect(() => {
//     const dots = document.querySelector('.slick-dots');
//     if (dots) {
//       dots.setAttribute('role', 'tablist');
//     }
//   }, []);

//   const handleOpen = (index) => {
//     setPhotoIndex(index);
//     setIsOpen(true);
//   };

//   const handleClose = () => {
//     setIsOpen(false);
//   };

//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'auto';
//     }
//   }, [isOpen]);

//   return (
//     <div className="portfolio-area-1 space" id="project-sec">
//       <div className="container">
//         <div className="title-area text-center">
//           <span className="sub-title">
//             <img src="/main-assets/img/icon/section-subtitle-icon.svg" alt="img" />
//             Recent Work
//           </span>
//           <h2 className="sec-title">Check our latest projects</h2>
//           <p className="sec-text">
//             We are the best construction agency in the world
//           </p>
//         </div>
//         <div className="portfolio-slider1 overflow-hidden">
//           <Slider {...settings}>
//             {images.map((image, index) => (
//               <div key={index}>
//                 <div className="portfolio-card" style={{ margin: "0px 1rem" }}>
//                   <div className="portfolio-card-thumb">
//                     <img src={image} alt="img" />
//                     <button className="icon-btn popup-image" onClick={() => handleOpen(index)}>
//                       <i className="ri-eye-line"></i>
//                     </button>
//                   </div>
//                   <div className="portfolio-card-details">
//                     <div className="media-left">
//                       <span className="portfolio-card-subtitle">Building</span>
//                       <h4 className="portfolio-card-title">
//                         <Link href="/pages/innerpage/project-details">
//                           General Construction
//                         </Link>
//                       </h4>
//                       <p className="portofolio-card-text">
//                         Building since 09,01,2024
//                       </p>
//                     </div>
//                   </div>
//                   <Link href="/pages/innerpage/project-details" className="btn">
//                     Explore Service <i className="ri-arrow-right-up-line"></i>
//                   </Link>
//                 </div>
//               </div>
//             ))}
//           </Slider>
//         </div>
//       </div>
//       <div id="large-slider">
//         {isOpen && (
//           <Lightbox
//             mainSrc={images[photoIndex]}
//             nextSrc={images[(photoIndex + 1) % images.length]}
//             prevSrc={images[(photoIndex + images.length - 1) % images.length]}
//             onCloseRequest={handleClose}
//             onMovePrevRequest={() => setPhotoIndex((photoIndex + images.length - 1) % images.length)}
//             onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % images.length)}
//             enableZoom={false}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Portfolio;
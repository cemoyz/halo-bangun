import React from 'react';
import HeaderOne from '@/sections/Common/Header/HeaderOne';
import BreadcumbSeven from '@/sections/Project/BreadcumbSeven';
import Project from '@/sections/Project/Project';
import FooterTwo from '@/sections/Common/Footer/FooterTwo';
import Scroll from '@/sections/Common/Scroll';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';

export const metadata = {
  title: 'Portofolio Proyek - Halo Bangun || Jasa Arsitektur & Konstruksi',
  description: 'Galeri portofolio proyek pembangunan rumah tinggal, renovasi cafe, desain arsitektur villa, dan fasilitas umum oleh Halo Bangun.',
};

export default function PortfolioPage() {
  return (
    <>
      <HeaderOne />
      <BreadcumbSeven title="Portofolio Proyek" pageName="PORTOFOLIO" />
      <Project />
      <FooterTwo />
      <Scroll />
      <FloatingWhatsApp />
    </>
  );
}

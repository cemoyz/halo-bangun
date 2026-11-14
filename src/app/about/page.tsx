import React from 'react';
import HeaderOne from '@/sections/Common/Header/HeaderOne';
import Breadcumb from '@/sections/About/Breadcumb';
import AboutThree from '@/sections/About/AboutThree';
import WhyChooseThree from '@/sections/About/WhyChooseThree';
import ProcessThree from '@/sections/About/ProcessThree';
import Portfolio from '@/sections/Home-1/Portfolio';
import CounterThree from '@/sections/Common/Counter/CounterThree';
import TestimonialThree from '@/sections/Common/Testimonial/TestimonialThree';
import TeamThree from '@/sections/About/TeamThree/TeamThree';
import ClientThree from '@/sections/About/ClientThree';
import FooterTwo from '@/sections/Common/Footer/FooterTwo';
import Scroll from '@/sections/Common/Scroll';
import FloatingWhatsApp from '@/components/public/FloatingWhatsApp';

export const metadata = {
  title: 'Tentang Kami - Halo Bangun || Jasa Arsitektur & Konstruksi',
  description: 'Profil perusahaan, visi misi, nilai-nilai, dan tim profesional Halo Bangun.',
};

export default function AboutPage() {
  return (
    <>
      <HeaderOne />
      <Breadcumb title="Tentang Kami" pageName="TENTANG KAMI" />
      <AboutThree />
      <WhyChooseThree />
      <ProcessThree />
      <Portfolio />
      <CounterThree />
      <TestimonialThree />
      <TeamThree />
      <ClientThree />
      <FooterTwo />
      <Scroll />
      <FloatingWhatsApp />
    </>
  );
}

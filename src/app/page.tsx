import Preloader from "~/sections/Common/Preloader";
import HeaderOne from "~/sections/Common/Header/HeaderOne";
import Hero from "~/sections/Home-1/Hero";
import About from "~/sections/Home-1/About";
import Service from "~/sections/Home-1/Service";
import Cta from "~/sections/Home-1/Cta";
import WhyChoose from "~/sections/Home-1/WhyChoose";
import Process from "~/sections/Home-1/Process";
import Portfolio from "~/sections/Home-1/Portfolio";
import CounterOne from "~/sections/Common/Counter/CounterOne";
import Testimonial from "~/sections/Home-1/Testimonial";
import Team from "~/sections/Home-1/Team";
import Client from "~/sections/Home-1/Client";
import Blog from "~/sections/Home-1/Blog";
import FooterTwo from "~/sections/Common/Footer/FooterTwo";
import Scroll from "~/sections/Common/Scroll";
import FloatingWhatsApp from "@/components/public/FloatingWhatsApp";
import { getAllLandingContent } from "@/lib/landingContent";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Halo Bangun || Jasa Arsitektur, Konstruksi & Renovasi Terpercaya",
  description: "Company Profile Publik & Sistem Manajemen Proyek Terpadu Halo Bangun (D.I. Yogyakarta, Jawa Tengah, Jawa Barat).",
};

export default async function HomePage() {
  const content = await getAllLandingContent();

  return (
    <>
      <Preloader />
      <div style={{ overflow: "hidden" }}>
        <HeaderOne />
        <Hero data={content.hero} />
        <About data={content.about} />
        <Service data={content.services} />
        <Cta data={content.cta} />
        <WhyChoose data={content.whyChoose} />
        <Process data={content.process} />
        <Portfolio />
        <CounterOne data={content.counters} />
        <Testimonial data={content.testimonials} />
        <Team />
        <Client />
        <Blog />
        <FooterTwo data={content.footer} />
        <Scroll />
        <FloatingWhatsApp phoneNumber={content.footer?.phone} />
      </div>
    </>
  );
}

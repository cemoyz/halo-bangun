import BreadcumbTen from "~/sections/Service-Details/BreadcumbTen";
import Faq from "~/sections/Service-Details/Faq";
import ServiceDetails from "~/sections/Service-Details/ServiceDetails";
import HeaderOne from "~/sections/Common/Header/HeaderOne";
import Scroll from "~/sections/Common/Scroll";
import FooterTwo from "~/sections/Common/Footer/FooterTwo";
import FloatingWhatsApp from "@/components/public/FloatingWhatsApp";
import { getAllLandingContent } from "@/lib/landingContent";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: 'Detail Layanan - Halo Bangun || Jasa Arsitektur, Bangun & Renovasi',
    description: 'Informasi lengkap layanan pembangunan rumah tinggal, renovasi, desain arsitektur dan interior terpercaya Halo Bangun.',
};

export default async function ServiceDetailsPage() {
    const content = await getAllLandingContent();

    return (
        <div style={{ overflow: 'hidden' }}>
            <HeaderOne />
            <BreadcumbTen />
            <ServiceDetails />
            <Faq />
            <FooterTwo data={content?.footer} />
            <Scroll />
            <FloatingWhatsApp phoneNumber={content?.footer?.phone} />
        </div>
    );
}

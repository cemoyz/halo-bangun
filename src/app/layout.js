export const metadata = {
  title: "Halo Bangun || Jasa Arsitektur, Konstruksi & Renovasi",
  description: "Company Profile Publik & Sistem Manajemen Proyek Terpadu (Portal Klien & ERP) Halo Bangun",
  icons: {
    icon: [
      { rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon.png" },
    ],
    apple: [
      { rel: "apple-touch-icon", sizes: "180x180", url: "/favicon.png" },
    ],
    shortcut: [
      { rel: "shortcut icon", url: "/favicon.png" },
    ],
  },
};

import "~/public/main-assets/css/fonts.css";
import "~/public/main-assets/css/bootstrap.min.css";
import "~/public/main-assets/css/bootstrap.rtl.min.css";
import "~/public/main-assets/css/fontawesome.min.css";
import "~/public/main-assets/css/nice-select.min.css";
import "~/public/main-assets/css/remixicon.css";
import "~/public/main-assets/css/slick.min.css";
import "~/public/main-assets/css/style.css";
import "~/public/main-assets/css/react-adjustment.css";
import "~/public/main-assets/css/dashboard.css";

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}

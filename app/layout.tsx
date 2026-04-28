// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "MonShop - Mode & Artisanat Africain",
    template: "%s | MonShop",
  },
  description: "Découvrez les plus belles créations de mode et d'artisanat africain. Livraison partout au Sénégal.",
  keywords: ["mode africaine", "artisanat", "wax", "boubou", "Sénégal", "boutique en ligne"],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_SN",
    siteName: "MonShop",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#1a1a2e",
                color: "#fff",
                borderRadius: "8px",
              },
              success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Heebo, IBM_Plex_Mono } from "next/font/google";
import { getTranslations } from "next-intl/server";
import { Providers } from "@/components/layout/Providers";
import "./globals.css";

const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app");
  return {
    title: `${t("name")} | ${t("tagline")}`,
    description: t("tagline"),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html dir="rtl" lang="he" suppressHydrationWarning>
      <head>
        {/* Anti-flash: apply stored theme before first paint. Content is a static string — no user input, safe from XSS. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('trustegy-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className={`${heebo.variable} ${ibmPlexMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

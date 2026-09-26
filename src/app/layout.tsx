import type { Metadata } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Naano — Find LinkedIn creators your buyers already trust",
    template: "%s · Naano",
  },
  description:
    "A B2B LinkedIn creator marketplace: match with vetted creators, brief in days, track pipeline.",
  openGraph: { siteName: "Naano", type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-base text-foreground">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "bg-card-raised! border-border! text-foreground!",
            },
          }}
        />
      </body>
    </html>
  );
}

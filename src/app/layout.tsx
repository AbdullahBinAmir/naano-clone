import type { Metadata } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import { Toaster } from "sonner";
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
  title: {
    default: "Naano — Find LinkedIn creators your buyers already trust",
    template: "%s · Naano",
  },
  description:
    "A B2B LinkedIn creator marketplace: match with vetted creators, brief in days, track pipeline.",
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

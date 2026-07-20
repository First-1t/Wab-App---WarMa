import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  weight: ["400", "600", "700"],
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "WarMa — ระบบแนะนำการจัดการทรัพยากรน้ำเพื่อการเกษตร",
  description:
    "Water Resources Management Advisor — เครื่องมือสนับสนุนการตัดสินใจด้านการจัดการน้ำสำหรับการเกษตร",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${sarabun.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800 font-[family-name:var(--font-sarabun)]">
        {children}
      </body>
    </html>
  );
}

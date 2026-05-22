import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import NavigationBar from "@/components/layout/NavigationBar";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "45 920",
});

export const metadata: Metadata = {
  title: "sukiverse",
  description: "애니메이션, J-POP, 성우 정보를 하나의 세계관에서",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background-app">
          <main className="flex flex-1 items-center justify-center">
            <div className="relative w-[39.3rem] h-[85.2rem] flex items-center justify-center border border-white rounded-2xl overflow-hidden">
              {children}
              <NavigationBar />
            </div>
          </main>
        </body>
    </html>
  );
}

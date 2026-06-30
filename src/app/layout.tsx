import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MTS Al-Amin Bintaro",
  description: "Sistem Informasi Monitoring Proses Pembelajaran Siswa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-full antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShadeFindr"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en-CA">
      <body>
        {children}
      </body>
    </html>
  );
}
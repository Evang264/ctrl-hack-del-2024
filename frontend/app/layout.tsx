"use client";

import "./globals.css";


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
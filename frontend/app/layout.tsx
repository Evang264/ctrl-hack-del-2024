"use client";

import "./globals.css";
import Navbar from "@/components/navbar";
import clsx from "clsx";
import { useState } from "react";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navbarOpen, setNavbarOpen] = useState(true);

  const toggleNavbar = () => {
    setNavbarOpen((prev) => !prev);
  };

  return (
    <html lang="en-CA">
      <body>
        <div className="">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
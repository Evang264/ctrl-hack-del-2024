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
          <header className="flex gap-x-5 mx-5 py-5 items-center fixed top-0 left-0 w-full bg-white">
            <button onClick={toggleNavbar}>
              <img className="w-8 h-8" alt="Menu icon" width="32" height="32" src="/menu.svg" />
            </button>
            <h1 className="text-3xl font-bold">BlocVote</h1>
          </header>
          <div className={clsx("h-[calc(100vh-8rem)] left-5 fixed", {"hidden": !navbarOpen})}>
            <Navbar />
          </div>
          <div className={clsx("flex px-5 gap-x-5 mt-20", { "ml-52": navbarOpen })}>
            <div className="flex-1">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

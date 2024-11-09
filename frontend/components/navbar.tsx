"use client"

import clsx from "clsx";
import { usePathname } from "next/navigation";
import localFont from 'next/font/local';

const departureMono = localFont({
  src: '../app/fonts/DepartureMono-1.422/DepartureMono-Regular.woff2',
  display: 'swap',
})

const pages = [
  {
    title: "Vote",
    href: "/vote"
  },
  {
    title: "Results Dashboard",
    href: "/results"
  },
  {
    title: "Voter's Guideline",
    href: "/guideline"
  },
  {
    title: "Settings",
    href: "/settings"
  }
]

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="bg-[#FFFAF5] rounded-xl flex flex-col pt-8 w-{1/3} h-screen fixed z-10 px-5 w-96">
      <div className="flex gap-x-4">
        <img src="/bars.svg" width="24" height="24" />
        <h1 className={clsx(departureMono.className, "text-3xl text-[#DB7500]")}>shadefindr</h1>
      </div>
      <div className="flex items-center mt-5 gap-x-2">
        <img src="/dir-icon.svg" width="20" height="80" />
        <div className="flex-1 flex flex-col gap-y-2">
          <input type="text" className="border border-black rounded-xl h-12 w-full px-2" placeholder="Choose starting point" />
          <input type="text" className="border border-black rounded-xl h-12 w-full px-2" placeholder="Choose destination" />
        </div>
        <img src="/switch.svg" width="30" height="34" />
      </div>
    </div>
  )
}
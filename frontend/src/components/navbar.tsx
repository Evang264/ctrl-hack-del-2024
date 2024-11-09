"use client"

import clsx from "clsx";
import { usePathname } from "next/navigation";

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

  console.log(pathname === pages[1].href);

  return (
    <div className="bg-[#F5F5F5] rounded-xl flex flex-col pt-8 w-48 h-full">
      {pages.map((page) => (
        <a key={page.title} href={page.href} className={clsx({"bg-[#EDEDED]": pathname === page.href}, "px-2 py-1")}>{page.title}</a>
      ))}
    </div>
  )
}
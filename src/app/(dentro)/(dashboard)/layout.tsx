'use client'
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import {useState} from "react"
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [abrirMenu, setabrirMenu]=useState(false)
  return (
    <div className="h-screen flex">

      <div className="flex-col w-[20%] md:w-[8%] bg-sky-700 hidden md:flex lg:w-[14%] xl:w-[10%] ">
        <Menu />
      </div>
        {abrirMenu && (
          <div className="fixed top-0 left-0 h-full w-[50%] bg-sky-700 z-50 md:hidden shadow-lg p-4">
                  <Menu onClose={() => setabrirMenu(false)} />
        </div>
        )}
      <div className="flex-1 flex flex-col  bg-gray-50 overflow-auto">
        <Navbar clicadoMenuAction={() => setabrirMenu(!abrirMenu)} />
        
        <main className="flex-1 p-4 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );

}

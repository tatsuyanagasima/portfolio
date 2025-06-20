"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes" 
import { cn } from "@/lib/utils"



export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (pathname.startsWith("/auth/")) {
    return null
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-main-green to-accent-yellow bg-clip-text text-transparent">
              モチログ
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="テーマ切替"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu} className="rounded-full" aria-label="メニュー">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* ナビゲーション部分はそのままでOK */}
          <nav
            className={cn(
              "absolute top-full left-0 right-0 bg-background border-b md:static md:border-0 md:bg-transparent",
              isMenuOpen ? "block" : "hidden md:block",
            )}
          >
            <ul className="container flex flex-col md:flex-row md:items-center md:space-x-8 py-4 md:py-0">
              {/* 以下、リンク一覧もそのままでOK */}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

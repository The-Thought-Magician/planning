'use client'

import React from "react"

import { useState } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="relative min-h-screen bg-background">
      <Header 
        onMobileMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <MobileNav 
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
      />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r md:block">
          <Sidebar className="h-[calc(100vh-4rem)]" />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-[calc(100vh-4rem)] overflow-auto">
            <div className="container px-4 py-4 sm:px-6 sm:py-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
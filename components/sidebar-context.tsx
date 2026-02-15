"use client"

import * as React from "react"

interface SidebarContextType {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  const toggle = React.useCallback(() => {
    setOpen((prev) => !prev)
  }, [])

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

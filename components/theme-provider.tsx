'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // On force le thème 'light' (Egghead) pour désactiver le dark mode fade
  return (
    <NextThemesProvider defaultTheme="light" forcedTheme="light" {...props}>
      {children}
    </NextThemesProvider>
  )
}

import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { PageLoader } from "@/components/ui/page-loader"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}

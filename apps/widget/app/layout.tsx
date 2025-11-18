import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"

// Use system fonts instead of Google Fonts to avoid build issues
const fontSans = {
  variable: "--font-sans",
}

const fontMono = {
  variable: "--font-mono",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

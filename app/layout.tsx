import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Türkiye Deprem İzleme Sistemi",
  description: "Türkiye ve çevresindeki deprem verilerini gerçek zamanlı izleyin.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          body {
            margin: 0;
            padding: 0;
            background-color: #1e1e1e;
            color: #e0e0e0;
            font-family: 'JetBrains Mono', monospace;
          }
          
          .nav-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 20px;
            background-color: #252525;
            border-bottom: 1px solid #333;
          }
          
          .nav-logo {
            font-size: 18px;
            font-weight: bold;
            color: #00ff00;
          }
          
          .nav-links {
            display: flex;
            gap: 20px;
          }
          
          .nav-link {
            color: #aaa;
            text-decoration: none;
            font-weight: 500;
            padding: 5px 10px;
            border-radius: 4px;
            transition: background-color 0.2s;
          }
          
          .nav-link:hover {
            background-color: #333;
            color: #00ff00;
          }
          
          .nav-link.active {
            color: #00ff00;
            background-color: #333;
          }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}

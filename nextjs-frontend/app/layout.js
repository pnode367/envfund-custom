import './globals.css'

export const metadata = {
  title: 'MERN Grant Platform',
  description: 'Grant Management Platform for Environmental Sustainability',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

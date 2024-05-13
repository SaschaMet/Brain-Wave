import './globals.scss'

import Navbar from './navbar'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" data-bs-theme="dark">
            <body>
                <Navbar />
                {children}
            </body>
        </html>
    )
}

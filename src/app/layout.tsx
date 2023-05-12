import 'bootstrap/dist/css/bootstrap.min.css';

import './globals.css'

import Navbar from './navbar'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <Navbar />
                {children}
            </body>
        </html>
    )
}

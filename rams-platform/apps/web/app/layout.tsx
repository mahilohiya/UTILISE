import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata: Metadata = {
    title: "RAMS — Ramaiah Automated Management System",
    description: "Smart campus & library automation portal for M.S. Ramaiah Institute of Technology. Manage semester-wise books, reservations, fines, and more.",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className={`${inter.variable} ${lora.variable}`}>
            <body className="font-sans antialiased">{children}</body>
        </html>
    );
}

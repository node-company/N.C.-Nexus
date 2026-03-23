import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
    title: "SaaS de Gestão | Antigravity",
    description: "Gestão Empresarial com Inteligência Artificial",
    verification: {
        other: {
            "facebook-domain-verification": "fq0uiux06q9m4th2bpqskf5e5y081l",
        },
    },
};

import MetaPixel from "@/components/analytics/MetaPixel";
import { Suspense } from "react";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body>
                <Suspense fallback={null}>
                    <MetaPixel />
                </Suspense>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}

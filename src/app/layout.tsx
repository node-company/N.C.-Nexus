import type { Metadata } from "next";
import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
    title: "Nexus - Gestão Empresarial Inteligente",
    description: "O Nexus é o sistema de gestão ideal para pequenos negócios. Controle seu estoque, vendas e fluxo de caixa em menos de 30 segundos de forma simples e segura.",
    keywords: ["gestão empresarial", "saas de gestão", "controle de estoque", "pdv online", "fluxo de caixa", "nexus"],
    authors: [{ name: "Nexus" }],
    creator: "Nexus",
    publisher: "Nexus",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        title: "Nexus - Gestão Empresarial Inteligente",
        description: "Controle seu negócio de forma simples e rápida com o Nexus. Vendas, estoque e financeiro em um só lugar.",
        url: "https://nexus.nodecompany.com.br",
        siteName: "Nexus",
        locale: "pt_BR",
        type: "website",
        images: [
            {
                url: "/nc-nexus-logo.png",
                width: 1200,
                height: 630,
                alt: "Nexus - Gestão Empresarial",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Nexus - Gestão Empresarial Inteligente",
        description: "Controle seu estoque, vendas e fluxo de caixa de forma simples e rápida com o Nexus.",
        images: ["/nc-nexus-logo.png"],
    },
    verification: {
        other: {
            "facebook-domain-verification": "fq0uiux06q9m4th2bpqskf5e5y081l",
        },
    },
    robots: {
        index: true,
        follow: true,
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

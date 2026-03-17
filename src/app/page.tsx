"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Box, CheckCircle2, LayoutDashboard, ShieldCheck, Users, Zap, TrendingUp, AlertTriangle, X, Package, Wallet, FileText, Smartphone, Star, Calculator, ChevronDown, ChevronUp, Minus, Plus, Printer } from "lucide-react";

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showStickyNav, setShowStickyNav] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowStickyNav(true);
            } else {
                setShowStickyNav(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Intersection Observer for Reveal Animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        const revealElements = document.querySelectorAll('.animate-reveal');
        revealElements.forEach(el => observer.observe(el));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            revealElements.forEach(el => observer.unobserve(el));
        };
    }, []);

    const scrollToPricing = () => {
        const element = document.getElementById('pricing');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToFeatures = () => {
        const element = document.getElementById('features');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToHowItWorks = () => {
        const element = document.getElementById('how-it-works');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToTestimonials = () => {
        const element = document.getElementById('testimonials');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <main style={{ background: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'var(--font-main)' }}>

            {/* Navbar */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem 2rem',
                maxWidth: '1200px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 60 }}>
                    <div style={{ width: '160px', filter: 'brightness(1.1)' }}>
                        <img src="/nc-nexus-logo.png" alt="NC Nexus" style={{ width: '100%', height: 'auto' }} />
                    </div>
                </div>

                {/* Desktop Menu */}
                <div className="mobile-hidden" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <button onClick={scrollToFeatures} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontWeight: 500 }}>Funcionalidades</button>
                    <button onClick={scrollToPricing} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontWeight: 500 }}>Preços</button>
                    <button onClick={scrollToHowItWorks} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontWeight: 500 }}>Como funciona</button>
                    <button onClick={scrollToTestimonials} style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontWeight: 500 }}>Depoimentos</button>
                    
                    <Link href="/portal">
                        <Button
                            style={{
                                background: 'rgba(0, 255, 127, 0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(0, 255, 127, 0.2)',
                                color: '#00FF7F',
                                fontWeight: 700,
                                padding: '0 1.5rem',
                                borderRadius: '10px',
                                transition: 'all 0.3s ease'
                            }}
                            className="hover:bg-[#00FF7F] hover:text-black hover:scale-105"
                        >
                            Entrar
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="desktop-hidden" style={{ position: 'relative', zIndex: 60 }}>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'transparent', border: 'none', color: 'white' }}>
                        {mobileMenuOpen ? <X size={28} /> : <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ width: '28px', height: '2px', background: 'white' }}></span>
                            <span style={{ width: '28px', height: '2px', background: 'white' }}></span>
                            <span style={{ width: '28px', height: '2px', background: 'white' }}></span>
                        </div>}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div style={{
                        position: 'fixed', inset: 0, background: '#0f172a', zIndex: 55,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem',
                        padding: '2rem', animation: 'fadeIn 0.2s ease-out'
                    }}>
                        <button onClick={() => { scrollToFeatures(); setMobileMenuOpen(false); }} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.25rem' }}>Funcionalidades</button>
                        <button onClick={() => { scrollToPricing(); setMobileMenuOpen(false); }} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.25rem' }}>Preços</button>
                        <button onClick={() => { scrollToHowItWorks(); setMobileMenuOpen(false); }} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.25rem' }}>Como funciona</button>
                        <button onClick={() => { scrollToTestimonials(); setMobileMenuOpen(false); }} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.25rem' }}>Depoimentos</button>
                        
                        <Link href="/portal" style={{ width: '100%' }}>
                            <Button
                                onClick={() => setMobileMenuOpen(false)}
                                style={{                                    background: 'rgba(0, 255, 127, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(0, 255, 127, 0.2)',
                                    color: '#00FF7F',
                                    fontWeight: 800,
                                    padding: '1.5rem 3rem',
                                    fontSize: '1.25rem',
                                    width: '100%',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease'
                                }}>
                                Entrar
                            </Button>
                        </Link>
                    </div>
                )}
            </nav>

            {/* Sticky Mobile Nav */}
            <div className={`sticky-nav ${showStickyNav ? 'visible' : ''}`}>
                <div style={{ width: '120px' }}>
                    <img src="/nc-nexus-logo.png" alt="NC Nexus" style={{ width: '100%', height: 'auto' }} />
                </div>
                <Button 
                    onClick={scrollToPricing}
                    style={{ 
                        background: '#00FF7F', 
                        color: 'black', 
                        fontWeight: 800, 
                        fontSize: '0.85rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px'
                    }}
                >
                    Começar Agora
                </Button>
            </div>

            {/* Hero Section */}
            <section className="mobile-padding mobile-px-1 section-spacing" style={{
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Glows */}
                <div style={{ position: 'absolute', top: '10%', left: '20%', width: '400px', height: '400px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }} />
                <div style={{ position: 'absolute', top: '20%', right: '20%', width: '300px', height: '300px', background: 'rgba(0, 255, 127, 0.1)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0 }} />

                <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto' }}>

                    <h1 style={{
                        fontSize: 'clamp(2.8rem, 10vw, 4rem)',
                        fontWeight: 900,
                        lineHeight: 1.05,
                        marginBottom: '1.5rem',
                        letterSpacing: '-0.04em',
                        color: 'white'
                    }}>
                        Você vendeu hoje.<br />
                        <span style={{ color: '#4ade80' }}>Mas sabe quanto sobrou?</span>
                    </h1>

                    <p style={{ fontSize: '1rem', color: '#94a3b8', maxWidth: '640px', margin: '0 auto 2rem', lineHeight: 1.7, fontWeight: 400 }}>
                        O Nexus registra sua venda, abate do estoque e atualiza seu caixa — tudo ao mesmo tempo, em menos de 30 segundos. Sem planilha. Sem caderno. Sem adivinhação.
                    </p>

                    <div className="animate-reveal reveal-up" style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        justifyContent: 'center', 
                        gap: '1rem', 
                        marginBottom: '3rem',
                        color: '#4ade80',
                        fontSize: '0.95rem',
                        fontWeight: 600
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(74, 222, 128, 0.1)', padding: '0.5rem 1rem', borderRadius: '99px' }}>
                            <Package size={16} /> Estoque automático
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(74, 222, 128, 0.1)', padding: '0.5rem 1rem', borderRadius: '99px' }}>
                            <Wallet size={16} /> Caixa em tempo real
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(74, 222, 128, 0.1)', padding: '0.5rem 1rem', borderRadius: '99px' }}>
                            <FileText size={16} /> Recibo gerado na hora
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(74, 222, 128, 0.1)', padding: '0.5rem 1rem', borderRadius: '99px' }}>
                            <Smartphone size={16} /> Funciona no celular
                        </span>
                    </div>

                    <div className="mobile-stack animate-reveal reveal-up" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginBottom: '5rem' }}>
                        <Button
                            onClick={scrollToPricing}
                            size="lg"
                            style={{
                                height: '72px',
                                padding: '0 3rem',
                                fontSize: '1.25rem',
                                background: '#00FF7F',
                                color: '#000',
                                border: 'none',
                                fontWeight: 800,
                                borderRadius: '12px'
                            }}
                            className="pulse-primary hover:scale-105 transition-transform"
                        >
                            Começar teste grátis e sair das planilhas →
                        </Button>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.95rem', color: '#cbd5e1', fontWeight: 500, marginBottom: '0.25rem' }}>
                                Escolha o plano agora — cobrança só inicia após 7 dias de teste
                            </p>
                        </div>
                    </div>

                    {/* Dashboard Mockup - App Video/GIF */}
                    <div className="mobile-scale-110" style={{
                        borderRadius: '24px',
                        border: '8px solid #1e293b',
                        background: '#0f172a',
                        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                        position: 'relative',
                        maxWidth: '1000px',
                        margin: '0 auto',
                    }}>
                        <img 
                            src="/Imagens%20app/Venda em menos de 30 segundos.gif" 
                            alt="Demonstração do Sistema Nexus" 
                            style={{ width: '100%', height: 'auto', display: 'block' }} 
                        />
                        <div className="mobile-text-xs" style={{ 
                            position: 'absolute', 
                            bottom: '1rem', 
                            right: '1rem', 
                            background: 'rgba(0, 255, 127, 0.1)', 
                            backdropFilter: 'blur(10px)',
                            padding: '0.5rem 1rem',
                            borderRadius: '99px',
                            border: '1px solid rgba(0, 255, 127, 0.2)',
                            color: '#00FF7F',
                            fontSize: '0.8rem',
                            fontWeight: 700
                        }}>
                            Venda real em 30 segundos
                        </div>
                    </div>

                </div>
            </section>

            <hr className="section-divider" />

            {/* Problem Section */}
            <section id="problem" className="section-spacing" style={{ background: '#0B1121' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                            Se você se viu em alguma dessas situações,<br />
                            <span style={{ color: '#f87171' }}>o Nexus foi feito pra você</span>
                        </h2>
                    </div>

                    <div className="mobile-stack animate-reveal reveal-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                        <FeatureCard
                            icon={<span style={{ fontSize: '1.5rem' }}>1️⃣</span>}
                            title="Vendi bastante, mas não sei pra onde foi o dinheiro"
                            description="Você fecha o mês com a sensação de que vendeu bem, mas o saldo no banco não bate. Sem controle de fluxo de caixa, você nunca sabe de verdade se está lucrando."
                            alert={true}
                        />
                        <FeatureCard
                            icon={<span style={{ fontSize: '1.5rem' }}>2️⃣</span>}
                            title="Prometi entrega e o produto já tinha acabado no estoque"
                            description="Seu vendedor fechou a venda. Na hora de separar, o produto tinha acabado."
                            alert={true}
                        />
                        <FeatureCard
                            icon={<span style={{ fontSize: '1.5rem' }}>3️⃣</span>}
                            title="Vendi por um preço que achei bom. Depois descobri que estava no prejuízo"
                            description="Sem calculadora de preço, você define valores no feeling e perde margem."
                            alert={true}
                        />
                    </div>

                    <div className="mobile-stack" style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        justifyContent: 'space-around', 
                        gap: '2rem',
                        padding: '3rem',
                        background: 'rgba(15, 23, 42, 0.5)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        textAlign: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>73%</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>dos pequenos negócios fecham nos primeiros 5 anos</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f87171', marginBottom: '0.5rem' }}>Nº 1</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Motivo: falta de controle financeiro</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00FF7F', marginBottom: '0.5rem' }}>R$ 0</div>
                            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>é o custo de descobrir isso tarde</div>
                        </div>
                    </div>
                </div>
            </section>

            <hr className="section-divider" />

            {/* Solution Section */}
            <section id="solution" className="section-spacing">
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="mobile-stack animate-reveal reveal-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                                E se cada venda já fizesse <span style={{ color: '#4ade80' }}>tudo sozinha?</span>
                            </h2>
                            <p style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '2.5rem', lineHeight: 1.7 }}>
                                Com o Nexus, você registra uma venda e o sistema cuida do resto: abate do estoque, entra no caixa, gera o recibo e salva no histórico.
                            </p>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'white', listStyle: 'none', padding: 0 }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem' }}>
                                    <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '0.25rem', borderRadius: '50%' }}><CheckCircle2 size={20} color="#4ade80" /></div>
                                    Venda em menos de 30 segundos
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem' }}>
                                    <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '0.25rem', borderRadius: '50%' }}><CheckCircle2 size={20} color="#4ade80" /></div>
                                    Estoque atualizado automaticamente
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem' }}>
                                    <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '0.25rem', borderRadius: '50%' }}><CheckCircle2 size={20} color="#4ade80" /></div>
                                    Caixa sempre correto
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem' }}>
                                    <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '0.25rem', borderRadius: '50%' }}><CheckCircle2 size={20} color="#4ade80" /></div>
                                    Recibo gerado na hora
                                </li>
                            </ul>
                        </div>
                        <div style={{
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            padding: '1.5rem',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <img 
                                src="/Imagens%20app/Dashboard Inicial.webp" 
                                alt="Dashboard Nexus" 
                                style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} 
                            />
                        </div>
                    </div>
                </div>
            </section>

            <hr className="section-divider" />

            {/* Features Section (Recursos) */}
            <section id="features" className="section-spacing" style={{ background: '#0f172a' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                            Um sistema completo. <span style={{ color: '#00FF7F' }}>Um preço justo.</span>
                        </h2>
                    </div>
                    <div className="mobile-grid-2 animate-reveal reveal-up" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '1rem',
                        maxWidth: '1200px',
                        margin: '0 auto'
                    }}>
                        <FeatureItem icon={<Zap size={20} color="#00FF7F" />} title="Registro de Vendas" description="Venda em segundos no PDV." />
                        <FeatureItem icon={<FileText size={20} color="#00FF7F" />} title="Recibo Automático" description="Gere recibos PDF na hora." />
                        <FeatureItem icon={<Box size={20} color="#00FF7F" />} title="Estoque por Variação" description="Tamanho, cor e modelos." />
                        <FeatureItem icon={<AlertTriangle size={20} color="#00FF7F" />} title="Aviso de Estoque Baixo" description="Nunca fique sem produtos." />
                        <FeatureItem icon={<Wallet size={20} color="#00FF7F" />} title="Fluxo de Caixa" description="Entradas e saídas em tempo real." />
                        <FeatureItem icon={<Users size={20} color="#00FF7F" />} title="Controle de Fiado" description="Gestão de vendas a prazo." />
                        <FeatureItem icon={<FileText size={20} color="#00FF7F" />} title="Orçamentos" description="Envie propostas profissionais." />
                        <FeatureItem icon={<Calculator size={20} color="#00FF7F" />} title="Calculadora de Preço" description="Defina sua margem real." />
                        <FeatureItem icon={<LayoutDashboard size={20} color="#00FF7F" />} title="Catálogo Online" description="Sua loja na internet." />
                        <FeatureItem icon={<Users size={20} color="#00FF7F" />} title="Base de Clientes" description="Histórico completo de compras." />
                        <FeatureItem icon={<ShieldCheck size={20} color="#00FF7F" />} title="Multi-contas Equipe" description="Acessos controlados por nível." />
                        <FeatureItem icon={<BarChart3 size={20} color="#00FF7F" />} title="Relatórios Completos" description="Tudo o que você precisa ver." />
                    </div>
                </div>
            </section>

            <hr className="section-divider" />

            {/* Price Calculator Highlight */}
            <section className="section-spacing" style={{ background: '#0B1121', position: 'relative', overflow: 'hidden' }}>
                <div className="glow-blob" style={{ bottom: '-10%', left: '-5%', width: '400px', height: '400px' }} />
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                                Você sabe o preço certo pra cobrar <span style={{ color: '#f87171' }}>sem vender no prejuízo?</span>
                            </h2>
                            <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2rem' }}>
                                A maioria dos empresários define o preço "pelo olho". O Nexus usa fórmulas matemáticas para calcular exatamente quanto você precisa cobrar para cobrir custos, impostos e garantir sua margem de lucro real.
                            </p>
                            
                            {/* Mobile-only Image - Appears between text and button */}
                            <div className="desktop-hidden" style={{
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                borderRadius: '24px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                padding: '1rem',
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                marginBottom: '2rem',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <img 
                                    src="/Imagens%20app/Calculadora%20de%20preço%20ideal.webp" 
                                    alt="Calculadora de Preço Nexus" 
                                    style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} 
                                />
                            </div>

                            <Button
                                onClick={scrollToPricing}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid #00FF7F',
                                    color: '#00FF7F',
                                    fontWeight: 700,
                                    padding: '1.5rem 2.5rem',
                                    borderRadius: '12px',
                                    width: '100%',
                                    maxWidth: 'fit-content'
                                }}
                                className="hover:bg-[#00FF7F] hover:color-black transition-all"
                            >
                                Começar agora grátis
                            </Button>
                        </div>
                        <div className="mobile-hidden" style={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            padding: '1.5rem',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <img 
                                src="/Imagens%20app/Calculadora%20de%20preço%20ideal.webp" 
                                alt="Calculadora de Preço Nexus" 
                                style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} 
                            />
                        </div>
                    </div>
                </div>
            </section>

            <hr className="section-divider" />

            {/* Reports Section */}
            <section id="reports" className="section-spacing" style={{ background: '#0f172a' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                            Seu negócio em números.<br />
                            <span style={{ color: '#00FF7F' }}>Sem você fazer nada.</span>
                        </h2>
                        <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.6 }}>
                            Cada venda registrada atualiza automaticamente todos os seus relatórios financeiros.
                        </p>
                    </div>

                    <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                        <ReportVisual type="fluxo" title="Fluxo de Caixa" icon={<Wallet size={24} color="#00FF7F" />} />
                        <ReportVisual type="vendas" title="Vendas por Período" icon={<TrendingUp size={24} color="#60a5fa" />} />
                        <ReportVisual type="dre" title="DRE Automático" icon={<BarChart3 size={24} color="#f87171" />} />
                        <ReportVisual type="ranking" title="Ranking de Produtos" icon={<Box size={24} color="#fbbf24" />} />
                    </div>
                </div>
            </section>

            <hr className="section-divider" />

            {/* Team Management Section */}
            <section className="section-spacing" style={{ background: '#0B1121' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="mobile-stack" style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
                                Sua equipe vende mais.<br />
                                <span style={{ color: '#00FF7F' }}>Você sabe quanto cada um fez.</span>
                            </h2>
                            <p style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                                O Nexus permite que você crie contas separadas para seus vendedores. Você controla o que cada um pode ver e acompanha a produtividade em tempo real.
                            </p>

                            {/* Mobile Visual (Visible only on mobile, between text and topics) */}
                            <div className="desktop-hidden" style={{ marginBottom: '2.5rem' }}>
                                <div className="mobile-padding-small mobile-scale-90" style={{
                                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                                    borderRadius: '32px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    padding: '2.5rem',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    minHeight: '200px'
                                }}>
                                    <Users size={120} color="#00FF7F" opacity={0.15} />
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ display: 'flex', gap: '-1rem' }}>
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="mobile-avatar-size mobile-avatar-overlap" style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#1e293b', border: '4px solid #0B1121', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: i > 1 ? '-20px' : 0 }}>
                                                    <Users size={32} color="#00FF7F" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <StepItem number="1" title="Criar conta administrador" description="Você tem controle total sobre o sistema." />
                                <StepItem number="2" title="Convidar equipe" description="Crie acessos limitados para seus vendedores." />
                                <StepItem number="3" title="Cada vendedor registra vendas" description="O sistema identifica quem fez cada venda." />
                                <StepItem number="4" title="Relatório por vendedor automático" description="Calcule comissões sem dor de cabeça." />
                            </div>
                        </div>
                        <div className="mobile-hidden" style={{ flex: 1, position: 'relative' }}>
                            <div className="mobile-padding-small mobile-scale-90" style={{
                                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                                borderRadius: '32px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                padding: '3rem',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}>
                                <Users size={120} color="#00FF7F" opacity={0.2} />
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', gap: '-1rem' }}>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="mobile-avatar-size mobile-avatar-overlap" style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#1e293b', border: '4px solid #0B1121', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: i > 1 ? '-20px' : 0 }}>
                                                <Users size={32} color="#00FF7F" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <hr className="section-divider" />

            {/* Comparison Table Section */}
            <section className="section-spacing" style={{ background: '#0f172a' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                            Compare antes de decidir.
                        </h2>
                    </div>

                    <div className="mobile-hidden">
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <th style={{ padding: '1.5rem', textAlign: 'left', color: '#94a3b8' }}>Recurso</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>Planilha Excel</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>Caderno</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(0, 255, 127, 0.05)', color: '#00FF7F' }}>Nexus</th>
                                </tr>
                            </thead>
                            <tbody>
                                <ComparisonRow label="Registro de vendas" excel="Lento" notebook="Manual" nexus="30 Segundos" />
                                <ComparisonRow label="Estoque automático" excel="❌ manual" notebook="❌ não tem" nexus="✅ Sim" />
                                <ComparisonRow label="Geração de recibo" excel="❌ não tem" notebook="❌ manual" nexus="✅ Automático" />
                                <ComparisonRow label="Controle de fiado" excel="Confuso" notebook="Risco de perda" nexus="✅ Organizado" />
                                <ComparisonRow label="Relatórios" excel="Complexo" notebook="❌ impossível" nexus="✅ Em Tempo Real" />
                                <ComparisonRow label="Multi-contas" excel="❌ não tem" notebook="❌ não tem" nexus="✅ Sim" />
                                <ComparisonRow label="Catálogo online" excel="❌ não tem" notebook="❌ não tem" nexus="✅ Incluso" />
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List (Visible only on mobile) */}
                    <div className="desktop-hidden" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <ComparisonCard label="Registro de vendas" excel="Lento" notebook="Manual" nexus="30 Segundos" />
                        <ComparisonCard label="Estoque automático" excel="❌ manual" notebook="❌ não tem" nexus="✅ Sim" />
                        <ComparisonCard label="Geração de recibo" excel="❌ não tem" notebook="❌ manual" nexus="✅ Automático" />
                        <ComparisonCard label="Controle de fiado" excel="Confuso" notebook="Risco de perda" nexus="✅ Organizado" />
                        <ComparisonCard label="Relatórios" excel="Complexo" notebook="❌ impossível" nexus="✅ Em Tempo Real" />
                        <ComparisonCard label="Multi-contas" excel="❌ não tem" notebook="❌ não tem" nexus="✅ Sim" />
                        <ComparisonCard label="Catálogo online" excel="❌ não tem" notebook="❌ não tem" nexus="✅ Incluso" />
                    </div>
                </div>
            </section>

            <hr className="section-divider" />

            {/* Onboarding Section */}
            <section id="onboarding" className="section-spacing" style={{ background: '#0B1121' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                            Mais facilidade e controle para a sua <span style={{ color: '#00FF7F' }}>gestão</span>
                        </h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8rem' }}>
                        <HowItWorksStep 
                            number="1" 
                            title="Dashboard Tudo-em-Um" 
                            description="Tenha uma visão clara do seu negócio assim que entrar. O dashboard do Nexus organiza suas vendas, estoque e financeiro em um só lugar."
                            imgSrc="/Imagens%20app/Dashboard Inicial.webp"
                            icon={<LayoutDashboard size={40} color="#00FF7F" />}
                        />
                        <HowItWorksStep 
                            number="2" 
                            title="Venda em Segundos" 
                            description="Nosso PDV foi feito para ser o mais rápido do mercado. Registre produtos, aplique descontos e conclua a venda em menos de 30 segundos."
                            imgSrc="/Imagens%20app/Sistema de Venda.webp"
                            imageAlign="left"
                            icon={<Zap size={40} color="#00FF7F" />}
                        />
                        <HowItWorksStep 
                            number="3" 
                            title="Gestão de Estoque Inteligente" 
                            description="Controle variações de tamanho, cor e modelos. Receba alertas automáticos quando o estoque estiver baixo para nunca perder uma venda."
                            imgSrc="/Imagens%20app/Controle de Estoque.webp"
                            icon={<Box size={40} color="#00FF7F" />}
                        />
                        <HowItWorksStep 
                            number="4" 
                            title="Confirmação e Recibos" 
                            description="Venda realizada com sucesso! Gere recibos profissionais em PDF e envie para seus clientes instantaneamente."
                            imgSrc="/Imagens%20app/Venda Realizada.webp"
                            imageAlign="left"
                            icon={<CheckCircle2 size={40} color="#00FF7F" />}
                        />
                    </div>
                </div>
            </section>

            <hr className="section-divider" />

            {/* Mobile Section */}
            <section className="section-spacing" style={{ background: '#0f172a' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="mobile-stack" style={{ display: 'flex', gap: '4rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                                Sua loja <span style={{ color: '#00FF7F' }}>no bolso.</span>
                            </h2>

                            {/* Mobile Visual (Visible only on mobile, between title and description) */}
                            <div className="desktop-hidden" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                                <div style={{
                                    width: '280px',
                                    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)',
                                    position: 'relative',
                                    borderRadius: '40px',
                                    border: '8px solid #334155',
                                    overflow: 'hidden'
                                }}>
                                    <img 
                                        src="/Imagens%20app/Mobile 1.webp" 
                                        alt="Nexus Mobile" 
                                        style={{ width: '100%', height: 'auto', display: 'block' }} 
                                    />
                                </div>
                            </div>

                            <p style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.7 }}>
                                O Nexus foi feito para rodar liso no seu celular. Registre vendas, cadastre produtos e veja seu financeiro de qualquer lugar.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: 'white', fontWeight: 600 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#00FF7F" /> Nova venda</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#00FF7F" /> Novo produto</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#00FF7F" /> Novo cliente</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#00FF7F" /> Financeiro</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle2 size={18} color="#00FF7F" /> Estoque</div>
                            </div>
                        </div>
                        <div className="mobile-hidden" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                            <div style={{
                                width: '300px',
                                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)',
                                position: 'relative',
                                borderRadius: '40px',
                                border: '8px solid #334155',
                                overflow: 'hidden'
                            }}>
                                <img 
                                    src="/Imagens%20app/Mobile 1.webp" 
                                    alt="Nexus Mobile" 
                                    style={{ width: '100%', height: 'auto', display: 'block' }} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <hr className="section-divider" />

            {/* Testimonials Section */}
            <section id="testimonials" className="section-spacing" style={{ background: '#0f172a' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                            Quem usa, <span style={{ color: '#00FF7F' }}>não volta pra planilha</span>
                        </h2>
                    </div>
                    <div className="mobile-stack" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <TestimonialCard 
                            index={1}
                            name="Ricardo Silva"
                            role="Dono de Autopeças"
                            content="Antes eu perdia horas conferindo estoque. Agora o Nexus faz tudo sozinho no momento da venda. É outro nível de controle."
                        />
                        <TestimonialCard 
                            index={2}
                            name="Ana Paula"
                            role="Loja de Roupas"
                            content="O sistema é muito intuitivo. Meus vendedores aprenderam a usar em minutos e o catálogo online ajudou a vender muito mais."
                        />
                        <TestimonialCard 
                            index={3}
                            name="Carlos Bebidas"
                            role="Distribuidora"
                            content="O controle de fluxo de caixa e o fiado são os melhores. Finalmente sei exatamente quanto estou lucrando no final do mês."
                        />
                    </div>
                </div>
            </section>

            <hr className="section-divider" />

            {/* Pricing Section (Planos) */}
            <section id="pricing" className="section-spacing" style={{ background: '#0B1121' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                            Um investimento que <span style={{ color: '#00FF7F' }}>se paga no primeiro mês.</span>
                        </h2>
                        <div style={{
                            background: 'rgba(0, 255, 127, 0.1)',
                            border: '1px solid rgba(0, 255, 127, 0.2)',
                            color: '#00FF7F',
                            padding: '0.5rem 1rem',
                            borderRadius: '99px',
                            display: 'inline-block',
                            marginBottom: '1rem',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}>
                            🎁 Teste grátis por 7 dias. Cancele quando quiser.
                        </div>
                    </div>

                    <div className="mobile-pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                        {/* Monthly */}
                        <PricingCard
                            title="Plano Mensal"
                            price="R$ 47"
                            period="/mês"
                            subtitle="Ideal para quem está começando"
                            features={['Acesso Completo', 'Sem fidelidade', 'Suporte via WhatsApp']}
                        />

                        {/* Annual (Best Value) */}
                        <PricingCard
                            title="Plano Anual"
                            price="R$ 24,75"
                            period="/mês"
                            subtitle="R$ 297 cobrado anualmente"
                            features={['Economia de R$ 267/ano', 'Prioridade no WhatsApp', 'Vídeo aulas para treinamento', 'Prioridade em Recursos']}
                            highlight={true}
                            badge="MAIS ECONÔMICO"
                        />

                        {/* Semiannual */}
                        <PricingCard
                            title="Plano Semestral"
                            price="R$ 32,83"
                            period="/mês"
                            subtitle="R$ 197 cobrado a cada 6 meses"
                            features={['Acesso Completo', 'Economia de 30%', 'Suporte via WhatsApp']}
                        />
                    </div>
                </div>
            </section>

            <hr className="section-divider" />

            {/* FAQ Section */}
            <section className="section-spacing" style={{ background: '#0f172a' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                            Perguntas Frequentes
                        </h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <FaqItem 
                            question="Preciso de cartão de crédito para testar?" 
                            answer="Sim. O cartão é necessário para evitar fraudes e garantir que apenas usuários reais acessem o sistema. Porém, NENHUMA cobrança será feita nos primeiros 7 dias. Você pode cancelar com um clique antes do prazo." 
                        />
                        <FaqItem 
                            question="O sistema funciona no meu celular?" 
                            answer="Sim! O Nexus foi desenhado para ser 100% responsivo. Você pode usar no computador, tablet ou celular sem perder nenhuma funcionalidade." 
                        />
                        <FaqItem 
                            question="Posso importar meus produtos de uma planilha?" 
                            answer="Sim. Temos uma ferramenta de importação fácil. Se precisar de ajuda, nosso suporte faz isso para você sem custo adicional no plano anual." 
                        />
                        <FaqItem 
                            question="O sistema emite nota fiscal?" 
                            answer="Nesta versão, o Nexus foca em gestão interna, controle de estoque, financeiro e recibos de venda (não fiscais). É ideal para MEIs e pequenas empresas que precisam de controle operacional." 
                        />
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section style={{ 
                padding: '8rem 2rem', 
                background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
                textAlign: 'center',
                borderTop: '1px solid rgba(0, 255, 127, 0.1)'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
                        Cada dia sem o Nexus é um dia <span style={{ color: '#00FF7F' }}>vendendo no escuro.</span>
                    </h2>
                    <p style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '3rem', lineHeight: 1.7 }}>
                        Veja quanto você realmente lucrou hoje. 7 dias grátis, sem comprometer nada.
                    </p>
                    <Button
                        onClick={scrollToPricing}
                        size="lg"
                        style={{
                            height: '80px',
                            padding: '0 4rem',
                            fontSize: '1.5rem',
                            background: '#00FF7F',
                            color: '#000',
                            border: 'none',
                            fontWeight: 800,
                            boxShadow: '0 20px 40px rgba(0, 255, 127, 0.2)',
                            borderRadius: '16px'
                        }}
                        className="hover:scale-105 transition-transform"
                    >
                        Começar teste grátis e sair das planilhas
                    </Button>
                    <div style={{ marginTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
                        Sua primeira cobrança será apenas após os 7 dias de teste.
                    </div>
                </div>
            </section>

            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '4rem 2rem', background: '#020617' }}>
                <div className="mobile-stack" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ width: '140px', opacity: 0.7 }}>
                        <img src="/nc-nexus-logo.png" alt="NC Nexus" style={{ width: '100%' }} />
                    </div>
                    <div className="mobile-stack" style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
                        <Link href="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>Termos de Uso</Link>
                        <Link href="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>Política de Privacidade</Link>
                    </div>
                    <div className="mobile-stack" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                        <div style={{ color: '#475569', fontSize: '0.9rem' }} className="mobile-text-center">
                            © 2024 NC Nexus. Todos os direitos reservados.
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                            <span>Desenvolvido por:</span>
                            <div style={{ height: '20px', filter: 'grayscale(1) brightness(1.5)', opacity: 0.6 }}>
                                <img src="/Logo-Node-Company.webp" alt="Node Company" style={{ height: '100%', width: 'auto' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* WhatsApp Floating Button */}
            <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: '#25D366',
                    color: 'white',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    zIndex: 100,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    textDecoration: 'none'
                }}
                className="hover:scale-110"
            >
                <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </a>
        </main>
    );
}

function FeatureCard({ icon, title, description, alert = false }: { icon: React.ReactNode, title: string, description: string, alert?: boolean }) {
    return (
        <div style={{
            background: alert ? 'rgba(239, 68, 68, 0.05)' : 'rgba(30, 41, 59, 0.4)',
            padding: '2rem',
            borderRadius: '16px',
            border: alert ? '1px solid rgba(239, 68, 68, 0.1)' : '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            transition: 'transform 0.2s'
        }}
            className="hover:translate-y-[-5px]"
        >
            <div style={{ background: alert ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', width: 'fit-content', padding: '1rem', borderRadius: '12px', marginBottom: '0.5rem' }}>
                {icon}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>{title}</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{description}</p>
        </div>
    )
}

function ListItem({ children }: { children: React.ReactNode }) {
    return (
        <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
                background: 'rgba(0, 255, 127, 0.1)',
                borderRadius: '50%',
                padding: '4px',
                display: 'flex'
            }}>
                <CheckCircle2 size={16} color="#00FF7F" />
            </div>
            <span style={{ fontSize: '1.05rem' }}>{children}</span>
        </li>
    )
}

function WhatsAppReview({ name, message, time }: { name: string, message: string, time: string }) {
    return (
        <div style={{
            background: '#0f172a',
            borderRadius: '16px',
            border: '1px solid #1e293b',
            overflow: 'hidden',
            fontFamily: 'sans-serif'
        }}>
            {/* Header WhatsApp Style */}
            <div style={{ background: '#075e54', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', background: '#ccc', borderRadius: '50%' }}></div>
                <div style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>{name}</div>
            </div>
            {/* Body */}
            <div style={{ padding: '1.5rem', backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'cover' }}>
                <div style={{
                    background: '#fff',
                    color: '#111',
                    padding: '0.75rem 1rem',
                    borderRadius: '0 12px 12px 12px',
                    maxWidth: '90%',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    position: 'relative',
                    fontSize: '0.95rem',
                    lineHeight: 1.4
                }}>
                    {message}
                    <div style={{ fontSize: '0.7rem', color: '#999', textAlign: 'right', marginTop: '4px' }}>{time}</div>
                </div>
            </div>
        </div>
    )
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>{question}</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.6 }}>{answer}</p>
        </div>
    )
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="mobile-padding-small" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem', padding: '1.25rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{
                minWidth: '32px',
                background: 'rgba(0, 255, 127, 0.1)',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {React.cloneElement(icon as React.ReactElement, { size: 18 })}
            </div>
            <div>
                <h3 className="mobile-text-sm" style={{ fontWeight: 700, fontSize: '0.875rem', color: 'white', marginBottom: '0.2rem', lineHeight: 1.2 }}>{title}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.3 }} className="mobile-hidden">{description}</p>
            </div>
        </div>
    )
}

function ReportVisual({ title, icon, type }: { title: string, icon: React.ReactNode, type: 'fluxo' | 'vendas' | 'dre' | 'ranking' }) {
    const renderVisual = () => {
        switch (type) {
            case 'fluxo': // Based on Relatórios 1.webp (Saldo em Caixa)
                return (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', borderRadius: '16px' }}>
                        <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '0.75rem', color: 'white', fontWeight: 600 }}>Saldo em Caixa</div>
                        <div style={{ flex: 1, padding: '1rem', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                            <div style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', textAlign: 'center', zIndex: 1 }}>
                                <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Saldo do Período</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>R$ 1.800,00</div>
                            </div>
                            <svg width="100%" height="80" viewBox="0 0 100 40" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d="M0 40 L0 30 Q10 10 20 25 T40 15 T60 30 T80 5 T100 5 L100 40 Z" fill="url(#blueGrad)" />
                                <path d="M0 30 Q10 10 20 25 T40 15 T60 30 T80 5 T100 5" fill="none" stroke="#3b82f6" strokeWidth="1" />
                            </svg>
                        </div>
                    </div>
                );
            case 'vendas': // Based on Relatórios 4.webp (Evolução de Vendas)
                return (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', borderRadius: '16px' }}>
                         <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '0.75rem', color: 'white', fontWeight: 600 }}>Evolução de Vendas</div>
                         <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Total Vendido</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>R$ 2.170,00</div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '8%', paddingBottom: '0.5rem' }}>
                                {[70, 30, 0, 40, 35, 0].map((h, i) => (
                                    <div key={i} style={{ flex: 1, height: h === 0 ? '2px' : `${h}%`, background: h > 0 ? '#4ade80' : 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                                ))}
                            </div>
                         </div>
                    </div>
                );
            case 'dre': // Based on Relatórios 3.webp (Vendas por Equipe)
                return (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', borderRadius: '16px' }}>
                        <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '0.75rem', color: 'white', fontWeight: 600 }}>Vendas por Equipe</div>
                        <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Comissões Pagas</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>R$ 135,00</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ height: '24px', background: '#7c3aed', borderRadius: '4px', width: '90%' }}></div>
                                <div style={{ height: '24px', background: '#7c3aed', borderRadius: '4px', width: '55%' }}></div>
                            </div>
                        </div>
                    </div>
                );
            case 'ranking': // Based on Relatórios 2.webp (Produtos Mais Vendidos)
                return (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', borderRadius: '16px' }}>
                        <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '0.75rem', color: 'white', fontWeight: 600 }}>Produtos Mais Vendidos</div>
                        <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Itens Vendidos</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>10</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {[100, 100, 100, 50, 50, 50, 50].map((w, i) => (
                                    <div key={i} style={{ height: '14px', background: '#ec4899', borderRadius: '2px', width: `${w}%` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            padding: '1.25rem',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            height: '100%',
            transition: 'all 0.3s ease'
        }} className="hover:border-[#00FF7F]/30 hover:translate-y-[-4px]">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    padding: '0.6rem', 
                    borderRadius: '12px', 
                    display: 'flex',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    {icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>{title}</h3>
            </div>
            
            <div style={{ 
                flex: 1, 
                background: '#020617', 
                borderRadius: '18px', 
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.05)',
                minHeight: '180px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                position: 'relative'
            }}>
                <div style={{ transform: 'scale(1)', transformOrigin: 'center' }} className="mobile-scale-90">
                    {renderVisual()}
                </div>
            </div>
        </div>
    )
}

function StepItem({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{
                width: '32px',
                height: '32px',
                background: 'rgba(0, 255, 127, 0.1)',
                color: '#00FF7F',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                flexShrink: 0
            }}>
                {number}
            </div>
            <div>
                <h4 style={{ fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>{title}</h4>
                <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>{description}</p>
            </div>
        </div>
    )
}

function ComparisonRow({ label, excel, notebook, nexus }: { label: string, excel: string, notebook: string, nexus: string }) {
    return (
        <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <td style={{ padding: '1.5rem', color: '#cbd5e1', fontWeight: 500 }}>{label}</td>
            <td style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>{excel}</td>
            <td style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>{notebook}</td>
            <td style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(0, 255, 127, 0.05)', color: 'white', fontWeight: 600 }}>{nexus}</td>
        </tr>
    )
}

function ComparisonCard({ label, excel, notebook, nexus }: { label: string, excel: string, notebook: string, nexus: string }) {
    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            borderRadius: '20px',
            padding: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <h4 style={{ color: 'white', fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{label}</h4>
            
            <div style={{ 
                background: 'rgba(0, 255, 127, 0.08)', 
                borderRadius: '12px', 
                padding: '0.85rem', 
                border: '1px solid rgba(0, 255, 127, 0.2)',
                position: 'relative'
            }}>
                <div style={{ fontSize: '0.65rem', color: '#00FF7F', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Nexus</div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '1.05rem' }}>{nexus}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Excel</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{excel}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.2rem' }}>Caderno</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>{notebook}</div>
                </div>
            </div>
        </div>
    )
}

function TestimonialCard({ name, role, content, index }: { name: string, role: string, content: string, index: number }) {
    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            padding: '2rem',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="#00FF7F" color="#00FF7F" />)}
            </div>
            <p style={{ color: '#cbd5e1', fontStyle: 'italic', lineHeight: 1.6 }}>"{content}"</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    background: '#334155', 
                    borderRadius: '50%',
                    border: '2px solid rgba(0, 255, 127, 0.3)',
                    overflow: 'hidden'
                }}>
                    <img 
                        src={`/Imagens%20usu%C3%A1rios%20depoimentos/Depoimento-${index}.webp`}
                        alt={name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                <div>
                    <div style={{ fontWeight: 700, color: 'white' }}>{name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{role}</div>
                </div>
            </div>
        </div>
    )
}


function StepCard({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
            <div style={{
                width: '64px',
                height: '64px',
                background: '#0f172a',
                border: '2px solid #00FF7F',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#00FF7F',
                margin: '0 auto 1.5rem',
                boxShadow: '0 0 20px rgba(0, 255, 127, 0.2)'
            }}>
                {number}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'white', marginBottom: '0.75rem' }}>{title}</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{description}</p>
        </div>
    )
}

function PricingCard({ title, price, period, features, highlight = false, badge, subtitle }: { title: string, price: string, period: string, features: string[], highlight?: boolean, badge?: string, subtitle?: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubscribe = () => {
        setLoading(true);
        // Pixel: Initiate Checkout
        // @ts-ignore
        if (typeof window !== 'undefined' && window.fbq) {
            // @ts-ignore
            window.fbq('track', 'InitiateCheckout');
        }

        router.push(`/checkout?plan=${title}`);
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const plan = searchParams.get("checkout_plan");
        if (plan === title) {
            handleSubscribe();
        }
    }, [title]);

    if (highlight) {
        return (
            <div className="mobile-pricing-reset" style={{
                position: 'relative',
                transform: 'scale(1.05)',
                boxShadow: '0 25px 50px -12px rgba(0, 255, 127, 0.25)',
                margin: '20px 0',
                borderRadius: '24px',
                zIndex: 10
            }}>
                {badge && (
                    <div style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#00FF7F',
                        color: '#000',
                        padding: '0.35rem 1.25rem',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        zIndex: 30,
                        boxShadow: '0 4px 12px rgba(0, 255, 127, 0.3)',
                        letterSpacing: '0.02em'
                    }}>
                        {badge}
                    </div>
                )}
                <div className="animated-border" style={{ borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                    <div className="animated-border-content" style={{ borderRadius: '23px', padding: '2.5rem', paddingTop: '2.5rem', background: '#0B1121' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#00FF7F', marginBottom: '1rem' }}>{title}</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem' }}>
                                <span className="mobile-pricing-price" style={{ fontSize: '3rem', fontWeight: 800, color: 'white' }}>{price}</span>
                                <span style={{ color: '#94a3b8' }}>{period}</span>
                            </div>
                            {subtitle && <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 500 }}>{subtitle}</p>}
                        </div>

                        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
                            {features.map((feature, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e2e8f0' }}>
                                    <CheckCircle2 size={18} color="#00FF7F" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            onClick={handleSubscribe}
                            disabled={loading}
                            style={{
                                width: '100%',
                                height: '56px',
                                background: '#00FF7F',
                                color: '#000',
                                fontWeight: 800,
                                border: 'none',
                                borderRadius: '12px'
                            }}
                        >
                            {loading ? "Processando..." : "TESTAR GRÁTIS AGORA"}
                        </Button>
                        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginTop: '0.75rem' }}>
                            Cobrança só inicia após 7 dias de teste.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mobile-pricing-card" style={{
            background: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '2.5rem',
            paddingTop: badge ? '3.5rem' : '2.5rem',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {badge && (
                <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#00FF7F',
                    color: '#000',
                    padding: '0.35rem 1.25rem',
                    borderRadius: '99px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    zIndex: 20,
                    boxShadow: '0 4px 12px rgba(0, 255, 127, 0.3)',
                    letterSpacing: '0.02em'
                }}>
                    {badge}
                </div>
            )}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: highlight ? '#00FF7F' : '#94a3b8', marginBottom: '1rem' }}>{title}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem' }}>
                    <span className="mobile-pricing-price" style={{ fontSize: '3rem', fontWeight: 800, color: 'white' }}>{price}</span>
                    <span style={{ color: '#94a3b8' }}>{period}</span>
                </div>
                {subtitle && <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem', fontWeight: 500 }}>{subtitle}</p>}
            </div>

            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem', flex: 1 }}>
                {features.map((feature, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#e2e8f0' }}>
                        <CheckCircle2 size={18} color={highlight ? "#00FF7F" : "#94a3b8"} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <Button
                onClick={handleSubscribe}
                disabled={loading}
                style={{
                    width: '100%',
                    height: '56px',
                    background: highlight ? '#00FF7F' : 'rgba(255,255,255,0.1)',
                    color: highlight ? '#000' : 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    border: 'none',
                    borderRadius: '12px',
                    textTransform: 'uppercase'
                }}
                className={highlight ? 'hover:scale-105 transition-transform' : 'hover:bg-white/20'}
            >
                {loading ? 'Processando...' : 'TESTAR GRÁTIS AGORA'}
            </Button>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginTop: '0.75rem' }}>
                Cobrança só inicia após 7 dias de teste.
            </p>
        </div>
    );
}


function HowItWorksStep({ number, title, description, imageAlign = 'right', icon, imgSrc }: { number: string, title: string, description: string, imageAlign?: 'left' | 'right', icon: React.ReactNode, imgSrc?: string }) {
    const renderVisual = () => {
        if (number === "1") { // Based on Dashboard Inicial.webp
            return (
                <div style={{ position: 'relative', width: '320px', height: '240px' }} className="animate-float">
                    {/* Main Window */}
                    <div style={{ position: 'absolute', inset: 0, background: '#020617', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                        <div style={{ height: '30px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 10px', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }}></div>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }}></div>
                        </div>
                        <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                            {[
                                { t: 'VENDAS HOJE', v: 'R$ 360', c: '#4ade80' },
                                { t: 'ESTOQUE', v: '109', c: '#fbbf24' },
                                { t: 'SALDO ATUAL', v: 'R$ 4.112', c: '#3b82f6' },
                                { t: 'CLIENTES', v: '1', c: '#a78bfa' }
                            ].map((card, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '0.5rem', color: '#94a3b8', marginBottom: '4px' }}>{card.t}</div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: card.c }}>{card.v}</div>
                                </div>
                            ))}
                        </div>
                        {/* Area Chart Mockup */}
                        <div style={{ padding: '0 12px 12px', height: '80px', display: 'flex', alignItems: 'flex-end' }}>
                             <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                                <path d="M0 40 Q25 35 35 38 T50 10 T75 35 T100 20 L100 40 L0 40" fill="rgba(0, 255, 127, 0.1)" />
                                <path d="M0 40 Q25 35 35 38 T50 10 T75 35 T100 20" fill="none" stroke="#00FF7F" strokeWidth="1" />
                             </svg>
                        </div>
                    </div>
                </div>
            );
        }

        if (number === "2") { // Based on Sistema de Venda.webp
            return (
                <div style={{ position: 'relative', width: '340px', height: '260px' }} className="animate-float">
                    <div style={{ position: 'absolute', inset: 0, background: '#020617', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', overflow: 'hidden' }}>
                        {/* Sidebar */}
                        <div style={{ width: '40px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '10px 0', gap: '12px', alignItems: 'center' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#7c3aed' }}></div>
                            {[...Array(5)].map((_, i) => <div key={i} style={{ width: '16px', height: '2px', background: 'rgba(255,255,255,0.1)' }}></div>)}
                        </div>
                        {/* Product Grid */}
                        <div style={{ flex: 1, padding: '10px' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Vendas</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', position: 'relative' }}>
                                        {i === 2 && <div style={{ position: 'absolute', inset: '4px', background: '#00FF7F', borderRadius: '4px', opacity: 0.2 }}></div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Cart Side */}
                        <div style={{ width: '100px', background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(255,255,255,0.05)', padding: '10px' }}>
                            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', marginBottom: '10px' }}>CARRINHO</div>
                            <div style={{ height: '10px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '4px' }}></div>
                            <div style={{ height: '10px', width: '70%', background: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}></div>
                            <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                                <div style={{ height: '24px', background: '#00FF7F', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 800, color: '#000' }}>FINALIZAR</div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (number === "3") { // Based on Alerta de estoque baixo.webp
            return (
                <div style={{ position: 'relative', width: '300px' }} className="animate-float">
                    <div style={{ background: '#020617', borderRadius: '18px', border: '1px solid rgba(248, 113, 113, 0.2)', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <AlertTriangle size={24} color="#f87171" />
                            <h4 style={{ color: '#f87171', fontWeight: 700, fontSize: '1.1rem' }}>Estoque Baixo</h4>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                { n: 'Plaqueta', q: 'Restam: 0' },
                                { n: 'Dinst de Braço', q: 'Restam: 3' },
                                { n: 'Coturno Coyote', q: 'Restam: 2' }
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}></div>
                                        <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 500 }}>{item.n}</span>
                                    </div>
                                    <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 600 }}>{item.q}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
        }

        if (number === "4") {
            return (
                <div style={{
                    width: '280px',
                    background: '#111827',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '2.5rem',
                    boxShadow: '0 30px 60px -12px rgba(0,0,0,0.6)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.75rem',
                    position: 'relative',
                    fontFamily: 'sans-serif'
                }} className="animate-float">
                    <div style={{ 
                        background: 'rgba(5, 150, 105, 0.2)', 
                        padding: '1.25rem', 
                        borderRadius: '50%',
                        border: '2px solid #10b981'
                    }}>
                        <CheckCircle2 size={48} color="#10b981" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h4 style={{ color: 'white', fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Venda realizada!</h4>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500 }}>Venda rápida realizada</p>
                    </div>
                    
                    <div style={{ 
                        width: '100%', 
                        padding: '1.25rem', 
                        background: 'rgba(255,255,255,0.03)', 
                        borderRadius: '16px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 600 }}>Total:</span>
                        <span style={{ color: '#10b981', fontWeight: 800, fontSize: '1.2rem' }}>R$ 297,00</span>
                    </div>

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ 
                            width: '100%', 
                            height: '52px', 
                            borderRadius: '12px', 
                            background: '#1f2937',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: '#60a5fa', 
                            fontWeight: 700,
                            fontSize: '0.95rem', 
                            gap: '0.5rem',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                           <Printer size={18} /> Ver Recibo
                        </div>
                        <div style={{ 
                            width: '100%', 
                            height: '52px', 
                            borderRadius: '12px', 
                            background: '#7c3aed', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white', 
                            fontWeight: 800, 
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                        }}>
                           + Novo Pedido
                        </div>
                    </div>
                </div>
            )
        }

        return null;
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: imageAlign === 'right' ? 'row' : 'row-reverse',
            alignItems: 'center',
            gap: '4rem',
            textAlign: 'left'
        }} className="mobile-stack">

            {/* Text Side */}
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: '#00FF7F',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: '#0f172a'
                    }}>
                        {number}
                    </div>
                    <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>{title}</h3>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }} className="mobile-padding-0">
                    {description}
                </p>
            </div>

            {/* Visual Side */}
            <div style={{ flex: 1, width: '100%', position: 'relative' }}>
                <style>{`
                    @keyframes float {
                        0% { transform: translateY(0px) rotate(0deg); }
                        50% { transform: translateY(-10px) rotate(1deg); }
                        100% { transform: translateY(0px) rotate(0deg); }
                    }
                    .animate-float {
                        animation: float 6s ease-in-out infinite;
                    }
                `}</style>
                <div style={{
                    width: '100%',
                    minHeight: '380px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}>
                    {/* Decorative Background Blob */}
                    <div style={{
                        position: 'absolute',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(0, 255, 127, 0.08) 0%, transparent 70%)',
                        zIndex: 0
                    }}></div>
                    
                    <div style={{ zIndex: 1, transform: 'scale(1)', transformOrigin: 'center' }} className="mobile-scale-75">
                        {renderVisual()}
                    </div>
                </div>
            </div>
        </div>
    )
}


"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Box, CheckCircle2, LayoutDashboard, ShieldCheck, Users, Zap, TrendingUp, AlertTriangle } from "lucide-react";

export default function LandingPage() {
    const scrollToPricing = () => {
        const element = document.getElementById('pricing');
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
                <div style={{ width: '180px', filter: 'brightness(1.1)' }}>
                    <img src="/nc-nexus-logo.png" alt="NC Nexus" style={{ width: '100%' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link href="/portal">
                        <Button variant="ghost" style={{ color: '#cbd5e1' }}>Entrar</Button>
                    </Link>
                    <Button
                        onClick={scrollToPricing}
                        style={{
                            background: 'transparent',
                            border: '1px solid #00FF7F',
                            color: '#00FF7F',
                            fontWeight: 600
                        }}>
                        Começar Grátis
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                textAlign: 'center',
                padding: '6rem 2rem 4rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Glows */}
                <div style={{ position: 'absolute', top: '10%', left: '20%', width: '400px', height: '400px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', filter: 'blur(100px)', zIndex: 0 }} />
                <div style={{ position: 'absolute', top: '20%', right: '20%', width: '300px', height: '300px', background: 'rgba(0, 255, 127, 0.1)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 0 }} />

                <div style={{ position: 'relative', zIndex: 10, maxWidth: '1000px', margin: '0 auto' }}>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                        fontWeight: 900,
                        lineHeight: 1.1,
                        marginBottom: '2rem',
                        letterSpacing: '-0.03em',
                        color: 'white'
                    }}>
                        Transforme o Caos das Planilhas em Uma <span style={{ color: '#4ade80' }}>Máquina de Lucro Previsível.</span>
                    </h1>

                    <p style={{ fontSize: '1.25rem', color: '#cbd5e1', maxWidth: '800px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                        Centralize estoque, financeiro e vendas em um único painel inteligente. Pare de gerenciar apagando incêndios e comece a tomar decisões que colocam dinheiro no caixa. Simples, rápido e feito para quem não tem tempo a perder.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '5rem' }}>
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
                                boxShadow: '0 0 30px rgba(0, 255, 127, 0.4)',
                                fontWeight: 800,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                            className="hover:scale-105 transition-transform"
                        >
                            COMEÇAR MEU TESTE GRÁTIS AGORA {">>"}
                        </Button>
                        <span style={{ fontSize: '0.9rem', color: '#94a3b8', opacity: 0.8 }}>
                            Teste grátis por 7 dias. Cancele quando quiser.
                        </span>
                    </div>

                    {/* Dashboard Mockup - CSS CSS Only */}
                    <div style={{
                        borderRadius: '12px',
                        border: '8px solid #1e293b',
                        background: '#0f172a',
                        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                        position: 'relative',
                        aspectRatio: '16/9',
                        maxWidth: '1000px',
                        margin: '0 auto',
                        display: 'flex'
                    }}>
                        {/* Fake Sidebar */}
                        <div style={{ width: '200px', background: '#1e293b', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ height: '24px', width: '70%', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                            <div style={{ height: '16px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '2rem' }}></div>
                            <div style={{ height: '16px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                            <div style={{ height: '16px', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                        </div>
                        {/* Fake Content */}
                        <div style={{ flex: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ height: '32px', width: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                                <div style={{ height: '32px', width: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                            </div>
                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                                <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.1)' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Vendas Hoje</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#00FF7F' }}>R$ 12.450,00</div>
                                </div>
                                <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pedidos</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white' }}>45</div>
                                </div>
                                <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Lucro Líquido</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#60a5fa' }}>R$ 4.280,00</div>
                                </div>
                                <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.1)' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Estoque Baixo</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f87171' }}>3 Itens</div>
                                </div>
                            </div>
                            {/* Chart */}
                            <div style={{ flex: 1, background: '#1e293b', borderRadius: '8px', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(0,255,127,0.1), transparent)' }}></div>
                                {/* Simple CSS Line Chart */}
                                <svg style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                    <path d="M0,150 C100,100 200,160 300,80 S500,100 600,20" fill="none" stroke="#00FF7F" strokeWidth="3" />
                                </svg>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Agitation Section - The 3 Symptoms */}
            <section style={{ padding: '6rem 2rem', background: '#0B1121' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                            Os 3 Sintomas de que Você Está <span style={{ color: '#f87171' }}>Perdendo Dinheiro</span>
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <FeatureCard
                            icon={<AlertTriangle size={36} color="#ef4444" />}
                            title="Vendas recorde, caixa vazio?"
                            description="Você vende o almoço para comprar o jantar. Sem relatórios precisos, seu lucro some em despesas invisíveis e você nem percebe."
                            alert={true}
                        />
                        <FeatureCard
                            icon={<Box size={36} color="#fbbf24" />}
                            title="Estoque parado ou cliente sem produto?"
                            description="O pesadelo de perder venda por falta de item ou ter milhares de reais empatados em mercadoria encalhada comendo poeira."
                            alert={true}
                        />
                        <FeatureCard
                            icon={<BarChart3 size={36} color="#fbbf24" />}
                            title="Gerenciando no 'achômetro'?"
                            description="Decidir compra e preço baseada na intuição é a receita para falir. Sem dados, você está pilotando um avião de olhos vendados."
                            alert={true}
                        />
                    </div>
                </div>
            </section>

            {/* Solutions / Personas Section */}
            <section style={{ padding: '6rem 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                            Feito sob medida para o seu modelo
                        </h2>
                    </div>

                    {/* Varejo */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center', marginBottom: '8rem' }}>
                        <div>
                            <div style={{ color: '#00FF7F', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Varejo e Lojas</div>
                            <h3 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Venda com a certeza de que o estoque bate.</h3>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1' }}>
                                <ListItem>Cruzamento automático de Vendas x Estoque.</ListItem>
                                <ListItem>Baixa imediata no ato da venda.</ListItem>
                                <ListItem>Controle unitário para itens de valor agregado.</ListItem>
                            </ul>
                        </div>
                        <div style={{
                            background: '#1e293b',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            padding: '1rem',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                        }}>
                            {/* CSS Animation Mockup for Retail */}
                            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '1.5rem', height: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
                                    <span style={{ fontWeight: 600 }}>Nova Venda</span>
                                    <span style={{ color: '#00FF7F' }}>Confirmado</span>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', background: '#334155', borderRadius: '4px' }}></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ height: '10px', width: '80%', background: '#475569', borderRadius: '4px', marginBottom: '4px' }}></div>
                                        <div style={{ height: '8px', width: '40%', background: '#334155', borderRadius: '4px' }}></div>
                                    </div>
                                    <span style={{ fontWeight: 600 }}>-1 un</span>
                                </div>
                                <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', marginTop: 'auto' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Estoque Atualizado</div>
                                    <div style={{ fontWeight: 600, color: '#60a5fa' }}>49 unidades restantes</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Serviços */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center', direction: 'rtl' }}>
                        <div style={{ direction: 'ltr' }}>
                            <div style={{ color: '#60a5fa', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Serviços e Projetos</div>
                            <h3 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Gerencie sua equipe externa e interna.</h3>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e1' }}>
                                <ListItem>Cálculo automático de comissões na hora.</ListItem>
                                <ListItem>Agenda e controle de ordens de serviço.</ListItem>
                                <ListItem>Saiba exatamente qual funcionário é mais lucrativo.</ListItem>
                            </ul>
                        </div>

                        <div style={{
                            background: '#1e293b',
                            borderRadius: '16px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            padding: '1rem',
                            direction: 'ltr',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                        }}>
                            {/* CSS Animation Mockup for Services */}
                            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '1.5rem', height: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontWeight: 600 }}>Colaboradores</span>
                                </div>
                                {[1, 2].map(i => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '1rem', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#475569' }}></div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Tec. {i}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#00FF7F' }}>Em atendimento</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Comissão</div>
                                            <div style={{ fontWeight: 600 }}>R$ {i * 150},00</div>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ marginTop: 'auto', textAlign: 'center', padding: '0.5rem', background: '#00FF7F', color: '#000', fontWeight: 600, borderRadius: '4px' }}>
                                    Calculado Automaticamente
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section (Recursos) */}
            <section style={{ padding: '6rem 2rem', background: '#0f172a' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                            Tudo o que você precisa em um só lugar
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                            Substitua 5 ferramentas diferentes pelo NC Nexus.
                        </p>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem',
                        maxWidth: '1000px',
                        margin: '0 auto'
                    }}>
                        <FeatureItem icon={<Box size={24} color="#00FF7F" />} title="Controle de Estoque" description="Gestão de grades, custo médio e baixa automática." />
                        <FeatureItem icon={<Users size={24} color="#00FF7F" />} title="Gestão de Equipe" description="Controle de acessos, comissões e produtividade." />
                        <FeatureItem icon={<BarChart3 size={24} color="#00FF7F" />} title="Financeiro Completo" description="Contas a pagar, receber, DRE e fluxo de caixa." />
                        <FeatureItem icon={<TrendingUp size={24} color="#00FF7F" />} title="Relatórios Inteligentes" description="Saiba exatamente onde está seu lucro." />
                        <FeatureItem icon={<Zap size={24} color="#00FF7F" />} title="PDV Ágil" description="Frente de caixa rápido que funciona em qualquer tela." />
                        <FeatureItem icon={<ShieldCheck size={24} color="#00FF7F" />} title="Multi-lojas" description="Gerencie todas as suas filiais em um único painel." />
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section style={{ padding: '6rem 2rem', background: '#0B1121' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                            Como Funciona
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                            Simples de configurar, poderoso para usar.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', maxWidth: '1000px', margin: '0 auto' }}>

                        <HowItWorksStep
                            number="1"
                            title="Cadastre seu Catálogo"
                            description="Cadastre seus produtos com fotos e preços, ou defina seus serviços. Tudo pronto em poucos cliques para começar a operar."
                            imageAlign="right"
                            icon={<Box size={64} color="#00FF7F" />}
                        />

                        <HowItWorksStep
                            number="2"
                            title="Organize seu Estoque"
                            description="Faça a contagem inicial, defina custos e deixe o sistema gerenciar as baixas automaticamente a cada venda."
                            imageAlign="left"
                            icon={<BarChart3 size={64} color="#3b82f6" />}
                        />

                        <HowItWorksStep
                            number="3"
                            title="Conecte sua Equipe"
                            description="Crie logins individuais para cada funcionário. Defina quem pode ver o financeiro e quem pode apenas vender."
                            imageAlign="right"
                            icon={<Users size={64} color="#ec4899" />}
                        />

                        <HowItWorksStep
                            number="4"
                            title="Venda e Controle"
                            description="Realize vendas no PDV em segundos e veja seu painel administrativo ser atualizado em tempo real. Controle total."
                            imageAlign="left"
                            icon={<Zap size={64} color="#fbbf24" />}
                        />

                    </div>
                </div>
            </section>

            {/* Pricing Section (Planos) */}
            <section id="pricing" style={{ padding: '6rem 2rem', background: '#0f172a' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                            Planos que cabem no seu bolso
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
                            🎁 Experimente grátis por 7 dias. Sem compromisso.
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                            Escolha a melhor opção para o seu momento.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
                        {/* Monthly */}
                        {/* Monthly */}
                        <PricingCard
                            title="Mensal"
                            price="R$ 47,00"
                            period="/mês"
                            subtitle="Cobrado todo mês"
                            features={['Acesso Completo', 'Suporte Prioritário', 'Sem Fidelidade']}
                        />

                        {/* Annual (Best Value) */}
                        <PricingCard
                            title="Anual"
                            price="R$ 24,75"
                            period="/mês"
                            subtitle="R$ 297,00 cobrado anualmente"
                            features={['Acesso Completo', 'Economia de 47%', 'Suporte VIP via WhatsApp', 'Treinamento Exclusivo']}
                            highlight={true}
                            badge="MAIS POPULAR"
                        />

                        {/* Semiannual */}
                        <PricingCard
                            title="Semestral"
                            price="R$ 32,83"
                            period="/mês"
                            subtitle="R$ 197,00 cobrado semestralmente"
                            features={['Acesso Completo', 'Economia de 30%', 'Suporte Prioritário']}
                        />
                    </div>
                    <div style={{ marginTop: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={16} /> Pagamento 100% seguro via Stripe. Cancele a qualquer momento.
                    </div>
                </div>
            </section>

            {/* Testimonials Section (Realistic Style) */}
            <section style={{ padding: '6rem 2rem', background: '#0f172a' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                            Quem usa, <span style={{ color: '#00FF7F' }}>cresce de verdade.</span>
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                            Histórias reais de quem saiu do caos para a organização.
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <WhatsAppReview
                            name="Ricardo Silva"
                            message="Cara, só passando pra agradecer. Fechei o caixa de ontem em 10 minutos, antes levava 2 horas. O Nexus salvou minha vida kkkk"
                            time="14:20"
                        />
                        <WhatsAppReview
                            name="Ana Paula (Estética)"
                            message="Menino, o controle das comissões é perfeito! As meninas pararam de reclamar que a conta tava errada. Obrigada pela paciência na instalação 🙏"
                            time="09:15"
                        />
                        <WhatsAppReview
                            name="Carlos Bebidas"
                            message="Tava desconfiado que tavam me roubando no estoque. Com o sistema peguei a falha na hora. Já se pagou no primeiro mês."
                            time="18:45"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section style={{ padding: '6rem 2rem', background: '#0B1121' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                            Dúvidas Frequentes do Dono
                        </h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <FaqItem
                            question="Preciso instalar alguma coisa no meu computador?"
                            answer="Não! O NC Nexus é 100% online. Você acessa pelo navegador do seu computador, tablet ou celular, de onde estiver."
                        />
                        <FaqItem
                            question="É difícil de configurar? Tenho medo de não conseguir usar."
                            answer="O sistema foi desenhado para quem não é expert em tecnologia. O cadastro é simples e em 5 minutos você já está usando."
                        />
                        <FaqItem
                            question="Funciona para empresas de serviços também?"
                            answer="Sim! Temos módulos específicos para ordens de serviço, agendamentos e controle de comissões de equipe."
                        />
                        <FaqItem
                            question="E se minha internet cair?"
                            answer="O sistema salva seus dados automaticamente. Assim que a conexão voltar, tudo sincroniza. Você não perde nada."
                        />
                    </div>
                </div>
            </section>

            {/* Footer CTA Agressive */}
            <section style={{
                padding: '8rem 2rem',
                textAlign: 'center',
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0) 0%, rgba(0, 255, 127, 0.05) 100%)'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                        Ainda gerenciando sua empresa como um amador?
                    </h2>
                    <p style={{ fontSize: '1.25rem', color: '#94a3b8', marginBottom: '3rem' }}>
                        Junte-se a centenas de empresários que profissionalizaram seus negócios.
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
                            boxShadow: '0 20px 25px -5px rgba(0, 255, 127, 0.3)',
                            textTransform: 'uppercase'
                        }}
                        className="hover:scale-105 transition-transform"
                    >
                        COMEÇAR MEU TESTE GRÁTIS AGORA {">>"}
                    </Button>
                    <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={16} /> Teste Premium de 7 Dias.
                    </p>
                </div>
            </section>

            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '4rem 2rem', background: '#020617' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ width: '140px', opacity: 0.7 }}>
                        <img src="/nc-nexus-logo.png" alt="NC Nexus" style={{ width: '100%' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
                        <Link href="/terms" style={{ textDecoration: 'none', color: 'inherit' }}>Termos de Uso</Link>
                        <Link href="/privacy" style={{ textDecoration: 'none', color: 'inherit' }}>Política de Privacidade</Link>
                    </div>
                    <div style={{ color: '#475569', fontSize: '0.9rem' }}>
                        © 2024 NC Nexus. Todos os direitos reservados.
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
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>{question}</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{answer}</p>
        </div>
    )
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', padding: '1.25rem', background: 'rgba(30, 41, 59, 0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{
                minWidth: '40px',
                background: 'rgba(0, 255, 127, 0.1)',
                padding: '12px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
            <div>
                <h3 style={{ fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>{title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{description}</p>
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

    return (
        <div style={{
            background: highlight ? 'linear-gradient(180deg, rgba(0, 255, 127, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)' : 'rgba(30, 41, 59, 0.4)',
            border: highlight ? '2px solid #00FF7F' : '1px solid rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '2.5rem',
            position: 'relative',
            transform: highlight ? 'scale(1.05)' : 'scale(1)',
            boxShadow: highlight ? '0 25px 50px -12px rgba(0, 255, 127, 0.15)' : 'none',
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
                    padding: '0.25rem 1rem',
                    borderRadius: '99px',
                    fontSize: '0.8rem',
                    fontWeight: 700
                }}>
                    {badge}
                </div>
            )}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: highlight ? '#00FF7F' : '#94a3b8', marginBottom: '1rem' }}>{title}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '3rem', fontWeight: 800, color: 'white' }}>{price}</span>
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
    )
}

function HowItWorksStep({ number, title, description, imageAlign = 'right', icon }: { number: string, title: string, description: string, imageAlign?: 'left' | 'right', icon: React.ReactNode }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: imageAlign === 'right' ? 'row' : 'row-reverse',
            alignItems: 'center',
            gap: '4rem',
            textAlign: 'left'
        }} className="flex-col md:flex-row">

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
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6, paddingLeft: 'calc(40px + 1rem)' }}>
                    {description}
                </p>
            </div>

            {/* Visual Side */}
            <div style={{ flex: 1, width: '100%' }}>
                <div style={{
                    width: '100%',
                    height: '280px',
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at center, rgba(0, 255, 127, 0.05), transparent 70%)'
                    }}></div>

                    <div style={{
                        padding: '2rem',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    )
}


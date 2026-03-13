"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Calculator, DollarSign, Percent, TrendingUp, X, Save, Box, AlertCircle } from "lucide-react";

interface PricingCalculatorProps {
    initialProductCost?: number;
    onApplyPrice?: (price: number, cost: number) => void;
    onClose?: () => void;
    isModal?: boolean;
}

export function PricingCalculator({ initialProductCost = 0, onApplyPrice, onClose, isModal = false }: PricingCalculatorProps) {
    // 1. Custos Fixos da Empresa
    const [monthlyExpenses, setMonthlyExpenses] = useState<number>(0);
    const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);

    // 2. Taxas e Impostos Gerais
    const [taxPisCofins, setTaxPisCofins] = useState<number>(0);
    const [taxOther, setTaxOther] = useState<number>(0);

    // 3. Custos Variáveis do Produto
    const [unitCost, setUnitCost] = useState<number>(initialProductCost);
    const [freightCost, setFreightCost] = useState<number>(0);
    const [additionalCost, setAdditionalCost] = useState<number>(0);

    // 4. Taxas Variáveis do Produto
    const [taxIpi, setTaxIpi] = useState<number>(0);
    const [taxIcms, setTaxIcms] = useState<number>(0);
    const [cardFee, setCardFee] = useState<number>(0);
    const [commission, setCommission] = useState<number>(0);

    // 5. Margem Pretendida
    const [desiredMargin, setDesiredMargin] = useState<number>(20);

    // Load saved data on mount
    useEffect(() => {
        const savedData = localStorage.getItem("pricing_calculator_config");
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.monthlyExpenses) setMonthlyExpenses(parsed.monthlyExpenses);
                if (parsed.monthlyRevenue) setMonthlyRevenue(parsed.monthlyRevenue);
                if (parsed.taxPisCofins) setTaxPisCofins(parsed.taxPisCofins);
                if (parsed.taxOther) setTaxOther(parsed.taxOther);
                if (parsed.cardFee) setCardFee(parsed.cardFee);
                if (parsed.commission) setCommission(parsed.commission);
            } catch (e) {
                console.error("Error loading saved pricing config", e);
            }
        }
    }, []);

    // Save general data
    const saveConfig = () => {
        const config = {
            monthlyExpenses,
            monthlyRevenue,
            taxPisCofins,
            taxOther,
            cardFee,
            commission
        };
        localStorage.setItem("pricing_calculator_config", JSON.stringify(config));
        alert("Configurações da empresa salvas com sucesso!");
    };

    // Calculations
    const fixedCostPercentage = monthlyRevenue > 0 ? (monthlyExpenses / monthlyRevenue) * 100 : 0;
    const totalVariableTaxesPercentage = taxPisCofins + taxOther + taxIpi + taxIcms + cardFee + commission;
    const totalProductCost = (unitCost || 0) + (freightCost || 0) + (additionalCost || 0);

    // Markup = 100 / (100 - %CustoFixo - %DespesasVariaveis - %Margem)
    const divisor = 100 - fixedCostPercentage - totalVariableTaxesPercentage - desiredMargin;

    let markup = 0;
    let recommendedPrice = 0;
    let expectedProfit = 0;
    const isImpossible = divisor <= 0;

    if (!isImpossible && totalProductCost > 0) {
        markup = 100 / divisor;
        recommendedPrice = totalProductCost * markup;
        expectedProfit = recommendedPrice * (desiredMargin / 100);
    }

    const inputStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        color: 'white',
        width: '100%',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.2s',
        fontFamily: 'inherit'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#9ca3af',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        marginBottom: '0.5rem'
    };

    const handleApply = () => {
        if (onApplyPrice && recommendedPrice > 0) {
            onApplyPrice(recommendedPrice, totalProductCost);
        }
    };

    return (
        <div className={!isModal ? "glass-panel" : ""} style={{
            padding: isModal ? '1.5rem' : 'var(--panel-padding, 2rem)',
            borderRadius: '16px',
            animation: 'fadeIn 0.5s ease',
            color: 'white',
            maxWidth: isModal ? '100%' : '1200px',
            margin: '0 auto',
            position: 'relative',
            // @ts-ignore
            '--panel-padding': '2rem'
        }}>
            <style jsx>{`
                @media (max-width: 768px) {
                    .calculator-header { margin-bottom: 1.5rem !important; padding-right: 40px !important; }
                    .calculator-grid { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
                    .section-card { padding: 1.25rem !important; }
                    .inner-grid { grid-template-columns: 1fr !important; }
                    .results-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
                    .result-card-main { padding: 1.5rem !important; }
                    div { --panel-padding: 1rem !important; }
                    .modal-close-btn { top: 1rem !important; right: 1rem !important; }
                }
            `}</style>

            <div className="calculator-header" style={{ display: 'flex', flexDirection: 'column', marginBottom: '2rem' }}>
                <h2 className="responsive-title" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calculator size={24} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    Calculadora Ideal
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: 0 }}>
                    Descubra o preço de venda com base nos custos e na margem desejada.
                </p>

                {isModal && onClose && (
                    <Button 
                        variant="ghost" 
                        type="button" 
                        onClick={onClose} 
                        className="modal-close-btn"
                        style={{ 
                            position: 'absolute',
                            top: '1.5rem',
                            right: '1.5rem',
                            padding: '8px',
                            borderRadius: '50%', 
                            width: '40px', 
                            height: '40px',
                            background: 'rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10
                        }}
                    >
                        <X size={20} />
                    </Button>
                )}
            </div>

            <div className="calculator-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                {/* Lado Esquerdo - Custos e Despesas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Seção 1: Empresa */}
                    <div className="section-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                <DollarSign size={18} style={{ color: '#10b981' }} /> Dados da Empresa
                            </h3>
                            <Button variant="ghost" size="sm" onClick={saveConfig} style={{ fontSize: '0.75rem', height: '28px', background: 'rgba(255,255,255,0.05)' }}>
                                <Save size={14} style={{ marginRight: '4px' }} /> Salvar Padrão
                            </Button>
                        </div>

                        <div className="inner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Faturamento Médio (R$)</label>
                                <input type="number" inputMode="decimal" min="0" step="100" value={monthlyRevenue || ''} onChange={(e) => setMonthlyRevenue(parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="Ex: 50000" />
                            </div>
                            <div>
                                <label style={labelStyle}>Despesas Mensais (R$)</label>
                                <input type="number" inputMode="decimal" min="0" step="100" value={monthlyExpenses || ''} onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="Ex: 5000" />
                            </div>
                        </div>
                        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#a7f3d0', background: 'rgba(16, 185, 129, 0.05)', padding: '8px', borderRadius: '6px', display: 'inline-block' }}>
                            Custo Fixo sobre faturamento: <strong>{fixedCostPercentage.toFixed(2)}%</strong>
                        </div>
                    </div>

                    {/* Seção 2: Impostos e Taxas */}
                    <div className="section-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, marginBottom: '1.25rem' }}>
                            <Percent size={18} style={{ color: '#f59e0b' }} /> Impostos e Taxas Gerais (%)
                        </h3>

                        <div className="inner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Simples/PIS/COFINS</label>
                                <input type="number" inputMode="decimal" min="0" step="0.1" value={taxPisCofins || ''} onChange={(e) => setTaxPisCofins(parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="Ex: 6" />
                            </div>
                            <div>
                                <label style={labelStyle}>Outros Impostos (%)</label>
                                <input type="number" inputMode="decimal" min="0" step="0.1" value={taxOther || ''} onChange={(e) => setTaxOther(parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="Ex: 0" />
                            </div>
                            <div>
                                <label style={labelStyle}>Taxas Máquina/Plat.</label>
                                <input type="number" inputMode="decimal" min="0" step="0.1" value={cardFee || ''} onChange={(e) => setCardFee(parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="Ex: 4.99" />
                            </div>
                            <div>
                                <label style={labelStyle}>Comissão Vendas (%)</label>
                                <input type="number" inputMode="decimal" min="0" step="0.1" value={commission || ''} onChange={(e) => setCommission(parseFloat(e.target.value) || 0)} style={inputStyle} placeholder="Ex: 2" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lado Direito - Produto e Margem */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Seção 3: Custos do Produto */}
                    <div className="section-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, marginBottom: '1.25rem' }}>
                            <Box size={18} style={{ color: 'var(--color-primary)' }} /> Custos do Produto (R$)
                        </h3>
                        <div className="inner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Custo Unitário</label>
                                <input type="number" inputMode="decimal" min="0" step="0.01" value={unitCost || ''} onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Frete/Unidade</label>
                                <input type="number" inputMode="decimal" min="0" step="0.01" value={freightCost || ''} onChange={(e) => setFreightCost(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>Desp. Extras</label>
                                <input type="number" inputMode="decimal" min="0" step="0.01" value={additionalCost || ''} onChange={(e) => setAdditionalCost(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                                <span style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Custo Total</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>R$ {totalProductCost.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Seção 4: Impostos Específicos do Produto e Margem */}
                    <div className="section-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, marginBottom: '1.25rem' }}>
                            <TrendingUp size={18} style={{ color: '#3b82f6' }} /> Produto & Lucratividade
                        </h3>
                        <div className="inner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>IPI (%)</label>
                                <input type="number" inputMode="decimal" min="0" step="0.1" value={taxIpi || ''} onChange={(e) => setTaxIpi(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </div>
                            <div>
                                <label style={labelStyle}>ICMS/Outros (%)</label>
                                <input type="number" inputMode="decimal" min="0" step="0.1" value={taxIcms || ''} onChange={(e) => setTaxIcms(parseFloat(e.target.value) || 0)} style={inputStyle} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ ...labelStyle, color: '#34d399' }}>Margem de Lucro Desejada (%)</label>
                                <input type="number" inputMode="numeric" min="0" step="1" value={desiredMargin || ''} onChange={(e) => setDesiredMargin(parseFloat(e.target.value) || 0)} style={{ ...inputStyle, borderColor: 'rgba(52, 211, 153, 0.3)', background: 'rgba(52, 211, 153, 0.05)', fontSize: '1.25rem', fontWeight: 700, padding: '16px' }} placeholder="Ex: 20" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Resultado do Cálculo */}
            <div style={{ marginTop: '2.5rem', padding: '2rem', background: 'linear-gradient(145deg, rgba(var(--color-primary-rgb), 0.1) 0%, rgba(var(--color-accent-rgb), 0.05) 100%)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1.5rem 0', textAlign: 'center', color: 'white' }}>Projeção de Preço</h3>

                {isImpossible ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <AlertCircle size={40} />
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>Margem Inviável!</p>
                            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: 1.5 }}>A soma dos custos gerais ({fixedCostPercentage.toFixed(1)}%), taxas ({totalVariableTaxesPercentage.toFixed(1)}%) e margem ({desiredMargin}%) excede 100% do preço.</p>
                        </div>
                    </div>
                ) : (
                    <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.25rem', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.25rem' }}>Markup</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{markup.toFixed(3)}</span>
                        </div>

                        <div className="result-card-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)', transform: 'scale(1.05)' }}>
                            <span style={{ fontSize: '0.75rem', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.25rem' }}>Preço Recomendado</span>
                            <span style={{ fontSize: '2.25rem', fontWeight: 900, color: 'white' }}>R$ {recommendedPrice.toFixed(2)}</span>
                            <span style={{ fontSize: '0.75rem', color: '#a7f3d0', marginTop: '4px' }}>Ideal para sua margem</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.25rem', background: 'rgba(0,0,0,0.25)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.25rem' }}>Lucro / Unidade</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#60a5fa' }}>R$ {expectedProfit.toFixed(2)}</span>
                            <span style={{ fontSize: '0.75rem', color: '#93c5fd', marginTop: '4px' }}>Valor líquido</span>
                        </div>
                    </div>
                )}

                {isModal && !isImpossible && recommendedPrice > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
                        <Button onClick={handleApply} style={{ background: 'var(--color-primary)', width: '100%', maxWidth: '400px', height: '56px', fontWeight: 700, fontSize: '1.1rem', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
                            Aplicar R$ {recommendedPrice.toFixed(2)}
                        </Button>
                    </div>
                )}
            </div>

        </div>
    );
}

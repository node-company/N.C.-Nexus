"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Printer } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: any; // Using any for simplicity as it comes from parent join
    companySettings: any;
}

export function ReceiptModal({ isOpen, onClose, sale, companySettings }: ReceiptModalProps) {
    const [printing, setPrinting] = useState(false);

    useEffect(() => {
        if (isOpen && printing) {
            window.print();
            setPrinting(false);
        }
    }, [isOpen, printing]);

    if (!isOpen || !sale) return null;

    const isQuote = sale.status === 'quote';
    const title = isQuote ? 'ORÇAMENTO' : 'RECIBO DE VENDA';

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: 'white', color: 'black', width: '90%', maxWidth: '400px',
                borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                maxHeight: '90vh'
            }}>
                {/* Controls (Hidden in Print) */}
                <div className="print-hide" style={{
                    padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb'
                }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Visualizar Impressão</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setPrinting(true)} style={{
                            display: 'flex', alignItems: 'center', gap: '6px', background: '#3b82f6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600
                        }}>
                            <Printer size={16} /> Imprimir
                        </button>
                        <button onClick={onClose} style={{
                            background: '#e5e7eb', color: '#374151', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer'
                        }}>
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div id="receipt-content" style={{ padding: '2rem', overflowY: 'auto', fontFamily: '"Courier New", Courier, monospace', fontSize: '12px' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        {companySettings?.logo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={companySettings.logo_url} alt="Logo" style={{ maxHeight: '60px', marginBottom: '0.5rem', maxWidth: '100%' }} />
                        )}
                        <h2 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 4px 0', textTransform: 'uppercase' }}>{companySettings?.name || 'MINHA EMPRESA'}</h2>
                        <p style={{ margin: 0 }}>{companySettings?.address}</p>
                        <p style={{ margin: 0 }}>CNPJ: {companySettings?.cnpj} | Tel: {companySettings?.phone}</p>
                    </div>

                    <div style={{ borderBottom: '1px dashed #000', margin: '1rem 0' }} />

                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 4px 0' }}>{title} #{sale.id.slice(0, 8)}</h3>
                        <p style={{ margin: 0 }}>Data: {format(new Date(sale.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                    </div>

                    {/* Client & Seller */}
                    <div style={{ marginBottom: '1rem' }}>
                        <p style={{ margin: 0 }}><strong>Cliente:</strong> {sale.clients?.name || 'Não Identificado'}</p>
                        {sale.clients?.document && <p style={{ margin: 0 }}>CPF/CNPJ: {sale.clients.document}</p>}
                        {sale.employees?.name && <p style={{ margin: '4px 0 0 0' }}><strong>Vendedor:</strong> {sale.employees.name}</p>}
                    </div>

                    {/* Items */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #000' }}>
                                <th style={{ textAlign: 'left', padding: '4px 0' }}>Item</th>
                                <th style={{ textAlign: 'right', padding: '4px 0' }}>Qtd</th>
                                <th style={{ textAlign: 'right', padding: '4px 0' }}>Vl.Unit</th>
                                <th style={{ textAlign: 'right', padding: '4px 0' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sale.sale_items?.map((item: any) => (
                                <tr key={item.id}>
                                    <td style={{ padding: '4px 0' }}>
                                        {item.products?.name || item.services?.name || 'Item'}
                                        {item.variant_id && item.product_variants?.size && ` (${item.product_variants.size})`}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '4px 0' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right', padding: '4px 0' }}>{item.unit_price.toFixed(2)}</td>
                                    <td style={{ textAlign: 'right', padding: '4px 0' }}>{item.subtotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ borderBottom: '1px dashed #000', margin: '1rem 0' }} />

                    {/* Totals */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '14px', marginBottom: '2rem' }}>
                        <span>TOTAL A PAGAR</span>
                        <span>R$ {sale.total_amount.toFixed(2)}</span>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <p style={{ margin: 0 }}><strong>Forma de Pagamento:</strong> {sale.payment_method}</p>
                        {isQuote && <p style={{ margin: '8px 0', fontStyle: 'italic' }}>* Este orçamento é válido por 15 dias.</p>}
                    </div>

                    {/* Footer */}
                    <div style={{ textAlign: 'center', fontSize: '10px' }}>
                        <p>{companySettings?.footer_text || 'Obrigado pela preferência!'}</p>
                        <p>Gerado por Sistema SaaS</p>
                    </div>

                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    div:has(> #receipt-content), #receipt-content, #receipt-content * {
                        visibility: visible;
                    }
                    #receipt-content {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        background: white;
                        color: black;
                    }
                    .print-hide {
                        display: none !important;
                    }
                    /* Hide scrollbars in print */
                    ::-webkit-scrollbar {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}

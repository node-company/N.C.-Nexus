"use client";

import { PricingCalculator } from "@/components/calculator/PricingCalculator";

export default function CalculatorPage() {
    return (
            <div style={{ padding: 'var(--page-padding, 0 1rem)' }}>
                <style jsx>{`
                    @media (max-width: 768px) {
                        div { --page-padding: 1rem 0rem !important; }
                    }
                `}</style>
                <PricingCalculator />
            </div>
        );
    }

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductForm } from "@/components/products/ProductForm";
import { useRouter } from "next/navigation";

export default function EditProductPage({ params }: { params: { id: string } }) {
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        async function fetchProduct() {
            try {
                const { data, error } = await supabase
                    .from("products")
                    .select("*")
                    .eq("id", params.id)
                    .single();

                if (error) throw error;
                setProduct(data);
            } catch (error) {
                console.error("Error fetching product:", error);
                router.push("/dashboard/products");
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [params.id, router]);

    if (loading) {
        return <div className="text-center py-10 text-gray-400">Carregando...</div>;
    }

    if (!product) {
        return <div className="text-center py-10 text-red-400">Produto não encontrado.</div>;
    }

    return (
        <div>
            <ProductForm initialData={product} isEdit={true} />
        </div>
    );
}

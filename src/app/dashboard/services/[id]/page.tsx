"use client";

import { ServiceForm } from "@/components/services/ServiceForm";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EditServicePage() {
    const params = useParams();
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchService() {
            if (!params.id) return;

            const { data, error } = await supabase
                .from("services")
                .select("*")
                .eq("id", params.id)
                .single();

            if (!error && data) {
                setService(data);
            }
            setLoading(false);
        }

        fetchService();
    }, [params.id]);

    if (loading) return (
        <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'gray' }}>
            Carregando serviço...
        </div>
    );

    if (!service) return (
        <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'gray' }}>
            Serviço não encontrado.
        </div>
    );

    return <ServiceForm initialData={service} isEdit={true} />;
}

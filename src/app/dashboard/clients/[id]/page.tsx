"use client";

import { ClientForm } from "@/components/clients/ClientForm";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EditClientPage() {
    const params = useParams();
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchClient() {
            if (!params.id) return;

            const { data, error } = await supabase
                .from("clients")
                .select("*")
                .eq("id", params.id)
                .single();

            if (!error && data) {
                setClient(data);
            }
            setLoading(false);
        }

        fetchClient();
    }, [params.id]);

    if (loading) return (
        <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'gray' }}>
            Carregando cliente...
        </div>
    );

    if (!client) return (
        <div style={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'gray' }}>
            Cliente não encontrado.
        </div>
    );

    return <ClientForm initialData={client} isEdit={true} />;
}

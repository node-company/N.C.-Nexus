"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, DollarSign, Clock, FileText, Tag, Briefcase } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/ImageUpload";

interface ServiceFormProps {
    initialData?: {
        id?: string;
        name: string;
        description: string;
        price: number;
        duration_minutes: number;
        image_url?: string;
        active?: boolean;
    };
    isEdit?: boolean;
}

export function ServiceForm({ initialData, isEdit = false }: ServiceFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [tempImages, setTempImages] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        price: initialData?.price || 0,
        duration_minutes: initialData?.duration_minutes || 60,
        image_url: initialData?.image_url || "",
        active: initialData?.active ?? true,
    });

    const deleteImageFromStorage = async (imageUrl: string) => {
        try {
            const fileName = imageUrl.split('/').pop();
            if (!fileName) return;
            const { error } = await supabase.storage.from("company-images").remove([fileName]);
            if (error) console.error("Error deleting image:", error);
            else console.log("Deleted image:", fileName);
        } catch (err) {
            console.error("Exception deleting image:", err);
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) throw new Error("Usuário não autenticado");

            const serviceData = {
                ...formData,
                user_id: user.id,
            };

            let error;
            if (isEdit && initialData?.id) {
                // Se a imagem mudou, deletar a antiga
                if (initialData.image_url && initialData.image_url !== formData.image_url) {
                    await deleteImageFromStorage(initialData.image_url);
                }

                const { error: updateError } = await supabase
                    .from("services")
                    .update(serviceData)
                    .eq("id", initialData.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("services")
                    .insert([serviceData]);
                error = insertError;
            }

            if (error) throw error;

            // Cleanup temp images (ex: user uploaded A then B, A should be deleted)
            for (const tempUrl of tempImages) {
                if (tempUrl !== formData.image_url) {
                    await deleteImageFromStorage(tempUrl);
                }
            }

            router.push("/dashboard/services");
            router.refresh();
        } catch (error) {
            console.error("Error saving service:", error);
            alert("Erro ao salvar serviço");
        } finally {
            setLoading(false);
        }
    }

    const inputStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '16px',
        color: 'white',
        width: '100%',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.2s',
        fontFamily: 'inherit'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: '#9ca3af', // gray-400
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        marginBottom: '0.5rem'
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease', padding: '1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/dashboard/services">
                        <Button variant="ghost" size="sm" type="button" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowLeft size={20} />
                        </Button>
                    </Link>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, background: 'linear-gradient(to right, white, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                            {isEdit ? "Editar Serviço" : "Novo Serviço"}
                        </h1>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                            {isEdit ? "Atualize as informações do serviço." : "Adicione um novo serviço ao seu catálogo."}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link href="/dashboard/services">
                        <Button variant="ghost" type="button" style={{ color: '#9ca3af' }}>Cancelar</Button>
                    </Link>
                    <Button type="submit" disabled={loading} style={{ minWidth: '140px', background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} style={{ marginRight: '0.5rem' }} /> Salvar</>}
                    </Button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row', flexWrap: 'wrap' }}>
                {/* Left Column: Main Info */}
                <div style={{ flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', margin: 0 }}>
                            <Briefcase size={18} style={{ color: 'var(--color-primary)' }} /> Informações Básicas
                        </h3>

                        <div>
                            <label style={labelStyle}>Nome do Serviço</label>
                            <input
                                required
                                type="text"
                                style={{ ...inputStyle }}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Manutenção de Equipamentos"
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Descrição</label>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    rows={6}
                                    style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descreva o que está incluso no serviço..."
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                />
                                <FileText style={{ position: 'absolute', right: '1rem', top: '1rem', color: '#4b5563' }} size={18} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div>
                                <label style={labelStyle}>Preço do Serviço</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#10b981', fontWeight: 600 }}>R$</div>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        style={{ ...inputStyle, paddingLeft: '3rem', fontFamily: 'monospace', fontSize: '1.25rem' }}
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Duração Estimada (min)</label>
                                <div style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
                                        <Clock size={20} style={{ color: '#f59e0b' }} />
                                    </div>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        style={{ ...inputStyle, paddingLeft: '3rem', fontFamily: 'monospace', fontSize: '1.25rem' }}
                                        value={formData.duration_minutes}
                                        onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                                        onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                                        onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Media & Visuals */}
                <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Image Upload Component */}
                    <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', margin: 0 }}>
                            <ImageIcon size={18} style={{ color: 'var(--color-secondary)' }} /> Mídia do Serviço
                        </h3>

                        <ImageUpload
                            value={formData.image_url}
                            onChange={(url) => {
                                setFormData(prev => ({ ...prev, image_url: url }));
                                if (url) setTempImages(prev => [...prev, url]);
                            }}
                            bucket="company-images"
                        />

                        <p style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center' }}>
                            Adicione uma foto chamativa para representar este serviço no catálogo.
                        </p>
                    </div>
                </div>
            </div>
        </form>
    );
}

"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    bucket?: string;
    disabled?: boolean;
}

export function ImageUpload({ value, onChange, bucket = "company-images", disabled = false }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("ImageUpload: handleUpload triggered");
        try {
            const file = event.target.files?.[0];
            if (!file) {
                console.log("ImageUpload: No file selected");
                return;
            }
            console.log("ImageUpload: File selected", file.name);

            setUploading(true);
            console.log("ImageUpload: Uploading...");

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload
            console.log("ImageUpload: Sending to bucket", bucket);
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) {
                console.error("ImageUpload: Upload Error detail:", uploadError);
                throw uploadError;
            }
            console.log("ImageUpload: Upload success", uploadData);

            // Get Public URL
            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            console.log("ImageUpload: Public URL generated", data.publicUrl);

            onChange(data.publicUrl);

        } catch (error: any) {
            console.error("ImageUpload: Catch Error:", error);
            alert(`Erro ao fazer upload: ${error.message || "Erro desconhecido"} (Verifique o console)`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = () => {
        onChange("");
    };

    return (
        <div style={{ width: '100%' }}>
            {value ? (
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(0,0,0,0.2)'
                }}>
                    <img
                        src={value}
                        alt="Upload"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                        onClick={handleRemove}
                        type="button"
                        disabled={disabled}
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                        width: '100%',
                        height: '200px',
                        borderRadius: '12px',
                        border: '2px dashed rgba(255,255,255,0.2)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: disabled || uploading ? 'not-allowed' : 'pointer',
                        background: 'rgba(255,255,255,0.02)',
                        transition: 'all 0.2s',
                        color: '#9ca3af'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        accept="image/*"
                        disabled={disabled || uploading}
                        style={{ display: 'none' }}
                    />

                    {uploading ? (
                        <>
                            <Loader2 size={32} className="animate-spin" style={{ marginBottom: '1rem', color: 'var(--color-primary)' }} />
                            <span style={{ fontSize: '0.9rem' }}>Enviando...</span>
                        </>
                    ) : (
                        <>
                            <div style={{
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '50%',
                                marginBottom: '1rem'
                            }}>
                                <Upload size={24} color="white" />
                            </div>
                            <span style={{ fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
                                Clique para fazer upload
                            </span>
                            <span style={{ fontSize: '0.8rem' }}>
                                PNG, JPG ou WEBP
                            </span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

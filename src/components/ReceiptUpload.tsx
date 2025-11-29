"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Image from "next/image";

interface ReceiptUploadProps {
    onUploadComplete: (url: string) => void;
    bucketName?: string;
}

export default function ReceiptUpload({ onUploadComplete, bucketName = 'receipts' }: ReceiptUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) return;

            setUploading(true);

            // Create unique file name
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload to Supabase
            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            setPreviewUrl(data.publicUrl);
            onUploadComplete(data.publicUrl);
            toast.success("Comprobante subido correctamente");

        } catch (error) {
            console.error("Error uploading receipt:", error);
            toast.error("Error al subir el comprobante. Verifica que el bucket 'receipts' exista y sea público.");
        } finally {
            setUploading(false);
        }
    };

    const clearSelection = () => {
        setPreviewUrl(null);
        onUploadComplete("");
    };

    if (previewUrl) {
        return (
            <div className="relative group inline-block">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-white/20">
                    <Image
                        src={previewUrl}
                        alt="Receipt preview"
                        fill
                        className="object-cover"
                    />
                </div>
                <button
                    onClick={clearSelection}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                    <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-0 right-0 bg-green-500 rounded-tl-lg p-1">
                    <Check className="w-3 h-3 text-white" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                className="relative overflow-hidden border-dashed border-white/30 hover:border-white/60 hover:bg-white/5"
                disabled={uploading}
            >
                <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {uploading ? (
                    <span className="animate-pulse">Subiendo...</span>
                ) : (
                    <>
                        <Upload className="w-4 h-4 mr-2" />
                        Subir Comprobante
                    </>
                )}
            </Button>
        </div>
    );
}

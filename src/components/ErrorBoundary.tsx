"use client";

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-black p-4">
                    <Card className="w-full max-w-md bg-white/5 border-red-500/20">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-red-500/10 rounded-full">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <CardTitle className="text-white">Algo salió mal</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-400">
                                Lo sentimos, ocurrió un error inesperado. Intenta recargar la página.
                            </p>
                            {this.state.error && (
                                <details className="text-xs text-gray-500">
                                    <summary className="cursor-pointer hover:text-gray-400">
                                        Detalles técnicos
                                    </summary>
                                    <pre className="mt-2 p-2 bg-black/50 rounded overflow-auto">
                                        {this.state.error.message}
                                    </pre>
                                </details>
                            )}
                            <Button
                                onClick={() => window.location.reload()}
                                className="w-full"
                                variant="secondary"
                            >
                                Recargar Página
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

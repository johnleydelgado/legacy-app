'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Purchase Orders error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    Something went wrong
                </h1>

                <p className="text-gray-600 mb-6">
                    We encountered an error while loading the purchase orders. This could be due to a network issue or a temporary server problem.
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={reset}
                        className="w-full flex items-center justify-center gap-2"
                        variant="default"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try again
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <Link href="/production">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Production
                        </Link>
                    </Button>
                </div>

                {error.digest && (
                    <p className="text-xs text-gray-400 mt-4">
                        Error ID: {error.digest}
                    </p>
                )}

                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-4 text-left">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                            Error Details (Development)
                        </summary>
                        <pre className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded overflow-auto">
                            {error.message}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
} 
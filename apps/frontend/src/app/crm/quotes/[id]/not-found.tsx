// File: src/app/crm/quotes/[id]/not-found.tsx
import Link from 'next/link';
import { FileX, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileX className="w-8 h-8 text-gray-400" />
                    </div>
                </div>

                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    Quote Not Found
                </h1>

                <p className="text-gray-600 mb-6">
                    The quote you're looking for doesn't exist or may have been deleted.
                </p>

                <Link
                    href="/crm/quotes"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Quotes
                </Link>
            </div>
        </div>
    );
}

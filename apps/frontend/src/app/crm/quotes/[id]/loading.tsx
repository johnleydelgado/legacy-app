// File: src/app/crm/quotes/[id]/loading.tsx
export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="animate-pulse">
                {/* Header skeleton */}
                <div className="bg-white p-6 border-b border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                            <div className="w-32 h-8 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex gap-3">
                            {[...Array(7)].map((_, i) => (
                                <div key={i} className="w-24 h-9 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                    <div className="w-48 h-9 bg-gray-200 rounded-lg"></div>
                </div>

                {/* Quote Info skeleton */}
                <div className="p-6 border-b border-gray-200 bg-white">
                    <div className="bg-gray-200 rounded-lg p-4 mb-6 w-80 h-20"></div>
                    <div className="w-96 h-6 bg-gray-200 rounded"></div>
                </div>

                {/* Customer Information skeleton */}
                <div className="p-6 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-5 h-5 bg-gray-200 rounded"></div>
                        <div className="w-48 h-6 bg-gray-200 rounded"></div>
                    </div>

                    <div className="bg-gray-200 rounded-lg p-4 mb-6 h-20"></div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <div className="w-32 h-5 bg-gray-200 rounded"></div>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <div className="w-32 h-5 bg-gray-200 rounded"></div>
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <div className="w-16 h-4 bg-gray-200 rounded"></div>
                                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-16 h-5 bg-gray-200 rounded mb-4"></div>
                    <div className="bg-gray-200 rounded-lg p-4 h-24"></div>
                </div>

                {/* Quote Items skeleton */}
                <div className="p-6 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-gray-200 rounded"></div>
                            <div className="w-24 h-6 bg-gray-200 rounded"></div>
                        </div>
                        <div className="w-24 h-9 bg-gray-200 rounded-lg"></div>
                    </div>

                    <div className="bg-gray-200 rounded-lg h-64"></div>
                </div>

                {/* Summary skeleton */}
                <div className="p-6 border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-5 h-5 bg-gray-200 rounded"></div>
                        <div className="w-32 h-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="bg-gray-200 rounded-lg p-6 h-48"></div>
                </div>

                {/* Activity History skeleton */}
                <div className="p-6 bg-white">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-5 h-5 bg-gray-200 rounded"></div>
                        <div className="w-32 h-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="bg-gray-200 rounded-lg h-64"></div>
                </div>
            </div>
        </div>
    );
}

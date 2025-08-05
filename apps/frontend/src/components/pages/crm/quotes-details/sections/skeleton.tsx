// Loading skeleton component
const QuoteDetailsSkeleton = () => {
    return (
        <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="bg-white p-6 border-b border-gray-200">
    <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-4">
    <div className="w-8 h-8 bg-gray-200 rounded-lg">{}</div>
        <div className="w-32 h-8 bg-gray-200 rounded">{}</div>
        </div>
        <div className="flex gap-3">
        {[...Array(7)].map((_, i) => (
        <div key={i} className="w-24 h-9 bg-gray-200 rounded-lg">{}</div>
))}
    </div>
    </div>
    <div className="w-48 h-9 bg-gray-200 rounded-lg">{}</div>
        </div>

    {/* Content skeleton */}
    <div className="p-6 space-y-6">
    <div className="bg-white rounded-lg p-6 border border-gray-200">
    <div className="w-64 h-6 bg-gray-200 rounded mb-4">{}</div>
        <div className="space-y-3">
    <div className="w-full h-4 bg-gray-200 rounded">{}</div>
        <div className="w-3/4 h-4 bg-gray-200 rounded">{}</div>
        <div className="w-1/2 h-4 bg-gray-200 rounded">{}</div>
        </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
    <div className="w-48 h-6 bg-gray-200 rounded mb-4">{}</div>
        <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
        <div key={i} className="w-full h-16 bg-gray-200 rounded">{}</div>
))}
    </div>
    </div>
    </div>
    </div>
    </div>
);
}

export default QuoteDetailsSkeleton;

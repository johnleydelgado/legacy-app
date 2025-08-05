import React from "react";

interface ProcessStatus {
  id: string;
  status: string;
  count: number;
}

interface ProcessSummary {
  process?: string;
  total: number;
  statuses?: ProcessStatus[];
  status?: string;
  count?: number;
}

interface ProcessSummaryCardProps {
  processSummary: ProcessSummary[];
  loading?: boolean;
}

export const ProcessSummaryCard: React.FC<ProcessSummaryCardProps> = ({
  processSummary,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-[500px] flex flex-col">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse">
          {}
        </div>
        <div className="space-y-4 overflow-y-auto flex-1">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2">{}</div>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, statusIndex) => (
                  <div key={statusIndex} className="h-8 bg-gray-200 rounded">
                    {}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col min-h-[300px]">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">
        Process Summary
      </h3>
      <div className="space-y-4 overflow-y-auto flex-1">
        {processSummary.map((process, index) => (
          <div
            key={index}
            className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-700">{process.process}</h4>
              <span className="text-sm text-gray-500">
                Total: {process.total}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm border border-gray-100"
              >
                <span className="text-gray-700">{process.status}</span>
                <span className="font-semibold text-gray-900">
                  {process.count}
                </span>
              </div>
              {/*{process.statuses.map((status) => (*/}
              {/*  <div*/}
              {/*    key={status.id}*/}
              {/*    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm border border-gray-100"*/}
              {/*  >*/}
              {/*    <span className="text-gray-700">{status.status}</span>*/}
              {/*    <span className="font-semibold text-gray-900">*/}
              {/*      {status.count}*/}
              {/*    </span>*/}
              {/*  </div>*/}
              {/*))}*/}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

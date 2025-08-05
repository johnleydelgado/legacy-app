import { Info } from "lucide-react";

interface InfoBoxProps {
  title: string;
  subtitle: string | React.ReactNode;
}

export function InfoBox({ title, subtitle }: InfoBoxProps) {
  return (
    <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-4">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4 text-blue-500" />
        <p className="text-sm font-medium text-blue-700">{title}</p>
      </div>

      {typeof subtitle === 'string' ? (
        <p className="text-sm text-blue-700 mt-1">{subtitle}</p>
      ) : (
        subtitle
      )}
    </div>
  );
}

import { CheckCircle } from "lucide-react";

interface StatusCardProps {
  isApproved: boolean;
  isRejected: boolean;
}

const StatusCard = ({ isApproved, isRejected }: StatusCardProps) => {
  if (!isApproved && !isRejected) return null;

  return (
    <div className="mx-auto max-w-6xl">
      <div
        className={`bg-white border rounded-xl shadow-sm p-6 ${
          isApproved
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <div className="flex items-center justify-center gap-3">
          {isApproved ? (
            <CheckCircle className="h-8 w-8 text-green-600" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 font-bold text-lg">✕</span>
            </div>
          )}
          <div className="text-center">
            <h2
              className={`text-2xl font-bold ${
                isApproved ? "text-green-800" : "text-red-800"
              }`}
            >
              {isApproved ? "Quote Approved" : "Quote Declined"}
            </h2>
            <p
              className={`text-sm ${
                isApproved ? "text-green-700" : "text-red-700"
              }`}
            >
              {isApproved
                ? "This quote has been approved."
                : "This quote has been declined."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;

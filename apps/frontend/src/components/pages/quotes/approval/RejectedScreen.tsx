"use client";

import { XCircle } from "lucide-react";

const RejectedScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 space-y-4">
    <XCircle className="h-12 w-12 text-destructive" />
    <h2 className="text-2xl font-semibold">Quote Declined</h2>
    <p className="text-muted-foreground max-w-md">
      This quote has been declined. We appreciate your feedback.
    </p>
  </div>
);

export default RejectedScreen;

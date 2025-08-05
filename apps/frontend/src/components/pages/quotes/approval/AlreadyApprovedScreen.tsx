"use client";

import { CheckCircle } from "lucide-react";

const AlreadyApprovedScreen = () => (
  <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 space-y-4">
    <CheckCircle className="h-12 w-12 text-green-600" />
    <h2 className="text-2xl font-semibold">Already Approved</h2>
    <p className="text-muted-foreground max-w-md">
      This approval link has already been used and is now expired.
    </p>
  </div>
);

export default AlreadyApprovedScreen;

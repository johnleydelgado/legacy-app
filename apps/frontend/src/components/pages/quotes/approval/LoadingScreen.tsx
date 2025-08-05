"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import LegacyLogo from "@/assets/images/LegacyLogo.avif";

const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-muted/50">
      <div className="relative w-42 h-42">
        <Image
          src={LegacyLogo}
          alt="Legacy Knitting logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="flex items-center gap-3 text-primary">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="text-sm font-medium animate-pulse">
          Preparing your approval details…
        </span>
      </div>
    </div>
  );
};

export default LoadingScreen;

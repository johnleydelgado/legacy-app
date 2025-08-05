// Utility to handle build-time data fetching
export const isBuildTime = () => {
  return (
    process.env.NEXT_PHASE === "build" ||
    (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL)
  );
};

export const getBuildFallback = <T>(fallback: T): T => {
  if (isBuildTime()) {
    return fallback;
  }
  throw new Error(
    "getBuildFallback should only be used during build time checks"
  );
};

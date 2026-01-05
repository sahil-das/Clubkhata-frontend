// Skeleton.jsx
import React from "react";
export function Skeleton({ className="h-4 bg-gray-200 rounded-md animate-pulse" }) {
  return <div className={className} aria-hidden="true" />;
}

// helpers for common shapes:
export function SkeletonCard() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
      <div className="h-32 bg-gray-200 rounded animate-pulse" />
    </div>
  );
}

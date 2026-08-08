import { Suspense } from "react";
import CatalogClient from "./CatalogClient";

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 animate-pulse" />}>
      <CatalogClient />
    </Suspense>
  );
}

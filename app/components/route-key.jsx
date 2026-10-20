"use client";

import { usePathname } from "next/navigation";

// A client component that remounts on every pathname change.
export function RouteKey() {
  const pathname = usePathname();
  return <div key={pathname} data-route={pathname} style={{ height: 2 }} />;
}

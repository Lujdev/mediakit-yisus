import type { Metadata } from "next";
import type { ReactNode } from "react";

// Keep the dashboard out of search results.
export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}

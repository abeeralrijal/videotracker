"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthed } from "@/lib/session";

export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthed()) {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${next}`);
    }
  }, [router, pathname]);

  useEffect(() => {
    function handleVisibility() {
      if (!isAuthed()) {
        const next = encodeURIComponent(pathname || "/");
        router.replace(`/login?next=${next}`);
      }
    }

    window.addEventListener("visibilitychange", handleVisibility);
    return () => window.removeEventListener("visibilitychange", handleVisibility);
  }, [router, pathname]);
}

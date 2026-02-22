"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearSession, isAuthed } from "@/lib/session";
import { useRouter } from "next/navigation";
import { ShieldIcon } from "./icons";

/** Shared header with logo only. */
export function Header() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthed());
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800/70 bg-slate-950/70 px-6 py-5 backdrop-blur">
      <Link href="/" className="flex items-center gap-2">
        <ShieldIcon className="h-6 w-6 text-amber-400" />
        <span className="text-xl font-semibold tracking-tight text-slate-100">
          SentinelAI
        </span>
        <span className="badge">Security Ops</span>
      </Link>
      {authed && (
        <button
          type="button"
          onClick={() => {
            clearSession();
            setAuthed(false);
            router.replace("/login");
          }}
          className="btn-ghost px-3 py-1.5 text-xs"
        >
          Log out
        </button>
      )}
    </header>
  );
}

import Link from "next/link";
import { ShieldIcon } from "./icons";

/** Shared header with logo and auth links (Sign In / Sign Up). */
export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
      <Link href="/" className="flex items-center gap-2">
        <ShieldIcon className="h-6 w-6 text-red-500" />
        <span className="text-xl font-semibold tracking-tight text-zinc-900">
          SentinelAI
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="/signup"
          className="rounded-md px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
        >
          Sign Up
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Sign In
        </Link>
      </div>
    </header>
  );
}

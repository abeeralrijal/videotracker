"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ShieldIcon } from "@/app/components/icons";

type AppShellProps = {
  title: string;
  subtitle?: string;
  status?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  description: string;
};

const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { label: "Dashboard", href: "/", description: "Overview and routing" },
      { label: "Event History", href: "/analytics", description: "Reviewed alerts" },
      { label: "Ops Insights", href: "/analytics-insights", description: "Trends & hotspots" },
    ],
  },
  {
    title: "Modes",
    items: [
      { label: "Monitor", href: "/monitor", description: "Live triage flow" },
      { label: "Ask", href: "/ask", description: "Footage Q&A" },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/monitor" && pathname.startsWith("/dashboard")) return true;
  return pathname.startsWith(href);
}

export function AppShell({ title, subtitle, status, actions, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen text-slate-100">
      <div className="flex">
        <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-900/70 bg-slate-950/70 backdrop-blur md:flex">
          <Link href="/" className="flex items-center gap-3 px-6 py-5">
            <ShieldIcon className="h-6 w-6 text-amber-400" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                SentinelAI
              </p>
              <p className="text-sm font-semibold text-slate-100">
                Security Ops
              </p>
            </div>
          </Link>
          <nav className="flex-1 space-y-6 px-4 pb-6">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                <p className="px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                  {section.title}
                </p>
                <div className="mt-3 space-y-1">
                  {section.items.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-all ${
                          active
                            ? "border border-amber-400/40 bg-amber-400/10 text-amber-200"
                            : "border border-transparent text-slate-300 hover:border-slate-800/80 hover:bg-slate-900/60"
                        }`}
                      >
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.description}</p>
                        </div>
                        {active && <span className="text-xs text-amber-200">●</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="border-t border-slate-900/70 px-6 py-4 text-xs text-slate-500">
            Always-on monitoring pipelines
          </div>
        </aside>

        <div className="flex-1 md:ml-64">
          <header className="sticky top-0 z-30 border-b border-slate-800/70 bg-slate-950/70 px-6 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2 md:hidden">
                  <ShieldIcon className="h-5 w-5 text-amber-400" />
                  <span className="text-sm font-semibold text-slate-100">
                    SentinelAI
                  </span>
                </Link>
                <div>
                  {subtitle && (
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {subtitle}
                    </p>
                  )}
                  <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {status}
                {actions}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 md:hidden">
              {NAV_SECTIONS.flatMap((section) => section.items).map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={`${item.href}-mobile`}
                    href={item.href}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      active
                        ? "border-amber-400/40 bg-amber-400/10 text-amber-200"
                        : "border-slate-800/70 text-slate-400"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          <main className="px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

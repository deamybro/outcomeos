import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "OutcomeOS",
  description: "Proof-of-Outcome Engine for AI agent commerce."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-50 border-b border-white/10 bg-paper/80 backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight">
              <span className="grid size-8 place-items-center rounded-lg bg-cyan-300 text-slate-950">O</span> OutcomeOS
            </Link>
            <div className="hidden items-center gap-3 text-sm font-semibold text-slate-300 sm:flex sm:gap-6">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/audits">Audits</Link>
              <Link href="/docs">Docs</Link>
              <Link href="/admin">Admin</Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-slate-400">
          OutcomeOS creates SHA-256 evidence hashes ready for future onchain anchoring. No onchain claim is made without a verified transaction.
        </footer>
      </body>
    </html>
  );
}

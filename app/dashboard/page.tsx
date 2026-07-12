import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black">Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card><p className="text-sm text-ink/60">Demo data</p><p className="text-3xl font-black">4</p><p>Audits prepared</p></Card>
        <Card><p className="text-sm text-ink/60">Demo data</p><p className="text-3xl font-black">92%</p><p>Average confidence</p></Card>
        <Card><p className="text-sm text-ink/60">Mode</p><p className="text-3xl font-black">Free</p><p>x402 adapter disabled</p></Card>
        <Card><p className="text-sm text-ink/60">Storage</p><p className="text-3xl font-black">SHA-256</p><p>Ready for future anchoring</p></Card>
      </div>
    </main>
  );
}

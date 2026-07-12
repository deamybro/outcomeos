import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

export default async function PublicReceiptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const demo = slug === "demo-outcome";
  return <main className="mx-auto max-w-3xl px-4 py-14">
    <p className="eyebrow">Read-only proof receipt</p><h1 className="mt-3 text-4xl font-black">OutcomeOS receipt</h1>
    <Card className="mt-7">
      <div className="flex items-start justify-between gap-4"><div><p className="mono text-xs text-slate-400">{demo ? "receipt_demo_outcome" : slug}</p><p className="mt-3 text-3xl font-black text-emerald-300">{demo ? "ACCEPT" : "Receipt unavailable"}</p></div><ShieldCheck className="size-9 text-cyan-300"/></div>
      {demo ? <><div className="mt-6 grid gap-3 sm:grid-cols-3"><Metric label="Completion" value="100%"/><Metric label="Confidence" value="100%"/><Metric label="Checks" value="5 passed"/></div><p className="mono mt-5 break-all rounded-lg bg-emerald-400/10 p-4 text-xs text-emerald-300">Evidence integrity: Verified · 0b5252f5a4bdc0e15b2091d3be90f9ca269f0dc1f83ac823bedb067bc226b030</p><p className="mt-5 flex gap-2 text-sm text-slate-300"><CheckCircle2 className="size-5 text-emerald-400"/>Demo data. All deterministic content requirements passed.</p></> : <p className="mt-4 text-slate-400">No public receipt exists for this slug, or its owner disabled sharing.</p>}
      <p className="mt-6 border-t border-white/10 pt-5 text-xs text-slate-500">Verification is evidence-backed but not a legal guarantee. SHA-256 integrity is not an onchain transaction.</p>
    </Card>
  </main>;
}
function Metric({label,value}:{label:string;value:string}) { return <div className="rounded-lg border border-white/10 p-4"><p className="text-xs uppercase text-slate-500">{label}</p><p className="mt-1 font-bold">{value}</p></div>; }

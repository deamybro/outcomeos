import Link from "next/link";
import { ArrowRight, Braces, CheckCircle2, FileCheck2, ShieldCheck } from "lucide-react";
import { OutcomeWorkbench } from "@/components/OutcomeWorkbench";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return <main>
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-20 text-center">
      <p className="eyebrow">Proof-of-Outcome Engine for AI agent commerce</p>
      <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-black leading-[.98] tracking-[-.055em] md:text-8xl">Don&apos;t trust the delivery.<br/><span className="text-cyan-300">Verify the outcome.</span></h1>
      <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300">OutcomeOS turns agent promises into measurable requirements, tests the delivered work and produces evidence before payment is released.</p>
      <div className="mt-9 flex flex-wrap justify-center gap-3"><Link href="#workbench" className="inline-flex items-center gap-2 rounded-md bg-cyan-300 px-5 py-3 font-bold text-slate-950">Run a Proof Check <ArrowRight className="size-4"/></Link><Link href="/receipts/demo-outcome" className="rounded-md border border-white/15 bg-white/5 px-5 py-3 font-bold">View Sample Receipt</Link></div>
      <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 text-left md:grid-cols-4">
        {[['Contract','Measurable scope'],['Verify','Objective checks'],['Evidence','SHA-256 integrity'],['Decide','Actionable verdict']].map(([a,b],i)=><div key={a} className="bg-[#0b131e] p-5"><p className="mono text-xs text-cyan-300">0{i+1}</p><p className="mt-3 font-bold">{a}</p><p className="mt-1 text-sm text-slate-400">{b}</p></div>)}
      </div>
    </section>
    <section className="border-y border-white/10 bg-white/[.025] py-16"><div className="mx-auto max-w-7xl px-4"><p className="eyebrow">How it works</p><div className="mt-6 grid gap-4 md:grid-cols-3"><Card><Braces className="text-cyan-300"/><h2 className="mt-5 text-xl font-bold">Compile the promise</h2><p className="mt-2 text-slate-400">Turn vague work into editable acceptance tests with explicit evidence requirements.</p></Card><Card><ShieldCheck className="text-cyan-300"/><h2 className="mt-5 text-xl font-bold">Run safe checks</h2><p className="mt-2 text-slate-400">Verify public websites, repositories and content without executing untrusted code.</p></Card><Card><FileCheck2 className="text-cyan-300"/><h2 className="mt-5 text-xl font-bold">Issue the receipt</h2><p className="mt-2 text-slate-400">Produce an integrity-checked receipt and a clear accept, revise or reject recommendation.</p></Card></div></div></section>
    <section id="workbench" className="mx-auto max-w-7xl px-4 py-16"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Live workflow</p><h2 className="mt-3 text-3xl font-black">Contract → proof check → receipt</h2></div><p className="max-w-lg text-sm text-slate-400"><CheckCircle2 className="mr-2 inline size-4 text-emerald-400"/>Demo content is clearly labelled. The form calls the same public route handlers documented for A2MCP.</p></div><OutcomeWorkbench/></section>
  </main>;
}

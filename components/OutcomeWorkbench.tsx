"use client";

import { CheckCircle2, Download, FileLock2, Loader2, ShieldCheck, Trash2, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { OutcomeContract, ProofReceipt, TaskType } from "@/lib/domain";
import { hashCanonicalJson } from "@/lib/hashing/sha256";

const defaultTask =
  "Write an OKX.AI launch post that explains OutcomeOS, includes #OKXAI, names the proof-of-outcome benefit, and ends with a clear call to action.";

const demoContent =
  "Demo data. OutcomeOS helps buyers verify AI-agent work before releasing payment. It converts a task into measurable acceptance tests, checks the submitted delivery, records evidence, and creates a tamper-evident SHA-256 receipt. The result is a practical proof-of-outcome workflow for OKX.AI services. This proof-of-outcome benefit gives every buyer a defensible decision trail. Teams can request revisions when requirements fail, accept work with warnings when minor issues remain, and preserve structured dispute evidence when needed. The call to action is simple: try OutcomeOS on your next agent delivery and make the result prove itself. Every result preserves its expected value, actual value, severity and objective evidence for review. #OKXAI";

export function OutcomeWorkbench() {
  const [task, setTask] = useState(defaultTask);
  const [taskType, setTaskType] = useState<TaskType>("content");
  const [features, setFeatures] = useState("#OKXAI, call to action, proof-of-outcome benefit");
  const [target, setTarget] = useState(demoContent);
  const [contract, setContract] = useState<OutcomeContract | undefined>();
  const [receipt, setReceipt] = useState<ProofReceipt | undefined>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const contractHash = useMemo(() => (contract?.status === "locked" ? hashCanonicalJson(contract) : undefined), [contract]);

  async function generateContract() {
    setBusy(true);
    setMessage(undefined);
    setReceipt(undefined);
    try {
      const response = await fetch("/api/okx/a2mcp/outcome-contract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          task,
          taskType,
          requiredFeatures: features
            .split(",")
            .map((feature) => feature.trim())
            .filter(Boolean)
        })
      });
      const data: unknown = await response.json();
      if (!response.ok || !isContractResponse(data)) throw new Error(readError(data));
      setContract(data.contract);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not generate contract.");
    } finally {
      setBusy(false);
    }
  }

  function lockContract() {
    if (!contract) return;
    setContract({ ...contract, status: "locked", lockedAt: new Date().toISOString() });
  }

  function removeRequirement(testId: string) {
    if (!contract || contract.status === "locked" || contract.acceptanceTests.length === 1) return;
    setContract({ ...contract, acceptanceTests: contract.acceptanceTests.filter((test) => test.id !== testId) });
  }

  async function runAudit() {
    if (!contract || contract.status !== "locked") {
      setMessage("Lock the contract before running a proof check.");
      return;
    }
    setBusy(true);
    setMessage(undefined);
    try {
      const response = await fetch("/api/okx/a2mcp/proof-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contract, targetType: taskType, target })
      });
      const data: unknown = await response.json();
      if (!response.ok || !isReceiptResponse(data)) throw new Error(readError(data));
      setReceipt(data.receipt);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not run proof check.");
    } finally {
      setBusy(false);
    }
  }

  function downloadReceipt() {
    if (!receipt) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${receipt.receiptId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function downloadMarkdown() {
    if (!receipt) return;
    const lines = [`# OutcomeOS Proof Receipt`, ``, `Verdict: ${receipt.verdict}`, `Contract hash: ${receipt.contractHash}`, `Evidence hash: ${receipt.evidenceHash}`, ``, ...receipt.results.map((result) => `- ${result.status.toUpperCase()}: ${result.summary}`)];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/markdown" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${receipt.receiptId}.md`; anchor.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
      <Card className="space-y-4">
        <div>
          <label className="text-sm font-bold" htmlFor="task">
            Task
          </label>
          <textarea
            id="task"
            className="mt-2 min-h-36 w-full rounded-md border border-ink/15 p-3"
            value={task}
            onChange={(event) => setTask(event.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-bold">
            Delivery type
            <select className="mt-2 w-full rounded-md border border-ink/15 p-3" value={taskType} onChange={(event) => setTaskType(event.target.value as TaskType)}>
              <option value="content">Content</option>
              <option value="website">Website</option>
              <option value="repository">Repository</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label className="text-sm font-bold">
            Required features
            <input className="mt-2 w-full rounded-md border border-ink/15 p-3" value={features} onChange={(event) => setFeatures(event.target.value)} />
          </label>
        </div>
        <label className="block text-sm font-bold">
          Delivery target
          <textarea className="mt-2 min-h-40 w-full rounded-md border border-ink/15 p-3" value={target} onChange={(event) => setTarget(event.target.value)} />
        </label>
        <div className="flex flex-wrap gap-3">
          <Button onClick={generateContract} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />} Generate Outcome Contract
          </Button>
          <Button variant="secondary" onClick={lockContract} disabled={!contract || contract.status === "locked"}>
            <FileLock2 className="size-4" /> Lock
          </Button>
          <Button variant="secondary" onClick={runAudit} disabled={busy || contract?.status !== "locked"}>
            Run Proof Check
          </Button>
        </div>
        {message ? <p role="alert" className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-rose-300">{message}</p> : null}
      </Card>

      <div className="space-y-5">
        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Outcome Contract</h2>
            <span className="rounded-md bg-cyan-300/10 px-2 py-1 text-xs font-bold uppercase text-cyan-300">{contract?.status ?? "not generated"}</span>
          </div>
          {contract ? (
            <div className="space-y-3">
              {contractHash ? <p className="break-all rounded-md bg-ink/5 p-3 text-xs">Contract hash: {contractHash}</p> : null}
              <ul className="space-y-2">
                {contract.acceptanceTests.map((test) => (
                  <li key={test.id} className="rounded-md border border-white/10 p-3 text-sm">
                    <div className="flex justify-between gap-3"><strong>{test.title}</strong>{contract.status === "draft" ? <button aria-label={`Remove ${test.title}`} onClick={() => removeRequirement(test.id)} className="text-slate-500 hover:text-rose-300"><Trash2 className="size-4"/></button> : null}</div>
                    <p className="mt-1 text-ink/70">{test.description}</p>
                    <p className="mt-2 text-xs uppercase text-ink/50">{test.source} - {test.severity}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-ink/65">Generate a contract to see measurable requirements.</p>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Proof Receipt</h2>
            <Button variant="secondary" onClick={downloadReceipt} disabled={!receipt}>
              <Download className="size-4" /> JSON
            </Button>
            <Button variant="secondary" onClick={downloadMarkdown} disabled={!receipt}>Markdown</Button>
          </div>
          {receipt ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Completion" value={`${receipt.completionScore}%`} />
                <Metric label="Verdict" value={receipt.verdict.replaceAll("_", " ")} />
                <Metric label="Action" value={receipt.recommendedAction.replaceAll("_", " ")} />
              </div>
              <p className="break-all rounded-md bg-emerald-400/10 p-3 text-xs text-emerald-300">Evidence integrity: Verified · {receipt.evidenceHash}</p>
              <ul className="space-y-2">
                {receipt.results.map((result) => (
                  <li key={result.testId} className="flex gap-3 rounded-md border border-ink/10 p-3 text-sm">
                    {result.status === "pass" ? <CheckCircle2 className="mt-0.5 size-5 text-mint" /> : <XCircle className="mt-0.5 size-5 text-danger" />}
                    <span>{result.summary}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-ink/65">Lock a contract and run a proof check to create evidence.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink/10 p-3">
      <p className="text-xs font-bold uppercase text-ink/50">{label}</p>
      <p className="mt-1 text-lg font-black capitalize">{value}</p>
    </div>
  );
}

function isContractResponse(value: unknown): value is { success: true; contract: OutcomeContract } {
  return typeof value === "object" && value !== null && "contract" in value;
}

function isReceiptResponse(value: unknown): value is { success: true; receipt: ProofReceipt } {
  return typeof value === "object" && value !== null && "receipt" in value;
}

function readError(value: unknown): string {
  if (typeof value === "object" && value !== null && "error" in value) {
    const candidate = value as { error?: { message?: string; action?: string } };
    return [candidate.error?.message, candidate.error?.action].filter(Boolean).join(" ");
  }
  return "Unexpected API response.";
}

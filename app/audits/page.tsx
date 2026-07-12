import { Card } from "@/components/ui/card";

export default function AuditsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black">Audits</h1>
      <Card className="mt-6">
        <p className="font-bold">Supported target types</p>
        <ul className="mt-3 list-inside list-disc text-ink/75">
          <li>Public websites with SSRF protections and HTML checks.</li>
          <li>Public GitHub repositories through static API inspection.</li>
          <li>Plain text and Markdown content with deterministic rules.</li>
        </ul>
      </Card>
    </main>
  );
}

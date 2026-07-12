import Link from "next/link";
import { Card } from "@/components/ui/card";

const docs = ["ARCHITECTURE", "API", "A2MCP_SERVICE", "A2A_SERVICE", "SECURITY_MODEL", "THREAT_MODEL", "OKX_LISTING", "DEMO_SCRIPT", "TESTING"];

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black">Documentation</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {docs.map((doc) => (
          <Card key={doc}>
            <p className="font-bold">{doc.replaceAll("_", " ")}</p>
            <Link className="mt-3 inline-block text-sm font-bold text-cobalt" href={`https://github.com/search?q=${doc}`}>
              Open local file in repository
            </Link>
          </Card>
        ))}
      </div>
    </main>
  );
}

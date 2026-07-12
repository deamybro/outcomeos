import { Card } from "@/components/ui/card";

export default function AdminPage() {
  const configuredAdmins = Boolean(process.env.ADMIN_EMAILS);
  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-black">Admin Console</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-ink/60">Application health</p><p className="text-2xl font-black text-mint">OK</p></Card>
        <Card><p className="text-sm text-ink/60">Gemini health</p><p className="text-2xl font-black">{process.env.GEMINI_API_KEY ? "Configured" : "Fallback"}</p></Card>
        <Card><p className="text-sm text-ink/60">Admin authorization</p><p className="text-2xl font-black">{configuredAdmins ? "Configured" : "Not configured"}</p></Card>
      </div>
      <Card className="mt-6">
        <p className="font-bold">Operational boundary</p>
        <p className="mt-2 text-ink/70">Admin data shown here is server-rendered. Mutating controls remain disabled until Supabase auth and verified admin checks are configured.</p>
      </Card>
    </main>
  );
}

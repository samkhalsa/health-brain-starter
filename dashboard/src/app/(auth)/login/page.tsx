import { signIn } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <form
        action={async (formData) => {
          "use server";
          const { callbackUrl } = await searchParams;
          await signIn("credentials", {
            password: formData.get("password"),
            redirectTo: callbackUrl || "/",
          });
        }}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-2xl"
      >
        <h1 className="text-2xl font-semibold text-fg mb-2">Health Brain</h1>
        <p className="text-sm text-muted mb-6">Sign in to view your dashboard.</p>
        <input
          type="password"
          name="password"
          placeholder="Password"
          autoFocus
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-fg placeholder:text-muted outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-accent px-4 py-3 font-medium text-bg hover:opacity-90"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}

import Link from "next/link";
import { signOut } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Today" },
  { href: "/trends", label: "Trends" },
  { href: "/biomarkers", label: "Biomarkers" },
  { href: "/body", label: "Body" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-6">
          <Link
            href="/"
            className="font-semibold text-fg tracking-tight shrink-0 text-sm sm:text-base"
          >
            Health Brain
          </Link>
          <nav
            className="flex items-center gap-3 sm:gap-4 text-sm min-w-0 flex-1 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-muted hover:text-fg py-1 shrink-0"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
            className="shrink-0"
          >
            <button className="text-xs text-muted hover:text-fg" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </div>
  );
}

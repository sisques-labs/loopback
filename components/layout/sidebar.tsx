import Link from "next/link";
import { services } from "@/lib/services-registry";

export function Sidebar() {
  const enabled = services.filter((s) => s.status === "enabled");

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-sidebar px-4 py-6">
      <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Services
      </p>
      <nav className="flex flex-col gap-1">
        {enabled.map((service) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.slug}
              href={service.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Icon className="size-4 shrink-0" />
              {service.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

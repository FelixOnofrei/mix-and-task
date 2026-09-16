import { Link } from "@tanstack/react-router";
import { Compass, Crosshair, Settings, Sun } from "lucide-react";

const tabs = [
  { to: "/", label: "Today", Icon: Sun },
  { to: "/focus", label: "Focus", Icon: Crosshair },
  { to: "/clarity", label: "Clarity", Icon: Compass },
  { to: "/settings", label: "Settings", Icon: Settings },
] as const;

export function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
      <div className="flex items-center gap-1 rounded-full px-2 py-1.5 ring-1 ring-border glass-panel">
        {tabs.map(({ to, label, Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-muted-foreground transition-colors"
            activeProps={{ className: "bg-secondary text-foreground" }}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

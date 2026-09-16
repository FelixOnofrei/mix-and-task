import { createFileRoute } from "@tanstack/react-router";
import { Bluetooth, BatteryMedium, Cpu, RadioTower } from "lucide-react";

import { TabBar } from "@/components/TabBar";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Ritual" },
      {
        name: "description",
        content: "Connect your Focus Flow device over Bluetooth and tune how Ritual behaves.",
      },
      { property: "og:title", content: "Settings — Ritual" },
      {
        property: "og:description",
        content: "Pair the Focus Flow device and adjust your calm to-do setup.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-hue-blue/25 blur-3xl" />

      <div className="relative mx-auto max-w-[460px] px-5 pb-32 pt-8">
        <header>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Settings
          </p>
          <h1 className="mt-1 font-display text-3xl leading-tight">Your setup</h1>
        </header>

        <section className="mt-6 rounded-3xl p-4 ring-1 ring-border glass-panel">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-hue-blue/20">
              <Bluetooth size={18} strokeWidth={1.9} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[17px] font-semibold leading-tight">Focus Flow</p>
              <p className="text-[12px] text-muted-foreground">
                Bluetooth Low Energy · not connected
              </p>
            </div>
            <button
              type="button"
              disabled
              className="shrink-0 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground opacity-50"
            >
              Connect
            </button>
          </div>

          <div className="mt-4 grid gap-2">
            <Row Icon={RadioTower} label="Pairing" value="Coming soon" />
            <Row Icon={BatteryMedium} label="Battery" value="—" />
            <Row Icon={Cpu} label="Firmware" value="—" />
          </div>
        </section>

        <p className="px-2 pt-4 text-[11px] leading-snug text-muted-foreground/80">
          Device pairing is a placeholder for now — the Focus Flow hardware isn't wired up yet.
        </p>
      </div>

      <TabBar />
    </div>
  );
}

function Row({
  Icon,
  label,
  value,
}: {
  Icon: typeof Bluetooth;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-glass px-3 py-2.5 ring-1 ring-border">
      <Icon size={16} strokeWidth={1.8} className="shrink-0 text-muted-foreground" />
      <span className="flex-1 text-[13.5px]">{label}</span>
      <span className="text-[12.5px] text-muted-foreground">{value}</span>
    </div>
  );
}

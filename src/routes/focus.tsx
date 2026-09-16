import { createFileRoute, Link } from "@tanstack/react-router";
import { Crosshair, RefreshCw, X } from "lucide-react";
import { useEffect } from "react";

import { TabBar } from "@/components/TabBar";
import { TaskList } from "@/components/TaskList";
import {
  FOCUS_LIMIT,
  clearFocus,
  cycleStatus,
  hydrate,
  removeTask,
  reorderFocus,
  syncFocus,
  toggleFocus,
  useRitual,
} from "@/lib/ritual-store";

export const Route = createFileRoute("/focus")({
  head: () => ({
    meta: [
      { title: "Focus — up to three tasks, Ritual" },
      {
        name: "description",
        content: "Keep at most three tasks in focus. Reorder them, move them through status, done.",
      },
      { property: "og:title", content: "Focus — up to three tasks, Ritual" },
      {
        property: "og:description",
        content: "Three tasks, nothing else. The calm end of your to-do list.",
      },
    ],
  }),
  component: FocusPage,
});

function FocusPage() {
  const { today, focus } = useRitual();

  useEffect(() => {
    hydrate();
  }, []);

  const tasks = focus
    .map((id) => today.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-10 -top-14 size-60 rounded-full bg-hue-lime/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-24 -right-12 size-56 rounded-full bg-hue-teal/25 blur-3xl" />

      <div className="relative mx-auto max-w-[460px] px-5 pb-32 pt-8">
        <header className="flex items-start gap-3">
          <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-glass ring-1 ring-border">
            <Crosshair size={18} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Focus
            </p>
            <h1 className="mt-1 font-display text-3xl leading-tight">Three, at most.</h1>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {tasks.length}/{FOCUS_LIMIT} in focus
            </p>
          </div>
        </header>

        <section className="mt-6 rounded-3xl p-3 ring-1 ring-border glass-panel">
          {tasks.length === 0 ? (
            <p className="px-2 py-4 text-[13px] text-muted-foreground">
              Nothing in focus yet. Tap the focus icon on a task in{" "}
              <Link to="/" className="underline">
                Today
              </Link>
              , or sync the first three.
            </p>
          ) : (
            <TaskList
              tasks={tasks}
              focusIds={focus}
              onCycle={cycleStatus}
              onDelete={removeTask}
              onToggleFocus={toggleFocus}
              onReorder={reorderFocus}
            />
          )}
        </section>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={syncFocus}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground"
          >
            <RefreshCw size={15} strokeWidth={1.9} />
            Sync
          </button>
          <button
            type="button"
            onClick={clearFocus}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-glass px-4 py-2.5 text-[13px] font-medium ring-1 ring-border"
          >
            <X size={15} strokeWidth={1.9} />
            Clear focus
          </button>
        </div>

        <p className="px-2 pt-4 text-[11px] leading-snug text-muted-foreground/80">
          Sync tops focus up from the first open tasks in Today.
        </p>
      </div>

      <TabBar />
    </div>
  );
}

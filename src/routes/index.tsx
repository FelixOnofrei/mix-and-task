import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { RoutineCard } from "@/components/RoutineCard";
import { hueDot, hueTint } from "@/lib/hues";
import {
  addCustomTask,
  addFromRoutine,
  hydrate,
  removeTask,
  toggleTask,
  useRitual,
} from "@/lib/ritual-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — Ritual, a calm routine to-do list" },
      {
        name: "description",
        content:
          "Mix single tasks from your routines into a short, calm day. No overwhelming backlog, just a few things on the table.",
      },
      { property: "og:title", content: "Today — Ritual, a calm routine to-do list" },
      {
        property: "og:description",
        content: "Pick one task from any routine. Build a day you can actually finish.",
      },
    ],
  }),
  component: Today,
});

function Today() {
  const { routines, today } = useRitual();
  const [draft, setDraft] = useState("");

  useEffect(() => {
    hydrate();
  }, []);

  const done = today.filter((t) => t.done).length;
  const pickedTaskIds = today.map((t) => t.sourceTaskId).filter(Boolean) as string[];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -right-10 -top-16 size-64 rounded-full bg-hue-amber/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 top-40 size-56 rounded-full bg-hue-blue/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-6 size-40 rounded-full bg-hue-violet/25 blur-3xl" />

      <div className="relative mx-auto max-w-[460px] px-5 pb-16 pt-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Today
            </p>
            <h1 className="mt-1 max-w-[16ch] text-balance font-display text-3xl leading-tight">
              A few things, on the table.
            </h1>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-glass text-[10px] font-medium text-muted-foreground ring-1 ring-border">
            {done}/{today.length}
          </span>
        </header>

        <div className="mt-6 flex animate-settle items-center gap-2 text-[13px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-hue-teal" />
          {today.length === 0
            ? "Nothing yet — pick a task below, no rush"
            : `${done} done · ${today.length - done} to go · no rush`}
        </div>

        <section className="mt-4 rounded-3xl p-3 ring-1 ring-border glass-panel">
          {today.map((task, i) => (
            <div
              key={task.id}
              className="group flex animate-slidein items-center gap-3 rounded-2xl px-2 py-3"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span
                className={`size-2.5 shrink-0 rounded-full ${
                  task.hue ? hueDot[task.hue] : "bg-background ring-1 ring-border"
                }`}
              />
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                aria-label={task.done ? `Undo ${task.title}` : `Complete ${task.title}`}
                className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium ring-1 ring-input transition-colors ${
                  task.done ? "bg-primary text-primary-foreground" : "bg-card"
                }`}
              >
                {task.done ? "✓" : ""}
              </button>
              <div className="min-w-0 flex-1" onClick={() => toggleTask(task.id)}>
                <p
                  className={`text-[15px] font-medium leading-snug ${
                    task.done ? "text-foreground/40 line-through" : ""
                  }`}
                >
                  {task.title}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {task.routineName ? `from ${task.routineName}` : "custom"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeTask(task.id)}
                aria-label={`Remove ${task.title}`}
                className="shrink-0 rounded-full px-2 py-1 text-[15px] leading-none text-muted-foreground opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addCustomTask(draft);
              setDraft("");
            }}
            className="mt-1 flex items-center gap-2 rounded-2xl bg-glass px-2 py-2 ring-1 ring-border"
          >
            <span className="text-lg leading-none text-muted-foreground">+</span>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a quick task…"
              aria-label="Add a quick task"
              className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground/70"
            />
          </form>
        </section>

        <section className="mt-4 rounded-3xl p-3 ring-1 ring-border glass-panel">
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Pick from a routine
            </p>
            <Link to="/routines" className="text-[12px] font-medium text-foreground/70">
              Library
            </Link>
          </div>

          {routines.length === 0 ? (
            <p className="px-2 pb-2 text-[13px] text-muted-foreground">
              No routines yet.{" "}
              <Link to="/routines" className="underline">
                Create your first one
              </Link>
              .
            </p>
          ) : (
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {routines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine}
                  pickedTaskIds={pickedTaskIds}
                  onPick={addFromRoutine}
                />
              ))}
            </div>
          )}
        </section>

        <div className="mt-4 flex flex-wrap gap-1.5 px-1">
          {routines.map((r) => (
            <span
              key={r.id}
              className={`rounded-full px-2.5 py-1 text-[11px] text-muted-foreground ${hueTint[r.hue]}`}
            >
              {r.name}
            </span>
          ))}
        </div>

        <p className="px-2 pb-2 pt-4 text-[11px] leading-snug text-muted-foreground/80">
          Tap a task to slide it into Today. Leave the rest on the shelf.
        </p>
      </div>
    </div>
  );
}

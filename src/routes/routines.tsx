import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { TabBar } from "@/components/TabBar";
import { hueDot, hueRing } from "@/lib/hues";
import {
  HUES,
  addRoutineTask,
  createRoutine,
  deleteRoutine,
  hydrate,
  removeRoutineTask,
  updateRoutine,
  useRitual,
  type Hue,
} from "@/lib/ritual-store";

export const Route = createFileRoute("/routines")({
  head: () => ({
    meta: [
      { title: "Routine library — Ritual" },
      {
        name: "description",
        content:
          "Create and edit reusable routines of up to three tasks each, then mix single tasks into your day.",
      },
      { property: "og:title", content: "Routine library — Ritual" },
      {
        property: "og:description",
        content: "Reusable routines, max three tasks each. Small on purpose.",
      },
    ],
  }),
  component: Library,
});

function Library() {
  const { routines } = useRitual();
  const [name, setName] = useState("");
  const [hue, setHue] = useState<Hue>("amber");
  const [taskDraft, setTaskDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    hydrate();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-12 -top-12 size-56 rounded-full bg-hue-teal/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-52 size-56 rounded-full bg-hue-rose/25 blur-3xl" />

      <div className="relative mx-auto max-w-[460px] px-5 pb-32 pt-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Library
            </p>
            <h1 className="mt-1 font-display text-3xl leading-tight">Your routines</h1>
            <p className="mt-1 text-[12px] text-muted-foreground">
              {routines.length} routines · up to 3 tasks each
            </p>
          </div>
          <Link
            to="/"
            className="shrink-0 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground"
          >
            Today
          </Link>
        </header>

        <section className="mt-6 rounded-3xl p-3 ring-1 ring-border glass-panel">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createRoutine(name, hue);
              setName("");
            }}
            className="space-y-3"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New routine name…"
              aria-label="New routine name"
              className="w-full rounded-2xl bg-glass px-3 py-2.5 text-[14px] outline-none ring-1 ring-border placeholder:text-muted-foreground/70"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {HUES.map((h) => (
                  <button
                    key={h}
                    type="button"
                    aria-label={`Colour ${h}`}
                    onClick={() => setHue(h)}
                    className={`size-6 rounded-full ${hueDot[h]} ${
                      hue === h ? `ring-2 ring-offset-2 ring-offset-background ${hueRing[h]}` : ""
                    }`}
                  />
                ))}
              </div>
              <button
                type="submit"
                className="rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground"
              >
                Create
              </button>
            </div>
          </form>
        </section>

        <div className="mt-4 grid gap-3">
          {routines.map((routine, i) => (
            <section
              key={routine.id}
              className="animate-settle rounded-3xl p-4 ring-1 ring-border glass-panel"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-2">
                <span className={`size-2.5 shrink-0 rounded-full ${hueDot[routine.hue]}`} />
                <input
                  value={routine.name}
                  onChange={(e) => updateRoutine(routine.id, { name: e.target.value })}
                  aria-label="Routine name"
                  className="min-w-0 flex-1 bg-transparent font-display text-lg font-semibold outline-none"
                />
                <button
                  type="button"
                  onClick={() => deleteRoutine(routine.id)}
                  className="rounded-full px-2 py-1 text-[12px] text-muted-foreground hover:bg-secondary"
                >
                  Delete
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                {HUES.map((h) => (
                  <button
                    key={h}
                    type="button"
                    aria-label={`Set ${routine.name} colour to ${h}`}
                    onClick={() => updateRoutine(routine.id, { hue: h })}
                    className={`size-4 rounded-full ${hueDot[h]} ${
                      routine.hue === h
                        ? `ring-2 ring-offset-2 ring-offset-background ${hueRing[h]}`
                        : "opacity-45"
                    }`}
                  />
                ))}
              </div>

              <div className="mt-3 space-y-1.5">
                {routine.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 rounded-xl bg-glass px-3 py-2 ring-1 ring-border"
                  >
                    <span className="size-1.5 shrink-0 rounded-full bg-foreground/30" />
                    <span className="min-w-0 flex-1 truncate text-[13.5px]">{task.title}</span>
                    <button
                      type="button"
                      onClick={() => removeRoutineTask(routine.id, task.id)}
                      aria-label={`Remove ${task.title}`}
                      className="shrink-0 text-[15px] leading-none text-muted-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {routine.tasks.length < 3 ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addRoutineTask(routine.id, taskDraft[routine.id] ?? "");
                      setTaskDraft((d) => ({ ...d, [routine.id]: "" }));
                    }}
                    className="flex items-center gap-2 rounded-xl border border-dashed border-input px-3 py-2"
                  >
                    <span className="text-muted-foreground">+</span>
                    <input
                      value={taskDraft[routine.id] ?? ""}
                      onChange={(e) =>
                        setTaskDraft((d) => ({ ...d, [routine.id]: e.target.value }))
                      }
                      placeholder="Add a task…"
                      aria-label={`Add a task to ${routine.name}`}
                      className="flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-muted-foreground/70"
                    />
                  </form>
                ) : (
                  <p className="px-1 pt-1 text-[11px] text-muted-foreground">
                    Three is the limit — that's the point.
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      <TabBar />
    </div>
  );
}

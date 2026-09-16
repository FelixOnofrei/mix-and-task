import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { RoutineCard } from "@/components/RoutineCard";
import { TabBar } from "@/components/TabBar";
import { TaskList } from "@/components/TaskList";
import { hueDot, hueTint } from "@/lib/hues";
import {
  FOCUS_LIMIT,
  addCustomTask,
  addFromRoutine,
  clearDone,
  cycleStatus,
  hydrate,
  removeTask,
  reorderToday,
  toggleFocus,
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
  const { routines, today, focus } = useRitual();
  const [draft, setDraft] = useState("");

  useEffect(() => {
    hydrate();
  }, []);

  const open = today.filter((t) => t.status !== "done");
  const done = today.filter((t) => t.status === "done");
  const pickedTaskIds = open.map((t) => t.sourceTaskId).filter(Boolean) as string[];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -right-10 -top-16 size-64 rounded-full bg-hue-amber/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 top-40 size-56 rounded-full bg-hue-blue/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-6 size-40 rounded-full bg-hue-violet/25 blur-3xl" />

      <div className="relative mx-auto max-w-[460px] px-5 pb-32 pt-8">
        <header>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Today
          </p>
          <h1 className="mt-1 max-w-[16ch] text-balance font-display text-3xl leading-tight">
            A few things, on the table.
          </h1>
        </header>

        <div className="mt-6 flex animate-settle items-center gap-2 text-[13px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-hue-teal" />
          {open.length === 0
            ? "Nothing open — pick a task below, no rush"
            : `${open.length} to go · no rush`}
        </div>

        <section className="mt-4 rounded-3xl p-3 ring-1 ring-border glass-panel">
          <TaskList
            tasks={open}
            focusIds={focus}
            focusDisabled={focus.length >= FOCUS_LIMIT}
            onCycle={cycleStatus}
            onDelete={removeTask}
            onToggleFocus={toggleFocus}
            onReorder={reorderToday}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              addCustomTask(draft);
              setDraft("");
            }}
            className="mt-2 flex items-center gap-2 rounded-2xl bg-glass px-2 py-2 ring-1 ring-border"
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

        {done.length > 0 && (
          <section className="mt-4 rounded-3xl p-3 ring-1 ring-border glass-panel">
            <div className="flex items-center justify-between px-2 pb-2">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Done · {done.length}
              </p>
              <button
                type="button"
                onClick={clearDone}
                className="text-[12px] font-medium text-muted-foreground"
              >
                Clear
              </button>
            </div>
            <div className="space-y-1">
              {done.map((task) => (
                <div key={task.id} className="flex items-center gap-2.5 px-2 py-2">
                  <span
                    className={`size-2 shrink-0 rounded-full ${
                      task.hue ? hueDot[task.hue] : "bg-foreground/20"
                    }`}
                  />
                  <p className="min-w-0 flex-1 truncate text-[13.5px] text-foreground/45 line-through">
                    {task.title}
                  </p>
                  <button
                    type="button"
                    onClick={() => cycleStatus(task.id)}
                    className="shrink-0 text-[11px] text-muted-foreground"
                  >
                    Undo
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <p className="px-2 pb-2 pt-4 text-[11px] leading-snug text-muted-foreground/80">
          Tap a task to move it through to-do → in progress → done. Drag to reorder, swipe right to
          delete.
        </p>
      </div>

      <TabBar />
    </div>
  );
}

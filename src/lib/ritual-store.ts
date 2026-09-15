import { useSyncExternalStore } from "react";

export const HUES = ["amber", "teal", "violet", "blue", "rose", "lime"] as const;
export type Hue = (typeof HUES)[number];

export type Status = "todo" | "doing" | "done";

export type RoutineTask = { id: string; title: string };
export type Routine = { id: string; name: string; hue: Hue; tasks: RoutineTask[] };
export type TodayTask = {
  id: string;
  title: string;
  status: Status;
  routineId: string | null;
  routineName: string | null;
  hue: Hue | null;
  sourceTaskId: string | null;
};

export type RitualState = {
  routines: Routine[];
  today: TodayTask[];
  focus: string[];
  day: string;
};

const KEY = "ritual-state-v2";

export const todayKey = () => new Date().toISOString().slice(0, 10);

const uid = () => Math.random().toString(36).slice(2, 10);

export const FOCUS_LIMIT = 3;

const seed = (): RitualState => ({
  day: todayKey(),
  today: [],
  focus: [],
  routines: [
    {
      id: uid(),
      name: "Morning",
      hue: "amber",
      tasks: [
        { id: uid(), title: "Pour coffee & stretch" },
        { id: uid(), title: "Journal 5 min" },
        { id: uid(), title: "Make the bed" },
      ],
    },
    {
      id: uid(),
      name: "Gym",
      hue: "teal",
      tasks: [
        { id: uid(), title: "Warm up 10 min" },
        { id: uid(), title: "Push day" },
        { id: uid(), title: "Stretch + breathe" },
      ],
    },
    {
      id: uid(),
      name: "Deep Work",
      hue: "blue",
      tasks: [
        { id: uid(), title: "Draft the outline" },
        { id: uid(), title: "Inbox to zero" },
      ],
    },
    {
      id: uid(),
      name: "Evening",
      hue: "violet",
      tasks: [
        { id: uid(), title: "Read 20 pages" },
        { id: uid(), title: "Note tomorrow" },
      ],
    },
    {
      id: uid(),
      name: "Wind Down",
      hue: "rose",
      tasks: [
        { id: uid(), title: "Screens off" },
        { id: uid(), title: "Slow breathing" },
      ],
    },
  ],
});

let state: RitualState = seed();
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function set(next: RitualState) {
  state = next;
  persist();
  emit();
}

export function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RitualState;
      if (parsed?.routines) {
        const base: RitualState = { focus: [], today: [], ...parsed };
        state =
          base.day === todayKey() ? base : { ...base, day: todayKey(), today: [], focus: [] };
      }
    }
  } catch {
    /* ignore */
  }
  emit();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

const emptyState: RitualState = { routines: [], today: [], focus: [], day: todayKey() };

export function useRitual() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => emptyState,
  );
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const next = list.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// --- actions ---

export function addFromRoutine(routine: Routine, task: RoutineTask) {
  if (state.today.some((t) => t.sourceTaskId === task.id && t.status !== "done")) return;
  set({
    ...state,
    today: [
      ...state.today,
      {
        id: uid(),
        title: task.title,
        status: "todo",
        routineId: routine.id,
        routineName: routine.name,
        hue: routine.hue,
        sourceTaskId: task.id,
      },
    ],
  });
}

export function addCustomTask(title: string) {
  const t = title.trim();
  if (!t) return;
  set({
    ...state,
    today: [
      ...state.today,
      {
        id: uid(),
        title: t,
        status: "todo",
        routineId: null,
        routineName: null,
        hue: null,
        sourceTaskId: null,
      },
    ],
  });
}

const nextStatus: Record<Status, Status> = { todo: "doing", doing: "done", done: "todo" };

export function cycleStatus(id: string) {
  const task = state.today.find((t) => t.id === id);
  if (!task) return;
  const status = nextStatus[task.status];
  set({
    ...state,
    today: state.today.map((t) => (t.id === id ? { ...t, status } : t)),
    focus: status === "done" ? state.focus.filter((f) => f !== id) : state.focus,
  });
}

export function removeTask(id: string) {
  set({
    ...state,
    today: state.today.filter((t) => t.id !== id),
    focus: state.focus.filter((f) => f !== id),
  });
}

export function clearToday() {
  set({ ...state, today: [], focus: [] });
}

export function clearDone() {
  set({ ...state, today: state.today.filter((t) => t.status !== "done") });
}

export function reorderToday(fromId: string, toId: string) {
  const open = state.today.filter((t) => t.status !== "done");
  const done = state.today.filter((t) => t.status === "done");
  const from = open.findIndex((t) => t.id === fromId);
  const to = open.findIndex((t) => t.id === toId);
  if (from < 0 || to < 0) return;
  set({ ...state, today: [...move(open, from, to), ...done] });
}

export function toggleFocus(id: string) {
  if (state.focus.includes(id)) {
    set({ ...state, focus: state.focus.filter((f) => f !== id) });
    return;
  }
  if (state.focus.length >= FOCUS_LIMIT) return;
  set({ ...state, focus: [...state.focus, id] });
}

export function reorderFocus(fromId: string, toId: string) {
  const from = state.focus.indexOf(fromId);
  const to = state.focus.indexOf(toId);
  if (from < 0 || to < 0) return;
  set({ ...state, focus: move(state.focus, from, to) });
}

export function clearFocus() {
  set({ ...state, focus: [] });
}

/** Drop stale ids and top up focus from the first open tasks of today. */
export function syncFocus() {
  const open = state.today.filter((t) => t.status !== "done");
  const kept = state.focus.filter((id) => open.some((t) => t.id === id));
  const next = [...kept];
  for (const t of open) {
    if (next.length >= FOCUS_LIMIT) break;
    if (!next.includes(t.id)) next.push(t.id);
  }
  set({ ...state, focus: next });
}

export function createRoutine(name: string, hue: Hue) {
  const n = name.trim();
  if (!n) return;
  set({ ...state, routines: [...state.routines, { id: uid(), name: n, hue, tasks: [] }] });
}

export function updateRoutine(id: string, patch: Partial<Pick<Routine, "name" | "hue">>) {
  set({
    ...state,
    routines: state.routines.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  });
}

export function deleteRoutine(id: string) {
  const today = state.today.filter((t) => t.routineId !== id);
  set({
    ...state,
    routines: state.routines.filter((r) => r.id !== id),
    today,
    focus: state.focus.filter((f) => today.some((t) => t.id === f)),
  });
}

export function addRoutineTask(routineId: string, title: string) {
  const t = title.trim();
  if (!t) return;
  set({
    ...state,
    routines: state.routines.map((r) =>
      r.id === routineId && r.tasks.length < 3
        ? { ...r, tasks: [...r.tasks, { id: uid(), title: t }] }
        : r,
    ),
  });
}

export function updateRoutineTask(routineId: string, taskId: string, title: string) {
  set({
    ...state,
    routines: state.routines.map((r) =>
      r.id === routineId
        ? { ...r, tasks: r.tasks.map((t) => (t.id === taskId ? { ...t, title } : t)) }
        : r,
    ),
  });
}

export function removeRoutineTask(routineId: string, taskId: string) {
  set({
    ...state,
    routines: state.routines.map((r) =>
      r.id === routineId ? { ...r, tasks: r.tasks.filter((t) => t.id !== taskId) } : r,
    ),
  });
}

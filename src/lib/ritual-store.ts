import { useSyncExternalStore } from "react";

export const HUES = ["amber", "teal", "violet", "blue", "rose", "lime"] as const;
export type Hue = (typeof HUES)[number];

export type RoutineTask = { id: string; title: string };
export type Routine = { id: string; name: string; hue: Hue; tasks: RoutineTask[] };
export type TodayTask = {
  id: string;
  title: string;
  done: boolean;
  routineId: string | null;
  routineName: string | null;
  hue: Hue | null;
  sourceTaskId: string | null;
};

export type RitualState = { routines: Routine[]; today: TodayTask[]; day: string };

const KEY = "ritual-state-v1";

export const todayKey = () => new Date().toISOString().slice(0, 10);

const uid = () => Math.random().toString(36).slice(2, 10);

const seed = (): RitualState => ({
  day: todayKey(),
  today: [],
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
        state = parsed.day === todayKey() ? parsed : { ...parsed, day: todayKey(), today: [] };
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

const emptyState: RitualState = { routines: [], today: [], day: todayKey() };

export function useRitual() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => emptyState,
  );
}

// --- actions ---

export function addFromRoutine(routine: Routine, task: RoutineTask) {
  if (state.today.some((t) => t.sourceTaskId === task.id)) return;
  set({
    ...state,
    today: [
      ...state.today,
      {
        id: uid(),
        title: task.title,
        done: false,
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
        done: false,
        routineId: null,
        routineName: null,
        hue: null,
        sourceTaskId: null,
      },
    ],
  });
}

export function toggleTask(id: string) {
  set({
    ...state,
    today: state.today.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
  });
}

export function removeTask(id: string) {
  set({ ...state, today: state.today.filter((t) => t.id !== id) });
}

export function clearToday() {
  set({ ...state, today: [] });
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
  set({
    ...state,
    routines: state.routines.filter((r) => r.id !== id),
    today: state.today.filter((t) => t.routineId !== id),
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

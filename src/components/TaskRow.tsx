import { Check, Crosshair, GripVertical, Trash2 } from "lucide-react";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { hueDot } from "@/lib/hues";
import type { TodayTask } from "@/lib/ritual-store";

type Props = {
  task: TodayTask;
  focused: boolean;
  focusDisabled: boolean;
  dragging?: boolean;
  onCycle: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFocus: (id: string) => void;
  onDragStart: (e: ReactPointerEvent) => void;
};

const OPEN_X = 76;

export function TaskRow({
  task,
  focused,
  focusDisabled,
  dragging,
  onCycle,
  onDelete,
  onToggleFocus,
  onDragStart,
}: Props) {
  const [dx, setDx] = useState(0);
  const [open, setOpen] = useState(false);
  const start = useRef<{ x: number; y: number; active: boolean } | null>(null);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, active: false };
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const s = start.current;
    if (!s) return;
    const deltaX = e.clientX - s.x;
    const deltaY = e.clientY - s.y;
    if (!s.active) {
      if (Math.abs(deltaX) < 8 || Math.abs(deltaX) < Math.abs(deltaY)) return;
      s.active = true;
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    }
    const base = open ? OPEN_X : 0;
    setDx(Math.max(0, Math.min(OPEN_X + 12, base + deltaX)));
  };

  const endSwipe = () => {
    const s = start.current;
    start.current = null;
    if (!s?.active) return;
    const shouldOpen = dx > OPEN_X / 2;
    setOpen(shouldOpen);
    setDx(shouldOpen ? OPEN_X : 0);
  };

  const status = task.status;

  return (
    <div className="relative overflow-hidden rounded-2xl" data-row-id={task.id}>
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete ${task.title}`}
        className="absolute inset-y-1 left-1 grid w-[68px] place-items-center rounded-xl bg-destructive text-destructive-foreground"
      >
        <Trash2 size={18} strokeWidth={1.8} />
      </button>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endSwipe}
        onPointerCancel={endSwipe}
        style={{ transform: `translateX(${dx}px)` }}
        className={`relative flex touch-pan-y items-center gap-2.5 rounded-2xl bg-card px-2 py-3 ${
          dragging ? "shadow-lg ring-1 ring-border" : ""
        } ${start.current?.active ? "" : "transition-transform duration-200"}`}
      >
        <span
          className={`size-2.5 shrink-0 rounded-full ${
            task.hue ? hueDot[task.hue] : "bg-background ring-1 ring-border"
          }`}
        />

        <button
          type="button"
          onClick={() => (open ? (setOpen(false), setDx(0)) : onCycle(task.id))}
          aria-label={`Change status of ${task.title}`}
          className={`grid size-6 shrink-0 place-items-center rounded-full ring-1 ring-input transition-colors ${
            status === "done" ? "bg-primary text-primary-foreground" : "bg-background"
          }`}
          style={
            status === "doing"
              ? {
                  background:
                    "conic-gradient(var(--hue-amber) 0deg 100deg, var(--background) 100deg 360deg)",
                }
              : undefined
          }
        >
          {status === "done" ? <Check size={13} strokeWidth={3} /> : null}
        </button>

        <div
          className="min-w-0 flex-1"
          onClick={() => (open ? (setOpen(false), setDx(0)) : onCycle(task.id))}
        >
          <p
            className={`text-[15px] font-medium leading-snug ${
              status === "done" ? "text-foreground/40 line-through" : ""
            }`}
          >
            {task.title}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {status === "doing" ? "in progress · " : ""}
            {task.routineName ? `from ${task.routineName}` : "custom"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onToggleFocus(task.id)}
          disabled={!focused && focusDisabled}
          aria-label={focused ? `Remove ${task.title} from Focus` : `Add ${task.title} to Focus`}
          className={`grid size-8 shrink-0 place-items-center rounded-full transition-colors disabled:opacity-30 ${
            focused ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          <Crosshair size={16} strokeWidth={1.9} />
        </button>

        <span
          onPointerDown={onDragStart}
          role="button"
          tabIndex={-1}
          aria-label={`Reorder ${task.title}`}
          className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-full text-muted-foreground active:cursor-grabbing"
        >
          <GripVertical size={16} strokeWidth={1.9} />
        </span>
      </div>
    </div>
  );
}

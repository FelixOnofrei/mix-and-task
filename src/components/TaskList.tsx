import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { TaskRow } from "@/components/TaskRow";
import type { TodayTask } from "@/lib/ritual-store";

type Props = {
  tasks: TodayTask[];
  focusIds: string[];
  focusDisabled?: boolean;
  onCycle: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFocus: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
};

export function TaskList({
  tasks,
  focusIds,
  focusDisabled,
  onCycle,
  onDelete,
  onToggleFocus,
  onReorder,
}: Props) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDrag = (id: string) => (e: ReactPointerEvent) => {
    e.preventDefault();
    setDraggingId(id);
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture?.(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      const rows = containerRef.current?.querySelectorAll<HTMLElement>("[data-row-id]");
      if (!rows) return;
      for (const row of Array.from(rows)) {
        const rect = row.getBoundingClientRect();
        if (ev.clientY >= rect.top && ev.clientY <= rect.bottom) {
          const overId = row.dataset.rowId;
          if (overId && overId !== id) onReorder(id, overId);
          break;
        }
      }
    };
    const onUp = () => {
      setDraggingId(null);
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("pointercancel", onUp);
    };
    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
    target.addEventListener("pointercancel", onUp);
  };

  return (
    <div ref={containerRef} className="space-y-1.5">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          focused={focusIds.includes(task.id)}
          focusDisabled={focusDisabled}
          dragging={draggingId === task.id}
          onCycle={onCycle}
          onDelete={onDelete}
          onToggleFocus={onToggleFocus}
          onDragStart={startDrag(task.id)}
        />
      ))}
    </div>
  );
}

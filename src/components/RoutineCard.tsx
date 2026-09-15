import { hueDot } from "@/lib/hues";
import type { Routine, RoutineTask } from "@/lib/ritual-store";

type Props = {
  routine: Routine;
  pickedTaskIds: string[];
  onPick: (routine: Routine, task: RoutineTask) => void;
};

export function RoutineCard({ routine, pickedTaskIds, onPick }: Props) {
  const remaining = routine.tasks.filter((t) => !pickedTaskIds.includes(t.id)).length;

  return (
    <div className="flex w-[168px] shrink-0 flex-col rounded-2xl border border-border bg-card/70 p-3">
      <div className="flex items-center gap-2">
        <span className={`size-2.5 shrink-0 rounded-full ${hueDot[routine.hue]}`} />
        <span className="truncate font-display text-[15px] font-semibold leading-none">
          {routine.name}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        {routine.tasks.length === 0 && (
          <p className="text-[12px] text-muted-foreground">No tasks yet</p>
        )}
        {routine.tasks.map((task) => {
          const picked = pickedTaskIds.includes(task.id);
          return (
            <button
              key={task.id}
              type="button"
              disabled={picked}
              onClick={() => onPick(routine, task)}
              className="flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-secondary disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <span
                className={`grid size-4 shrink-0 place-items-center rounded-full text-[11px] leading-none ${
                  picked ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground"
                }`}
              >
                {picked ? "✓" : "+"}
              </span>
              <span className="truncate text-[12.5px]">{task.title}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
        <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {routine.tasks.length}/3 tasks
        </span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {remaining ? `${remaining} left` : "all picked"}
        </span>
      </div>
    </div>
  );
}

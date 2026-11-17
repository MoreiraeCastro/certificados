import { cn } from "@/lib/utils/cn";
import { ALVARA_STATUS_BADGE_CLASSES, ALVARA_STATUS_LABELS } from "@/lib/alvaras/status";
import type { AlvaraStatus } from "@/lib/types/database";

export function AlvaraStatusBadge({ status }: { status: AlvaraStatus }) {
  return (
    <span
      className={cn(
        "pill",
        ALVARA_STATUS_BADGE_CLASSES[status]
      )}
    >
      {ALVARA_STATUS_LABELS[status]}
    </span>
  );
}

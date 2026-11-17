import type { ReactNode } from "react";
import type { Icon as IconType } from "@/components/icons";

/** Estado vazio (DESIGN.md §6): ícone num container de 40px, título, uma linha de instrução e, se houver, uma ação. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: IconType;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`empty-state ${className ?? ""}`}>
      {Icon && (
        <span className="empty-state-icon" aria-hidden="true">
          <Icon size={18} strokeWidth={1.8} />
        </span>
      )}
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-text">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

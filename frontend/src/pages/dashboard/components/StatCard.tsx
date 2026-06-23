import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@Utils/cn";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: string;
  hintClassName?: string;
}

export function StatCard({ label, value, icon, hint, hintClassName }: StatCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold leading-tight">{value}</span>
          {hint && (
            <span className={cn("text-xs text-muted-foreground", hintClassName)}>{hint}</span>
          )}
        </div>
        {icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

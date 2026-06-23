import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

interface ChartCardProps {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
}

export function ChartCard({ title, description, className, children }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function EmptyChart({ message = "No data yet" }: { message?: string }) {
  return (
    <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

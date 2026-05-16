import { cn } from "@Utils/cn";
import React from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
  action?: React.ReactNode;
  topAction?: React.ReactNode;
  createPath?: string;
  createLabel?: string;
}

export const PageHeader = ({ 
  title, 
  description, 
  icon,
  breadcrumbs, 
  className, 
  action, 
  topAction,
  createPath,
  createLabel
}: PageHeaderProps) => {
  const createButton = createPath && (
    <Link to={createPath}>
      <Button className="bg-button-primary hover:bg-button-primary/80 text-white font-semibold px-6 rounded-full transition-all h-10 flex items-center gap-2 shadow-sm">
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        {createLabel || `Add ${title?.replace(/s$/, "") || "New"}`}
      </Button>
    </Link>
  );
  return (
    <div className={cn("flex flex-col gap-6 mb-10", className)}>
      {topAction && <div className="flex items-center -mb-2">{topAction}</div>}
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="hidden sm:flex p-3 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 mt-1 shadow-sm border border-blue-100/50 dark:border-blue-800/50">
              {icon}
            </div>
          )}
          <div className="space-y-1">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest mb-1">
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="mx-1">/</span>}
                    {crumb.href ? (
                      <Link to={crumb.href} className="hover:text-primary transition-colors">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground/80">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}
            <div className="flex flex-col gap-1">
              {title && (
                <h2 className="text-sm font-semibold text-foreground sm:text-3xl uppercase tracking-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground font-medium max-w-2xl">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
        {(action || createButton) && (
          <div className="flex items-center gap-2">
            {createButton}
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export const pageContainer = "";

export default PageHeader;

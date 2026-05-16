import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <>
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .cn-toast {
          position: relative;
          overflow: hidden !important;
          border: 1px solid var(--border) !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
        }
        .cn-toast::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          height: 4px;
          background: var(--primary);
          width: 100%;
          animation: toast-progress 3s linear forwards;
          z-index: 10;
        }
        .cn-toast[data-type="success"]::after { background: hsl(var(--success)); }
        .cn-toast[data-type="error"]::after { background: var(--destructive); }
        .cn-toast[data-type="info"]::after { background: hsl(var(--info)); }
        .cn-toast[data-type="warning"]::after { background: hsl(var(--warning)); }
        .cn-toast[data-type="loading"]::after { 
          animation: toast-progress 3s linear forwards;
          background: var(--primary); 
        }
      `}</style>
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        position="top-right"
        visibleToasts={1}
        duration={3000}
        icons={{
          success: <CircleCheckIcon className="size-4 text-success" />,
          info: <InfoIcon className="size-4 text-info" />,
          warning: <TriangleAlertIcon className="size-4 text-warning" />,
          error: <OctagonXIcon className="size-4 text-destructive" />,
          loading: <Loader2Icon className="size-4 animate-spin text-primary" />,
        }}
        style={
          {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
            "--border-radius": "var(--radius)",
          } as React.CSSProperties
        }
        toastOptions={{
          classNames: {
            toast:
              "cn-toast bg-popover text-popover-foreground border-border shadow-lg rounded-xl p-4 flex items-center gap-3",
            description: "text-muted-foreground",
            actionButton: "bg-primary text-primary-foreground",
            cancelButton: "bg-muted text-muted-foreground",
            success: "border-green-500/20",
            error: "border-destructive/20",
            info: "border-blue-500/20",
            warning: "border-yellow-500/20",
          },
        }}
        {...props}
      />
    </>
  );
};

export { Toaster };

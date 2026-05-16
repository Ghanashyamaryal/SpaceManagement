import { ThemeToggle } from "@Components/common/ThemeToggle"

export default function ThemeDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      
      {/* Top Bar */}
      <div className="flex justify-end p-4 border-b border-border">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center gap-6 p-6">
        
        <h1 className="text-3xl font-bold text-primary">
          Theme Demo
        </h1>

        <p className="text-muted-foreground">
          Toggle the theme from the top-right dropdown
        </p>

        {/* Card */}
        <div className="bg-card text-card-foreground border border-border p-6 rounded-lg w-full max-w-md text-center">
          This is a card component
        </div>
      </div>
    </div>
  )
}
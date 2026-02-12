export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-6">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-muted-foreground/10 border-t-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-primary tracking-tighter">n</span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <div className="h-2 w-32 rounded-full bg-muted animate-pulse" />
        <div className="h-2 w-20 rounded-full bg-muted/60 animate-pulse delay-150" />
      </div>
    </div>
  );
}

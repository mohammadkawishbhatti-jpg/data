export function SkeletonCard() {
  return (
    <div className="flex flex-col bg-card rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-muted w-full"></div>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="h-6 bg-muted rounded-md w-3/4"></div>
        <div className="h-4 bg-muted rounded-md w-full mt-2"></div>
        <div className="h-4 bg-muted rounded-md w-5/6"></div>
        <div className="mt-auto pt-4">
          <div className="h-10 bg-muted rounded-md w-full"></div>
        </div>
      </div>
    </div>
  );
}
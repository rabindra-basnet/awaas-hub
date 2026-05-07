export default function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="relative flex items-center gap-3 text-xs text-muted-foreground">
      <span className="flex-1 h-px bg-border" />
      <span className="shrink-0 uppercase tracking-wider font-medium">{label}</span>
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}

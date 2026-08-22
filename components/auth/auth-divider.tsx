export function AuthDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-ob-line" />
      </div>
      <div className="relative flex justify-center font-mono text-[11px] tracking-[0.12em] text-ob-mute uppercase">
        <span className="bg-ob-surface px-3">or</span>
      </div>
    </div>
  );
}

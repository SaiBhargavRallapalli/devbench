"use client";

export default function OpenPaletteButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("devbench:open-palette"))}
      className={className}
    >
      {children}
    </button>
  );
}

import { BRAND } from "@kb-booth/shared";

interface AppHeaderProps {
  pageLabel?: string;
}

export function AppHeader({ pageLabel }: AppHeaderProps) {
  return (
    <div className="px-5 pt-3 pb-2 flex items-center justify-between">
      <img
        src={BRAND.logoFoundation}
        alt={BRAND.foundation}
        style={{ height: 56, width: "auto", mixBlendMode: "multiply" }}
      />
      {pageLabel && (
        <span className="text-[#1E1E1E]/40" style={{ fontSize: 10, fontWeight: 600 }}>
          {pageLabel}
        </span>
      )}
    </div>
  );
}

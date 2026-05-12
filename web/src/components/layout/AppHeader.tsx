import { BRAND } from "@kb-booth/shared";

interface AppHeaderProps {
  pageLabel?: string;
}

export function AppHeader({ pageLabel }: AppHeaderProps) {
  return (
    <div className="px-5 pt-4 pb-2">
      {/* 윗줄: 재단 로고 + 재단명 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <img
            src={BRAND.logoFoundation}
            alt={BRAND.foundation}
            style={{ height: 18, width: "auto", mixBlendMode: "multiply" }}
          />
          <span
            className="text-[#1E1E1E]/60"
            style={{ fontSize: 10, fontWeight: 600, letterSpacing: "-0.01em" }}
          >
            {BRAND.foundation}
          </span>
        </div>
        {pageLabel && (
          <span className="text-[#1E1E1E]/40" style={{ fontSize: 10, fontWeight: 600 }}>
            {pageLabel}
          </span>
        )}
      </div>
      {/* 아랫줄: 대회 로고 + 10기 서포터즈 */}
      <div className="mt-1 flex items-center justify-center gap-1.5">
        <img
          src={BRAND.logoContest}
          alt={BRAND.contest}
          style={{ height: 16, width: "auto", mixBlendMode: "multiply" }}
        />
        <span
          className="text-[#1E1E1E]/60"
          style={{ fontSize: 10, fontWeight: 700 }}
        >
          {BRAND.supporters}
        </span>
      </div>
    </div>
  );
}

import { ReactNode } from "react";

export function PhoneFrame({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <div className="text-[12px] tracking-wide text-neutral-500 uppercase">{label}</div>
      )}
      <div
        className="relative bg-[#FFF9E6] overflow-hidden rounded-[40px] border-[10px] border-[#1E1E1E] shadow-2xl"
        style={{ width: 375, height: 812 }}
      >
        <div className="absolute top-0 left-0 right-0 h-7 flex justify-center pointer-events-none z-50">
          <div className="mt-2 w-[110px] h-5 bg-[#1E1E1E] rounded-full" />
        </div>
        <div className="w-full h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { MapPin, Plus, Trash2, Gift, Check, X, Pencil } from "lucide-react";

// 어드민: 장소 + 장소별 경품 관리. 장소마다 경품 풀이 따로 존재한다.

interface Prize {
  id: number;
  locationId: string;
  rank: number;
  name: string;
  total: number;
  remaining: number;
}

interface AdminLocation {
  id: string;
  name: string;
  active: boolean;
  sortOrder: number;
  totalRemaining: number;
  totalStock: number;
  prizes: Prize[];
}

async function mutate<T>(path: string, method: string, key: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json()) as { ok: boolean; data?: T; error?: { message: string } };
  if (!json.ok) throw new Error(json.error?.message ?? "오류가 발생했습니다");
  return json.data as T;
}

export function LocationsManager({ authKey }: { authKey: string }) {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLocName, setNewLocName] = useState("");

  const refresh = useCallback(async () => {
    try {
      const data = await mutate<AdminLocation[]>("/api/admin/locations", "GET", authKey);
      setLocations(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오기 실패");
    } finally {
      setLoading(false);
    }
  }, [authKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const run = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "작업 실패");
    }
  };

  const addLocation = () => {
    const name = newLocName.trim();
    if (!name) return;
    void run(async () => {
      await mutate("/api/admin/locations", "POST", authKey, { name });
      setNewLocName("");
    });
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-4 border-[#FFCC00] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-red-700" style={{ fontSize: 12 }}>
          {error}
        </div>
      )}

      {/* 장소 추가 */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm flex items-center gap-2">
        <MapPin className="w-4 h-4 text-[#1E1E1E]/40 shrink-0" />
        <input
          value={newLocName}
          onChange={(e) => setNewLocName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addLocation(); }}
          placeholder="새 장소 이름 (예: A부스)"
          className="flex-1 min-w-0 outline-none text-[#1E1E1E]"
          style={{ fontSize: 14 }}
        />
        <button
          onClick={addLocation}
          disabled={!newLocName.trim()}
          className="shrink-0 bg-[#FFCC00] text-[#1E1E1E] rounded-xl px-3 py-2 flex items-center gap-1 disabled:opacity-40"
          style={{ fontSize: 13, fontWeight: 700 }}
        >
          <Plus className="w-4 h-4" /> 장소
        </button>
      </div>

      {locations.length === 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
          <MapPin className="w-8 h-8 text-[#1E1E1E]/20 mx-auto mb-2" />
          <p className="text-[#1E1E1E]/50" style={{ fontSize: 13 }}>등록된 장소가 없습니다</p>
          <p className="text-[#1E1E1E]/30 mt-1" style={{ fontSize: 11 }}>위에서 장소를 먼저 추가하세요</p>
        </div>
      )}

      {locations.map((loc) => (
        <LocationCard key={loc.id} loc={loc} authKey={authKey} onChange={run} />
      ))}
    </div>
  );
}

function LocationCard({
  loc,
  authKey,
  onChange,
}: {
  loc: AdminLocation;
  authKey: string;
  onChange: (fn: () => Promise<unknown>) => Promise<void>;
}) {
  const pct = loc.totalStock > 0 ? Math.round((loc.totalRemaining / loc.totalStock) * 100) : 0;
  const barColor = pct > 50 ? "#5DD3B0" : pct > 20 ? "#FFCC00" : "#FF7E6B";

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      {/* 헤더: 장소명 + 노출 토글 + 삭제 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#FFF9E6] flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-[#1E1E1E]" />
          </div>
          <p className="text-[#1E1E1E] truncate" style={{ fontSize: 16, fontWeight: 800 }}>{loc.name}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => void onChange(() =>
              mutate(`/api/admin/locations/${loc.id}`, "PATCH", authKey, { active: !loc.active }),
            )}
            className="rounded-full px-2.5 py-1"
            style={
              loc.active
                ? { background: "#DCFCE7", color: "#15803D", fontSize: 10, fontWeight: 700 }
                : { background: "#F0EDE4", color: "#1E1E1E80", fontSize: 10, fontWeight: 700 }
            }
          >
            {loc.active ? "노출중" : "숨김"}
          </button>
          <button
            onClick={() => {
              if (confirm(`'${loc.name}' 장소와 경품을 모두 삭제할까요?`)) {
                void onChange(() => mutate(`/api/admin/locations/${loc.id}`, "DELETE", authKey));
              }
            }}
            className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      </div>

      {/* 장소별 재고 요약 */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[#1E1E1E]/40" style={{ fontSize: 11, fontWeight: 600 }}>남은 경품</span>
        <span className="text-[#1E1E1E]" style={{ fontSize: 13, fontWeight: 700 }}>
          {loc.totalRemaining} / {loc.totalStock}개
        </span>
      </div>
      <div className="mt-1.5 h-2 bg-[#F0EDE4] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor, transition: "width 0.4s" }} />
      </div>

      {/* 경품 목록 */}
      <div className="mt-3 space-y-2">
        {loc.prizes.length === 0 && (
          <p className="text-[#1E1E1E]/30 text-center py-3" style={{ fontSize: 12 }}>등록된 경품이 없습니다</p>
        )}
        {loc.prizes.map((p) => (
          <PrizeRow key={p.id} prize={p} authKey={authKey} onChange={onChange} />
        ))}
      </div>

      {/* 경품 추가 */}
      <AddPrizeForm locationId={loc.id} authKey={authKey} onChange={onChange} />
    </div>
  );
}

function PrizeRow({
  prize,
  authKey,
  onChange,
}: {
  prize: Prize;
  authKey: string;
  onChange: (fn: () => Promise<unknown>) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(prize.name);
  const [rank, setRank] = useState(String(prize.rank));
  const [total, setTotal] = useState(String(prize.total));
  const [remaining, setRemaining] = useState(String(prize.remaining));

  const save = () => {
    void onChange(() =>
      mutate(`/api/admin/prizes/${prize.id}`, "PATCH", authKey, {
        name: name.trim() || prize.name,
        rank: Number(rank) || 0,
        total: Math.max(0, Number(total) || 0),
        remaining: Math.max(0, Number(remaining) || 0),
      }),
    ).then(() => setEditing(false));
  };

  if (editing) {
    return (
      <div className="bg-[#FFF9E6] rounded-xl p-2.5 space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="경품 이름"
          className="w-full bg-white rounded-lg px-2.5 py-1.5 outline-none border border-[#FFCC00]"
          style={{ fontSize: 13 }}
        />
        <div className="flex gap-2">
          <LabeledNum label="등급" value={rank} onChange={setRank} />
          <LabeledNum label="총량" value={total} onChange={setTotal} />
          <LabeledNum label="잔여" value={remaining} onChange={setRemaining} />
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="flex-1 bg-[#FFCC00] text-[#1E1E1E] rounded-lg py-1.5 flex items-center justify-center gap-1" style={{ fontSize: 12, fontWeight: 700 }}>
            <Check className="w-3.5 h-3.5" /> 저장
          </button>
          <button onClick={() => setEditing(false)} className="px-3 bg-white border border-[#1E1E1E]/10 rounded-lg py-1.5" style={{ fontSize: 12, fontWeight: 600 }}>
            <X className="w-3.5 h-3.5 text-[#1E1E1E]/50" />
          </button>
        </div>
      </div>
    );
  }

  const pct = prize.total > 0 ? Math.round((prize.remaining / prize.total) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5 bg-[#FAF8F2] rounded-xl px-3 py-2.5">
      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0">
        <Gift className="w-3.5 h-3.5 text-[#1E1E1E]/50" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {prize.rank > 0 && (
            <span className="rounded-full bg-[#1E1E1E]/5 px-1.5 py-0.5 text-[#1E1E1E]/60" style={{ fontSize: 9, fontWeight: 700 }}>{prize.rank}등</span>
          )}
          <span className="text-[#1E1E1E] truncate" style={{ fontSize: 13, fontWeight: 700 }}>{prize.name}</span>
        </div>
        <span className="text-[#1E1E1E]/40" style={{ fontSize: 10 }}>남은 {prize.remaining} / {prize.total}개 ({pct}%)</span>
      </div>
      <button onClick={() => setEditing(true)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0">
        <Pencil className="w-3.5 h-3.5 text-[#1E1E1E]/50" />
      </button>
      <button
        onClick={() => {
          if (confirm(`'${prize.name}' 경품을 삭제할까요?`)) {
            void onChange(() => mutate(`/api/admin/prizes/${prize.id}`, "DELETE", authKey));
          }
        }}
        className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0"
      >
        <Trash2 className="w-3.5 h-3.5 text-red-400" />
      </button>
    </div>
  );
}

function AddPrizeForm({
  locationId,
  authKey,
  onChange,
}: {
  locationId: string;
  authKey: string;
  onChange: (fn: () => Promise<unknown>) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [total, setTotal] = useState("");

  const submit = () => {
    if (!name.trim() || !total) return;
    void onChange(() =>
      mutate(`/api/admin/locations/${locationId}/prizes`, "POST", authKey, {
        name: name.trim(),
        rank: Number(rank) || 0,
        total: Math.max(0, Number(total) || 0),
      }),
    ).then(() => {
      setName("");
      setRank("");
      setTotal("");
      setOpen(false);
    });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 w-full border-2 border-dashed border-[#FFCC00]/60 rounded-xl py-2.5 flex items-center justify-center gap-1 text-[#1E1E1E]/60"
        style={{ fontSize: 13, fontWeight: 700 }}
      >
        <Plus className="w-4 h-4" /> 경품 추가
      </button>
    );
  }

  return (
    <div className="mt-3 bg-[#FFF9E6] rounded-xl p-2.5 space-y-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="경품 이름 (예: 스타벅스 기프티콘)"
        autoFocus
        className="w-full bg-white rounded-lg px-2.5 py-1.5 outline-none border border-[#FFCC00]"
        style={{ fontSize: 13 }}
      />
      <div className="flex gap-2">
        <LabeledNum label="등급(0=없음)" value={rank} onChange={setRank} />
        <LabeledNum label="수량" value={total} onChange={setTotal} />
      </div>
      <div className="flex gap-2">
        <button onClick={submit} disabled={!name.trim() || !total} className="flex-1 bg-[#FFCC00] text-[#1E1E1E] rounded-lg py-1.5 flex items-center justify-center gap-1 disabled:opacity-40" style={{ fontSize: 12, fontWeight: 700 }}>
          <Plus className="w-3.5 h-3.5" /> 등록
        </button>
        <button onClick={() => setOpen(false)} className="px-3 bg-white border border-[#1E1E1E]/10 rounded-lg py-1.5" style={{ fontSize: 12, fontWeight: 600 }}>
          취소
        </button>
      </div>
    </div>
  );
}

function LabeledNum({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex-1 min-w-0">
      <span className="block text-[#1E1E1E]/40 mb-0.5" style={{ fontSize: 9, fontWeight: 600 }}>{label}</span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white rounded-lg px-2 py-1.5 outline-none border border-[#1E1E1E]/10"
        style={{ fontSize: 13 }}
      />
    </label>
  );
}

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, LogOut, Users, CheckCircle2, Clock, Gift, Activity } from "lucide-react";
import { LocationsManager } from "../app/components/admin/LocationsManager";

const STORAGE_KEY = "kb_admin_key";

const TYPE_META: Record<string, { code: string; label: string; color: string }> = {
  investigator: { code: "SAGE", label: "지식나눔 탐구자", color: "#6BB5FF" },
  helper:       { code: "WARM", label: "공감기반 조력자", color: "#B5A0E5" },
  leader:       { code: "BOLD", label: "실천적 현장 리더", color: "#FF7E6B" },
  innovator:    { code: "NOVA", label: "창의적 사회혁신가", color: "#5DD3B0" },
};

interface Stats {
  total: number;
  today: number;
  completed: number;
  inProgress: number;
  prizeDrawn: number;
  avgMinutes: number;
  byType: Record<string, number>;
}

interface Session {
  id: string;
  createdAt: string;
  resultType: string | null;
  nickname: string | null;
  cardNo: string | null;
  issuedAt: string | null;
  prizeDrawn: boolean;
  gender: string | null;
  realName: string | null;
  contact: string | null;
  birthDate: string | null;
}

interface Log {
  id: number;
  sessionId: string | null;
  type: string;
  meta: string | null;
  createdAt: string;
}

async function apiFetch<T>(path: string, key: string): Promise<T> {
  const res = await fetch(path, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const json = (await res.json()) as { ok: boolean; data?: T; error?: { message: string } };
  if (!json.ok) throw new Error(json.error?.message ?? "오류");
  return json.data as T;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ── 로그인 화면 ────────────────────────────────────────────
function LoginScreen({
  onLogin,
  loading,
  error,
}: {
  onLogin: (key: string) => void;
  loading: boolean;
  error: string;
}) {
  const [val, setVal] = useState("");
  return (
    <div className="min-h-screen bg-[#FFF9E6] flex items-center justify-center p-6" style={{ colorScheme: "light" }}>
      <div className="bg-white rounded-3xl p-8 shadow-lg w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🛠️</div>
          <h1 className="text-[#1E1E1E]" style={{ fontSize: 22, fontWeight: 800 }}>어드민 대시보드</h1>
          <p className="text-[#1E1E1E]/50 mt-1" style={{ fontSize: 13 }}>관리자 키를 입력하세요</p>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); onLogin(val); }}
          className="space-y-3"
        >
          <input
            type="password"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="관리자 키"
            autoFocus
            className="w-full border-2 border-[#FFCC00] rounded-2xl px-4 py-3 text-[#1E1E1E] outline-none"
            style={{ fontSize: 15 }}
          />
          {error && <p className="text-red-500 text-center" style={{ fontSize: 12 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !val}
            className="w-full bg-[#FFCC00] text-[#1E1E1E] rounded-2xl py-3 shadow-[0_4px_0_#E0B400] disabled:opacity-50"
            style={{ fontSize: 16, fontWeight: 700 }}
          >
            {loading ? "확인 중..." : "입장하기"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── 통계 탭 ───────────────────────────────────────────────
function StatsTab({ stats }: { stats: Stats }) {
  const maxCount = Math.max(...Object.values(stats.byType), 1);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Users className="w-5 h-5" />}         label="전체 참여"  value={stats.total}      unit="명" color="#6BB5FF" />
        <StatCard icon={<Activity className="w-5 h-5" />}       label="오늘 참여"  value={stats.today}      unit="명" color="#5DD3B0" />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />}   label="발급 완료"  value={stats.completed}  unit="명" color="#FFCC00" />
        <StatCard icon={<Clock className="w-5 h-5" />}          label="진행 중"    value={stats.inProgress} unit="명" color="#FF7E6B" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-[#1E1E1E]/50" style={{ fontSize: 10, fontWeight: 600 }}>평균 소요 시간</p>
          <p className="text-[#1E1E1E] mt-1" style={{ fontSize: 30, fontWeight: 900, lineHeight: 1 }}>
            {stats.avgMinutes}<span style={{ fontSize: 14 }}> 분</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-[#1E1E1E]/50" style={{ fontSize: 10, fontWeight: 600 }}>경품 뽑기 완료</p>
          <p className="text-[#1E1E1E] mt-1" style={{ fontSize: 30, fontWeight: 900, lineHeight: 1 }}>
            {stats.prizeDrawn}<span style={{ fontSize: 14 }}> 명</span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-[#1E1E1E] mb-3" style={{ fontSize: 13, fontWeight: 700 }}>유형 분포</p>
        <div className="space-y-3">
          {(["investigator", "helper", "leader", "innovator"] as const).map((t) => {
            const count = stats.byType[t] ?? 0;
            const pct = stats.completed > 0 ? Math.round((count / stats.completed) * 100) : 0;
            const barW = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
            const { code, label, color } = TYPE_META[t];
            return (
              <div key={t}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full px-2 py-0.5 text-white" style={{ background: color, fontSize: 9, fontWeight: 700 }}>{code}</span>
                    <span className="text-[#1E1E1E]/60" style={{ fontSize: 11 }}>{label}</span>
                  </div>
                  <span className="text-[#1E1E1E]" style={{ fontSize: 11, fontWeight: 700 }}>{count}명 ({pct}%)</span>
                </div>
                <div className="h-2 bg-[#F0EDE4] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${barW}%`, background: color, transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── 세션 탭 ───────────────────────────────────────────────
function SessionsTab({ sessions }: { sessions: Session[] }) {
  return (
    <div className="space-y-2">
      <p className="text-[#1E1E1E]/50" style={{ fontSize: 11, fontWeight: 600 }}>최근 세션 {sessions.length}건 (최신순)</p>
      {sessions.map((s) => {
        const meta = s.resultType ? TYPE_META[s.resultType] : null;
        return (
          <div key={s.id} className="bg-white rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {meta && (
                    <span className="rounded-full px-2 py-0.5 text-white" style={{ background: meta.color, fontSize: 9, fontWeight: 700 }}>
                      {meta.code}
                    </span>
                  )}
                  {s.gender && (
                    <span className="text-[#1E1E1E]/40" style={{ fontSize: 9 }}>{s.gender === "F" ? "여" : "남"}</span>
                  )}
                  {s.prizeDrawn && <span style={{ fontSize: 10 }}>🎁</span>}
                </div>
                <p className="mt-1 text-[#1E1E1E]" style={{ fontSize: 13, fontWeight: 700 }}>
                  {s.realName || s.nickname || <span className="text-[#1E1E1E]/30">이름 없음</span>}
                </p>
                {s.contact && (
                  <p className="text-[#1E1E1E]/40" style={{ fontSize: 10 }}>{s.contact}</p>
                )}
                {s.birthDate && (
                  <p className="text-[#1E1E1E]/30" style={{ fontSize: 9 }}>{s.birthDate}</p>
                )}
                {s.cardNo && (
                  <p className="text-[#1E1E1E]/30 mt-0.5" style={{ fontSize: 9 }}>{s.cardNo}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[#1E1E1E]/40" style={{ fontSize: 9 }}>{fmtTime(s.createdAt)}</p>
                <span
                  className="mt-1 inline-block rounded-full px-2 py-0.5"
                  style={
                    s.cardNo
                      ? { background: "#DCFCE7", color: "#15803D", fontSize: 9, fontWeight: 700 }
                      : { background: "#FEF9C3", color: "#854D0E", fontSize: 9, fontWeight: 700 }
                  }
                >
                  {s.cardNo ? "발급완료" : "진행중"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 로그 탭 ───────────────────────────────────────────────
function LogsTab({ logs }: { logs: Log[] }) {
  const LOG_COLOR: Record<string, string> = {
    session_created: "#6BB5FF",
    card_issued:     "#5DD3B0",
    prize_drawn:     "#FFCC00",
  };
  return (
    <div className="space-y-2">
      <p className="text-[#1E1E1E]/50" style={{ fontSize: 11, fontWeight: 600 }}>최근 이벤트 {logs.length}건</p>
      {logs.map((log) => (
        <div key={log.id} className="bg-white rounded-xl px-3.5 py-2.5 shadow-sm flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: LOG_COLOR[log.type] ?? "#ccc" }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[#1E1E1E]" style={{ fontSize: 12, fontWeight: 700 }}>{log.type}</p>
            {log.meta && (
              <p className="text-[#1E1E1E]/40 truncate" style={{ fontSize: 9 }}>{log.meta}</p>
            )}
          </div>
          <p className="text-[#1E1E1E]/40 flex-shrink-0" style={{ fontSize: 9 }}>{fmtTime(log.createdAt)}</p>
        </div>
      ))}
    </div>
  );
}

// ── StatCard 공통 컴포넌트 ────────────────────────────────
function StatCard({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: number; unit: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${color}20`, color }}>
          {icon}
        </div>
        <p className="text-[#1E1E1E]/50" style={{ fontSize: 10, fontWeight: 600 }}>{label}</p>
      </div>
      <p className="text-[#1E1E1E]" style={{ fontSize: 32, fontWeight: 900, lineHeight: 1 }}>
        {value}<span style={{ fontSize: 14 }}>{unit}</span>
      </p>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────
type Tab = "stats" | "sessions" | "prizes" | "logs";

export function AdminPage() {
  const [key, setKey] = useState(() => localStorage.getItem(STORAGE_KEY) ?? "");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [stats, setStats] = useState<Stats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [tab, setTab] = useState<Tab>("stats");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchAll = useCallback(async (k: string) => {
    setLoading(true);
    try {
      const [s, sessData, l] = await Promise.all([
        apiFetch<Stats>("/api/admin/stats", k),
        apiFetch<{ sessions: Session[] }>("/api/admin/sessions?limit=50", k),
        apiFetch<Log[]>("/api/admin/logs?limit=30", k),
      ]);
      setStats(s);
      setSessions(sessData.sessions);
      setLogs(l);
      setAuthed(true);
      setLastRefreshed(new Date());
      localStorage.setItem(STORAGE_KEY, k);
    } catch {
      setAuthed(false);
      localStorage.removeItem(STORAGE_KEY);
      setLoginError("관리자 키가 올바르지 않습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  // 저장된 키로 자동 로그인
  useEffect(() => {
    if (key) void fetchAll(key);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authed) {
    return (
      <LoginScreen
        onLogin={(k) => { setKey(k); void fetchAll(k); }}
        loading={loading}
        error={loginError}
      />
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "stats",    label: "통계",   icon: <Activity className="w-3.5 h-3.5" /> },
    { id: "sessions", label: "세션",   icon: <Users className="w-3.5 h-3.5" /> },
    { id: "prizes",   label: "경품",   icon: <Gift className="w-3.5 h-3.5" /> },
    { id: "logs",     label: "로그",   icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FFF9E6]" style={{ colorScheme: "light" }}>
      {/* 헤더 */}
      <div className="bg-white border-b border-[#1E1E1E]/10 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-[#1E1E1E]" style={{ fontSize: 17, fontWeight: 800 }}>KB 부스 어드민</h1>
          {lastRefreshed && (
            <p className="text-[#1E1E1E]/40" style={{ fontSize: 10 }}>
              갱신 {fmtTime(lastRefreshed.toISOString())}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void fetchAll(key)}
            disabled={loading}
            className="w-9 h-9 bg-[#FFCC00] rounded-full flex items-center justify-center shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#1E1E1E] ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => { setAuthed(false); setKey(""); localStorage.removeItem(STORAGE_KEY); }}
            className="w-9 h-9 bg-white border border-[#1E1E1E]/10 rounded-full flex items-center justify-center"
          >
            <LogOut className="w-4 h-4 text-[#1E1E1E]/50" />
          </button>
        </div>
      </div>

      {/* 탭 바 */}
      <div className="px-5 pt-4">
        <div className="flex gap-1.5 bg-white rounded-2xl p-1.5 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 rounded-xl py-2 flex items-center justify-center gap-1 transition"
              style={
                tab === t.id
                  ? { background: "#FFCC00", color: "#1E1E1E", fontSize: 12, fontWeight: 700 }
                  : { color: "#1E1E1E60", fontSize: 12, fontWeight: 600 }
              }
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="px-5 py-4 pb-12">
        {tab === "stats"    && stats    && <StatsTab stats={stats} />}
        {tab === "sessions"              && <SessionsTab sessions={sessions} />}
        {tab === "prizes"                && <LocationsManager authKey={key} />}
        {tab === "logs"                  && <LogsTab logs={logs} />}
      </div>
    </div>
  );
}

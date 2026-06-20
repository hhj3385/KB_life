import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { LocationSelectScreen } from "../app/components/screens/LocationSelectScreen";
import { useSession } from "../lib/session-context";
import { api, ApiError, type PublicLocation } from "../lib/api";

export function LocationPage() {
  const navigate = useNavigate();
  const { initSession } = useSession();

  const [locations, setLocations] = useState<PublicLocation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const list = await api.locations.list();
        if (!alive) return;
        setLocations(list);
        // 장소가 하나뿐이면 자동 선택
        if (list.length === 1) setSelectedId(list[0].id);
      } catch {
        if (alive) setError("장소 목록을 불러오지 못했습니다");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleNext = async () => {
    if (busy) return;
    // 장소가 있는데 선택 안 했으면 중단
    if (locations.length > 0 && !selectedId) return;
    setBusy(true);
    setError(null);
    try {
      const locationId = selectedId ?? undefined;
      const { sessionId } = await api.session.create(locationId);
      initSession(sessionId, locationId ?? null);
      void navigate(`/s/${sessionId}/photo`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setBusy(false);
    }
  };

  return (
    <LocationSelectScreen
      locations={locations}
      selectedId={selectedId}
      onSelect={setSelectedId}
      onNext={() => void handleNext()}
      onBack={() => void navigate("/")}
      loading={loading}
      busy={busy}
      error={error}
    />
  );
}

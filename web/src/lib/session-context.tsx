import { createContext, useContext, useState, useCallback } from "react";
import type { ResultType, CharacterConfig, ScoreResult } from "@kb-booth/shared";

interface SessionState {
  sessionId: string | null;
  responses: number[];
  resultType: ResultType | null;
  scores: Record<ResultType, number> | null;
  character: CharacterConfig | null;
  nickname: string;
  pledge: string;
  cardNo: string | null;
  photoUrl: string | null;
}

interface SessionActions {
  initSession: (id: string) => void;
  setResponses: (responses: number[]) => void;
  setResult: (result: ScoreResult) => void;
  setCharacter: (config: CharacterConfig) => void;
  setPledgeInfo: (nickname: string, pledge: string) => void;
  setCardNo: (cardNo: string) => void;
  setPhotoUrl: (url: string) => void;
  reset: () => void;
}

const defaultState: SessionState = {
  sessionId: null,
  responses: [],
  resultType: null,
  scores: null,
  character: null,
  nickname: "",
  pledge: "",
  cardNo: null,
  photoUrl: null,
};

const SessionContext = createContext<(SessionState & SessionActions) | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>(defaultState);

  const initSession = useCallback((id: string) => {
    setState({ ...defaultState, sessionId: id });
  }, []);

  const setResponses = useCallback((responses: number[]) => {
    setState((s) => ({ ...s, responses }));
  }, []);

  const setResult = useCallback((result: ScoreResult) => {
    setState((s) => ({ ...s, resultType: result.resultType, scores: result.scores }));
  }, []);

  const setCharacter = useCallback((config: CharacterConfig) => {
    setState((s) => ({ ...s, character: config }));
  }, []);

  const setPledgeInfo = useCallback((nickname: string, pledge: string) => {
    setState((s) => ({ ...s, nickname, pledge }));
  }, []);

  const setCardNo = useCallback((cardNo: string) => {
    setState((s) => ({ ...s, cardNo }));
  }, []);

  const setPhotoUrl = useCallback((url: string) => {
    setState((s) => ({ ...s, photoUrl: url }));
  }, []);

  const reset = useCallback(() => setState(defaultState), []);

  return (
    <SessionContext.Provider
      value={{
        ...state,
        initSession,
        setResponses,
        setResult,
        setCharacter,
        setPledgeInfo,
        setCardNo,
        setPhotoUrl,
        reset,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

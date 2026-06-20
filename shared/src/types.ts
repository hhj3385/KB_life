export type ResultType = "investigator" | "helper" | "leader" | "innovator";
export type Gender = "F" | "M";
// F는 band 사용 가능, bucket 불가 / M은 bucket 사용 가능, band 불가
export type Accessory = "none" | "cap" | "beanie" | "band" | "bucket" | "glasses";

export interface ScoreResult {
  resultType: ResultType;
  scores: Record<ResultType, number>;
}

export interface CharacterConfig {
  gender: Gender;
  hair: number;     // 1~5
  accessory: Accessory;
}

export interface SessionData {
  id: string;
  resultType?: ResultType;
  scores?: Record<ResultType, number>;
  character?: CharacterConfig;
  nickname?: string;
  pledge?: string;
  cardNo?: string;
  locationId?: string;
}

// 부스 운영 장소
export interface Location {
  id: string;
  name: string;
  active: boolean;
  sortOrder: number;
}

// 장소별 경품
export interface Prize {
  id: number;
  locationId: string;
  rank: number;
  name: string;
  total: number;
  remaining: number;
}

// 경품 추첨 결과
export interface DrawResult {
  // 추첨된 경품 (소진 시 null)
  prize: { id: number; name: string; rank: number } | null;
  // 소진으로 뽑지 못한 경우 true
  soldOut: boolean;
}

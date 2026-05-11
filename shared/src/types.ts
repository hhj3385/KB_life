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
}

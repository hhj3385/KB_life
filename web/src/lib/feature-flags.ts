// 기능 토글. 경품(장소 선택·추첨) 기능을 일시적으로 끄고 켤 수 있다.
//
// 기본값은 비활성화. 재활성화하려면 web 빌드 시 환경변수를 주면 된다:
//   VITE_PRIZE_ENABLED=true
// (Railway web 서비스의 Variables에 추가 후 재배포)
//
// 비활성화 상태에서도 DB 스키마/서버 엔드포인트는 그대로 유지되므로
// 배포 시 prisma db push가 항상 "in sync"라 크래시가 나지 않는다.
export const PRIZE_FEATURE_ENABLED =
  import.meta.env.VITE_PRIZE_ENABLED === "true";

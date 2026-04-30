# hr-side

직원 입퇴사, 휴직, 팀 이동, 팀장 보직, 조직 구조 이력을 로컬 CSV로 관리하고,
특정 날짜 기준 조직도와 HR 통계를 단일 HTML로 생성하는 저장소다.

현재 산출물은 [dist/index.html](/Users/shlee/Developments/hr-side/dist/index.html) 하나다.
`scripts/build-report.mjs`가 `data/current/*.csv`를 읽어 데이터를 HTML 내부에 직접 포함한다.

## 현재 구현 범위

- 기준 날짜 선택
- 총 재직 / 근무 / 휴직 / 당해연도 입사 / 당해연도 퇴사 KPI
- 조직도 카드형 뷰
- 팀명 + 리더 이름/직함 표시
- 카드 hover 또는 focus 시 직속 팀원 popover
- 팀 요약 테이블
- 직원 검색 결과 표시
- 빌드 시 CSV 무결성 검사와 경고 개수 출력

현재 UI에는 검증 경고 목록을 따로 렌더링하지 않는다.
경고는 `npm run build` 실행 결과로 확인한다.

## 빠른 시작

```bash
npm run sample
npm run build
```

그 다음 [dist/index.html](/Users/shlee/Developments/hr-side/dist/index.html)을 열면 된다.

CSV를 수정한 뒤에는 반드시 다시 build 해야 최신 내용이 반영된다.

로컬 preview 서버가 필요하면 아래처럼 실행한다.

```bash
python3 -m http.server 4173 -d dist
```

브라우저에서 `http://127.0.0.1:4173`로 확인한다.

## 작업 흐름

1. `data/current/*.csv` 수정
2. `npm run build`
3. `dist/index.html` 확인

기본 샘플을 초기 상태로 다시 만들고 싶으면 먼저 `npm run sample`을 실행한다.

## 명령

```bash
npm run sample
npm run build
node scripts/build-report.mjs --default-date 2026-04-30
node scripts/build-report.mjs --check-date 2026-04-30
node scripts/build-report.mjs --input-dir data/current --output dist/index.html
```

## 입력 데이터

실제 작업 데이터는 아래 7개 파일이다.

- `data/current/Employees.csv`
- `data/current/Teams.csv`
- `data/current/Employment_Periods.csv`
- `data/current/Leave_Periods.csv`
- `data/current/Team_Assignments.csv`
- `data/current/Role_Assignments.csv`
- `data/current/Team_Structure_History.csv`

기본 샘플은 `4개 본부 / 20개 팀 / 200명` 규모다.
역할 체계는 `대표 / 부대표 / 전무 / 상무 / 이사 / 팀장 / 팀원`을 사용한다.

## 주요 파일

- [AGENTS.md](/Users/shlee/Developments/hr-side/AGENTS.md)
- [scripts/build-report.mjs](/Users/shlee/Developments/hr-side/scripts/build-report.mjs)
- [scripts/generate-sample-data.mjs](/Users/shlee/Developments/hr-side/scripts/generate-sample-data.mjs)
- [docs/operations/data-rules.md](/Users/shlee/Developments/hr-side/docs/operations/data-rules.md)
- [CSV 스키마](docs/templates/csv-files.md)
- [docs/samples/reference-company.md](/Users/shlee/Developments/hr-side/docs/samples/reference-company.md)

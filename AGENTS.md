# AGENTS.md

## 프로젝트 개요

이 저장소는 `직원 입퇴사 / 휴직 / 팀 이동 / 팀장 보직 / 조직 구조 이력`을 바탕으로
특정 날짜 기준 조직도와 HR 통계를 조회하는 `로컬 CSV -> 단일 HTML 리포트` 프로젝트다.

현재 구현은 문서 초안 단계가 아니라 실제 동작 가능한 MVP다.
핵심 흐름은 아래와 같다.

1. `data/current/*.csv` 수정
2. `npm run build`
3. [dist/index.html](/Users/shlee/Developments/hr-side/dist/index.html) 확인

CSV를 수정한 뒤에는 반드시 다시 build 해야 한다.

## 현재 구현 상태

현재 리포트는 아래를 지원한다.

- 기준 날짜 선택
- 총 재직 / 근무 / 휴직 / 당해연도 입사 / 당해연도 퇴사 카드
- 카드형 조직도
- 팀명 + 리더 이름/직함 표시
- hover 또는 focus 시 직속 팀원 popover
- 팀 요약 테이블
- 직원 검색 결과 표시

현재 리포트는 아래를 지원하지 않는다.

- 브라우저 내 검증 경고 목록
- 서버 저장
- Google Spreadsheet 연동
- 다중 데이터셋 전환 UI

무결성 검사는 `scripts/build-report.mjs`가 수행하고, 결과는 CLI 로그로 출력한다.

## 작업 원칙

- 기본 허브 문서는 이 `AGENTS.md`다.
- 문서는 현재 구현을 설명해야 하며, 예전 기획안이나 미사용 구조를 남기지 않는다.
- 컬럼이나 규칙을 바꾸면 문서와 샘플 데이터, 생성 스크립트를 같이 갱신한다.
- 한국어를 기본으로 쓰되 필요하면 영어 technical term를 병기한다.

## 핵심 파일

### 리포트 생성

- [scripts/build-report.mjs](/Users/shlee/Developments/hr-side/scripts/build-report.mjs)
  - CSV를 읽어 self-contained HTML을 생성
- [dist/index.html](/Users/shlee/Developments/hr-side/dist/index.html)
  - 생성 결과물

### 샘플 데이터 생성

- [scripts/generate-sample-data.mjs](/Users/shlee/Developments/hr-side/scripts/generate-sample-data.mjs)
  - `data/current/*.csv`를 샘플 데이터로 재생성

### 입력 데이터

- `data/current/Employees.csv`
- `data/current/Teams.csv`
- `data/current/Employment_Periods.csv`
- `data/current/Leave_Periods.csv`
- `data/current/Team_Assignments.csv`
- `data/current/Role_Assignments.csv`
- `data/current/Team_Structure_History.csv`

## 문서 구조

- [README.md](/Users/shlee/Developments/hr-side/README.md)
  - 사용법과 현재 기능 요약
- [docs/operations/data-rules.md](/Users/shlee/Developments/hr-side/docs/operations/data-rules.md)
  - 데이터 모델, 계산 규칙, 검증 규칙
- [docs/templates/csv-files.md](/Users/shlee/Developments/hr-side/docs/templates/csv-files.md)
  - CSV 스키마와 입력 규칙
- [docs/samples/reference-company.md](/Users/shlee/Developments/hr-side/docs/samples/reference-company.md)
  - 샘플 데이터 의도와 기준일별 기대 결과

## Source Of Truth

| 주제 | 기준 문서 |
|---|---|
| 사용 흐름과 현재 기능 | `README.md` |
| 데이터 모델과 계산 규칙 | `docs/operations/data-rules.md` |
| CSV 컬럼과 입력 형식 | `docs/templates/csv-files.md` |
| 샘플 데이터와 기대 스냅샷 | `docs/samples/reference-company.md` |

규칙 충돌 시 우선순위는 아래와 같다.

1. `docs/operations/data-rules.md`
2. `docs/templates/csv-files.md`
3. `data/current/*.csv`
4. `README.md`

## 현재 확정 규칙 요약

- 기준일 조회는 `as-of date snapshot` 방식
- 한 시점의 `primary team`은 직원당 1개
- 한 팀의 팀장은 같은 시점 최대 1명
- 팀장은 공석일 수 있음
- 휴직 중 팀 이동 허용
- 퇴사일 당일도 재직으로 계산
- 팀장 임명/해제는 `Role_Assignments`에서 관리
- 조직 트리는 `Team_Structure_History`에서 관리
- 기본 샘플 역할 체계는 `대표 / 부대표 / 전무 / 상무 / 이사 / 팀장 / 팀원`

## 샘플 데이터 상태

- 기본 샘플 규모: `4개 본부 / 20개 팀 / 200명`
- 최상위 조직: `대표실`
- 주요 예외 케이스: 팀장 공석, 팀장 교체, 재입사, 휴직 중 팀 이동, 기준일 당일 퇴사

세부 내용은 [docs/samples/reference-company.md](/Users/shlee/Developments/hr-side/docs/samples/reference-company.md)를 따른다.

## 문서 및 데이터 수정 규칙

### 규칙을 바꿀 때

1. `docs/operations/data-rules.md`
2. `docs/templates/csv-files.md`
3. `AGENTS.md`
4. `README.md`

### CSV 컬럼을 바꿀 때

1. `docs/templates/csv-files.md`
2. `data/current/*.csv`
3. `scripts/generate-sample-data.mjs`
4. 필요하면 `scripts/build-report.mjs`
5. `README.md`
6. `AGENTS.md`

### 샘플 데이터를 바꿀 때

1. `scripts/generate-sample-data.mjs`
2. `data/current/*.csv`
3. `docs/samples/reference-company.md`
4. 필요하면 `README.md`
5. `AGENTS.md`

### UI를 바꿀 때

1. `scripts/build-report.mjs`
2. `npm run build`
3. 필요하면 `README.md`
4. 필요하면 `AGENTS.md`

## 현재 저장소 상태

- 원격 저장소: `origin = https://github.com/memorylane-dev/hr-side.git`
- 기본 브랜치: `main`
- 현재는 문서, 로컬 CSV 데이터셋, 샘플 생성기, 단일 HTML 리포트 생성기가 있는 상태다

# AGENTS.md

## 프로젝트 개요

이 저장소는 `직원 입퇴사 / 휴직 / 팀 이동 / 팀장 보직 / 조직 변경 이력`을 바탕으로
특정 날짜 기준의 조직도와 HR 통계를 조회하는 MVP를 정의한다.

현재 단계는 `로컬 CSV 기반 HTML 리포트 MVP`를 정리하고 구현하는 것이다.
즉 이 저장소의 1차 목적은 아래 4가지를 고정하는 것이다.

1. 제품 범위(product scope)
2. 운영 규칙(operational rules)
3. 입력 CSV 형식(input contract)
4. 로컬 실행 방식(local workflow)

## 작업 원칙

- 기본 문서는 이 `AGENTS.md`를 허브(hub)로 사용한다.
- 규칙 변경이 있으면 먼저 `AGENTS.md`의 요약과 링크를 확인하고, 그 다음 하위 문서를 수정한다.
- 컬럼이 바뀌면 문서만 바꾸지 말고 `templates/csv/*.csv`와 `data/current/*.csv`도 같이 수정한다.
- 한국어를 기본으로 쓰되 필요한 경우 영어 technical term를 병기한다.

## 문서 구조

### 1. 제품 문서

- [docs/specs/mvp-scope.md](/Users/shlee/Developments/hr-side/docs/specs/mvp-scope.md)
  - MVP 목표, 사용자 시나리오, 조회 화면 범위, 로드맵

### 2. 운영 문서

- [docs/operations/data-rules.md](/Users/shlee/Developments/hr-side/docs/operations/data-rules.md)
  - 데이터 모델, 계산 규칙, 검증 규칙, 미정 항목

### 3. 템플릿 문서

- [docs/templates/csv-files.md](/Users/shlee/Developments/hr-side/docs/templates/csv-files.md)
  - CSV 파일 구성, 컬럼 정의, 코드값, 입력 규칙

### 4. 사용 문서

- [docs/usage/local-html-report.md](/Users/shlee/Developments/hr-side/docs/usage/local-html-report.md)
  - clone 후 로컬에서 CSV 수정, HTML 생성, 확인하는 절차

### 5. 실제 CSV 헤더 템플릿

- `templates/csv/Employees.csv`
- `templates/csv/Teams.csv`
- `templates/csv/Employment_Periods.csv`
- `templates/csv/Leave_Periods.csv`
- `templates/csv/Team_Assignments.csv`
- `templates/csv/Role_Assignments.csv`
- `templates/csv/Team_Structure_History.csv`

### 6. 기본 데이터

- [docs/samples/reference-company.md](/Users/shlee/Developments/hr-side/docs/samples/reference-company.md)
  - 기본 데이터의 의도, 포함된 예외 케이스, 기준일별 기대 결과
- `data/current/*.csv`
  - clone 직후 바로 수정 가능한 기본 CSV 데이터

## Source Of Truth

| 주제 | 기준 문서 |
|---|---|
| MVP 범위와 산출물 | `docs/specs/mvp-scope.md` |
| 데이터 모델과 계산 규칙 | `docs/operations/data-rules.md` |
| CSV 컬럼과 입력 형식 | `docs/templates/csv-files.md` |
| 로컬 실행 방식 | `docs/usage/local-html-report.md` |
| 실제 CSV 헤더 | `templates/csv/*.csv` |
| 샘플 입력과 기준 스냅샷 | `docs/samples/reference-company.md` |

규칙 충돌이 생기면 아래 우선순위를 따른다.

1. `docs/operations/data-rules.md`
2. `docs/templates/csv-files.md`
3. `templates/csv/*.csv`
4. `docs/specs/mvp-scope.md`

## 현재 확정 규칙 요약

- 기준일 조회는 `as-of date snapshot` 방식
- 한 시점의 `primary team`은 직원당 1개
- 한 팀의 팀장은 같은 시점 최대 1명
- 팀장은 공석일 수 있음
- 휴직 중 팀 이동 허용
- 퇴사일 당일도 재직으로 계산
- 팀장 임명/해제는 `Role_Assignments`에서 관리
- 조직 트리는 `Team_Structure_History`에서 관리

## 아직 미정인 핵심 항목

- 팀명 변경을 `same team_id`로 유지할지
- 아니면 새 조직으로 보고 새 `team_id`를 발급할지

현재 권장 기준은 아래와 같다.

- 조직 실체가 같고 이름만 바뀌면 `same team_id`
- 책임 범위와 운영 단위가 달라지면 `new team_id`

최종 결정 전까지는 이 원칙을 임시 가이드로 사용한다.

## 문서 수정 규칙

### 규칙을 바꿀 때

아래 순서로 수정한다.

1. `docs/operations/data-rules.md`
2. `AGENTS.md`
3. `docs/templates/csv-files.md`
4. 필요하면 `templates/csv/*.csv`

### 범위를 바꿀 때

아래 순서로 수정한다.

1. `docs/specs/mvp-scope.md`
2. `AGENTS.md`

### 컬럼을 바꿀 때

아래 순서로 수정한다.

1. `docs/templates/csv-files.md`
2. `templates/csv/*.csv`
3. 필요하면 `docs/operations/data-rules.md`
4. `AGENTS.md`

## 다음 구현 우선순위

1. `data/current/*.csv` 편집 흐름 안정화
2. 로컬 HTML 리포트 생성기 고도화
3. 검증 메시지와 에러 표시 강화
4. 다중 데이터셋 지원 여부 검토

## 현재 저장소 상태

- 원격 저장소: `origin = https://github.com/memorylane-dev/hr-side.git`
- 기본 브랜치: `main`
- 현재는 문서, CSV 템플릿, 기본 데이터, 로컬 HTML 생성기가 있는 초기 상태

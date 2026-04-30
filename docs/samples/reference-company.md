# Reference Company 샘플 데이터

## 1. 문서 역할

이 문서는 `data/current/` 아래에 있는 기본 데이터의 의도를 설명한다.

목적은 아래 2가지다.

1. 로컬 HTML MVP 초기 테스트용 입력 데이터 제공
2. 기준일 스냅샷 계산 결과를 검증할 수 있는 reference case 제공

## 2. 파일 위치

기본 CSV는 아래 경로에 있다.

- `data/current/Employees.csv`
- `data/current/Teams.csv`
- `data/current/Employment_Periods.csv`
- `data/current/Leave_Periods.csv`
- `data/current/Team_Assignments.csv`
- `data/current/Role_Assignments.csv`
- `data/current/Team_Structure_History.csv`

## 3. 포함된 예외 케이스

이 샘플은 아래 케이스를 모두 포함한다.

1. 계속 재직 중인 직원
2. 기준일 당일 퇴사하는 직원
3. 퇴사 후 재입사한 직원
4. 과거 휴직 후 복귀한 직원
5. 현재 휴직 중인 직원
6. 휴직 중 팀 이동한 직원
7. 팀장 교체가 일어난 팀
8. 팀장 공석 상태인 팀
9. 조직 개편으로 상위 본부가 바뀐 팀
10. 계약직 직원
11. 기준 연도 신규 입사자

## 4. 샘플 조직 개요

이 샘플 회사는 아래 구조를 가진다.

- `ORG-CEO`
- `DIV-TECH`
- `DIV-PRODUCT`
- `DIV-CORP`
- `TEAM-PLATFORM`
- `TEAM-DATA`
- `TEAM-HR`
- `TEAM-FINANCE`
- `TEAM-OPS`

핵심 변화는 아래다.

- `DIV-TECH`는 `2023-12-31`까지 존재
- `DIV-PRODUCT`는 `2024-01-01`부터 존재
- `TEAM-PLATFORM`, `TEAM-DATA`는 `2024-01-01`부터 `DIV-PRODUCT` 산하

## 5. 기준일 검증 포인트

### 5.1 기준일 `2023-12-31`

검증 포인트:

- 아직 `DIV-PRODUCT`가 없다
- `TEAM-PLATFORM`, `TEAM-DATA`는 `DIV-TECH` 산하
- `EMP-0008`은 아직 재입사 전이다
- `TEAM-HR`는 아직 팀장 공석이다

기대 결과:

| 항목 | 기대값 |
|---|---|
| 총 재직 인원 | `12` |
| 총 휴직 인원 | `0` |
| 총 근무 인원 | `12` |
| 플랫폼팀 팀장 | `EMP-0002 박현우` |
| 데이터팀 팀장 | `EMP-0011 배지민` |
| 인사팀 팀장 | `공석` |

### 5.2 기준일 `2026-02-20`

검증 포인트:

- `EMP-0011` 퇴사 이후라 데이터팀 팀장 공석
- `EMP-0006`은 휴직 중이지만 이미 재무팀으로 이동 완료
- `EMP-0012`는 아직 입사 전

기대 결과:

| 항목 | 기대값 |
|---|---|
| 총 재직 인원 | `13` |
| 총 휴직 인원 | `1` |
| 총 근무 인원 | `12` |
| 데이터팀 팀장 | `공석` |
| 재무팀 인원 | `2` |
| 재무팀 휴직 인원 | `1` |

### 5.3 기준일 `2026-04-30`

검증 포인트:

- `EMP-0010`은 당일 퇴사지만 재직으로 계산되어야 한다
- `EMP-0012`는 2026년 신규 입사자로 포함된다
- 데이터팀은 팀장 공석 상태다
- 휴직 중 이동 규칙 때문에 `EMP-0006`은 재무팀 소속으로 집계된다

기대 결과:

| 항목 | 기대값 |
|---|---|
| 총 재직 인원 | `14` |
| 총 휴직 인원 | `1` |
| 총 근무 인원 | `13` |
| 2026년 입사자 수 | `1` |
| 2026년 퇴사자 수 | `2` |
| 플랫폼팀 인원 | `3` |
| 데이터팀 인원 | `3` |
| 재무팀 인원 | `2` |
| 운영팀 인원 | `2` |
| 데이터팀 팀장 | `공석` |
| 플랫폼팀 팀장 | `EMP-0003 이서준` |

## 6. 사용 방법

1. `data/current/*.csv`를 그대로 사용하거나 수정한다
2. `npm run build`로 HTML 리포트를 생성한다
3. 기준일을 `2023-12-31`, `2026-02-20`, `2026-04-30`로 바꿔가며 결과를 검증한다

## 7. 관련 문서

- 상위 허브: [AGENTS.md](/Users/shlee/Developments/hr-side/AGENTS.md)
- 운영 규칙: [docs/operations/data-rules.md](/Users/shlee/Developments/hr-side/docs/operations/data-rules.md)
- 템플릿: [docs/templates/csv-files.md](/Users/shlee/Developments/hr-side/docs/templates/csv-files.md)
- 사용 방법: [docs/usage/local-html-report.md](/Users/shlee/Developments/hr-side/docs/usage/local-html-report.md)

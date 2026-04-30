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

샘플을 초기 상태로 다시 만들려면 아래 명령을 사용한다.

```bash
npm run sample
```

## 3. 데이터 개요

이 샘플은 아래 규모와 구조를 가진다.

1. 최상위 조직 1개
2. 본부 4개
3. 팀 20개
4. 직원 200명
5. 역할 체계: `대표 / 부대표 / 전무 / 상무 / 이사 / 팀장 / 팀원`

본부는 아래 4개다.

- `Product본부`
- `Platform본부`
- `Growth본부`
- `Corporate본부`

각 본부 아래에 5개 팀씩 배치되어 총 20개 팀으로 구성된다.

## 4. 포함된 예외 케이스

이 샘플은 아래 케이스를 포함한다.

1. 기준일 당일 퇴사하는 직원
2. 퇴사 후 재입사한 직원
3. 현재 휴직 중인 직원
4. 휴직 중 팀 이동한 직원
5. 팀장 교체가 일어난 팀
6. 팀장 공석 상태인 팀
7. 계약직 직원
8. 기준 연도 신규 입사자

핵심 이벤트는 아래다.

- `EMP-0057` 퇴사로 `사용자리서치팀` 팀장 공석 발생
- `EMP-0066 -> EMP-0067`로 `프론트엔드팀` 팀장 교체
- `EMP-0124`는 퇴사 후 재입사
- `EMP-0160`은 휴직 중 `인사팀 -> 재무팀` 이동
- `EMP-0200`은 `2026-04-30` 당일 퇴사

## 5. 기준일 검증 포인트

### 5.1 기준일 `2025-12-31`

검증 포인트:

- `프론트엔드팀` 팀장은 아직 `EMP-0066 윤도윤`
- `사용자리서치팀` 팀장 공석은 아직 발생 전
- `EMP-0160`은 아직 `인사팀` 소속
- 2026년 신규 입사자는 아직 반영 전

기대 결과:

| 항목 | 기대값 |
|---|---|
| 총 재직 인원 | `196` |
| 총 휴직 인원 | `1` |
| 총 근무 인원 | `195` |
| 프론트엔드팀 팀장 | `EMP-0066 윤도윤` |
| 사용자리서치팀 팀장 | `EMP-0057 최수안` |
| 2025년 입사자 수 | `19` |

### 5.2 기준일 `2026-02-20`

검증 포인트:

- `EMP-0057` 퇴사 이후라 `사용자리서치팀` 팀장 공석
- `EMP-0067 홍채린`이 `프론트엔드팀` 신임 팀장
- `EMP-0160`은 휴직 중이지만 이미 `재무팀`으로 이동 완료
- 2026년 신규 입사자는 아직 반영 전

기대 결과:

| 항목 | 기대값 |
|---|---|
| 총 재직 인원 | `194` |
| 총 휴직 인원 | `3` |
| 총 근무 인원 | `191` |
| 사용자리서치팀 팀장 | `공석` |
| 프론트엔드팀 팀장 | `EMP-0067 홍채린` |
| 2026년 퇴사자 수 | `2` |

### 5.3 기준일 `2026-04-30`

검증 포인트:

- `EMP-0200`은 당일 퇴사지만 재직으로 계산되어야 한다
- `EMP-0194`는 2026년 신규 입사자로 포함된다
- `사용자리서치팀`은 팀장 공석 상태다
- 휴직 중 이동 규칙 때문에 `EMP-0160`은 `재무팀` 소속으로 집계된다

기대 결과:

| 항목 | 기대값 |
|---|---|
| 총 재직 인원 | `195` |
| 총 휴직 인원 | `4` |
| 총 근무 인원 | `191` |
| 2026년 입사자 수 | `1` |
| 2026년 퇴사자 수 | `3` |
| 사용자리서치팀 팀장 | `공석` |
| 프론트엔드팀 팀장 | `EMP-0067 홍채린` |
| 재무팀 휴직 인원 | `1` |

## 6. 사용 방법

1. `npm run sample`로 기본 샘플을 재생성한다
2. `data/current/*.csv`를 그대로 사용하거나 수정한다
3. `npm run build`로 HTML 리포트를 생성한다
4. 기준일을 `2025-12-31`, `2026-02-20`, `2026-04-30`로 바꿔가며 결과를 검증한다

## 7. 관련 문서

- 상위 허브: [AGENTS.md](/Users/shlee/Developments/hr-side/AGENTS.md)
- 운영 규칙: [docs/operations/data-rules.md](/Users/shlee/Developments/hr-side/docs/operations/data-rules.md)
- 템플릿: [docs/templates/csv-files.md](/Users/shlee/Developments/hr-side/docs/templates/csv-files.md)
- 사용 방법: [docs/usage/local-html-report.md](/Users/shlee/Developments/hr-side/docs/usage/local-html-report.md)

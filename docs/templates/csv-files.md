# CSV 파일 스키마

## 1. 문서 역할

이 문서는 HR 리포트의 `로컬 CSV 입력 형식(input contract)`을 정의한다.

아래 항목의 기준 문서는 이 파일이다.

- 파일 이름
- 컬럼 이름
- 코드값 예시
- 입력 규칙

비즈니스 규칙은
[docs/operations/data-rules.md](/Users/shlee/Developments/hr-side/docs/operations/data-rules.md)를 따른다.

## 2. 파일 구조

실제 작업 데이터는 아래 경로에 둔다.

- `data/current/Employees.csv`
- `data/current/Teams.csv`
- `data/current/Employment_Periods.csv`
- `data/current/Leave_Periods.csv`
- `data/current/Team_Assignments.csv`
- `data/current/Role_Assignments.csv`
- `data/current/Team_Structure_History.csv`

샘플 데이터를 초기 상태로 다시 만들려면 아래 명령을 실행한다.

```bash
npm run sample
```

CSV를 수정한 뒤에는 아래 명령으로 리포트를 다시 생성한다.

```bash
npm run build
```

## 3. 파일별 컬럼 정의

### 3.1 `Employees.csv`

| 컬럼 | 필수 | 설명 | 예시 |
|---|---|---|---|
| `employee_id` | Y | 직원 고유 ID | `EMP-0001` |
| `name` | Y | 이름 | `홍길동` |
| `email` | N | 회사 이메일 | `hong@company.com` |
| `employment_type` | N | 고용 형태 | `FULL_TIME` |
| `initial_hire_date` | Y | 최초 입사일 | `2019-03-04` |
| `final_termination_date` | N | 최종 퇴사일 참고값 | `2025-08-31` |
| `status_note` | N | 메모 | `재입사 이력 있음` |

### 3.2 `Teams.csv`

| 컬럼 | 필수 | 설명 | 예시 |
|---|---|---|---|
| `team_id` | Y | 팀 고유 ID | `TEAM-PLATFORM` |
| `team_code` | N | 내부 조직 코드 | `PLT` |
| `team_name_current` | Y | 현재 대표 팀명 | `플랫폼팀` |
| `team_type` | N | 조직 레벨 | `TEAM` |
| `active_from` | Y | 팀 생성일 | `2018-01-01` |
| `active_to` | N | 팀 종료일 | `2026-12-31` |
| `note` | N | 메모 | `2024년에 본부 이동` |

### 3.3 `Employment_Periods.csv`

| 컬럼 | 필수 | 설명 | 예시 |
|---|---|---|---|
| `employment_period_id` | Y | 고용 기간 ID | `EP-0001` |
| `employee_id` | Y | 직원 ID | `EMP-0001` |
| `employment_start` | Y | 입사/재입사일 | `2019-03-04` |
| `employment_end` | N | 퇴사일 | `2025-08-31` |
| `hire_reason` | N | 입사 유형 | `NEW_HIRE` |
| `termination_reason` | N | 퇴사 사유 | `RESIGNATION` |
| `note` | N | 메모 | `재입사 이력 없음` |

### 3.4 `Leave_Periods.csv`

| 컬럼 | 필수 | 설명 | 예시 |
|---|---|---|---|
| `leave_id` | Y | 휴직 ID | `LV-0001` |
| `employee_id` | Y | 직원 ID | `EMP-0001` |
| `leave_type` | Y | 휴직 유형 | `PARENTAL` |
| `leave_start` | Y | 휴직 시작일 | `2025-01-01` |
| `leave_end` | N | 휴직 종료일 | `2025-03-31` |
| `note` | N | 메모 | `복직 예정 확정` |

### 3.5 `Team_Assignments.csv`

| 컬럼 | 필수 | 설명 | 예시 |
|---|---|---|---|
| `assignment_id` | Y | 소속 ID | `TA-0001` |
| `employee_id` | Y | 직원 ID | `EMP-0001` |
| `team_id` | Y | 소속 팀 ID | `TEAM-PLATFORM` |
| `assignment_start` | Y | 배치 시작일 | `2024-06-01` |
| `assignment_end` | N | 배치 종료일 | `2025-04-30` |
| `is_primary` | Y | 주 소속 여부 | `TRUE` |
| `assignment_type` | N | 배치 유형 | `STANDARD` |
| `note` | N | 메모 | `휴직 중 이동` |

### 3.6 `Role_Assignments.csv`

| 컬럼 | 필수 | 설명 | 예시 |
|---|---|---|---|
| `role_assignment_id` | Y | 역할 배정 ID | `RA-0001` |
| `employee_id` | Y | 직원 ID | `EMP-0001` |
| `role_code` | Y | 역할 코드 | `TEAM_LEAD` |
| `scope_type` | Y | 역할 범위 유형 | `TEAM` |
| `scope_team_id` | Y | 대상 팀 ID | `TEAM-PLATFORM` |
| `role_start` | Y | 역할 시작일 | `2025-04-01` |
| `role_end` | N | 역할 종료일 | `2025-12-31` |
| `is_acting` | N | 직무대행 여부 | `FALSE` |
| `note` | N | 메모 | `팀장 임명` |

### 3.7 `Team_Structure_History.csv`

| 컬럼 | 필수 | 설명 | 예시 |
|---|---|---|---|
| `history_id` | Y | 조직 이력 ID | `TSH-0001` |
| `team_id` | Y | 팀 ID | `TEAM-PLATFORM` |
| `team_name` | Y | 해당 기간 팀명 | `플랫폼팀` |
| `parent_team_id` | N | 상위 조직 ID | `DIV-PRODUCT` |
| `effective_from` | Y | 적용 시작일 | `2023-01-01` |
| `effective_to` | N | 적용 종료일 | `2026-12-31` |
| `status` | Y | `ACTIVE` 또는 `CLOSED` | `ACTIVE` |
| `note` | N | 메모 | `본부 개편 반영` |

## 4. 권장 코드값

### 4.1 `employment_type`

- `FULL_TIME`
- `CONTRACT`
- `PART_TIME`
- `INTERN`

### 4.2 `leave_type`

- `PARENTAL`
- `SICK`
- `PERSONAL`
- `UNPAID`

### 4.3 `assignment_type`

- `STANDARD`
- `SECONDMENT`
- `DUAL_HAT`

### 4.4 `role_code`

- `CEO`
- `VICE_CEO`
- `EVP`
- `SVP`
- `TEAM_LEAD`
- `DIRECTOR`

### 4.5 `scope_type`

- `TEAM`
- `DIVISION`
- `COMPANY`

## 5. 입력 운영 규칙

1. 날짜는 모두 `YYYY-MM-DD` 형식으로 입력한다
2. `employee_id`, `team_id`는 안정 키로 유지한다
3. 이름과 팀명은 변경될 수 있지만 ID는 바꾸지 않는다
4. 종료되지 않은 기간은 종료일을 비워 둔다
5. `Team_Assignments.is_primary = TRUE`는 같은 시점에 직원당 1개만 허용한다
6. `Role_Assignments.role_code = TEAM_LEAD`는 같은 시점에 팀당 1개만 허용한다

샘플 데이터의 기본 역할 체계는 아래를 사용한다.

- `CEO` = 대표
- `VICE_CEO` = 부대표
- `EVP` = 전무
- `SVP` = 상무
- `DIRECTOR` = 이사
- `TEAM_LEAD` = 팀장

별도 `Role_Assignments`가 없는 일반 구성원은 리포트에서 `팀원`으로 표시한다.

## 6. 관련 문서

- 상위 허브: [AGENTS.md](/Users/shlee/Developments/hr-side/AGENTS.md)
- 사용 요약: [README.md](/Users/shlee/Developments/hr-side/README.md)
- 운영 규칙: [docs/operations/data-rules.md](/Users/shlee/Developments/hr-side/docs/operations/data-rules.md)
- 기본 데이터: [docs/samples/reference-company.md](/Users/shlee/Developments/hr-side/docs/samples/reference-company.md)

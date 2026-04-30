# Google Sheets 템플릿

## 1. 목적

이 문서는 HR MVP용 Google Sheets를 빠르게 생성하기 위한 탭 구조와 컬럼 템플릿을 정리한 문서다.

복붙용 CSV 헤더 파일은 아래 경로에 있다.

- `templates/google-sheets/Employees.csv`
- `templates/google-sheets/Teams.csv`
- `templates/google-sheets/Employment_Periods.csv`
- `templates/google-sheets/Leave_Periods.csv`
- `templates/google-sheets/Team_Assignments.csv`
- `templates/google-sheets/Role_Assignments.csv`
- `templates/google-sheets/Team_Structure_History.csv`

## 2. 권장 탭 구성

### 2.1 입력 탭

1. `Employees`
2. `Teams`
3. `Employment_Periods`
4. `Leave_Periods`
5. `Team_Assignments`
6. `Role_Assignments`
7. `Team_Structure_History`

### 2.2 출력 탭

1. `Dashboard`
2. `Snapshot`
3. `Validation`

## 3. 탭별 컬럼 템플릿

### 3.1 `Employees`

| 컬럼 | 필수 | 설명 | 예시 |
|---|---|---|---|
| `employee_id` | Y | 직원 고유 ID | `EMP-0001` |
| `name` | Y | 이름 | `홍길동` |
| `email` | N | 회사 이메일 | `hong@company.com` |
| `employment_type` | N | 고용 형태 | `FULL_TIME` |
| `initial_hire_date` | Y | 최초 입사일 | `2019-03-04` |
| `final_termination_date` | N | 최종 퇴사일 참고값 | `2025-08-31` |
| `status_note` | N | 메모 | `재입사 이력 있음` |

### 3.2 `Teams`

| 컬럼 | 필수 | 설명 | 예시 |
|---|---|---|---|
| `team_id` | Y | 팀 고유 ID | `TEAM-PLATFORM` |
| `team_code` | N | 내부 조직 코드 | `PLT` |
| `team_name_current` | Y | 현재 기준 대표 팀명 | `플랫폼팀` |
| `team_type` | N | 조직 레벨 | `TEAM` |
| `active_from` | Y | 팀 생성일 | `2018-01-01` |
| `active_to` | N | 팀 종료일 | `2026-12-31` |
| `note` | N | 메모 | `2023년에 본부 변경` |

### 3.3 `Employment_Periods`

| 컬럼 | 필수 | 설명 | 예시 |
|---|---|---|---|
| `employment_period_id` | Y | 고용 기간 ID | `EP-0001` |
| `employee_id` | Y | 직원 ID | `EMP-0001` |
| `employment_start` | Y | 입사/재입사일 | `2019-03-04` |
| `employment_end` | N | 퇴사일 | `2025-08-31` |
| `hire_reason` | N | 신규입사/재입사 | `NEW_HIRE` |
| `termination_reason` | N | 퇴사 사유 | `RESIGNATION` |
| `note` | N | 메모 | `2020-01 재입사 아님` |

### 3.4 `Leave_Periods`

| 컬럼 | 필수 | 설명 | 예시 |
|---|---|---|---|
| `leave_id` | Y | 휴직 ID | `LV-0001` |
| `employee_id` | Y | 직원 ID | `EMP-0001` |
| `leave_type` | Y | 휴직 유형 | `PARENTAL` |
| `leave_start` | Y | 휴직 시작일 | `2025-01-01` |
| `leave_end` | N | 휴직 종료일 | `2025-03-31` |
| `note` | N | 메모 | `복직 예정 확정` |

### 3.5 `Team_Assignments`

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

### 3.6 `Role_Assignments`

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

### 3.7 `Team_Structure_History`

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

- `TEAM_LEAD`
- `HEAD`
- `DIRECTOR`

### 4.5 `scope_type`

- `TEAM`
- `DIVISION`
- `COMPANY`

## 5. 입력 운영 규칙

1. 날짜는 모두 `YYYY-MM-DD` 형식으로 입력
2. ID는 사람이 수정하지 않는 안정 키로 유지
3. 이름이나 팀명은 바뀔 수 있지만 `employee_id`, `team_id`는 바꾸지 않음
4. 종료되지 않은 기간은 종료일을 비워 둠
5. `Team_Assignments.is_primary = TRUE`는 한 시점에 직원당 1개만 허용
6. `Role_Assignments.role_code = TEAM_LEAD`는 한 팀당 같은 시점 1개만 허용

## 6. 시트 생성 순서

Google Sheets에서 아래 순서로 탭을 만들면 된다.

1. `Employees`
2. `Teams`
3. `Employment_Periods`
4. `Leave_Periods`
5. `Team_Assignments`
6. `Role_Assignments`
7. `Team_Structure_History`
8. `Dashboard`
9. `Snapshot`
10. `Validation`

## 7. 초기 샘플 입력 권장

처음에는 아래 예외 케이스가 반드시 포함되도록 샘플 데이터를 넣는 편이 좋다.

1. 입사 후 아직 퇴사하지 않은 직원
2. 퇴사 후 재입사한 직원
3. 휴직 중 팀 이동한 직원
4. 팀장은 아니지만 팀 이동한 직원
5. 팀장은 공석인 팀
6. 상위 조직이 바뀐 팀

## 8. 다음 단계

이 문서 기준으로 다음 산출물을 만들 수 있다.

1. Google Apps Script 스냅샷 생성기
2. Validation 탭 자동 검사 로직
3. Dashboard KPI 계산 로직

# HR 데이터 모델 및 운영 규칙

## 1. 문서 역할

이 문서는 HR MVP의 `운영 규칙(source of truth for business rules)`이다.

아래 항목의 기준 문서는 이 파일이다.

- 데이터 모델
- 기준일 계산 규칙
- 검증 규칙
- 지표 정의
- 미정 항목과 임시 원칙

## 2. 확정된 운영 규칙

| 항목 | 결정 |
|---|---|
| 기준일 조회 방식 | 특정 날짜 `D` 기준 스냅샷 |
| 주 소속 팀 | 한 시점에 직원당 1개만 허용 |
| 팀장 수 | 한 팀에 같은 시점 최대 1명 |
| 팀장 공석 | 허용 |
| 휴직 중 팀 이동 | 허용 |
| 퇴사일 처리 | 퇴사일 당일까지 재직 |
| 팀장 데이터 성격 | `Role_Assignments`로 관리 |
| 조직 트리 관리 | `Team_Structure_History`로 관리 |

## 3. 미정 항목

### 3.1 팀명 변경 처리

현재 미정이다.

임시 원칙은 아래와 같다.

- 조직 실체가 같고 이름만 바뀌면 `same team_id`
- 별도 조직으로 보는 편이 맞으면 `new team_id`

최종 합의 전까지는 이 원칙을 사용한다.

## 4. 상태 축 분리 원칙

이 프로젝트는 인사 상태를 아래 6개 축으로 분리해서 관리한다.

| 상태 축 | 의미 | 시트 |
|---|---|---|
| 직원 마스터 | 사람 자체의 기준 정보 | `Employees` |
| 고용 상태 | 회사 소속 여부 | `Employment_Periods` |
| 근무 예외 상태 | 휴직 여부 | `Leave_Periods` |
| 소속 상태 | 어느 팀 소속인가 | `Team_Assignments` |
| 역할 상태 | 팀장 등 보직 | `Role_Assignments` |
| 조직 구조 | 팀의 상하위 관계 | `Team_Structure_History` |

핵심 원칙은 아래와 같다.

- `입사/퇴사`와 `팀 이동`은 분리한다
- `팀 이동`과 `팀장 임명`은 분리한다
- `팀장 임명`과 `조직 트리 변경`은 분리한다

## 5. 데이터 모델

### 5.1 `Employees`

직원 마스터 정보.

- 기준 키는 `employee_id`
- 이름은 변경될 수 있으므로 키로 사용하지 않는다

### 5.2 `Teams`

팀 마스터 정보.

- 기준 키는 `team_id`
- 현재 대표 팀명과 내부 코드 등 기본 정보를 둔다

### 5.3 `Employment_Periods`

입사, 퇴사, 재입사를 표현하는 고용 기간 이력.

- 한 직원은 여러 기간을 가질 수 있다
- 이 시트가 `해당 날짜에 재직 중인가`를 판단하는 기준이다

### 5.4 `Leave_Periods`

휴직 기간 이력.

- 휴직은 퇴사가 아니다
- 재직 중 비근무 상태로 관리한다

### 5.5 `Team_Assignments`

직원의 팀 소속 기간 이력.

- 팀 이동은 이전 기간 종료 + 새 기간 시작으로 표현한다
- `is_primary = TRUE`는 한 시점에 1개만 허용한다

### 5.6 `Role_Assignments`

직원의 역할/보직 기간 이력.

- 팀장 임명/해제는 여기에 저장한다
- `TEAM_LEAD`는 같은 팀에 같은 시점 1명만 허용한다
- 팀장 공석은 해당 기간 행이 없는 상태로 표현한다

### 5.7 `Team_Structure_History`

팀의 이름, 상위 조직, 활성 상태 이력.

- 조직도 트리 복원의 기준이다
- 팀명 변경도 최종 정책에 따라 여기서 관리할 수 있다

## 6. 기준일 계산 규칙

기준일을 `D`라고 할 때 아래처럼 계산한다.

### 6.1 재직 여부

아래 조건이면 재직이다.

- `employment_start <= D`
- 그리고 `employment_end`가 비어 있거나 `D <= employment_end`

보충 규칙:

- `employment_end = D`인 경우도 재직이다

### 6.2 휴직 여부

아래 조건이면 휴직이다.

- `leave_start <= D`
- 그리고 `leave_end`가 비어 있거나 `D <= leave_end`

보충 규칙:

- 휴직은 비재직이 아니다

### 6.3 주 소속 팀

아래 조건을 만족하는 `Team_Assignments` 중 `is_primary = TRUE`인 1개 행을 사용한다.

- `assignment_start <= D`
- 그리고 `assignment_end`가 비어 있거나 `D <= assignment_end`

### 6.4 팀장 여부

아래 조건을 만족하는 `Role_Assignments`를 사용한다.

- `role_code = TEAM_LEAD`
- `role_start <= D`
- 그리고 `role_end`가 비어 있거나 `D <= role_end`

### 6.5 조직도 트리

아래 조건을 만족하는 `Team_Structure_History`를 사용한다.

- `effective_from <= D`
- 그리고 `effective_to`가 비어 있거나 `D <= effective_to`

조직도는 아래 2개 레이어를 합친 결과다.

1. 팀 트리
2. 각 팀의 구성원과 팀장

## 7. 검증 규칙

자동 검증 대상은 최소 아래를 포함한다.

1. 한 사람의 `Employment_Periods` 기간이 겹치면 오류
2. 한 사람의 `is_primary = TRUE` 기간이 겹치면 오류
3. 한 팀의 `TEAM_LEAD` 기간이 겹치면 오류
4. 종료일이 시작일보다 빠르면 오류
5. 재직하지 않는 기간에 팀 소속이 있으면 경고 또는 오류
6. 재직하지 않는 기간에 팀장 역할이 있으면 오류
7. 존재하지 않는 `employee_id`, `team_id` 참조 시 오류

## 8. 지표 정의

| 지표 | 정의 |
|---|---|
| 총 재직 인원 | 기준일 `D`에 재직인 사람 수 |
| 총 휴직 인원 | 기준일 `D`에 휴직인 사람 수 |
| 총 근무 인원 | 총 재직 인원 - 총 휴직 인원 |
| 팀별 재직 인원 | 기준일 `D`에 해당 팀 주 소속인 재직자 수 |
| 팀별 휴직 인원 | 기준일 `D`에 해당 팀 주 소속이면서 휴직인 사람 수 |
| 팀별 근무 인원 | 팀별 재직 인원 - 팀별 휴직 인원 |
| 당해연도 퇴사자 수 | 해당 연도 `1월 1일 ~ D` 사이 `employment_end` 건수 |

## 9. 변경 이력 템플릿

| 변경일 | 항목 | 이전 규칙 | 변경 규칙 | 변경 이유 | 승인자 |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## 10. 관련 문서

- 상위 허브: [AGENTS.md](/Users/shlee/Developments/hr-side/AGENTS.md)
- 사용 요약: [README.md](/Users/shlee/Developments/hr-side/README.md)
- CSV 스키마: [docs/templates/csv-files.md](/Users/shlee/Developments/hr-side/docs/templates/csv-files.md)
- 샘플 데이터: [docs/samples/reference-company.md](/Users/shlee/Developments/hr-side/docs/samples/reference-company.md)

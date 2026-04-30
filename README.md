# hr-side

이 저장소는 `직원 입퇴사 / 휴직 / 팀 이동 / 팀장 변경 / 조직 변경` 이력을 CSV로 관리하고,
특정 날짜 기준 조직도와 인사 현황을 HTML 화면으로 확인하는 용도입니다.

인사팀은 주로 `data/current/*.csv` 파일만 수정하면 됩니다.
수정 후에는 `npm run build`를 실행하면 최신 화면이 다시 만들어집니다.

## 가장 먼저 보면 되는 파일

- 직원 기본 정보: [Employees.csv](/Users/shlee/Developments/hr-side/data/current/Employees.csv)
- 입사 / 퇴사 / 재입사: [Employment_Periods.csv](/Users/shlee/Developments/hr-side/data/current/Employment_Periods.csv)
- 휴직 / 복직: [Leave_Periods.csv](/Users/shlee/Developments/hr-side/data/current/Leave_Periods.csv)
- 팀 이동: [Team_Assignments.csv](/Users/shlee/Developments/hr-side/data/current/Team_Assignments.csv)
- 팀장 / 보직 변경: [Role_Assignments.csv](/Users/shlee/Developments/hr-side/data/current/Role_Assignments.csv)
- 조직명 / 상위 조직 변경: [Team_Structure_History.csv](/Users/shlee/Developments/hr-side/data/current/Team_Structure_History.csv)
- 결과 화면: [dist/index.html](/Users/shlee/Developments/hr-side/dist/index.html)

## 인사팀이 수정하는 표

| 상황 | 수정할 파일 | 주로 수정하는 열 |
|---|---|---|
| 신규 입사 | `Employees.csv`, `Employment_Periods.csv`, `Team_Assignments.csv` | `name`, `employment_type`, `employment_start`, `team_id`, `assignment_start` |
| 재입사 | `Employment_Periods.csv`, `Team_Assignments.csv` | 새 행 추가, `employment_start`, `team_id`, `assignment_start` |
| 퇴사 | `Employment_Periods.csv` | `employment_end`, `termination_reason` |
| 기준일 당일 퇴사 | `Employment_Periods.csv` | `employment_end`를 그 날짜로 입력 |
| 휴직 / 복직 | `Leave_Periods.csv` | `leave_type`, `leave_start`, `leave_end` |
| 팀 이동 | `Team_Assignments.csv` | 기존 행 `assignment_end`, 새 행 `team_id`, `assignment_start`, `is_primary` |
| 팀장 변경 | `Role_Assignments.csv` | 기존 팀장 행 `role_end`, 새 팀장 행 `role_code=TEAM_LEAD`, `scope_team_id`, `role_start` |
| 본부 / 팀 이름 변경 | `Team_Structure_History.csv` | `team_name`, `effective_from`, 필요하면 `effective_to` |
| 상위 조직 변경 | `Team_Structure_History.csv` | `parent_team_id`, `effective_from`, 필요하면 기존 행 `effective_to` |

## 기준일 당일 퇴사 입력 규칙

`기준일 당일 퇴사`는 별도 특수 로직이 아니라 아래처럼 입력합니다.

1. [Employment_Periods.csv](/Users/shlee/Developments/hr-side/data/current/Employment_Periods.csv)에서 해당 직원의 `employment_end`를 그 날짜로 입력
2. 필요하면 [Employees.csv](/Users/shlee/Developments/hr-side/data/current/Employees.csv)의 `final_termination_date`도 같은 날짜로 맞춤
3. `npm run build` 후 화면에서 확인

이 경우 그 날짜에는 `재직`으로 계산되고, 직원 검색 결과의 상태에서 `재직 / 당일 퇴사`로 표시됩니다.

## 수정 순서

1. 필요한 CSV 파일을 연다
2. 행을 추가하거나 날짜를 수정한다
3. 저장한다
4. 터미널에서 아래 명령을 실행한다

```bash
npm run build
```

5. [dist/index.html](/Users/shlee/Developments/hr-side/dist/index.html)을 연다
6. 기준 날짜를 바꾸거나 직원 검색으로 결과를 확인한다

## 화면에서 확인할 수 있는 내용

- 기준 날짜별 총 재직 인원
- 총 근무 인원
- 총 휴직 인원
- 당해연도 입사 / 퇴사 수
- 조직도
- 팀별 요약 표
- 직원 검색 결과

## 자주 수정하는 파일 설명

### 1. 직원 기본 정보

- 파일: [Employees.csv](/Users/shlee/Developments/hr-side/data/current/Employees.csv)
- 언제 수정하나:
  직원 이름, 이메일, 고용 형태, 비고를 바꿀 때

### 2. 입사 / 퇴사 / 재입사

- 파일: [Employment_Periods.csv](/Users/shlee/Developments/hr-side/data/current/Employment_Periods.csv)
- 언제 수정하나:
  입사, 퇴사, 재입사 이력을 넣을 때
- 주의:
  퇴사일 당일도 재직으로 계산됩니다

### 3. 휴직 / 복직

- 파일: [Leave_Periods.csv](/Users/shlee/Developments/hr-side/data/current/Leave_Periods.csv)
- 언제 수정하나:
  육아휴직, 병가, 무급휴직 등 근무 예외 상태를 넣을 때

### 4. 팀 이동

- 파일: [Team_Assignments.csv](/Users/shlee/Developments/hr-side/data/current/Team_Assignments.csv)
- 언제 수정하나:
  직원의 주 소속 팀이 바뀔 때
- 주의:
  기존 소속 행을 끝내고 새 소속 행을 추가합니다

### 5. 팀장 변경

- 파일: [Role_Assignments.csv](/Users/shlee/Developments/hr-side/data/current/Role_Assignments.csv)
- 언제 수정하나:
  팀장 임명, 해제, 교체가 있을 때

### 6. 조직 변경

- 파일: [Team_Structure_History.csv](/Users/shlee/Developments/hr-side/data/current/Team_Structure_History.csv)
- 언제 수정하나:
  팀명 변경, 상위 본부 변경, 조직 종료가 있을 때

## 참고 명령

기본 샘플 데이터를 다시 만들고 싶으면:

```bash
npm run sample
```

특정 날짜 숫자만 빠르게 보고 싶으면:

```bash
node scripts/build-report.mjs --check-date 2026-04-30
```

## Vercel 배포

이 프로젝트는 `dist/index.html` 하나를 만드는 정적(static) HTML 리포트라서 Vercel 배포가 단순합니다.

- Vercel 설정 파일: [vercel.json](/Users/shlee/Developments/hr-side/vercel.json)
- 배포 시 Vercel은 `npm run build`를 실행하고 `dist` 폴더를 배포합니다
- 따라서 CSV를 직접 수정해도, 배포 시점에 최신 CSV 기준으로 다시 HTML이 생성됩니다

### GitHub 연결 방식

1. 이 저장소를 GitHub에 push 한다
2. Vercel에서 `New Project`를 누른다
3. `memorylane-dev/hr-side` 저장소를 선택한다
4. Framework Preset은 `Other`로 두거나 자동 감지를 그대로 사용한다
5. Root Directory는 저장소 루트(`/`)로 둔다
6. Build / Output 설정은 `vercel.json` 값을 그대로 사용한다
7. Deploy를 누른다

### Vercel에서 확인할 항목

- Build Command: `npm run build`
- Output Directory: `dist`
- Node 버전은 기본값으로 충분

### 배포 후 운영 방식

1. 인사팀이 `data/current/*.csv`를 수정한다
2. 변경 내용을 GitHub `main`에 반영한다
3. Vercel이 자동으로 다시 배포한다
4. 배포 URL에서 최신 조직도와 통계를 확인한다

## 추가 문서

- 운영 규칙: [docs/operations/data-rules.md](/Users/shlee/Developments/hr-side/docs/operations/data-rules.md)
- CSV 입력 규칙: [docs/templates/csv-files.md](/Users/shlee/Developments/hr-side/docs/templates/csv-files.md)
- 샘플 데이터 설명: [docs/samples/reference-company.md](/Users/shlee/Developments/hr-side/docs/samples/reference-company.md)

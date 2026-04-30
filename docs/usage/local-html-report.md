# 로컬 HTML 리포트 사용 방법

## 1. 목표

이 저장소는 아래 흐름으로 사용한다.

1. 저장소를 `git clone`
2. 필요하면 `npm run sample`로 기본 샘플 재생성
3. `data/current/*.csv` 수정
4. 로컬 명령으로 HTML 리포트 생성
5. 브라우저에서 날짜를 바꿔가며 조직도와 통계를 조회

## 2. 기본 명령

저장소 루트에서 아래 명령을 실행한다.

샘플 데이터를 초기 상태로 다시 만들고 싶으면 먼저 아래 명령을 실행한다.

```bash
npm run sample
```

그 다음 HTML 리포트를 생성한다.

```bash
npm run build
```

생성 결과:

- `dist/index.html`

## 3. 사용 순서

### 3.1 데이터 수정

아래 파일을 수정한다.

- `data/current/Employees.csv`
- `data/current/Teams.csv`
- `data/current/Employment_Periods.csv`
- `data/current/Leave_Periods.csv`
- `data/current/Team_Assignments.csv`
- `data/current/Role_Assignments.csv`
- `data/current/Team_Structure_History.csv`

### 3.2 리포트 생성

```bash
npm run build
```

### 3.3 결과 확인

브라우저에서 아래 파일을 연다.

- `dist/index.html`

리포트 안에서 아래를 확인할 수 있다.

- 기준 날짜 선택
- 총 재직 / 근무 / 휴직 인원
- 당해연도 입사 / 퇴사 건수
- 팀별 집계
- 조직도 트리
- 직원 스냅샷 테이블
- 검증 경고

## 4. 추가 옵션

아래처럼 입력 경로와 출력 파일을 바꿀 수 있다.

```bash
node scripts/build-report.mjs --input-dir data/current --output dist/index.html
```

기준일 숫자만 빠르게 확인하고 싶으면 아래처럼 실행한다.

```bash
node scripts/build-report.mjs --check-date 2026-04-30
```

## 5. 주의 사항

1. 날짜 형식은 반드시 `YYYY-MM-DD`
2. 동일 시점 중복 주 소속, 중복 팀장 같은 문제는 경고로 표시된다
3. HTML은 self-contained 파일이라 별도 서버 없이 열 수 있다
4. 조직도 카드에는 `팀명 + 리더`가 보이고, hover 또는 focus 시 직속 팀원 목록이 뜬다

## 6. 관련 문서

- 상위 허브: [AGENTS.md](/Users/shlee/Developments/hr-side/AGENTS.md)
- 운영 규칙: [docs/operations/data-rules.md](/Users/shlee/Developments/hr-side/docs/operations/data-rules.md)
- CSV 템플릿: [docs/templates/csv-files.md](/Users/shlee/Developments/hr-side/docs/templates/csv-files.md)

import path from "node:path";
import { promises as fs } from "node:fs";

const DATA_FILES = {
  employees: "Employees.csv",
  teams: "Teams.csv",
  employmentPeriods: "Employment_Periods.csv",
  leavePeriods: "Leave_Periods.csv",
  teamAssignments: "Team_Assignments.csv",
  roleAssignments: "Role_Assignments.csv",
  teamStructureHistory: "Team_Structure_History.csv",
};

const DEFAULT_INPUT_DIR = "data/current";
const DEFAULT_OUTPUT = "dist/index.html";
const OPEN_END = "9999-12-31";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const dataset = await readDataset(options.inputDir);
  const warnings = buildWarnings(dataset);
  const meta = buildMeta(dataset, options.defaultDate);
  const html = buildHtml({ dataset, warnings, meta });

  await fs.mkdir(path.dirname(options.output), { recursive: true });
  await fs.writeFile(options.output, html, "utf8");

  console.log(`Built ${options.output}`);
  console.log(`Input directory: ${options.inputDir}`);
  console.log(`Warnings: ${warnings.length}`);

  if (options.checkDate) {
    const snapshot = computeSnapshotData(dataset, options.checkDate);
    console.log(
      `Snapshot ${options.checkDate}: active=${snapshot.active}, leave=${snapshot.leave}, working=${snapshot.working}, hiresYtd=${snapshot.hiresYtd}, terminationsYtd=${snapshot.terminationsYtd}`,
    );
  }
}

function parseArgs(args) {
  const options = {
    inputDir: DEFAULT_INPUT_DIR,
    output: DEFAULT_OUTPUT,
    defaultDate: null,
    checkDate: null,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === "--input-dir" && next) {
      options.inputDir = next;
      index += 1;
      continue;
    }

    if (arg === "--output" && next) {
      options.output = next;
      index += 1;
      continue;
    }

    if (arg === "--default-date" && next) {
      options.defaultDate = next;
      index += 1;
      continue;
    }

    if (arg === "--check-date" && next) {
      options.checkDate = next;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

async function readDataset(inputDir) {
  const dataset = {};

  for (const [key, filename] of Object.entries(DATA_FILES)) {
    const filePath = path.join(inputDir, filename);
    const content = await fs.readFile(filePath, "utf8");
    dataset[key] = parseCsv(content);
  }

  return dataset;
}

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === "\r") {
      continue;
    }

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((value) => value.trim());

  return rows
    .slice(1)
    .filter((cells) => cells.some((value) => value.trim() !== ""))
    .map((cells) =>
      Object.fromEntries(headers.map((header, index) => [header, (cells[index] || "").trim()])),
    );
}

function buildWarnings(dataset) {
  const warnings = [];
  const employeeIds = new Set(dataset.employees.map((row) => row.employee_id));
  const teamIds = new Set(dataset.teams.map((row) => row.team_id));

  checkReference(dataset.employmentPeriods, "employee_id", employeeIds, "Employment_Periods", warnings);
  checkReference(dataset.leavePeriods, "employee_id", employeeIds, "Leave_Periods", warnings);
  checkReference(dataset.teamAssignments, "employee_id", employeeIds, "Team_Assignments", warnings);
  checkReference(dataset.teamAssignments, "team_id", teamIds, "Team_Assignments", warnings);
  checkReference(dataset.roleAssignments, "employee_id", employeeIds, "Role_Assignments", warnings);
  checkReference(dataset.roleAssignments, "scope_team_id", teamIds, "Role_Assignments", warnings);
  checkReference(dataset.teamStructureHistory, "team_id", teamIds, "Team_Structure_History", warnings);
  checkReference(
    dataset.teamStructureHistory.filter((row) => row.parent_team_id),
    "parent_team_id",
    teamIds,
    "Team_Structure_History",
    warnings,
  );

  checkOverlaps(
    dataset.employmentPeriods,
    "employee_id",
    "employment_start",
    "employment_end",
    "고용 기간",
    warnings,
  );
  checkOverlaps(
    dataset.teamAssignments.filter((row) => isTrue(row.is_primary)),
    "employee_id",
    "assignment_start",
    "assignment_end",
    "주 소속 기간",
    warnings,
  );
  checkOverlaps(
    dataset.roleAssignments.filter((row) => row.role_code === "TEAM_LEAD"),
    "scope_team_id",
    "role_start",
    "role_end",
    "팀장 기간",
    warnings,
  );

  for (const row of [
    ...dataset.employmentPeriods.map((item) => ({
      id: item.employment_period_id,
      start: item.employment_start,
      end: item.employment_end,
      label: "Employment_Periods",
    })),
    ...dataset.leavePeriods.map((item) => ({
      id: item.leave_id,
      start: item.leave_start,
      end: item.leave_end,
      label: "Leave_Periods",
    })),
    ...dataset.teamAssignments.map((item) => ({
      id: item.assignment_id,
      start: item.assignment_start,
      end: item.assignment_end,
      label: "Team_Assignments",
    })),
    ...dataset.roleAssignments.map((item) => ({
      id: item.role_assignment_id,
      start: item.role_start,
      end: item.role_end,
      label: "Role_Assignments",
    })),
    ...dataset.teamStructureHistory.map((item) => ({
      id: item.history_id,
      start: item.effective_from,
      end: item.effective_to,
      label: "Team_Structure_History",
    })),
  ]) {
    if (row.start && row.end && row.end < row.start) {
      warnings.push(`${row.label}: ${row.id}의 종료일이 시작일보다 빠릅니다.`);
    }
  }

  const employmentByEmployee = groupBy(dataset.employmentPeriods, "employee_id");

  for (const assignment of dataset.teamAssignments) {
    const periods = employmentByEmployee.get(assignment.employee_id) || [];
    if (!isCoveredByPeriods(assignment.assignment_start, assignment.assignment_end, periods, "employment_start", "employment_end")) {
      warnings.push(`Team_Assignments: ${assignment.assignment_id}가 재직 기간 밖에 있습니다.`);
    }
  }

  for (const role of dataset.roleAssignments) {
    const periods = employmentByEmployee.get(role.employee_id) || [];
    if (!isCoveredByPeriods(role.role_start, role.role_end, periods, "employment_start", "employment_end")) {
      warnings.push(`Role_Assignments: ${role.role_assignment_id}가 재직 기간 밖에 있습니다.`);
    }
  }

  return warnings;
}

function checkReference(rows, key, validIds, label, warnings) {
  for (const row of rows) {
    const value = row[key];
    if (value && !validIds.has(value)) {
      warnings.push(`${label}: ${key}=${value} 참조를 찾을 수 없습니다.`);
    }
  }
}

function checkOverlaps(rows, groupKey, startKey, endKey, label, warnings) {
  const groups = groupBy(rows, groupKey);

  for (const [group, items] of groups.entries()) {
    for (let index = 0; index < items.length; index += 1) {
      for (let compare = index + 1; compare < items.length; compare += 1) {
        if (
          overlaps(items[index][startKey], items[index][endKey], items[compare][startKey], items[compare][endKey])
        ) {
          warnings.push(`${label}: ${group}에 겹치는 기간이 있습니다.`);
        }
      }
    }
  }
}

function isCoveredByPeriods(start, end, periods, startKey, endKey) {
  return periods.some((period) => {
    const periodEnd = period[endKey] || OPEN_END;
    const valueEnd = end || OPEN_END;
    return period[startKey] <= start && valueEnd <= periodEnd;
  });
}

function overlaps(startA, endA, startB, endB) {
  return startA <= (endB || OPEN_END) && startB <= (endA || OPEN_END);
}

function buildMeta(dataset, requestedDefaultDate) {
  const dates = [];

  for (const rows of Object.values(dataset)) {
    for (const row of rows) {
      for (const value of Object.values(row)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          dates.push(value);
        }
      }
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  dates.push(today);

  const minDate = dates.reduce((min, value) => (value < min ? value : min), dates[0]);
  const maxDate = dates.reduce((max, value) => (value > max ? value : max), dates[0]);

  let defaultDate = requestedDefaultDate || today;
  if (defaultDate < minDate) {
    defaultDate = minDate;
  }
  if (defaultDate > maxDate) {
    defaultDate = maxDate;
  }

  return {
    generatedAt: new Date().toISOString(),
    minDate,
    maxDate,
    defaultDate,
  };
}

function computeSnapshotData(dataset, targetDate) {
  const activeEmploymentRows = dataset.employmentPeriods.filter((row) =>
    isOnDate(row.employment_start, row.employment_end, targetDate),
  );
  const activeEmployeeIds = new Set(activeEmploymentRows.map((row) => row.employee_id));
  const activeLeaveRows = dataset.leavePeriods.filter((row) =>
    isOnDate(row.leave_start, row.leave_end, targetDate),
  );
  const yearPrefix = targetDate.slice(0, 4);

  return {
    active: activeEmployeeIds.size,
    leave: activeLeaveRows.length,
    working: activeEmployeeIds.size - activeLeaveRows.length,
    hiresYtd: dataset.employmentPeriods.filter(
      (row) => row.employment_start.startsWith(yearPrefix) && row.employment_start <= targetDate,
    ).length,
    terminationsYtd: dataset.employmentPeriods.filter(
      (row) => row.employment_end && row.employment_end.startsWith(yearPrefix) && row.employment_end <= targetDate,
    ).length,
  };
}

function isOnDate(start, end, targetDate) {
  if (!start || start > targetDate) {
    return false;
  }
  return !end || targetDate <= end;
}

function buildHtml(payload) {
  const serialized = JSON.stringify(payload).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HR Snapshot Report</title>
    <style>
      :root {
        --bg: #fff7fa;
        --bg-accent: #ffe2ed;
        --panel: rgba(255, 255, 255, 0.94);
        --panel-border: rgba(210, 7, 74, 0.12);
        --ink: #1f1116;
        --muted: #72515d;
        --brand: #d2074a;
        --brand-soft: #ffd5e4;
        --ok: #9f1239;
        --warn: #8f1231;
        --shadow: 0 16px 36px rgba(210, 7, 74, 0.10);
        --radius: 16px;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        color: var(--ink);
        font-family: "IBM Plex Sans KR", "Pretendard", "Apple SD Gothic Neo", sans-serif;
        background:
          radial-gradient(circle at top left, rgba(210, 7, 74, 0.12), transparent 36%),
          radial-gradient(circle at bottom right, rgba(255, 183, 208, 0.22), transparent 30%),
          linear-gradient(180deg, #ffffff 0%, var(--bg) 100%);
      }

      .page {
        max-width: 1360px;
        margin: 0 auto;
        padding: 40px 24px 56px;
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.9fr);
        gap: 22px;
        margin-bottom: 24px;
      }

      .hero-card,
      .panel {
        background: var(--panel);
        border: 1px solid var(--panel-border);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
        backdrop-filter: blur(8px);
      }

      .hero-copy {
        padding: 28px 30px;
      }

      .eyebrow {
        margin: 0 0 10px;
        color: var(--brand);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      h1,
      h2,
      h3 {
        margin: 0;
        font-family: "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif;
        font-weight: 700;
        letter-spacing: -0.03em;
      }

      h1 {
        font-size: clamp(34px, 5vw, 56px);
        line-height: 0.98;
      }

      .hero-copy p {
        margin: 16px 0 0;
        max-width: 62ch;
        color: var(--muted);
        line-height: 1.7;
      }

      .control-card {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        justify-content: space-between;
      }

      .control-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .control-row label {
        color: var(--muted);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      input[type="date"] {
        width: 100%;
        border: 1px solid rgba(31, 23, 18, 0.16);
        border-radius: 12px;
        padding: 14px 16px;
        font: inherit;
        color: var(--ink);
        background: rgba(255, 255, 255, 0.85);
      }

      .meta-list {
        display: grid;
        gap: 10px;
        color: var(--muted);
        font-size: 14px;
      }

      .content {
        display: grid;
        gap: 24px;
      }

      .cards {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 16px;
      }

      .metric {
        padding: 22px 20px;
      }

      .metric-label {
        color: var(--muted);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .metric-value {
        margin-top: 10px;
        font-size: 34px;
        font-weight: 700;
        letter-spacing: -0.04em;
      }

      .metric-sub {
        margin-top: 8px;
        color: var(--muted);
        font-size: 14px;
      }

      .grid {
        display: grid;
        grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
        gap: 24px;
      }

      .panel {
        padding: 24px;
      }

      .panel-head {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        align-items: baseline;
        margin-bottom: 18px;
      }

      .panel-head p {
        margin: 0;
        color: var(--muted);
        font-size: 14px;
      }

      .org-chart-shell {
        padding-bottom: 8px;
      }

      .org-chart {
        display: grid;
        gap: 24px;
      }

      .org-group {
        position: relative;
        display: grid;
        justify-items: center;
      }

      .org-group.depth-0 {
        width: 100%;
      }

      .org-card-anchor {
        position: relative;
        display: flex;
        justify-content: center;
        width: 100%;
      }

      .org-group.has-children > .org-card-anchor::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: -18px;
        width: 1px;
        height: 18px;
        background: rgba(210, 7, 74, 0.22);
        transform: translateX(-50%);
      }

      .org-children {
        position: relative;
        width: 100%;
        margin-top: 18px;
        padding-top: 24px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 18px 16px;
      }

      .org-children::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 0;
        width: 1px;
        height: 24px;
        background: rgba(210, 7, 74, 0.22);
        transform: translateX(-50%);
      }

      .org-children::after {
        content: "";
        position: absolute;
        left: 28px;
        right: 28px;
        top: 0;
        height: 1px;
        background: rgba(210, 7, 74, 0.22);
      }

      .org-children > .org-group {
        position: relative;
        padding-top: 18px;
      }

      .org-children > .org-group::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 0;
        width: 1px;
        height: 18px;
        background: rgba(210, 7, 74, 0.22);
        transform: translateX(-50%);
      }

      .org-card {
        position: relative;
        width: min(100%, 260px);
        padding: 14px 16px 16px;
        border-radius: 14px;
        border: 1px solid rgba(210, 7, 74, 0.16);
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 242, 247, 0.96)),
          linear-gradient(135deg, rgba(210, 7, 74, 0.08), rgba(255, 213, 228, 0.30));
        box-shadow: 0 16px 30px rgba(210, 7, 74, 0.10);
        text-align: left;
        transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        outline: none;
      }

      .org-card:hover,
      .org-card:focus-within,
      .org-card:focus {
        transform: translateY(-3px);
        box-shadow: 0 20px 36px rgba(210, 7, 74, 0.14);
        border-color: rgba(210, 7, 74, 0.28);
      }

      .org-group.depth-0 > .org-card-anchor > .org-card {
        min-width: 280px;
        max-width: 320px;
        padding: 18px 20px 18px;
        background:
          linear-gradient(180deg, rgba(210, 7, 74, 0.96), rgba(173, 5, 61, 0.98)),
          linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
        color: #fff8fb;
      }

      .org-group.depth-0 > .org-card-anchor > .org-card .org-card-type,
      .org-group.depth-0 > .org-card-anchor > .org-card .org-card-caption,
      .org-group.depth-0 > .org-card-anchor > .org-card .org-card-meta,
      .org-group.depth-0 > .org-card-anchor > .org-card .org-card-leader-label {
        color: rgba(248, 244, 239, 0.78);
      }

      .org-group.depth-1 > .org-card-anchor > .org-card {
        width: min(100%, 280px);
      }

      .org-group.depth-2 > .org-card-anchor > .org-card {
        width: min(100%, 240px);
      }

      .org-card-band {
        height: 10px;
        width: 84px;
        border-radius: 999px;
        background: linear-gradient(90deg, #d2074a, #ff6f9e);
        margin-bottom: 12px;
      }

      .org-card-type {
        margin: 0;
        color: var(--muted);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .org-card-title {
        margin-top: 7px;
        font-size: 23px;
        line-height: 1.08;
      }

      .org-card-leader-label {
        margin-top: 14px;
        color: var(--muted);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .org-card-leader {
        margin-top: 4px;
        font-size: 17px;
        font-weight: 700;
        line-height: 1.25;
      }

      .org-card-caption {
        margin-top: 4px;
        color: var(--muted);
        font-size: 13px;
      }

      .org-card-meta {
        margin-top: 12px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        color: var(--muted);
        font-size: 12px;
      }

      .org-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 9px;
        border-radius: 999px;
        background: rgba(210, 7, 74, 0.08);
        color: var(--brand);
        font-weight: 700;
      }

      .org-popover {
        position: absolute;
        z-index: 40;
        top: calc(100% + 12px);
        left: 50%;
        width: 290px;
        padding: 14px;
        border-radius: 14px;
        border: 1px solid rgba(210, 7, 74, 0.18);
        background: rgba(255, 255, 255, 0.99);
        box-shadow: 0 20px 38px rgba(210, 7, 74, 0.16);
        opacity: 0;
        pointer-events: none;
        transform: translate(-50%, 8px);
        transition: opacity 150ms ease, transform 150ms ease;
      }

      .org-card:hover .org-popover,
      .org-card:focus-within .org-popover,
      .org-card:focus .org-popover {
        opacity: 1;
        pointer-events: auto;
        transform: translate(-50%, 0);
      }

      .org-popover::before {
        content: "";
        position: absolute;
        top: -8px;
        left: 50%;
        width: 14px;
        height: 14px;
        background: rgba(255, 255, 255, 0.99);
        border-top: 1px solid rgba(210, 7, 74, 0.18);
        border-left: 1px solid rgba(210, 7, 74, 0.18);
        transform: translateX(-50%) rotate(45deg);
      }

      .org-popover-head {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        align-items: baseline;
      }

      .org-popover-title {
        font-size: 15px;
        font-weight: 700;
      }

      .org-popover-sub {
        color: var(--muted);
        font-size: 12px;
      }

      .org-popover-section {
        margin-top: 12px;
      }

      .org-popover-label {
        margin-bottom: 6px;
        color: var(--muted);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .org-member-list {
        display: grid;
        gap: 7px;
      }

      .org-member-item {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 10px;
        background: rgba(31, 23, 18, 0.04);
        font-size: 13px;
      }

      .org-member-name {
        font-weight: 700;
      }

      .org-member-note {
        color: var(--muted);
        font-size: 12px;
        text-align: right;
      }

      .org-member-empty {
        color: var(--muted);
        font-size: 13px;
      }

      .employee-search {
        display: grid;
        gap: 8px;
        margin-bottom: 16px;
      }

      .employee-search label {
        color: var(--muted);
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      input[type="search"] {
        width: 100%;
        border: 1px solid rgba(210, 7, 74, 0.16);
        border-radius: 12px;
        padding: 14px 16px;
        font: inherit;
        color: var(--ink);
        background: rgba(255, 255, 255, 0.94);
      }

      .search-empty {
        padding: 14px 2px 4px;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }

      th,
      td {
        text-align: left;
        padding: 11px 10px;
        border-bottom: 1px solid rgba(31, 23, 18, 0.08);
        vertical-align: top;
      }

      th {
        color: var(--muted);
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .indent {
        display: inline-block;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 700;
      }

      .status-active {
        background: rgba(29, 107, 67, 0.12);
        color: var(--ok);
      }

      .status-leave {
        background: rgba(176, 88, 43, 0.12);
        color: var(--warn);
      }

      .warnings {
        display: grid;
        gap: 10px;
      }

      .warning-item {
        padding: 12px 14px;
        border-radius: 14px;
        background: rgba(176, 88, 43, 0.09);
        color: #7e421f;
        font-size: 14px;
      }

      .empty {
        color: var(--muted);
        font-size: 14px;
      }

      @media (max-width: 1100px) {
        .hero,
        .grid {
          grid-template-columns: 1fr;
        }

        .cards {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 720px) {
        .page {
          padding: 18px 14px 28px;
        }

        .hero-copy,
        .control-card,
        .panel,
        .metric {
          padding: 18px;
        }

        .cards {
          grid-template-columns: 1fr;
        }

        .org-children {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        .org-children::after {
          left: 18px;
          right: 18px;
        }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <section class="hero">
        <article class="hero-card hero-copy">
          <p class="eyebrow">Local CSV Report</p>
          <h1>HR Snapshot Atlas</h1>
          <p>
            로컬 CSV를 기준으로 특정 날짜의 조직도, 재직/휴직 상태, 당해연도 입퇴사 통계를
            복원하는 self-contained HTML 리포트다. CSV만 수정하고 다시 build하면 같은 HTML
            흐름으로 검증할 수 있다.
          </p>
        </article>
        <aside class="hero-card control-card">
          <div class="control-row">
            <label for="snapshot-date">기준 날짜</label>
            <input id="snapshot-date" type="date" />
          </div>
          <div class="meta-list">
            <div>생성 시각: <strong id="generated-at"></strong></div>
            <div>데이터 범위: <strong id="date-range"></strong></div>
            <div>검증 경고: <strong id="warning-count"></strong></div>
          </div>
        </aside>
      </section>

      <main class="content">
        <section class="cards" id="summary-cards"></section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>조직도</h2>
              <p>팀명과 팀장을 중심으로 보여주고, 카드 hover 시 직속 팀원을 확인</p>
            </div>
          </div>
          <div id="org-tree" class="org-chart-shell"></div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>팀 요약</h2>
              <p>직속 인원과 하위 포함 조직 규모를 함께 표시</p>
            </div>
          </div>
          <div style="overflow:auto">
            <table>
              <thead>
                <tr>
                  <th>조직</th>
                  <th>직속</th>
                  <th>하위 포함</th>
                  <th>근무</th>
                  <th>휴직</th>
                  <th>리더</th>
                </tr>
              </thead>
              <tbody id="team-summary"></tbody>
            </table>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>직원 스냅샷</h2>
              <p>이름, 직원 ID, 팀명으로 검색했을 때만 결과를 표시</p>
            </div>
          </div>
          <div class="employee-search">
            <label for="employee-search">직원 검색</label>
            <input id="employee-search" type="search" placeholder="예: EMP-0067, 홍채린, 프론트엔드팀" />
          </div>
          <div id="employee-empty" class="empty search-empty">검색어를 입력하면 직원 스냅샷이 표시됩니다.</div>
          <div id="employee-table-wrap" style="overflow:auto; display:none">
            <table>
              <thead>
                <tr>
                  <th>직원</th>
                  <th>소속</th>
                  <th>상태</th>
                  <th>역할</th>
                  <th>고용 형태</th>
                  <th>메모</th>
                </tr>
              </thead>
              <tbody id="employee-summary"></tbody>
            </table>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div>
              <h2>검증 경고</h2>
              <p>빌드 시점 기준 데이터 무결성 검사 결과</p>
            </div>
          </div>
          <div id="warnings" class="warnings"></div>
        </section>
      </main>
    </div>

    <script>
      const BOOTSTRAP = ${serialized};

      const ROLE_LABELS = {
        CEO: "대표",
        VICE_CEO: "부대표",
        EVP: "전무",
        SVP: "상무",
        DIRECTOR: "이사",
        TEAM_LEAD: "팀장",
      };

      const TEAM_TYPE_ORDER = {
        COMPANY: 0,
        DIVISION: 1,
        TEAM: 2,
      };

      const TEAM_TYPE_LABELS = {
        COMPANY: "Company",
        DIVISION: "Division",
        TEAM: "Team",
      };

      const ROLE_ORDER = {
        CEO: 0,
        VICE_CEO: 1,
        EVP: 2,
        SVP: 3,
        DIRECTOR: 4,
        TEAM_LEAD: 5,
      };

      function isTrue(value) {
        return String(value || "").toUpperCase() === "TRUE";
      }

      function isOnDate(start, end, targetDate) {
        if (!start || start > targetDate) {
          return false;
        }
        return !end || targetDate <= end;
      }

      function escapeHtml(value) {
        return String(value || "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#39;");
      }

      function groupBy(rows, key) {
        const groups = new Map();
        for (const row of rows) {
          const group = row[key];
          if (!groups.has(group)) {
            groups.set(group, []);
          }
          groups.get(group).push(row);
        }
        return groups;
      }

      function sortNodes(nodes) {
        return nodes.sort((left, right) => {
          const typeCompare = (TEAM_TYPE_ORDER[left.teamType] ?? 9) - (TEAM_TYPE_ORDER[right.teamType] ?? 9);
          if (typeCompare !== 0) {
            return typeCompare;
          }
          return left.teamName.localeCompare(right.teamName, "ko");
        });
      }

      function computeSnapshot(targetDate) {
        const dataset = BOOTSTRAP.dataset;
        const employeeMap = new Map(dataset.employees.map((row) => [row.employee_id, row]));
        const teamMap = new Map(dataset.teams.map((row) => [row.team_id, row]));
        const activeEmploymentRows = dataset.employmentPeriods.filter((row) =>
          isOnDate(row.employment_start, row.employment_end, targetDate),
        );
        const activeEmployeeIds = new Set(activeEmploymentRows.map((row) => row.employee_id));
        const employmentByEmployee = new Map(activeEmploymentRows.map((row) => [row.employee_id, row]));

        const activeLeaveRows = dataset.leavePeriods.filter((row) =>
          isOnDate(row.leave_start, row.leave_end, targetDate),
        );
        const leaveByEmployee = groupBy(activeLeaveRows, "employee_id");

        const activeAssignments = dataset.teamAssignments.filter(
          (row) => isTrue(row.is_primary) && isOnDate(row.assignment_start, row.assignment_end, targetDate),
        );
        const assignmentByEmployee = new Map(activeAssignments.map((row) => [row.employee_id, row]));

        const activeRoles = dataset.roleAssignments.filter((row) =>
          isOnDate(row.role_start, row.role_end, targetDate),
        );
        const rolesByEmployee = groupBy(activeRoles, "employee_id");
        const rolesByScopeTeam = groupBy(activeRoles, "scope_team_id");

        const activeStructures = dataset.teamStructureHistory.filter(
          (row) => row.status !== "CLOSED" && isOnDate(row.effective_from, row.effective_to, targetDate),
        );

        const nodes = new Map();

        for (const structure of activeStructures) {
          const teamMeta = teamMap.get(structure.team_id) || {};
          nodes.set(structure.team_id, {
            teamId: structure.team_id,
            teamName: structure.team_name,
            parentTeamId: structure.parent_team_id,
            teamType: teamMeta.team_type || "TEAM",
            note: structure.note || teamMeta.note || "",
            directMembers: [],
            children: [],
            roles: rolesByScopeTeam.get(structure.team_id) || [],
          });
        }

        for (const node of nodes.values()) {
          if (node.parentTeamId && nodes.has(node.parentTeamId)) {
            nodes.get(node.parentTeamId).children.push(node);
          }
        }

        for (const employeeId of activeEmployeeIds) {
          const employee = employeeMap.get(employeeId);
          const assignment = assignmentByEmployee.get(employeeId);
          const roleRows = rolesByEmployee.get(employeeId) || [];
          const roleText = roleRows
            .slice()
            .sort((left, right) => (ROLE_ORDER[left.role_code] ?? 99) - (ROLE_ORDER[right.role_code] ?? 99))
            .map((row) => ROLE_LABELS[row.role_code] || row.role_code)
            .join(", ");
          const employment = employmentByEmployee.get(employeeId);
          const onLeave = leaveByEmployee.has(employeeId);
          const member = {
            employeeId,
            name: employee?.name || employeeId,
            employmentType: employee?.employment_type || "",
            note: employee?.status_note || "",
            onLeave,
            roleText,
            teamId: assignment?.team_id || "",
            teamName: assignment?.team_id ? (nodes.get(assignment.team_id)?.teamName || teamMap.get(assignment.team_id)?.team_name_current || assignment.team_id) : "미배정",
            isTerminationDay: employment?.employment_end === targetDate,
          };

          if (assignment?.team_id && nodes.has(assignment.team_id)) {
            nodes.get(assignment.team_id).directMembers.push(member);
          }
        }

        const roots = sortNodes(
          Array.from(nodes.values()).filter((node) => !node.parentTeamId || !nodes.has(node.parentTeamId)),
        );

        for (const node of nodes.values()) {
          sortNodes(node.children);
          node.directMembers.sort((left, right) => left.name.localeCompare(right.name, "ko"));
        }

        function decorate(node, depth = 0) {
          const children = node.children.map((child) => decorate(child, depth + 1));
          const directActive = node.directMembers.length;
          const directLeave = node.directMembers.filter((member) => member.onLeave).length;
          const directWorking = directActive - directLeave;
          const subtreeActive = directActive + children.reduce((sum, child) => sum + child.stats.subtreeActive, 0);
          const subtreeLeave = directLeave + children.reduce((sum, child) => sum + child.stats.subtreeLeave, 0);
          const subtreeWorking = directWorking + children.reduce((sum, child) => sum + child.stats.subtreeWorking, 0);
          const leader = (node.roles || [])
            .slice()
            .sort((left, right) => (ROLE_ORDER[left.role_code] ?? 99) - (ROLE_ORDER[right.role_code] ?? 99))[0];
          const leaderName = leader ? employeeMap.get(leader.employee_id)?.name || leader.employee_id : "공석";
          const leaderRole = leader ? ROLE_LABELS[leader.role_code] || leader.role_code : "공석";

          return {
            ...node,
            depth,
            children,
            leaderEmployeeId: leader ? leader.employee_id : "",
            leaderName,
            leaderRole,
            stats: {
              directActive,
              directWorking,
              directLeave,
              subtreeActive,
              subtreeWorking,
              subtreeLeave,
            },
          };
        }

        const decoratedRoots = roots.map((root) => decorate(root));
        const flattenedTeams = [];

        function flatten(node) {
          flattenedTeams.push(node);
          node.children.forEach(flatten);
        }

        decoratedRoots.forEach(flatten);

        const employeeRows = Array.from(activeEmployeeIds)
          .map((employeeId) => {
            const employee = employeeMap.get(employeeId);
            const assignment = assignmentByEmployee.get(employeeId);
            const employment = employmentByEmployee.get(employeeId);
            const roleRows = (rolesByEmployee.get(employeeId) || []).slice();
            roleRows.sort((left, right) => (ROLE_ORDER[left.role_code] ?? 99) - (ROLE_ORDER[right.role_code] ?? 99));
            return {
              employeeId,
              name: employee?.name || employeeId,
              teamName: assignment?.team_id
                ? nodes.get(assignment.team_id)?.teamName || teamMap.get(assignment.team_id)?.team_name_current || assignment.team_id
                : "미배정",
              onLeave: leaveByEmployee.has(employeeId),
              isTerminationDay: employment?.employment_end === targetDate,
              roleText: roleRows.map((row) => ROLE_LABELS[row.role_code] || row.role_code).join(", ") || "팀원",
              employmentType: employee?.employment_type || "",
              note: employee?.status_note || "",
            };
          })
          .sort((left, right) => {
            const teamCompare = left.teamName.localeCompare(right.teamName, "ko");
            if (teamCompare !== 0) {
              return teamCompare;
            }
            return left.name.localeCompare(right.name, "ko");
          });

        const yearPrefix = targetDate.slice(0, 4);
        const hiresYtd = dataset.employmentPeriods.filter(
          (row) => row.employment_start.startsWith(yearPrefix) && row.employment_start <= targetDate,
        ).length;
        const terminationsYtd = dataset.employmentPeriods.filter(
          (row) => row.employment_end && row.employment_end.startsWith(yearPrefix) && row.employment_end <= targetDate,
        ).length;

        return {
          targetDate,
          summary: {
            active: activeEmployeeIds.size,
            leave: activeLeaveRows.length,
            working: activeEmployeeIds.size - activeLeaveRows.length,
            hiresYtd,
            terminationsYtd,
          },
          roots: decoratedRoots,
          teams: flattenedTeams,
          employees: employeeRows,
        };
      }

      function renderCards(snapshot) {
        const cards = [
          ["총 재직", snapshot.summary.active, "기준일 기준 재직 중인 인원"],
          ["총 근무", snapshot.summary.working, "휴직자를 제외한 근무 인원"],
          ["총 휴직", snapshot.summary.leave, "기준일 기준 휴직 중인 인원"],
          ["당해연도 입사", snapshot.summary.hiresYtd, "기준 연도 1월 1일부터 누적"],
          ["당해연도 퇴사", snapshot.summary.terminationsYtd, "기준 연도 1월 1일부터 누적"],
        ];

        return cards
          .map(
            ([label, value, sub]) => \`
              <article class="hero-card metric">
                <div class="metric-label">\${escapeHtml(label)}</div>
                <div class="metric-value">\${escapeHtml(value)}</div>
                <div class="metric-sub">\${escapeHtml(sub)}</div>
              </article>
            \`,
          )
          .join("");
      }

      function renderTree(nodes) {
        if (nodes.length === 0) {
          return '<p class="empty">선택한 날짜에 유효한 조직 구조가 없습니다.</p>';
        }
        return \`
          <div class="org-chart">
            \${nodes.map(renderTreeNode).join("")}
          </div>
        \`;
      }

      function renderTreeNode(node) {
        const teamMembers = node.directMembers.filter((member) => member.employeeId !== node.leaderEmployeeId);
        const leaderStatus = node.leaderName === "공석" ? "리더 공석" : node.leaderRole;
        const membersMarkup = teamMembers.length
          ? teamMembers
              .map((member) => {
                const notes = [];
                if (member.roleText && member.roleText !== "팀원") {
                  notes.push(member.roleText);
                }
                if (member.onLeave) {
                  notes.push("휴직");
                }
                if (member.isTerminationDay) {
                  notes.push("당일 퇴사");
                }
                return \`
                  <div class="org-member-item">
                    <span class="org-member-name">\${escapeHtml(member.name)}</span>
                    <span class="org-member-note">\${escapeHtml(notes.join(" · ") || "팀원")}</span>
                  </div>
                \`;
              })
              .join("")
          : '<div class="org-member-empty">직속 팀원이 없습니다.</div>';
        const children = node.children.length
          ? \`<div class="org-children">\${node.children.map(renderTreeNode).join("")}</div>\`
          : "";

        return \`
          <section class="org-group depth-\${node.depth} \${node.children.length ? "has-children" : ""}">
            <div class="org-card-anchor">
              <article class="org-card" tabindex="0" aria-label="\${escapeHtml(node.teamName)} 조직 카드">
                <div class="org-card-band"></div>
                <div class="org-card-type">\${escapeHtml(TEAM_TYPE_LABELS[node.teamType] || node.teamType)}</div>
                <h3 class="org-card-title">\${escapeHtml(node.teamName)}</h3>
                <div class="org-card-leader-label">Leader</div>
                <div class="org-card-leader">\${escapeHtml(node.leaderName)}</div>
                <div class="org-card-caption">\${escapeHtml(leaderStatus)}</div>
                <div class="org-card-meta">
                  <span class="org-chip">직속 \${node.stats.directActive}</span>
                  <span class="org-chip">근무 \${node.stats.subtreeWorking}</span>
                  <span class="org-chip">휴직 \${node.stats.subtreeLeave}</span>
                </div>
                <div class="org-popover" role="note" aria-hidden="true">
                  <div class="org-popover-head">
                    <div class="org-popover-title">\${escapeHtml(node.teamName)}</div>
                    <div class="org-popover-sub">직속 \${node.stats.directActive}명</div>
                  </div>
                  <div class="org-popover-section">
                    <div class="org-popover-label">Leader</div>
                    <div class="org-member-item">
                      <span class="org-member-name">\${escapeHtml(node.leaderName)}</span>
                      <span class="org-member-note">\${escapeHtml(leaderStatus)}</span>
                    </div>
                  </div>
                  <div class="org-popover-section">
                    <div class="org-popover-label">Members</div>
                    <div class="org-member-list">\${membersMarkup}</div>
                  </div>
                </div>
              </article>
            </div>
            \${children}
          </section>
        \`;
      }

      function renderTeamSummary(teams) {
        return teams
          .map(
            (team) => \`
              <tr>
                <td><span class="indent" style="padding-left:\${team.depth * 16}px">\${escapeHtml(team.teamName)}</span></td>
                <td>\${team.stats.directActive}</td>
                <td>\${team.stats.subtreeActive}</td>
                <td>\${team.stats.subtreeWorking}</td>
                <td>\${team.stats.subtreeLeave}</td>
                <td>\${escapeHtml(team.leaderName)}</td>
              </tr>
            \`,
          )
          .join("");
      }

      function renderEmployees(employees) {
        return employees
          .map((employee) => {
            const statusClass = employee.onLeave ? "status-leave" : "status-active";
            const statusLabel = employee.onLeave ? "휴직" : employee.isTerminationDay ? "재직 / 당일 퇴사" : "재직";
            return \`
              <tr>
                <td>\${escapeHtml(employee.name)}<br /><span style="color:var(--muted);font-size:12px">\${escapeHtml(employee.employeeId)}</span></td>
                <td>\${escapeHtml(employee.teamName)}</td>
                <td><span class="status-pill \${statusClass}">\${escapeHtml(statusLabel)}</span></td>
                <td>\${escapeHtml(employee.roleText || "-")}</td>
                <td>\${escapeHtml(employee.employmentType || "-")}</td>
                <td>\${escapeHtml(employee.note || "-")}</td>
              </tr>
            \`;
          })
          .join("");
      }

      function filterEmployees(employees, rawQuery) {
        const query = rawQuery.trim().toLowerCase();
        if (!query) {
          return [];
        }

        return employees.filter((employee) => {
          const haystack = [
            employee.employeeId,
            employee.name,
            employee.teamName,
            employee.roleText,
            employee.employmentType,
            employee.note,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(query);
        });
      }

      function renderWarnings(warnings) {
        if (warnings.length === 0) {
          return '<p class="empty">경고 없음. 현재 데이터셋에서는 기본 무결성 검사를 통과했습니다.</p>';
        }

        return warnings.map((warning) => \`<div class="warning-item">\${escapeHtml(warning)}</div>\`).join("");
      }

      function refresh() {
        const dateInput = document.getElementById("snapshot-date");
        const searchInput = document.getElementById("employee-search");
        const snapshot = computeSnapshot(dateInput.value);
        const filteredEmployees = filterEmployees(snapshot.employees, searchInput.value);
        document.getElementById("summary-cards").innerHTML = renderCards(snapshot);
        document.getElementById("org-tree").innerHTML = renderTree(snapshot.roots);
        document.getElementById("team-summary").innerHTML = renderTeamSummary(snapshot.teams);

        const employeeEmpty = document.getElementById("employee-empty");
        const employeeTableWrap = document.getElementById("employee-table-wrap");
        if (!searchInput.value.trim()) {
          employeeEmpty.textContent = "검색어를 입력하면 직원 스냅샷이 표시됩니다.";
          employeeEmpty.style.display = "block";
          employeeTableWrap.style.display = "none";
        } else if (filteredEmployees.length === 0) {
          employeeEmpty.textContent = "검색 결과가 없습니다.";
          employeeEmpty.style.display = "block";
          employeeTableWrap.style.display = "none";
        } else {
          employeeEmpty.style.display = "none";
          employeeTableWrap.style.display = "block";
          document.getElementById("employee-summary").innerHTML = renderEmployees(filteredEmployees);
        }
      }

      function boot() {
        const dateInput = document.getElementById("snapshot-date");
        const searchInput = document.getElementById("employee-search");
        dateInput.min = BOOTSTRAP.meta.minDate;
        dateInput.max = BOOTSTRAP.meta.maxDate;
        dateInput.value = BOOTSTRAP.meta.defaultDate;
        dateInput.addEventListener("input", refresh);
        searchInput.addEventListener("input", refresh);

        document.getElementById("generated-at").textContent = BOOTSTRAP.meta.generatedAt.slice(0, 16).replace("T", " ");
        document.getElementById("date-range").textContent = \`\${BOOTSTRAP.meta.minDate} ~ \${BOOTSTRAP.meta.maxDate}\`;
        document.getElementById("warning-count").textContent = \`\${BOOTSTRAP.warnings.length}건\`;
        document.getElementById("warnings").innerHTML = renderWarnings(BOOTSTRAP.warnings);

        refresh();
      }

      boot();
    </script>
  </body>
</html>`;
}

function groupBy(rows, key) {
  const groups = new Map();
  for (const row of rows) {
    const group = row[key];
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group).push(row);
  }
  return groups;
}

function isTrue(value) {
  return String(value || "").toUpperCase() === "TRUE";
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

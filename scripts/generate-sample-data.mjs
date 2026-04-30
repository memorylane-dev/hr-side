import path from "node:path";
import { promises as fs } from "node:fs";

const OUTPUT_DIR = path.join(process.cwd(), "data/current");

const rootOrg = {
  team_id: "ORG-CEO",
  team_code: "CEO",
  team_name_current: "대표실",
  team_type: "COMPANY",
  active_from: "2015-01-01",
  active_to: "",
  note: "최상위 조직",
};

const divisions = [
  {
    team_id: "DIV-PRODUCT",
    team_code: "PROD",
    team_name_current: "Product본부",
    team_type: "DIVISION",
    active_from: "2015-01-01",
    active_to: "",
    note: "제품 전략과 기획",
    head: { id: 5, name: "신서영", role: "VICE_CEO", hire: "2016-03-07", note: "Product본부 총괄" },
    directors: [
      { id: 9, name: "송이준", hire: "2018-02-12" },
      { id: 10, name: "임다솔", hire: "2018-08-20" },
    ],
    coordinator: { id: 17, name: "정유빈", hire: "2022-05-16" },
  },
  {
    team_id: "DIV-PLATFORM",
    team_code: "PLAT",
    team_name_current: "Platform본부",
    team_type: "DIVISION",
    active_from: "2015-01-01",
    active_to: "",
    note: "제품 개발과 인프라",
    head: { id: 6, name: "김도윤", role: "EVP", hire: "2015-11-02", note: "Platform본부 총괄" },
    directors: [
      { id: 11, name: "오세린", hire: "2019-04-08" },
      { id: 12, name: "문태경", hire: "2020-01-13" },
    ],
    coordinator: { id: 18, name: "서주아", hire: "2023-03-06" },
  },
  {
    team_id: "DIV-GROWTH",
    team_code: "GROW",
    team_name_current: "Growth본부",
    team_type: "DIVISION",
    active_from: "2015-01-01",
    active_to: "",
    note: "매출과 고객 성장",
    head: { id: 7, name: "박재윤", role: "SVP", hire: "2017-06-19", note: "Growth본부 총괄" },
    directors: [
      { id: 13, name: "장서하", hire: "2019-09-30" },
      { id: 14, name: "최민서", hire: "2021-02-15" },
    ],
    coordinator: { id: 19, name: "한예빈", hire: "2023-09-04" },
  },
  {
    team_id: "DIV-CORP",
    team_code: "CORP",
    team_name_current: "Corporate본부",
    team_type: "DIVISION",
    active_from: "2015-01-01",
    active_to: "",
    note: "경영지원과 운영",
    head: { id: 8, name: "윤해준", role: "EVP", hire: "2016-10-10", note: "Corporate본부 총괄" },
    directors: [
      { id: 15, name: "강로은", hire: "2018-12-03" },
      { id: 16, name: "이하진", hire: "2020-06-22" },
    ],
    coordinator: { id: 20, name: "배지원", hire: "2024-02-19" },
  },
];

const teams = [
  ["TEAM-PM", "PM", "프로덕트기획팀", "DIV-PRODUCT", "한지후"],
  ["TEAM-DESIGN", "DESIGN", "프로덕트디자인팀", "DIV-PRODUCT", "박나연"],
  ["TEAM-GTM", "GTM", "그로스마케팅팀", "DIV-PRODUCT", "송도경"],
  ["TEAM-CONTENT", "CONTENT", "콘텐츠전략팀", "DIV-PRODUCT", "이주원"],
  ["TEAM-INSIGHT", "INSIGHT", "사용자리서치팀", "DIV-PRODUCT", "최수안"],
  ["TEAM-FRONTEND", "FE", "프론트엔드팀", "DIV-PLATFORM", "윤도윤"],
  ["TEAM-BACKEND", "BE", "백엔드플랫폼팀", "DIV-PLATFORM", "문시우"],
  ["TEAM-DATAPLATFORM", "DATA", "데이터플랫폼팀", "DIV-PLATFORM", "정하율"],
  ["TEAM-INFRA", "INFRA", "인프라팀", "DIV-PLATFORM", "조민재"],
  ["TEAM-SECURITY", "SEC", "보안팀", "DIV-PLATFORM", "임서진"],
  ["TEAM-SALES", "SALES", "영업전략팀", "DIV-GROWTH", "배도윤"],
  ["TEAM-CS", "CS", "고객성공팀", "DIV-GROWTH", "신유림"],
  ["TEAM-PARTNER", "PARTNER", "파트너십팀", "DIV-GROWTH", "권서우"],
  ["TEAM-REGION", "REGION", "지역운영팀", "DIV-GROWTH", "한도윤"],
  ["TEAM-CRM", "CRM", "CRM운영팀", "DIV-GROWTH", "오하린"],
  ["TEAM-HR", "HR", "인사팀", "DIV-CORP", "장나윤"],
  ["TEAM-FINANCE", "FIN", "재무팀", "DIV-CORP", "서준영"],
  ["TEAM-LEGAL", "LEGAL", "법무팀", "DIV-CORP", "김세아"],
  ["TEAM-BIZOPS", "BIZOPS", "경영기획팀", "DIV-CORP", "남주원"],
  ["TEAM-ITSUPPORT", "IT", "IT지원팀", "DIV-CORP", "유다온"],
].map(([team_id, team_code, team_name_current, divisionId, leadName], index) => ({
  team_id,
  team_code,
  team_name_current,
  divisionId,
  leadName,
  team_type: "TEAM",
  active_from: "2018-01-01",
  active_to: "",
  note: `${divisionId} 산하 팀`,
  index,
}));

const topOfficeStaff = [
  { id: 1, name: "윤민석", hire: "2015-01-05", note: "대표" },
  { id: 2, name: "김서아", hire: "2016-04-11", note: "대표실 Chief of Staff" },
  { id: 3, name: "박주안", hire: "2018-07-02", note: "Executive Assistant" },
  { id: 4, name: "이도현", hire: "2021-05-17", note: "대표실 전략 프로젝트 담당" },
];

const specialCases = {
  teamLeadVacancyEmployeeId: "EMP-0057",
  teamLeadVacancyEnd: "2026-02-15",
  turnoverOldLeadEmployeeId: "EMP-0066",
  turnoverNewLeadEmployeeId: "EMP-0067",
  turnoverDate: "2026-01-01",
  rehireEmployeeId: "EMP-0124",
  rehireFirstEnd: "2022-09-30",
  rehireSecondStart: "2024-02-01",
  priorTerminationEmployeeId: "EMP-0145",
  priorTerminationDate: "2026-01-20",
  transferDuringLeaveEmployeeId: "EMP-0160",
  transferDate: "2026-02-01",
  transferFromTeamId: "TEAM-HR",
  transferToTeamId: "TEAM-FINANCE",
  targetDateTerminationEmployeeId: "EMP-0200",
  targetDateTermination: "2026-04-30",
};

const currentLeaveCases = [
  { id: "EMP-0091", type: "PARENTAL", start: "2026-03-01", end: "", note: "장기 육아휴직" },
  { id: "EMP-0149", type: "SICK", start: "2026-01-10", end: "2026-06-10", note: "치료 휴직" },
  { id: "EMP-0160", type: "PARENTAL", start: "2025-11-01", end: "2026-05-31", note: "휴직 중 재무팀 이동" },
  { id: "EMP-0188", type: "PERSONAL", start: "2026-02-05", end: "2026-05-15", note: "개인 사유 휴직" },
];

const pastLeaveCases = [
  { id: "EMP-0038", type: "UNPAID", start: "2024-10-01", end: "2024-11-15", note: "과거 무급휴직" },
  { id: "EMP-0117", type: "SICK", start: "2025-03-03", end: "2025-03-28", note: "과거 병가" },
];

const newHireIds2026 = new Set(["EMP-0083", "EMP-0118", "EMP-0173", "EMP-0194"]);
const contractIds = new Set(["EMP-0035", "EMP-0072", "EMP-0108", "EMP-0136", "EMP-0179", "EMP-0198"]);

async function main() {
  const dataset = buildDataset();
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (const [filename, rows] of Object.entries(dataset)) {
    const content = toCsv(rows);
    await fs.writeFile(path.join(OUTPUT_DIR, filename), content, "utf8");
  }

  console.log(`Generated sample data into ${OUTPUT_DIR}`);
  console.log(`Employees: ${dataset["Employees.csv"].length - 1}`);
}

function buildDataset() {
  const employees = [];
  const employmentPeriods = [];
  const leavePeriods = [];
  const teamAssignments = [];
  const roleAssignments = [];

  const teamRows = [
    rootOrg,
    ...divisions.map((division) => ({
      team_id: division.team_id,
      team_code: division.team_code,
      team_name_current: division.team_name_current,
      team_type: division.team_type,
      active_from: division.active_from,
      active_to: division.active_to,
      note: division.note,
    })),
    ...teams.map((team) => ({
      team_id: team.team_id,
      team_code: team.team_code,
      team_name_current: team.team_name_current,
      team_type: team.team_type,
      active_from: team.active_from,
      active_to: team.active_to,
      note: team.note,
    })),
  ];

  const structureRows = [
    {
      history_id: "TSH-0001",
      team_id: rootOrg.team_id,
      team_name: rootOrg.team_name_current,
      parent_team_id: "",
      effective_from: "2015-01-01",
      effective_to: "",
      status: "ACTIVE",
      note: rootOrg.note,
    },
    ...divisions.map((division, index) => ({
      history_id: `TSH-${pad(index + 2, 4)}`,
      team_id: division.team_id,
      team_name: division.team_name_current,
      parent_team_id: rootOrg.team_id,
      effective_from: division.active_from,
      effective_to: "",
      status: "ACTIVE",
      note: division.note,
    })),
    ...teams.map((team, index) => ({
      history_id: `TSH-${pad(index + 6, 4)}`,
      team_id: team.team_id,
      team_name: team.team_name_current,
      parent_team_id: team.divisionId,
      effective_from: team.active_from,
      effective_to: "",
      status: "ACTIVE",
      note: team.note,
    })),
  ];

  for (const person of topOfficeStaff) {
    const employeeId = formatEmployeeId(person.id);
    employees.push(
      employeeRow(
        employeeId,
        person.name,
        emailFor(employeeId),
        "FULL_TIME",
        person.hire,
        "",
        person.note,
      ),
    );
    employmentPeriods.push(employmentRow(employeeId, 1, person.hire, "", "NEW_HIRE", "", ""));
    teamAssignments.push(
      assignmentRow(employeeId, 1, rootOrg.team_id, person.hire, "", "TRUE", "STANDARD", person.note),
    );
  }

  roleAssignments.push(roleRow("EMP-0001", 1, "CEO", "COMPANY", rootOrg.team_id, "2015-01-05", "", "FALSE", "대표"));

  for (const division of divisions) {
    const headId = formatEmployeeId(division.head.id);
    employees.push(
      employeeRow(
        headId,
        division.head.name,
        emailFor(headId),
        "FULL_TIME",
        division.head.hire,
        "",
        division.head.note,
      ),
    );
    employmentPeriods.push(employmentRow(headId, 1, division.head.hire, "", "NEW_HIRE", "", ""));
    teamAssignments.push(
      assignmentRow(headId, 1, division.team_id, division.head.hire, "", "TRUE", "STANDARD", division.head.note),
    );
    roleAssignments.push(
      roleRow(headId, 1, division.head.role, "DIVISION", division.team_id, division.head.hire, "", "FALSE", division.head.note),
    );

    for (const director of division.directors) {
      const employeeId = formatEmployeeId(director.id);
      employees.push(employeeRow(employeeId, director.name, emailFor(employeeId), "FULL_TIME", director.hire, "", "본부 이사"));
      employmentPeriods.push(employmentRow(employeeId, 1, director.hire, "", "NEW_HIRE", "", ""));
      teamAssignments.push(
        assignmentRow(employeeId, 1, division.team_id, director.hire, "", "TRUE", "STANDARD", "본부 직속 이사"),
      );
      roleAssignments.push(
        roleRow(employeeId, 1, "DIRECTOR", "DIVISION", division.team_id, director.hire, "", "FALSE", "본부 직속 이사"),
      );
    }

    const coordinatorId = formatEmployeeId(division.coordinator.id);
    employees.push(
      employeeRow(
        coordinatorId,
        division.coordinator.name,
        emailFor(coordinatorId),
        "FULL_TIME",
        division.coordinator.hire,
        "",
        "본부 coordinator",
      ),
    );
    employmentPeriods.push(employmentRow(coordinatorId, 1, division.coordinator.hire, "", "NEW_HIRE", "", ""));
    teamAssignments.push(
      assignmentRow(coordinatorId, 1, division.team_id, division.coordinator.hire, "", "TRUE", "STANDARD", "본부 coordinator"),
    );
  }

  let currentNumericId = 21;
  for (const team of teams) {
    for (let memberIndex = 0; memberIndex < 9; memberIndex += 1) {
      const numericId = currentNumericId;
      currentNumericId += 1;
      const employeeId = formatEmployeeId(numericId);
      const isLeadSlot = memberIndex === 0;
      const isTurnoverNewLead = employeeId === specialCases.turnoverNewLeadEmployeeId;
      const name = resolveTeamMemberName(team, employeeId, memberIndex);
      const hireDate = resolveHireDate(team.index, employeeId, memberIndex);
      const employmentType = contractIds.has(employeeId) ? "CONTRACT" : "FULL_TIME";
      const note = resolveStatusNote(employeeId, team.team_name_current, isLeadSlot, isTurnoverNewLead);
      const finalTerminationDate =
        employeeId === specialCases.teamLeadVacancyEmployeeId
          ? specialCases.teamLeadVacancyEnd
          : employeeId === specialCases.priorTerminationEmployeeId
            ? specialCases.priorTerminationDate
            : employeeId === specialCases.targetDateTerminationEmployeeId
              ? specialCases.targetDateTermination
              : "";

      employees.push(employeeRow(employeeId, name, emailFor(employeeId), employmentType, hireDate, finalTerminationDate, note));

      if (employeeId === specialCases.rehireEmployeeId) {
        employmentPeriods.push(
          employmentRow(employeeId, 1, "2019-04-15", specialCases.rehireFirstEnd, "NEW_HIRE", "RESIGNATION", "1차 근무"),
        );
        employmentPeriods.push(
          employmentRow(employeeId, 2, specialCases.rehireSecondStart, "", "REHIRE", "", "2차 근무"),
        );
      } else {
        employmentPeriods.push(
          employmentRow(
            employeeId,
            1,
            hireDate,
            finalTerminationDate,
            "NEW_HIRE",
            finalTerminationDate ? "RESIGNATION" : "",
            finalTerminationDate ? "퇴사 이력 포함" : "",
          ),
        );
      }

      if (employeeId === specialCases.transferDuringLeaveEmployeeId) {
        teamAssignments.push(
          assignmentRow(
            employeeId,
            1,
            specialCases.transferFromTeamId,
            hireDate,
            "2026-01-31",
            "TRUE",
            "STANDARD",
            "휴직 중 전배 전 소속",
          ),
        );
        teamAssignments.push(
          assignmentRow(
            employeeId,
            2,
            specialCases.transferToTeamId,
            specialCases.transferDate,
            "",
            "TRUE",
            "STANDARD",
            "휴직 중 전배",
          ),
        );
      } else if (employeeId === specialCases.rehireEmployeeId) {
        teamAssignments.push(
          assignmentRow(employeeId, 1, team.team_id, "2019-04-15", specialCases.rehireFirstEnd, "TRUE", "STANDARD", "1차 근무"),
        );
        teamAssignments.push(
          assignmentRow(employeeId, 2, team.team_id, specialCases.rehireSecondStart, "", "TRUE", "STANDARD", "재입사 후 복귀"),
        );
      } else {
        teamAssignments.push(
          assignmentRow(
            employeeId,
            1,
            team.team_id,
            hireDate,
            finalTerminationDate,
            "TRUE",
            "STANDARD",
            employeeId === specialCases.targetDateTerminationEmployeeId ? "기준일 당일 퇴사" : "",
          ),
        );
      }

      if (isLeadSlot) {
        if (employeeId === specialCases.teamLeadVacancyEmployeeId) {
          roleAssignments.push(
            roleRow(
              employeeId,
              1,
              "TEAM_LEAD",
              "TEAM",
              team.team_id,
              hireDate,
              specialCases.teamLeadVacancyEnd,
              "FALSE",
              "공석 발생 전 팀장",
            ),
          );
        } else if (employeeId === specialCases.turnoverOldLeadEmployeeId) {
          roleAssignments.push(
            roleRow(
              employeeId,
              1,
              "TEAM_LEAD",
              "TEAM",
              team.team_id,
              hireDate,
              "2025-12-31",
              "FALSE",
              "팀장 교체 전 리더",
            ),
          );
        } else {
          roleAssignments.push(roleRow(employeeId, 1, "TEAM_LEAD", "TEAM", team.team_id, hireDate, "", "FALSE", "기본 팀장"));
        }
      }

      if (isTurnoverNewLead) {
        roleAssignments.push(
          roleRow(
            employeeId,
            1,
            "TEAM_LEAD",
            "TEAM",
            team.team_id,
            specialCases.turnoverDate,
            "",
            "FALSE",
            "팀장 승진",
          ),
        );
      }
    }
  }

  for (const leave of [...currentLeaveCases, ...pastLeaveCases]) {
    leavePeriods.push(leaveRow(leave.id, leave.type, leave.start, leave.end, leave.note));
  }

  return {
    "Employees.csv": withHeader(
      ["employee_id", "name", "email", "employment_type", "initial_hire_date", "final_termination_date", "status_note"],
      employees,
    ),
    "Teams.csv": withHeader(["team_id", "team_code", "team_name_current", "team_type", "active_from", "active_to", "note"], teamRows),
    "Employment_Periods.csv": withHeader(
      ["employment_period_id", "employee_id", "employment_start", "employment_end", "hire_reason", "termination_reason", "note"],
      employmentPeriods,
    ),
    "Leave_Periods.csv": withHeader(["leave_id", "employee_id", "leave_type", "leave_start", "leave_end", "note"], leavePeriods),
    "Team_Assignments.csv": withHeader(
      ["assignment_id", "employee_id", "team_id", "assignment_start", "assignment_end", "is_primary", "assignment_type", "note"],
      teamAssignments,
    ),
    "Role_Assignments.csv": withHeader(
      ["role_assignment_id", "employee_id", "role_code", "scope_type", "scope_team_id", "role_start", "role_end", "is_acting", "note"],
      roleAssignments,
    ),
    "Team_Structure_History.csv": withHeader(
      ["history_id", "team_id", "team_name", "parent_team_id", "effective_from", "effective_to", "status", "note"],
      structureRows,
    ),
  };
}

function resolveTeamMemberName(team, employeeId, memberIndex) {
  if (memberIndex === 0) {
    return team.leadName;
  }
  if (employeeId === specialCases.turnoverNewLeadEmployeeId) {
    return "홍채린";
  }
  if (employeeId === specialCases.turnoverOldLeadEmployeeId) {
    return team.leadName;
  }
  return `구성원${employeeId.slice(-3)}`;
}

function resolveHireDate(teamIndex, employeeId, memberIndex) {
  if (newHireIds2026.has(employeeId)) {
    return `2026-${pad(((teamIndex + memberIndex) % 9) + 1, 2)}-${pad(((teamIndex + 7) % 20) + 1, 2)}`;
  }
  if (employeeId === specialCases.rehireEmployeeId) {
    return "2019-04-15";
  }
  const year = 2017 + ((teamIndex * 3 + memberIndex) % 9);
  const month = ((teamIndex + memberIndex * 2) % 12) + 1;
  const day = ((teamIndex * 5 + memberIndex * 3) % 26) + 1;
  return `${year}-${pad(month, 2)}-${pad(day, 2)}`;
}

function resolveStatusNote(employeeId, teamName, isLeadSlot, isTurnoverNewLead) {
  if (employeeId === specialCases.teamLeadVacancyEmployeeId) {
    return "퇴사 후 팀장 공석";
  }
  if (employeeId === specialCases.rehireEmployeeId) {
    return "퇴사 후 재입사";
  }
  if (employeeId === specialCases.transferDuringLeaveEmployeeId) {
    return "휴직 중 팀 이동";
  }
  if (employeeId === specialCases.priorTerminationEmployeeId) {
    return "기준일 이전 퇴사";
  }
  if (employeeId === specialCases.targetDateTerminationEmployeeId) {
    return "기준일 당일 퇴사";
  }
  if (isTurnoverNewLead) {
    return "팀원에서 팀장 승진";
  }
  if (isLeadSlot) {
    return `${teamName} 팀장`;
  }
  return "";
}

function employeeRow(employee_id, name, email, employment_type, initial_hire_date, final_termination_date, status_note) {
  return {
    employee_id,
    name,
    email,
    employment_type,
    initial_hire_date,
    final_termination_date,
    status_note,
  };
}

function employmentRow(employeeId, seq, start, end, hireReason, terminationReason, note) {
  return {
    employment_period_id: `EP-${employeeId.slice(-4)}-${seq}`,
    employee_id: employeeId,
    employment_start: start,
    employment_end: end,
    hire_reason: hireReason,
    termination_reason: terminationReason,
    note,
  };
}

function leaveRow(employeeId, leaveType, start, end, note) {
  return {
    leave_id: `LV-${employeeId.slice(-4)}-${start.replaceAll("-", "")}`,
    employee_id: employeeId,
    leave_type: leaveType,
    leave_start: start,
    leave_end: end,
    note,
  };
}

function assignmentRow(employeeId, seq, teamId, start, end, isPrimary, assignmentType, note) {
  return {
    assignment_id: `TA-${employeeId.slice(-4)}-${seq}`,
    employee_id: employeeId,
    team_id: teamId,
    assignment_start: start,
    assignment_end: end,
    is_primary: isPrimary,
    assignment_type: assignmentType,
    note,
  };
}

function roleRow(employeeId, seq, roleCode, scopeType, scopeTeamId, start, end, isActing, note) {
  return {
    role_assignment_id: `RA-${employeeId.slice(-4)}-${seq}-${roleCode}`,
    employee_id: employeeId,
    role_code: roleCode,
    scope_type: scopeType,
    scope_team_id: scopeTeamId,
    role_start: start,
    role_end: end,
    is_acting: isActing,
    note,
  };
}

function formatEmployeeId(value) {
  return `EMP-${pad(value, 4)}`;
}

function emailFor(employeeId) {
  return `${employeeId.toLowerCase()}@example.com`;
}

function pad(value, width) {
  return String(value).padStart(width, "0");
}

function withHeader(headers, rows) {
  return [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))];
}

function toCsv(lines) {
  return lines
    .map((cells) => cells.map((value) => escapeCsv(value)).join(","))
    .join("\n");
}

function escapeCsv(value) {
  const raw = String(value ?? "");
  if (raw.includes(",") || raw.includes('"') || raw.includes("\n")) {
    return `"${raw.replaceAll('"', '""')}"`;
  }
  return raw;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

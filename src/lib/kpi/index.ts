import "server-only";

import type { DashboardScope } from "@/lib/dashboard/scope";
import type { PeriodRange } from "@/lib/kpi/periods";

import { computeEmployeeUtilization } from "@/lib/kpi/personnel/utilization";
import { computeCleaningPerformance } from "@/lib/kpi/personnel/cleaningPerformance";
import { computePunctuality } from "@/lib/kpi/personnel/punctuality";
import { computeTravelPerformance } from "@/lib/kpi/personnel/travelPerformance";
import { computeAttendance } from "@/lib/kpi/personnel/attendance";
import { computeSickLeave } from "@/lib/kpi/personnel/sickLeave";
import { computeEmployeeQualityScore } from "@/lib/kpi/personnel/qualityScore";
import { computeEmployeeRetention } from "@/lib/kpi/personnel/retention";

import { computeCustomerSatisfaction } from "@/lib/kpi/business/customerSatisfaction";
import { computeComplaintKpi } from "@/lib/kpi/business/complaints";
import { computeQualityKpi } from "@/lib/kpi/business/quality";
import { computePlanningEfficiency } from "@/lib/kpi/business/planningEfficiency";
import { computeCapacityUtilization } from "@/lib/kpi/business/capacityUtilization";
import { computeRegionalGrowth } from "@/lib/kpi/business/regionalGrowth";
import { computeEmployeeFlowPerCity } from "@/lib/kpi/business/employeeFlowPerCity";
import { computeOperationalPerformance } from "@/lib/kpi/business/operationalPerformance";

export async function getPersonnelKpis(scope: DashboardScope, range: PeriodRange) {
  const [utilization, cleaningPerformance, punctuality, travelPerformance, attendance, sickLeave, qualityScore, retention] = await Promise.all([
    computeEmployeeUtilization(scope, range),
    computeCleaningPerformance(scope, range),
    computePunctuality(scope, range),
    computeTravelPerformance(scope, range),
    computeAttendance(scope, range),
    computeSickLeave(scope, range),
    computeEmployeeQualityScore(scope, range),
    computeEmployeeRetention(scope, range),
  ]);
  return { utilization, cleaningPerformance, punctuality, travelPerformance, attendance, sickLeave, qualityScore, retention };
}

export async function getBusinessKpis(scope: DashboardScope, range: PeriodRange) {
  const [customerSatisfaction, complaints, quality, planningEfficiency, capacityUtilization, regionalGrowth, employeeFlowPerCity, operationalPerformance] =
    await Promise.all([
      computeCustomerSatisfaction(scope, range),
      computeComplaintKpi(scope, range),
      computeQualityKpi(scope, range),
      computePlanningEfficiency(scope, range),
      computeCapacityUtilization(scope, range),
      computeRegionalGrowth(scope, range),
      computeEmployeeFlowPerCity(scope, range),
      computeOperationalPerformance(scope, range),
    ]);
  return { customerSatisfaction, complaints, quality, planningEfficiency, capacityUtilization, regionalGrowth, employeeFlowPerCity, operationalPerformance };
}

export type PersonnelKpis = Awaited<ReturnType<typeof getPersonnelKpis>>;
export type BusinessKpis = Awaited<ReturnType<typeof getBusinessKpis>>;

import type { Locale } from "./config";

export type KpiId =
  | "employee_utilization" | "cleaning_performance" | "punctuality" | "travel_performance"
  | "attendance" | "sick_leave" | "employee_quality_score" | "employee_retention"
  | "customer_satisfaction" | "complaints" | "quality" | "planning_efficiency"
  | "capacity_utilization" | "regional_growth" | "employee_flow_per_city" | "operational_performance";

/**
 * Copy for the KPI Baseline framework (`/admin/kpis`, `/manager/kpis`,
 * `/regional-manager/kpis`). KPI label/target strings are keyed by the
 * stable `id` each calculator in `src/lib/kpi/*` already returns: the
 * calculators themselves stay locale-neutral (numbers/constants only);
 * translation happens at the UI layer via `kpis[id]`.
 */
export type KpiCopy = {
  eyebrow: string;
  title: string;
  period: { daily: string; weekly: string; monthly: string; quarterly: string; yearly: string; custom: string; to: string; apply: string };
  periodLabels: { today: string; thisWeek: string; thisMonth: string; previousPeriod: string };
  targetPrefix: string;
  vsPreviousPeriod: string;
  personnel: {
    title: string; attendanceBreakdown: string; cleaningPerformanceChart: string; sickLeaveDurationClasses: string;
    sickLeaveByCity: string; leaderboardTitle: string; noDataForPeriod: string;
    headers: { rank: string; employee: string; score: string; jobs: string; rating: string; complaints: string; rework: string };
    attendanceStatus: { present: string; late: string; absent: string; noShow: string };
    cleaningPerf: { faster: string; withinTarget: string; longer: string };
    durationClass: Record<"1_day" | "2_3_days" | "4_7_days" | "8_14_days" | "15_plus_days", string>;
    heatmapColumns: { reports: string; sickDays: string };
  };
  business: {
    title: string; netGrowthByCity: string; expansionNote: string; complaintCategories: string; employeeFlowTitle: string;
    headers: { city: string; hired: string; leaving: string; active: string; avgTenure: string; turnover: string };
  };
  kpis: Record<KpiId, { label: string; target: string }>;
};

const en: KpiCopy = {
  eyebrow: "KPI Baseline", title: "Performance overview",
  period: { daily: "Daily", weekly: "Weekly", monthly: "Monthly", quarterly: "Quarterly", yearly: "Yearly", custom: "Custom", to: "to", apply: "Apply" },
  periodLabels: { today: "Today", thisWeek: "This week", thisMonth: "This month", previousPeriod: "Previous period" },
  targetPrefix: "Target:", vsPreviousPeriod: "vs previous period",
  personnel: {
    title: "Personnel KPIs", attendanceBreakdown: "Attendance breakdown", cleaningPerformanceChart: "Cleaning performance", sickLeaveDurationClasses: "Sick leave duration classes", sickLeaveByCity: "Sick leave by city", leaderboardTitle: "Employee quality score leaderboard", noDataForPeriod: "No data for this period.",
    headers: { rank: "#", employee: "Employee", score: "Score", jobs: "Jobs", rating: "Rating", complaints: "Complaints", rework: "Rework" },
    attendanceStatus: { present: "Present", late: "Late", absent: "Absent", noShow: "No show" },
    cleaningPerf: { faster: "Faster", withinTarget: "Within target", longer: "Longer" },
    durationClass: { "1_day": "1 day", "2_3_days": "2–3 days", "4_7_days": "4–7 days", "8_14_days": "8–14 days", "15_plus_days": "15+ days" },
    heatmapColumns: { reports: "Reports", sickDays: "Sick days" },
  },
  business: {
    title: "Business KPIs", netGrowthByCity: "Net customer growth by city", expansionNote: "{city} looks ready for expansion (+{percent}% growth).", complaintCategories: "Complaint categories", employeeFlowTitle: "Employee flow per city",
    headers: { city: "City", hired: "Hired", leaving: "Leaving", active: "Active", avgTenure: "Avg tenure", turnover: "Turnover" },
  },
  kpis: {
    employee_utilization: { label: "Employee utilization", target: "80–90%" },
    cleaning_performance: { label: "Cleaning performance", target: "≥90% at/faster than expected" },
    punctuality: { label: "Punctuality", target: "98% on time" },
    travel_performance: { label: "Travel performance", target: "Max 15 min" },
    attendance: { label: "Attendance", target: "95% present" },
    sick_leave: { label: "Sick leave", target: "Stable or declining trend" },
    employee_quality_score: { label: "Employee quality score", target: "≥80" },
    employee_retention: { label: "Employee retention", target: "≥90%" },
    customer_satisfaction: { label: "Customer satisfaction", target: "≥4.8/5" },
    complaints: { label: "Complaints", target: "<2%" },
    quality: { label: "Quality", target: "≥85 inspection score, ≥90% first time right, <5% rework" },
    planning_efficiency: { label: "Planning efficiency", target: "≥80, travel ≤15min" },
    capacity_utilization: { label: "Capacity utilization", target: "70–95%" },
    regional_growth: { label: "Regional growth", target: "Net positive" },
    employee_flow_per_city: { label: "Employee flow per city", target: "Net positive or stable" },
    operational_performance: { label: "Operational performance", target: "≥90% completed" },
  },
};

const nl: KpiCopy = {
  eyebrow: "KPI-basislijn", title: "Prestatieoverzicht",
  period: { daily: "Dagelijks", weekly: "Wekelijks", monthly: "Maandelijks", quarterly: "Per kwartaal", yearly: "Jaarlijks", custom: "Aangepast", to: "tot", apply: "Toepassen" },
  periodLabels: { today: "Vandaag", thisWeek: "Deze week", thisMonth: "Deze maand", previousPeriod: "Vorige periode" },
  targetPrefix: "Doel:", vsPreviousPeriod: "t.o.v. vorige periode",
  personnel: {
    title: "Personeels-KPI's", attendanceBreakdown: "Aanwezigheidsoverzicht", cleaningPerformanceChart: "Schoonmaakprestaties", sickLeaveDurationClasses: "Ziekteverzuim naar duur", sickLeaveByCity: "Ziekteverzuim per stad", leaderboardTitle: "Ranglijst medewerkerskwaliteitsscore", noDataForPeriod: "Geen gegevens voor deze periode.",
    headers: { rank: "#", employee: "Medewerker", score: "Score", jobs: "Opdrachten", rating: "Beoordeling", complaints: "Klachten", rework: "Herwerk" },
    attendanceStatus: { present: "Aanwezig", late: "Te laat", absent: "Afwezig", noShow: "Niet komen opdagen" },
    cleaningPerf: { faster: "Sneller", withinTarget: "Binnen doel", longer: "Langer" },
    durationClass: { "1_day": "1 dag", "2_3_days": "2–3 dagen", "4_7_days": "4–7 dagen", "8_14_days": "8–14 dagen", "15_plus_days": "15+ dagen" },
    heatmapColumns: { reports: "Meldingen", sickDays: "Ziektedagen" },
  },
  business: {
    title: "Bedrijfs-KPI's", netGrowthByCity: "Netto klantgroei per stad", expansionNote: "{city} lijkt klaar voor uitbreiding (+{percent}% groei).", complaintCategories: "Klachtcategorieën", employeeFlowTitle: "Personeelsverloop per stad",
    headers: { city: "Stad", hired: "Aangenomen", leaving: "Vertrekkend", active: "Actief", avgTenure: "Gem. dienstverband", turnover: "Verloop" },
  },
  kpis: {
    employee_utilization: { label: "Medewerkersbenutting", target: "80–90%" },
    cleaning_performance: { label: "Schoonmaakprestaties", target: "≥90% op of sneller dan verwacht" },
    punctuality: { label: "Stiptheid", target: "98% op tijd" },
    travel_performance: { label: "Reisprestaties", target: "Max 15 min" },
    attendance: { label: "Aanwezigheid", target: "95% aanwezig" },
    sick_leave: { label: "Ziekteverzuim", target: "Stabiele of dalende trend" },
    employee_quality_score: { label: "Medewerkerskwaliteitsscore", target: "≥80" },
    employee_retention: { label: "Personeelsbehoud", target: "≥90%" },
    customer_satisfaction: { label: "Klanttevredenheid", target: "≥4,8/5" },
    complaints: { label: "Klachten", target: "<2%" },
    quality: { label: "Kwaliteit", target: "≥85 inspectiescore, ≥90% in één keer goed, <5% herwerk" },
    planning_efficiency: { label: "Planningsefficiëntie", target: "≥80, reistijd ≤15min" },
    capacity_utilization: { label: "Capaciteitsbenutting", target: "70–95%" },
    regional_growth: { label: "Regionale groei", target: "Netto positief" },
    employee_flow_per_city: { label: "Personeelsverloop per stad", target: "Netto positief of stabiel" },
    operational_performance: { label: "Operationele prestaties", target: "≥90% voltooid" },
  },
};

const fr: KpiCopy = {
  eyebrow: "Indicateurs clés", title: "Aperçu des performances",
  period: { daily: "Quotidien", weekly: "Hebdomadaire", monthly: "Mensuel", quarterly: "Trimestriel", yearly: "Annuel", custom: "Personnalisé", to: "à", apply: "Appliquer" },
  periodLabels: { today: "Aujourd'hui", thisWeek: "Cette semaine", thisMonth: "Ce mois-ci", previousPeriod: "Période précédente" },
  targetPrefix: "Objectif :", vsPreviousPeriod: "vs période précédente",
  personnel: {
    title: "Indicateurs personnel", attendanceBreakdown: "Répartition de la présence", cleaningPerformanceChart: "Performance de nettoyage", sickLeaveDurationClasses: "Durée des arrêts maladie", sickLeaveByCity: "Arrêts maladie par ville", leaderboardTitle: "Classement du score qualité des employés", noDataForPeriod: "Aucune donnée pour cette période.",
    headers: { rank: "#", employee: "Employé", score: "Score", jobs: "Missions", rating: "Note", complaints: "Réclamations", rework: "Reprises" },
    attendanceStatus: { present: "Présent", late: "En retard", absent: "Absent", noShow: "Non présenté" },
    cleaningPerf: { faster: "Plus rapide", withinTarget: "Dans l'objectif", longer: "Plus long" },
    durationClass: { "1_day": "1 jour", "2_3_days": "2–3 jours", "4_7_days": "4–7 jours", "8_14_days": "8–14 jours", "15_plus_days": "15+ jours" },
    heatmapColumns: { reports: "Signalements", sickDays: "Jours de maladie" },
  },
  business: {
    title: "Indicateurs entreprise", netGrowthByCity: "Croissance nette des clients par ville", expansionNote: "{city} semble prête pour une expansion (+{percent} % de croissance).", complaintCategories: "Catégories de réclamations", employeeFlowTitle: "Mouvement du personnel par ville",
    headers: { city: "Ville", hired: "Recrutés", leaving: "Départs", active: "Actifs", avgTenure: "Ancienneté moy.", turnover: "Rotation" },
  },
  kpis: {
    employee_utilization: { label: "Utilisation des employés", target: "80–90%" },
    cleaning_performance: { label: "Performance de nettoyage", target: "≥90% au niveau ou plus rapide qu'attendu" },
    punctuality: { label: "Ponctualité", target: "98% à l'heure" },
    travel_performance: { label: "Performance de trajet", target: "Max 15 min" },
    attendance: { label: "Présence", target: "95% de présence" },
    sick_leave: { label: "Arrêts maladie", target: "Tendance stable ou en baisse" },
    employee_quality_score: { label: "Score qualité des employés", target: "≥80" },
    employee_retention: { label: "Rétention des employés", target: "≥90%" },
    customer_satisfaction: { label: "Satisfaction client", target: "≥4,8/5" },
    complaints: { label: "Réclamations", target: "<2%" },
    quality: { label: "Qualité", target: "≥85 score d'inspection, ≥90% réussi du premier coup, <5% reprises" },
    planning_efficiency: { label: "Efficacité de planification", target: "≥80, trajet ≤15min" },
    capacity_utilization: { label: "Utilisation de la capacité", target: "70–95%" },
    regional_growth: { label: "Croissance régionale", target: "Nette positive" },
    employee_flow_per_city: { label: "Mouvement du personnel par ville", target: "Nette positive ou stable" },
    operational_performance: { label: "Performance opérationnelle", target: "≥90% terminées" },
  },
};

const ar: KpiCopy = {
  eyebrow: "مؤشرات الأداء الأساسية", title: "نظرة عامة على الأداء",
  period: { daily: "يومي", weekly: "أسبوعي", monthly: "شهري", quarterly: "ربع سنوي", yearly: "سنوي", custom: "مخصص", to: "إلى", apply: "تطبيق" },
  periodLabels: { today: "اليوم", thisWeek: "هذا الأسبوع", thisMonth: "هذا الشهر", previousPeriod: "الفترة السابقة" },
  targetPrefix: "الهدف:", vsPreviousPeriod: "مقارنة بالفترة السابقة",
  personnel: {
    title: "مؤشرات الأداء الخاصة بالموظفين", attendanceBreakdown: "توزيع الحضور", cleaningPerformanceChart: "أداء التنظيف", sickLeaveDurationClasses: "فئات مدة الإجازات المرضية", sickLeaveByCity: "الإجازات المرضية حسب المدينة", leaderboardTitle: "قائمة الأداء حسب درجة جودة الموظف", noDataForPeriod: "لا توجد بيانات لهذه الفترة.",
    headers: { rank: "#", employee: "الموظف", score: "الدرجة", jobs: "المهام", rating: "التقييم", complaints: "الشكاوى", rework: "إعادة العمل" },
    attendanceStatus: { present: "حاضر", late: "متأخر", absent: "غائب", noShow: "لم يحضر" },
    cleaningPerf: { faster: "أسرع", withinTarget: "ضمن الهدف", longer: "أبطأ" },
    durationClass: { "1_day": "يوم واحد", "2_3_days": "2–3 أيام", "4_7_days": "4–7 أيام", "8_14_days": "8–14 يوماً", "15_plus_days": "15 يوماً فأكثر" },
    heatmapColumns: { reports: "البلاغات", sickDays: "أيام المرض" },
  },
  business: {
    title: "مؤشرات الأداء الخاصة بالأعمال", netGrowthByCity: "صافي نمو العملاء حسب المدينة", expansionNote: "يبدو أن {city} جاهزة للتوسع (+{percent}% نمو).", complaintCategories: "فئات الشكاوى", employeeFlowTitle: "حركة الموظفين حسب المدينة",
    headers: { city: "المدينة", hired: "تم توظيفهم", leaving: "مغادرون", active: "نشطون", avgTenure: "متوسط مدة العمل", turnover: "معدل الدوران" },
  },
  kpis: {
    employee_utilization: { label: "استغلال الموظفين", target: "80–90%" },
    cleaning_performance: { label: "أداء التنظيف", target: "≥90% في الوقت المتوقع أو أسرع" },
    punctuality: { label: "الالتزام بالمواعيد", target: "98% في الوقت المحدد" },
    travel_performance: { label: "أداء التنقل", target: "بحد أقصى 15 دقيقة" },
    attendance: { label: "الحضور", target: "95% حضور" },
    sick_leave: { label: "الإجازات المرضية", target: "اتجاه مستقر أو متناقص" },
    employee_quality_score: { label: "درجة جودة الموظف", target: "≥80" },
    employee_retention: { label: "الاحتفاظ بالموظفين", target: "≥90%" },
    customer_satisfaction: { label: "رضا العملاء", target: "≥4.8/5" },
    complaints: { label: "الشكاوى", target: "<2%" },
    quality: { label: "الجودة", target: "≥85 درجة تفتيش، ≥90% صحيح من المرة الأولى، <5% إعادة عمل" },
    planning_efficiency: { label: "كفاءة التخطيط", target: "≥80، تنقل ≤15 دقيقة" },
    capacity_utilization: { label: "استغلال الطاقة الاستيعابية", target: "70–95%" },
    regional_growth: { label: "النمو الإقليمي", target: "صافي إيجابي" },
    employee_flow_per_city: { label: "حركة الموظفين حسب المدينة", target: "صافي إيجابي أو مستقر" },
    operational_performance: { label: "الأداء التشغيلي", target: "≥90% مكتمل" },
  },
};

const es: KpiCopy = {
  eyebrow: "Indicadores clave", title: "Resumen de rendimiento",
  period: { daily: "Diario", weekly: "Semanal", monthly: "Mensual", quarterly: "Trimestral", yearly: "Anual", custom: "Personalizado", to: "a", apply: "Aplicar" },
  periodLabels: { today: "Hoy", thisWeek: "Esta semana", thisMonth: "Este mes", previousPeriod: "Periodo anterior" },
  targetPrefix: "Objetivo:", vsPreviousPeriod: "vs periodo anterior",
  personnel: {
    title: "Indicadores de personal", attendanceBreakdown: "Desglose de asistencia", cleaningPerformanceChart: "Rendimiento de limpieza", sickLeaveDurationClasses: "Clases de duración de bajas médicas", sickLeaveByCity: "Bajas médicas por ciudad", leaderboardTitle: "Clasificación de puntuación de calidad de empleados", noDataForPeriod: "Sin datos para este periodo.",
    headers: { rank: "#", employee: "Empleado", score: "Puntuación", jobs: "Trabajos", rating: "Calificación", complaints: "Quejas", rework: "Repeticiones" },
    attendanceStatus: { present: "Presente", late: "Tarde", absent: "Ausente", noShow: "No se presentó" },
    cleaningPerf: { faster: "Más rápido", withinTarget: "Dentro del objetivo", longer: "Más lento" },
    durationClass: { "1_day": "1 día", "2_3_days": "2–3 días", "4_7_days": "4–7 días", "8_14_days": "8–14 días", "15_plus_days": "15+ días" },
    heatmapColumns: { reports: "Reportes", sickDays: "Días de baja" },
  },
  business: {
    title: "Indicadores de negocio", netGrowthByCity: "Crecimiento neto de clientes por ciudad", expansionNote: "{city} parece lista para la expansión (+{percent}% de crecimiento).", complaintCategories: "Categorías de quejas", employeeFlowTitle: "Flujo de empleados por ciudad",
    headers: { city: "Ciudad", hired: "Contratados", leaving: "Bajas", active: "Activos", avgTenure: "Antigüedad media", turnover: "Rotación" },
  },
  kpis: {
    employee_utilization: { label: "Utilización de empleados", target: "80–90%" },
    cleaning_performance: { label: "Rendimiento de limpieza", target: "≥90% al ritmo esperado o más rápido" },
    punctuality: { label: "Puntualidad", target: "98% puntual" },
    travel_performance: { label: "Rendimiento de desplazamiento", target: "Máx. 15 min" },
    attendance: { label: "Asistencia", target: "95% de asistencia" },
    sick_leave: { label: "Bajas médicas", target: "Tendencia estable o decreciente" },
    employee_quality_score: { label: "Puntuación de calidad de empleados", target: "≥80" },
    employee_retention: { label: "Retención de empleados", target: "≥90%" },
    customer_satisfaction: { label: "Satisfacción del cliente", target: "≥4,8/5" },
    complaints: { label: "Quejas", target: "<2%" },
    quality: { label: "Calidad", target: "≥85 puntuación de inspección, ≥90% correcto a la primera, <5% repeticiones" },
    planning_efficiency: { label: "Eficiencia de planificación", target: "≥80, desplazamiento ≤15min" },
    capacity_utilization: { label: "Utilización de capacidad", target: "70–95%" },
    regional_growth: { label: "Crecimiento regional", target: "Neto positivo" },
    employee_flow_per_city: { label: "Flujo de empleados por ciudad", target: "Neto positivo o estable" },
    operational_performance: { label: "Rendimiento operativo", target: "≥90% completado" },
  },
};

const de: KpiCopy = {
  eyebrow: "KPI-Basislinie", title: "Leistungsübersicht",
  period: { daily: "Täglich", weekly: "Wöchentlich", monthly: "Monatlich", quarterly: "Vierteljährlich", yearly: "Jährlich", custom: "Benutzerdefiniert", to: "bis", apply: "Anwenden" },
  periodLabels: { today: "Heute", thisWeek: "Diese Woche", thisMonth: "Dieser Monat", previousPeriod: "Vorheriger Zeitraum" },
  targetPrefix: "Ziel:", vsPreviousPeriod: "ggü. vorherigem Zeitraum",
  personnel: {
    title: "Personal-KPIs", attendanceBreakdown: "Anwesenheitsübersicht", cleaningPerformanceChart: "Reinigungsleistung", sickLeaveDurationClasses: "Krankheitsdauerklassen", sickLeaveByCity: "Krankmeldungen nach Stadt", leaderboardTitle: "Rangliste Mitarbeiter-Qualitätswert", noDataForPeriod: "Keine Daten für diesen Zeitraum.",
    headers: { rank: "#", employee: "Mitarbeiter", score: "Wert", jobs: "Aufträge", rating: "Bewertung", complaints: "Beschwerden", rework: "Nacharbeit" },
    attendanceStatus: { present: "Anwesend", late: "Verspätet", absent: "Abwesend", noShow: "Nicht erschienen" },
    cleaningPerf: { faster: "Schneller", withinTarget: "Im Zielbereich", longer: "Langsamer" },
    durationClass: { "1_day": "1 Tag", "2_3_days": "2–3 Tage", "4_7_days": "4–7 Tage", "8_14_days": "8–14 Tage", "15_plus_days": "15+ Tage" },
    heatmapColumns: { reports: "Meldungen", sickDays: "Krankheitstage" },
  },
  business: {
    title: "Unternehmens-KPIs", netGrowthByCity: "Netto-Kundenwachstum nach Stadt", expansionNote: "{city} scheint expansionsbereit zu sein (+{percent}% Wachstum).", complaintCategories: "Beschwerdekategorien", employeeFlowTitle: "Personalfluktuation nach Stadt",
    headers: { city: "Stadt", hired: "Eingestellt", leaving: "Ausscheidend", active: "Aktiv", avgTenure: "Ø Betriebszugehörigkeit", turnover: "Fluktuation" },
  },
  kpis: {
    employee_utilization: { label: "Mitarbeiterauslastung", target: "80–90%" },
    cleaning_performance: { label: "Reinigungsleistung", target: "≥90% im Zeitrahmen oder schneller" },
    punctuality: { label: "Pünktlichkeit", target: "98% pünktlich" },
    travel_performance: { label: "Fahrleistung", target: "Max. 15 Min." },
    attendance: { label: "Anwesenheit", target: "95% Anwesenheit" },
    sick_leave: { label: "Krankheitstage", target: "Stabiler oder rückläufiger Trend" },
    employee_quality_score: { label: "Mitarbeiter-Qualitätswert", target: "≥80" },
    employee_retention: { label: "Mitarbeiterbindung", target: "≥90%" },
    customer_satisfaction: { label: "Kundenzufriedenheit", target: "≥4,8/5" },
    complaints: { label: "Beschwerden", target: "<2%" },
    quality: { label: "Qualität", target: "≥85 Inspektionswert, ≥90% sofort richtig, <5% Nacharbeit" },
    planning_efficiency: { label: "Planungseffizienz", target: "≥80, Fahrzeit ≤15 Min." },
    capacity_utilization: { label: "Kapazitätsauslastung", target: "70–95%" },
    regional_growth: { label: "Regionales Wachstum", target: "Netto positiv" },
    employee_flow_per_city: { label: "Personalfluktuation nach Stadt", target: "Netto positiv oder stabil" },
    operational_performance: { label: "Betriebsleistung", target: "≥90% abgeschlossen" },
  },
};

const pt: KpiCopy = {
  eyebrow: "Base de KPIs", title: "Resumo de desempenho",
  period: { daily: "Diário", weekly: "Semanal", monthly: "Mensal", quarterly: "Trimestral", yearly: "Anual", custom: "Personalizado", to: "até", apply: "Aplicar" },
  periodLabels: { today: "Hoje", thisWeek: "Esta semana", thisMonth: "Este mês", previousPeriod: "Período anterior" },
  targetPrefix: "Meta:", vsPreviousPeriod: "vs período anterior",
  personnel: {
    title: "KPIs de pessoal", attendanceBreakdown: "Distribuição de assiduidade", cleaningPerformanceChart: "Desempenho de limpeza", sickLeaveDurationClasses: "Classes de duração de baixas médicas", sickLeaveByCity: "Baixas médicas por cidade", leaderboardTitle: "Classificação por pontuação de qualidade dos funcionários", noDataForPeriod: "Sem dados para este período.",
    headers: { rank: "#", employee: "Funcionário", score: "Pontuação", jobs: "Trabalhos", rating: "Avaliação", complaints: "Reclamações", rework: "Retrabalho" },
    attendanceStatus: { present: "Presente", late: "Atrasado", absent: "Ausente", noShow: "Não compareceu" },
    cleaningPerf: { faster: "Mais rápido", withinTarget: "Dentro da meta", longer: "Mais lento" },
    durationClass: { "1_day": "1 dia", "2_3_days": "2–3 dias", "4_7_days": "4–7 dias", "8_14_days": "8–14 dias", "15_plus_days": "15+ dias" },
    heatmapColumns: { reports: "Ocorrências", sickDays: "Dias de baixa" },
  },
  business: {
    title: "KPIs de negócio", netGrowthByCity: "Crescimento líquido de clientes por cidade", expansionNote: "{city} parece pronta para expansão (+{percent}% de crescimento).", complaintCategories: "Categorias de reclamações", employeeFlowTitle: "Fluxo de funcionários por cidade",
    headers: { city: "Cidade", hired: "Contratados", leaving: "Saídas", active: "Ativos", avgTenure: "Antiguidade média", turnover: "Rotatividade" },
  },
  kpis: {
    employee_utilization: { label: "Utilização de funcionários", target: "80–90%" },
    cleaning_performance: { label: "Desempenho de limpeza", target: "≥90% no ritmo esperado ou mais rápido" },
    punctuality: { label: "Pontualidade", target: "98% pontual" },
    travel_performance: { label: "Desempenho de deslocação", target: "Máx. 15 min" },
    attendance: { label: "Assiduidade", target: "95% de presença" },
    sick_leave: { label: "Baixas médicas", target: "Tendência estável ou decrescente" },
    employee_quality_score: { label: "Pontuação de qualidade dos funcionários", target: "≥80" },
    employee_retention: { label: "Retenção de funcionários", target: "≥90%" },
    customer_satisfaction: { label: "Satisfação do cliente", target: "≥4,8/5" },
    complaints: { label: "Reclamações", target: "<2%" },
    quality: { label: "Qualidade", target: "≥85 pontuação de inspeção, ≥90% correto à primeira, <5% retrabalho" },
    planning_efficiency: { label: "Eficiência de planeamento", target: "≥80, deslocação ≤15min" },
    capacity_utilization: { label: "Utilização de capacidade", target: "70–95%" },
    regional_growth: { label: "Crescimento regional", target: "Líquido positivo" },
    employee_flow_per_city: { label: "Fluxo de funcionários por cidade", target: "Líquido positivo ou estável" },
    operational_performance: { label: "Desempenho operacional", target: "≥90% concluído" },
  },
};

export const kpiCopy: Record<Locale, KpiCopy> = { en, nl, fr, ar, es, de, pt };

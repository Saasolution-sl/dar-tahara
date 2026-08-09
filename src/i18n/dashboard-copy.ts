import type { Locale } from "./config";

/**
 * Copy for the Operations Center dashboard, KPI-adjacent workspace shells
 * (manager/regional-manager/assessment nav), and the offices/team/status
 * management screens: everything added under `/admin`, `/manager` and
 * `/regional-manager` this cycle that isn't already covered by
 * `admin-copy.ts` (the pre-existing admin tables/queues).
 */
export type DashboardCopy = {
  workspace: {
    signOut: string;
    language: string;
    manager: {
      title: string;
      nav: { dashboard: string; kpis: string; assessmentReview: string; refunds: string; customers: string; subscriptions: string; team: string };
    };
    regionalManager: {
      title: string;
      nav: { dashboard: string; kpis: string; customers: string; subscriptions: string; team: string };
    };
    assessment: { title: string; nav: { myAssessments: string } };
  };
  roleLabel: { administrator: string; regional_manager: string; manager: string };
  eyebrow: string;
  accessManagementEyebrow: string;
  customize: {
    button: string; modalTitle: string; close: string; helpText: string;
    visible: string; dragHandle: string; save: string; saving: string;
  };
  kpiOverview: {
    title: string; todaysVisits: string; completed: string; running: string; delayed: string; cancelled: string;
    employeesWorking: string; customerRating: string; avgCleaningTime: string; avgTravelTime: string;
    openComplaints: string; qualityScore: string;
  };
  liveOps: {
    title: string; noStaffLive: string; noActiveJob: string; next: string; travelSuffix: string;
    status: Record<"working" | "driving" | "break" | "waiting" | "finished" | "sick" | "offline", string>;
  };
  planning: {
    title: string; nothingScheduled: string;
    status: Record<"completed" | "working" | "driving" | "delayed" | "cancelled" | "scheduled", string>;
  };
  employees: {
    title: string;
    sort: { highestRated: string; mostJobs: string; lowestTravel: string; mostPunctual: string };
    noData: string;
    headers: { rank: string; employee: string; jobs: string; rating: string; avgCleaning: string; avgTravel: string; punctuality: string };
  };
  quality: {
    title: string; inspectionScore: string; customerRating: string; firstTimeRight: string; revisitRate: string;
    openComplaints: string; resolvedComplaints: string; recurringComplaints: string; totalComplaints: string;
    ratingTrend: string; avgRatingSeries: string;
  };
  customers: {
    title: string; active: string; new30d: string; lost30d: string; retention: string; waitingList: string;
    avgRevenuePerCustomer: string; ltv: string; subscriptionTypes: string;
  };
  financial: {
    title: string; monthlyRevenue: string; vsLastMonth: string; mrr: string; outstandingPayments: string;
    revenuePerEmployee: string; revenuePerCustomer: string; projectedNextMonth: string; revenueByRegion: string; revenueSeries: string;
  };
  inventory: {
    title: string; trackedItems: string; lowStock: string; pendingRestocks: string; lowStockSuffix: string; noneTracked: string;
    category: Record<"cleaning_products" | "uniforms" | "equipment" | "vehicle_supplies", string>;
  };
  aiInsights: {
    title: string; badge: string; empty: string;
    category: Record<
      "churn_risk" | "staff_overload" | "route_optimization" | "complaint_trend" | "quality_drop" |
      "top_performer" | "expansion_opportunity" | "supply_shortage" | "payment_risk" | "inactive_customer",
      string
    >;
  };
  map: { title: string; unavailableTitle: string; unavailableBody: string };
  offices: {
    title: string; subtitle: string; addOffice: string; name: string; city: string; create: string;
    regionalManagers: string; remove: string; noneAssigned: string; assignPlaceholder: string; noOfficesYet: string;
    loadFailed: string; createFailed: string;
  };
  team: {
    title: string; subtitle: string; inviteTitle: string; fullName: string; workEmail: string; phone: string; profile: string;
    roleAssessment: string; roleManager: string; roleRegionalManager: string; invite: string; sending: string; invitationSent: string;
    headers: { name: string; profile: string; employeeId: string; contact: string; status: string; actions: string };
    active: string; inactive: string; noProfilesYet: string; loadingProfiles: string; loadFailed: string; createFailed: string;
  };
  statusAction: { restore: string; suspend: string; reactivate: string; deactivate: string; automated: string; actionFailed: string };
  officeAssign: { ariaLabel: string; noOffice: string };
};

const en: DashboardCopy = {
  workspace: {
    signOut: "Sign out", language: "Language",
    manager: { title: "Manager workspace", nav: { dashboard: "Dashboard", kpis: "KPI Baseline", assessmentReview: "Assessment review", refunds: "Refund confirmation", customers: "Customers", subscriptions: "Subscriptions", team: "Personnel" } },
    regionalManager: { title: "Regional manager", nav: { dashboard: "Dashboard", kpis: "KPI Baseline", customers: "Customers", subscriptions: "Subscriptions", team: "Personnel" } },
    assessment: { title: "Assessment workspace", nav: { myAssessments: "My assessments" } },
  },
  roleLabel: { administrator: "Company overview", regional_manager: "Regional overview", manager: "Operations overview" },
  eyebrow: "Operations center", accessManagementEyebrow: "Access management",
  customize: { button: "Customize", modalTitle: "Customize dashboard", close: "Close", helpText: "Drag to reorder, toggle to show or hide. This only changes your own view.", visible: "Visible", dragHandle: "Drag to reorder", save: "Save layout", saving: "Saving…" },
  kpiOverview: { title: "Today's overview", todaysVisits: "Today's visits", completed: "Completed", running: "Running", delayed: "Delayed", cancelled: "Cancelled", employeesWorking: "Employees working", customerRating: "Customer rating", avgCleaningTime: "Avg cleaning time", avgTravelTime: "Avg travel time", openComplaints: "Open complaints", qualityScore: "Quality score" },
  liveOps: { title: "Live operations", noStaffLive: "No staff are live right now.", noActiveJob: "No active job", next: "Next", travelSuffix: "min travel", status: { working: "Working", driving: "Driving", break: "On break", waiting: "Waiting", finished: "Finished", sick: "Sick", offline: "Offline" } },
  planning: { title: "Today's planning", nothingScheduled: "Nothing scheduled today.", status: { completed: "Completed", working: "Working", driving: "Driving", delayed: "Delayed", cancelled: "Cancelled", scheduled: "Scheduled" } },
  employees: { title: "Employee performance", sort: { highestRated: "Highest rated", mostJobs: "Most jobs completed", lowestTravel: "Lowest travel time", mostPunctual: "Most punctual" }, noData: "No performance data yet.", headers: { rank: "#", employee: "Employee", jobs: "Jobs", rating: "Rating", avgCleaning: "Avg cleaning", avgTravel: "Avg travel", punctuality: "Punctuality" } },
  quality: { title: "Quality center", inspectionScore: "Inspection score", customerRating: "Customer rating", firstTimeRight: "First time right", revisitRate: "Revisit rate", openComplaints: "Open complaints", resolvedComplaints: "Resolved complaints", recurringComplaints: "Recurring complaints", totalComplaints: "Total complaints (30d)", ratingTrend: "Rating trend", avgRatingSeries: "Avg rating" },
  customers: { title: "Customer overview", active: "Active customers", new30d: "New (30d)", lost30d: "Lost (30d)", retention: "Retention", waitingList: "Waiting list", avgRevenuePerCustomer: "Avg revenue / customer", ltv: "Est. lifetime value", subscriptionTypes: "Subscription types" },
  financial: { title: "Financial dashboard", monthlyRevenue: "Monthly revenue", vsLastMonth: "vs last month", mrr: "MRR", outstandingPayments: "Outstanding payments", revenuePerEmployee: "Revenue / employee", revenuePerCustomer: "Revenue / customer", projectedNextMonth: "Projected next month", revenueByRegion: "Revenue by region", revenueSeries: "Revenue" },
  inventory: { title: "Inventory", trackedItems: "Tracked items", lowStock: "Low stock", pendingRestocks: "Pending restocks", lowStockSuffix: "low stock", noneTracked: "No inventory tracked yet.", category: { cleaning_products: "Cleaning products", uniforms: "Uniforms", equipment: "Equipment", vehicle_supplies: "Vehicle supplies" } },
  aiInsights: { title: "AI insights", badge: "Recommendations", empty: "No recommendations right now: everything looks healthy.", category: { churn_risk: "Churn risk", staff_overload: "Staff overload", route_optimization: "Route optimization", complaint_trend: "Complaint trend", quality_drop: "Quality drop", top_performer: "Top performer", expansion_opportunity: "Expansion opportunity", supply_shortage: "Supply shortage", payment_risk: "Payment risk", inactive_customer: "Inactive customer" } },
  map: { title: "Live map", unavailableTitle: "Map unavailable", unavailableBody: "Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable live staff and customer locations." },
  offices: { title: "Offices", subtitle: "Create offices/branches and assign regional managers to oversee them. Invite a Regional manager profile from Team profiles first, then assign them here.", addOffice: "Add an office", name: "Name", city: "City", create: "Create office", regionalManagers: "Regional managers", remove: "Remove", noneAssigned: "None assigned", assignPlaceholder: "Assign a regional manager…", noOfficesYet: "No offices yet.", loadFailed: "Offices could not be loaded.", createFailed: "Office could not be created." },
  team: { title: "Team profiles", subtitle: "Create separate Manager and Assessment employee accounts. An invitation is emailed to the employee; permissions come from the protected role record, not their profile metadata.", inviteTitle: "Invite a team member", fullName: "Full name", workEmail: "Work email", phone: "Phone", profile: "Profile", roleAssessment: "Assessment employee", roleManager: "Manager", roleRegionalManager: "Regional manager", invite: "Create profile and send invitation", sending: "Sending invitation...", invitationSent: "Invitation sent. Employee ID: {id}", headers: { name: "Name", profile: "Profile", employeeId: "Employee ID", contact: "Contact", status: "Status", actions: "Actions" }, active: "Active", inactive: "Inactive", noProfilesYet: "No Manager or Assessment profiles yet.", loadingProfiles: "Loading profiles...", loadFailed: "Team profiles could not be loaded.", createFailed: "Profile could not be created." },
  statusAction: { restore: "Restore", suspend: "Suspend", reactivate: "Reactivate", deactivate: "Deactivate", automated: "Automated", actionFailed: "Action failed" },
  officeAssign: { ariaLabel: "Office", noOffice: "No office" },
};

const nl: DashboardCopy = {
  workspace: {
    signOut: "Uitloggen", language: "Taal",
    manager: { title: "Manager-werkruimte", nav: { dashboard: "Dashboard", kpis: "KPI-basislijn", assessmentReview: "Beoordelingscontrole", refunds: "Terugbetalingsbevestiging", customers: "Klanten", subscriptions: "Abonnementen", team: "Personeel" } },
    regionalManager: { title: "Regiomanager", nav: { dashboard: "Dashboard", kpis: "KPI-basislijn", customers: "Klanten", subscriptions: "Abonnementen", team: "Personeel" } },
    assessment: { title: "Beoordelingswerkruimte", nav: { myAssessments: "Mijn beoordelingen" } },
  },
  roleLabel: { administrator: "Bedrijfsoverzicht", regional_manager: "Regio-overzicht", manager: "Operationeel overzicht" },
  eyebrow: "Operationeel centrum", accessManagementEyebrow: "Toegangsbeheer",
  customize: { button: "Aanpassen", modalTitle: "Dashboard aanpassen", close: "Sluiten", helpText: "Sleep om te herschikken, schakel om te tonen of verbergen. Dit wijzigt alleen uw eigen weergave.", visible: "Zichtbaar", dragHandle: "Sleep om te herschikken", save: "Indeling opslaan", saving: "Bezig met opslaan…" },
  kpiOverview: { title: "Overzicht van vandaag", todaysVisits: "Bezoeken vandaag", completed: "Voltooid", running: "Bezig", delayed: "Vertraagd", cancelled: "Geannuleerd", employeesWorking: "Medewerkers aan het werk", customerRating: "Klantbeoordeling", avgCleaningTime: "Gem. schoonmaaktijd", avgTravelTime: "Gem. reistijd", openComplaints: "Openstaande klachten", qualityScore: "Kwaliteitsscore" },
  liveOps: { title: "Live operaties", noStaffLive: "Er is nu geen personeel actief.", noActiveJob: "Geen actieve opdracht", next: "Volgende", travelSuffix: "min reistijd", status: { working: "Aan het werk", driving: "Onderweg", break: "Pauze", waiting: "Wachten", finished: "Klaar", sick: "Ziek", offline: "Offline" } },
  planning: { title: "Planning van vandaag", nothingScheduled: "Vandaag niets gepland.", status: { completed: "Voltooid", working: "Aan het werk", driving: "Onderweg", delayed: "Vertraagd", cancelled: "Geannuleerd", scheduled: "Gepland" } },
  employees: { title: "Medewerkersprestaties", sort: { highestRated: "Hoogst beoordeeld", mostJobs: "Meeste opdrachten voltooid", lowestTravel: "Kortste reistijd", mostPunctual: "Meest stipt" }, noData: "Nog geen prestatiegegevens.", headers: { rank: "#", employee: "Medewerker", jobs: "Opdrachten", rating: "Beoordeling", avgCleaning: "Gem. schoonmaak", avgTravel: "Gem. reistijd", punctuality: "Stiptheid" } },
  quality: { title: "Kwaliteitscentrum", inspectionScore: "Inspectiescore", customerRating: "Klantbeoordeling", firstTimeRight: "In één keer goed", revisitRate: "Herbezoekpercentage", openComplaints: "Openstaande klachten", resolvedComplaints: "Opgeloste klachten", recurringComplaints: "Terugkerende klachten", totalComplaints: "Totaal klachten (30d)", ratingTrend: "Beoordelingstrend", avgRatingSeries: "Gem. beoordeling" },
  customers: { title: "Klantoverzicht", active: "Actieve klanten", new30d: "Nieuw (30d)", lost30d: "Verloren (30d)", retention: "Retentie", waitingList: "Wachtlijst", avgRevenuePerCustomer: "Gem. omzet / klant", ltv: "Geschatte levenslange waarde", subscriptionTypes: "Abonnementstypes" },
  financial: { title: "Financieel dashboard", monthlyRevenue: "Maandelijkse omzet", vsLastMonth: "t.o.v. vorige maand", mrr: "MRR", outstandingPayments: "Openstaande betalingen", revenuePerEmployee: "Omzet / medewerker", revenuePerCustomer: "Omzet / klant", projectedNextMonth: "Verwacht volgende maand", revenueByRegion: "Omzet per regio", revenueSeries: "Omzet" },
  inventory: { title: "Voorraad", trackedItems: "Bijgehouden items", lowStock: "Lage voorraad", pendingRestocks: "Openstaande bijbestellingen", lowStockSuffix: "lage voorraad", noneTracked: "Nog geen voorraad bijgehouden.", category: { cleaning_products: "Schoonmaakproducten", uniforms: "Uniformen", equipment: "Materieel", vehicle_supplies: "Voertuigbenodigdheden" } },
  aiInsights: { title: "AI-inzichten", badge: "Aanbevelingen", empty: "Op dit moment geen aanbevelingen: alles ziet er goed uit.", category: { churn_risk: "Opzegrisico", staff_overload: "Personeelsoverbelasting", route_optimization: "Route-optimalisatie", complaint_trend: "Klachtentrend", quality_drop: "Kwaliteitsdaling", top_performer: "Topper", expansion_opportunity: "Uitbreidingskans", supply_shortage: "Voorraadtekort", payment_risk: "Betalingsrisico", inactive_customer: "Inactieve klant" } },
  map: { title: "Live kaart", unavailableTitle: "Kaart niet beschikbaar", unavailableBody: "Stel NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in om live locaties van personeel en klanten te tonen." },
  offices: { title: "Vestigingen", subtitle: "Maak vestigingen/filialen aan en wijs regiomanagers toe. Nodig eerst een Regiomanagerprofiel uit via Teamprofielen en wijs ze daarna hier toe.", addOffice: "Vestiging toevoegen", name: "Naam", city: "Stad", create: "Vestiging aanmaken", regionalManagers: "Regiomanagers", remove: "Verwijderen", noneAssigned: "Geen toegewezen", assignPlaceholder: "Wijs een regiomanager toe…", noOfficesYet: "Nog geen vestigingen.", loadFailed: "Vestigingen konden niet worden geladen.", createFailed: "Vestiging kon niet worden aangemaakt." },
  team: { title: "Teamprofielen", subtitle: "Maak aparte Manager- en Beoordelingsmedewerker-accounts aan. Er wordt een uitnodiging naar de medewerker gemaild; rechten komen van het beveiligde rolrecord, niet van de profielmetadata.", inviteTitle: "Nodig een teamlid uit", fullName: "Volledige naam", workEmail: "Werk-e-mail", phone: "Telefoon", profile: "Profiel", roleAssessment: "Beoordelingsmedewerker", roleManager: "Manager", roleRegionalManager: "Regiomanager", invite: "Profiel aanmaken en uitnodiging versturen", sending: "Uitnodiging wordt verzonden...", invitationSent: "Uitnodiging verzonden. Personeelsnummer: {id}", headers: { name: "Naam", profile: "Profiel", employeeId: "Personeelsnummer", contact: "Contact", status: "Status", actions: "Acties" }, active: "Actief", inactive: "Inactief", noProfilesYet: "Nog geen Manager- of Beoordelingsprofielen.", loadingProfiles: "Profielen laden...", loadFailed: "Teamprofielen konden niet worden geladen.", createFailed: "Profiel kon niet worden aangemaakt." },
  statusAction: { restore: "Herstellen", suspend: "Schorsen", reactivate: "Heractiveren", deactivate: "Deactiveren", automated: "Automatisch", actionFailed: "Actie mislukt" },
  officeAssign: { ariaLabel: "Vestiging", noOffice: "Geen vestiging" },
};

const fr: DashboardCopy = {
  workspace: {
    signOut: "Déconnexion", language: "Langue",
    manager: { title: "Espace responsable", nav: { dashboard: "Tableau de bord", kpis: "Indicateurs clés", assessmentReview: "Suivi des évaluations", refunds: "Confirmation de remboursement", customers: "Clients", subscriptions: "Abonnements", team: "Personnel" } },
    regionalManager: { title: "Responsable régional", nav: { dashboard: "Tableau de bord", kpis: "Indicateurs clés", customers: "Clients", subscriptions: "Abonnements", team: "Personnel" } },
    assessment: { title: "Espace évaluation", nav: { myAssessments: "Mes évaluations" } },
  },
  roleLabel: { administrator: "Vue d'ensemble de l'entreprise", regional_manager: "Vue d'ensemble régionale", manager: "Vue d'ensemble opérationnelle" },
  eyebrow: "Centre des opérations", accessManagementEyebrow: "Gestion des accès",
  customize: { button: "Personnaliser", modalTitle: "Personnaliser le tableau de bord", close: "Fermer", helpText: "Glissez pour réorganiser, activez ou désactivez pour afficher ou masquer. Cela ne modifie que votre propre vue.", visible: "Visible", dragHandle: "Glisser pour réorganiser", save: "Enregistrer la disposition", saving: "Enregistrement…" },
  kpiOverview: { title: "Aperçu du jour", todaysVisits: "Visites du jour", completed: "Terminées", running: "En cours", delayed: "Retardées", cancelled: "Annulées", employeesWorking: "Employés au travail", customerRating: "Note client", avgCleaningTime: "Temps de nettoyage moyen", avgTravelTime: "Temps de trajet moyen", openComplaints: "Réclamations ouvertes", qualityScore: "Score qualité" },
  liveOps: { title: "Opérations en direct", noStaffLive: "Aucun employé actif pour le moment.", noActiveJob: "Aucune tâche en cours", next: "Suivant", travelSuffix: "min de trajet", status: { working: "Au travail", driving: "En déplacement", break: "En pause", waiting: "En attente", finished: "Terminé", sick: "Malade", offline: "Hors ligne" } },
  planning: { title: "Planning du jour", nothingScheduled: "Rien de prévu aujourd'hui.", status: { completed: "Terminé", working: "Au travail", driving: "En déplacement", delayed: "Retardé", cancelled: "Annulé", scheduled: "Planifié" } },
  employees: { title: "Performance des employés", sort: { highestRated: "Mieux notés", mostJobs: "Plus de missions terminées", lowestTravel: "Trajet le plus court", mostPunctual: "Plus ponctuels" }, noData: "Pas encore de données de performance.", headers: { rank: "#", employee: "Employé", jobs: "Missions", rating: "Note", avgCleaning: "Nettoyage moy.", avgTravel: "Trajet moy.", punctuality: "Ponctualité" } },
  quality: { title: "Centre de qualité", inspectionScore: "Score d'inspection", customerRating: "Note client", firstTimeRight: "Réussi du premier coup", revisitRate: "Taux de repassage", openComplaints: "Réclamations ouvertes", resolvedComplaints: "Réclamations résolues", recurringComplaints: "Réclamations récurrentes", totalComplaints: "Total réclamations (30j)", ratingTrend: "Tendance des notes", avgRatingSeries: "Note moyenne" },
  customers: { title: "Aperçu clients", active: "Clients actifs", new30d: "Nouveaux (30j)", lost30d: "Perdus (30j)", retention: "Rétention", waitingList: "Liste d'attente", avgRevenuePerCustomer: "Revenu moy. / client", ltv: "Valeur vie client estimée", subscriptionTypes: "Types d'abonnement" },
  financial: { title: "Tableau de bord financier", monthlyRevenue: "Revenu mensuel", vsLastMonth: "vs mois dernier", mrr: "MRR", outstandingPayments: "Paiements en attente", revenuePerEmployee: "Revenu / employé", revenuePerCustomer: "Revenu / client", projectedNextMonth: "Projection mois prochain", revenueByRegion: "Revenu par région", revenueSeries: "Revenu" },
  inventory: { title: "Inventaire", trackedItems: "Articles suivis", lowStock: "Stock faible", pendingRestocks: "Réapprovisionnements en attente", lowStockSuffix: "stock faible", noneTracked: "Aucun inventaire suivi pour le moment.", category: { cleaning_products: "Produits de nettoyage", uniforms: "Uniformes", equipment: "Équipement", vehicle_supplies: "Fournitures véhicules" } },
  aiInsights: { title: "Analyses IA", badge: "Recommandations", empty: "Aucune recommandation pour le moment: tout va bien.", category: { churn_risk: "Risque de désabonnement", staff_overload: "Surcharge du personnel", route_optimization: "Optimisation des trajets", complaint_trend: "Tendance des réclamations", quality_drop: "Baisse de qualité", top_performer: "Meilleur performeur", expansion_opportunity: "Opportunité d'expansion", supply_shortage: "Pénurie de fournitures", payment_risk: "Risque de paiement", inactive_customer: "Client inactif" } },
  map: { title: "Carte en direct", unavailableTitle: "Carte indisponible", unavailableBody: "Définissez NEXT_PUBLIC_GOOGLE_MAPS_API_KEY pour activer la localisation en direct du personnel et des clients." },
  offices: { title: "Agences", subtitle: "Créez des agences/succursales et affectez des responsables régionaux pour les superviser. Invitez d'abord un profil de Responsable régional depuis Profils d'équipe, puis affectez-le ici.", addOffice: "Ajouter une agence", name: "Nom", city: "Ville", create: "Créer l'agence", regionalManagers: "Responsables régionaux", remove: "Retirer", noneAssigned: "Aucun assigné", assignPlaceholder: "Affecter un responsable régional…", noOfficesYet: "Aucune agence pour le moment.", loadFailed: "Impossible de charger les agences.", createFailed: "L'agence n'a pas pu être créée." },
  team: { title: "Profils d'équipe", subtitle: "Créez des comptes distincts Responsable et Employé d'évaluation. Une invitation est envoyée par e-mail à l'employé ; les permissions proviennent de l'enregistrement de rôle protégé, pas des métadonnées du profil.", inviteTitle: "Inviter un membre de l'équipe", fullName: "Nom complet", workEmail: "E-mail professionnel", phone: "Téléphone", profile: "Profil", roleAssessment: "Employé d'évaluation", roleManager: "Responsable", roleRegionalManager: "Responsable régional", invite: "Créer le profil et envoyer l'invitation", sending: "Envoi de l'invitation...", invitationSent: "Invitation envoyée. Numéro d'employé : {id}", headers: { name: "Nom", profile: "Profil", employeeId: "Numéro d'employé", contact: "Contact", status: "Statut", actions: "Actions" }, active: "Actif", inactive: "Inactif", noProfilesYet: "Aucun profil Responsable ou Évaluation pour le moment.", loadingProfiles: "Chargement des profils...", loadFailed: "Les profils d'équipe n'ont pas pu être chargés.", createFailed: "Le profil n'a pas pu être créé." },
  statusAction: { restore: "Restaurer", suspend: "Suspendre", reactivate: "Réactiver", deactivate: "Désactiver", automated: "Automatique", actionFailed: "Action échouée" },
  officeAssign: { ariaLabel: "Agence", noOffice: "Aucune agence" },
};

const ar: DashboardCopy = {
  workspace: {
    signOut: "تسجيل الخروج", language: "اللغة",
    manager: { title: "مساحة عمل المدير", nav: { dashboard: "لوحة التحكم", kpis: "مؤشرات الأداء الأساسية", assessmentReview: "مراجعة التقييمات", refunds: "تأكيد الاسترداد", customers: "العملاء", subscriptions: "الاشتراكات", team: "الموظفون" } },
    regionalManager: { title: "المدير الإقليمي", nav: { dashboard: "لوحة التحكم", kpis: "مؤشرات الأداء الأساسية", customers: "العملاء", subscriptions: "الاشتراكات", team: "الموظفون" } },
    assessment: { title: "مساحة عمل التقييم", nav: { myAssessments: "تقييماتي" } },
  },
  roleLabel: { administrator: "نظرة عامة على الشركة", regional_manager: "نظرة عامة إقليمية", manager: "نظرة عامة على العمليات" },
  eyebrow: "مركز العمليات", accessManagementEyebrow: "إدارة الوصول",
  customize: { button: "تخصيص", modalTitle: "تخصيص لوحة التحكم", close: "إغلاق", helpText: "اسحب لإعادة الترتيب، وفعّل أو ألغِ لإظهار أو إخفاء العنصر. هذا يغيّر عرضك أنت فقط.", visible: "مرئي", dragHandle: "اسحب لإعادة الترتيب", save: "حفظ التخطيط", saving: "جارٍ الحفظ…" },
  kpiOverview: { title: "نظرة عامة على اليوم", todaysVisits: "زيارات اليوم", completed: "مكتملة", running: "جارية", delayed: "متأخرة", cancelled: "ملغاة", employeesWorking: "الموظفون العاملون", customerRating: "تقييم العملاء", avgCleaningTime: "متوسط وقت التنظيف", avgTravelTime: "متوسط وقت التنقل", openComplaints: "الشكاوى المفتوحة", qualityScore: "درجة الجودة" },
  liveOps: { title: "العمليات المباشرة", noStaffLive: "لا يوجد موظفون نشطون حالياً.", noActiveJob: "لا توجد مهمة نشطة", next: "التالي", travelSuffix: "د تنقل", status: { working: "يعمل الآن", driving: "في الطريق", break: "في استراحة", waiting: "في الانتظار", finished: "منتهية", sick: "مريض", offline: "غير متصل" } },
  planning: { title: "تخطيط اليوم", nothingScheduled: "لا شيء مجدول اليوم.", status: { completed: "مكتمل", working: "قيد التنفيذ", driving: "في الطريق", delayed: "متأخر", cancelled: "ملغى", scheduled: "مجدول" } },
  employees: { title: "أداء الموظفين", sort: { highestRated: "الأعلى تقييماً", mostJobs: "الأكثر إنجازاً للمهام", lowestTravel: "الأقل وقت تنقل", mostPunctual: "الأكثر التزاماً بالمواعيد" }, noData: "لا توجد بيانات أداء بعد.", headers: { rank: "#", employee: "الموظف", jobs: "المهام", rating: "التقييم", avgCleaning: "متوسط التنظيف", avgTravel: "متوسط التنقل", punctuality: "الالتزام بالمواعيد" } },
  quality: { title: "مركز الجودة", inspectionScore: "درجة التفتيش", customerRating: "تقييم العملاء", firstTimeRight: "صحيح من المرة الأولى", revisitRate: "معدل إعادة الزيارة", openComplaints: "الشكاوى المفتوحة", resolvedComplaints: "الشكاوى المحلولة", recurringComplaints: "الشكاوى المتكررة", totalComplaints: "إجمالي الشكاوى (30 يوماً)", ratingTrend: "اتجاه التقييم", avgRatingSeries: "متوسط التقييم" },
  customers: { title: "نظرة عامة على العملاء", active: "العملاء النشطون", new30d: "جدد (30 يوماً)", lost30d: "مفقودون (30 يوماً)", retention: "الاحتفاظ بالعملاء", waitingList: "قائمة الانتظار", avgRevenuePerCustomer: "متوسط الإيراد / عميل", ltv: "القيمة التقديرية مدى الحياة", subscriptionTypes: "أنواع الاشتراكات" },
  financial: { title: "لوحة الأداء المالي", monthlyRevenue: "الإيراد الشهري", vsLastMonth: "مقارنة بالشهر الماضي", mrr: "الإيراد الشهري المتكرر", outstandingPayments: "المدفوعات المستحقة", revenuePerEmployee: "الإيراد / موظف", revenuePerCustomer: "الإيراد / عميل", projectedNextMonth: "المتوقع للشهر القادم", revenueByRegion: "الإيراد حسب المنطقة", revenueSeries: "الإيراد" },
  inventory: { title: "المخزون", trackedItems: "العناصر المتتبعة", lowStock: "مخزون منخفض", pendingRestocks: "طلبات تجديد معلقة", lowStockSuffix: "مخزون منخفض", noneTracked: "لا يوجد مخزون متتبع بعد.", category: { cleaning_products: "منتجات التنظيف", uniforms: "الزي الموحد", equipment: "المعدات", vehicle_supplies: "مستلزمات المركبات" } },
  aiInsights: { title: "رؤى الذكاء الاصطناعي", badge: "توصيات", empty: "لا توجد توصيات حالياً: كل شيء يبدو جيداً.", category: { churn_risk: "خطر فقدان العميل", staff_overload: "إرهاق الموظفين", route_optimization: "تحسين المسارات", complaint_trend: "اتجاه الشكاوى", quality_drop: "انخفاض الجودة", top_performer: "الأفضل أداءً", expansion_opportunity: "فرصة توسع", supply_shortage: "نقص في المخزون", payment_risk: "خطر السداد", inactive_customer: "عميل غير نشط" } },
  map: { title: "الخريطة المباشرة", unavailableTitle: "الخريطة غير متاحة", unavailableBody: "قم بضبط NEXT_PUBLIC_GOOGLE_MAPS_API_KEY لتفعيل مواقع الموظفين والعملاء المباشرة." },
  offices: { title: "المكاتب", subtitle: "أنشئ مكاتب/فروعاً وعيّن مديرين إقليميين للإشراف عليها. ادعُ ملف مدير إقليمي من ملفات الفريق أولاً، ثم عيّنه هنا.", addOffice: "إضافة مكتب", name: "الاسم", city: "المدينة", create: "إنشاء المكتب", regionalManagers: "المديرون الإقليميون", remove: "إزالة", noneAssigned: "لم يُعيّن أحد", assignPlaceholder: "عيّن مديراً إقليمياً…", noOfficesYet: "لا توجد مكاتب بعد.", loadFailed: "تعذّر تحميل المكاتب.", createFailed: "تعذّر إنشاء المكتب." },
  team: { title: "ملفات الفريق", subtitle: "أنشئ حسابات منفصلة للمدير وموظف التقييم. تُرسل الدعوة عبر البريد الإلكتروني للموظف؛ تأتي الصلاحيات من سجل الدور المحمي، وليس من بيانات الملف الشخصي.", inviteTitle: "دعوة عضو فريق", fullName: "الاسم الكامل", workEmail: "البريد الإلكتروني للعمل", phone: "الهاتف", profile: "الملف الشخصي", roleAssessment: "موظف تقييم", roleManager: "مدير", roleRegionalManager: "مدير إقليمي", invite: "إنشاء الملف الشخصي وإرسال الدعوة", sending: "جارٍ إرسال الدعوة...", invitationSent: "تم إرسال الدعوة. رقم الموظف: {id}", headers: { name: "الاسم", profile: "الملف الشخصي", employeeId: "رقم الموظف", contact: "التواصل", status: "الحالة", actions: "الإجراءات" }, active: "نشط", inactive: "غير نشط", noProfilesYet: "لا توجد ملفات مدير أو تقييم بعد.", loadingProfiles: "جارٍ تحميل الملفات الشخصية...", loadFailed: "تعذّر تحميل ملفات الفريق.", createFailed: "تعذّر إنشاء الملف الشخصي." },
  statusAction: { restore: "استعادة", suspend: "تعليق", reactivate: "إعادة تفعيل", deactivate: "إلغاء التفعيل", automated: "تلقائي", actionFailed: "فشل الإجراء" },
  officeAssign: { ariaLabel: "المكتب", noOffice: "بلا مكتب" },
};

const es: DashboardCopy = {
  workspace: {
    signOut: "Cerrar sesión", language: "Idioma",
    manager: { title: "Espacio de trabajo del gerente", nav: { dashboard: "Panel", kpis: "Indicadores clave", assessmentReview: "Revisión de evaluaciones", refunds: "Confirmación de reembolso", customers: "Clientes", subscriptions: "Suscripciones", team: "Personal" } },
    regionalManager: { title: "Gerente regional", nav: { dashboard: "Panel", kpis: "Indicadores clave", customers: "Clientes", subscriptions: "Suscripciones", team: "Personal" } },
    assessment: { title: "Espacio de evaluación", nav: { myAssessments: "Mis evaluaciones" } },
  },
  roleLabel: { administrator: "Visión general de la empresa", regional_manager: "Visión general regional", manager: "Visión general operativa" },
  eyebrow: "Centro de operaciones", accessManagementEyebrow: "Gestión de accesos",
  customize: { button: "Personalizar", modalTitle: "Personalizar panel", close: "Cerrar", helpText: "Arrastre para reordenar, active o desactive para mostrar u ocultar. Esto solo cambia su propia vista.", visible: "Visible", dragHandle: "Arrastrar para reordenar", save: "Guardar diseño", saving: "Guardando…" },
  kpiOverview: { title: "Resumen de hoy", todaysVisits: "Visitas de hoy", completed: "Completadas", running: "En curso", delayed: "Retrasadas", cancelled: "Canceladas", employeesWorking: "Empleados trabajando", customerRating: "Calificación del cliente", avgCleaningTime: "Tiempo medio de limpieza", avgTravelTime: "Tiempo medio de desplazamiento", openComplaints: "Quejas abiertas", qualityScore: "Puntuación de calidad" },
  liveOps: { title: "Operaciones en vivo", noStaffLive: "Ningún empleado está activo en este momento.", noActiveJob: "Sin tarea activa", next: "Siguiente", travelSuffix: "min de desplazamiento", status: { working: "Trabajando", driving: "En camino", break: "En descanso", waiting: "Esperando", finished: "Finalizado", sick: "Enfermo", offline: "Desconectado" } },
  planning: { title: "Planificación de hoy", nothingScheduled: "Nada programado para hoy.", status: { completed: "Completado", working: "Trabajando", driving: "En camino", delayed: "Retrasado", cancelled: "Cancelado", scheduled: "Programado" } },
  employees: { title: "Rendimiento de empleados", sort: { highestRated: "Mejor calificados", mostJobs: "Más trabajos completados", lowestTravel: "Menor tiempo de desplazamiento", mostPunctual: "Más puntuales" }, noData: "Aún no hay datos de rendimiento.", headers: { rank: "#", employee: "Empleado", jobs: "Trabajos", rating: "Calificación", avgCleaning: "Limpieza media", avgTravel: "Desplazamiento medio", punctuality: "Puntualidad" } },
  quality: { title: "Centro de calidad", inspectionScore: "Puntuación de inspección", customerRating: "Calificación del cliente", firstTimeRight: "Correcto a la primera", revisitRate: "Tasa de repetición", openComplaints: "Quejas abiertas", resolvedComplaints: "Quejas resueltas", recurringComplaints: "Quejas recurrentes", totalComplaints: "Quejas totales (30d)", ratingTrend: "Tendencia de calificación", avgRatingSeries: "Calificación media" },
  customers: { title: "Resumen de clientes", active: "Clientes activos", new30d: "Nuevos (30d)", lost30d: "Perdidos (30d)", retention: "Retención", waitingList: "Lista de espera", avgRevenuePerCustomer: "Ingreso medio / cliente", ltv: "Valor de vida estimado", subscriptionTypes: "Tipos de suscripción" },
  financial: { title: "Panel financiero", monthlyRevenue: "Ingresos mensuales", vsLastMonth: "vs mes anterior", mrr: "MRR", outstandingPayments: "Pagos pendientes", revenuePerEmployee: "Ingreso / empleado", revenuePerCustomer: "Ingreso / cliente", projectedNextMonth: "Proyección próximo mes", revenueByRegion: "Ingresos por región", revenueSeries: "Ingresos" },
  inventory: { title: "Inventario", trackedItems: "Artículos registrados", lowStock: "Existencias bajas", pendingRestocks: "Reposiciones pendientes", lowStockSuffix: "existencias bajas", noneTracked: "Aún no hay inventario registrado.", category: { cleaning_products: "Productos de limpieza", uniforms: "Uniformes", equipment: "Equipo", vehicle_supplies: "Suministros para vehículos" } },
  aiInsights: { title: "Perspectivas de IA", badge: "Recomendaciones", empty: "No hay recomendaciones por ahora: todo se ve bien.", category: { churn_risk: "Riesgo de cancelación", staff_overload: "Sobrecarga de personal", route_optimization: "Optimización de rutas", complaint_trend: "Tendencia de quejas", quality_drop: "Caída de calidad", top_performer: "Mejor desempeño", expansion_opportunity: "Oportunidad de expansión", supply_shortage: "Escasez de suministros", payment_risk: "Riesgo de pago", inactive_customer: "Cliente inactivo" } },
  map: { title: "Mapa en vivo", unavailableTitle: "Mapa no disponible", unavailableBody: "Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para habilitar la ubicación en vivo del personal y los clientes." },
  offices: { title: "Oficinas", subtitle: "Cree oficinas/sucursales y asigne gerentes regionales para supervisarlas. Invite primero un perfil de Gerente regional desde Perfiles de equipo y luego asígnelo aquí.", addOffice: "Añadir una oficina", name: "Nombre", city: "Ciudad", create: "Crear oficina", regionalManagers: "Gerentes regionales", remove: "Quitar", noneAssigned: "Ninguno asignado", assignPlaceholder: "Asignar un gerente regional…", noOfficesYet: "Aún no hay oficinas.", loadFailed: "No se pudieron cargar las oficinas.", createFailed: "No se pudo crear la oficina." },
  team: { title: "Perfiles del equipo", subtitle: "Cree cuentas separadas de Gerente y Empleado de evaluación. Se envía una invitación por correo al empleado; los permisos provienen del registro de rol protegido, no de los metadatos del perfil.", inviteTitle: "Invitar a un miembro del equipo", fullName: "Nombre completo", workEmail: "Correo de trabajo", phone: "Teléfono", profile: "Perfil", roleAssessment: "Empleado de evaluación", roleManager: "Gerente", roleRegionalManager: "Gerente regional", invite: "Crear perfil y enviar invitación", sending: "Enviando invitación...", invitationSent: "Invitación enviada. ID de empleado: {id}", headers: { name: "Nombre", profile: "Perfil", employeeId: "ID de empleado", contact: "Contacto", status: "Estado", actions: "Acciones" }, active: "Activo", inactive: "Inactivo", noProfilesYet: "Aún no hay perfiles de Gerente o Evaluación.", loadingProfiles: "Cargando perfiles...", loadFailed: "No se pudieron cargar los perfiles del equipo.", createFailed: "No se pudo crear el perfil." },
  statusAction: { restore: "Restaurar", suspend: "Suspender", reactivate: "Reactivar", deactivate: "Desactivar", automated: "Automático", actionFailed: "Acción fallida" },
  officeAssign: { ariaLabel: "Oficina", noOffice: "Sin oficina" },
};

const de: DashboardCopy = {
  workspace: {
    signOut: "Abmelden", language: "Sprache",
    manager: { title: "Manager-Arbeitsbereich", nav: { dashboard: "Übersicht", kpis: "KPI-Basislinie", assessmentReview: "Bewertungsprüfung", refunds: "Rückerstattungsbestätigung", customers: "Kunden", subscriptions: "Abonnements", team: "Personal" } },
    regionalManager: { title: "Regionalleiter", nav: { dashboard: "Übersicht", kpis: "KPI-Basislinie", customers: "Kunden", subscriptions: "Abonnements", team: "Personal" } },
    assessment: { title: "Bewertungsarbeitsbereich", nav: { myAssessments: "Meine Bewertungen" } },
  },
  roleLabel: { administrator: "Unternehmensübersicht", regional_manager: "Regionsübersicht", manager: "Betriebsübersicht" },
  eyebrow: "Betriebszentrale", accessManagementEyebrow: "Zugriffsverwaltung",
  customize: { button: "Anpassen", modalTitle: "Dashboard anpassen", close: "Schließen", helpText: "Ziehen zum Anordnen, umschalten zum Ein-/Ausblenden. Dies ändert nur Ihre eigene Ansicht.", visible: "Sichtbar", dragHandle: "Ziehen zum Anordnen", save: "Layout speichern", saving: "Wird gespeichert…" },
  kpiOverview: { title: "Heutige Übersicht", todaysVisits: "Heutige Einsätze", completed: "Abgeschlossen", running: "Laufend", delayed: "Verzögert", cancelled: "Storniert", employeesWorking: "Mitarbeiter im Einsatz", customerRating: "Kundenbewertung", avgCleaningTime: "Ø Reinigungszeit", avgTravelTime: "Ø Fahrzeit", openComplaints: "Offene Beschwerden", qualityScore: "Qualitätswert" },
  liveOps: { title: "Live-Betrieb", noStaffLive: "Derzeit ist kein Personal aktiv.", noActiveJob: "Kein aktiver Auftrag", next: "Nächster", travelSuffix: "Min. Fahrzeit", status: { working: "Im Einsatz", driving: "Unterwegs", break: "Pause", waiting: "Wartend", finished: "Fertig", sick: "Krank", offline: "Offline" } },
  planning: { title: "Heutige Planung", nothingScheduled: "Für heute nichts geplant.", status: { completed: "Abgeschlossen", working: "Im Einsatz", driving: "Unterwegs", delayed: "Verzögert", cancelled: "Storniert", scheduled: "Geplant" } },
  employees: { title: "Mitarbeiterleistung", sort: { highestRated: "Am besten bewertet", mostJobs: "Meiste abgeschlossene Aufträge", lowestTravel: "Kürzeste Fahrzeit", mostPunctual: "Pünktlichste" }, noData: "Noch keine Leistungsdaten.", headers: { rank: "#", employee: "Mitarbeiter", jobs: "Aufträge", rating: "Bewertung", avgCleaning: "Ø Reinigung", avgTravel: "Ø Fahrzeit", punctuality: "Pünktlichkeit" } },
  quality: { title: "Qualitätszentrum", inspectionScore: "Inspektionswert", customerRating: "Kundenbewertung", firstTimeRight: "Sofort richtig", revisitRate: "Nachbesserungsquote", openComplaints: "Offene Beschwerden", resolvedComplaints: "Gelöste Beschwerden", recurringComplaints: "Wiederkehrende Beschwerden", totalComplaints: "Beschwerden gesamt (30T)", ratingTrend: "Bewertungstrend", avgRatingSeries: "Ø Bewertung" },
  customers: { title: "Kundenübersicht", active: "Aktive Kunden", new30d: "Neu (30T)", lost30d: "Verloren (30T)", retention: "Kundenbindung", waitingList: "Warteliste", avgRevenuePerCustomer: "Ø Umsatz / Kunde", ltv: "Geschätzter Lebenszeitwert", subscriptionTypes: "Abonnementarten" },
  financial: { title: "Finanz-Dashboard", monthlyRevenue: "Monatsumsatz", vsLastMonth: "ggü. Vormonat", mrr: "MRR", outstandingPayments: "Ausstehende Zahlungen", revenuePerEmployee: "Umsatz / Mitarbeiter", revenuePerCustomer: "Umsatz / Kunde", projectedNextMonth: "Prognose nächster Monat", revenueByRegion: "Umsatz nach Region", revenueSeries: "Umsatz" },
  inventory: { title: "Bestand", trackedItems: "Erfasste Artikel", lowStock: "Niedriger Bestand", pendingRestocks: "Ausstehende Nachbestellungen", lowStockSuffix: "niedriger Bestand", noneTracked: "Noch kein Bestand erfasst.", category: { cleaning_products: "Reinigungsprodukte", uniforms: "Uniformen", equipment: "Ausrüstung", vehicle_supplies: "Fahrzeugzubehör" } },
  aiInsights: { title: "KI-Einblicke", badge: "Empfehlungen", empty: "Derzeit keine Empfehlungen: alles sieht gut aus.", category: { churn_risk: "Abwanderungsrisiko", staff_overload: "Personalüberlastung", route_optimization: "Routenoptimierung", complaint_trend: "Beschwerdetrend", quality_drop: "Qualitätsrückgang", top_performer: "Top-Mitarbeiter", expansion_opportunity: "Expansionsmöglichkeit", supply_shortage: "Materialengpass", payment_risk: "Zahlungsrisiko", inactive_customer: "Inaktiver Kunde" } },
  map: { title: "Live-Karte", unavailableTitle: "Karte nicht verfügbar", unavailableBody: "Legen Sie NEXT_PUBLIC_GOOGLE_MAPS_API_KEY fest, um Live-Standorte von Personal und Kunden zu aktivieren." },
  offices: { title: "Niederlassungen", subtitle: "Erstellen Sie Niederlassungen/Filialen und weisen Sie Regionalleiter zur Aufsicht zu. Laden Sie zunächst ein Regionalleiter-Profil unter Teamprofile ein und weisen Sie es dann hier zu.", addOffice: "Niederlassung hinzufügen", name: "Name", city: "Stadt", create: "Niederlassung erstellen", regionalManagers: "Regionalleiter", remove: "Entfernen", noneAssigned: "Keine zugewiesen", assignPlaceholder: "Regionalleiter zuweisen…", noOfficesYet: "Noch keine Niederlassungen.", loadFailed: "Niederlassungen konnten nicht geladen werden.", createFailed: "Niederlassung konnte nicht erstellt werden." },
  team: { title: "Teamprofile", subtitle: "Erstellen Sie separate Manager- und Bewertungsmitarbeiter-Konten. Eine Einladung wird per E-Mail an den Mitarbeiter gesendet; die Berechtigungen stammen aus dem geschützten Rollendatensatz, nicht aus den Profilmetadaten.", inviteTitle: "Teammitglied einladen", fullName: "Vollständiger Name", workEmail: "Geschäftliche E-Mail", phone: "Telefon", profile: "Profil", roleAssessment: "Bewertungsmitarbeiter", roleManager: "Manager", roleRegionalManager: "Regionalleiter", invite: "Profil erstellen und Einladung senden", sending: "Einladung wird gesendet...", invitationSent: "Einladung gesendet. Personalnummer: {id}", headers: { name: "Name", profile: "Profil", employeeId: "Personalnummer", contact: "Kontakt", status: "Status", actions: "Aktionen" }, active: "Aktiv", inactive: "Inaktiv", noProfilesYet: "Noch keine Manager- oder Bewertungsprofile.", loadingProfiles: "Profile werden geladen...", loadFailed: "Teamprofile konnten nicht geladen werden.", createFailed: "Profil konnte nicht erstellt werden." },
  statusAction: { restore: "Wiederherstellen", suspend: "Sperren", reactivate: "Reaktivieren", deactivate: "Deaktivieren", automated: "Automatisch", actionFailed: "Aktion fehlgeschlagen" },
  officeAssign: { ariaLabel: "Niederlassung", noOffice: "Keine Niederlassung" },
};

const pt: DashboardCopy = {
  workspace: {
    signOut: "Terminar sessão", language: "Idioma",
    manager: { title: "Espaço de trabalho do gestor", nav: { dashboard: "Painel", kpis: "Base de KPIs", assessmentReview: "Revisão de avaliações", refunds: "Confirmação de reembolso", customers: "Clientes", subscriptions: "Subscrições", team: "Pessoal" } },
    regionalManager: { title: "Gestor regional", nav: { dashboard: "Painel", kpis: "Base de KPIs", customers: "Clientes", subscriptions: "Subscrições", team: "Pessoal" } },
    assessment: { title: "Espaço de avaliação", nav: { myAssessments: "As minhas avaliações" } },
  },
  roleLabel: { administrator: "Visão geral da empresa", regional_manager: "Visão geral regional", manager: "Visão geral operacional" },
  eyebrow: "Centro de operações", accessManagementEyebrow: "Gestão de acessos",
  customize: { button: "Personalizar", modalTitle: "Personalizar painel", close: "Fechar", helpText: "Arraste para reordenar, alterne para mostrar ou ocultar. Isto só altera a sua própria vista.", visible: "Visível", dragHandle: "Arrastar para reordenar", save: "Guardar esquema", saving: "A guardar…" },
  kpiOverview: { title: "Resumo de hoje", todaysVisits: "Visitas de hoje", completed: "Concluídas", running: "Em curso", delayed: "Atrasadas", cancelled: "Canceladas", employeesWorking: "Funcionários a trabalhar", customerRating: "Avaliação do cliente", avgCleaningTime: "Tempo médio de limpeza", avgTravelTime: "Tempo médio de deslocação", openComplaints: "Reclamações abertas", qualityScore: "Pontuação de qualidade" },
  liveOps: { title: "Operações em direto", noStaffLive: "Nenhum funcionário ativo neste momento.", noActiveJob: "Sem tarefa ativa", next: "Seguinte", travelSuffix: "min de deslocação", status: { working: "A trabalhar", driving: "A caminho", break: "Em pausa", waiting: "À espera", finished: "Concluído", sick: "Doente", offline: "Offline" } },
  planning: { title: "Planeamento de hoje", nothingScheduled: "Nada agendado para hoje.", status: { completed: "Concluído", working: "A trabalhar", driving: "A caminho", delayed: "Atrasado", cancelled: "Cancelado", scheduled: "Agendado" } },
  employees: { title: "Desempenho dos funcionários", sort: { highestRated: "Melhor avaliados", mostJobs: "Mais trabalhos concluídos", lowestTravel: "Menor tempo de deslocação", mostPunctual: "Mais pontuais" }, noData: "Ainda sem dados de desempenho.", headers: { rank: "#", employee: "Funcionário", jobs: "Trabalhos", rating: "Avaliação", avgCleaning: "Limpeza média", avgTravel: "Deslocação média", punctuality: "Pontualidade" } },
  quality: { title: "Centro de qualidade", inspectionScore: "Pontuação de inspeção", customerRating: "Avaliação do cliente", firstTimeRight: "Correto à primeira", revisitRate: "Taxa de repetição", openComplaints: "Reclamações abertas", resolvedComplaints: "Reclamações resolvidas", recurringComplaints: "Reclamações recorrentes", totalComplaints: "Total de reclamações (30d)", ratingTrend: "Tendência de avaliação", avgRatingSeries: "Avaliação média" },
  customers: { title: "Resumo de clientes", active: "Clientes ativos", new30d: "Novos (30d)", lost30d: "Perdidos (30d)", retention: "Retenção", waitingList: "Lista de espera", avgRevenuePerCustomer: "Receita média / cliente", ltv: "Valor vitalício estimado", subscriptionTypes: "Tipos de subscrição" },
  financial: { title: "Painel financeiro", monthlyRevenue: "Receita mensal", vsLastMonth: "vs mês anterior", mrr: "MRR", outstandingPayments: "Pagamentos pendentes", revenuePerEmployee: "Receita / funcionário", revenuePerCustomer: "Receita / cliente", projectedNextMonth: "Projeção próximo mês", revenueByRegion: "Receita por região", revenueSeries: "Receita" },
  inventory: { title: "Inventário", trackedItems: "Itens monitorizados", lowStock: "Stock baixo", pendingRestocks: "Reabastecimentos pendentes", lowStockSuffix: "stock baixo", noneTracked: "Ainda sem inventário monitorizado.", category: { cleaning_products: "Produtos de limpeza", uniforms: "Uniformes", equipment: "Equipamento", vehicle_supplies: "Material para veículos" } },
  aiInsights: { title: "Perceções de IA", badge: "Recomendações", empty: "Sem recomendações neste momento: está tudo bem.", category: { churn_risk: "Risco de cancelamento", staff_overload: "Sobrecarga de pessoal", route_optimization: "Otimização de rotas", complaint_trend: "Tendência de reclamações", quality_drop: "Queda de qualidade", top_performer: "Melhor desempenho", expansion_opportunity: "Oportunidade de expansão", supply_shortage: "Escassez de material", payment_risk: "Risco de pagamento", inactive_customer: "Cliente inativo" } },
  map: { title: "Mapa em direto", unavailableTitle: "Mapa indisponível", unavailableBody: "Defina NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para ativar a localização em direto de funcionários e clientes." },
  offices: { title: "Escritórios", subtitle: "Crie escritórios/filiais e atribua gestores regionais para os supervisionar. Convide primeiro um perfil de Gestor regional em Perfis de equipa e atribua-o aqui depois.", addOffice: "Adicionar escritório", name: "Nome", city: "Cidade", create: "Criar escritório", regionalManagers: "Gestores regionais", remove: "Remover", noneAssigned: "Nenhum atribuído", assignPlaceholder: "Atribuir um gestor regional…", noOfficesYet: "Ainda sem escritórios.", loadFailed: "Não foi possível carregar os escritórios.", createFailed: "Não foi possível criar o escritório." },
  team: { title: "Perfis de equipa", subtitle: "Crie contas separadas de Gestor e Funcionário de avaliação. Um convite é enviado por e-mail ao funcionário; as permissões vêm do registo de função protegido, não dos metadados do perfil.", inviteTitle: "Convidar um membro da equipa", fullName: "Nome completo", workEmail: "E-mail profissional", phone: "Telefone", profile: "Perfil", roleAssessment: "Funcionário de avaliação", roleManager: "Gestor", roleRegionalManager: "Gestor regional", invite: "Criar perfil e enviar convite", sending: "A enviar convite...", invitationSent: "Convite enviado. ID de funcionário: {id}", headers: { name: "Nome", profile: "Perfil", employeeId: "ID de funcionário", contact: "Contacto", status: "Estado", actions: "Ações" }, active: "Ativo", inactive: "Inativo", noProfilesYet: "Ainda sem perfis de Gestor ou Avaliação.", loadingProfiles: "A carregar perfis...", loadFailed: "Não foi possível carregar os perfis de equipa.", createFailed: "Não foi possível criar o perfil." },
  statusAction: { restore: "Restaurar", suspend: "Suspender", reactivate: "Reativar", deactivate: "Desativar", automated: "Automático", actionFailed: "Ação falhada" },
  officeAssign: { ariaLabel: "Escritório", noOffice: "Sem escritório" },
};

export const dashboardCopy: Record<Locale, DashboardCopy> = { en, nl, fr, ar, es, de, pt };

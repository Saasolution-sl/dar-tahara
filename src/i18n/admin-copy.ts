import type { Locale } from "./config";

/**
 * Copy for the internal staff/administrator operations panel (`/admin/*`).
 * Separate from `portal-copy.ts` (the customer-facing account area): the
 * audiences and vocabulary differ enough that sharing one dictionary would
 * force awkward compromises in both.
 */
export type AdminCopy = {
  language: string;
  shell: {
    operations: string;
    signOut: string;
    nav: {
      dashboard: string; kpiBaseline: string; assessments: string; customers: string; properties: string; subscriptions: string;
      pauseRequests: string; deepCleanRequests: string; acUnits: string; invoices: string; features: string; auditLog: string; assistant: string;
      teamProfiles: string; offices: string;
    };
  };
  common: {
    refresh: string; search: string; allStatuses: string; noRecords: string;
    notAuthorized: string; dataUnavailable: string; actionFailed: string;
  };
  assessments: {
    title: string; subtitleSuffix: string; searchPlaceholder: string;
    statusLabels: Record<string, string>;
    columns: { reference: string; customer: string; property: string; submitted: string; status: string; nextAction: string };
    actions: { startReview: string; contacted: string; schedule: string; requestInfo: string; complete: string; approve: string; reject: string; assign: string };
    prompts: { notes: string; scheduleDate: string; cleanerId: string };
    noMatch: string;
  };
  pauseRequests: {
    title: string; subtitleSuffix: string; searchPlaceholder: string;
    statusLabels: Record<string, string>;
    columns: { customer: string; reason: string; requested: string; approved: string; status: string; nextAction: string };
    actions: { startReview: string; approve: string; reject: string; resumeEarly: string };
    prompts: { notes: string; approvedStart: string; approvedEnd: string };
    noMatch: string;
  };
  deepCleanRequests: {
    title: string; subtitleSuffix: string; searchPlaceholder: string;
    statusLabels: Record<string, string>;
    columns: { customer: string; date: string; price: string; status: string; nextAction: string };
    actions: { startReview: string; approve: string; reject: string; complete: string };
    prompts: { notes: string };
    freeLabel: string; noMatch: string;
  };
  acUnits: {
    title: string; subtitleSuffix: string; searchPlaceholder: string;
    columns: { customer: string; property: string; unit: string; coverage: string; status: string; maintenance: string; billing: string; nextAction: string };
    coverageLabels: { included: string; paid_addon: string };
    billingOkLabel: string; billingMismatchLabel: string;
    actions: { replace: string; retire: string; sync: string };
    prompts: { replaceReason: string; replaceTargetUnitId: string; retireReason: string };
    noMatch: string;
  };
  invoicesAdmin: {
    title: string; subtitleSuffix: string; searchPlaceholder: string;
    statusLabels: Record<string, string>;
    collectionStageLabels: Record<string, string>;
    noStageLabel: string;
    finalSettlementLabel: string;
    columns: {
      reference: string; customer: string; total: string; outstanding: string;
      status: string; collectionStage: string; failedAttempts: string; nextAction: string;
    };
    actions: { resendNotice: string; generateReplacementLink: string; viewInvoice: string };
    noMatch: string;
  };
  tables: {
    auditLog: { title: string; headers: [string, string, string, string, string] };
    customers: { title: string; headers: [string, string, string, string, string, string] };
    properties: { title: string; headers: [string, string, string, string, string] };
    subscriptions: { title: string; headers: [string, string, string, string, string, string, string, string] };
    complaints: { title: string; headers: [string, string, string, string, string, string, string]; recurringYes: string };
    employeesWorking: { title: string; headers: [string, string, string, string, string, string, string, string]; footnote: string };
    liveOperations: { title: string; headers: [string, string, string, string, string, string, string, string, string]; showing: string; footnote: string };
    visits: { title: string; headers: [string, string, string, string, string, string, string, string, string]; revisitYes: string };
    inspections: { title: string; headers: [string, string, string, string, string, string]; ftrYes: string; ftrNo: string; footnote: string };
    inventory: { title: string; headers: [string, string, string, string, string, string]; lowStockBadge: string };
    restockRequests: { title: string; headers: [string, string, string, string, string] };
  };
  features: {
    title: string; subtitle: string; enabled: string; disabled: string;
    startsAt: string; endsAt: string; disabledMessage: string;
    fallbackCtaLabel: string; fallbackCtaUrl: string; save: string; saved: string;
    lastChanged: string; confirmToggle: string; actionEnable: string; actionDisable: string;
  };
};

const en: AdminCopy = {
  language: "Language",
  shell: {
    operations: "Operations",
    signOut: "Sign out",
    nav: {
      dashboard: "Dashboard", kpiBaseline: "KPI Baseline", teamProfiles: "Team profiles", offices: "Offices",
      assessments: "Assessments", customers: "Customers", properties: "Properties", subscriptions: "Subscriptions",
      pauseRequests: "Pause requests", deepCleanRequests: "Deep-clean requests", acUnits: "AC units", invoices: "Invoices", features: "Feature settings", auditLog: "Audit log", assistant: "Assistant",
    },
  },
  common: {
    refresh: "Refresh", search: "Search", allStatuses: "All statuses", noRecords: "No records.",
    notAuthorized: "Your session is not authorised.", dataUnavailable: "Data is unavailable.", actionFailed: "Action failed",
  },
  assessments: {
    title: "Home assessments", subtitleSuffix: "applications · approval-gated workflow",
    searchPlaceholder: "Search reference, customer, city or address",
    statusLabels: { draft: "Draft", submitted: "Submitted", under_review: "Under review", contacted: "Contacted", assessment_scheduled: "Assessment scheduled", assessment_completed: "Assessment completed", additional_information_required: "Information required", approved: "Approved", rejected: "Rejected", cancelled: "Cancelled", expired: "Expired", awaiting_payment: "Awaiting payment", assessment: "Legacy assessment", pending_review: "Pending review", subscription_active: "Subscription active", paused: "Paused" },
    columns: { reference: "Reference", customer: "Customer", property: "Property", submitted: "Submitted", status: "Status", nextAction: "Next action" },
    actions: { startReview: "Start review", contacted: "Contacted", schedule: "Schedule", requestInfo: "Request information", complete: "Complete", approve: "Approve and create proposal", reject: "Reject", assign: "Assign" },
    prompts: { notes: "Notes or customer-facing reason", scheduleDate: "Assessment date and time (YYYY-MM-DD HH:mm)", cleanerId: "Assigned employee number or UUID" },
    noMatch: "No assessments match this view.",
  },
  pauseRequests: {
    title: "Subscription pause requests", subtitleSuffix: "requests",
    searchPlaceholder: "Search customer, email or reason",
    statusLabels: { submitted: "Submitted", under_review: "Under review", approved: "Approved", rejected: "Rejected", cancelled: "Cancelled", active: "Paused", completed: "Completed" },
    columns: { customer: "Customer", reason: "Reason", requested: "Requested", approved: "Approved", status: "Status", nextAction: "Next action" },
    actions: { startReview: "Start review", approve: "Approve", reject: "Reject", resumeEarly: "Resume early" },
    prompts: { notes: "Notes (visible to the customer for approve/reject)", approvedStart: "Approved start date (YYYY-MM-DD)", approvedEnd: "Approved end date (YYYY-MM-DD)" },
    noMatch: "No pause requests match this view.",
  },
  deepCleanRequests: {
    title: "Deep-clean requests", subtitleSuffix: "requests", searchPlaceholder: "Search customer or email",
    statusLabels: { submitted: "Submitted", under_review: "Under review", approved: "Approved", scheduled: "Scheduled", completed: "Completed", rejected: "Rejected", cancelled: "Cancelled" },
    columns: { customer: "Customer", date: "Requested date", price: "Price", status: "Status", nextAction: "Next action" },
    actions: { startReview: "Start review", approve: "Approve", reject: "Reject", complete: "Mark completed" },
    prompts: { notes: "Notes (visible to the customer for approve/reject)" },
    freeLabel: "Free",
    noMatch: "No deep-clean requests match this view.",
  },
  acUnits: {
    title: "Air-conditioning units", subtitleSuffix: "units", searchPlaceholder: "Search customer or email",
    columns: { customer: "Customer", property: "Property", unit: "Unit", coverage: "Coverage", status: "Status", maintenance: "Maintenance", billing: "Billing", nextAction: "Next action" },
    coverageLabels: { included: "Included", paid_addon: "Paid add-on" },
    billingOkLabel: "In sync", billingMismatchLabel: "Billing mismatch",
    actions: { replace: "Replace included unit", retire: "Retire", sync: "Synchronize Stripe quantity" },
    prompts: { replaceReason: "Reason (removed / replaced / moved_property / incorrect_before_maintenance / admin_correction)", replaceTargetUnitId: "New included AC unit ID", retireReason: "Reason for retiring this unit" },
    noMatch: "No AC units match this view.",
  },
  invoicesAdmin: {
    title: "Invoices", subtitleSuffix: "invoices",
    searchPlaceholder: "Search reference or customer",
    statusLabels: { draft: "Draft", open: "Open", paid: "Paid", overdue: "Overdue", void: "Void", refunded: "Refunded", partially_refunded: "Partially refunded", uncollectible: "Uncollectible", included_in_settlement: "Included in settlement" },
    collectionStageLabels: { first_notice: "First notice sent", second_notice: "Final notice sent", seriously_overdue: "Seriously overdue", escalation_eligible: "Escalation eligible" },
    noStageLabel: "None",
    finalSettlementLabel: "Early-termination settlement",
    columns: { reference: "Reference", customer: "Customer", total: "Total", outstanding: "Outstanding", status: "Status", collectionStage: "Collection stage", failedAttempts: "Failed attempts", nextAction: "Next action" },
    actions: { resendNotice: "Resend notice", generateReplacementLink: "Generate replacement link", viewInvoice: "View invoice" },
    noMatch: "No invoices match this view.",
  },
  tables: {
    auditLog: { title: "Audit log", headers: ["Time", "Actor", "Action", "Resource", "Identifier"] },
    customers: { title: "Customers", headers: ["Customer", "Email", "Status", "Created", "Last login", "Actions"] },
    properties: { title: "Properties", headers: ["Address", "City", "Customer", "Type", "Size"] },
    subscriptions: { title: "Subscriptions", headers: ["Customer", "Status", "Frequency", "Billing", "Duration", "Amount", "Cancellation", "Actions"] },
    complaints: { title: "Complaints", headers: ["Date", "Customer", "Category", "Office", "Status", "Recurring", "Resolved"], recurringYes: "Yes" },
    employeesWorking: { title: "Employees working", headers: ["Employee", "Number", "Office", "Status", "Avg cleaning", "Avg travel", "Visits", "Since"], footnote: "On shift means working or driving, matching the dashboard tile. Averages come from that employee's completed visits over the last 30 days." },
    liveOperations: { title: "Live operations", headers: ["Employee", "Number", "Office", "Status", "Current customer", "Address", "Expected end", "Next job", "Updated"], showing: "Showing status:", footnote: "Live staff status, the same records the Live operations board shows. By default this excludes finished, sick and offline: they are on the roster but not on a job. Add ?status=all to include them." },
    visits: { title: "Service visits", headers: ["Date", "Customer", "Employee", "Office", "Status", "Cleaning", "Travel", "Rating", "Revisit"], revisitYes: "Yes" },
    inspections: { title: "Quality inspections", headers: ["Date", "Customer", "Inspector", "Score", "First time right", "Notes"], ftrYes: "Yes", ftrNo: "No", footnote: "Showing the last 30 days, the window the dashboard averages over. Add ?all=1 for the full history." },
    inventory: { title: "Inventory", headers: ["Item", "Category", "Office", "In stock", "Reorder at", "Low"], lowStockBadge: "Low" },
    restockRequests: { title: "Restock requests", headers: ["Date", "Item", "Quantity", "Office", "Status"] },
  },
  features: {
    title: "Feature settings", subtitle: "Database-controlled public and payment capabilities. Scheduled windows are evaluated on every server request.",
    enabled: "Enabled", disabled: "Disabled", startsAt: "Starts at", endsAt: "Ends at",
    disabledMessage: "Disabled-state message", fallbackCtaLabel: "Fallback CTA label", fallbackCtaUrl: "Fallback CTA URL",
    save: "Save", saved: "Saved", lastChanged: "Last changed", confirmToggle: "Confirm {action} {name}?", actionEnable: "enabling", actionDisable: "disabling",
  },
};

const nl: AdminCopy = {
  language: "Taal",
  shell: {
    operations: "Beheer",
    signOut: "Uitloggen",
    nav: {
      dashboard: "Dashboard", kpiBaseline: "KPI-basislijn", teamProfiles: "Teamprofielen", offices: "Vestigingen",
      assessments: "Beoordelingen", customers: "Klanten", properties: "Woningen", subscriptions: "Abonnementen",
      pauseRequests: "Pauzeverzoeken", deepCleanRequests: "Verzoeken voor grondige schoonmaak", acUnits: "Airco's", invoices: "Facturen", features: "Functie-instellingen", auditLog: "Auditlogboek", assistant: "Assistent",
    },
  },
  common: {
    refresh: "Vernieuwen", search: "Zoeken", allStatuses: "Alle statussen", noRecords: "Geen gegevens.",
    notAuthorized: "Uw sessie is niet geautoriseerd.", dataUnavailable: "Gegevens zijn niet beschikbaar.", actionFailed: "Actie mislukt",
  },
  assessments: {
    title: "Woningbeoordelingen", subtitleSuffix: "aanvragen · goedkeuringsworkflow",
    searchPlaceholder: "Zoek referentie, klant, stad of adres",
    statusLabels: { draft: "Concept", submitted: "Ingediend", under_review: "In beoordeling", contacted: "Gecontacteerd", assessment_scheduled: "Beoordeling gepland", assessment_completed: "Beoordeling voltooid", additional_information_required: "Informatie vereist", approved: "Goedgekeurd", rejected: "Afgewezen", cancelled: "Geannuleerd", expired: "Verlopen", awaiting_payment: "Wacht op betaling", assessment: "Legacy-beoordeling", pending_review: "Wacht op beoordeling", subscription_active: "Abonnement actief", paused: "Gepauzeerd" },
    columns: { reference: "Referentie", customer: "Klant", property: "Woning", submitted: "Ingediend", status: "Status", nextAction: "Volgende actie" },
    actions: { startReview: "Beoordeling starten", contacted: "Gecontacteerd", schedule: "Plannen", requestInfo: "Informatie opvragen", complete: "Voltooien", approve: "Goedkeuren en voorstel aanmaken", reject: "Afwijzen", assign: "Toewijzen" },
    prompts: { notes: "Notities of reden voor de klant", scheduleDate: "Datum en tijd beoordeling (JJJJ-MM-DD UU:mm)", cleanerId: "Medewerkernummer of UUID" },
    noMatch: "Geen beoordelingen komen overeen met deze weergave.",
  },
  pauseRequests: {
    title: "Abonnementspauzeverzoeken", subtitleSuffix: "verzoeken",
    searchPlaceholder: "Zoek klant, e-mail of reden",
    statusLabels: { submitted: "Ingediend", under_review: "In beoordeling", approved: "Goedgekeurd", rejected: "Afgewezen", cancelled: "Geannuleerd", active: "Gepauzeerd", completed: "Voltooid" },
    columns: { customer: "Klant", reason: "Reden", requested: "Aangevraagd", approved: "Goedgekeurd", status: "Status", nextAction: "Volgende actie" },
    actions: { startReview: "Beoordeling starten", approve: "Goedkeuren", reject: "Afwijzen", resumeEarly: "Vroegtijdig hervatten" },
    prompts: { notes: "Notities (zichtbaar voor de klant bij goedkeuren/afwijzen)", approvedStart: "Goedgekeurde startdatum (JJJJ-MM-DD)", approvedEnd: "Goedgekeurde einddatum (JJJJ-MM-DD)" },
    noMatch: "Geen pauzeverzoeken komen overeen met deze weergave.",
  },
  deepCleanRequests: {
    title: "Verzoeken voor grondige schoonmaak", subtitleSuffix: "verzoeken", searchPlaceholder: "Zoek klant of e-mail",
    statusLabels: { submitted:"Ingediend", under_review:"In beoordeling", approved:"Goedgekeurd", scheduled:"Ingepland", completed:"Voltooid", rejected:"Afgewezen", cancelled:"Geannuleerd" },
    columns: { customer:"Klant", date:"Gewenste datum", price:"Prijs", status:"Status", nextAction:"Volgende actie" },
    actions: { startReview:"Beoordeling starten", approve:"Goedkeuren", reject:"Afwijzen", complete:"Markeer als voltooid" },
    prompts: { notes:"Notities (zichtbaar voor de klant bij goedkeuren/afwijzen)" },
    freeLabel: "Gratis",
    noMatch: "Geen verzoeken voor grondige schoonmaak komen overeen met deze weergave.",
  },
  acUnits: en.acUnits,
  invoicesAdmin: {
    title: "Facturen", subtitleSuffix: "facturen",
    searchPlaceholder: "Zoek op referentie of klant",
    statusLabels: { draft: "Concept", open: "Open", paid: "Betaald", overdue: "Achterstallig", void: "Nietig", refunded: "Terugbetaald", partially_refunded: "Deels terugbetaald", uncollectible: "Oninbaar", included_in_settlement: "Opgenomen in afrekening" },
    collectionStageLabels: { first_notice: "Eerste herinnering verstuurd", second_notice: "Laatste herinnering verstuurd", seriously_overdue: "Ernstig achterstallig", escalation_eligible: "Escalatie mogelijk" },
    noStageLabel: "Geen",
    finalSettlementLabel: "Eindafrekening",
    columns: { reference: "Referentie", customer: "Klant", total: "Totaal", outstanding: "Openstaand", status: "Status", collectionStage: "Incassofase", failedAttempts: "Mislukte pogingen", nextAction: "Volgende actie" },
    actions: { resendNotice: "Melding opnieuw versturen", generateReplacementLink: "Vervangende link genereren", viewInvoice: "Factuur bekijken" },
    noMatch: "Geen facturen komen overeen met deze weergave.",
  },
  tables: {
    auditLog: { title: "Auditlogboek", headers: ["Tijd", "Actor", "Actie", "Bron", "Identificatie"] },
    customers: { title: "Klanten", headers: ["Klant", "E-mail", "Status", "Aangemaakt", "Laatste login", "Acties"] },
    properties: { title: "Woningen", headers: ["Adres", "Stad", "Klant", "Type", "Grootte"] },
    subscriptions: { title: "Abonnementen", headers: ["Klant", "Status", "Frequentie", "Facturering", "Duur", "Bedrag", "Opzegging", "Acties"] },
    complaints: { title: "Klachten", headers: ["Datum", "Klant", "Categorie", "Vestiging", "Status", "Terugkerend", "Opgelost"], recurringYes: "Ja" },
    employeesWorking: { title: "Medewerkers aan het werk", headers: ["Medewerker", "Nummer", "Vestiging", "Status", "Gem. schoonmaak", "Gem. reistijd", "Bezoeken", "Sinds"], footnote: "Aan het werk betekent werkend of onderweg, gelijk aan de tegel op het dashboard. Gemiddelden komen uit de afgeronde bezoeken van de afgelopen 30 dagen." },
    liveOperations: { title: "Live operaties", headers: ["Medewerker", "Nummer", "Vestiging", "Status", "Huidige klant", "Adres", "Verwacht einde", "Volgende opdracht", "Bijgewerkt"], showing: "Toont status:", footnote: "Actuele personeelsstatus, dezelfde records als op het Live operaties-bord. Standaard zonder klaar, ziek en offline: zij staan wel op de lijst maar zijn niet op een opdracht. Gebruik ?status=all om ze mee te nemen." },
    visits: { title: "Servicebezoeken", headers: ["Datum", "Klant", "Medewerker", "Vestiging", "Status", "Schoonmaak", "Reistijd", "Beoordeling", "Herbezoek"], revisitYes: "Ja" },
    inspections: { title: "Kwaliteitsinspecties", headers: ["Datum", "Klant", "Inspecteur", "Score", "In één keer goed", "Notities"], ftrYes: "Ja", ftrNo: "Nee", footnote: "Toont de laatste 30 dagen, dezelfde periode als het dashboard. Gebruik ?all=1 voor de volledige historie." },
    inventory: { title: "Voorraad", headers: ["Artikel", "Categorie", "Vestiging", "Op voorraad", "Bestelpunt", "Laag"], lowStockBadge: "Laag" },
    restockRequests: { title: "Bestelaanvragen", headers: ["Datum", "Artikel", "Aantal", "Vestiging", "Status"] },
  },
  features: {
    title: "Functie-instellingen", subtitle: "Database-gestuurde publieke en betalingsfuncties. Geplande periodes worden bij elk serververzoek geëvalueerd.",
    enabled: "Ingeschakeld", disabled: "Uitgeschakeld", startsAt: "Start op", endsAt: "Eindigt op",
    disabledMessage: "Bericht bij uitgeschakelde status", fallbackCtaLabel: "Fallback CTA-label", fallbackCtaUrl: "Fallback CTA-URL",
    save: "Opslaan", saved: "Opgeslagen", lastChanged: "Laatst gewijzigd", confirmToggle: "Bevestig {action} van {name}?", actionEnable: "het inschakelen", actionDisable: "het uitschakelen",
  },
};

const fr: AdminCopy = {
  language: "Langue",
  shell: {
    operations: "Opérations",
    signOut: "Déconnexion",
    nav: {
      dashboard: "Tableau de bord", kpiBaseline: "Indicateurs clés", teamProfiles: "Profils d'équipe", offices: "Agences",
      assessments: "Évaluations", customers: "Clients", properties: "Propriétés", subscriptions: "Abonnements",
      pauseRequests: "Demandes de pause", deepCleanRequests: "Demandes de nettoyage en profondeur", acUnits: "Climatiseurs", invoices: "Factures", features: "Paramètres des fonctionnalités", auditLog: "Journal d’audit", assistant: "Assistant",
    },
  },
  common: {
    refresh: "Actualiser", search: "Rechercher", allStatuses: "Tous les statuts", noRecords: "Aucune donnée.",
    notAuthorized: "Votre session n’est pas autorisée.", dataUnavailable: "Les données ne sont pas disponibles.", actionFailed: "Échec de l’action",
  },
  assessments: {
    title: "Évaluations du domicile", subtitleSuffix: "demandes · workflow soumis à approbation",
    searchPlaceholder: "Rechercher une référence, un client, une ville ou une adresse",
    statusLabels: { draft: "Brouillon", submitted: "Soumise", under_review: "En cours d’examen", contacted: "Contacté", assessment_scheduled: "Évaluation programmée", assessment_completed: "Évaluation terminée", additional_information_required: "Informations requises", approved: "Approuvée", rejected: "Refusée", cancelled: "Annulée", expired: "Expirée", awaiting_payment: "En attente de paiement", assessment: "Évaluation héritée", pending_review: "En attente d’examen", subscription_active: "Abonnement actif", paused: "En pause" },
    columns: { reference: "Référence", customer: "Client", property: "Propriété", submitted: "Soumise", status: "Statut", nextAction: "Action suivante" },
    actions: { startReview: "Démarrer l’examen", contacted: "Contacté", schedule: "Planifier", requestInfo: "Demander des informations", complete: "Terminer", approve: "Approuver et créer une proposition", reject: "Refuser", assign: "Assigner" },
    prompts: { notes: "Notes ou motif visible du client", scheduleDate: "Date et heure de l’évaluation (AAAA-MM-JJ HH:mm)", cleanerId: "Numéro d’employé ou UUID" },
    noMatch: "Aucune évaluation ne correspond à cette vue.",
  },
  pauseRequests: {
    title: "Demandes de pause d’abonnement", subtitleSuffix: "demandes",
    searchPlaceholder: "Rechercher un client, un e-mail ou un motif",
    statusLabels: { submitted: "Soumise", under_review: "En cours d’examen", approved: "Approuvée", rejected: "Refusée", cancelled: "Annulée", active: "En pause", completed: "Terminée" },
    columns: { customer: "Client", reason: "Motif", requested: "Demandé", approved: "Approuvé", status: "Statut", nextAction: "Action suivante" },
    actions: { startReview: "Démarrer l’examen", approve: "Approuver", reject: "Refuser", resumeEarly: "Reprendre plus tôt" },
    prompts: { notes: "Notes (visibles du client en cas d’approbation/refus)", approvedStart: "Date de début approuvée (AAAA-MM-JJ)", approvedEnd: "Date de fin approuvée (AAAA-MM-JJ)" },
    noMatch: "Aucune demande de pause ne correspond à cette vue.",
  },
  deepCleanRequests: {
    title: "Demandes de nettoyage en profondeur", subtitleSuffix: "demandes", searchPlaceholder: "Rechercher un client ou un e-mail",
    statusLabels: { submitted:"Soumise", under_review:"En cours d’examen", approved:"Approuvée", scheduled:"Planifiée", completed:"Terminée", rejected:"Refusée", cancelled:"Annulée" },
    columns: { customer:"Client", date:"Date demandée", price:"Prix", status:"Statut", nextAction:"Action suivante" },
    actions: { startReview:"Démarrer l’examen", approve:"Approuver", reject:"Refuser", complete:"Marquer comme terminée" },
    prompts: { notes:"Notes (visibles du client en cas d’approbation/refus)" },
    freeLabel: "Gratuit",
    noMatch: "Aucune demande de nettoyage en profondeur ne correspond à cette vue.",
  },
  acUnits: en.acUnits,
  invoicesAdmin: {
    title: "Factures", subtitleSuffix: "factures",
    searchPlaceholder: "Rechercher par référence ou client",
    statusLabels: { draft: "Brouillon", open: "Ouverte", paid: "Payée", overdue: "En retard", void: "Annulée", refunded: "Remboursée", partially_refunded: "Partiellement remboursée", uncollectible: "Irrécouvrable", included_in_settlement: "Incluse dans le décompte" },
    collectionStageLabels: { first_notice: "Premier avis envoyé", second_notice: "Dernier avis envoyé", seriously_overdue: "Fortement en retard", escalation_eligible: "Éligible à l'escalade" },
    noStageLabel: "Aucun",
    finalSettlementLabel: "Décompte final",
    columns: { reference: "Référence", customer: "Client", total: "Total", outstanding: "Solde dû", status: "Statut", collectionStage: "Étape de recouvrement", failedAttempts: "Tentatives échouées", nextAction: "Action suivante" },
    actions: { resendNotice: "Renvoyer l'avis", generateReplacementLink: "Générer un lien de remplacement", viewInvoice: "Voir la facture" },
    noMatch: "Aucune facture ne correspond à cette vue.",
  },
  tables: {
    auditLog: { title: "Journal d’audit", headers: ["Heure", "Auteur", "Action", "Ressource", "Identifiant"] },
    customers: { title: "Clients", headers: ["Client", "E-mail", "Statut", "Créé le", "Dernière connexion", "Actions"] },
    properties: { title: "Propriétés", headers: ["Adresse", "Ville", "Client", "Type", "Taille"] },
    subscriptions: { title: "Abonnements", headers: ["Client", "Statut", "Fréquence", "Facturation", "Durée", "Montant", "Résiliation", "Actions"] },
    complaints: { title: "Réclamations", headers: ["Date", "Client", "Catégorie", "Agence", "Statut", "Récurrent", "Résolu"], recurringYes: "Oui" },
    employeesWorking: { title: "Employés au travail", headers: ["Employé", "Numéro", "Agence", "Statut", "Nettoyage moy.", "Trajet moy.", "Visites", "Depuis"], footnote: "Au travail signifie en intervention ou en trajet, comme sur la tuile du tableau de bord. Les moyennes portent sur les visites terminées des 30 derniers jours." },
    liveOperations: { title: "Opérations en direct", headers: ["Employé", "Numéro", "Agence", "Statut", "Client actuel", "Adresse", "Fin prévue", "Prochaine mission", "Mis à jour"], showing: "Statut affiché :", footnote: "Statut du personnel en direct, les mêmes enregistrements que le tableau Opérations en direct. Par défaut hors terminé, malade et hors ligne : ils figurent au planning mais ne sont pas en mission. Ajoutez ?status=all pour les inclure." },
    visits: { title: "Visites de service", headers: ["Date", "Client", "Employé", "Agence", "Statut", "Nettoyage", "Trajet", "Note", "Revisite"], revisitYes: "Oui" },
    inspections: { title: "Inspections qualité", headers: ["Date", "Client", "Inspecteur", "Score", "Bon du premier coup", "Notes"], ftrYes: "Oui", ftrNo: "Non", footnote: "Affiche les 30 derniers jours, la période moyennée par le tableau de bord. Ajoutez ?all=1 pour tout l'historique." },
    inventory: { title: "Stock", headers: ["Article", "Catégorie", "Agence", "En stock", "Seuil", "Bas"], lowStockBadge: "Bas" },
    restockRequests: { title: "Demandes de réapprovisionnement", headers: ["Date", "Article", "Quantité", "Agence", "Statut"] },
  },
  features: {
    title: "Paramètres des fonctionnalités", subtitle: "Fonctionnalités publiques et de paiement pilotées par la base de données. Les fenêtres planifiées sont évaluées à chaque requête serveur.",
    enabled: "Activé", disabled: "Désactivé", startsAt: "Débute le", endsAt: "Se termine le",
    disabledMessage: "Message en état désactivé", fallbackCtaLabel: "Libellé du CTA de secours", fallbackCtaUrl: "URL du CTA de secours",
    save: "Enregistrer", saved: "Enregistré", lastChanged: "Dernière modification", confirmToggle: "Confirmer {action} de {name} ?", actionEnable: "l’activation", actionDisable: "la désactivation",
  },
};

const ar: AdminCopy = {
  language: "اللغة",
  shell: {
    operations: "العمليات",
    signOut: "تسجيل الخروج",
    nav: {
      dashboard: "لوحة التحكم", kpiBaseline: "مؤشرات الأداء الأساسية", teamProfiles: "ملفات الفريق", offices: "المكاتب",
      assessments: "التقييمات", customers: "العملاء", properties: "العقارات", subscriptions: "الاشتراكات",
      pauseRequests: "طلبات الإيقاف المؤقت", deepCleanRequests: "طلبات التنظيف العميق", acUnits: "وحدات التكييف", invoices: "الفواتير", features: "إعدادات الميزات", auditLog: "سجل التدقيق", assistant: "المساعد",
    },
  },
  common: {
    refresh: "تحديث", search: "بحث", allStatuses: "جميع الحالات", noRecords: "لا توجد سجلات.",
    notAuthorized: "جلستك غير مصرح بها.", dataUnavailable: "البيانات غير متاحة.", actionFailed: "فشل الإجراء",
  },
  assessments: {
    title: "تقييمات المنازل", subtitleSuffix: "طلبات · سير عمل يخضع للموافقة",
    searchPlaceholder: "ابحث بالمرجع أو العميل أو المدينة أو العنوان",
    statusLabels: { draft: "مسودة", submitted: "تم الإرسال", under_review: "قيد المراجعة", contacted: "تم التواصل", assessment_scheduled: "تم جدولة التقييم", assessment_completed: "اكتمل التقييم", additional_information_required: "مطلوب معلومات إضافية", approved: "موافق عليه", rejected: "مرفوض", cancelled: "ملغى", expired: "منتهي الصلاحية", awaiting_payment: "بانتظار الدفع", assessment: "تقييم قديم", pending_review: "بانتظار المراجعة", subscription_active: "الاشتراك نشط", paused: "موقف مؤقتاً" },
    columns: { reference: "المرجع", customer: "العميل", property: "العقار", submitted: "تاريخ الإرسال", status: "الحالة", nextAction: "الإجراء التالي" },
    actions: { startReview: "بدء المراجعة", contacted: "تم التواصل", schedule: "جدولة", requestInfo: "طلب معلومات", complete: "إكمال", approve: "الموافقة وإنشاء مقترح", reject: "رفض", assign: "تعيين" },
    prompts: { notes: "ملاحظات أو سبب ظاهر للعميل", scheduleDate: "تاريخ ووقت التقييم (YYYY-MM-DD HH:mm)", cleanerId: "رقم الموظف أو UUID" },
    noMatch: "لا توجد تقييمات تطابق هذا العرض.",
  },
  pauseRequests: {
    title: "طلبات إيقاف الاشتراك مؤقتاً", subtitleSuffix: "طلبات",
    searchPlaceholder: "ابحث بالعميل أو البريد الإلكتروني أو السبب",
    statusLabels: { submitted: "تم الإرسال", under_review: "قيد المراجعة", approved: "موافق عليه", rejected: "مرفوض", cancelled: "ملغى", active: "موقف مؤقتاً", completed: "مكتمل" },
    columns: { customer: "العميل", reason: "السبب", requested: "المطلوب", approved: "الموافق عليه", status: "الحالة", nextAction: "الإجراء التالي" },
    actions: { startReview: "بدء المراجعة", approve: "موافقة", reject: "رفض", resumeEarly: "استئناف مبكر" },
    prompts: { notes: "ملاحظات (تظهر للعميل عند الموافقة/الرفض)", approvedStart: "تاريخ البدء الموافق عليه (YYYY-MM-DD)", approvedEnd: "تاريخ الانتهاء الموافق عليه (YYYY-MM-DD)" },
    noMatch: "لا توجد طلبات إيقاف مؤقت تطابق هذا العرض.",
  },
  deepCleanRequests: {
    title: "طلبات التنظيف العميق", subtitleSuffix: "طلبات", searchPlaceholder: "ابحث بالعميل أو البريد الإلكتروني",
    statusLabels: { submitted:"تم الإرسال", under_review:"قيد المراجعة", approved:"موافق عليه", scheduled:"مجدول", completed:"مكتمل", rejected:"مرفوض", cancelled:"ملغى" },
    columns: { customer:"العميل", date:"التاريخ المطلوب", price:"السعر", status:"الحالة", nextAction:"الإجراء التالي" },
    actions: { startReview:"بدء المراجعة", approve:"موافقة", reject:"رفض", complete:"وضع علامة مكتمل" },
    prompts: { notes:"ملاحظات (تظهر للعميل عند الموافقة/الرفض)" },
    freeLabel: "مجاني",
    noMatch: "لا توجد طلبات تنظيف عميق تطابق هذا العرض.",
  },
  acUnits: en.acUnits,
  invoicesAdmin: {
    title: "الفواتير", subtitleSuffix: "فواتير",
    searchPlaceholder: "البحث بالمرجع أو العميل",
    statusLabels: { draft: "مسودة", open: "مفتوحة", paid: "مدفوعة", overdue: "متأخرة", void: "ملغاة", refunded: "مستردة", partially_refunded: "مستردة جزئياً", uncollectible: "غير قابلة للتحصيل", included_in_settlement: "ضمن التسوية" },
    collectionStageLabels: { first_notice: "تم إرسال الإشعار الأول", second_notice: "تم إرسال الإشعار الأخير", seriously_overdue: "متأخرة بشدة", escalation_eligible: "مؤهلة للتصعيد" },
    noStageLabel: "لا شيء",
    finalSettlementLabel: "التسوية النهائية",
    columns: { reference: "المرجع", customer: "العميل", total: "الإجمالي", outstanding: "المبلغ المستحق", status: "الحالة", collectionStage: "مرحلة التحصيل", failedAttempts: "المحاولات الفاشلة", nextAction: "الإجراء التالي" },
    actions: { resendNotice: "إعادة إرسال الإشعار", generateReplacementLink: "إنشاء رابط بديل", viewInvoice: "عرض الفاتورة" },
    noMatch: "لا توجد فواتير تطابق هذا العرض.",
  },
  tables: {
    auditLog: { title: "سجل التدقيق", headers: ["الوقت", "الجهة الفاعلة", "الإجراء", "المورد", "المعرّف"] },
    customers: { title: "العملاء", headers: ["العميل", "البريد الإلكتروني", "الحالة", "تاريخ الإنشاء", "آخر تسجيل دخول", "الإجراءات"] },
    properties: { title: "العقارات", headers: ["العنوان", "المدينة", "العميل", "النوع", "الحجم"] },
    subscriptions: { title: "الاشتراكات", headers: ["العميل", "الحالة", "التكرار", "الفوترة", "المدة", "المبلغ", "الإلغاء", "الإجراءات"] },
    complaints: { title: "الشكاوى", headers: ["التاريخ", "العميل", "الفئة", "المكتب", "الحالة", "متكرر", "تم الحل"], recurringYes: "نعم" },
    employeesWorking: { title: "الموظفون العاملون", headers: ["الموظف", "الرقم", "المكتب", "الحالة", "متوسط التنظيف", "متوسط التنقل", "الزيارات", "منذ"], footnote: "العمل يشمل التنفيذ والتنقل، مطابقًا لبطاقة لوحة المعلومات. المتوسطات محسوبة من الزيارات المكتملة خلال آخر 30 يومًا." },
    liveOperations: { title: "العمليات المباشرة", headers: ["الموظف", "الرقم", "المكتب", "الحالة", "العميل الحالي", "العنوان", "الانتهاء المتوقع", "المهمة التالية", "آخر تحديث"], showing: "الحالة المعروضة:", footnote: "الحالة المباشرة للموظفين، وهي نفس السجلات التي تعرضها لوحة العمليات المباشرة. تستثني افتراضيًا: منتهٍ ومريض وغير متصل، فهم ضمن الجدول لكن ليسوا في مهمة. أضف ‎?status=all‎ لتضمينهم." },
    visits: { title: "زيارات الخدمة", headers: ["التاريخ", "العميل", "الموظف", "المكتب", "الحالة", "التنظيف", "التنقل", "التقييم", "إعادة زيارة"], revisitYes: "نعم" },
    inspections: { title: "عمليات فحص الجودة", headers: ["التاريخ", "العميل", "المفتش", "الدرجة", "صحيح من أول مرة", "ملاحظات"], ftrYes: "نعم", ftrNo: "لا", footnote: "يعرض آخر 30 يومًا، وهي الفترة التي تحسب عليها لوحة المعلومات المتوسط. أضف ‎?all=1‎ لكل السجل." },
    inventory: { title: "المخزون", headers: ["الصنف", "الفئة", "المكتب", "المتوفر", "حد إعادة الطلب", "منخفض"], lowStockBadge: "منخفض" },
    restockRequests: { title: "طلبات إعادة التزويد", headers: ["التاريخ", "الصنف", "الكمية", "المكتب", "الحالة"] },
  },
  features: {
    title: "إعدادات الميزات", subtitle: "ميزات عامة وميزات دفع تُدار من قاعدة البيانات. تُقيَّم الفترات المجدولة مع كل طلب للخادم.",
    enabled: "مفعّل", disabled: "معطّل", startsAt: "يبدأ في", endsAt: "ينتهي في",
    disabledMessage: "رسالة حالة التعطيل", fallbackCtaLabel: "تسمية زر الإجراء البديل", fallbackCtaUrl: "رابط زر الإجراء البديل",
    save: "حفظ", saved: "تم الحفظ", lastChanged: "آخر تعديل", confirmToggle: "تأكيد {action} لـ{name}؟", actionEnable: "تفعيل", actionDisable: "تعطيل",
  },
};

const es: AdminCopy = {
  language: "Idioma",
  shell: {
    operations: "Operaciones",
    signOut: "Cerrar sesión",
    nav: {
      dashboard: "Panel", kpiBaseline: "Indicadores clave", teamProfiles: "Perfiles de equipo", offices: "Oficinas",
      assessments: "Evaluaciones", customers: "Clientes", properties: "Propiedades", subscriptions: "Suscripciones",
      pauseRequests: "Solicitudes de pausa", deepCleanRequests: "Solicitudes de limpieza profunda", acUnits: "Aires acondicionados", invoices: "Facturas", features: "Configuración de funciones", auditLog: "Registro de auditoría", assistant: "Asistente",
    },
  },
  common: {
    refresh: "Actualizar", search: "Buscar", allStatuses: "Todos los estados", noRecords: "Sin datos.",
    notAuthorized: "Tu sesión no está autorizada.", dataUnavailable: "Los datos no están disponibles.", actionFailed: "La acción falló",
  },
  assessments: {
    title: "Evaluaciones del hogar", subtitleSuffix: "solicitudes · flujo sujeto a aprobación",
    searchPlaceholder: "Buscar referencia, cliente, ciudad o dirección",
    statusLabels: { draft: "Borrador", submitted: "Enviada", under_review: "En revisión", contacted: "Contactado", assessment_scheduled: "Evaluación programada", assessment_completed: "Evaluación completada", additional_information_required: "Información requerida", approved: "Aprobada", rejected: "Rechazada", cancelled: "Cancelada", expired: "Caducada", awaiting_payment: "Esperando pago", assessment: "Evaluación heredada", pending_review: "Pendiente de revisión", subscription_active: "Suscripción activa", paused: "Pausada" },
    columns: { reference: "Referencia", customer: "Cliente", property: "Propiedad", submitted: "Enviada", status: "Estado", nextAction: "Próxima acción" },
    actions: { startReview: "Iniciar revisión", contacted: "Contactado", schedule: "Programar", requestInfo: "Solicitar información", complete: "Completar", approve: "Aprobar y crear propuesta", reject: "Rechazar", assign: "Asignar" },
    prompts: { notes: "Notas o motivo visible para el cliente", scheduleDate: "Fecha y hora de la evaluación (AAAA-MM-DD HH:mm)", cleanerId: "Número de empleado o UUID" },
    noMatch: "Ninguna evaluación coincide con esta vista.",
  },
  pauseRequests: {
    title: "Solicitudes de pausa de suscripción", subtitleSuffix: "solicitudes",
    searchPlaceholder: "Buscar cliente, correo o motivo",
    statusLabels: { submitted: "Enviada", under_review: "En revisión", approved: "Aprobada", rejected: "Rechazada", cancelled: "Cancelada", active: "Pausada", completed: "Completada" },
    columns: { customer: "Cliente", reason: "Motivo", requested: "Solicitado", approved: "Aprobado", status: "Estado", nextAction: "Próxima acción" },
    actions: { startReview: "Iniciar revisión", approve: "Aprobar", reject: "Rechazar", resumeEarly: "Reanudar antes" },
    prompts: { notes: "Notas (visibles para el cliente al aprobar/rechazar)", approvedStart: "Fecha de inicio aprobada (AAAA-MM-DD)", approvedEnd: "Fecha de fin aprobada (AAAA-MM-DD)" },
    noMatch: "Ninguna solicitud de pausa coincide con esta vista.",
  },
  deepCleanRequests: {
    title: "Solicitudes de limpieza profunda", subtitleSuffix: "solicitudes", searchPlaceholder: "Buscar cliente o correo",
    statusLabels: { submitted:"Enviada", under_review:"En revisión", approved:"Aprobada", scheduled:"Programada", completed:"Completada", rejected:"Rechazada", cancelled:"Cancelada" },
    columns: { customer:"Cliente", date:"Fecha solicitada", price:"Precio", status:"Estado", nextAction:"Próxima acción" },
    actions: { startReview:"Iniciar revisión", approve:"Aprobar", reject:"Rechazar", complete:"Marcar como completada" },
    prompts: { notes:"Notas (visibles para el cliente al aprobar/rechazar)" },
    freeLabel: "Gratis",
    noMatch: "Ninguna solicitud de limpieza profunda coincide con esta vista.",
  },
  acUnits: en.acUnits,
  invoicesAdmin: {
    title: "Facturas", subtitleSuffix: "facturas",
    searchPlaceholder: "Buscar por referencia o cliente",
    statusLabels: { draft: "Borrador", open: "Abierta", paid: "Pagada", overdue: "Atrasada", void: "Anulada", refunded: "Reembolsada", partially_refunded: "Reembolsada parcialmente", uncollectible: "Incobrable", included_in_settlement: "Incluida en la liquidación" },
    collectionStageLabels: { first_notice: "Primer aviso enviado", second_notice: "Aviso final enviado", seriously_overdue: "Muy atrasada", escalation_eligible: "Elegible para escalamiento" },
    noStageLabel: "Ninguna",
    finalSettlementLabel: "Liquidación final",
    columns: { reference: "Referencia", customer: "Cliente", total: "Total", outstanding: "Pendiente", status: "Estado", collectionStage: "Etapa de cobro", failedAttempts: "Intentos fallidos", nextAction: "Próxima acción" },
    actions: { resendNotice: "Reenviar aviso", generateReplacementLink: "Generar enlace de reemplazo", viewInvoice: "Ver factura" },
    noMatch: "Ninguna factura coincide con esta vista.",
  },
  tables: {
    auditLog: { title: "Registro de auditoría", headers: ["Hora", "Actor", "Acción", "Recurso", "Identificador"] },
    customers: { title: "Clientes", headers: ["Cliente", "Correo", "Estado", "Creado", "Último acceso", "Acciones"] },
    properties: { title: "Propiedades", headers: ["Dirección", "Ciudad", "Cliente", "Tipo", "Tamaño"] },
    subscriptions: { title: "Suscripciones", headers: ["Cliente", "Estado", "Frecuencia", "Facturación", "Duración", "Importe", "Cancelación", "Acciones"] },
    complaints: { title: "Reclamaciones", headers: ["Fecha", "Cliente", "Categoría", "Oficina", "Estado", "Recurrente", "Resuelta"], recurringYes: "Sí" },
    employeesWorking: { title: "Empleados trabajando", headers: ["Empleado", "Número", "Oficina", "Estado", "Limpieza media", "Trayecto medio", "Visitas", "Desde"], footnote: "Trabajando incluye en servicio y en trayecto, igual que la tarjeta del panel. Las medias proceden de las visitas completadas en los últimos 30 días." },
    liveOperations: { title: "Operaciones en vivo", headers: ["Empleado", "Número", "Oficina", "Estado", "Cliente actual", "Dirección", "Fin previsto", "Siguiente trabajo", "Actualizado"], showing: "Estado mostrado:", footnote: "Estado del personal en vivo, los mismos registros que muestra el panel de Operaciones en vivo. Por defecto excluye terminado, enfermo y desconectado: están en la plantilla pero no en un trabajo. Añada ?status=all para incluirlos." },
    visits: { title: "Visitas de servicio", headers: ["Fecha", "Cliente", "Empleado", "Oficina", "Estado", "Limpieza", "Trayecto", "Valoración", "Revisita"], revisitYes: "Sí" },
    inspections: { title: "Inspecciones de calidad", headers: ["Fecha", "Cliente", "Inspector", "Puntuación", "Bien a la primera", "Notas"], ftrYes: "Sí", ftrNo: "No", footnote: "Muestra los últimos 30 días, el periodo que promedia el panel. Añada ?all=1 para el historial completo." },
    inventory: { title: "Inventario", headers: ["Artículo", "Categoría", "Oficina", "En stock", "Punto de pedido", "Bajo"], lowStockBadge: "Bajo" },
    restockRequests: { title: "Solicitudes de reposición", headers: ["Fecha", "Artículo", "Cantidad", "Oficina", "Estado"] },
  },
  features: {
    title: "Configuración de funciones", subtitle: "Funciones públicas y de pago controladas por la base de datos. Las ventanas programadas se evalúan en cada solicitud al servidor.",
    enabled: "Activada", disabled: "Desactivada", startsAt: "Comienza el", endsAt: "Termina el",
    disabledMessage: "Mensaje en estado desactivado", fallbackCtaLabel: "Etiqueta del CTA alternativo", fallbackCtaUrl: "URL del CTA alternativo",
    save: "Guardar", saved: "Guardado", lastChanged: "Última modificación", confirmToggle: "¿Confirmar {action} de {name}?", actionEnable: "la activación", actionDisable: "la desactivación",
  },
};

const de: AdminCopy = {
  language: "Sprache",
  shell: {
    operations: "Betrieb",
    signOut: "Abmelden",
    nav: {
      dashboard: "Übersicht", kpiBaseline: "KPI-Basislinie", teamProfiles: "Teamprofile", offices: "Niederlassungen",
      assessments: "Bewertungen", customers: "Kunden", properties: "Immobilien", subscriptions: "Abonnements",
      pauseRequests: "Pausenanträge", deepCleanRequests: "Grundreinigungsanfragen", acUnits: "Klimaanlagen", invoices: "Rechnungen", features: "Funktionseinstellungen", auditLog: "Prüfprotokoll", assistant: "Assistent",
    },
  },
  common: {
    refresh: "Aktualisieren", search: "Suchen", allStatuses: "Alle Status", noRecords: "Keine Daten.",
    notAuthorized: "Ihre Sitzung ist nicht autorisiert.", dataUnavailable: "Daten sind nicht verfügbar.", actionFailed: "Aktion fehlgeschlagen",
  },
  assessments: {
    title: "Hausbewertungen", subtitleSuffix: "Anträge · genehmigungspflichtiger Workflow",
    searchPlaceholder: "Referenz, Kunde, Stadt oder Adresse suchen",
    statusLabels: { draft: "Entwurf", submitted: "Eingereicht", under_review: "In Prüfung", contacted: "Kontaktiert", assessment_scheduled: "Bewertung geplant", assessment_completed: "Bewertung abgeschlossen", additional_information_required: "Informationen erforderlich", approved: "Genehmigt", rejected: "Abgelehnt", cancelled: "Storniert", expired: "Abgelaufen", awaiting_payment: "Zahlung ausstehend", assessment: "Alte Bewertung", pending_review: "Prüfung ausstehend", subscription_active: "Abonnement aktiv", paused: "Pausiert" },
    columns: { reference: "Referenz", customer: "Kunde", property: "Immobilie", submitted: "Eingereicht", status: "Status", nextAction: "Nächste Aktion" },
    actions: { startReview: "Prüfung starten", contacted: "Kontaktiert", schedule: "Planen", requestInfo: "Informationen anfordern", complete: "Abschließen", approve: "Genehmigen und Angebot erstellen", reject: "Ablehnen", assign: "Zuweisen" },
    prompts: { notes: "Notizen oder für den Kunden sichtbarer Grund", scheduleDate: "Datum und Uhrzeit der Bewertung (JJJJ-MM-TT HH:mm)", cleanerId: "Mitarbeiternummer oder UUID" },
    noMatch: "Keine Bewertungen entsprechen dieser Ansicht.",
  },
  pauseRequests: {
    title: "Abonnementpausenanträge", subtitleSuffix: "Anträge",
    searchPlaceholder: "Kunde, E-Mail oder Grund suchen",
    statusLabels: { submitted: "Eingereicht", under_review: "In Prüfung", approved: "Genehmigt", rejected: "Abgelehnt", cancelled: "Storniert", active: "Pausiert", completed: "Abgeschlossen" },
    columns: { customer: "Kunde", reason: "Grund", requested: "Beantragt", approved: "Genehmigt", status: "Status", nextAction: "Nächste Aktion" },
    actions: { startReview: "Prüfung starten", approve: "Genehmigen", reject: "Ablehnen", resumeEarly: "Vorzeitig fortsetzen" },
    prompts: { notes: "Notizen (bei Genehmigung/Ablehnung für den Kunden sichtbar)", approvedStart: "Genehmigtes Startdatum (JJJJ-MM-TT)", approvedEnd: "Genehmigtes Enddatum (JJJJ-MM-TT)" },
    noMatch: "Keine Pausenanträge entsprechen dieser Ansicht.",
  },
  deepCleanRequests: {
    title: "Grundreinigungsanfragen", subtitleSuffix: "Anfragen", searchPlaceholder: "Kunde oder E-Mail suchen",
    statusLabels: { submitted:"Eingereicht", under_review:"In Prüfung", approved:"Genehmigt", scheduled:"Geplant", completed:"Abgeschlossen", rejected:"Abgelehnt", cancelled:"Storniert" },
    columns: { customer:"Kunde", date:"Gewünschtes Datum", price:"Preis", status:"Status", nextAction:"Nächste Aktion" },
    actions: { startReview:"Prüfung starten", approve:"Genehmigen", reject:"Ablehnen", complete:"Als abgeschlossen markieren" },
    prompts: { notes:"Notizen (bei Genehmigung/Ablehnung für den Kunden sichtbar)" },
    freeLabel: "Kostenlos",
    noMatch: "Keine Grundreinigungsanfragen entsprechen dieser Ansicht.",
  },
  acUnits: en.acUnits,
  invoicesAdmin: {
    title: "Rechnungen", subtitleSuffix: "Rechnungen",
    searchPlaceholder: "Nach Referenz oder Kunde suchen",
    statusLabels: { draft: "Entwurf", open: "Offen", paid: "Bezahlt", overdue: "Überfällig", void: "Storniert", refunded: "Erstattet", partially_refunded: "Teilweise erstattet", uncollectible: "Uneinbringlich", included_in_settlement: "In Abrechnung enthalten" },
    collectionStageLabels: { first_notice: "Erste Mahnung gesendet", second_notice: "Letzte Mahnung gesendet", seriously_overdue: "Stark überfällig", escalation_eligible: "Eskalationsfähig" },
    noStageLabel: "Keine",
    finalSettlementLabel: "Endabrechnung",
    columns: { reference: "Referenz", customer: "Kunde", total: "Gesamt", outstanding: "Offener Betrag", status: "Status", collectionStage: "Mahnstufe", failedAttempts: "Fehlgeschlagene Versuche", nextAction: "Nächste Aktion" },
    actions: { resendNotice: "Mitteilung erneut senden", generateReplacementLink: "Ersatzlink generieren", viewInvoice: "Rechnung ansehen" },
    noMatch: "Keine Rechnungen entsprechen dieser Ansicht.",
  },
  tables: {
    auditLog: { title: "Prüfprotokoll", headers: ["Zeit", "Akteur", "Aktion", "Ressource", "Kennung"] },
    customers: { title: "Kunden", headers: ["Kunde", "E-Mail", "Status", "Erstellt", "Letzte Anmeldung", "Aktionen"] },
    properties: { title: "Immobilien", headers: ["Adresse", "Stadt", "Kunde", "Typ", "Größe"] },
    subscriptions: { title: "Abonnements", headers: ["Kunde", "Status", "Häufigkeit", "Abrechnung", "Dauer", "Betrag", "Kündigung", "Aktionen"] },
    complaints: { title: "Beschwerden", headers: ["Datum", "Kunde", "Kategorie", "Niederlassung", "Status", "Wiederkehrend", "Gelöst"], recurringYes: "Ja" },
    employeesWorking: { title: "Mitarbeitende im Einsatz", headers: ["Mitarbeiter", "Nummer", "Niederlassung", "Status", "Ø Reinigung", "Ø Fahrt", "Einsätze", "Seit"], footnote: "Im Einsatz umfasst arbeitend und unterwegs, wie die Kachel im Dashboard. Durchschnitte stammen aus den abgeschlossenen Einsätzen der letzten 30 Tage." },
    liveOperations: { title: "Live-Einsätze", headers: ["Mitarbeiter", "Nummer", "Niederlassung", "Status", "Aktueller Kunde", "Adresse", "Voraussichtliches Ende", "Nächster Einsatz", "Aktualisiert"], showing: "Angezeigter Status:", footnote: "Live-Status der Mitarbeitenden, dieselben Datensätze wie auf der Live-Einsatztafel. Standardmäßig ohne fertig, krank und offline: sie stehen im Dienstplan, sind aber nicht im Einsatz. Mit ?status=all einbeziehen." },
    visits: { title: "Serviceeinsätze", headers: ["Datum", "Kunde", "Mitarbeiter", "Niederlassung", "Status", "Reinigung", "Fahrt", "Bewertung", "Nachbesuch"], revisitYes: "Ja" },
    inspections: { title: "Qualitätsprüfungen", headers: ["Datum", "Kunde", "Prüfer", "Punktzahl", "Auf Anhieb richtig", "Notizen"], ftrYes: "Ja", ftrNo: "Nein", footnote: "Zeigt die letzten 30 Tage, den Zeitraum des Dashboard-Durchschnitts. Mit ?all=1 die vollständige Historie." },
    inventory: { title: "Bestand", headers: ["Artikel", "Kategorie", "Niederlassung", "Bestand", "Meldebestand", "Niedrig"], lowStockBadge: "Niedrig" },
    restockRequests: { title: "Nachbestellungen", headers: ["Datum", "Artikel", "Menge", "Niederlassung", "Status"] },
  },
  features: {
    title: "Funktionseinstellungen", subtitle: "Datenbankgesteuerte öffentliche Funktionen und Zahlungsfunktionen. Geplante Zeitfenster werden bei jeder Serveranfrage ausgewertet.",
    enabled: "Aktiviert", disabled: "Deaktiviert", startsAt: "Beginnt am", endsAt: "Endet am",
    disabledMessage: "Nachricht im deaktivierten Zustand", fallbackCtaLabel: "Fallback-CTA-Label", fallbackCtaUrl: "Fallback-CTA-URL",
    save: "Speichern", saved: "Gespeichert", lastChanged: "Zuletzt geändert", confirmToggle: "{action} von {name} bestätigen?", actionEnable: "Aktivieren", actionDisable: "Deaktivieren",
  },
};

const pt: AdminCopy = {
  language: "Idioma",
  shell: {
    operations: "Operações",
    signOut: "Terminar sessão",
    nav: {
      dashboard: "Painel", kpiBaseline: "Base de KPIs", teamProfiles: "Perfis de equipa", offices: "Escritórios",
      assessments: "Avaliações", customers: "Clientes", properties: "Propriedades", subscriptions: "Subscrições",
      pauseRequests: "Pedidos de pausa", deepCleanRequests: "Pedidos de limpeza profunda", acUnits: "Ar condicionado", invoices: "Faturas", features: "Definições de funcionalidades", auditLog: "Registo de auditoria", assistant: "Assistente",
    },
  },
  common: {
    refresh: "Atualizar", search: "Pesquisar", allStatuses: "Todos os estados", noRecords: "Sem registos.",
    notAuthorized: "A sua sessão não está autorizada.", dataUnavailable: "Os dados não estão disponíveis.", actionFailed: "A ação falhou",
  },
  assessments: {
    title: "Avaliações da casa", subtitleSuffix: "candidaturas · fluxo sujeito a aprovação",
    searchPlaceholder: "Pesquisar referência, cliente, cidade ou morada",
    statusLabels: { draft: "Rascunho", submitted: "Submetida", under_review: "Em análise", contacted: "Contactado", assessment_scheduled: "Avaliação agendada", assessment_completed: "Avaliação concluída", additional_information_required: "Informação necessária", approved: "Aprovada", rejected: "Rejeitada", cancelled: "Cancelada", expired: "Expirada", awaiting_payment: "A aguardar pagamento", assessment: "Avaliação legada", pending_review: "Pendente de análise", subscription_active: "Subscrição ativa", paused: "Pausada" },
    columns: { reference: "Referência", customer: "Cliente", property: "Propriedade", submitted: "Submetida", status: "Estado", nextAction: "Próxima ação" },
    actions: { startReview: "Iniciar análise", contacted: "Contactado", schedule: "Agendar", requestInfo: "Solicitar informação", complete: "Concluir", approve: "Aprovar e criar proposta", reject: "Rejeitar", assign: "Atribuir" },
    prompts: { notes: "Notas ou motivo visível para o cliente", scheduleDate: "Data e hora da avaliação (AAAA-MM-DD HH:mm)", cleanerId: "Número de funcionário ou UUID" },
    noMatch: "Nenhuma avaliação corresponde a esta vista.",
  },
  pauseRequests: {
    title: "Pedidos de pausa de subscrição", subtitleSuffix: "pedidos",
    searchPlaceholder: "Pesquisar cliente, e-mail ou motivo",
    statusLabels: { submitted: "Submetido", under_review: "Em análise", approved: "Aprovado", rejected: "Rejeitado", cancelled: "Cancelado", active: "Pausado", completed: "Concluído" },
    columns: { customer: "Cliente", reason: "Motivo", requested: "Solicitado", approved: "Aprovado", status: "Estado", nextAction: "Próxima ação" },
    actions: { startReview: "Iniciar análise", approve: "Aprovar", reject: "Rejeitar", resumeEarly: "Retomar antecipadamente" },
    prompts: { notes: "Notas (visíveis para o cliente ao aprovar/rejeitar)", approvedStart: "Data de início aprovada (AAAA-MM-DD)", approvedEnd: "Data de fim aprovada (AAAA-MM-DD)" },
    noMatch: "Nenhum pedido de pausa corresponde a esta vista.",
  },
  deepCleanRequests: {
    title: "Pedidos de limpeza profunda", subtitleSuffix: "pedidos", searchPlaceholder: "Pesquisar cliente ou e-mail",
    statusLabels: { submitted:"Submetido", under_review:"Em análise", approved:"Aprovado", scheduled:"Agendado", completed:"Concluído", rejected:"Rejeitado", cancelled:"Cancelado" },
    columns: { customer:"Cliente", date:"Data solicitada", price:"Preço", status:"Estado", nextAction:"Próxima ação" },
    actions: { startReview:"Iniciar análise", approve:"Aprovar", reject:"Rejeitar", complete:"Marcar como concluído" },
    prompts: { notes:"Notas (visíveis para o cliente ao aprovar/rejeitar)" },
    freeLabel: "Grátis",
    noMatch: "Nenhum pedido de limpeza profunda corresponde a esta vista.",
  },
  acUnits: en.acUnits,
  invoicesAdmin: {
    title: "Faturas", subtitleSuffix: "faturas",
    searchPlaceholder: "Pesquisar por referência ou cliente",
    statusLabels: { draft: "Rascunho", open: "Aberta", paid: "Paga", overdue: "Em atraso", void: "Anulada", refunded: "Reembolsada", partially_refunded: "Reembolsada parcialmente", uncollectible: "Incobrável", included_in_settlement: "Incluída no acerto" },
    collectionStageLabels: { first_notice: "Primeiro aviso enviado", second_notice: "Último aviso enviado", seriously_overdue: "Gravemente em atraso", escalation_eligible: "Elegível para escalonamento" },
    noStageLabel: "Nenhuma",
    finalSettlementLabel: "Acerto final",
    columns: { reference: "Referência", customer: "Cliente", total: "Total", outstanding: "Em dívida", status: "Estado", collectionStage: "Fase de cobrança", failedAttempts: "Tentativas falhadas", nextAction: "Próxima ação" },
    actions: { resendNotice: "Reenviar aviso", generateReplacementLink: "Gerar ligação de substituição", viewInvoice: "Ver fatura" },
    noMatch: "Nenhuma fatura corresponde a esta vista.",
  },
  tables: {
    auditLog: { title: "Registo de auditoria", headers: ["Hora", "Ator", "Ação", "Recurso", "Identificador"] },
    customers: { title: "Clientes", headers: ["Cliente", "E-mail", "Estado", "Criado", "Último início de sessão", "Ações"] },
    properties: { title: "Propriedades", headers: ["Morada", "Cidade", "Cliente", "Tipo", "Tamanho"] },
    subscriptions: { title: "Subscrições", headers: ["Cliente", "Estado", "Frequência", "Faturação", "Duração", "Montante", "Cancelamento", "Ações"] },
    complaints: { title: "Reclamações", headers: ["Data", "Cliente", "Categoria", "Escritório", "Estado", "Recorrente", "Resolvida"], recurringYes: "Sim" },
    employeesWorking: { title: "Funcionários a trabalhar", headers: ["Funcionário", "Número", "Escritório", "Estado", "Limpeza média", "Deslocação média", "Visitas", "Desde"], footnote: "A trabalhar inclui em serviço e em deslocação, tal como o cartão do painel. As médias vêm das visitas concluídas nos últimos 30 dias." },
    liveOperations: { title: "Operações ao vivo", headers: ["Funcionário", "Número", "Escritório", "Estado", "Cliente atual", "Morada", "Fim previsto", "Próximo trabalho", "Atualizado"], showing: "Estado apresentado:", footnote: "Estado da equipa ao vivo, os mesmos registos que o painel de Operações ao vivo mostra. Por omissão exclui terminado, doente e offline: constam da escala mas não estão em serviço. Use ?status=all para os incluir." },
    visits: { title: "Visitas de serviço", headers: ["Data", "Cliente", "Funcionário", "Escritório", "Estado", "Limpeza", "Deslocação", "Avaliação", "Revisita"], revisitYes: "Sim" },
    inspections: { title: "Inspeções de qualidade", headers: ["Data", "Cliente", "Inspetor", "Pontuação", "Certo à primeira", "Notas"], ftrYes: "Sim", ftrNo: "Não", footnote: "Mostra os últimos 30 dias, o período em que o painel calcula a média. Use ?all=1 para o histórico completo." },
    inventory: { title: "Inventário", headers: ["Artigo", "Categoria", "Escritório", "Em stock", "Ponto de encomenda", "Baixo"], lowStockBadge: "Baixo" },
    restockRequests: { title: "Pedidos de reposição", headers: ["Data", "Artigo", "Quantidade", "Escritório", "Estado"] },
  },
  features: {
    title: "Definições de funcionalidades", subtitle: "Funcionalidades públicas e de pagamento controladas pela base de dados. As janelas agendadas são avaliadas em cada pedido ao servidor.",
    enabled: "Ativada", disabled: "Desativada", startsAt: "Começa em", endsAt: "Termina em",
    disabledMessage: "Mensagem no estado desativado", fallbackCtaLabel: "Rótulo do CTA alternativo", fallbackCtaUrl: "URL do CTA alternativo",
    save: "Guardar", saved: "Guardado", lastChanged: "Última alteração", confirmToggle: "Confirmar {action} de {name}?", actionEnable: "a ativação", actionDisable: "a desativação",
  },
};

export const adminCopy: Record<Locale, AdminCopy> = { en, nl, fr, ar, es, de, pt };

import type { Locale } from "./config";

export type PortalCopy = {
  language: string;
  auth: {
    login: string; email: string; password: string; forgot: string; signIn: string;
    signingIn: string; invalid: string; resetTitle: string; resetIntro: string;
    sendReset: string; resetSent: string; newPassword: string; savePassword: string;
    passwordSaved: string; passwordTooShort: string; passwordWeak?: string; passwordSame?: string; resetLinkInvalid: string;
    passwordUpdateFailed: string; logout: string; createAccount: string; signupIntro: string;
    noAccount: string; haveAccount: string; continueGoogle: string; continueApple: string;
    redirecting: string; orEmail: string; oauthFailed: string; creatingAccount: string;
    passwordHint: string; signupFailed: string; checkEmailTitle: string; checkEmail: string;
    backToLogin: string; agreement: string; terms: string; and: string; privacy: string;
    registrationUnavailable: string;
  };
  nav: {
    overview: string; assessments: string; properties: string; subscriptions: string;
    invoices: string; payments: string; profile: string; support: string;
  };
  dashboard: {
    title: string; welcome: string; accountStatus: string; property: string;
    subscription: string; nextPayment: string; balance: string; latestInvoice: string;
    upcomingService: string; activity: string; empty: string; download: string;
    reference: string; submitted: string; status: string; address: string; frequency: string;
    amount: string; date: string; due: string; paid: string; contactSupport: string;
    access: string; services: string; acceptProposal: string; save: string; saved: string; subject: string; message: string;
    billing: string; annual: string; monthly: string; duration: string; months: string;
    pendingProposals: string; subscriptionDetails: string; activated: string;
    automaticRenewal: string; renewal: string;
    propertiesTotal: string; paused: string; subscriptionsSummary: string;
    nextMonthlyPayment: string; nextAnnualPayment: string; noPaymentScheduled: string;
    maintenanceService: string; additionalService: string; includedInSubscription: string;
    free: string; invoiceForThisMonth: string; noInvoiceThisMonth: string;
    outstandingInvoices: string; noOutstandingBalance: string; payNow: string; viewInvoices: string;
    automaticPaymentConsent: string; automaticPaymentSchedule: string;
    automaticPaymentServiceWindow: string; automaticPaymentSubmitting: string;
    automaticPaymentScheduled: string; automaticPaymentError: string;
  };
  pause: {
    eligibleNote: string; eligibleNoteInfo: string; requestButton: string; ineligibleMessage: string; usedMessage: string; pendingMessage: string;
    modalTitle: string; reasonLabel: string;
    reasons: { construction: string; major_renovation: string; property_damage: string; inaccessible: string; other: string };
    descriptionLabel: string; startLabel: string; endLabel: string; maxMonthsNote: string;
    submit: string; submitting: string; success: string; cancel: string;
    statusLabels: Record<string, string>;
    errors: Record<string, string>;
  };
  deepClean: {
    requestButton: string; freeBadge: string; usedMessage: string; usedOnMessage: string; pendingMessage: string;
    modalTitle: string; dateLabel: string; priceLabel: string; freePriceLabel: string; upsellNote: string;
    submit: string; submitting: string; success: string; redirecting: string; cancel: string;
    statusLabels: Record<string, string>;
    errors: Record<string, string>;
  };
  properties: {
    columnAddress: string; columnType: string;
    sizeLabel: string; airConditioningLabel: string; accessLabel: string;
    roomsLabel: string; kitchensLabel: string; livingSpacesLabel: string;
    outsideSpacesLabel: string; frequencyLabel: string; petsLabel: string; employeeIdLabel: string;
    assessmentIdLabel: string; submittedLabel: string; scheduledLabel: string;
    acceptedLabel: string; pendingLabel: string;
    noFindings: string; noneLabel: string; yesLabel: string; noLabel: string;
  };
  invoices: {
    monthlyStatementsTitle: string; annualInvoicesTitle: string; annualStatementsTitle: string;
    columnMonth: string; columnUnit: string; columnUnits: string; columnTotal: string;
    filterByUnit: string; allUnits: string;
    onHoldLabel: string; downloadStatement: string;
    noStatements: string; noAnnualInvoices: string; otherInvoicesTitle: string; noOtherInvoices: string;
    pauseNoticesTitle: string; downloadNotice: string; noPauseNotices: string;
    suspensionTitle: string; suspensionBody: string; payNow: string; suspensionNoLinkNote: string;
    finalSettlementBadge: string;
  };
  cancellation: {
    requestButton: string; modalTitle: string; loading: string;
    contractLabel: string; startDateLabel: string; originalEndDateLabel: string;
    currentMonthLabel: string; originalDiscountLabel: string;
    itemizedTitle: string; originalContractLabel: string; replacementMinimumTermLabel: string;
    completedContractPeriodLabel: string; amountAlreadyPaidLabel: string; recalculatedConsumedLabel: string;
    originalMonthlyPriceLabel: string; replacementMonthlyPriceLabel: string; perMonthLabel: string;
    termMonthsLabel: string; contractDatesLabel: string;
    discountCorrectionLabel: string; remainingMinimumLabel: string;
    outstandingInvoicesLabel: string; includedInvoicesLabel: string; paymentsAppliedLabel: string;
    additionalChargesLabel: string; deepCleanRecoveryLabel: string; creditsLabel: string; totalLabel: string;
    noChargeMessage: string; creditReviewMessage: string; disclosure: string;
    confirmButton: string; confirming: string; cancel: string;
    successNoSettlement: string; successWithSettlement: string; payNow: string;
    alreadyPendingMessage: string;
    disableRenewalButton: string; disablingRenewal: string; renewalDisabled: string;
    prepaidEndsMessage: string; prepaidNoRefundMessage: string;
    errors: Record<string, string>;
  };
};

const en: PortalCopy = {
  language: "Language",
  auth: { login:"Login",email:"Email address",password:"Password",forgot:"Forgot password?",signIn:"Sign in",signingIn:"Signing in…",invalid:"The email or password is incorrect.",resetTitle:"Reset your password",resetIntro:"Enter your email and we will send secure reset instructions.",sendReset:"Send reset link",resetSent:"If an account exists, reset instructions have been sent.",newPassword:"New password",savePassword:"Save new password",passwordSaved:"Your password has been updated.",passwordTooShort:"Use at least 12 characters.",passwordWeak:"Choose a stronger, unique password that has not appeared in a known data breach.",passwordSame:"Choose a password different from your current password.",resetLinkInvalid:"This reset link is invalid or expired. Request a new one.",passwordUpdateFailed:"The password could not be updated. Please try again.",logout:"Log out",createAccount:"Create account",signupIntro:"Choose the quickest way to create your secure Dar Tahara account.",noAccount:"New to Dar Tahara?",haveAccount:"Already have an account?",continueGoogle:"Continue with Google",continueApple:"Continue with Apple",redirecting:"Redirecting…",orEmail:"or use email",oauthFailed:"We could not continue with that provider. Please try again.",creatingAccount:"Creating account…",passwordHint:"Use at least 12 characters. A confirmation link will be sent to your email.",signupFailed:"We could not create the account. Please try again or sign in.",checkEmailTitle:"Check your email",checkEmail:"Open the confirmation link we sent you to verify your email and finish creating your account.",backToLogin:"Back to login",agreement:"By continuing, you agree to the",terms:"Terms",and:"and",privacy:"Privacy Policy",registrationUnavailable:"Account registration is temporarily unavailable. Please try again later." },
  nav: { overview:"Overview",assessments:"Assessments",properties:"Properties",subscriptions:"Subscriptions",invoices:"Invoices",payments:"Payments",profile:"Profile",support:"Support" },
  dashboard: { title:"My Account",welcome:"Welcome back",accountStatus:"Account status",property:"Property",subscription:"Subscription",nextPayment:"Next payment",balance:"Outstanding balance",latestInvoice:"Latest invoice",upcomingService:"Upcoming service",activity:"Recent activity",empty:"Nothing to show yet.",download:"Download",reference:"Reference",submitted:"Submitted",status:"Status",address:"Address",frequency:"Frequency",amount:"Amount",date:"Date",due:"Due",paid:"Paid",contactSupport:"Contact support",access:"Access",services:"Services",acceptProposal:"Authorize and schedule payment",save:"Save",saved:"Saved",subject:"Subject",message:"Message",billing:"Billing",annual:"Annual",monthly:"Monthly",duration:"Duration",months:"months",pendingProposals:"Pending proposals",subscriptionDetails:"Subscription details",activated:"Activated",automaticRenewal:"Automatic renewal",renewal:"Renewal status",propertiesTotal:"Properties",paused:"Paused",subscriptionsSummary:"Subscriptions",nextMonthlyPayment:"Next monthly payment",nextAnnualPayment:"Next annual payment",noPaymentScheduled:"No payment scheduled",maintenanceService:"Maintenance service",additionalService:"Additional service",includedInSubscription:"Included in subscription",free:"Free",invoiceForThisMonth:"Invoice for this month",noInvoiceThisMonth:"No invoice is available for this month.",outstandingInvoices:"Outstanding invoices",noOutstandingBalance:"No outstanding balance.",payNow:"Pay now",viewInvoices:"View invoices",automaticPaymentConsent:"I authorize Dar Tahara to charge the payment method saved during my paid Home Assessment. The first charge is {firstAmount} on {date}; recurring charges are {recurringAmount} {interval} under the accepted proposal.",automaticPaymentSchedule:"Your first subscription payment will be attempted automatically on Friday, {date}. No subscription service starts before this payment succeeds.",automaticPaymentServiceWindow:"After successful payment, your first service will be placed in the planning schedule for the following Monday-to-Sunday week.",automaticPaymentSubmitting:"Scheduling payment…",automaticPaymentScheduled:"Automatic payment has been authorized and scheduled.",automaticPaymentError:"We could not schedule the automatic payment. Please check your saved payment method or contact support." },
  pause: {
    eligibleNote: "This subscription includes one pause within 3 years, for up to 2 consecutive months.",
    eligibleNoteInfo: "If the pause period ends, your subscription automatically reactivates. You are responsible for booking a new home assessment visit to resume cleaning.",
    requestButton: "Request a pause",
    ineligibleMessage: "Pausing is available for 9- and 12-month subscriptions. This subscription is not eligible.",
    usedMessage: "The pause benefit for this subscription has already been used.",
    pendingMessage: "A pause request is already being processed for this subscription.",
    modalTitle: "Request a subscription pause",
    reasonLabel: "Reason for the pause",
    reasons: { construction: "Construction at the property", major_renovation: "Major renovation", property_damage: "Property damage", inaccessible: "Property temporarily inaccessible", other: "Other property-related reason" },
    descriptionLabel: "Please describe the situation",
    startLabel: "Pause start date",
    endLabel: "Pause end date",
    maxMonthsNote: "The pause may last up to 2 consecutive months.",
    submit: "Submit request",
    submitting: "Submitting…",
    success: "Your pause request has been submitted for review.",
    cancel: "Cancel",
    statusLabels: { submitted: "Submitted", under_review: "Under review", approved: "Approved", rejected: "Rejected", cancelled: "Cancelled", active: "Paused", completed: "Completed" },
    errors: {
      subscription_not_active: "Only an active subscription can be paused.",
      not_pause_eligible: "This subscription is not eligible for a pause.",
      pause_already_used: "The pause benefit for this subscription has already been used.",
      pause_request_already_pending: "A pause request is already pending for this subscription.",
      invalid_reason_category: "Please choose a valid reason.",
      reason_description_required: "Please describe the situation.",
      invalid_dates: "Please enter valid start and end dates.",
      start_date_in_past: "The start date cannot be in the past.",
      end_before_start: "The end date must be after the start date.",
      exceeds_max_pause_months: "The requested pause is longer than allowed.",
      outside_contract_period: "The requested dates fall outside your current contract period.",
      bad_request: "Something went wrong. Please try again.",
    },
  },
  deepClean: {
    requestButton: "Request a deep clean",
    freeBadge: "Free with your 12-month plan",
    usedMessage: "You've already used your free deep clean for this contract.",
    usedOnMessage: "You used your free deep clean on {date}.",
    pendingMessage: "A deep-clean request is already being processed for this subscription.",
    modalTitle: "Request a deep clean",
    dateLabel: "Preferred date",
    priceLabel: "Price",
    freePriceLabel: "Free",
    upsellNote: "Want another deep clean? It's available as a paid add-on.",
    submit: "Submit request",
    submitting: "Submitting…",
    success: "Your deep-clean request has been submitted.",
    redirecting: "Redirecting to secure payment…",
    cancel: "Cancel",
    statusLabels: { submitted: "Submitted", under_review: "Under review", approved: "Approved", scheduled: "Scheduled", completed: "Completed", rejected: "Rejected", cancelled: "Cancelled" },
    errors: {
      subscription_not_active: "Only an active subscription can request a deep clean.",
      deep_clean_request_already_pending: "A deep-clean request is already pending for this subscription.",
      invalid_dates: "Please enter a valid date.",
      start_date_in_past: "The date cannot be in the past.",
      custom_quote_required: "This property requires a bespoke quote. Please contact support.",
      checkout_failed: "We could not start payment. Please try again.",
      payment_required: "Payment is required before this request can be approved.",
      bad_request: "Something went wrong. Please try again.",
    },
  },
  properties: {
    columnAddress: "Address", columnType: "Type",
    sizeLabel: "Size", airConditioningLabel: "Air conditioning units", accessLabel: "Access",
    roomsLabel: "Rooms", kitchensLabel: "Kitchens", livingSpacesLabel: "Living spaces",
    outsideSpacesLabel: "Outside spaces", frequencyLabel: "Cleaning frequency",
    petsLabel: "Pets", employeeIdLabel: "Assessment employee ID",
    assessmentIdLabel: "Assessment ID", submittedLabel: "Submitted",
    scheduledLabel: "Scheduled assessment", acceptedLabel: "Acceptance date",
    pendingLabel: "Pending assessment",
    noFindings: "Assessment findings have not been recorded yet.", noneLabel: "None",
    yesLabel: "Yes", noLabel: "No",
  },
  invoices: {
    monthlyStatementsTitle: "Monthly statements", annualInvoicesTitle: "Annual invoices", annualStatementsTitle: "Annual statements",
    columnMonth: "Month", columnUnit: "Unit", columnUnits: "Units", columnTotal: "Total",
    filterByUnit: "Filter by unit", allUnits: "All units",
    onHoldLabel: "On hold", downloadStatement: "Download statement",
    noStatements: "No monthly statements yet.", noAnnualInvoices: "No annual statements yet.",
    otherInvoicesTitle: "Other invoices and settlements", noOtherInvoices: "No other invoices or settlements yet.",
    pauseNoticesTitle: "Pause notices", downloadNotice: "Download notice",
    noPauseNotices: "No pause notices.",
    suspensionTitle: "Services temporarily suspended",
    suspensionBody: "Invoice {reference} for {amount} is unpaid. Pay by {date} to restore your services.",
    payNow: "Pay now",
    suspensionNoLinkNote: "A new payment link is being generated. Please check back shortly or contact support for assistance.",
    finalSettlementBadge: "Early-termination settlement",
  },
  cancellation: {
    requestButton: "Request early termination",
    modalTitle: "Early-termination settlement",
    loading: "Calculating your settlement…",
    contractLabel: "Contract",
    startDateLabel: "Start date",
    originalEndDateLabel: "Original end date",
    currentMonthLabel: "Month {current} of {total}",
    originalDiscountLabel: "Discount received",
    itemizedTitle: "Itemized settlement",
    originalContractLabel: "Original contract",
    replacementMinimumTermLabel: "Replacement minimum term",
    completedContractPeriodLabel: "Completed contract period",
    amountAlreadyPaidLabel: "Amount already paid",
    recalculatedConsumedLabel: "Recalculated value of completed periods",
    originalMonthlyPriceLabel: "Original monthly subscription price",
    replacementMonthlyPriceLabel: "Replacement monthly price",
    perMonthLabel: "per month",
    termMonthsLabel: "{months}-month term",
    contractDatesLabel: "Contract period: {start} to {end}",
    discountCorrectionLabel: "Discount correction for months already served",
    remainingMinimumLabel: "Remaining minimum-term charge",
    outstandingInvoicesLabel: "Outstanding invoices",
    includedInvoicesLabel: "Existing unpaid invoices included (not charged twice)",
    paymentsAppliedLabel: "Payments already applied to the remaining term",
    additionalChargesLabel: "Additional applicable charges",
    deepCleanRecoveryLabel: "Complimentary deep-clean recovery",
    creditsLabel: "Credits",
    totalLabel: "Final outstanding amount",
    noChargeMessage: "Your contract term is already fully served, so no early-termination charge applies.",
    creditReviewMessage: "This calculation produces a possible customer credit. It has been held at zero and sent for administrator review; no refund or settlement invoice has been generated.",
    disclosure: "This does not remove or reduce any amount you already owe. Confirming stops future cleaning services and, where a balance is due, generates a final settlement invoice payable within the stated window.",
    confirmButton: "Confirm cancellation",
    confirming: "Confirming…",
    cancel: "Close",
    successNoSettlement: "Your subscription has been cancelled. No further payment is required.",
    successWithSettlement: "Your cancellation is confirmed. A final settlement invoice has been generated.",
    payNow: "Pay settlement now",
    alreadyPendingMessage: "A cancellation request is already being processed for this subscription.",
    disableRenewalButton: "Disable renewal",
    disablingRenewal: "Disabling renewal…",
    renewalDisabled: "Renewal is disabled. The current paid term remains active until its end date.",
    prepaidEndsMessage: "This prepaid subscription remains active until {date}. It cannot be ended early through the settlement flow.",
    prepaidNoRefundMessage: "No refund or discount-correction invoice is generated. Services stop after the current paid term and the subscription will not renew.",
    errors: {
      already_cancelled: "This subscription has already been cancelled.",
      cancellation_already_in_progress: "A cancellation request is already being processed for this subscription.",
      no_fixed_term_contract: "This subscription has no fixed contract term, so early termination does not apply.",
      prepaid_contract: "This term was fully prepaid. You can disable renewal, but an early-termination settlement is not available.",
      outside_minimum_term: "The minimum contract term has already ended.",
      contract_not_started: "This contract has not started yet.",
      credit_review_required: "This calculation requires administrator review before any further action.",
      feature_disabled: "Early termination is not currently available. Please contact support.",
      calculation_expired: "This settlement quote has expired. Please request a new one.",
      calculation_not_pending: "This settlement quote is no longer valid. Please request a new one.",
      bad_request: "Something went wrong. Please try again.",
    },
  },
};

export const portalCopy: Record<Locale, PortalCopy> = {
  en,
  nl: { language:"Taal", auth:{login:"Inloggen",email:"E-mailadres",password:"Wachtwoord",forgot:"Wachtwoord vergeten?",signIn:"Inloggen",signingIn:"Bezig met inloggen…",invalid:"Het e-mailadres of wachtwoord is onjuist.",resetTitle:"Wachtwoord herstellen",resetIntro:"Vul uw e-mailadres in voor veilige herstelinstructies.",sendReset:"Herstellink versturen",resetSent:"Als het account bestaat, zijn instructies verstuurd.",newPassword:"Nieuw wachtwoord",savePassword:"Nieuw wachtwoord opslaan",passwordSaved:"Uw wachtwoord is bijgewerkt.",passwordTooShort:"Gebruik minimaal 12 tekens.",passwordWeak:"Kies een sterker, uniek wachtwoord dat niet in een bekend datalek voorkomt.",passwordSame:"Kies een ander wachtwoord dan uw huidige wachtwoord.",resetLinkInvalid:"Deze herstellink is ongeldig of verlopen. Vraag een nieuwe aan.",passwordUpdateFailed:"Het wachtwoord kon niet worden bijgewerkt. Probeer het opnieuw.",logout:"Uitloggen",createAccount:"Account aanmaken",signupIntro:"Kies de snelste manier om uw beveiligde Dar Tahara-account aan te maken.",noAccount:"Nieuw bij Dar Tahara?",haveAccount:"Heeft u al een account?",continueGoogle:"Doorgaan met Google",continueApple:"Doorgaan met Apple",redirecting:"Doorsturen…",orEmail:"of gebruik e-mail",oauthFailed:"We konden niet doorgaan met deze aanbieder. Probeer het opnieuw.",creatingAccount:"Account aanmaken…",passwordHint:"Gebruik minimaal 12 tekens. U ontvangt per e-mail een bevestigingslink.",signupFailed:"Het account kon niet worden aangemaakt. Probeer het opnieuw of log in.",checkEmailTitle:"Controleer uw e-mail",checkEmail:"Open de bevestigingslink die we u hebben gestuurd om uw e-mailadres te verifiëren en uw account af te ronden.",backToLogin:"Terug naar inloggen",agreement:"Door verder te gaan, gaat u akkoord met de",terms:"Voorwaarden",and:"en het",privacy:"Privacybeleid",registrationUnavailable:"Accountregistratie is tijdelijk niet beschikbaar. Probeer het later opnieuw."}, nav:{overview:"Overzicht",assessments:"Beoordelingen",properties:"Woningen",subscriptions:"Abonnementen",invoices:"Facturen",payments:"Betalingen",profile:"Profiel",support:"Ondersteuning"}, dashboard:{...en.dashboard,title:"Mijn account",welcome:"Welkom terug",accountStatus:"Accountstatus",property:"Woning",subscription:"Abonnement",nextPayment:"Volgende betaling",balance:"Openstaand saldo",latestInvoice:"Laatste factuur",upcomingService:"Volgende service",activity:"Recente activiteit",empty:"Nog niets om te tonen.",download:"Downloaden",reference:"Referentie",submitted:"Ingediend",status:"Status",address:"Adres",frequency:"Frequentie",amount:"Bedrag",date:"Datum",due:"Vervaldatum",paid:"Betaald",contactSupport:"Contact opnemen"}, pause:{...en.pause}, deepClean:{...en.deepClean}, properties:{...en.properties}, invoices:{...en.invoices}, cancellation:{...en.cancellation} },
  fr: { language:"Langue", auth:{login:"Connexion",email:"Adresse e-mail",password:"Mot de passe",forgot:"Mot de passe oublié ?",signIn:"Se connecter",signingIn:"Connexion…",invalid:"L’adresse e-mail ou le mot de passe est incorrect.",resetTitle:"Réinitialiser le mot de passe",resetIntro:"Saisissez votre e-mail pour recevoir des instructions sécurisées.",sendReset:"Envoyer le lien",resetSent:"Si le compte existe, les instructions ont été envoyées.",newPassword:"Nouveau mot de passe",savePassword:"Enregistrer",passwordSaved:"Votre mot de passe a été mis à jour.",passwordTooShort:"Utilisez au moins 12 caractères.",resetLinkInvalid:"Ce lien est invalide ou expiré. Demandez-en un nouveau.",passwordUpdateFailed:"Le mot de passe n’a pas pu être mis à jour. Réessayez.",logout:"Déconnexion",createAccount:"Créer un compte",signupIntro:"Choisissez le moyen le plus rapide de créer votre compte Dar Tahara sécurisé.",noAccount:"Nouveau chez Dar Tahara ?",haveAccount:"Vous avez déjà un compte ?",continueGoogle:"Continuer avec Google",continueApple:"Continuer avec Apple",redirecting:"Redirection…",orEmail:"ou utiliser l’e-mail",oauthFailed:"Impossible de continuer avec ce fournisseur. Veuillez réessayer.",creatingAccount:"Création du compte…",passwordHint:"Utilisez au moins 12 caractères. Un lien de confirmation vous sera envoyé par e-mail.",signupFailed:"Le compte n’a pas pu être créé. Réessayez ou connectez-vous.",checkEmailTitle:"Consultez votre e-mail",checkEmail:"Ouvrez le lien de confirmation envoyé pour vérifier votre adresse e-mail et terminer la création du compte.",backToLogin:"Retour à la connexion",agreement:"En continuant, vous acceptez les",terms:"Conditions",and:"et la",privacy:"Politique de confidentialité",registrationUnavailable:"La création de compte est temporairement indisponible. Réessayez plus tard."}, nav:{overview:"Aperçu",assessments:"Évaluations",properties:"Propriétés",subscriptions:"Abonnements",invoices:"Factures",payments:"Paiements",profile:"Profil",support:"Assistance"}, dashboard:{...en.dashboard,title:"Mon compte",welcome:"Bienvenue",accountStatus:"Statut du compte",property:"Propriété",subscription:"Abonnement",nextPayment:"Prochain paiement",balance:"Solde dû",latestInvoice:"Dernière facture",upcomingService:"Prochain service",activity:"Activité récente",empty:"Aucune donnée pour le moment.",download:"Télécharger",reference:"Référence",submitted:"Soumis",status:"Statut",address:"Adresse",frequency:"Fréquence",amount:"Montant",date:"Date",due:"Échéance",paid:"Payé",contactSupport:"Contacter l’assistance"}, pause:{...en.pause}, deepClean:{...en.deepClean}, properties:{...en.properties}, invoices:{...en.invoices}, cancellation:{...en.cancellation} },
  ar: { language:"اللغة", auth:{login:"تسجيل الدخول",email:"البريد الإلكتروني",password:"كلمة المرور",forgot:"نسيت كلمة المرور؟",signIn:"دخول",signingIn:"جارٍ الدخول…",invalid:"البريد الإلكتروني أو كلمة المرور غير صحيحة.",resetTitle:"إعادة تعيين كلمة المرور",resetIntro:"أدخل بريدك لإرسال تعليمات آمنة.",sendReset:"إرسال رابط الاستعادة",resetSent:"إذا كان الحساب موجودًا فقد أُرسلت التعليمات.",newPassword:"كلمة مرور جديدة",savePassword:"حفظ كلمة المرور",passwordSaved:"تم تحديث كلمة المرور.",passwordTooShort:"استخدم 12 حرفًا على الأقل.",resetLinkInvalid:"رابط إعادة التعيين غير صالح أو منتهي. اطلب رابطًا جديدًا.",passwordUpdateFailed:"تعذر تحديث كلمة المرور. حاول مرة أخرى.",logout:"تسجيل الخروج",createAccount:"إنشاء حساب",signupIntro:"اختر أسرع طريقة لإنشاء حسابك الآمن في دار طهارة.",noAccount:"جديد في دار طهارة؟",haveAccount:"لديك حساب بالفعل؟",continueGoogle:"المتابعة باستخدام Google",continueApple:"المتابعة باستخدام Apple",redirecting:"جارٍ التحويل…",orEmail:"أو استخدم البريد الإلكتروني",oauthFailed:"تعذر المتابعة مع مزود الخدمة هذا. حاول مرة أخرى.",creatingAccount:"جارٍ إنشاء الحساب…",passwordHint:"استخدم 12 حرفًا على الأقل. سنرسل رابط تأكيد إلى بريدك الإلكتروني.",signupFailed:"تعذر إنشاء الحساب. حاول مرة أخرى أو سجّل الدخول.",checkEmailTitle:"تحقق من بريدك الإلكتروني",checkEmail:"افتح رابط التأكيد الذي أرسلناه للتحقق من بريدك الإلكتروني وإكمال إنشاء حسابك.",backToLogin:"العودة إلى تسجيل الدخول",agreement:"بالمتابعة، أنت توافق على",terms:"الشروط",and:"و",privacy:"سياسة الخصوصية",registrationUnavailable:"إنشاء الحساب غير متاح مؤقتًا. حاول مرة أخرى لاحقًا."}, nav:{overview:"نظرة عامة",assessments:"التقييمات",properties:"العقارات",subscriptions:"الاشتراكات",invoices:"الفواتير",payments:"المدفوعات",profile:"الملف الشخصي",support:"الدعم"}, dashboard:{...en.dashboard,title:"حسابي",welcome:"مرحبًا بعودتك",accountStatus:"حالة الحساب",property:"العقار",subscription:"الاشتراك",nextPayment:"الدفعة التالية",balance:"الرصيد المستحق",latestInvoice:"أحدث فاتورة",upcomingService:"الخدمة القادمة",activity:"النشاط الأخير",empty:"لا توجد بيانات بعد.",download:"تنزيل",reference:"المرجع",submitted:"تاريخ التقديم",status:"الحالة",address:"العنوان",frequency:"التكرار",amount:"المبلغ",date:"التاريخ",due:"الاستحقاق",paid:"مدفوع",contactSupport:"اتصل بالدعم"}, pause:{...en.pause}, deepClean:{...en.deepClean}, properties:{...en.properties}, invoices:{...en.invoices}, cancellation:{...en.cancellation} },
  es: { language:"Idioma", auth:{login:"Iniciar sesión",email:"Correo electrónico",password:"Contraseña",forgot:"¿Olvidó la contraseña?",signIn:"Entrar",signingIn:"Iniciando sesión…",invalid:"El correo o la contraseña son incorrectos.",resetTitle:"Restablecer contraseña",resetIntro:"Introduzca su correo para recibir instrucciones seguras.",sendReset:"Enviar enlace",resetSent:"Si la cuenta existe, se han enviado instrucciones.",newPassword:"Nueva contraseña",savePassword:"Guardar contraseña",passwordSaved:"Su contraseña se ha actualizado.",passwordTooShort:"Utilice al menos 12 caracteres.",resetLinkInvalid:"Este enlace no es válido o ha caducado. Solicite uno nuevo.",passwordUpdateFailed:"No se pudo actualizar la contraseña. Inténtelo de nuevo.",logout:"Cerrar sesión",createAccount:"Crear cuenta",signupIntro:"Elige la forma más rápida de crear tu cuenta segura de Dar Tahara.",noAccount:"¿Nuevo en Dar Tahara?",haveAccount:"¿Ya tienes una cuenta?",continueGoogle:"Continuar con Google",continueApple:"Continuar con Apple",redirecting:"Redirigiendo…",orEmail:"o usa el correo",oauthFailed:"No pudimos continuar con ese proveedor. Inténtalo de nuevo.",creatingAccount:"Creando cuenta…",passwordHint:"Usa al menos 12 caracteres. Enviaremos un enlace de confirmación a tu correo.",signupFailed:"No pudimos crear la cuenta. Inténtalo de nuevo o inicia sesión.",checkEmailTitle:"Revisa tu correo",checkEmail:"Abre el enlace de confirmación que te enviamos para verificar tu correo y terminar de crear tu cuenta.",backToLogin:"Volver al inicio de sesión",agreement:"Al continuar, aceptas los",terms:"Términos",and:"y la",privacy:"Política de privacidad",registrationUnavailable:"El registro de cuentas no está disponible temporalmente. Inténtalo más tarde."}, nav:{overview:"Resumen",assessments:"Evaluaciones",properties:"Propiedades",subscriptions:"Suscripciones",invoices:"Facturas",payments:"Pagos",profile:"Perfil",support:"Soporte"}, dashboard:{...en.dashboard,title:"Mi cuenta",welcome:"Bienvenido de nuevo",accountStatus:"Estado de la cuenta",property:"Propiedad",subscription:"Suscripción",nextPayment:"Próximo pago",balance:"Saldo pendiente",latestInvoice:"Última factura",upcomingService:"Próximo servicio",activity:"Actividad reciente",empty:"Aún no hay datos.",download:"Descargar",reference:"Referencia",submitted:"Enviado",status:"Estado",address:"Dirección",frequency:"Frecuencia",amount:"Importe",date:"Fecha",due:"Vence",paid:"Pagado",contactSupport:"Contactar soporte"}, pause:{...en.pause}, deepClean:{...en.deepClean}, properties:{...en.properties}, invoices:{...en.invoices}, cancellation:{...en.cancellation} },
  de: { language:"Sprache", auth:{login:"Anmelden",email:"E-Mail-Adresse",password:"Passwort",forgot:"Passwort vergessen?",signIn:"Anmelden",signingIn:"Anmeldung…",invalid:"E-Mail oder Passwort ist falsch.",resetTitle:"Passwort zurücksetzen",resetIntro:"Geben Sie Ihre E-Mail für sichere Anweisungen ein.",sendReset:"Link senden",resetSent:"Falls das Konto existiert, wurden Anweisungen gesendet.",newPassword:"Neues Passwort",savePassword:"Passwort speichern",passwordSaved:"Ihr Passwort wurde aktualisiert.",passwordTooShort:"Verwenden Sie mindestens 12 Zeichen.",resetLinkInvalid:"Dieser Link ist ungültig oder abgelaufen. Fordern Sie einen neuen an.",passwordUpdateFailed:"Das Passwort konnte nicht aktualisiert werden. Versuchen Sie es erneut.",logout:"Abmelden",createAccount:"Konto erstellen",signupIntro:"Wählen Sie den schnellsten Weg zu Ihrem sicheren Dar-Tahara-Konto.",noAccount:"Neu bei Dar Tahara?",haveAccount:"Sie haben bereits ein Konto?",continueGoogle:"Weiter mit Google",continueApple:"Weiter mit Apple",redirecting:"Weiterleitung…",orEmail:"oder E-Mail verwenden",oauthFailed:"Mit diesem Anbieter konnte nicht fortgefahren werden. Versuchen Sie es erneut.",creatingAccount:"Konto wird erstellt…",passwordHint:"Verwenden Sie mindestens 12 Zeichen. Sie erhalten einen Bestätigungslink per E-Mail.",signupFailed:"Das Konto konnte nicht erstellt werden. Versuchen Sie es erneut oder melden Sie sich an.",checkEmailTitle:"Prüfen Sie Ihre E-Mail",checkEmail:"Öffnen Sie den gesendeten Bestätigungslink, um Ihre E-Mail zu verifizieren und die Kontoerstellung abzuschließen.",backToLogin:"Zurück zur Anmeldung",agreement:"Wenn Sie fortfahren, stimmen Sie den",terms:"Bedingungen",and:"und der",privacy:"Datenschutzerklärung",registrationUnavailable:"Die Kontoregistrierung ist vorübergehend nicht verfügbar. Versuchen Sie es später erneut."}, nav:{overview:"Übersicht",assessments:"Bewertungen",properties:"Immobilien",subscriptions:"Abonnements",invoices:"Rechnungen",payments:"Zahlungen",profile:"Profil",support:"Support"}, dashboard:{...en.dashboard,title:"Mein Konto",welcome:"Willkommen zurück",accountStatus:"Kontostatus",property:"Immobilie",subscription:"Abonnement",nextPayment:"Nächste Zahlung",balance:"Offener Betrag",latestInvoice:"Letzte Rechnung",upcomingService:"Nächster Service",activity:"Letzte Aktivitäten",empty:"Noch keine Daten.",download:"Herunterladen",reference:"Referenz",submitted:"Eingereicht",status:"Status",address:"Adresse",frequency:"Häufigkeit",amount:"Betrag",date:"Datum",due:"Fällig",paid:"Bezahlt",contactSupport:"Support kontaktieren"}, pause:{...en.pause}, deepClean:{...en.deepClean}, properties:{...en.properties}, invoices:{...en.invoices}, cancellation:{...en.cancellation} },
  pt: { language:"Idioma", auth:{login:"Iniciar sessão",email:"E-mail",password:"Palavra-passe",forgot:"Esqueceu a palavra-passe?",signIn:"Entrar",signingIn:"A iniciar…",invalid:"O e-mail ou a palavra-passe está incorreto.",resetTitle:"Repor palavra-passe",resetIntro:"Introduza o e-mail para receber instruções seguras.",sendReset:"Enviar ligação",resetSent:"Se a conta existir, as instruções foram enviadas.",newPassword:"Nova palavra-passe",savePassword:"Guardar palavra-passe",passwordSaved:"A palavra-passe foi atualizada.",passwordTooShort:"Utilize pelo menos 12 caracteres.",resetLinkInvalid:"Esta ligação é inválida ou expirou. Solicite uma nova.",passwordUpdateFailed:"Não foi possível atualizar a palavra-passe. Tente novamente.",logout:"Terminar sessão",createAccount:"Criar conta",signupIntro:"Escolha a forma mais rápida de criar a sua conta Dar Tahara segura.",noAccount:"Novo na Dar Tahara?",haveAccount:"Já tem uma conta?",continueGoogle:"Continuar com Google",continueApple:"Continuar com Apple",redirecting:"A redirecionar…",orEmail:"ou utilize o e-mail",oauthFailed:"Não foi possível continuar com esse fornecedor. Tente novamente.",creatingAccount:"A criar conta…",passwordHint:"Utilize pelo menos 12 caracteres. Enviaremos uma ligação de confirmação para o seu e-mail.",signupFailed:"Não foi possível criar a conta. Tente novamente ou inicie sessão.",checkEmailTitle:"Verifique o seu e-mail",checkEmail:"Abra a ligação de confirmação que enviámos para verificar o seu e-mail e concluir a criação da conta.",backToLogin:"Voltar ao início de sessão",agreement:"Ao continuar, aceita os",terms:"Termos",and:"e a",privacy:"Política de Privacidade",registrationUnavailable:"O registo de contas está temporariamente indisponível. Tente mais tarde."}, nav:{overview:"Resumo",assessments:"Avaliações",properties:"Propriedades",subscriptions:"Subscrições",invoices:"Faturas",payments:"Pagamentos",profile:"Perfil",support:"Apoio"}, dashboard:{...en.dashboard,title:"A minha conta",welcome:"Bem-vindo de volta",accountStatus:"Estado da conta",property:"Propriedade",subscription:"Subscrição",nextPayment:"Próximo pagamento",balance:"Saldo pendente",latestInvoice:"Última fatura",upcomingService:"Próximo serviço",activity:"Atividade recente",empty:"Ainda não existem dados.",download:"Transferir",reference:"Referência",submitted:"Enviado",status:"Estado",address:"Morada",frequency:"Frequência",amount:"Montante",date:"Data",due:"Vencimento",paid:"Pago",contactSupport:"Contactar apoio"}, pause:{...en.pause}, deepClean:{...en.deepClean}, properties:{...en.properties}, invoices:{...en.invoices}, cancellation:{...en.cancellation} },
};

Object.assign(portalCopy.nl.dashboard, { access:"Toegang",services:"Diensten",acceptProposal:"Betaling machtigen en inplannen",save:"Opslaan",saved:"Opgeslagen",subject:"Onderwerp",message:"Bericht",billing:"Facturering",annual:"Jaarlijks",monthly:"Maandelijks",duration:"Looptijd",months:"maanden",pendingProposals:"Openstaande voorstellen",subscriptionDetails:"Abonnementsgegevens",activated:"Geactiveerd",automaticRenewal:"Automatische verlenging",renewal:"Verlengingsstatus",propertiesTotal:"Woningen",paused:"Gepauzeerd",subscriptionsSummary:"Abonnementen",nextMonthlyPayment:"Volgende maandelijkse betaling",nextAnnualPayment:"Volgende jaarlijkse betaling",noPaymentScheduled:"Geen betaling gepland",maintenanceService:"Onderhoudsservice",additionalService:"Extra service",includedInSubscription:"Inbegrepen in abonnement",free:"Gratis",invoiceForThisMonth:"Factuur van deze maand",noInvoiceThisMonth:"Er is geen factuur beschikbaar voor deze maand.",outstandingInvoices:"Openstaande facturen",noOutstandingBalance:"Geen openstaand saldo.",payNow:"Nu betalen",viewInvoices:"Facturen bekijken",automaticPaymentConsent:"Ik machtig Dar Tahara om de betaalmethode te gebruiken die tijdens mijn betaalde woningbeoordeling is opgeslagen. De eerste afschrijving is {firstAmount} op {date}; daarna wordt {recurringAmount} {interval} afgeschreven volgens het geaccepteerde voorstel.",automaticPaymentSchedule:"Uw eerste abonnementsbetaling wordt automatisch geprobeerd op vrijdag {date}. De abonnementsservice start pas nadat deze betaling is geslaagd.",automaticPaymentServiceWindow:"Na een geslaagde betaling wordt uw eerste service ingepland voor de daaropvolgende week van maandag tot en met zondag.",automaticPaymentSubmitting:"Betaling wordt ingepland…",automaticPaymentScheduled:"De automatische betaling is gemachtigd en ingepland.",automaticPaymentError:"De automatische betaling kon niet worden ingepland. Controleer uw opgeslagen betaalmethode of neem contact op met support." });
Object.assign(portalCopy.fr.dashboard, { access:"Accès",services:"Services",acceptProposal:"Accepter la proposition et passer au paiement sécurisé",save:"Enregistrer",saved:"Enregistré",subject:"Objet",message:"Message",billing:"Facturation",annual:"Annuelle",monthly:"Mensuelle",duration:"Durée",months:"mois" });
Object.assign(portalCopy.ar.dashboard, { access:"الدخول",services:"الخدمات",acceptProposal:"قبول العرض والمتابعة إلى الدفع الآمن",save:"حفظ",saved:"تم الحفظ",subject:"الموضوع",message:"الرسالة",billing:"الفوترة",annual:"سنوي",monthly:"شهري",duration:"مدة العقد",months:"أشهر" });
Object.assign(portalCopy.es.dashboard, { access:"Acceso",services:"Servicios",acceptProposal:"Aceptar la propuesta y continuar al pago seguro",save:"Guardar",saved:"Guardado",subject:"Asunto",message:"Mensaje",billing:"Facturación",annual:"Anual",monthly:"Mensual",duration:"Duración",months:"meses" });
Object.assign(portalCopy.de.dashboard, { access:"Zugang",services:"Leistungen",acceptProposal:"Vorschlag annehmen und zur sicheren Zahlung weitergehen",save:"Speichern",saved:"Gespeichert",subject:"Betreff",message:"Nachricht",billing:"Abrechnung",annual:"Jährlich",monthly:"Monatlich",duration:"Laufzeit",months:"Monate" });
Object.assign(portalCopy.pt.dashboard, { access:"Acesso",services:"Serviços",acceptProposal:"Aceitar a proposta e continuar para o pagamento seguro",save:"Guardar",saved:"Guardado",subject:"Assunto",message:"Mensagem",billing:"Faturação",annual:"Anual",monthly:"Mensal",duration:"Duração",months:"meses" });

Object.assign(portalCopy.nl.pause, {
  eligibleNote: "Dit abonnement omvat één pauze binnen 3 jaar, voor maximaal 2 opeenvolgende maanden.",
  eligibleNoteInfo: "Als de pauzeperiode is verstreken, wordt uw abonnement automatisch hervat. U bent zelf verantwoordelijk voor het inplannen van een nieuwe woningbeoordeling om de schoonmaak te hervatten.",
  requestButton: "Pauze aanvragen",
  ineligibleMessage: "Pauzeren is beschikbaar voor abonnementen van 9 en 12 maanden. Dit abonnement komt niet in aanmerking.",
  usedMessage: "De pauzevoordeel voor dit abonnement is al gebruikt.",
  pendingMessage: "Er wordt al een pauzeverzoek voor dit abonnement verwerkt.",
  modalTitle: "Abonnementspauze aanvragen",
  reasonLabel: "Reden voor de pauze",
  reasons: { construction:"Bouwwerkzaamheden op de woning", major_renovation:"Grote renovatie", property_damage:"Schade aan de woning", inaccessible:"Woning tijdelijk ontoegankelijk", other:"Andere woninggerelateerde reden" },
  descriptionLabel: "Beschrijf de situatie",
  startLabel: "Startdatum pauze",
  endLabel: "Einddatum pauze",
  maxMonthsNote: "De pauze kan tot 2 opeenvolgende maanden duren.",
  submit: "Verzoek versturen",
  submitting: "Versturen…",
  success: "Uw pauzeverzoek is ingediend ter beoordeling.",
  cancel: "Annuleren",
  statusLabels: { submitted:"Ingediend", under_review:"In beoordeling", approved:"Goedgekeurd", rejected:"Afgewezen", cancelled:"Geannuleerd", active:"Gepauzeerd", completed:"Voltooid" },
  errors: {
    subscription_not_active:"Alleen een actief abonnement kan worden gepauzeerd.",
    not_pause_eligible:"Dit abonnement komt niet in aanmerking voor een pauze.",
    pause_already_used:"De pauzevoordeel voor dit abonnement is al gebruikt.",
    pause_request_already_pending:"Er is al een pauzeverzoek in behandeling voor dit abonnement.",
    invalid_reason_category:"Kies een geldige reden.",
    reason_description_required:"Beschrijf de situatie.",
    invalid_dates:"Voer geldige start- en einddatums in.",
    start_date_in_past:"De startdatum kan niet in het verleden liggen.",
    end_before_start:"De einddatum moet na de startdatum liggen.",
    exceeds_max_pause_months:"De gevraagde pauze is langer dan toegestaan.",
    outside_contract_period:"De gevraagde data vallen buiten uw huidige contractperiode.",
    bad_request:"Er is iets misgegaan. Probeer het opnieuw.",
  },
});

Object.assign(portalCopy.fr.pause, {
  eligibleNote: "Cet abonnement inclut une pause dans un délai de 3 ans, d’une durée maximale de 2 mois consécutifs.",
  eligibleNoteInfo: "Une fois la période de pause terminée, votre abonnement reprend automatiquement. Il vous appartient de planifier une nouvelle évaluation du domicile pour reprendre le nettoyage.",
  requestButton: "Demander une pause",
  ineligibleMessage: "La pause est disponible pour les abonnements de 9 et 12 mois. Cet abonnement n’y est pas éligible.",
  usedMessage: "L’avantage de pause pour cet abonnement a déjà été utilisé.",
  pendingMessage: "Une demande de pause est déjà en cours de traitement pour cet abonnement.",
  modalTitle: "Demander une pause d’abonnement",
  reasonLabel: "Motif de la pause",
  reasons: { construction:"Travaux de construction sur le bien", major_renovation:"Rénovation majeure", property_damage:"Dommages au bien", inaccessible:"Bien temporairement inaccessible", other:"Autre motif lié au bien" },
  descriptionLabel: "Veuillez décrire la situation",
  startLabel: "Date de début de la pause",
  endLabel: "Date de fin de la pause",
  maxMonthsNote: "La pause peut durer jusqu’à 2 mois consécutifs.",
  submit: "Envoyer la demande",
  submitting: "Envoi…",
  success: "Votre demande de pause a été soumise pour examen.",
  cancel: "Annuler",
  statusLabels: { submitted:"Soumise", under_review:"En cours d’examen", approved:"Approuvée", rejected:"Refusée", cancelled:"Annulée", active:"En pause", completed:"Terminée" },
  errors: {
    subscription_not_active:"Seul un abonnement actif peut être mis en pause.",
    not_pause_eligible:"Cet abonnement n’est pas éligible à une pause.",
    pause_already_used:"L’avantage de pause pour cet abonnement a déjà été utilisé.",
    pause_request_already_pending:"Une demande de pause est déjà en attente pour cet abonnement.",
    invalid_reason_category:"Veuillez choisir un motif valide.",
    reason_description_required:"Veuillez décrire la situation.",
    invalid_dates:"Veuillez saisir des dates de début et de fin valides.",
    start_date_in_past:"La date de début ne peut pas être dans le passé.",
    end_before_start:"La date de fin doit être postérieure à la date de début.",
    exceeds_max_pause_months:"La pause demandée dépasse la durée autorisée.",
    outside_contract_period:"Les dates demandées se situent en dehors de votre période contractuelle actuelle.",
    bad_request:"Une erreur s’est produite. Veuillez réessayer.",
  },
});

Object.assign(portalCopy.ar.pause, {
  eligibleNote: "يتضمن هذا الاشتراك إيقافاً مؤقتاً واحداً خلال 3 سنوات، لمدة أقصاها شهرين متتاليين.",
  eligibleNoteInfo: "عند انتهاء فترة الإيقاف المؤقت، يُستأنف اشتراكك تلقائياً. أنتم مسؤولون عن جدولة تقييم منزلي جديد لاستئناف التنظيف.",
  requestButton: "طلب إيقاف مؤقت",
  ineligibleMessage: "الإيقاف المؤقت متاح للاشتراكات لمدة 9 و12 شهراً. هذا الاشتراك غير مؤهل.",
  usedMessage: "تم بالفعل استخدام ميزة الإيقاف المؤقت لهذا الاشتراك.",
  pendingMessage: "يوجد بالفعل طلب إيقاف مؤقت قيد المعالجة لهذا الاشتراك.",
  modalTitle: "طلب إيقاف الاشتراك مؤقتاً",
  reasonLabel: "سبب الإيقاف المؤقت",
  reasons: { construction:"أعمال بناء في العقار", major_renovation:"تجديد كبير", property_damage:"أضرار في العقار", inaccessible:"تعذر الوصول إلى العقار مؤقتاً", other:"سبب آخر متعلق بالعقار" },
  descriptionLabel: "يرجى وصف الحالة",
  startLabel: "تاريخ بدء الإيقاف",
  endLabel: "تاريخ انتهاء الإيقاف",
  maxMonthsNote: "يمكن أن يستمر الإيقاف المؤقت لمدة أقصاها شهرين متتاليين.",
  submit: "إرسال الطلب",
  submitting: "جارٍ الإرسال…",
  success: "تم إرسال طلب الإيقاف المؤقت للمراجعة.",
  cancel: "إلغاء",
  statusLabels: { submitted:"تم الإرسال", under_review:"قيد المراجعة", approved:"موافق عليه", rejected:"مرفوض", cancelled:"ملغى", active:"موقف مؤقتاً", completed:"مكتمل" },
  errors: {
    subscription_not_active:"لا يمكن إيقاف سوى اشتراك نشط.",
    not_pause_eligible:"هذا الاشتراك غير مؤهل للإيقاف المؤقت.",
    pause_already_used:"تم بالفعل استخدام ميزة الإيقاف المؤقت لهذا الاشتراك.",
    pause_request_already_pending:"يوجد بالفعل طلب إيقاف مؤقت معلق لهذا الاشتراك.",
    invalid_reason_category:"يرجى اختيار سبب صالح.",
    reason_description_required:"يرجى وصف الحالة.",
    invalid_dates:"يرجى إدخال تاريخي بدء وانتهاء صالحين.",
    start_date_in_past:"لا يمكن أن يكون تاريخ البدء في الماضي.",
    end_before_start:"يجب أن يكون تاريخ الانتهاء بعد تاريخ البدء.",
    exceeds_max_pause_months:"مدة الإيقاف المطلوبة أطول من المسموح به.",
    outside_contract_period:"التواريخ المطلوبة تقع خارج فترة عقدك الحالية.",
    bad_request:"حدث خطأ ما. يرجى المحاولة مرة أخرى.",
  },
});

Object.assign(portalCopy.es.pause, {
  eligibleNote: "Esta suscripción incluye una pausa dentro de un plazo de 3 años, de hasta 2 meses consecutivos.",
  eligibleNoteInfo: "Cuando finalice el período de pausa, tu suscripción se reactivará automáticamente. Eres responsable de programar una nueva evaluación del hogar para reanudar la limpieza.",
  requestButton: "Solicitar una pausa",
  ineligibleMessage: "La pausa está disponible para suscripciones de 9 y 12 meses. Esta suscripción no es elegible.",
  usedMessage: "El beneficio de pausa de esta suscripción ya se ha utilizado.",
  pendingMessage: "Ya hay una solicitud de pausa en trámite para esta suscripción.",
  modalTitle: "Solicitar una pausa de suscripción",
  reasonLabel: "Motivo de la pausa",
  reasons: { construction:"Obras de construcción en la propiedad", major_renovation:"Renovación importante", property_damage:"Daños en la propiedad", inaccessible:"Propiedad temporalmente inaccesible", other:"Otro motivo relacionado con la propiedad" },
  descriptionLabel: "Describe la situación",
  startLabel: "Fecha de inicio de la pausa",
  endLabel: "Fecha de fin de la pausa",
  maxMonthsNote: "La pausa puede durar hasta 2 meses consecutivos.",
  submit: "Enviar solicitud",
  submitting: "Enviando…",
  success: "Tu solicitud de pausa ha sido enviada para revisión.",
  cancel: "Cancelar",
  statusLabels: { submitted:"Enviada", under_review:"En revisión", approved:"Aprobada", rejected:"Rechazada", cancelled:"Cancelada", active:"Pausada", completed:"Completada" },
  errors: {
    subscription_not_active:"Solo una suscripción activa puede pausarse.",
    not_pause_eligible:"Esta suscripción no es elegible para una pausa.",
    pause_already_used:"El beneficio de pausa de esta suscripción ya se ha utilizado.",
    pause_request_already_pending:"Ya hay una solicitud de pausa pendiente para esta suscripción.",
    invalid_reason_category:"Elige un motivo válido.",
    reason_description_required:"Describe la situación.",
    invalid_dates:"Introduce fechas de inicio y fin válidas.",
    start_date_in_past:"La fecha de inicio no puede estar en el pasado.",
    end_before_start:"La fecha de fin debe ser posterior a la fecha de inicio.",
    exceeds_max_pause_months:"La pausa solicitada supera la duración permitida.",
    outside_contract_period:"Las fechas solicitadas están fuera de tu período de contrato actual.",
    bad_request:"Algo salió mal. Inténtalo de nuevo.",
  },
});

Object.assign(portalCopy.de.pause, {
  eligibleNote: "Dieses Abonnement beinhaltet eine Pause innerhalb von 3 Jahren, für bis zu 2 aufeinanderfolgende Monate.",
  eligibleNoteInfo: "Nach Ablauf des Pausenzeitraums wird Ihr Abonnement automatisch reaktiviert. Sie sind selbst dafür verantwortlich, eine neue Hausbewertung zu vereinbaren, um die Reinigung fortzusetzen.",
  requestButton: "Pause beantragen",
  ineligibleMessage: "Pausieren ist für 9- und 12-Monats-Abonnements verfügbar. Dieses Abonnement ist nicht berechtigt.",
  usedMessage: "Der Pausenvorteil für dieses Abonnement wurde bereits genutzt.",
  pendingMessage: "Für dieses Abonnement wird bereits ein Pausenantrag bearbeitet.",
  modalTitle: "Abonnementpause beantragen",
  reasonLabel: "Grund für die Pause",
  reasons: { construction:"Bauarbeiten an der Immobilie", major_renovation:"Größere Renovierung", property_damage:"Schäden an der Immobilie", inaccessible:"Immobilie vorübergehend unzugänglich", other:"Anderer immobilienbezogener Grund" },
  descriptionLabel: "Bitte beschreiben Sie die Situation",
  startLabel: "Startdatum der Pause",
  endLabel: "Enddatum der Pause",
  maxMonthsNote: "Die Pause kann bis zu 2 aufeinanderfolgende Monate dauern.",
  submit: "Antrag senden",
  submitting: "Wird gesendet…",
  success: "Ihr Pausenantrag wurde zur Prüfung eingereicht.",
  cancel: "Abbrechen",
  statusLabels: { submitted:"Eingereicht", under_review:"In Prüfung", approved:"Genehmigt", rejected:"Abgelehnt", cancelled:"Storniert", active:"Pausiert", completed:"Abgeschlossen" },
  errors: {
    subscription_not_active:"Nur ein aktives Abonnement kann pausiert werden.",
    not_pause_eligible:"Dieses Abonnement ist nicht für eine Pause berechtigt.",
    pause_already_used:"Der Pausenvorteil für dieses Abonnement wurde bereits genutzt.",
    pause_request_already_pending:"Für dieses Abonnement liegt bereits ein Pausenantrag vor.",
    invalid_reason_category:"Bitte wählen Sie einen gültigen Grund.",
    reason_description_required:"Bitte beschreiben Sie die Situation.",
    invalid_dates:"Bitte geben Sie gültige Start- und Enddaten ein.",
    start_date_in_past:"Das Startdatum darf nicht in der Vergangenheit liegen.",
    end_before_start:"Das Enddatum muss nach dem Startdatum liegen.",
    exceeds_max_pause_months:"Die beantragte Pause ist länger als erlaubt.",
    outside_contract_period:"Die beantragten Daten liegen außerhalb Ihres aktuellen Vertragszeitraums.",
    bad_request:"Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
  },
});

Object.assign(portalCopy.pt.pause, {
  eligibleNote: "Esta subscrição inclui uma pausa dentro de 3 anos, até 2 meses consecutivos.",
  eligibleNoteInfo: "Quando o período de pausa terminar, a sua subscrição será reativada automaticamente. É da sua responsabilidade agendar uma nova avaliação da casa para retomar a limpeza.",
  requestButton: "Solicitar uma pausa",
  ineligibleMessage: "A pausa está disponível para subscrições de 9 e 12 meses. Esta subscrição não é elegível.",
  usedMessage: "O benefício de pausa desta subscrição já foi utilizado.",
  pendingMessage: "Já existe um pedido de pausa em processamento para esta subscrição.",
  modalTitle: "Solicitar uma pausa de subscrição",
  reasonLabel: "Motivo da pausa",
  reasons: { construction:"Obras de construção na propriedade", major_renovation:"Renovação importante", property_damage:"Danos na propriedade", inaccessible:"Propriedade temporariamente inacessível", other:"Outro motivo relacionado com a propriedade" },
  descriptionLabel: "Descreva a situação",
  startLabel: "Data de início da pausa",
  endLabel: "Data de fim da pausa",
  maxMonthsNote: "A pausa pode durar até 2 meses consecutivos.",
  submit: "Enviar pedido",
  submitting: "A enviar…",
  success: "O seu pedido de pausa foi submetido para análise.",
  cancel: "Cancelar",
  statusLabels: { submitted:"Submetido", under_review:"Em análise", approved:"Aprovado", rejected:"Rejeitado", cancelled:"Cancelado", active:"Pausado", completed:"Concluído" },
  errors: {
    subscription_not_active:"Apenas uma subscrição ativa pode ser pausada.",
    not_pause_eligible:"Esta subscrição não é elegível para uma pausa.",
    pause_already_used:"O benefício de pausa desta subscrição já foi utilizado.",
    pause_request_already_pending:"Já existe um pedido de pausa pendente para esta subscrição.",
    invalid_reason_category:"Escolha um motivo válido.",
    reason_description_required:"Descreva a situação.",
    invalid_dates:"Introduza datas de início e fim válidas.",
    start_date_in_past:"A data de início não pode ser no passado.",
    end_before_start:"A data de fim deve ser posterior à data de início.",
    exceeds_max_pause_months:"A pausa solicitada é mais longa do que o permitido.",
    outside_contract_period:"As datas solicitadas estão fora do seu período contratual atual.",
    bad_request:"Ocorreu um erro. Tente novamente.",
  },
});

Object.assign(portalCopy.nl.deepClean, {
  requestButton: "Grondige schoonmaak aanvragen",
  freeBadge: "Gratis bij uw 12-maands abonnement",
  usedMessage: "U heeft uw gratis grondige schoonmaak voor dit contract al gebruikt.",
  usedOnMessage: "U heeft uw gratis grondige schoonmaak gebruikt op {date}.",
  upsellNote: "Nog een grondige schoonmaak nodig? Deze is beschikbaar als betaalde optie.",
  pendingMessage: "Er wordt al een verzoek voor een grondige schoonmaak verwerkt voor dit abonnement.",
  modalTitle: "Grondige schoonmaak aanvragen",
  dateLabel: "Gewenste datum",
  priceLabel: "Prijs",
  freePriceLabel: "Gratis",
  submit: "Verzoek versturen",
  submitting: "Versturen…",
  success: "Uw verzoek voor een grondige schoonmaak is ingediend.",
  redirecting: "Doorverwijzen naar beveiligde betaling…",
  cancel: "Annuleren",
  statusLabels: { submitted:"Ingediend", under_review:"In beoordeling", approved:"Goedgekeurd", scheduled:"Ingepland", completed:"Voltooid", rejected:"Afgewezen", cancelled:"Geannuleerd" },
  errors: {
    subscription_not_active:"Alleen een actief abonnement kan een grondige schoonmaak aanvragen.",
    deep_clean_request_already_pending:"Er is al een verzoek in behandeling voor dit abonnement.",
    invalid_dates:"Voer een geldige datum in.",
    start_date_in_past:"De datum kan niet in het verleden liggen.",
    custom_quote_required:"Voor deze woning is een offerte op maat nodig. Neem contact op met support.",
    checkout_failed:"We konden de betaling niet starten. Probeer het opnieuw.",
    payment_required:"Betaling is vereist voordat dit verzoek kan worden goedgekeurd.",
    bad_request:"Er is iets misgegaan. Probeer het opnieuw.",
  },
});

Object.assign(portalCopy.fr.deepClean, {
  requestButton: "Demander un nettoyage en profondeur",
  freeBadge: "Gratuit avec votre abonnement de 12 mois",
  usedMessage: "Vous avez déjà utilisé votre nettoyage en profondeur gratuit pour ce contrat.",
  usedOnMessage: "Vous avez utilisé votre nettoyage en profondeur gratuit le {date}.",
  upsellNote: "Vous souhaitez un autre nettoyage en profondeur ? Il est disponible en option payante.",
  pendingMessage: "Une demande de nettoyage en profondeur est déjà en cours de traitement pour cet abonnement.",
  modalTitle: "Demander un nettoyage en profondeur",
  dateLabel: "Date souhaitée",
  priceLabel: "Prix",
  freePriceLabel: "Gratuit",
  submit: "Envoyer la demande",
  submitting: "Envoi…",
  success: "Votre demande de nettoyage en profondeur a été envoyée.",
  redirecting: "Redirection vers le paiement sécurisé…",
  cancel: "Annuler",
  statusLabels: { submitted:"Soumise", under_review:"En cours d’examen", approved:"Approuvée", scheduled:"Planifiée", completed:"Terminée", rejected:"Refusée", cancelled:"Annulée" },
  errors: {
    subscription_not_active:"Seul un abonnement actif peut demander un nettoyage en profondeur.",
    deep_clean_request_already_pending:"Une demande est déjà en attente pour cet abonnement.",
    invalid_dates:"Veuillez saisir une date valide.",
    start_date_in_past:"La date ne peut pas être dans le passé.",
    custom_quote_required:"Ce bien nécessite un devis sur mesure. Veuillez contacter le support.",
    checkout_failed:"Impossible de démarrer le paiement. Veuillez réessayer.",
    payment_required:"Le paiement est requis avant que cette demande puisse être approuvée.",
    bad_request:"Une erreur s’est produite. Veuillez réessayer.",
  },
});

Object.assign(portalCopy.ar.deepClean, {
  requestButton: "طلب تنظيف عميق",
  freeBadge: "مجاني مع اشتراكك لمدة 12 شهراً",
  usedMessage: "لقد استخدمت بالفعل تنظيفك العميق المجاني لهذا العقد.",
  usedOnMessage: "استخدمت تنظيفك العميق المجاني بتاريخ {date}.",
  upsellNote: "هل ترغب في تنظيف عميق آخر؟ إنه متاح كخيار مدفوع.",
  pendingMessage: "يوجد بالفعل طلب تنظيف عميق قيد المعالجة لهذا الاشتراك.",
  modalTitle: "طلب تنظيف عميق",
  dateLabel: "التاريخ المفضل",
  priceLabel: "السعر",
  freePriceLabel: "مجاني",
  submit: "إرسال الطلب",
  submitting: "جارٍ الإرسال…",
  success: "تم إرسال طلب التنظيف العميق.",
  redirecting: "جارٍ التحويل إلى الدفع الآمن…",
  cancel: "إلغاء",
  statusLabels: { submitted:"تم الإرسال", under_review:"قيد المراجعة", approved:"موافق عليه", scheduled:"مجدول", completed:"مكتمل", rejected:"مرفوض", cancelled:"ملغى" },
  errors: {
    subscription_not_active:"لا يمكن سوى اشتراك نشط طلب تنظيف عميق.",
    deep_clean_request_already_pending:"يوجد بالفعل طلب معلق لهذا الاشتراك.",
    invalid_dates:"يرجى إدخال تاريخ صالح.",
    start_date_in_past:"لا يمكن أن يكون التاريخ في الماضي.",
    custom_quote_required:"يتطلب هذا العقار عرض سعر مخصص. يرجى التواصل مع الدعم.",
    checkout_failed:"تعذر بدء الدفع. يرجى المحاولة مرة أخرى.",
    payment_required:"الدفع مطلوب قبل الموافقة على هذا الطلب.",
    bad_request:"حدث خطأ ما. يرجى المحاولة مرة أخرى.",
  },
});

Object.assign(portalCopy.es.deepClean, {
  requestButton: "Solicitar una limpieza profunda",
  freeBadge: "Gratis con tu suscripción de 12 meses",
  usedMessage: "Ya has utilizado tu limpieza profunda gratuita para este contrato.",
  usedOnMessage: "Usaste tu limpieza profunda gratuita el {date}.",
  upsellNote: "¿Quieres otra limpieza profunda? Está disponible como opción de pago.",
  pendingMessage: "Ya hay una solicitud de limpieza profunda en trámite para esta suscripción.",
  modalTitle: "Solicitar una limpieza profunda",
  dateLabel: "Fecha preferida",
  priceLabel: "Precio",
  freePriceLabel: "Gratis",
  submit: "Enviar solicitud",
  submitting: "Enviando…",
  success: "Tu solicitud de limpieza profunda ha sido enviada.",
  redirecting: "Redirigiendo al pago seguro…",
  cancel: "Cancelar",
  statusLabels: { submitted:"Enviada", under_review:"En revisión", approved:"Aprobada", scheduled:"Programada", completed:"Completada", rejected:"Rechazada", cancelled:"Cancelada" },
  errors: {
    subscription_not_active:"Solo una suscripción activa puede solicitar una limpieza profunda.",
    deep_clean_request_already_pending:"Ya hay una solicitud pendiente para esta suscripción.",
    invalid_dates:"Introduce una fecha válida.",
    start_date_in_past:"La fecha no puede estar en el pasado.",
    custom_quote_required:"Esta propiedad requiere un presupuesto personalizado. Contacta con soporte.",
    checkout_failed:"No se pudo iniciar el pago. Inténtalo de nuevo.",
    payment_required:"Se requiere el pago antes de que esta solicitud pueda ser aprobada.",
    bad_request:"Algo salió mal. Inténtalo de nuevo.",
  },
});

Object.assign(portalCopy.de.deepClean, {
  requestButton: "Grundreinigung anfragen",
  freeBadge: "Kostenlos mit Ihrem 12-Monats-Abonnement",
  usedMessage: "Sie haben Ihre kostenlose Grundreinigung für diesen Vertrag bereits genutzt.",
  usedOnMessage: "Sie haben Ihre kostenlose Grundreinigung am {date} genutzt.",
  upsellNote: "Möchten Sie eine weitere Grundreinigung? Sie ist als kostenpflichtige Option verfügbar.",
  pendingMessage: "Für dieses Abonnement wird bereits eine Grundreinigungsanfrage bearbeitet.",
  modalTitle: "Grundreinigung anfragen",
  dateLabel: "Bevorzugtes Datum",
  priceLabel: "Preis",
  freePriceLabel: "Kostenlos",
  submit: "Antrag senden",
  submitting: "Wird gesendet…",
  success: "Ihre Anfrage für eine Grundreinigung wurde gesendet.",
  redirecting: "Weiterleitung zur sicheren Zahlung…",
  cancel: "Abbrechen",
  statusLabels: { submitted:"Eingereicht", under_review:"In Prüfung", approved:"Genehmigt", scheduled:"Geplant", completed:"Abgeschlossen", rejected:"Abgelehnt", cancelled:"Storniert" },
  errors: {
    subscription_not_active:"Nur ein aktives Abonnement kann eine Grundreinigung anfragen.",
    deep_clean_request_already_pending:"Für dieses Abonnement liegt bereits eine Anfrage vor.",
    invalid_dates:"Bitte geben Sie ein gültiges Datum ein.",
    start_date_in_past:"Das Datum darf nicht in der Vergangenheit liegen.",
    custom_quote_required:"Für diese Immobilie ist ein individuelles Angebot erforderlich. Bitte kontaktieren Sie den Support.",
    checkout_failed:"Die Zahlung konnte nicht gestartet werden. Bitte versuchen Sie es erneut.",
    payment_required:"Vor der Genehmigung dieser Anfrage ist eine Zahlung erforderlich.",
    bad_request:"Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
  },
});

Object.assign(portalCopy.pt.deepClean, {
  requestButton: "Solicitar uma limpeza profunda",
  freeBadge: "Grátis com a sua subscrição de 12 meses",
  usedMessage: "Já utilizou a sua limpeza profunda gratuita para este contrato.",
  usedOnMessage: "Utilizou a sua limpeza profunda gratuita em {date}.",
  upsellNote: "Deseja outra limpeza profunda? Está disponível como opção paga.",
  pendingMessage: "Já existe um pedido de limpeza profunda em processamento para esta subscrição.",
  modalTitle: "Solicitar uma limpeza profunda",
  dateLabel: "Data preferida",
  priceLabel: "Preço",
  freePriceLabel: "Grátis",
  submit: "Enviar pedido",
  submitting: "A enviar…",
  success: "O seu pedido de limpeza profunda foi enviado.",
  redirecting: "A redirecionar para pagamento seguro…",
  cancel: "Cancelar",
  statusLabels: { submitted:"Submetido", under_review:"Em análise", approved:"Aprovado", scheduled:"Agendado", completed:"Concluído", rejected:"Rejeitado", cancelled:"Cancelado" },
  errors: {
    subscription_not_active:"Apenas uma subscrição ativa pode solicitar uma limpeza profunda.",
    deep_clean_request_already_pending:"Já existe um pedido pendente para esta subscrição.",
    invalid_dates:"Introduza uma data válida.",
    start_date_in_past:"A data não pode ser no passado.",
    custom_quote_required:"Esta propriedade requer um orçamento personalizado. Contacte o apoio ao cliente.",
    checkout_failed:"Não foi possível iniciar o pagamento. Tente novamente.",
    payment_required:"É necessário pagamento antes que este pedido possa ser aprovado.",
    bad_request:"Ocorreu um erro. Tente novamente.",
  },
});

Object.assign(portalCopy.nl.properties, {
  columnAddress: "Adres", columnType: "Type",
  sizeLabel: "Oppervlakte", airConditioningLabel: "Airconditioners", accessLabel: "Toegang",
  roomsLabel: "Kamers", kitchensLabel: "Keukens", livingSpacesLabel: "Woonruimtes",
  outsideSpacesLabel: "Buitenruimtes", frequencyLabel: "Schoonmaakfrequentie",
  petsLabel: "Huisdieren", employeeIdLabel: "Medewerker-ID beoordeling",
  assessmentIdLabel: "Beoordelings-ID", submittedLabel: "Ingediend",
  scheduledLabel: "Geplande beoordeling", acceptedLabel: "Acceptatiedatum",
  pendingLabel: "Beoordeling in behandeling",
  noFindings: "Beoordelingsresultaten zijn nog niet geregistreerd.", noneLabel: "Geen",
  yesLabel: "Ja", noLabel: "Nee",
});

Object.assign(portalCopy.fr.properties, {
  columnAddress: "Adresse", columnType: "Type",
  sizeLabel: "Superficie", airConditioningLabel: "Climatiseurs", accessLabel: "Accès",
  roomsLabel: "Chambres", kitchensLabel: "Cuisines", livingSpacesLabel: "Espaces de vie",
  outsideSpacesLabel: "Espaces extérieurs", frequencyLabel: "Fréquence de nettoyage",
  petsLabel: "Animaux domestiques", employeeIdLabel: "Identifiant de l’employé d’évaluation",
  assessmentIdLabel: "ID de l’évaluation", submittedLabel: "Soumise",
  scheduledLabel: "Évaluation planifiée", acceptedLabel: "Date d’acceptation",
  pendingLabel: "Évaluation en attente",
  noFindings: "Les résultats de l’évaluation n’ont pas encore été enregistrés.", noneLabel: "Aucun",
  yesLabel: "Oui", noLabel: "Non",
});

Object.assign(portalCopy.ar.properties, {
  columnAddress: "العنوان", columnType: "النوع",
  sizeLabel: "المساحة", airConditioningLabel: "وحدات التكييف", accessLabel: "الدخول",
  roomsLabel: "الغرف", kitchensLabel: "المطابخ", livingSpacesLabel: "غرف المعيشة",
  outsideSpacesLabel: "المساحات الخارجية", frequencyLabel: "تكرار التنظيف",
  petsLabel: "الحيوانات الأليفة", employeeIdLabel: "معرف موظف التقييم",
  assessmentIdLabel: "معرف التقييم", submittedLabel: "تاريخ التقديم",
  scheduledLabel: "موعد التقييم", acceptedLabel: "تاريخ القبول",
  pendingLabel: "التقييم قيد الانتظار",
  noFindings: "لم يتم تسجيل نتائج التقييم بعد.", noneLabel: "لا يوجد",
  yesLabel: "نعم", noLabel: "لا",
});

Object.assign(portalCopy.es.properties, {
  columnAddress: "Dirección", columnType: "Tipo",
  sizeLabel: "Tamaño", airConditioningLabel: "Unidades de aire acondicionado", accessLabel: "Acceso",
  roomsLabel: "Habitaciones", kitchensLabel: "Cocinas", livingSpacesLabel: "Salones",
  outsideSpacesLabel: "Espacios exteriores", frequencyLabel: "Frecuencia de limpieza",
  petsLabel: "Mascotas", employeeIdLabel: "ID del empleado de la evaluación",
  assessmentIdLabel: "ID de la evaluación", submittedLabel: "Enviada",
  scheduledLabel: "Evaluación programada", acceptedLabel: "Fecha de aceptación",
  pendingLabel: "Evaluación pendiente",
  noFindings: "Los resultados de la evaluación aún no se han registrado.", noneLabel: "Ninguno",
  yesLabel: "Sí", noLabel: "No",
});

Object.assign(portalCopy.de.properties, {
  columnAddress: "Adresse", columnType: "Typ",
  sizeLabel: "Größe", airConditioningLabel: "Klimaanlagen", accessLabel: "Zugang",
  roomsLabel: "Zimmer", kitchensLabel: "Küchen", livingSpacesLabel: "Wohnräume",
  outsideSpacesLabel: "Außenbereiche", frequencyLabel: "Reinigungshäufigkeit",
  petsLabel: "Haustiere", employeeIdLabel: "Mitarbeiter-ID der Bewertung",
  assessmentIdLabel: "Bewertungs-ID", submittedLabel: "Eingereicht",
  scheduledLabel: "Geplante Bewertung", acceptedLabel: "Annahmedatum",
  pendingLabel: "Bewertung ausstehend",
  noFindings: "Die Bewertungsergebnisse wurden noch nicht erfasst.", noneLabel: "Keine",
  yesLabel: "Ja", noLabel: "Nein",
});

Object.assign(portalCopy.pt.properties, {
  columnAddress: "Morada", columnType: "Tipo",
  sizeLabel: "Tamanho", airConditioningLabel: "Unidades de ar condicionado", accessLabel: "Acesso",
  roomsLabel: "Quartos", kitchensLabel: "Cozinhas", livingSpacesLabel: "Salas de estar",
  outsideSpacesLabel: "Espaços exteriores", frequencyLabel: "Frequência de limpeza",
  petsLabel: "Animais de estimação", employeeIdLabel: "ID do funcionário da avaliação",
  assessmentIdLabel: "ID da avaliação", submittedLabel: "Submetido",
  scheduledLabel: "Avaliação agendada", acceptedLabel: "Data de aceitação",
  pendingLabel: "Avaliação pendente",
  noFindings: "Os resultados da avaliação ainda não foram registados.", noneLabel: "Nenhum",
  yesLabel: "Sim", noLabel: "Não",
});

Object.assign(portalCopy.nl.invoices, {
  monthlyStatementsTitle: "Maandelijkse overzichten", annualInvoicesTitle: "Jaarlijkse facturen", annualStatementsTitle: "Jaarlijkse overzichten",
  columnMonth: "Maand", columnUnit: "Eenheid", columnUnits: "Eenheden", columnTotal: "Totaal",
  filterByUnit: "Filteren op eenheid", allUnits: "Alle eenheden",
  onHoldLabel: "In de wacht", downloadStatement: "Overzicht downloaden",
  noStatements: "Nog geen maandelijkse overzichten.", noAnnualInvoices: "Nog geen jaarlijkse overzichten.",
  pauseNoticesTitle: "Pauzemeldingen", downloadNotice: "Melding downloaden",
  noPauseNotices: "Geen pauzemeldingen.",
  suspensionTitle: "Diensten tijdelijk opgeschort",
  suspensionBody: "Factuur {reference} van {amount} is onbetaald. Betaal vóór {date} om uw diensten te herstellen.",
  payNow: "Nu betalen",
  suspensionNoLinkNote: "Er wordt een nieuwe betaallink aangemaakt: kijk zo weer, of neem contact op met support.",
  finalSettlementBadge: "Eindafrekening",
});

Object.assign(portalCopy.fr.invoices, {
  monthlyStatementsTitle: "Relevés mensuels", annualInvoicesTitle: "Factures annuelles", annualStatementsTitle: "Relevés annuels",
  columnMonth: "Mois", columnUnit: "Unité", columnUnits: "Unités", columnTotal: "Total",
  filterByUnit: "Filtrer par unité", allUnits: "Toutes les unités",
  onHoldLabel: "En attente", downloadStatement: "Télécharger le relevé",
  noStatements: "Aucun relevé mensuel pour le moment.", noAnnualInvoices: "Aucun relevé annuel pour le moment.",
  pauseNoticesTitle: "Avis de pause", downloadNotice: "Télécharger l'avis",
  noPauseNotices: "Aucun avis de pause.",
  suspensionTitle: "Services temporairement suspendus",
  suspensionBody: "La facture {reference} de {amount} est impayée. Payez avant le {date} pour rétablir vos services.",
  payNow: "Payer maintenant",
  suspensionNoLinkNote: "Un nouveau lien de paiement est en cours de génération: revenez sous peu ou contactez le support.",
  finalSettlementBadge: "Décompte final",
});

Object.assign(portalCopy.ar.invoices, {
  monthlyStatementsTitle: "كشوف الحساب الشهرية", annualInvoicesTitle: "الفواتير السنوية", annualStatementsTitle: "كشوف الحساب السنوية",
  columnMonth: "الشهر", columnUnit: "الوحدة", columnUnits: "الوحدات", columnTotal: "الإجمالي",
  filterByUnit: "التصفية حسب الوحدة", allUnits: "جميع الوحدات",
  onHoldLabel: "موقوف مؤقتاً", downloadStatement: "تنزيل كشف الحساب",
  noStatements: "لا توجد كشوف حساب شهرية بعد.", noAnnualInvoices: "لا توجد كشوف حساب سنوية بعد.",
  pauseNoticesTitle: "إشعارات الإيقاف المؤقت", downloadNotice: "تنزيل الإشعار",
  noPauseNotices: "لا توجد إشعارات إيقاف مؤقت.",
  suspensionTitle: "الخدمات موقوفة مؤقتاً",
  suspensionBody: "الفاتورة {reference} بقيمة {amount} غير مدفوعة. ادفع قبل {date} لاستعادة خدماتك.",
  payNow: "الدفع الآن",
  suspensionNoLinkNote: "يتم إنشاء رابط دفع جديد: يرجى التحقق مرة أخرى قريباً أو التواصل مع الدعم.",
  finalSettlementBadge: "التسوية النهائية",
});

Object.assign(portalCopy.es.invoices, {
  monthlyStatementsTitle: "Resúmenes mensuales", annualInvoicesTitle: "Facturas anuales", annualStatementsTitle: "Resúmenes anuales",
  columnMonth: "Mes", columnUnit: "Unidad", columnUnits: "Unidades", columnTotal: "Total",
  filterByUnit: "Filtrar por unidad", allUnits: "Todas las unidades",
  onHoldLabel: "En pausa", downloadStatement: "Descargar resumen",
  noStatements: "Aún no hay resúmenes mensuales.", noAnnualInvoices: "Aún no hay resúmenes anuales.",
  pauseNoticesTitle: "Avisos de pausa", downloadNotice: "Descargar aviso",
  noPauseNotices: "Aún no hay avisos de pausa.",
  suspensionTitle: "Servicios suspendidos temporalmente",
  suspensionBody: "La factura {reference} de {amount} está impagada. Paga antes del {date} para restablecer tus servicios.",
  payNow: "Pagar ahora",
  suspensionNoLinkNote: "Se está generando un nuevo enlace de pago: vuelve a comprobarlo en breve o contacta con soporte.",
  finalSettlementBadge: "Liquidación final",
});

Object.assign(portalCopy.de.invoices, {
  monthlyStatementsTitle: "Monatliche Abrechnungen", annualInvoicesTitle: "Jahresrechnungen", annualStatementsTitle: "Jährliche Abrechnungen",
  columnMonth: "Monat", columnUnit: "Einheit", columnUnits: "Einheiten", columnTotal: "Gesamt",
  filterByUnit: "Nach Einheit filtern", allUnits: "Alle Einheiten",
  onHoldLabel: "Pausiert", downloadStatement: "Abrechnung herunterladen",
  noStatements: "Noch keine monatlichen Abrechnungen.", noAnnualInvoices: "Noch keine jährlichen Abrechnungen.",
  pauseNoticesTitle: "Pausenmitteilungen", downloadNotice: "Mitteilung herunterladen",
  noPauseNotices: "Noch keine Pausenmitteilungen.",
  suspensionTitle: "Leistungen vorübergehend ausgesetzt",
  suspensionBody: "Rechnung {reference} über {amount} ist unbezahlt. Zahlen Sie bis {date}, um Ihre Leistungen wiederherzustellen.",
  payNow: "Jetzt bezahlen",
  suspensionNoLinkNote: "Ein neuer Zahlungslink wird erstellt: bitte schauen Sie in Kürze wieder vorbei oder kontaktieren Sie den Support.",
  finalSettlementBadge: "Endabrechnung",
});

Object.assign(portalCopy.pt.invoices, {
  monthlyStatementsTitle: "Extratos mensais", annualInvoicesTitle: "Faturas anuais", annualStatementsTitle: "Extratos anuais",
  columnMonth: "Mês", columnUnit: "Unidade", columnUnits: "Unidades", columnTotal: "Total",
  filterByUnit: "Filtrar por unidade", allUnits: "Todas as unidades",
  onHoldLabel: "Em espera", downloadStatement: "Transferir extrato",
  noStatements: "Ainda não existem extratos mensais.", noAnnualInvoices: "Ainda não existem extratos anuais.",
  pauseNoticesTitle: "Avisos de pausa", downloadNotice: "Transferir aviso",
  noPauseNotices: "Ainda não existem avisos de pausa.",
  suspensionTitle: "Serviços temporariamente suspensos",
  suspensionBody: "A fatura {reference} de {amount} está por pagar. Pague até {date} para restabelecer os seus serviços.",
  payNow: "Pagar agora",
  suspensionNoLinkNote: "Está a ser gerada uma nova ligação de pagamento: volte a verificar em breve ou contacte o apoio.",
  finalSettlementBadge: "Acerto final",
});

Object.assign(portalCopy.nl.cancellation, {
  requestButton: "Vroegtijdige beëindiging aanvragen",
  modalTitle: "Eindafrekening bij vroegtijdige beëindiging",
  loading: "Uw afrekening wordt berekend…",
  contractLabel: "Contract",
  startDateLabel: "Startdatum",
  originalEndDateLabel: "Oorspronkelijke einddatum",
  currentMonthLabel: "Maand {current} van {total}",
  originalDiscountLabel: "Ontvangen korting",
  itemizedTitle: "Gespecificeerde afrekening",
  discountCorrectionLabel: "Kortingscorrectie voor reeds verstreken maanden",
  remainingMinimumLabel: "Resterende minimumtermijn",
  outstandingInvoicesLabel: "Openstaande facturen",
  deepCleanRecoveryLabel: "Terugvordering gratis grondige schoonmaak",
  creditsLabel: "Tegoeden",
  totalLabel: "Totaal verschuldigd",
  noChargeMessage: "Uw contracttermijn is al volledig verstreken: er geldt geen kosten voor vroegtijdige beëindiging.",
  disclosure: "Dit verwijdert of vermindert geen reeds verschuldigd bedrag. Bevestigen stopt toekomstige schoonmaakdiensten en genereert, indien een bedrag verschuldigd is, een eindafrekening die binnen de aangegeven termijn betaald moet worden.",
  confirmButton: "Opzegging bevestigen",
  confirming: "Bevestigen…",
  cancel: "Sluiten",
  successNoSettlement: "Uw abonnement is opgezegd. Er is geen verdere betaling vereist.",
  successWithSettlement: "Uw opzegging is bevestigd. Er is een eindafrekening gegenereerd.",
  payNow: "Afrekening nu betalen",
  alreadyPendingMessage: "Er wordt al een opzeggingsverzoek verwerkt voor dit abonnement.",
  errors: {
    already_cancelled: "Dit abonnement is al opgezegd.",
    cancellation_already_in_progress: "Er wordt al een opzeggingsverzoek verwerkt voor dit abonnement.",
    no_fixed_term_contract: "Dit abonnement heeft geen vaste contracttermijn, dus vroegtijdige beëindiging is niet van toepassing.",
    feature_disabled: "Vroegtijdige beëindiging is momenteel niet beschikbaar. Neem contact op met support.",
    calculation_expired: "Deze afrekening is verlopen. Vraag een nieuwe aan.",
    calculation_not_pending: "Deze afrekening is niet meer geldig. Vraag een nieuwe aan.",
    bad_request: "Er is iets misgegaan. Probeer het opnieuw.",
  },
});

Object.assign(portalCopy.fr.cancellation, {
  requestButton: "Demander une résiliation anticipée",
  modalTitle: "Décompte de résiliation anticipée",
  loading: "Calcul de votre décompte…",
  contractLabel: "Contrat",
  startDateLabel: "Date de début",
  originalEndDateLabel: "Date de fin initiale",
  currentMonthLabel: "Mois {current} sur {total}",
  originalDiscountLabel: "Remise obtenue",
  itemizedTitle: "Décompte détaillé",
  discountCorrectionLabel: "Correction de remise pour les mois déjà écoulés",
  remainingMinimumLabel: "Solde de la durée minimale restante",
  outstandingInvoicesLabel: "Factures impayées",
  deepCleanRecoveryLabel: "Récupération du nettoyage en profondeur offert",
  creditsLabel: "Crédits",
  totalLabel: "Total dû",
  noChargeMessage: "Votre durée contractuelle est déjà entièrement écoulée: aucun frais de résiliation anticipée ne s'applique.",
  disclosure: "Cela ne supprime ni ne réduit les montants déjà dus. La confirmation arrête les services de nettoyage futurs et, si un solde est dû, génère une facture de décompte final payable dans le délai indiqué.",
  confirmButton: "Confirmer la résiliation",
  confirming: "Confirmation…",
  cancel: "Fermer",
  successNoSettlement: "Votre abonnement a été résilié. Aucun paiement supplémentaire n'est requis.",
  successWithSettlement: "Votre résiliation est confirmée. Une facture de décompte final a été générée.",
  payNow: "Payer le décompte maintenant",
  alreadyPendingMessage: "Une demande de résiliation est déjà en cours de traitement pour cet abonnement.",
  errors: {
    already_cancelled: "Cet abonnement a déjà été résilié.",
    cancellation_already_in_progress: "Une demande de résiliation est déjà en cours de traitement pour cet abonnement.",
    no_fixed_term_contract: "Cet abonnement n'a pas de durée contractuelle fixe ; la résiliation anticipée ne s'applique donc pas.",
    feature_disabled: "La résiliation anticipée n'est pas disponible actuellement. Merci de contacter l'assistance.",
    calculation_expired: "Ce décompte a expiré. Merci d'en demander un nouveau.",
    calculation_not_pending: "Ce décompte n'est plus valide. Merci d'en demander un nouveau.",
    bad_request: "Une erreur s'est produite. Merci de réessayer.",
  },
});

Object.assign(portalCopy.ar.cancellation, {
  requestButton: "طلب الإنهاء المبكر",
  modalTitle: "تسوية الإنهاء المبكر",
  loading: "جارٍ حساب تسويتك…",
  contractLabel: "العقد",
  startDateLabel: "تاريخ البدء",
  originalEndDateLabel: "تاريخ الانتهاء الأصلي",
  currentMonthLabel: "الشهر {current} من {total}",
  originalDiscountLabel: "الخصم المستلم",
  itemizedTitle: "تفاصيل التسوية",
  discountCorrectionLabel: "تصحيح الخصم للأشهر المنقضية بالفعل",
  remainingMinimumLabel: "رسوم المدة الدنيا المتبقية",
  outstandingInvoicesLabel: "الفواتير المستحقة",
  deepCleanRecoveryLabel: "استرداد قيمة التنظيف العميق المجاني",
  creditsLabel: "الأرصدة الدائنة",
  totalLabel: "الإجمالي المستحق",
  noChargeMessage: "لقد انقضت مدة عقدك بالكامل بالفعل: لا تُطبَّق أي رسوم إنهاء مبكر.",
  disclosure: "هذا لا يلغي أو يقلل أي مبلغ مستحق عليك بالفعل. يؤدي التأكيد إلى إيقاف خدمات التنظيف المستقبلية، وفي حال استحقاق رصيد، يتم إصدار فاتورة تسوية نهائية واجبة الدفع خلال المهلة المحددة.",
  confirmButton: "تأكيد الإلغاء",
  confirming: "جارٍ التأكيد…",
  cancel: "إغلاق",
  successNoSettlement: "تم إلغاء اشتراكك. لا حاجة لأي دفعة إضافية.",
  successWithSettlement: "تم تأكيد إلغائك. تم إصدار فاتورة تسوية نهائية.",
  payNow: "دفع التسوية الآن",
  alreadyPendingMessage: "يوجد بالفعل طلب إلغاء قيد المعالجة لهذا الاشتراك.",
  errors: {
    already_cancelled: "تم إلغاء هذا الاشتراك بالفعل.",
    cancellation_already_in_progress: "يوجد بالفعل طلب إلغاء قيد المعالجة لهذا الاشتراك.",
    no_fixed_term_contract: "لا يحتوي هذا الاشتراك على مدة عقد ثابتة، لذا لا ينطبق الإنهاء المبكر.",
    feature_disabled: "الإنهاء المبكر غير متاح حالياً. يرجى التواصل مع الدعم.",
    calculation_expired: "انتهت صلاحية عرض التسوية هذا. يرجى طلب عرض جديد.",
    calculation_not_pending: "لم يعد عرض التسوية هذا صالحاً. يرجى طلب عرض جديد.",
    bad_request: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
  },
});

Object.assign(portalCopy.es.cancellation, {
  requestButton: "Solicitar terminación anticipada",
  modalTitle: "Liquidación por terminación anticipada",
  loading: "Calculando tu liquidación…",
  contractLabel: "Contrato",
  startDateLabel: "Fecha de inicio",
  originalEndDateLabel: "Fecha de fin original",
  currentMonthLabel: "Mes {current} de {total}",
  originalDiscountLabel: "Descuento recibido",
  itemizedTitle: "Liquidación detallada",
  discountCorrectionLabel: "Corrección de descuento por los meses ya transcurridos",
  remainingMinimumLabel: "Cargo por el período mínimo restante",
  outstandingInvoicesLabel: "Facturas pendientes",
  deepCleanRecoveryLabel: "Recuperación de la limpieza profunda gratuita",
  creditsLabel: "Créditos",
  totalLabel: "Total adeudado",
  noChargeMessage: "Tu período contractual ya se ha cumplido por completo: no se aplica ningún cargo por terminación anticipada.",
  disclosure: "Esto no elimina ni reduce ningún importe ya adeudado. Confirmar detiene los servicios de limpieza futuros y, si hay un saldo pendiente, genera una factura de liquidación final pagadera dentro del plazo indicado.",
  confirmButton: "Confirmar cancelación",
  confirming: "Confirmando…",
  cancel: "Cerrar",
  successNoSettlement: "Tu suscripción ha sido cancelada. No se requiere ningún pago adicional.",
  successWithSettlement: "Tu cancelación está confirmada. Se ha generado una factura de liquidación final.",
  payNow: "Pagar liquidación ahora",
  alreadyPendingMessage: "Ya se está procesando una solicitud de cancelación para esta suscripción.",
  errors: {
    already_cancelled: "Esta suscripción ya ha sido cancelada.",
    cancellation_already_in_progress: "Ya se está procesando una solicitud de cancelación para esta suscripción.",
    no_fixed_term_contract: "Esta suscripción no tiene un plazo contractual fijo, por lo que la terminación anticipada no aplica.",
    feature_disabled: "La terminación anticipada no está disponible actualmente. Contacta con soporte.",
    calculation_expired: "Esta cotización de liquidación ha caducado. Solicita una nueva.",
    calculation_not_pending: "Esta cotización de liquidación ya no es válida. Solicita una nueva.",
    bad_request: "Algo salió mal. Inténtalo de nuevo.",
  },
});

Object.assign(portalCopy.de.cancellation, {
  requestButton: "Vorzeitige Kündigung beantragen",
  modalTitle: "Abrechnung bei vorzeitiger Kündigung",
  loading: "Ihre Abrechnung wird berechnet…",
  contractLabel: "Vertrag",
  startDateLabel: "Startdatum",
  originalEndDateLabel: "Ursprüngliches Enddatum",
  currentMonthLabel: "Monat {current} von {total}",
  originalDiscountLabel: "Erhaltener Rabatt",
  itemizedTitle: "Detaillierte Abrechnung",
  discountCorrectionLabel: "Rabattkorrektur für bereits vergangene Monate",
  remainingMinimumLabel: "Verbleibende Mindestvertragslaufzeit",
  outstandingInvoicesLabel: "Offene Rechnungen",
  deepCleanRecoveryLabel: "Rückforderung der kostenlosen Grundreinigung",
  creditsLabel: "Gutschriften",
  totalLabel: "Gesamtbetrag fällig",
  noChargeMessage: "Ihre Vertragslaufzeit ist bereits vollständig erfüllt: es fallen keine Kosten für eine vorzeitige Kündigung an.",
  disclosure: "Dies entfernt oder reduziert keinen bereits geschuldeten Betrag. Die Bestätigung beendet zukünftige Reinigungsleistungen und erstellt, falls ein Betrag fällig ist, eine Endabrechnung, die innerhalb der angegebenen Frist zu zahlen ist.",
  confirmButton: "Kündigung bestätigen",
  confirming: "Wird bestätigt…",
  cancel: "Schließen",
  successNoSettlement: "Ihr Abonnement wurde gekündigt. Es ist keine weitere Zahlung erforderlich.",
  successWithSettlement: "Ihre Kündigung ist bestätigt. Eine Endabrechnung wurde erstellt.",
  payNow: "Abrechnung jetzt bezahlen",
  alreadyPendingMessage: "Für dieses Abonnement wird bereits ein Kündigungsantrag bearbeitet.",
  errors: {
    already_cancelled: "Dieses Abonnement wurde bereits gekündigt.",
    cancellation_already_in_progress: "Für dieses Abonnement wird bereits ein Kündigungsantrag bearbeitet.",
    no_fixed_term_contract: "Dieses Abonnement hat keine feste Vertragslaufzeit, daher gilt keine vorzeitige Kündigung.",
    feature_disabled: "Die vorzeitige Kündigung ist derzeit nicht verfügbar. Bitte kontaktieren Sie den Support.",
    calculation_expired: "Dieses Abrechnungsangebot ist abgelaufen. Bitte fordern Sie ein neues an.",
    calculation_not_pending: "Dieses Abrechnungsangebot ist nicht mehr gültig. Bitte fordern Sie ein neues an.",
    bad_request: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
  },
});

Object.assign(portalCopy.pt.cancellation, {
  requestButton: "Solicitar rescisão antecipada",
  modalTitle: "Acerto de rescisão antecipada",
  loading: "A calcular o seu acerto…",
  contractLabel: "Contrato",
  startDateLabel: "Data de início",
  originalEndDateLabel: "Data de fim original",
  currentMonthLabel: "Mês {current} de {total}",
  originalDiscountLabel: "Desconto recebido",
  itemizedTitle: "Acerto detalhado",
  discountCorrectionLabel: "Correção de desconto pelos meses já decorridos",
  remainingMinimumLabel: "Encargo do período mínimo remanescente",
  outstandingInvoicesLabel: "Faturas em aberto",
  deepCleanRecoveryLabel: "Recuperação da limpeza profunda gratuita",
  creditsLabel: "Créditos",
  totalLabel: "Total devido",
  noChargeMessage: "O seu período contratual já foi totalmente cumprido: não se aplica qualquer encargo de rescisão antecipada.",
  disclosure: "Isto não remove nem reduz qualquer montante já devido. Ao confirmar, os serviços de limpeza futuros são interrompidos e, caso exista saldo devedor, é gerada uma fatura de acerto final a pagar dentro do prazo indicado.",
  confirmButton: "Confirmar cancelamento",
  confirming: "A confirmar…",
  cancel: "Fechar",
  successNoSettlement: "A sua subscrição foi cancelada. Não é necessário qualquer pagamento adicional.",
  successWithSettlement: "O seu cancelamento está confirmado. Foi gerada uma fatura de acerto final.",
  payNow: "Pagar acerto agora",
  alreadyPendingMessage: "Já está a ser processado um pedido de cancelamento para esta subscrição.",
  errors: {
    already_cancelled: "Esta subscrição já foi cancelada.",
    cancellation_already_in_progress: "Já está a ser processado um pedido de cancelamento para esta subscrição.",
    no_fixed_term_contract: "Esta subscrição não tem um prazo contratual fixo, pelo que a rescisão antecipada não se aplica.",
    feature_disabled: "A rescisão antecipada não está atualmente disponível. Contacte o apoio ao cliente.",
    calculation_expired: "Este orçamento de acerto expirou. Solicite um novo.",
    calculation_not_pending: "Este orçamento de acerto já não é válido. Solicite um novo.",
    bad_request: "Ocorreu um erro. Tente novamente.",
  },
});

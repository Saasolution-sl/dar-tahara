import type { DeepPartial } from "../types";
import type { Dictionary } from "./en";

/** French: complete translation. */
const fr: DeepPartial<Dictionary> = {
  meta: {
    title: "Dar Tahara: Conciergerie & entretien de résidence premium",
    description:
      "Dar Tahara est une conciergerie résidentielle premium au Maroc. Nettoyage professionnel, inspections et entretien pour rentrer toujours dans un intérieur parfait.",
    ogAlt: "Dar Tahara: Maison de la Pureté",
  },
  brand: {
    name: "Dar Tahara",
    meaning: "Maison de la Pureté",
    tagline: "Rentrez toujours dans le confort.",
  },
  nav: {
    about: "À propos",
    missionVision: "Mission & Vision",
    peopleCommunity: "Personnes & Communauté",
    serviceAreas: "Zones desservies",
    why: "Pourquoi Dar Tahara",
    services: "Services",
    plans: "Formules",
    pricing: "Tarifs",
    how: "Comment ça marche",
    gallery: "Galerie",
    faq: "FAQ",
    book: "Réserver l’Évaluation Initiale",
    login: "Connexion",
    myAccount: "Mon compte",
    menu: "Menu",
    close: "Fermer",
    language: "Langue",
    theme: "Thème",
  },
  hero: {
    eyebrow: "Entretien & conciergerie de résidence",
    title: "Votre maison mérite mieux qu’un ménage: elle mérite un soin d’exception.",
    subtitle:
      "Pour les propriétaires, expatriés et propriétaires de résidences secondaires partout au Maroc. Nous nettoyons, inspectons et entretenons votre bien avec une précision discrète: pour que vous retrouviez le confort, jamais les soucis.",
    ctaPrimary: "Réserver l’Évaluation Initiale",
    ctaTertiary: "En savoir plus",
    stat1Value: "500+",
    stat1Label: "Foyers entretenus",
    stat2Value: "12 ans",
    stat2Label: "Ancienneté moyenne des clients",
    stat3Value: "24 h",
    stat3Label: "Temps de réponse",
    imageAlt: "Un salon serein baigné de lumière, préparé à la perfection",
  },
  why: {
    eyebrow: "Pourquoi Dar Tahara",
    title: "La tranquillité d’esprit, livrée à votre porte.",
    subtitle:
      "Dar Tahara signifie Maison de la Pureté. Nous ne sommes pas une entreprise de ménage: nous sommes les gardiens de confiance de votre maison en votre absence, et la raison pour laquelle tout semble sans effort à votre retour.",
    pillars: [
      {
        title: "Confiance absolue",
        body: "Un modèle de service fondé sur des vérifications adaptées à chaque fonction, une formation structurée, une gestion discrète des clés et une responsabilité claire.",
      },
      {
        title: "Qualité sans compromis",
        body: "Un standard méticuleux appliqué à chaque surface, chaque détail: inspecté, photographié et validé.",
      },
      {
        title: "Sans effort pour vous",
        body: "Un interlocuteur unique, des nouvelles proactives et une maison simplement, sereinement prête avant votre arrivée.",
      },
      {
        title: "Discrétion totale",
        body: "Votre maison, votre emploi du temps et votre intimité sont traités avec la confidentialité d’un concierge privé.",
      },
    ],
  },
  services: {
    eyebrow: "Ce que nous faisons",
    title: "Un soin complet pour chaque recoin de votre maison.",
    subtitle:
      "D’un simple nettoyage impeccable à la gestion complète de votre résidence secondaire: choisissez exactement ce dont votre bien a besoin.",
    items: [
      { title: "Ménage premium", body: "Un nettoyage raffiné de haut en bas, adapté aux belles demeures et aux finitions délicates." },
      { title: "Ménage récurrent", body: "Un entretien hebdomadaire ou bimensuel qui garde votre maison constamment impeccable." },
      { title: "Entrée / sortie des lieux", body: "Une remise impeccable, que vous arriviez, partiez ou changiez de locataire." },
      { title: "Inspections du bien", body: "Des visites programmées avec rapports photo sur l’état de votre maison." },
      { title: "Contrôles d’entretien", body: "Des vérifications proactives de la plomberie, des appareils et de la sécurité avant tout problème." },
      { title: "Gestion des clés", body: "Procédures de garde sécurisée des clés, avec accès enregistré et approuvé." },
      { title: "Préparation de résidence secondaire", body: "Une maison prête à l’arrivée : linge frais, essentiels réapprovisionnés, température parfaite." },
      { title: "Blanchisserie & linge", body: "Blanchisserie de niveau hôtelier, repassage et linge net dressé sur demande." },
      { title: "Nettoyage en profondeur", body: "Un nettoyage intensif et réparateur pour les remises à neuf saisonnières et grandes occasions." },
      { title: "Nettoyage après travaux", body: "Poussière, résidus et débris éliminés pour révéler votre espace fini." },
      { title: "Ménage d’urgence", body: "Une réponse rapide pour des invités de dernière minute, un événement ou l’imprévu." },
      { title: "Gestion de résidence secondaire", body: "Une prise en charge complète de votre seconde maison, gérée comme si c’était la nôtre." },
    ],
  },
  plans: {
    eyebrow: "Formules d’abonnement",
    title: "Un soin au rythme qui convient à votre vie.",
    subtitle:
      "Des formules simples et transparentes, avec les changements de visite et la résiliation gérés dans le portail client selon les Conditions. Chaque formule inclut des rapports d’inspection et Dar Tahara Support.",
    perMonthNote: "Tarif personnalisé selon la surface et les besoins du bien.",
    mostPopular: "Le plus populaire",
    cta: "Choisir la formule",
    items: [
      {
        name: "Hebdomadaire",
        tagline: "Pour les maisons toujours occupées",
        features: ["Ménage premium hebdomadaire", "Changement de linge & blanchisserie", "Rapport d’inspection à chaque visite", "Planification prioritaire"],
      },
      {
        name: "Bimensuel",
        tagline: "L’équilibre réfléchi",
        features: ["Ménage toutes les deux semaines", "Contrôles d’entretien ponctuels", "Rapport d’inspection photo", "Reprogrammation flexible"],
      },
      {
        name: "Mensuel",
        tagline: "Pour un entretien léger",
        features: ["Nettoyage en profondeur mensuel", "Inspection complète du bien", "Bilan d’entretien saisonnier", "Coordinateur dédié"],
      },
      {
        name: "Sur mesure",
        tagline: "Entièrement conçu autour de vous",
        features: ["Fréquence de visite sur mesure", "Conciergerie complète & gestion des clés", "Gestion de résidence secondaire", "Un interlocuteur unique"],
      },
    ],
  },
  how: {
    eyebrow: "Comment ça marche",
    title: "Six étapes sereines vers une maison qui se soigne d’elle-même.",
    steps: [
      { title: "Réserver", body: "Parlez-nous de votre maison et de votre rythme en une demande de deux minutes." },
      { title: "Nous venons", body: "Un coordinateur se déplace pour comprendre votre espace et vos préférences." },
      { title: "Nous nettoyons", body: "Une formation structurée des équipes est conçue pour soutenir notre niveau d’exigence à chaque intervention." },
      { title: "Nous inspectons", body: "Chaque visite se termine par une inspection documentée et photographiée." },
      { title: "Vous arrivez", body: "Retrouvez du linge frais, un air apaisé et chaque chose à sa place." },
      { title: "Profitez", body: "Détendez-vous, ressourcez-vous et savourez simplement le confort de la maison." },
    ],
  },
  audiences: {
    eyebrow: "Ceux dont nous prenons soin",
    title: "La confiance de ceux qui tiennent à leur temps et à leur maison.",
    items: [
      { title: "Personnes vivant à l’étranger", body: "Votre maison marocaine, impeccable et prête entre deux séjours." },
      { title: "Professionnels très occupés", body: "Retrouvez vos soirées et week-ends: nous nous occupons du reste." },
      { title: "Familles", body: "Une maison saine et impeccable pour vous concentrer sur l’essentiel." },
      { title: "Propriétaires de résidences secondaires", body: "Arrivez dans une maison où les vacances semblent déjà commencées." },
      { title: "Propriétaires Airbnb", body: "Des rotations cinq étoiles, réapprovisionnement et présentation prête pour les voyageurs." },
      { title: "Investisseurs immobiliers", body: "Des biens protégés, inspectés et entretenus pour préserver leur valeur." },
    ],
  },
  testimonials: {
    eyebrow: "Dans leurs mots",
    title: "La confiance tranquille d’une maison bien entretenue.",
    items: [
      {
        quote:
          "Je vis à Bruxelles et ne visite Tanger que quelques fois par an. J’arrive désormais dans une maison qui semble aimée. Je ne m’en inquiète plus jamais.",
        name: "Yasmine B.",
        role: "Propriétaire, Tanger",
      },
      {
        quote:
          "Les rapports d’inspection sont extraordinaires. Photos, notes, tout est documenté. C’est comme avoir un gestionnaire de biens et une gouvernante à la fois.",
        name: "Thomas R.",
        role: "Investisseur, Marrakech",
      },
      {
        quote:
          "Nos avis Airbnb mentionnent désormais la propreté dans presque chaque commentaire. Dar Tahara a tout simplement élevé notre standard.",
        name: "Karim & Sofia",
        role: "Hôtes, Casablanca",
      },
    ],
  },
  gallery: {
    eyebrow: "Avant & après",
    title: "La différence est dans les détails.",
    subtitle: "Un aperçu du standard que nous apportons à chaque maison.",
    before: "Avant",
    after: "Après",
    items: [
      { label: "Restauration du salon" },
      { label: "Nettoyage en profondeur de la cuisine" },
      { label: "Rafraîchissement de la suite parentale" },
    ],
  },
  faq: {
    eyebrow: "Bon à savoir",
    title: "Questions fréquentes",
    items: [
      {
        q: "Comment vérifierez-vous le personnel et protégerez-vous les clés ?",
        a: "Notre modèle opérationnel prévoit des vérifications adaptées à chaque fonction et une formation structurée à mesure que nos services sont lancés et se développent. Pour les clients nous confiant leurs clés, nous prévoyons une chaîne de garde enregistrée assurant une responsabilité claire.",
      },
      {
        q: "Comment fonctionne la gestion des clés ?",
        a: "Nous conservons vos clés en sécurité et n’accédons à votre maison que pour des visites programmées ou approuvées. Chaque entrée et sortie est enregistrée, et vous recevez un rapport après chaque visite.",
      },
      {
        q: "Pouvez-vous préparer ma maison avant mon arrivée ?",
        a: "Oui. Communiquez-nous vos détails d’arrivée et nous veillerons à du linge frais, une maison impeccable, une température agréable et tous les essentiels souhaités: prêts dès que vous franchissez la porte.",
      },
      {
        q: "Quelles villes desservez-vous ?",
        a: "Nous intervenons actuellement principalement à Tétouan, Tanger, Meknès et Casablanca, avec une couverture en expansion continue. Contactez-nous pour confirmer votre secteur.",
      },
      {
        q: "Puis-je suspendre, modifier ou résilier ma formule ?",
        a: "Une suspension ne peut être demandée que pour un abonnement de 9 ou 12 mois, sous réserve d'approbation. Les changements de visite autorisés et la résiliation se gèrent dans le portail client : au moins 48 heures pour une visite et un mois pour la résiliation, selon les Conditions.",
      },
      {
        q: "Quels produits utilisez-vous ?",
        a: "Nous utilisons des produits professionnels, efficaces et soigneusement choisis, avec des options écoresponsables et respectueuses des surfaces pour les finitions délicates et les foyers sensibles, sur demande.",
      },
      {
        q: "Quelles durées d'abonnement sont disponibles ?",
        a: "Dar Tahara propose des abonnements à durée fixe de 3, 6, 9 et 12 mois.",
      },
      {
        q: "Les abonnements plus longs coûtent-ils moins cher ?",
        a: "Oui. Les remises standard de durée sont de 5 % pour six mois, 10 % pour neuf mois et 15 % pour douze mois. L'abonnement de trois mois utilise le prix standard.",
      },
      {
        q: "Quand une suspension peut-elle être approuvée ?",
        a: "Une suspension est prévue pour des situations telles que des travaux de construction, une rénovation importante, des dommages graves à la propriété ou une inaccessibilité temporaire.",
      },
      {
        q: "Puis-je suspendre parce que je voyage ?",
        a: "Les vacances, les voyages, l'absence temporaire, la faible occupation ou le fait de ne pas avoir besoin de ménage temporairement ne sont normalement pas éligibles.",
      },
      {
        q: "Qu'advient-il de mon contrat pendant une suspension ?",
        a: "Le ménage et la facturation récurrente sont suspendus pendant la période approuvée, et la date de fin du contrat est prolongée de la même période.",
      },
      {
        q: "Puis-je utiliser deux suspensions séparées d'un mois ?",
        a: "Non. L'avantage permet une suspension unique allant jusqu'à deux mois consécutifs par contrat.",
      },
      {
        q: "Une suspension non utilisée est-elle reportée ?",
        a: "Non. Une suspension non utilisée n'a aucune valeur monétaire et n'est pas reportée sur un autre contrat.",
      },
      {
        q: "Dar Tahara est-elle aussi connue sous le nom DarTahara ?",
        a: "Oui. Dar Tahara s'écrit parfois DarTahara ou dartahara, et dartahara.com est le site officiel de Dar Tahara, une conciergerie résidentielle professionnelle au Maroc.",
      },
    ],
  },
  cta: {
    eyebrow: "Prêts quand vous l’êtes",
    title: "Rentrez toujours dans le confort.",
    subtitle:
      "Laissez-nous prendre soin de votre maison, pour ne plus jamais y penser. Réservez une première visite ou demandez un devis sur mesure dès aujourd’hui.",
    ctaPrimary: "Réserver l’Évaluation Initiale",
    whatsapp: "Discuter sur WhatsApp",
    whatsappInfo: "Discutez avec l’assistant Dar Tahara sur WhatsApp au sujet des services, tarifs, abonnements, accès au logement et réservations. Les demandes d’assistance complexes peuvent être transférées par e-mail à Dar Tahara Support.",
    whatsappPrivacy: "Il s’agit d’un assistant automatisé. N’envoyez pas de données de paiement, mots de passe ou codes d’accès complets.",
  },
  calculator: {
    eyebrow: "Tarifs transparents",
    title: "Estimez votre entretien mensuel.",
    subtitle:
      "Déplacez le curseur et choisissez un rythme. Votre estimation se met à jour instantanément: sans inscription, sans surprise.",
    sizeLabel: "Surface du bien",
    sizeUnit: "m²",
    sizeHelp: "Saisissez ou faites glisser entre 20 et 250 m².",
    overMax: "Mon bien fait plus de 250 m²",
    frequencyLabel: "Fréquence de ménage",
    visitsSuffix: "par mois",
    recommended: "Le plus populaire",
    noDiscount: "Sans remise",
    discountLabel: "de remise",
    freq: {
      monthly: { name: "Une fois par mois", visits: "1 visite par mois", note: "Un rafraîchissement mensuel en profondeur." },
      biweekly: { name: "Bimensuel", visits: "2 visites par mois", note: "L’équilibre réfléchi entre soin et valeur." },
      weekly: { name: "Hebdomadaire", visits: "4 visites par mois", note: "Toujours impeccable, toujours prêt." },
      irregular: {
        name: "Airbnb & locations",
        visits: "Prix par semaine",
        note: "Ménage de rotation pour Airbnb & locations de courte durée. Inclut les produits de base, le matériel d’entretien et le papier toilette.",
      },
    },
    durationLabel: "Durée de l'abonnement",
    durationHelp: "Choisissez la durée de votre engagement: les durées plus longues offrent de meilleures économies.",
    duration: {
      "3_month": { name: "3 mois", tag: "Début flexible" },
      "6_month": { name: "6 mois", tag: "Économisez 5 %" },
      "9_month": { name: "9 mois", tag: "Économisez 10 %" },
      "12_month": { name: "12 mois", tag: "Économisez 15 %" },
      bestValue: "Meilleure offre",
      pauseBenefit: "Avantage suspension",
    },
    result: {
      heading: "Votre estimation",
      propertySize: "Surface du bien",
      pricePerCleaning: "Prix par ménage",
      frequency: "Fréquence",
      visits: "Visites de ménage",
      visitsValue: "{n} par mois",
      subtotal: "Sous-total avant remise",
      discount: "Remise de fréquence",
      areaSurcharge: "Surface additionnelle",
      youSave: "Vous économisez",
      monthlyTotal: "Total mensuel estimé",
      perMonth: "/ mois",
      perWeek: "/ semaine",
      pricePerWeek: "Prix par semaine",
      effective: "Prix effectif par visite",
      contractDuration: "Contrat",
      priceBeforeDuration: "Prix avant ajustement de durée",
      durationDiscount: "Remise de contrat",
      durationSavings: "Vous économisez",
      minimumContractValue: "Valeur minimale du contrat",
      pauseBenefitNote: "Une suspension approuvée allant jusqu'à deux mois consécutifs",
      chooseDuration: "Choisissez une durée d'abonnement pour voir le prix de votre contrat.",
    },
    custom: {
      title: "Une demeure d’exception mérite une évaluation individuelle.",
      body: "Les biens de plus de 250 m² sont étudiés individuellement avant la préparation d’une proposition.",
      cta: "Demander une évaluation",
    },
    cta: {
      book: "Réservez l’Évaluation Initiale",
    },
    disclaimer:
      "Ceci est un prix estimé basé sur la surface du bien et la fréquence de ménage sélectionnée. Le prix final peut varier selon l’état du bien, l’accessibilité, les services complémentaires et les exigences de nettoyage spécifiques.",
    optionalNote:
      "Des services optionnels tels que le nettoyage en profondeur, le lavage des vitres, la blanchisserie, le changement de linge, le nettoyage de terrasse et le nettoyage après construction peuvent être facturés séparément.",
    materialsNote:
      "Cette formule inclut les produits d’entretien de base, le matériel et le papier toilette, réapprovisionnés à chaque visite.",
  },
  enquiry: {
    title: "Réservez votre ménage",
    subtitle: "Communiquez-nous quelques détails et nous confirmerons votre première visite sous 24 heures.",
    summary: "Votre sélection",
    fields: {
      name: "Nom complet",
      email: "Adresse e-mail",
      phone: "Téléphone ou WhatsApp",
      location: "Emplacement du bien",
      size: "Surface du bien (m²)",
      frequency: "Fréquence de ménage",
      startDate: "Date de début souhaitée",
      message: "Message (facultatif)",
      messagePlaceholder: "Y a-t-il quelque chose à savoir sur votre maison ?",
    },
    required: "Obligatoire",
    invalidEmail: "Veuillez saisir une adresse e-mail valide.",
    submitWhatsApp: "Envoyer via WhatsApp",
    submitEmail: "Envoyer par e-mail",
    cancel: "Annuler",
    close: "Fermer",
    successTitle: "Merci.",
    successBody: "Vos informations sont prêtes à être envoyées. Choisissez WhatsApp ou e-mail pour finaliser votre demande.",
    monthlyEstimate: "Total mensuel estimé",
    customSelected: "Devis sur mesure (plus de 250 m²)",
  },
  booking: {
    title: "Réservez votre Évaluation initiale du logement",
    subtitle:
      "Votre première visite nous permet d'évaluer professionnellement votre logement, d'effectuer un premier nettoyage en profondeur si nécessaire et de préparer votre plan de ménage personnalisé.",
    close: "Fermer",
    pay: "Envoyer la demande d’évaluation",
    paySecure:
      "Paiement sécurisé via Stripe. Votre abonnement ne commence qu'après la réalisation et l'approbation de votre Évaluation initiale du logement.",
    summary: {
      heading: "Votre sélection",
      propertySize: "Surface du logement",
      frequency: "Fréquence de ménage",
      duration: "Durée de l'abonnement",
      durationDiscount: "Remise de contrat",
      minimumContractValue: "Valeur minimale du contrat",
      estMonthly: "Abonnement mensuel estimé",
      assessment: "Évaluation ponctuelle du logement",
      doorlockInstallation: "Installation de serrure connectée",
      dueToday: "À payer aujourd’hui",
      fromAfterAssessment: "Votre plan définitif est confirmé après l'évaluation.",
    },
    billing: {
      label: "Facturation continue préférée",
      monthly: "Mensuel",
      monthlyNote: "Payer chaque mois",
      annual: "Annuel",
      annualNote: "Payer une fois par an",
      save: "Économisez 5 %",
    },
    steps: { visit: "Votre visite", home: "Votre logement", details: "Vos coordonnées" },
    visit: {
      preferredDate: "Date préférée",
      alternateDate: "Date alternative (facultatif)",
      timeSlot: "Créneau préféré",
      morning: "Matin",
      afternoon: "Après-midi",
      flexible: "Flexible",
    },
    fields: {
      size: "Surface du logement",
      condition: "État du logement",
      bedrooms: "Chambres",
      bathrooms: "Salles de bain",
      accessNotes: "Notes d'accès (facultatif)",
      accessNotesPlaceholder: "Stationnement, clés, codes de portail: tout ce que nous devons savoir",
      pets: "Il y a des animaux dans le logement",
      petDetails: "Détails sur les animaux",
      petDetailsPlaceholder: "Type et nombre d'animaux",
      smoking: "On fume dans le logement",
      fullName: "Nom complet",
      email: "Adresse e-mail",
      phone: "Téléphone / WhatsApp",
      city: "Ville",
      addressLine1: "Adresse",
      addressLine2: "Appartement, étage (facultatif)",
      postalCode: "Code postal (facultatif)",
    },
    doorlock: {
      title: "Installation de serrure connectée",
      label: "Réserver l’installation optionnelle d’une serrure connectée",
      body:
        "Nous pouvons organiser l’installation d’une serrure connectée Wi-Fi pour environ 200 € pendant ou après l’évaluation.",
      benefit:
        "Une serrure connectée apporte plus de flexibilité et de sérénité au propriétaire : personne n’a besoin d’une copie physique des clés et l’accès des employés peut être désactivé après chaque séance de nettoyage.",
      internetRequired: "Le logement doit disposer d’une connexion internet active.",
      confirmation:
        "Je confirme que le logement dispose d’internet pour la connexion de la serrure connectée.",
    },
    condition: {
      excellent: "Excellent",
      standard: "Standard",
      needs_attention: "À surveiller",
      heavy: "Nettoyage important nécessaire",
    },
    legal: {
      accuracy:
        "Je confirme que les informations ci-dessus: surface, chambres, salles de bain, animaux, tabac et état: sont exactes.",
      termsLink: "Conditions générales",
      privacyLink: "Politique de confidentialité",
      note: "Dar Tahara peut vérifier ces informations lors de l'évaluation et ajuster le plan continu lorsque le logement diffère de manière significative.",
    },
    errors: {
      invalid_customer: "Veuillez indiquer votre nom, un e-mail valide et un numéro de téléphone.",
      invalid_property: "Veuillez compléter votre adresse et les détails du logement.",
      invalid_booking: "Veuillez choisir une date et un horaire pour votre visite.",
      invalid_duration: "Veuillez choisir une durée d'abonnement pour continuer.",
      pet_details_required: "Veuillez ajouter quelques détails sur vos animaux.",
      doorlock_internet_required: "Veuillez confirmer que le logement dispose d’une connexion internet pour la serrure connectée.",
      legal_acceptance_required: "Veuillez confirmer les informations et accepter les conditions pour continuer.",
      rate_limited: "Trop de tentatives. Réessayez dans une minute.",
      checkout_not_configured: "Les demandes ne sont pas disponibles actuellement: rejoignez l’accès anticipé.",
      checkout_failed: "Impossible d’envoyer votre demande. Veuillez réessayer.",
      network: "Erreur réseau. Vérifiez votre connexion et réessayez.",
    },
  },
  consent: {
    message:
      "Nous utilisons des cookies d'analyse pour comprendre l'utilisation de notre site. Si vous refusez, rien ne change: le site fonctionne exactement de la même façon.",
    accept: "Accepter",
    decline: "Refuser",
    privacy: "Politique de confidentialité",
    aria: "Consentement aux cookies",
  },
  mailing: {
    popupHeadline: "Soyez le premier informé de notre lancement",
    popupBody:
      "Rejoignez notre liste d'accès anticipé et nous vous préviendrons dès que nos formules de ménage seront disponibles.",
    emailPlaceholder: "Saisissez votre adresse e-mail",
    button: "Tenez-moi informé",
    success: "Merci. Vous êtes sur la liste et nous vous préviendrons dès le lancement.",
    consent:
      "En vous inscrivant, vous acceptez de recevoir des informations sur le lancement et le service. Vous pouvez vous désabonner à tout moment.",
    close: "Fermer",
    errors: {
      invalid_email: "Veuillez saisir une adresse e-mail valide.",
      rate_limited: "Trop de tentatives. Réessayez dans une minute.",
      captcha_failed: "Échec de la vérification. Veuillez réessayer.",
      consent_required: "Veuillez accepter pour continuer.",
      server_error: "Une erreur s'est produite. Veuillez réessayer sous peu.",
      network: "Erreur réseau. Vérifiez votre connexion et réessayez.",
    },
    footerEyebrow: "Bientôt disponible",
    footerTitle: "Rentrez dans bien plus qu'une maison propre.",
    footerBody:
      "Laissez votre e-mail et nous vous préviendrons dès que nos formules de ménage seront disponibles.",
    confirmedTitle: "Inscription confirmée",
    confirmedBody: "Merci d'avoir confirmé. Tout est prêt: nous vous contacterons au lancement.",
    unsubscribedTitle: "Vous êtes désabonné",
    unsubscribedBody: "Vous ne recevrez plus d'informations sur le lancement. Vous pouvez vous réinscrire à tout moment.",
    invalidTitle: "Lien expiré ou invalide",
    invalidBody: "Ce lien n'est plus valide. Veuillez vous réinscrire si vous souhaitez recevoir des nouvelles.",
    backHome: "Retour à l'accueil",
  },
  assistant: {
    chat: {
      title: "Assistant Dar Tahara",
      subtitle:
        "Bonjour, je suis le concierge virtuel Dar Tahara. Je peux expliquer les services, les tarifs, l’Évaluation Initiale, la facturation et les étapes de réservation.",
      open: "Demander à Dar Tahara",
      close: "Fermer l’assistant",
      placeholder: "Posez une question sur les tarifs, la réservation ou les services…",
      send: "Envoyer",
      automated: "Assistant automatique",
      human: "Spécialiste Dar Tahara",
      error: "Désolé, cette demande n’a pas pu aboutir. Veuillez réessayer ; votre conversation a été conservée.",
      quickActions: [
        "Comment fonctionne la première visite ?",
        "Calculer mon prix",
        "Qu’est-ce qui est inclus ?",
        "Réserver une évaluation",
        "Mensuel ou annuel ?",
        "Parler à un spécialiste",
      ],
    },
  },
  missionVision: {
    meta: {
      title: "Mission & Vision",
      description:
        "Dar Tahara associe des professionnels qualifiés, une technologie innovante et un service transparent pour redéfinir le ménage résidentiel au Maroc. Découvrez notre mission, notre vision, nos valeurs et nos engagements.",
      ogAlt: "Dar Tahara: Mission & Vision",
    },
    breadcrumb: { home: "Accueil", current: "Mission & Vision", label: "Fil d’Ariane" },
    hero: {
      eyebrow: "Mission & Vision",
      title: "Des maisons plus propres. Une confiance renforcée.",
      subtitle:
        "Dar Tahara associe des professionnels qualifiés, une technologie innovante et un service transparent pour redéfinir le ménage résidentiel au Maroc.",
      ctaPrimary: "Réserver l’Évaluation Initiale",
      ctaSecondary: "Découvrir nos services",
      imageAlt: "Une maison marocaine moderne entretenue par l’équipe professionnelle de Dar Tahara",
    },
    mission: {
      eyebrow: "Notre mission",
      title: "Une maison propre apporte la sérénité.",
      lead: "Notre mission est de fournir des services de ménage fiables, transparents et guidés par la technologie, qui améliorent la qualité de vie de chaque client.",
      body: [
        "Nous croyons qu’une maison propre apporte la sérénité.",
        "En associant une formation structurée des équipes à une technologie intelligente, au contrôle qualité et à un service client exceptionnel, nous voulons devenir l’entreprise de ménage premium la plus fiable du Maroc.",
      ],
    },
    vision: {
      eyebrow: "Notre vision",
      title: "Une nouvelle référence pour les services à domicile au Maroc.",
      lead: "Devenir la première entreprise marocaine de services à domicile pilotée par la technologie, en établissant de nouvelles normes de confiance, de professionnalisme, de sécurité et d’expérience client.",
      body: [
        "Notre vision à long terme est de nous développer dans tout le Maroc tout en investissant continuellement dans l’innovation, le développement de nos employés et des opérations durables.",
      ],
    },
    values: {
      eyebrow: "Nos valeurs fondamentales",
      title: "Les principes derrière chaque intervention.",
      subtitle:
        "Six engagements qui façonnent nos recrutements, nos formations et le soin apporté à votre maison.",
      items: [
        { title: "Confiance", body: "Nous gagnons la confiance par l’honnêteté, la transparence et la constance." },
        { title: "Qualité", body: "Chaque intervention doit répondre au même niveau d’exigence." },
        { title: "Respect", body: "Nous respectons nos clients, leur maison et nos employés." },
        {
          title: "Innovation",
          body: "La technologie doit améliorer à la fois l’expérience client et l’efficacité des équipes.",
        },
        {
          title: "Professionnalisme",
          body: "Nous nous engageons en faveur d’une formation structurée et continue des équipes au service d’une prestation d’exception.",
        },
        {
          title: "Durabilité",
          body: "Nous réduisons continuellement les déchets et privilégions les pratiques respectueuses de l’environnement.",
        },
      ],
    },
    promises: {
      eyebrow: "Nos engagements",
      title: "Ce sur quoi chaque client peut compter.",
      subtitle: "Des engagements clairs, tenus de la même manière dans chaque maison et à chaque visite.",
      items: [
        {
          title: "Nous garantissons le professionnalisme",
          body: "Notre objectif est que chaque intervenant suive une formation structurée avant d’entrer chez un client.",
        },
        {
          title: "Nous garantissons la transparence",
          body: "Aucun frais caché, des tarifs clairs, des factures numériques et une communication transparente.",
        },
        {
          title: "Nous garantissons la sécurité",
          body: "La vie privée et les biens de nos clients sont traités avec le plus grand soin.",
        },
        {
          title: "Nous garantissons la fiabilité",
          body: "Nous arrivons préparés, suivons des procédures structurées et surveillons en continu la qualité du service.",
        },
        {
          title: "Nous garantissons l’innovation",
          body: "Nous investissons dans des technologies qui améliorent la planification, la communication, l’assurance qualité et la satisfaction client.",
        },
        {
          title: "Nous garantissons l’amélioration continue",
          body: "Les retours des clients contribueront à façonner nos processus et notre approche du développement des équipes.",
        },
      ],
    },
    inclusion: {
      eyebrow: "Égalité, diversité & inclusion",
      title: "Le talent, l’engagement et le professionnalisme priment.",
      body: [
        "Chez Dar Tahara, nous croyons que le talent, l’engagement et le professionnalisme sont ce qui compte le plus.",
        "Nous nous engageons en faveur de l’égalité des chances, sans distinction de genre, d’âge, d’origine, de religion, de handicap ou de parcours.",
        "Nous construisons un lieu de travail inclusif fondé sur la dignité, l’équité et le respect mutuel.",
        "Notre objectif est que les décisions de recrutement, de formation et d’évolution de carrière reposent sur le mérite, la performance et le potentiel.",
        "En valorisant la diversité et l’inclusion, nous bâtissons des équipes plus fortes, des communautés plus solides et de meilleures expériences client.",
      ],
    },
    people: {
      eyebrow: "Nos équipes",
      title: "Notre engagement pour un emploi responsable.",
      subtitle:
        "Nous nous engageons à construire un environnement de travail fondé sur la dignité, l’équité, la transparence et le développement professionnel.",
      items: [
        {
          title: "Des relations de travail formelles",
          body: "Nous travaillons à mettre en place des relations de travail formelles et correctement documentées pour les membres de l’équipe qui y sont éligibles.",
        },
        {
          title: "Immatriculation à la CNSS",
          body: "À mesure que nos activités se développent, nous travaillons à faire immatriculer les salariés éligibles auprès de la Caisse Nationale de Sécurité Sociale (CNSS) du Maroc, conformément aux exigences légales et aux conditions d’emploi applicables.",
        },
        {
          title: "Couverture AMO applicable",
          body: "Notre objectif de mise en œuvre comprend la couverture applicable au titre de l’Assurance Maladie Obligatoire (AMO) pour les salariés éligibles par l’intermédiaire du régime de la CNSS.",
        },
        {
          title: "Des conditions de travail claires",
          body: "Nous travaillons à définir des responsabilités et des conditions de travail claires, fondées sur la dignité, l’équité et la transparence.",
        },
        {
          title: "Un développement structuré",
          body: "Notre modèle d’emploi se construit autour d’une formation structurée et du développement professionnel.",
        },
        {
          title: "Des méthodes de travail sûres",
          body: "Nous visons des méthodes de travail sûres et un équipement adapté à chaque fonction.",
        },
        {
          title: "L’égalité des chances",
          body: "Nous nous engageons en faveur de l’égalité des chances fondée sur le mérite, les résultats et le potentiel.",
        },
        {
          title: "Un traitement respectueux",
          body: "Chaque membre de l’équipe doit être traité avec dignité et respect mutuel.",
        },
      ],
      clarification:
        "Nos pratiques et avantages liés à l’emploi seront mis en œuvre selon la fonction, le statut d’emploi, l’éligibilité, le stade opérationnel et le droit marocain applicable.",
    },
    impact: {
      eyebrow: "Impact social",
      title: "Construire un modèle d’emploi responsable.",
      subtitle:
        "Dar Tahara vise à créer des emplois utiles et gérés de manière professionnelle au sein des communautés que nous servons. Nous investissons dans une formation structurée, des pratiques de travail sûres, le développement professionnel et des relations de travail respectueuses.",
      items: [
        "À mesure que nos activités se développent, nous construisons un modèle d’emploi formel dans lequel les membres de l’équipe éligibles seront immatriculés au régime marocain de sécurité sociale de la CNSS, avec la couverture AMO applicable, conformément aux exigences légales et aux conditions d’emploi applicables.",
        "Notre objectif est de contribuer à relever les standards dans un secteur où le travail informel et non déclaré reste répandu, tout en créant pour nos équipes des possibilités plus sûres, plus stables et plus valorisantes.",
      ],
    },
    comparison: {
      eyebrow: "Pourquoi Dar Tahara ?",
      title: "Un autre standard de service.",
      subtitle:
        "La différence entre un arrangement de ménage traditionnel et un service à domicile moderne, piloté par la technologie.",
      traditionalTitle: "Entreprise de ménage traditionnelle",
      brandTitle: "Dar Tahara",
      traditional: [
        "Qualité de service irrégulière",
        "Paiements en espèces",
        "Communication limitée",
        "Administration manuelle",
        "Pas d’espace client",
        "Pas d’assistance IA",
        "Peu de contrôle qualité",
        "Transparence minimale",
      ],
      brand: [
        "Services par abonnement",
        "Espace client numérique",
        "Assistance client propulsée par l’IA",
        "Contrôle qualité numérique",
        "Factures en ligne",
        "Planification professionnelle",
        "Opérations pilotées par la technologie",
        "Communication transparente",
        "Engagement en faveur d’une formation structurée",
        "Modèle d’emploi responsable en cours de construction",
        "Expérience client moderne",
      ],
    },
    sustainability: {
      eyebrow: "Durabilité",
      title: "Un progrès respectueux de la planète.",
      subtitle:
        "La responsabilité environnementale est intégrée à notre façon de planifier, de nettoyer et de gérer.",
      items: [
        { title: "Trajets optimisés", body: "Une planification des itinéraires qui réduit les déplacements inutiles." },
        {
          title: "Produits responsables",
          body: "Des produits d’entretien respectueux de l’environnement dès que possible.",
        },
        { title: "Zéro papier", body: "Une administration sans papier grâce aux systèmes numériques." },
        { title: "Moins de déchets", body: "Des processus efficaces qui réduisent les déchets au minimum." },
        {
          title: "Investissement durable",
          body: "Un investissement continu dans des pratiques d’entreprise durables.",
        },
      ],
    },
    closing: {
      eyebrow: "Plus qu’un ménage",
      title: "Plus qu’un ménage",
      body: [
        "Dar Tahara construit une nouvelle référence pour le ménage à domicile au Maroc.",
        "En associant des professionnels qualifiés, une technologie innovante et une attention sincère à nos clients, nous offrons plus qu’une maison propre: nous offrons la sérénité.",
      ],
      ctaPrimary: "Réservez votre Évaluation Initiale",
      ctaSecondary: "Découvrir nos services",
    },
    teaser: {
      eyebrow: "Pourquoi Dar Tahara ?",
      title: "Plus qu’un ménage.",
      body: "Des professionnels qualifiés, une technologie innovante et un service transparent: réunis pour redéfinir le ménage résidentiel au Maroc.",
      cta: "Lire notre mission & vision",
      points: [
        "Opérations pilotées par la technologie",
        "Tarifs transparents par abonnement",
        "Engagement en faveur d’une formation structurée",
      ],
    },
  },
  peopleCommunity: {
    meta: {
      title: "Personnes & Communauté",
      description:
        "Découvrez comment Dar Tahara associe un nettoyage résidentiel professionnel, la vérification de ses employés, un accès contrôlé au domicile et un emploi local stable au Maroc.",
      ogAlt: "Dar Tahara : Personnes & Communauté",
    },
    breadcrumb: {
      home: "Accueil",
      current: "Personnes & Communauté",
      label: "Fil d'Ariane",
    },
    hero: {
      eyebrow: "Personnes & Communauté",
      title: "Des maisons propres. Des communautés soutenues.",
      subtitle:
        "Chez Dar Tahara, nous pensons qu'un service de nettoyage professionnel doit faire plus que laisser un logement propre. Nous associons l'entretien professionnel du domicile à un emploi local stable, à des conditions de travail équitables et à un service conçu autour de la confiance.",
      ctaPrimary: "Rejoindre l'accès anticipé",
      ctaSecondary: "Lire notre mission & vision",
      imageAlt: "Une professionnelle du nettoyage Dar Tahara en tenue de travail nettoie une fenêtre dans un logement marocain",
      highlights: ["Équipes locales", "Personnel vérifié", "Accès lié au rendez-vous"],
    },
    employment: {
      eyebrow: "Emploi local",
      title: "Des personnes du territoire au service de leur communauté",
      lead: "Dar Tahara souhaite recruter ses équipes de nettoyage dans les villes et les zones environnantes où nous opérons. Dans la mesure du possible, les employés travaillent au sein de leur zone opérationnelle locale, près des logements dont ils prennent soin.",
      items: [
        {
          title: "Un emploi au sein de la communauté",
          body: "Lorsque Dar Tahara s'implante dans une ville, nous regardons d'abord cette ville et ses environs pour constituer l'équipe qui la desservira.",
        },
        {
          title: "Un travail plus prévisible",
          body: "Les abonnements récurrents génèrent des rendez-vous récurrents, ce qui nous permet de planifier les plannings à l'avance plutôt que de proposer des missions ponctuelles et irrégulières.",
        },
        {
          title: "Moins de déplacements inutiles",
          body: "Affecter les employés dans leur zone opérationnelle locale, lorsque cela est possible, réduit les longs trajets et leur rend une partie de leur journée.",
        },
        {
          title: "Des équipes locales dédiées",
          body: "Des équipes qui connaissent leur ville et ses quartiers développent une familiarité, une constance et une véritable responsabilité envers les clients qu'elles servent.",
        },
        {
          title: "Une croissance qui crée des emplois locaux",
          body: "Chaque client récurrent supplémentaire dans une ville ajoute des heures de nettoyage dans cette même ville, et ce sont ces heures qui créent des postes locaux supplémentaires.",
        },
      ],
      flow: {
        title: "Comment la croissance devient de l'emploi local",
        steps: [
          "Plus de clients",
          "Plus de rendez-vous de nettoyage récurrents",
          "Plus d'emplois locaux stables",
        ],
        note: "C'est le mécanisme qui sous-tend notre modèle d'emploi : une demande prévisible rend un emploi prévisible possible.",
      },
      customerNote:
        "En choisissant Dar Tahara, vous bénéficiez d'un service de nettoyage professionnel et sécurisé tout en soutenant l'emploi local stable dans la région où vous vivez.",
      disclaimer:
        "Le recrutement local et l'affectation locale sont appliqués lorsque cela est opérationnellement possible au sein de chaque zone d'activité. Dar Tahara ne garantit pas que chaque employé réside à une distance déterminée de chaque logement client.",
    },
    stability: {
      eyebrow: "Emploi équitable",
      title: "Un emploi doit apporter de la stabilité",
      lead: "Dar Tahara veut offrir davantage qu'un travail de nettoyage occasionnel. Nos employés perçoivent un salaire mensuel équitable et bénéficient d'une couverture santé, ce qui contribue à une plus grande stabilité financière et à l'accès aux soins essentiels.",
      items: [
        {
          title: "Un salaire mensuel équitable",
          body: "L'emploi repose sur un salaire mensuel fixe plutôt que sur des paiements en espèces incertains, mission par mission.",
        },
        {
          title: "Une couverture santé",
          body: "Notre modèle d'emploi inclut la couverture d'Assurance Maladie Obligatoire (AMO) applicable aux employés éligibles, via le système marocain de la CNSS.",
        },
        {
          title: "Un travail planifié et prévisible",
          body: "Les rendez-vous récurrents sont planifiés à l'avance : les employés connaissent leur planning au lieu d'attendre que le travail se présente.",
        },
        {
          title: "Une intégration professionnelle",
          body: "Chaque membre de l'équipe découvre nos standards, nos procédures et nos équipements avant de travailler seul au domicile d'un client.",
        },
        {
          title: "Un cadre de travail structuré",
          body: "Des responsabilités claires, des conditions de travail définies, un équipement adapté et un coordinateur vers qui se tourner.",
        },
      ],
      objective:
        "Notre objectif est simple : un emploi suffisamment stable pour couvrir les besoins essentiels, avec un accès à une couverture santé. Nos employés sont des professionnels qui rendent un service professionnel, et ils sont rémunérés comme tels.",
      disclaimer:
        "Le salaire, les avantages et la couverture sont appliqués selon le poste, le statut d'emploi, l'éligibilité, l'étape opérationnelle et la législation marocaine applicable.",
    },
    screening: {
      eyebrow: "Confiance du client",
      title: "Des personnes en qui vous pouvez avoir confiance chez vous",
      lead: "Laisser entrer quelqu'un dans un domicile privé exige de la confiance. Dar Tahara impose donc à son personnel de nettoyage de réussir la procédure de vérification de l'entreprise avant d'être autorisé à travailler seul dans les logements des clients.",
      steps: [
        {
          title: "Vérification d'identité",
          body: "Nous vérifions l'identité de chaque candidat à partir de pièces d'identité officielles.",
        },
        {
          title: "Vérification des antécédents professionnels",
          body: "Le cas échéant, les emplois précédents et les références sont vérifiés avant que la candidature ne se poursuive.",
        },
        {
          title: "Intégration Dar Tahara",
          body: "Les candidats suivent notre programme d'intégration : procédures, équipements, confidentialité et comportement au domicile du client.",
        },
        {
          title: "Standards professionnels",
          body: "Chaque employé applique un standard documenté en matière de nettoyage, de communication et de respect du domicile et de la vie privée du client.",
        },
        {
          title: "Autorisation avant tout accès",
          body: "L'accès au logement n'est activé qu'une fois la vérification et l'intégration menées à bien.",
        },
      ],
      criminalRecordLabel: "Document officiel de vérification",
      criminalRecordDocument: "Extrait du Casier Judiciaire",
      criminalRecordBody:
        "Dans le cadre de notre procédure de vérification, chaque candidat doit fournir un Extrait du Casier Judiciaire valide. Ce document fait partie des exigences de vérification de Dar Tahara, que le candidat doit satisfaire avant d'être autorisé à travailler seul dans les logements des clients.",
      criminalRecordPrivacy:
        "Le document est traité de manière confidentielle au sein du dossier personnel de l'employé. Il n'est jamais communiqué aux clients, qui ne peuvent ni le consulter ni le télécharger.",
      authorization:
        "Seules les personnes ayant satisfait à la procédure de vérification et d'intégration requise peuvent être autorisées à travailler au domicile des clients.",
    },
    access: {
      eyebrow: "Accès contrôlé au domicile",
      title: "La vérification n'est que la première couche de sécurité",
      lead: "Dar Tahara associe la vérification de ses employés à la technologie. Pour les clients équipés d'une solution de serrure connectée Dar Tahara compatible, le personnel de nettoyage ne reçoit pas d'accès permanent et illimité au logement. L'accès est lié au rendez-vous de nettoyage lui-même.",
      statement: "Sans rendez-vous actif, aucun accès autorisé.",
      steps: [
        {
          title: "Un rendez-vous planifié",
          body: "Le client dispose d'un rendez-vous de nettoyage dans le planning.",
        },
        {
          title: "Un employé autorisé",
          body: "Un employé vérifié et autorisé est affecté à ce rendez-vous.",
        },
        {
          title: "Accès pour la plage de service",
          body: "L'accès au logement est activé pour la plage horaire de service concernée.",
        },
        {
          title: "Accès pendant la période autorisée",
          body: "L'employé utilise son moyen d'accès attribué pendant cette période.",
        },
        {
          title: "Restreint en dehors de la plage",
          body: "En dehors de la période autorisée, cet accès est restreint.",
        },
        {
          title: "L'activité est enregistrée",
          body: "L'activité d'accès est enregistrée et rattachée au rendez-vous correspondant.",
        },
        {
          title: "Visible par le client",
          body: "Le client peut consulter les enregistrements de serrure et d'accès relatifs à son logement.",
        },
      ],
      availabilityNote:
        "Ce modèle d'accès s'applique aux logements équipés d'une solution de serrure connectée Dar Tahara compatible et est déployé avec notre programme d'accès anticipé : il n'est donc pas encore actif dans tous les logements. L'installation est optionnelle et soumise à une vérification de compatibilité de la porte et de la serrure. Les logements sans serrure connectée compatible continuent d'utiliser les modalités de remise de clés convenues.",
    },
    transparency: {
      eyebrow: "Transparence des accès",
      title: "Sachez quand votre domicile a été ouvert",
      body: "Dar Tahara associe un accès contrôlé au domicile à des enregistrements transparents. Les clients utilisant notre solution de serrure connectée prise en charge peuvent consulter les journaux d'accès pertinents, ce qui apporte une transparence supplémentaire sur les moments où leur logement a été ouvert.",
      points: [
        {
          title: "Quand l'accès a eu lieu",
          body: "La date et l'heure auxquelles votre logement a été ouvert.",
        },
        {
          title: "À quel rendez-vous il correspond",
          body: "Le rendez-vous de nettoyage planifié auquel l'accès se rattache.",
        },
        {
          title: "S'il s'inscrit dans la plage de service",
          body: "La confirmation que l'accès a eu lieu pendant la période autorisée.",
        },
      ],
      privacyNote:
        "Les enregistrements d'accès montrent ce qui concerne votre logement et vos rendez-vous. Ils ne constituent pas un outil de surveillance des employés, et les données personnelles du personnel ne sont jamais exposées aux clients.",
      availabilityNote:
        "Les enregistrements d'accès sont fournis pour les logements équipés d'une solution de serrure connectée Dar Tahara compatible et deviennent disponibles à mesure que cette solution est déployée. Les logements sans serrure connectée compatible ne génèrent pas ces enregistrements.",
    },
    trust: {
      eyebrow: "Notre engagement",
      title: "Personnel vérifié. Accès planifié. Enregistrements transparents.",
      body: "Lorsque vous confiez à quelqu'un l'accès à votre domicile, nous estimons que vous méritez mieux qu'une promesse. Dar Tahara associe la vérification des employés, un accès contrôlé au logement et des enregistrements d'accès transparents pour créer un service professionnel conçu autour de la sécurité et de la responsabilité.",
      pillars: [
        {
          title: "Personnel vérifié",
          body: "Personne ne travaille seul au domicile d'un client avant d'avoir achevé notre procédure de vérification et d'intégration.",
        },
        {
          title: "Accès planifié",
          body: "L'accès est lié à un rendez-vous réel et à une plage de service définie, jamais cédé de façon permanente.",
        },
        {
          title: "Enregistrements transparents",
          body: "Vous pouvez consulter l'activité d'accès qui concerne votre propre logement.",
        },
      ],
    },
    impact: {
      eyebrow: "Un modèle, trois bénéfices",
      title: "Service professionnel. Emploi responsable. Communautés locales renforcées.",
      subtitle:
        "Ce ne sont pas deux histoires distinctes. Une entreprise qui traite ses équipes en professionnels est la même entreprise à qui vous pouvez ouvrir votre porte.",
      groups: [
        {
          title: "Pour le client",
          items: [
            "Un nettoyage professionnel",
            "Un personnel vérifié",
            "Un accès contrôlé au logement",
            "Une plus grande transparence",
          ],
        },
        {
          title: "Pour l'employé",
          items: [
            "Un emploi stable",
            "Un salaire mensuel équitable",
            "Une couverture santé",
            "Un cadre de travail professionnel",
          ],
        },
        {
          title: "Pour la communauté",
          items: [
            "Des opportunités d'emploi local",
            "Une activité économique locale",
            "Des compétences et une formation professionnelles",
            "Des emplois créés à mesure que Dar Tahara se développe",
          ],
        },
      ],
      chain: [
        "Service professionnel",
        "Emploi responsable",
        "Communautés locales renforcées",
      ],
    },
    closing: {
      eyebrow: "Pourquoi cela compte",
      title: "Des standards professionnels. Un impact humain.",
      body: [
        "Pour nos clients, Dar Tahara signifie un service de nettoyage professionnel bâti sur la fiabilité, la sécurité et la transparence.",
        "Pour nos employés, cela signifie la possibilité d'un travail stable, d'un revenu prévisible et d'une couverture santé.",
        "Pour les communautés que nous servons, cela signifie que la croissance de Dar Tahara peut créer de l'emploi directement sur le territoire.",
      ],
      statement: "Une maison plus propre. Un service plus sûr. Une communauté locale plus forte.",
      ctaPrimary: "Rejoindre l'accès anticipé",
      ctaSecondary: "Lire notre mission & vision",
    },
    teaser: {
      eyebrow: "Personnes & Communauté",
      title: "Qui nous envoyons, et qui nous employons.",
      body: "Chaque intervenant Dar Tahara achève notre procédure de vérification avant de travailler seul chez vous, et l'accès au logement est lié au rendez-vous plutôt que cédé de façon permanente. Le même modèle leur verse un salaire mensuel avec une couverture santé, dans la ville où ils vivent.",
      cta: "Voir comment nous recrutons et sécurisons l'accès",
      points: [
        "Personnel vérifié",
        "Accès lié au rendez-vous",
        "Emploi local stable",
      ],
    },
  },
  legal: {
    termsTitle: "Conditions générales de service",
    privacyTitle: "Politique de confidentialité",
    termsUpdated: "En vigueur le 24 juillet 2026",
    privacyUpdated: "En vigueur le 13 juillet 2026",
    termsMeta: "Conditions régissant les évaluations de logement et les abonnements Dar Tahara.",
    privacyMeta: "Comment Dar Tahara collecte, utilise et protège les données personnelles.",
    bindingLanguageNotice:
      "Ce document est une traduction de l'original anglais. La version anglaise est le texte juridiquement contraignant. En cas de divergence de sens ou d'effet entre un passage traduit et la version anglaise, la version anglaise prévaut.",
  },
  serviceAreas: {
    meta: {
      title: "Zones desservies au Maroc",
      description:
        "Où Dar Tahara opère au Maroc. Zones actives, ouvertures prochaines et couverture planifiée, ville par ville, avec le statut actuel de chacune.",
      ogAlt: "Zones desservies par Dar Tahara au Maroc",
    },
    breadcrumb: { home: "Accueil", current: "Zones desservies", label: "Fil d'Ariane" },
    hero: {
      eyebrow: "Zones desservies",
      title: "Où Dar Tahara opère au Maroc",
      subtitle:
        "Dar Tahara se déploie zone par zone plutôt que de revendiquer une couverture nationale dès le premier jour. Chaque ville ci-dessous affiche son statut actuel : vous voyez précisément où le service est actif, où il ouvre prochainement et où il reste au stade du projet.",
      ctaPrimary: "Rejoindre l'accès anticipé",
      ctaSecondary: "Voir nos services",
    },
    status: {
      available: {
        label: "Zones actives",
        note: "Dar Tahara y développe activement son service. La disponibilité pour une adresse précise est confirmée lors de l'évaluation initiale du logement.",
      },
      expanding: {
        label: "Ouverture prochaine",
        note: "Extension à court terme autour de nos zones actives. Rejoignez l'accès anticipé pour être contacté dès l'ouverture de votre ville.",
      },
      planned: {
        label: "Couverture planifiée",
        note: "Villes que nous prévoyons de desservir à mesure que Dar Tahara se développe. Aucun service n'y est encore proposé.",
      },
    },
    regionLabel: "Région",
    coverageTitle: "Couverture par région",
    coverageNote:
      "Nous regroupons les villes par région administrative, car nos équipes se constituent localement et une région ouvre par grappe plutôt que ville par ville.",
    disclaimer:
      "Cette page décrit où Dar Tahara opère et compte opérer. Elle ne constitue pas une offre de service dans une ville donnée. La couverture, le calendrier et la disponibilité pour un bien précis se confirment directement auprès de Dar Tahara.",
    cta: {
      title: "Votre ville n'apparaît pas ?",
      body: "L'accès anticipé nous indique où se trouve la demande. Les villes qui comptent le plus d'inscriptions sont celles que nous ouvrons en premier : s'inscrire fait réellement remonter votre zone dans la liste.",
      button: "Rejoindre l'accès anticipé",
    },
    faq: [
      {
        q: "Quelles villes Dar Tahara dessert-elle ?",
        a: "Les zones actives de Dar Tahara sont Tanger, Tétouan, Casablanca et Meknès. Les autres villes marocaines figurent sur cette page comme ouvrant prochainement ou planifiées. Confirmez la disponibilité pour votre adresse avant de vous fier à une zone desservie.",
      },
      {
        q: "Dar Tahara couvre-t-elle tout le Maroc ?",
        a: "Pas encore. Dar Tahara opère au Maroc et se déploie ville par ville plutôt que de revendiquer une couverture nationale. Chaque ville de cette page indique si elle est active, en ouverture prochaine ou encore planifiée.",
      },
      {
        q: "Comment une nouvelle ville ouvre-t-elle ?",
        a: "Dar Tahara recrute son équipe d'entretien localement, dans la ville et ses environs, avant d'y ouvrir. Les inscriptions à l'accès anticipé montrent où la demande se concentre : c'est ainsi que nous décidons de l'ordre d'ouverture des villes.",
      },
    ],
  },
  footer: {
    tagline: "Conciergerie & entretien de résidence premium partout au Maroc.",
    quickLinks: "Explorer",
    services: "Services",
    contact: "Contact",
    email: "Écrivez-nous",
    whatsapp: "WhatsApp",
    call: "Appelez-nous",
    followUs: "Suivez-nous",
    rights: "Tous droits réservés.",
    terms: "Conditions",
    privacy: "Confidentialité",
    madeWith: "Crafted with care by SaaSolution SL.",
    newsletterTitle: "Rentrez dans bien plus qu’une maison propre.",
    newsletterBody: "Quelques conseils occasionnels pour prendre soin de votre maison. Sans bruit.",
    newsletterPlaceholder: "Votre e-mail",
    newsletterCta: "S’abonner",
  },
};

export default fr;

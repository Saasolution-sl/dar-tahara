import type { DeepPartial } from "../types";
import type { Dictionary } from "./en";

/** French — complete translation. */
const fr: DeepPartial<Dictionary> = {
  meta: {
    title: "Dar Tahara — Conciergerie & entretien de résidence premium",
    description:
      "Dar Tahara est une conciergerie résidentielle premium au Maroc. Nettoyage professionnel, inspections et entretien pour rentrer toujours dans un intérieur parfait.",
    ogAlt: "Dar Tahara — Maison de la Pureté",
  },
  brand: {
    name: "Dar Tahara",
    meaning: "Maison de la Pureté",
    tagline: "Rentrez toujours dans le confort.",
  },
  nav: {
    about: "À propos",
    missionVision: "Mission & Vision",
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
    title: "Votre maison mérite mieux qu’un ménage — elle mérite un soin d’exception.",
    subtitle:
      "Pour les propriétaires, expatriés et propriétaires de résidences secondaires partout au Maroc. Nous nettoyons, inspectons et entretenons votre bien avec une précision discrète — pour que vous retrouviez le confort, jamais les soucis.",
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
      "Dar Tahara signifie Maison de la Pureté. Nous ne sommes pas une entreprise de ménage — nous sommes les gardiens de confiance de votre maison en votre absence, et la raison pour laquelle tout semble sans effort à votre retour.",
    pillars: [
      {
        title: "Confiance absolue",
        body: "Un modèle de service fondé sur des vérifications adaptées à chaque fonction, une formation structurée, une gestion discrète des clés et une responsabilité claire.",
      },
      {
        title: "Qualité sans compromis",
        body: "Un standard méticuleux appliqué à chaque surface, chaque détail — inspecté, photographié et validé.",
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
      "D’un simple nettoyage impeccable à la gestion complète de votre résidence secondaire — choisissez exactement ce dont votre bien a besoin.",
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
      { title: "Professionnels très occupés", body: "Retrouvez vos soirées et week-ends — nous nous occupons du reste." },
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
        a: "Oui. Communiquez-nous vos détails d’arrivée et nous veillerons à du linge frais, une maison impeccable, une température agréable et tous les essentiels souhaités — prêts dès que vous franchissez la porte.",
      },
      {
        q: "Quelles villes desservez-vous ?",
        a: "Nous intervenons actuellement principalement à Tétouan, Tanger, Meknès et Casablanca, avec une couverture en expansion continue. Contactez-nous pour confirmer votre secteur.",
      },
      {
        q: "Puis-je suspendre, modifier ou résilier ma formule ?",
        a: "Un abonnement ne peut pas être suspendu. Les changements de visite autorisés et la résiliation se gèrent dans le portail client : au moins 48 heures pour une visite et un mois pour la résiliation, selon les Conditions.",
      },
      {
        q: "Quels produits utilisez-vous ?",
        a: "Nous utilisons des produits professionnels, efficaces et soigneusement choisis, avec des options écoresponsables et respectueuses des surfaces pour les finitions délicates et les foyers sensibles, sur demande.",
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
      "Déplacez le curseur et choisissez un rythme. Votre estimation se met à jour instantanément — sans inscription, sans surprise.",
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
      accessNotesPlaceholder: "Stationnement, clés, codes de portail — tout ce que nous devons savoir",
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
        "Je confirme que les informations ci-dessus — surface, chambres, salles de bain, animaux, tabac et état — sont exactes.",
      termsLink: "Conditions générales",
      privacyLink: "Politique de confidentialité",
      note: "Dar Tahara peut vérifier ces informations lors de l'évaluation et ajuster le plan continu lorsque le logement diffère de manière significative.",
    },
    errors: {
      invalid_customer: "Veuillez indiquer votre nom, un e-mail valide et un numéro de téléphone.",
      invalid_property: "Veuillez compléter votre adresse et les détails du logement.",
      invalid_booking: "Veuillez choisir une date et un horaire pour votre visite.",
      pet_details_required: "Veuillez ajouter quelques détails sur vos animaux.",
      doorlock_internet_required: "Veuillez confirmer que le logement dispose d’une connexion internet pour la serrure connectée.",
      legal_acceptance_required: "Veuillez confirmer les informations et accepter les conditions pour continuer.",
      rate_limited: "Trop de tentatives. Réessayez dans une minute.",
      checkout_not_configured: "Les demandes ne sont pas disponibles actuellement — rejoignez l’accès anticipé.",
      checkout_failed: "Impossible d’envoyer votre demande. Veuillez réessayer.",
      network: "Erreur réseau. Vérifiez votre connexion et réessayez.",
    },
  },
  consent: {
    message:
      "Nous utilisons des cookies d'analyse pour comprendre l'utilisation de notre site. Si vous refusez, rien ne change — le site fonctionne exactement de la même façon.",
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
    confirmedBody: "Merci d'avoir confirmé. Tout est prêt — nous vous contacterons au lancement.",
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
      ogAlt: "Dar Tahara — Mission & Vision",
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
        "En associant des professionnels qualifiés, une technologie innovante et une attention sincère à nos clients, nous offrons plus qu’une maison propre — nous offrons la sérénité.",
      ],
      ctaPrimary: "Réservez votre Évaluation Initiale",
      ctaSecondary: "Découvrir nos services",
    },
    teaser: {
      eyebrow: "Pourquoi Dar Tahara ?",
      title: "Plus qu’un ménage.",
      body: "Des professionnels qualifiés, une technologie innovante et un service transparent — réunis pour redéfinir le ménage résidentiel au Maroc.",
      cta: "Lire notre mission & vision",
      points: [
        "Opérations pilotées par la technologie",
        "Tarifs transparents par abonnement",
        "Engagement en faveur d’une formation structurée",
      ],
    },
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

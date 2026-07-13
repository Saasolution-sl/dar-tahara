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
    why: "Pourquoi Dar Tahara",
    services: "Services",
    plans: "Formules",
    pricing: "Tarifs",
    how: "Comment ça marche",
    gallery: "Galerie",
    faq: "FAQ",
    book: "Réserver l’Évaluation Initiale",
    quote: "Demander un devis",
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
    ctaSecondary: "Demander un devis",
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
        body: "Des professionnels vérifiés, formés et assurés. Gestion discrète des clés et responsabilité totale à chaque visite.",
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
      { title: "Gestion des clés", body: "Garde sécurisée et assurée de vos clés, avec accès enregistré à la demande." },
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
      "Des formules simples et transparentes — suspendez, ajustez ou annulez quand vous le souhaitez. Chaque formule inclut des rapports d’inspection et un support prioritaire.",
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
      { title: "Nous nettoyons", body: "Notre équipe formée livre notre standard signature, à chaque fois." },
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
        q: "Votre personnel est-il vérifié et assuré ?",
        a: "Chaque membre de notre équipe fait l’objet d’une vérification d’antécédents, est formé à notre standard et entièrement assuré. Pour les clients confiant leurs clés, nous tenons une chaîne de responsabilité enregistrée pour une transparence totale.",
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
        a: "Nous desservons actuellement les grandes villes du Maroc, dont Tanger, Casablanca, Rabat et Marrakech, avec une couverture en expansion continue. Contactez-nous pour confirmer votre secteur.",
      },
      {
        q: "Puis-je suspendre ou modifier ma formule ?",
        a: "Toujours. Les formules sont flexibles — suspendez pendant vos voyages, augmentez la fréquence pour la saison ou ajustez les services à tout moment d’un simple message.",
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
    ctaSecondary: "Demander un devis",
    whatsapp: "Discuter sur WhatsApp",
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
      title: "Une demeure d’exception mérite un devis sur mesure.",
      body: "Les biens de plus de 250 m² nécessitent un devis personnalisé.",
      cta: "Demander un devis sur mesure",
    },
    cta: {
      book: "Réservez l’Évaluation Initiale",
      quote: "Demander un devis personnalisé",
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
    quoteTitle: "Demander un devis personnalisé",
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
    madeWith: "Conçu avec soin au Maroc.",
    newsletterTitle: "Rentrez dans bien plus qu’une maison propre.",
    newsletterBody: "Quelques conseils occasionnels pour prendre soin de votre maison. Sans bruit.",
    newsletterPlaceholder: "Votre e-mail",
    newsletterCta: "S’abonner",
  },
};

export default fr;

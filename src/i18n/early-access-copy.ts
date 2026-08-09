import { type Locale } from "./config";

/**
 * Copy for the early-access page + 7-step form, fully translated for all seven
 * supported locales. Each locale is a COMPLETE EarlyAccessCopy object (not a
 * partial), so TypeScript enforces that no string is missing and nothing silently
 * falls back to English.
 */

export type OptionLabels = Record<string, string>;

export type EarlyAccessCopy = {
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    ctaPrimary: string;
    ctaSecondary: string;
    benefitsTitle: string;
    benefits: readonly string[];
    missionLink: string;
    notBooking: string;
    reassure: string;
  };
  progress: { stepOf: string; step: string };
  nav: { back: string; next: string; submit: string; submitting: string };
  steps: Record<
    | "contact" | "billing" | "property_address" | "property_info"
    | "services" | "access" | "review",
    { title: string; subtitle: string }
  >;
  fields: Record<string, string>;
  hints: Record<string, string>;
  options: {
    contactMethod: OptionLabels;
    recipientType: OptionLabels;
    propertyType: OptionLabels;
    outdoor: OptionLabels;
    occupancy: OptionLabels;
    condition: OptionLabels;
    furnishing: OptionLabels;
    tristate: OptionLabels;
    service: OptionLabels;
    frequency: OptionLabels;
    startPeriod: OptionLabels;
    access: OptionLabels;
  };
  keyNotice: { title: string; body: string; ack: string };
  thirdPartyNotice: string;
  digitalLockNotice: string;
  digitalLockInternetNotice: { title: string; body: string; ack: string };
  /**
   * Digital smart-lock upsell. `{price}` placeholders are replaced at render time
   * with the value from the central product config (never hardcoded here), so the
   * displayed offer stays "€200 including installation" in every locale.
   */
  smartLock: {
    eyebrow: string;
    heading: string;
    intro: string;
    priceTag: string;            // "{price} including installation"
    options: {
      purchase_interested: { title: string; note: string };
      already_has_lock: { title: string; note: string };
      not_interested: { title: string; note: string };
    };
    brandLabel: string;
    brandPlaceholder: string;
    modelLabel: string;
    modelPlaceholder: string;
    ttlockNotice: string;
    keyComparison: string;
    reviewLabel: string;         // "Digital smart lock"
    reviewSubjectTo: string;
    confirm: {
      interested: string;
      alreadyHas: string;
    };
  };
  /** International phone country selector. */
  phoneCountry: { label: string; searchPlaceholder: string; noResults: string };
  /** Google-backed address search + property map confirmation. */
  maps: {
    searchPlaceholder: string;
    searching: string;
    noResults: string;
    manualLink: string;
    unavailable: string;
    pinTitle: string;
    pinHelp: string;
    useMyLocation: string;
    locating: string;
    locationDenied: string;
    mapUnavailable: string;
    adjusted: string;
  };
  /** Standardized Moroccan city selector. */
  citySelector: {
    searchPlaceholder: string;
    notListed: string;
    manualLabel: string;
    manualPlaceholder: string;
    status: { planned: string; waiting_list: string; unsupported: string };
  };
  consent: {
    heading: string;
    accurate: string;
    authorized: string;
    privacy: string;
    operational: string;
    reminder: string;
    reminderHint: string;
    marketing: string;
    marketingHint: string;
  };
  errors: Record<string, string>;
  success: {
    verifiedTitle: string;
    verifiedBody: string;
    alreadyTitle: string;
    pendingTitle: string;
    pendingBody: string;
    expiredTitle: string;
    expiredBody: string;
    invalidTitle: string;
    invalidBody: string;
    resend: string;
    resent: string;
    shareTitle: string;
    shareBody: string;
    copy: string;
    copied: string;
    whatsapp: string;
    shareMessage: string;
    home: string;
  };
  submitted: { title: string; body: string; checkInbox: string };
};

const en: EarlyAccessCopy = {
  meta: {
    title: "Dar Tahara Early Access | Premium Home Cleaning in Morocco",
    description:
      "Join Dar Tahara Early Access and be among the first to experience reliable premium home cleaning and property care in Morocco.",
  },
  hero: {
    eyebrow: "Early access · Morocco",
    title: "Your home in Morocco, always ready when you arrive.",
    body: "Join Dar Tahara early access for premium home cleaning and property care in Morocco. Register your property, receive launch updates, and invite friends and family.",
    ctaPrimary: "Request early access",
    ctaSecondary: "How it works",
    benefitsTitle: "What Dar Tahara is building",
    benefits: [
      "Reliable, transparent home care designed around your peace of mind.",
      "Consistent service standards supported by structured training and smart technology.",
      "Responsible growth that aims to create safer, more professional opportunities for our teams.",
    ],
    missionLink: "Read our mission & vision",
    notBooking: "Registering is an early-access request, not a confirmed booking. We'll contact you when service becomes available in your area.",
    reassure: "Takes about 3 minutes · Your details are kept private",
  },
  progress: { stepOf: "Step {n} of {total}", step: "Step" },
  nav: { back: "Back", next: "Continue", submit: "Submit request", submitting: "Submitting…" },
  steps: {
    contact: { title: "Contact information", subtitle: "How we reach you about your request." },
    billing: { title: "Billing address", subtitle: "This is the address we'll use for your customer account, billing and invoices. It may be different from the property address in Morocco." },
    property_address: { title: "Property address in Morocco", subtitle: "This is the physical address where Dar Tahara will provide cleaning or property-care services." },
    property_info: { title: "Property information", subtitle: "A few details so we can plan the right care. We may verify these on the first visit." },
    services: { title: "Service preferences", subtitle: "What you're interested in. This is not a confirmed appointment." },
    access: { title: "Property access", subtitle: "How our team would access the property." },
    review: { title: "Review & consent", subtitle: "Please check your details and confirm." },
  },
  fields: {
    firstName: "First name", lastName: "Last name", email: "Email address",
    countryCallingCode: "Country code", mobileNumber: "Mobile number",
    whatsappSameAsMobile: "My WhatsApp number is the same as my mobile", whatsappNumber: "WhatsApp number",
    preferredContactMethod: "Preferred contact method", preferredLanguage: "Preferred language",
    residenceCity: "City in Morocco", billingRecipientType: "This account is for",
    companyName: "Company name", billingFirstName: "Billing first name", billingLastName: "Billing last name",
    billingAddressLine1: "Address line 1", billingAddressLine2: "Address line 2",
    billingBuildingNumber: "Building, apartment or unit number", billingUnit: "Apartment / unit",
    addressSearch: "Address line", mapsHelp: "How do I get a Google Maps link?", openInGoogleMaps: "Open in Google Maps",
    billingPostalCode: "Postal code", billingCity: "City", billingRegion: "State / province / region",
    billingCountry: "Country", taxId: "Tax / VAT number (optional)", invoiceEmail: "Invoice email",
    invoiceEmailSameAsContact: "Same as my contact email",
    propertyName: "Property name or nickname", propertyAddressLine1: "Address line 1", propertyAddressLine2: "Address line 2",
    residenceName: "Residence or building name", propertyBuildingNumber: "Building, apartment, unit or villa number",
    propertyUnitNumber: "Apartment, unit or villa number", propertyFloor: "Floor", propertyPostalCode: "Postal code",
    propertyCity: "City", propertyRegion: "Province or region", neighbourhood: "Neighbourhood or district", googleMapsUrl: "Google Maps link", entryNotes: "Property-entry notes",
    authorizedBySubmitter: "I confirm I am authorized to request services for this property",
    propertyType: "Property type", sizeM2: "Approximate size (m²)", bedrooms: "Bedrooms", bathrooms: "Bathrooms",
    kitchens: "Kitchens", livingRooms: "Living rooms", numberOfFloors: "Number of floors", propertyFloorInfo: "Property floor",
    elevatorStatus: "Elevator available", outdoorArea: "Outdoor area", occupancyType: "Occupancy",
    propertyCondition: "Current condition", furnishingStatus: "Furnishing", petsPresent: "Pets present",
    smokingStatus: "Indoor smoking", serviceTypes: "Services you're interested in", desiredFrequency: "Desired frequency",
    expectedStartPeriod: "Expected start", preferredStartDate: "Preferred start date (optional)",
    serviceNotes: "Anything else about the service (optional)", accessMethod: "How would we access the property?",
    thirdPartyDetails: "Access arrangement details", accessNotes: "Access notes (optional)",
  },
  hints: {
    entryNotes: "Gate codes, door details, parking, or anything that helps our team.",
    sizeM2: "A rough estimate is fine.",
    googleMapsUrl: "Filled in automatically from the pin above. Adjust the pin to update it, or paste your own link.",
    notBookingServices: "This helps us plan. It is not a confirmed appointment.",
  },
  options: {
    contactMethod: { email: "Email", whatsapp: "WhatsApp", telephone: "Telephone" },
    recipientType: { private: "A private individual", business: "A business" },
    propertyType: { apartment: "Apartment", house: "House", villa: "Villa", holiday_home: "Holiday home", short_term_rental: "Airbnb / short-term rental", riad: "Riad", office: "Office", other: "Other" },
    outdoor: { none: "None", balcony: "Balcony", terrace: "Terrace", garden: "Garden", courtyard: "Courtyard", multiple: "Multiple" },
    occupancy: { primary_residence: "Primary residence", secondary_residence: "Secondary residence", holiday_home: "Holiday home", short_term_rental: "Short-term rental", long_term_rental: "Long-term rental", empty: "Empty property" },
    condition: { maintained: "Regularly maintained", standard: "Standard cleaning needed", empty_a_while: "Empty for some time", deep_clean: "Deep cleaning may be required", renovation_dust: "Renovation or construction dust", unsure: "Unsure" },
    furnishing: { fully_furnished: "Fully furnished", partially_furnished: "Partially furnished", unfurnished: "Unfurnished" },
    tristate: { yes: "Yes", no: "No", unknown: "Not sure" },
    service: { standard_cleaning: "Standard cleaning", deep_cleaning: "Deep cleaning", rental_cleaning: "Rental cleaning", property_care: "Property-care support", other: "Other" },
    frequency: { one_time: "One time", weekly: "Weekly", biweekly: "Every two weeks", monthly: "Monthly", before_arrival: "Before arrival", after_departure: "After departure", on_demand: "On demand", not_sure: "Not sure" },
    startPeriod: { asap: "As soon as available", within_1_month: "Within one month", within_3_months: "Within three months", within_6_months: "Within six months", later: "Later", no_fixed_date: "No fixed date" },
    access: { digital_lock: "Digital smart lock", physical_key: "Physical key", person_present: "Customer or family member present", concierge: "Concierge or reception", lockbox: "Key safe or lockbox", property_manager: "Property manager", other: "Other" },
  },
  keyNotice: {
    title: "About physical keys",
    body: "A physical-key handling fee may apply. It covers administration, secure storage and additional insurance requirements. Dar Tahara takes reasonable security precautions; physical-key storage does not by itself make Dar Tahara responsible for every possible theft, loss or unauthorized entry. Final responsibilities are governed by the agreement and applicable law.",
    ack: "I understand that physical-key handling may involve an additional fee and separate key-handling conditions.",
  },
  thirdPartyNotice: "We can't reliably plan recurring cleaning around someone who must travel to open the property each time. A dependable access arrangement is required.",
  digitalLockNotice: "Reliable digital access is preferred where available. It improves planning and access control.",
  digitalLockInternetNotice: {
    title: "Internet connection required",
    body: "A stable internet connection at the property is required for the digital smart lock to work.",
    ack: "I understand that a stable internet connection at the property is required for the digital smart lock to work, and that Dar Tahara is not responsible for a missed visit caused by a loss of internet connection at the property.",
  },
  phoneCountry: {
    label: "Country code",
    searchPlaceholder: "Search country or code",
    noResults: "No matching country",
  },
  maps: {
    searchPlaceholder: "Search for the property address",
    searching: "Searching…",
    noResults: "No matches. You can enter the address manually.",
    manualLink: "Enter the address manually",
    unavailable: "Address search is unavailable. Please type the address",
    pinTitle: "Place the pin at the correct property entrance",
    pinHelp: "Move the pin to the entrance our cleaning team should use.",
    useMyLocation: "Use my current location",
    locating: "Locating…",
    locationDenied: "We couldn't get your location. You can still search or move the pin on the map.",
    mapUnavailable: "The map is unavailable right now. You can still enter the address manually and continue.",
    adjusted: "Pin position confirmed by you",
  },
  citySelector: {
    searchPlaceholder: "Search your city",
    notListed: "My city is not listed",
    manualLabel: "Your city",
    manualPlaceholder: "Type your city",
    status: {
      planned: "Coming soon to this area",
      waiting_list: "Waiting list: we'll let you know when we launch here",
      unsupported: "Not yet in our service area. You can still join early access",
    },
  },
  smartLock: {
    eyebrow: "Property access",
    heading: "Make property access easier",
    intro: "A compatible digital smart lock can let our team in for scheduled cleaning without you needing to be home, and without us storing or carrying a physical key.",
    priceTag: "{price} including installation",
    options: {
      purchase_interested: { title: "Yes, I'm interested in a smart lock", note: "{price} including installation" },
      already_has_lock: { title: "I already have a compatible smart lock", note: "Tell us the brand so we can check it." },
      not_interested: { title: "No, not at this time", note: "You can always add one later." },
    },
    brandLabel: "Lock brand",
    brandPlaceholder: "e.g. TTLock, Nuki, Yale",
    modelLabel: "Lock model (if known)",
    modelPlaceholder: "Optional",
    ttlockNotice: "Dar Tahara currently supports compatible TTLock-based locks. We'll verify your lock before activating property access.",
    keyComparison: "A smart lock may reduce the need for physical-key storage and handling during scheduled visits.",
    reviewLabel: "Digital smart lock",
    reviewSubjectTo: "Subject to property and door compatibility confirmation. The order is only confirmed after we review compatibility and installation requirements.",
    confirm: {
      interested: "We've registered your interest in a digital smart lock for {price} including installation. We'll confirm compatibility and installation details before an order becomes final.",
      alreadyHas: "We'll review whether your existing smart lock is compatible with Dar Tahara's access system.",
    },
  },
  consent: {
    heading: "Confirm & consent",
    accurate: "I confirm that the information is accurate.",
    authorized: "I confirm that I am authorized to request services for this property.",
    privacy: "I accept the privacy policy.",
    operational: "I agree to receive operational communication about my early-access request.",
    reminder: "Email me up to two reminders if I leave this request unfinished.",
    reminderHint: "Optional, only for this incomplete request. This is not newsletter consent.",
    marketing: "I would like to receive Dar Tahara news, offers, and marketing updates.",
    marketingHint: "Optional and separate from messages about your request. You can unsubscribe any time.",
  },
  errors: {
    required: "This field is required.", invalid: "Please check this value.",
    invalid_email: "Please enter a valid email address.", invalid_url: "Please enter a valid link (starting with http).",
    phone_required: "Please add a phone or WhatsApp number, or choose email as your contact method.",
    authorization_required: "Please confirm you're authorized to request services for this property.",
    acknowledgement_required: "Please acknowledge the physical-key conditions to continue.",
    internet_acknowledgement_required: "Please confirm you understand the internet connection requirement to continue.",
    smart_lock_choice_required: "Please choose a smart-lock option to continue.",
    select_one: "Please select at least one service.", validation_failed: "Please review the highlighted fields.",
    captcha_failed: "We couldn't verify you're human. Please try again.",
    rate_limited: "Too many attempts. Please wait a moment and try again.",
    server_error: "Something went wrong on our side. Your details weren't lost. Please try again shortly.",
    network: "Network problem. Please check your connection and try again.",
  },
  success: {
    verifiedTitle: "Your email is confirmed 🎉",
    verifiedBody: "You're on the Dar Tahara early-access list. We'll contact you when service becomes available for your property. This is not a confirmed booking; it's your place in line.",
    alreadyTitle: "You're already confirmed",
    pendingTitle: "Almost there: check your inbox",
    pendingBody: "We've sent a confirmation link to your email. Please click it to secure your place. If it hasn't arrived in a few minutes, check spam or resend below.",
    expiredTitle: "This link has expired",
    expiredBody: "For your security, verification links expire after 48 hours. Enter your email to get a fresh one.",
    invalidTitle: "This link isn't valid",
    invalidBody: "The link may have already been used. Enter your email and we'll send a new confirmation.",
    resend: "Resend confirmation email",
    resent: "If that email is on our list, a new confirmation is on its way.",
    shareTitle: "Invite friends and family",
    shareBody: "Share your personal invitation link. It helps us bring Dar Tahara to your city sooner.",
    copy: "Copy link", copied: "Copied!", whatsapp: "Share on WhatsApp",
    shareMessage: "I've joined the Dar Tahara early-access list for premium home cleaning and property care in Morocco. You can register through my personal invitation: {link}",
    home: "Back to Dar Tahara",
  },
  submitted: {
    title: "Request received",
    body: "Thank you. Your early-access request has been saved.",
    checkInbox: "Please check your inbox to confirm your email and secure your place.",
  },
};

const fr: EarlyAccessCopy = {
  meta: {
    title: "Demander un accès anticipé: Dar Tahara au Maroc",
    description: "Enregistrez votre bien pour l'accès anticipé Dar Tahara : ménage premium et entretien de propriété au Maroc. Recevez les actualités du lancement et invitez vos proches.",
  },
  hero: {
    eyebrow: "Accès anticipé · Maroc",
    title: "Votre maison au Maroc, toujours prête à votre arrivée.",
    body: "Rejoignez l'accès anticipé Dar Tahara pour le ménage premium et l'entretien de propriété au Maroc. Enregistrez votre bien, recevez les actualités du lancement et invitez vos proches.",
    ctaPrimary: "Demander un accès anticipé",
    ctaSecondary: "Comment ça marche",
    benefitsTitle: "Ce que Dar Tahara construit",
    benefits: [
      "Un entretien fiable et transparent, pensé pour votre tranquillité d’esprit.",
      "Des standards de service cohérents, soutenus par une formation structurée et une technologie intelligente.",
      "Une croissance responsable visant à créer des perspectives plus sûres et plus professionnelles pour nos équipes.",
    ],
    missionLink: "Découvrir notre mission et notre vision",
    notBooking: "L'inscription est une demande d'accès anticipé, pas une réservation confirmée. Nous vous contacterons dès que le service sera disponible dans votre région.",
    reassure: "Environ 3 minutes · Vos informations restent confidentielles",
  },
  progress: { stepOf: "Étape {n} sur {total}", step: "Étape" },
  nav: { back: "Retour", next: "Continuer", submit: "Envoyer la demande", submitting: "Envoi…" },
  steps: {
    contact: { title: "Coordonnées", subtitle: "Comment vous joindre au sujet de votre demande." },
    billing: { title: "Adresse de facturation", subtitle: "C'est l'adresse utilisée pour votre compte client, la facturation et les factures. Elle peut être différente de l'adresse du bien au Maroc." },
    property_address: { title: "Adresse du bien au Maroc", subtitle: "C'est l'adresse physique où Dar Tahara assurera le ménage ou l'entretien de la propriété." },
    property_info: { title: "Informations sur le bien", subtitle: "Quelques détails pour planifier le bon service. Nous pourrons les vérifier lors de la première visite." },
    services: { title: "Préférences de service", subtitle: "Ce qui vous intéresse. Ce n'est pas un rendez-vous confirmé." },
    access: { title: "Accès au bien", subtitle: "Comment notre équipe accéderait au bien." },
    review: { title: "Vérification et consentement", subtitle: "Veuillez vérifier vos informations et confirmer." },
  },
  fields: {
    firstName: "Prénom", lastName: "Nom", email: "Adresse e-mail",
    countryCallingCode: "Indicatif pays", mobileNumber: "Numéro de mobile",
    whatsappSameAsMobile: "Mon numéro WhatsApp est le même que mon mobile", whatsappNumber: "Numéro WhatsApp",
    preferredContactMethod: "Moyen de contact préféré", preferredLanguage: "Langue préférée",
    residenceCity: "Ville au Maroc", billingRecipientType: "Ce compte est pour",
    companyName: "Nom de l'entreprise", billingFirstName: "Prénom (facturation)", billingLastName: "Nom (facturation)",
    billingAddressLine1: "Adresse ligne 1", billingAddressLine2: "Adresse ligne 2",
    billingBuildingNumber: "Numéro de bâtiment, d'appartement ou d'unité", billingUnit: "Appartement / unité",
    addressSearch: "Adresse", mapsHelp: "Comment obtenir un lien Google Maps ?", openInGoogleMaps: "Ouvrir dans Google Maps",
    billingPostalCode: "Code postal", billingCity: "Ville", billingRegion: "État / province / région",
    billingCountry: "Pays", taxId: "Numéro de TVA (facultatif)", invoiceEmail: "E-mail de facturation",
    invoiceEmailSameAsContact: "Identique à mon e-mail de contact",
    propertyName: "Nom ou surnom du bien", propertyAddressLine1: "Adresse ligne 1", propertyAddressLine2: "Adresse ligne 2",
    residenceName: "Nom de la résidence ou du bâtiment", propertyBuildingNumber: "Numéro de bâtiment, d'appartement, d'unité ou de villa",
    propertyUnitNumber: "Numéro d'appartement, d'unité ou de villa", propertyFloor: "Étage", propertyPostalCode: "Code postal",
    propertyCity: "Ville", propertyRegion: "Province ou région", neighbourhood: "Quartier ou secteur", googleMapsUrl: "Lien Google Maps", entryNotes: "Notes d'accès au bien",
    authorizedBySubmitter: "Je confirme être autorisé à demander des services pour ce bien",
    propertyType: "Type de bien", sizeM2: "Superficie approximative (m²)", bedrooms: "Chambres", bathrooms: "Salles de bain",
    kitchens: "Cuisines", livingRooms: "Salons", numberOfFloors: "Nombre d'étages", propertyFloorInfo: "Étage du bien",
    elevatorStatus: "Ascenseur disponible", outdoorArea: "Espace extérieur", occupancyType: "Occupation",
    propertyCondition: "État actuel", furnishingStatus: "Ameublement", petsPresent: "Animaux présents",
    smokingStatus: "Tabac à l'intérieur", serviceTypes: "Services qui vous intéressent", desiredFrequency: "Fréquence souhaitée",
    expectedStartPeriod: "Début envisagé", preferredStartDate: "Date de début préférée (facultatif)",
    serviceNotes: "Autre chose concernant le service (facultatif)", accessMethod: "Comment accéderions-nous au bien ?",
    thirdPartyDetails: "Détails de l'arrangement d'accès", accessNotes: "Notes d'accès (facultatif)",
  },
  hints: {
    entryNotes: "Codes de portail, quelle porte, stationnement: tout ce qui aide notre équipe.",
    sizeM2: "Une estimation approximative suffit.",
    googleMapsUrl: "Rempli automatiquement à partir du repère ci-dessus. Déplacez le repère pour le mettre à jour, ou collez votre propre lien.",
    notBookingServices: "Cela nous aide à planifier. Ce n'est pas un rendez-vous confirmé.",
  },
  options: {
    contactMethod: { email: "E-mail", whatsapp: "WhatsApp", telephone: "Téléphone" },
    recipientType: { private: "Un particulier", business: "Une entreprise" },
    propertyType: { apartment: "Appartement", house: "Maison", villa: "Villa", holiday_home: "Résidence de vacances", short_term_rental: "Airbnb / location courte durée", riad: "Riad", office: "Bureau", other: "Autre" },
    outdoor: { none: "Aucun", balcony: "Balcon", terrace: "Terrasse", garden: "Jardin", courtyard: "Cour", multiple: "Plusieurs" },
    occupancy: { primary_residence: "Résidence principale", secondary_residence: "Résidence secondaire", holiday_home: "Résidence de vacances", short_term_rental: "Location courte durée", long_term_rental: "Location longue durée", empty: "Bien vacant" },
    condition: { maintained: "Entretenu régulièrement", standard: "Ménage standard nécessaire", empty_a_while: "Vacant depuis un moment", deep_clean: "Nettoyage en profondeur possible", renovation_dust: "Poussière de rénovation ou de chantier", unsure: "Je ne sais pas" },
    furnishing: { fully_furnished: "Entièrement meublé", partially_furnished: "Partiellement meublé", unfurnished: "Non meublé" },
    tristate: { yes: "Oui", no: "Non", unknown: "Je ne sais pas" },
    service: { standard_cleaning: "Ménage standard", deep_cleaning: "Nettoyage en profondeur", rental_cleaning: "Ménage de location", property_care: "Entretien de la propriété", other: "Autre" },
    frequency: { one_time: "Une fois", weekly: "Hebdomadaire", biweekly: "Toutes les deux semaines", monthly: "Mensuel", before_arrival: "Avant l'arrivée", after_departure: "Après le départ", on_demand: "À la demande", not_sure: "Je ne sais pas" },
    startPeriod: { asap: "Dès que possible", within_1_month: "Dans un mois", within_3_months: "Dans trois mois", within_6_months: "Dans six mois", later: "Plus tard", no_fixed_date: "Pas de date fixe" },
    access: { digital_lock: "Serrure connectée", physical_key: "Clé physique", person_present: "Client ou proche présent", concierge: "Conciergerie ou réception", lockbox: "Coffre à clés", property_manager: "Gestionnaire du bien", other: "Autre" },
  },
  keyNotice: {
    title: "À propos des clés physiques",
    body: "Des frais de gestion de clé physique peuvent s'appliquer. Ils couvrent l'administration, le stockage sécurisé et des exigences d'assurance supplémentaires. Dar Tahara prend des précautions de sécurité raisonnables ; le stockage d'une clé physique ne rend pas à lui seul Dar Tahara responsable de tout vol, perte ou intrusion. Les responsabilités finales sont régies par le contrat et la loi applicable.",
    ack: "Je comprends que la gestion d'une clé physique peut impliquer des frais supplémentaires et des conditions distinctes.",
  },
  thirdPartyNotice: "Nous ne pouvons pas planifier de façon fiable un ménage récurrent autour d'une personne devant se déplacer pour ouvrir le bien à chaque fois. Un accès fiable est requis.",
  digitalLockNotice: "Un accès numérique fiable est préférable lorsqu'il est disponible: il améliore la planification et le contrôle d'accès.",
  digitalLockInternetNotice: {
    title: "Connexion internet requise",
    body: "Une connexion internet stable au niveau du bien est indispensable au fonctionnement de la serrure connectée.",
    ack: "Je comprends qu'une connexion internet stable au niveau du bien est indispensable au fonctionnement de la serrure connectée, et que Dar Tahara n'est pas responsable d'une visite manquée en raison d'une perte de connexion internet au niveau du bien.",
  },
  phoneCountry: {
    label: "Indicatif pays",
    searchPlaceholder: "Rechercher un pays ou un indicatif",
    noResults: "Aucun pays correspondant",
  },
  maps: {
    searchPlaceholder: "Rechercher l'adresse du bien",
    searching: "Recherche…",
    noResults: "Aucun résultat. Vous pouvez saisir l'adresse manuellement.",
    manualLink: "Saisir l'adresse manuellement",
    unavailable: "La recherche d'adresse est indisponible: veuillez saisir l'adresse",
    pinTitle: "Placez le repère à l'entrée exacte du bien",
    pinHelp: "Déplacez le repère vers l'entrée que notre équipe doit utiliser.",
    useMyLocation: "Utiliser ma position actuelle",
    locating: "Localisation…",
    locationDenied: "Nous n'avons pas pu obtenir votre position. Vous pouvez toujours rechercher ou déplacer le repère.",
    mapUnavailable: "La carte est indisponible pour le moment. Vous pouvez saisir l'adresse manuellement et continuer.",
    adjusted: "Position du repère confirmée par vous",
  },
  citySelector: {
    searchPlaceholder: "Recherchez votre ville",
    notListed: "Ma ville n'est pas dans la liste",
    manualLabel: "Votre ville",
    manualPlaceholder: "Saisissez votre ville",
    status: {
      planned: "Bientôt disponible dans cette zone",
      waiting_list: "Liste d'attente: nous vous préviendrons de notre lancement ici",
      unsupported: "Pas encore dans notre zone de service: vous pouvez tout de même rejoindre l'accès anticipé",
    },
  },
  smartLock: {
    eyebrow: "Accès au bien",
    heading: "Facilitez l'accès à votre bien",
    intro: "Une serrure connectée compatible peut permettre à notre équipe d'entrer pour le ménage planifié sans que vous soyez présent, et sans que nous conservions ni transportions une clé physique.",
    priceTag: "{price} installation comprise",
    options: {
      purchase_interested: { title: "Oui, une serrure connectée m'intéresse", note: "{price} installation comprise" },
      already_has_lock: { title: "J'ai déjà une serrure connectée compatible", note: "Indiquez-nous la marque pour que nous la vérifiions." },
      not_interested: { title: "Non, pas pour le moment", note: "Vous pourrez en ajouter une plus tard." },
    },
    brandLabel: "Marque de la serrure",
    brandPlaceholder: "ex. TTLock, Nuki, Yale",
    modelLabel: "Modèle de la serrure (si connu)",
    modelPlaceholder: "Facultatif",
    ttlockNotice: "Dar Tahara prend actuellement en charge les serrures compatibles TTLock. Nous vérifierons votre serrure avant d'activer l'accès au bien.",
    keyComparison: "Une serrure connectée peut réduire le besoin de stocker et de gérer une clé physique lors des visites planifiées.",
    reviewLabel: "Serrure connectée",
    reviewSubjectTo: "Sous réserve de confirmation de compatibilité du bien et de la porte. La commande n'est confirmée qu'après vérification de la compatibilité et des conditions d'installation.",
    confirm: {
      interested: "Nous avons enregistré votre intérêt pour une serrure connectée à {price} installation comprise. Nous confirmerons la compatibilité et les détails d'installation avant qu'une commande ne soit définitive.",
      alreadyHas: "Nous vérifierons si votre serrure connectée existante est compatible avec le système d'accès de Dar Tahara.",
    },
  },
  consent: {
    heading: "Confirmation et consentement",
    accurate: "Je confirme que les informations sont exactes.",
    authorized: "Je confirme être autorisé à demander des services pour ce bien.",
    privacy: "J'accepte la politique de confidentialité.",
    operational: "J'accepte de recevoir des communications opérationnelles concernant ma demande d'accès anticipé.",
    reminder: "Envoyez-moi au maximum deux rappels si je ne termine pas cette demande.",
    reminderHint: "Facultatif, uniquement pour cette demande incomplète. Ce n'est pas un consentement à la newsletter.",
    marketing: "Je souhaite recevoir les actualités, offres et nouveautés de Dar Tahara.",
    marketingHint: "Facultatif: distinct des messages sur votre demande. Désinscription à tout moment.",
  },
  errors: {
    required: "Ce champ est requis.", invalid: "Veuillez vérifier cette valeur.",
    invalid_email: "Veuillez saisir une adresse e-mail valide.", invalid_url: "Veuillez saisir un lien valide (commençant par http).",
    phone_required: "Ajoutez un numéro de téléphone ou WhatsApp, ou choisissez l'e-mail comme moyen de contact.",
    authorization_required: "Veuillez confirmer que vous êtes autorisé à demander des services pour ce bien.",
    acknowledgement_required: "Veuillez accepter les conditions relatives aux clés physiques pour continuer.",
    internet_acknowledgement_required: "Veuillez confirmer que vous comprenez l'exigence de connexion internet pour continuer.",
    smart_lock_choice_required: "Veuillez choisir une option de serrure connectée pour continuer.",
    select_one: "Veuillez sélectionner au moins un service.", validation_failed: "Veuillez vérifier les champs indiqués.",
    captcha_failed: "Nous n'avons pas pu vérifier que vous êtes humain. Veuillez réessayer.",
    rate_limited: "Trop de tentatives. Veuillez patienter un instant et réessayer.",
    server_error: "Un problème est survenu de notre côté. Vos informations ne sont pas perdues: veuillez réessayer sous peu.",
    network: "Problème de réseau. Vérifiez votre connexion et réessayez.",
  },
  success: {
    verifiedTitle: "Votre e-mail est confirmé 🎉",
    verifiedBody: "Vous êtes sur la liste d'accès anticipé Dar Tahara. Nous vous contacterons dès que le service sera disponible pour votre bien. Ce n'est pas une réservation confirmée: c'est votre place dans la file.",
    alreadyTitle: "Vous êtes déjà confirmé",
    pendingTitle: "Presque terminé: vérifiez votre boîte de réception",
    pendingBody: "Nous avons envoyé un lien de confirmation à votre e-mail. Cliquez dessus pour réserver votre place. S'il n'arrive pas d'ici quelques minutes, vérifiez les spams ou renvoyez-le ci-dessous.",
    expiredTitle: "Ce lien a expiré",
    expiredBody: "Pour votre sécurité, les liens de vérification expirent après 48 heures. Saisissez votre e-mail pour en recevoir un nouveau.",
    invalidTitle: "Ce lien n'est pas valide",
    invalidBody: "Le lien a peut-être déjà été utilisé. Saisissez votre e-mail et nous enverrons une nouvelle confirmation.",
    resend: "Renvoyer l'e-mail de confirmation",
    resent: "Si cet e-mail figure sur notre liste, une nouvelle confirmation est en route.",
    shareTitle: "Invitez vos proches",
    shareBody: "Partagez votre lien d'invitation personnel. Cela nous aide à arriver plus vite dans votre ville.",
    copy: "Copier le lien", copied: "Copié !", whatsapp: "Partager sur WhatsApp",
    shareMessage: "J'ai rejoint la liste d'accès anticipé Dar Tahara pour le ménage premium et l'entretien de propriété au Maroc. Vous pouvez vous inscrire via mon invitation personnelle : {link}",
    home: "Retour à Dar Tahara",
  },
  submitted: {
    title: "Demande reçue",
    body: "Merci. Votre demande d'accès anticipé a été enregistrée.",
    checkInbox: "Veuillez consulter votre boîte de réception pour confirmer votre e-mail et réserver votre place.",
  },
};

const ar: EarlyAccessCopy = {
  meta: {
    title: "اطلب الوصول المبكر: دار طهارة في المغرب",
    description: "سجّل عقارك للوصول المبكر إلى دار طهارة: تنظيف منزلي راقٍ وعناية بالعقار في المغرب. استقبل مستجدات الإطلاق وادعُ العائلة والأصدقاء.",
  },
  hero: {
    eyebrow: "وصول مبكر · المغرب",
    title: "منزلك في المغرب، جاهز دائمًا عند وصولك.",
    body: "انضم إلى الوصول المبكر من دار طهارة للحصول على تنظيف منزلي راقٍ والعناية بالعقار في المغرب. سجّل عقارك، واستقبل مستجدات الإطلاق، وادعُ العائلة والأصدقاء.",
    ctaPrimary: "اطلب الوصول المبكر",
    ctaSecondary: "كيف يعمل",
    benefitsTitle: "ما الذي تبنيه دار طهارة",
    benefits: [
      "عناية منزلية موثوقة وشفافة، صُممت لراحة بالك.",
      "معايير خدمة متسقة تدعمها تدريبات منظمة وتقنية ذكية.",
      "نمو مسؤول يهدف إلى توفير فرص أكثر أمانًا واحترافية لفرقنا.",
    ],
    missionLink: "اقرأ رسالتنا ورؤيتنا",
    notBooking: "التسجيل هو طلب وصول مبكر وليس حجزًا مؤكدًا. سنتواصل معك عند توفّر الخدمة في منطقتك.",
    reassure: "نحو 3 دقائق · تبقى بياناتك خاصة",
  },
  progress: { stepOf: "الخطوة {n} من {total}", step: "الخطوة" },
  nav: { back: "رجوع", next: "متابعة", submit: "إرسال الطلب", submitting: "جارٍ الإرسال…" },
  steps: {
    contact: { title: "معلومات الاتصال", subtitle: "كيف نتواصل معك بشأن طلبك." },
    billing: { title: "عنوان الفوترة", subtitle: "هذا هو العنوان الذي سنستخدمه لحسابك والفوترة والفواتير. قد يختلف عن عنوان العقار في المغرب." },
    property_address: { title: "عنوان العقار في المغرب", subtitle: "هذا هو العنوان الفعلي حيث ستقدّم دار طهارة خدمات التنظيف أو العناية بالعقار." },
    property_info: { title: "معلومات العقار", subtitle: "بعض التفاصيل لنخطط للخدمة المناسبة. قد نتحقق منها في الزيارة الأولى." },
    services: { title: "تفضيلات الخدمة", subtitle: "ما يهمّك. هذا ليس موعدًا مؤكدًا." },
    access: { title: "الوصول إلى العقار", subtitle: "كيف سيصل فريقنا إلى العقار." },
    review: { title: "المراجعة والموافقة", subtitle: "يرجى مراجعة بياناتك والتأكيد." },
  },
  fields: {
    firstName: "الاسم الأول", lastName: "اسم العائلة", email: "البريد الإلكتروني",
    countryCallingCode: "رمز الدولة", mobileNumber: "رقم الجوال",
    whatsappSameAsMobile: "رقم واتساب هو نفسه رقم جوالي", whatsappNumber: "رقم واتساب",
    preferredContactMethod: "طريقة التواصل المفضلة", preferredLanguage: "اللغة المفضلة",
    residenceCity: "المدينة في المغرب", billingRecipientType: "هذا الحساب لـ",
    companyName: "اسم الشركة", billingFirstName: "الاسم الأول (الفوترة)", billingLastName: "اسم العائلة (الفوترة)",
    billingAddressLine1: "العنوان سطر 1", billingAddressLine2: "العنوان سطر 2",
    billingBuildingNumber: "رقم المبنى أو الشقة أو الوحدة", billingUnit: "شقة / وحدة",
    addressSearch: "العنوان", mapsHelp: "كيف أحصل على رابط خرائط جوجل؟", openInGoogleMaps: "افتح في خرائط جوجل",
    billingPostalCode: "الرمز البريدي", billingCity: "المدينة", billingRegion: "الولاية / الإقليم / المنطقة",
    billingCountry: "الدولة", taxId: "الرقم الضريبي (اختياري)", invoiceEmail: "بريد الفوترة",
    invoiceEmailSameAsContact: "نفس بريدي للتواصل",
    propertyName: "اسم العقار أو لقبه", propertyAddressLine1: "العنوان سطر 1", propertyAddressLine2: "العنوان سطر 2",
    residenceName: "اسم الإقامة أو المبنى", propertyBuildingNumber: "رقم المبنى أو الشقة أو الوحدة أو الفيلا",
    propertyUnitNumber: "رقم الشقة أو الوحدة أو الفيلا", propertyFloor: "الطابق", propertyPostalCode: "الرمز البريدي",
    propertyCity: "المدينة", propertyRegion: "الإقليم أو المنطقة", neighbourhood: "الحي أو المنطقة", googleMapsUrl: "رابط خرائط جوجل", entryNotes: "ملاحظات الدخول للعقار",
    authorizedBySubmitter: "أؤكد أنني مخوّل بطلب الخدمات لهذا العقار",
    propertyType: "نوع العقار", sizeM2: "المساحة التقريبية (م²)", bedrooms: "غرف النوم", bathrooms: "الحمامات",
    kitchens: "المطابخ", livingRooms: "غرف المعيشة", numberOfFloors: "عدد الطوابق", propertyFloorInfo: "طابق العقار",
    elevatorStatus: "يوجد مصعد", outdoorArea: "مساحة خارجية", occupancyType: "الإشغال",
    propertyCondition: "الحالة الراهنة", furnishingStatus: "التأثيث", petsPresent: "وجود حيوانات أليفة",
    smokingStatus: "التدخين داخل العقار", serviceTypes: "الخدمات التي تهمّك", desiredFrequency: "التكرار المطلوب",
    expectedStartPeriod: "البدء المتوقع", preferredStartDate: "تاريخ البدء المفضل (اختياري)",
    serviceNotes: "أي شيء آخر بخصوص الخدمة (اختياري)", accessMethod: "كيف سنصل إلى العقار؟",
    thirdPartyDetails: "تفاصيل ترتيب الوصول", accessNotes: "ملاحظات الوصول (اختياري)",
  },
  hints: {
    entryNotes: "رموز البوابة، أي باب، موقف السيارات: أي شيء يساعد فريقنا.",
    sizeM2: "التقدير التقريبي كافٍ.",
    googleMapsUrl: "يُملأ تلقائيًا من العلامة أعلاه. اضبط العلامة لتحديثه، أو الصق رابطك الخاص.",
    notBookingServices: "هذا يساعدنا على التخطيط. ليس موعدًا مؤكدًا.",
  },
  options: {
    contactMethod: { email: "البريد الإلكتروني", whatsapp: "واتساب", telephone: "الهاتف" },
    recipientType: { private: "فرد", business: "شركة" },
    propertyType: { apartment: "شقة", house: "منزل", villa: "فيلا", holiday_home: "منزل عطلات", short_term_rental: "إيجار قصير المدى / Airbnb", riad: "رياض", office: "مكتب", other: "أخرى" },
    outdoor: { none: "لا يوجد", balcony: "شرفة", terrace: "تراس", garden: "حديقة", courtyard: "فناء", multiple: "متعددة" },
    occupancy: { primary_residence: "سكن رئيسي", secondary_residence: "سكن ثانوي", holiday_home: "منزل عطلات", short_term_rental: "إيجار قصير المدى", long_term_rental: "إيجار طويل المدى", empty: "عقار فارغ" },
    condition: { maintained: "تتم صيانته بانتظام", standard: "يحتاج تنظيفًا عاديًا", empty_a_while: "فارغ منذ فترة", deep_clean: "قد يحتاج تنظيفًا عميقًا", renovation_dust: "غبار ترميم أو بناء", unsure: "غير متأكد" },
    furnishing: { fully_furnished: "مفروش بالكامل", partially_furnished: "مفروش جزئيًا", unfurnished: "غير مفروش" },
    tristate: { yes: "نعم", no: "لا", unknown: "غير متأكد" },
    service: { standard_cleaning: "تنظيف عادي", deep_cleaning: "تنظيف عميق", rental_cleaning: "تنظيف العقارات المؤجَّرة", property_care: "العناية بالعقار", other: "أخرى" },
    frequency: { one_time: "مرة واحدة", weekly: "أسبوعي", biweekly: "كل أسبوعين", monthly: "شهري", before_arrival: "قبل الوصول", after_departure: "بعد المغادرة", on_demand: "عند الطلب", not_sure: "غير متأكد" },
    startPeriod: { asap: "في أقرب وقت ممكن", within_1_month: "خلال شهر", within_3_months: "خلال ثلاثة أشهر", within_6_months: "خلال ستة أشهر", later: "لاحقًا", no_fixed_date: "بدون تاريخ محدد" },
    access: { digital_lock: "قفل ذكي رقمي", physical_key: "مفتاح فعلي", person_present: "وجود العميل أو أحد الأقارب", concierge: "بواب أو استقبال", lockbox: "صندوق مفاتيح", property_manager: "مدير العقار", other: "أخرى" },
  },
  keyNotice: {
    title: "بخصوص المفاتيح الفعلية",
    body: "قد تُطبّق رسوم إدارة المفتاح الفعلي. تغطي الإدارة والتخزين الآمن ومتطلبات تأمين إضافية. تتخذ دار طهارة احتياطات أمنية معقولة؛ وتخزين المفتاح الفعلي لا يجعل دار طهارة وحده مسؤولاً عن أي سرقة أو فقدان أو دخول غير مصرّح به. المسؤوليات النهائية يحكمها الاتفاق والقانون المعمول به.",
    ack: "أدرك أن التعامل مع المفتاح الفعلي قد يتضمن رسومًا إضافية وشروطًا منفصلة.",
  },
  thirdPartyNotice: "لا يمكننا التخطيط بشكل موثوق لتنظيف متكرر يعتمد على شخص يجب أن يتنقل لفتح العقار في كل مرة. يلزم ترتيب وصول موثوق.",
  digitalLockNotice: "يُفضّل الوصول الرقمي الموثوق عند توفره: فهو يحسّن التخطيط والتحكم في الدخول.",
  digitalLockInternetNotice: {
    title: "اتصال إنترنت مطلوب",
    body: "يلزم توفر اتصال إنترنت مستقر في العقار لكي يعمل القفل الذكي الرقمي.",
    ack: "أتفهم أن اتصال إنترنت مستقر في العقار ضروري لعمل القفل الذكي الرقمي، وأن دار طهارة غير مسؤولة عن أي زيارة تفوت بسبب انقطاع الإنترنت في العقار.",
  },
  phoneCountry: {
    label: "رمز الدولة",
    searchPlaceholder: "ابحث عن دولة أو رمز",
    noResults: "لا توجد دولة مطابقة",
  },
  maps: {
    searchPlaceholder: "ابحث عن عنوان العقار",
    searching: "جارٍ البحث…",
    noResults: "لا توجد نتائج. يمكنك إدخال العنوان يدويًا.",
    manualLink: "إدخال العنوان يدويًا",
    unavailable: "البحث عن العناوين غير متاح: يرجى كتابة العنوان",
    pinTitle: "ضع المؤشر عند مدخل العقار الصحيح",
    pinHelp: "حرّك المؤشر إلى المدخل الذي ينبغي لفريق التنظيف استخدامه.",
    useMyLocation: "استخدم موقعي الحالي",
    locating: "جارٍ تحديد الموقع…",
    locationDenied: "تعذّر تحديد موقعك. ما زال بإمكانك البحث أو تحريك المؤشر على الخريطة.",
    mapUnavailable: "الخريطة غير متاحة حاليًا. يمكنك إدخال العنوان يدويًا والمتابعة.",
    adjusted: "تم تأكيد موضع المؤشر من قِبلك",
  },
  citySelector: {
    searchPlaceholder: "ابحث عن مدينتك",
    notListed: "مدينتي غير مدرجة",
    manualLabel: "مدينتك",
    manualPlaceholder: "اكتب اسم مدينتك",
    status: {
      planned: "قريبًا في هذه المنطقة",
      waiting_list: "قائمة الانتظار: سنُعلمك عند إطلاقنا هنا",
      unsupported: "ليست ضمن نطاق خدمتنا بعد: بإمكانك الانضمام إلى الوصول المبكر",
    },
  },
  smartLock: {
    eyebrow: "الوصول إلى العقار",
    heading: "سهِّل الوصول إلى عقارك",
    intro: "يمكن لقفل ذكي رقمي متوافق أن يتيح لفريقنا الدخول لأداء التنظيف المجدول دون حاجتك للتواجد، ودون أن نحتفظ بمفتاح فعلي أو ننقله.",
    priceTag: "{price} شاملة التركيب",
    options: {
      purchase_interested: { title: "نعم، يهمّني الحصول على قفل ذكي", note: "{price} شاملة التركيب" },
      already_has_lock: { title: "لديّ بالفعل قفل ذكي متوافق", note: "أخبرنا بالعلامة التجارية لنتحقق منها." },
      not_interested: { title: "لا، ليس الآن", note: "يمكنك إضافته لاحقًا." },
    },
    brandLabel: "العلامة التجارية للقفل",
    brandPlaceholder: "مثال: TTLock، Nuki، Yale",
    modelLabel: "طراز القفل (إن وُجد)",
    modelPlaceholder: "اختياري",
    ttlockNotice: "تدعم دار طهارة حاليًا الأقفال المتوافقة مع TTLock. سنتحقق من قفلك قبل تفعيل الوصول إلى العقار.",
    keyComparison: "قد يقلّل القفل الذكي الحاجة إلى تخزين المفتاح الفعلي والتعامل معه خلال الزيارات المجدولة.",
    reviewLabel: "قفل ذكي رقمي",
    reviewSubjectTo: "رهنًا بتأكيد توافق العقار والباب. لا يتم تأكيد الطلب إلا بعد مراجعة التوافق ومتطلبات التركيب.",
    confirm: {
      interested: "سجّلنا اهتمامك بقفل ذكي رقمي مقابل {price} شاملة التركيب. سنؤكّد التوافق وتفاصيل التركيب قبل أن يصبح الطلب نهائيًا.",
      alreadyHas: "سنراجع ما إذا كان قفلك الذكي الحالي متوافقًا مع نظام الوصول في دار طهارة.",
    },
  },
  consent: {
    heading: "التأكيد والموافقة",
    accurate: "أؤكد أن المعلومات دقيقة.",
    authorized: "أؤكد أنني مخوّل بطلب الخدمات لهذا العقار.",
    privacy: "أوافق على سياسة الخصوصية.",
    operational: "أوافق على تلقّي رسائل تشغيلية بخصوص طلب الوصول المبكر.",
    reminder: "أرسلوا لي تذكيرين بحد أقصى إذا لم أكمل هذا الطلب.",
    reminderHint: "اختياري، ولهذا الطلب غير المكتمل فقط. هذه ليست موافقة على النشرة البريدية.",
    marketing: "أرغب في تلقّي أخبار وعروض ومستجدات دار طهارة.",
    marketingHint: "اختياري: منفصل عن رسائل طلبك. يمكنك إلغاء الاشتراك في أي وقت.",
  },
  errors: {
    required: "هذا الحقل مطلوب.", invalid: "يرجى التحقق من هذه القيمة.",
    invalid_email: "يرجى إدخال بريد إلكتروني صالح.", invalid_url: "يرجى إدخال رابط صالح (يبدأ بـ http).",
    phone_required: "أضف رقم هاتف أو واتساب، أو اختر البريد الإلكتروني كطريقة تواصل.",
    authorization_required: "يرجى تأكيد أنك مخوّل بطلب الخدمات لهذا العقار.",
    acknowledgement_required: "يرجى الموافقة على شروط المفتاح الفعلي للمتابعة.",
    internet_acknowledgement_required: "يرجى تأكيد فهمك لشرط اتصال الإنترنت للمتابعة.",
    smart_lock_choice_required: "يرجى اختيار أحد خيارات القفل الذكي للمتابعة.",
    select_one: "يرجى اختيار خدمة واحدة على الأقل.", validation_failed: "يرجى مراجعة الحقول المميزة.",
    captcha_failed: "تعذّر التحقق من أنك إنسان. يرجى المحاولة مرة أخرى.",
    rate_limited: "محاولات كثيرة. يرجى الانتظار قليلاً والمحاولة مجددًا.",
    server_error: "حدث خطأ من جانبنا. لم تُفقد بياناتك: يرجى المحاولة بعد قليل.",
    network: "مشكلة في الشبكة. تحقق من اتصالك وحاول مجددًا.",
  },
  success: {
    verifiedTitle: "تم تأكيد بريدك الإلكتروني 🎉",
    verifiedBody: "أنت الآن على قائمة الوصول المبكر لدار طهارة. سنتواصل معك عند توفّر الخدمة لعقارك. هذا ليس حجزًا مؤكدًا: إنه مكانك في القائمة.",
    alreadyTitle: "تم تأكيدك بالفعل",
    pendingTitle: "اقتربت: تحقق من بريدك",
    pendingBody: "أرسلنا رابط تأكيد إلى بريدك. اضغط عليه لتأكيد مكانك. إن لم يصل خلال دقائق، تحقق من البريد المزعج أو أعد الإرسال أدناه.",
    expiredTitle: "انتهت صلاحية هذا الرابط",
    expiredBody: "من أجل أمانك، تنتهي صلاحية روابط التحقق بعد 48 ساعة. أدخل بريدك للحصول على رابط جديد.",
    invalidTitle: "هذا الرابط غير صالح",
    invalidBody: "ربما تم استخدام الرابط من قبل. أدخل بريدك وسنرسل تأكيدًا جديدًا.",
    resend: "إعادة إرسال بريد التأكيد",
    resent: "إذا كان هذا البريد على قائمتنا، فإن تأكيدًا جديدًا في طريقه إليك.",
    shareTitle: "ادعُ العائلة والأصدقاء",
    shareBody: "شارك رابط دعوتك الشخصي. فهذا يساعدنا على الوصول إلى مدينتك أسرع.",
    copy: "نسخ الرابط", copied: "تم النسخ!", whatsapp: "المشاركة عبر واتساب",
    shareMessage: "لقد انضممت إلى قائمة الوصول المبكر لدار طهارة للتنظيف المنزلي الراقي والعناية بالعقار في المغرب. يمكنك التسجيل عبر دعوتي الشخصية: {link}",
    home: "العودة إلى دار طهارة",
  },
  submitted: {
    title: "تم استلام الطلب",
    body: "شكرًا لك. تم حفظ طلب الوصول المبكر الخاص بك.",
    checkInbox: "يرجى مراجعة بريدك لتأكيد بريدك الإلكتروني وتأكيد مكانك.",
  },
};

const nl: EarlyAccessCopy = {
  meta: {
    title: "Vraag early access aan: Dar Tahara woningverzorging in Marokko",
    description: "Registreer uw woning voor Dar Tahara early access: premium schoonmaak en woningverzorging in Marokko. Ontvang lanceringsupdates en nodig familie en vrienden uit.",
  },
  hero: {
    eyebrow: "Early access · Marokko",
    title: "Uw huis in Marokko, altijd klaar wanneer u aankomt.",
    body: "Doe mee aan Dar Tahara early access voor premium schoonmaak en woningverzorging in Marokko. Registreer uw woning, ontvang lanceringsupdates en nodig familie en vrienden uit.",
    ctaPrimary: "Early access aanvragen",
    ctaSecondary: "Hoe het werkt",
    benefitsTitle: "Waar Dar Tahara aan bouwt",
    benefits: [
      "Betrouwbare, transparante woningzorg met uw gemoedsrust als uitgangspunt.",
      "Consistente servicenormen, ondersteund door gestructureerde training en slimme technologie.",
      "Verantwoorde groei die veiligere en professionelere kansen voor onze teams wil creëren.",
    ],
    missionLink: "Lees onze missie en visie",
    notBooking: "Registreren is een early-access-aanvraag, geen bevestigde boeking. We nemen contact op zodra de dienst in uw regio beschikbaar is.",
    reassure: "Duurt ongeveer 3 minuten · Uw gegevens blijven privé",
  },
  progress: { stepOf: "Stap {n} van {total}", step: "Stap" },
  nav: { back: "Terug", next: "Doorgaan", submit: "Aanvraag versturen", submitting: "Versturen…" },
  steps: {
    contact: { title: "Contactgegevens", subtitle: "Hoe we u over uw aanvraag kunnen bereiken." },
    billing: { title: "Factuuradres", subtitle: "Dit is het adres voor uw klantaccount, facturering en facturen. Het kan verschillen van het woningadres in Marokko." },
    property_address: { title: "Woningadres in Marokko", subtitle: "Dit is het fysieke adres waar Dar Tahara schoonmaak of woningverzorging levert." },
    property_info: { title: "Woninggegevens", subtitle: "Enkele details zodat we de juiste zorg kunnen plannen. We kunnen deze bij het eerste bezoek verifiëren." },
    services: { title: "Servicevoorkeuren", subtitle: "Waar u in geïnteresseerd bent. Dit is geen bevestigde afspraak." },
    access: { title: "Toegang tot de woning", subtitle: "Hoe ons team toegang tot de woning krijgt." },
    review: { title: "Controle en toestemming", subtitle: "Controleer uw gegevens en bevestig." },
  },
  fields: {
    firstName: "Voornaam", lastName: "Achternaam", email: "E-mailadres",
    countryCallingCode: "Landcode", mobileNumber: "Mobiel nummer",
    whatsappSameAsMobile: "Mijn WhatsApp-nummer is hetzelfde als mijn mobiel", whatsappNumber: "WhatsApp-nummer",
    preferredContactMethod: "Voorkeurscontactmethode", preferredLanguage: "Voorkeurstaal",
    residenceCity: "Stad in Marokko", billingRecipientType: "Dit account is voor",
    companyName: "Bedrijfsnaam", billingFirstName: "Voornaam (facturering)", billingLastName: "Achternaam (facturering)",
    billingAddressLine1: "Adresregel 1", billingAddressLine2: "Adresregel 2",
    billingBuildingNumber: "Gebouw-, appartement- of unitnummer", billingUnit: "Appartement / unit",
    addressSearch: "Adres", mapsHelp: "Hoe krijg ik een Google Maps-link?", openInGoogleMaps: "Openen in Google Maps",
    billingPostalCode: "Postcode", billingCity: "Plaats", billingRegion: "Staat / provincie / regio",
    billingCountry: "Land", taxId: "Btw-nummer (optioneel)", invoiceEmail: "Factuur-e-mail",
    invoiceEmailSameAsContact: "Zelfde als mijn contact-e-mail",
    propertyName: "Naam of bijnaam van de woning", propertyAddressLine1: "Adresregel 1", propertyAddressLine2: "Adresregel 2",
    residenceName: "Naam van residentie of gebouw", propertyBuildingNumber: "Gebouw-, appartement-, unit- of villanummer",
    propertyUnitNumber: "Appartement-, unit- of villanummer", propertyFloor: "Verdieping", propertyPostalCode: "Postcode",
    propertyCity: "Plaats", propertyRegion: "Provincie of regio", neighbourhood: "Buurt of wijk", googleMapsUrl: "Google Maps-link", entryNotes: "Toegangsnotities woning",
    authorizedBySubmitter: "Ik bevestig dat ik gemachtigd ben om diensten voor deze woning aan te vragen",
    propertyType: "Type woning", sizeM2: "Geschatte oppervlakte (m²)", bedrooms: "Slaapkamers", bathrooms: "Badkamers",
    kitchens: "Keukens", livingRooms: "Woonkamers", numberOfFloors: "Aantal verdiepingen", propertyFloorInfo: "Verdieping van de woning",
    elevatorStatus: "Lift aanwezig", outdoorArea: "Buitenruimte", occupancyType: "Gebruik",
    propertyCondition: "Huidige staat", furnishingStatus: "Inrichting", petsPresent: "Huisdieren aanwezig",
    smokingStatus: "Binnen roken", serviceTypes: "Diensten waarin u geïnteresseerd bent", desiredFrequency: "Gewenste frequentie",
    expectedStartPeriod: "Verwachte start", preferredStartDate: "Voorkeursstartdatum (optioneel)",
    serviceNotes: "Iets anders over de dienst (optioneel)", accessMethod: "Hoe krijgen we toegang tot de woning?",
    thirdPartyDetails: "Details toegangsregeling", accessNotes: "Toegangsnotities (optioneel)",
  },
  hints: {
    entryNotes: "Toegangscodes, welke deur, parkeren: alles wat ons team helpt.",
    sizeM2: "Een ruwe schatting is prima.",
    googleMapsUrl: "Automatisch ingevuld op basis van de pin hierboven. Verplaats de pin om bij te werken, of plak uw eigen link.",
    notBookingServices: "Dit helpt ons plannen. Het is geen bevestigde afspraak.",
  },
  options: {
    contactMethod: { email: "E-mail", whatsapp: "WhatsApp", telephone: "Telefoon" },
    recipientType: { private: "Een particulier", business: "Een bedrijf" },
    propertyType: { apartment: "Appartement", house: "Huis", villa: "Villa", holiday_home: "Vakantiewoning", short_term_rental: "Airbnb / kortverblijf", riad: "Riad", office: "Kantoor", other: "Anders" },
    outdoor: { none: "Geen", balcony: "Balkon", terrace: "Terras", garden: "Tuin", courtyard: "Binnenplaats", multiple: "Meerdere" },
    occupancy: { primary_residence: "Hoofdverblijf", secondary_residence: "Tweede verblijf", holiday_home: "Vakantiewoning", short_term_rental: "Kortverblijfverhuur", long_term_rental: "Langverblijfverhuur", empty: "Leegstaande woning" },
    condition: { maintained: "Regelmatig onderhouden", standard: "Standaard schoonmaak nodig", empty_a_while: "Al een tijd leeg", deep_clean: "Mogelijk grondige schoonmaak nodig", renovation_dust: "Renovatie- of bouwstof", unsure: "Weet ik niet" },
    furnishing: { fully_furnished: "Volledig gemeubileerd", partially_furnished: "Deels gemeubileerd", unfurnished: "Ongemeubileerd" },
    tristate: { yes: "Ja", no: "Nee", unknown: "Weet ik niet" },
    service: { standard_cleaning: "Standaard schoonmaak", deep_cleaning: "Grondige schoonmaak", rental_cleaning: "Schoonmaak van verhuur", property_care: "Woningverzorging", other: "Anders" },
    frequency: { one_time: "Eenmalig", weekly: "Wekelijks", biweekly: "Om de twee weken", monthly: "Maandelijks", before_arrival: "Vóór aankomst", after_departure: "Na vertrek", on_demand: "Op aanvraag", not_sure: "Weet ik niet" },
    startPeriod: { asap: "Zodra beschikbaar", within_1_month: "Binnen een maand", within_3_months: "Binnen drie maanden", within_6_months: "Binnen zes maanden", later: "Later", no_fixed_date: "Geen vaste datum" },
    access: { digital_lock: "Digitaal slim slot", physical_key: "Fysieke sleutel", person_present: "Klant of familielid aanwezig", concierge: "Conciërge of receptie", lockbox: "Sleutelkluis", property_manager: "Vastgoedbeheerder", other: "Anders" },
  },
  keyNotice: {
    title: "Over fysieke sleutels",
    body: "Er kunnen kosten voor het beheer van een fysieke sleutel gelden. Deze dekken administratie, veilige opslag en aanvullende verzekeringseisen. Dar Tahara neemt redelijke veiligheidsmaatregelen; het bewaren van een fysieke sleutel maakt Dar Tahara op zichzelf niet verantwoordelijk voor elke mogelijke diefstal, verlies of ongeoorloofde toegang. De uiteindelijke verantwoordelijkheden worden bepaald door de overeenkomst en het toepasselijke recht.",
    ack: "Ik begrijp dat het beheer van een fysieke sleutel extra kosten en aparte voorwaarden met zich mee kan brengen.",
  },
  thirdPartyNotice: "We kunnen terugkerende schoonmaak niet betrouwbaar plannen rond iemand die telkens moet reizen om de woning te openen. Een betrouwbare toegangsregeling is vereist.",
  digitalLockNotice: "Betrouwbare digitale toegang heeft de voorkeur waar beschikbaar: het verbetert de planning en toegangscontrole.",
  digitalLockInternetNotice: {
    title: "Internetverbinding vereist",
    body: "Een stabiele internetverbinding op het pand is vereist om het digitale smart lock te laten werken.",
    ack: "Ik begrijp dat een stabiele internetverbinding op het pand vereist is voor het digitale smart lock, en dat Dar Tahara niet verantwoordelijk is voor een gemist bezoek door een internetstoring op het pand.",
  },
  phoneCountry: {
    label: "Landcode",
    searchPlaceholder: "Zoek land of code",
    noResults: "Geen overeenkomend land",
  },
  maps: {
    searchPlaceholder: "Zoek het adres van het pand",
    searching: "Zoeken…",
    noResults: "Geen resultaten. U kunt het adres handmatig invoeren.",
    manualLink: "Adres handmatig invoeren",
    unavailable: "Adres zoeken is niet beschikbaar: typ het adres",
    pinTitle: "Plaats de speld bij de juiste ingang van het pand",
    pinHelp: "Verplaats de speld naar de ingang die ons schoonmaakteam moet gebruiken.",
    useMyLocation: "Mijn huidige locatie gebruiken",
    locating: "Locatie bepalen…",
    locationDenied: "We konden uw locatie niet bepalen. U kunt nog steeds zoeken of de speld verplaatsen.",
    mapUnavailable: "De kaart is nu niet beschikbaar. U kunt het adres handmatig invoeren en doorgaan.",
    adjusted: "Speldpositie door u bevestigd",
  },
  citySelector: {
    searchPlaceholder: "Zoek uw stad",
    notListed: "Mijn stad staat er niet bij",
    manualLabel: "Uw stad",
    manualPlaceholder: "Typ uw stad",
    status: {
      planned: "Binnenkort beschikbaar in dit gebied",
      waiting_list: "Wachtlijst: we laten het weten wanneer we hier van start gaan",
      unsupported: "Nog niet in ons servicegebied: u kunt zich toch aanmelden voor early access",
    },
  },
  smartLock: {
    eyebrow: "Toegang tot het pand",
    heading: "Maak toegang tot uw woning eenvoudiger",
    intro: "Een compatibel digitaal smart lock kan ons team binnenlaten voor de geplande schoonmaak zonder dat u thuis hoeft te zijn, en zonder dat wij een fysieke sleutel bewaren of meenemen.",
    priceTag: "{price} inclusief installatie",
    options: {
      purchase_interested: { title: "Ja, ik heb interesse in een smart lock", note: "{price} inclusief installatie" },
      already_has_lock: { title: "Ik heb al een compatibel smart lock", note: "Geef het merk door zodat we het kunnen controleren." },
      not_interested: { title: "Nee, nu niet", note: "U kunt er later altijd een toevoegen." },
    },
    brandLabel: "Merk van het slot",
    brandPlaceholder: "bijv. TTLock, Nuki, Yale",
    modelLabel: "Model van het slot (indien bekend)",
    modelPlaceholder: "Optioneel",
    ttlockNotice: "Dar Tahara ondersteunt momenteel compatibele TTLock-sloten. We verifiëren uw slot voordat we toegang tot het pand activeren.",
    keyComparison: "Een smart lock kan de noodzaak verminderen om een fysieke sleutel te bewaren en te beheren tijdens geplande bezoeken.",
    reviewLabel: "Digitaal smart lock",
    reviewSubjectTo: "Onder voorbehoud van bevestiging van compatibiliteit van pand en deur. De bestelling wordt pas bevestigd nadat we compatibiliteit en installatievereisten hebben beoordeeld.",
    confirm: {
      interested: "We hebben uw interesse in een digitaal smart lock voor {price} inclusief installatie geregistreerd. We bevestigen de compatibiliteit en installatiedetails voordat een bestelling definitief wordt.",
      alreadyHas: "We beoordelen of uw bestaande smart lock compatibel is met het toegangssysteem van Dar Tahara.",
    },
  },
  consent: {
    heading: "Bevestigen en toestemming",
    accurate: "Ik bevestig dat de informatie juist is.",
    authorized: "Ik bevestig dat ik gemachtigd ben om diensten voor deze woning aan te vragen.",
    privacy: "Ik accepteer het privacybeleid.",
    operational: "Ik ga akkoord met operationele communicatie over mijn early-access-aanvraag.",
    reminder: "Stuur mij maximaal twee herinneringen als ik deze aanvraag niet afmaak.",
    reminderHint: "Optioneel, alleen voor deze onafgemaakte aanvraag. Dit is geen nieuwsbrief toestemming.",
    marketing: "Ik wil nieuws, aanbiedingen en marketingupdates van Dar Tahara ontvangen.",
    marketingHint: "Optioneel: los van de berichten over uw aanvraag. U kunt zich altijd uitschrijven.",
  },
  errors: {
    required: "Dit veld is verplicht.", invalid: "Controleer deze waarde.",
    invalid_email: "Voer een geldig e-mailadres in.", invalid_url: "Voer een geldige link in (beginnend met http).",
    phone_required: "Voeg een telefoon- of WhatsApp-nummer toe, of kies e-mail als contactmethode.",
    authorization_required: "Bevestig dat u gemachtigd bent om diensten voor deze woning aan te vragen.",
    acknowledgement_required: "Ga akkoord met de voorwaarden voor fysieke sleutels om door te gaan.",
    internet_acknowledgement_required: "Bevestig dat u de vereiste internetverbinding begrijpt om door te gaan.",
    smart_lock_choice_required: "Kies een smart lock-optie om door te gaan.",
    select_one: "Selecteer minstens één dienst.", validation_failed: "Controleer de gemarkeerde velden.",
    captcha_failed: "We konden niet verifiëren dat u een mens bent. Probeer het opnieuw.",
    rate_limited: "Te veel pogingen. Wacht even en probeer het opnieuw.",
    server_error: "Er ging iets mis aan onze kant. Uw gegevens zijn niet verloren: probeer het zo opnieuw.",
    network: "Netwerkprobleem. Controleer uw verbinding en probeer opnieuw.",
  },
  success: {
    verifiedTitle: "Uw e-mail is bevestigd 🎉",
    verifiedBody: "U staat op de Dar Tahara early-access-lijst. We nemen contact op zodra de dienst voor uw woning beschikbaar is. Dit is geen bevestigde boeking: het is uw plek in de rij.",
    alreadyTitle: "U bent al bevestigd",
    pendingTitle: "Bijna klaar: controleer uw inbox",
    pendingBody: "We hebben een bevestigingslink naar uw e-mail gestuurd. Klik erop om uw plek te reserveren. Als hij niet binnen enkele minuten aankomt, controleer dan spam of verstuur hieronder opnieuw.",
    expiredTitle: "Deze link is verlopen",
    expiredBody: "Voor uw veiligheid verlopen verificatielinks na 48 uur. Voer uw e-mail in voor een nieuwe.",
    invalidTitle: "Deze link is niet geldig",
    invalidBody: "De link is mogelijk al gebruikt. Voer uw e-mail in en we sturen een nieuwe bevestiging.",
    resend: "Bevestigingsmail opnieuw versturen",
    resent: "Als dat e-mailadres op onze lijst staat, is een nieuwe bevestiging onderweg.",
    shareTitle: "Nodig familie en vrienden uit",
    shareBody: "Deel uw persoonlijke uitnodigingslink. Zo brengen we Dar Tahara sneller naar uw stad.",
    copy: "Link kopiëren", copied: "Gekopieerd!", whatsapp: "Delen via WhatsApp",
    shareMessage: "Ik heb me aangemeld voor de Dar Tahara early-access-lijst voor premium schoonmaak en woningverzorging in Marokko. U kunt zich registreren via mijn persoonlijke uitnodiging: {link}",
    home: "Terug naar Dar Tahara",
  },
  submitted: {
    title: "Aanvraag ontvangen",
    body: "Bedankt. Uw early-access-aanvraag is opgeslagen.",
    checkInbox: "Controleer uw inbox om uw e-mail te bevestigen en uw plek te reserveren.",
  },
};

const es: EarlyAccessCopy = {
  meta: {
    title: "Solicita acceso anticipado: Dar Tahara cuidado del hogar en Marruecos",
    description: "Registra tu propiedad para el acceso anticipado de Dar Tahara: limpieza premium y cuidado de propiedades en Marruecos. Recibe novedades del lanzamiento e invita a familiares y amigos.",
  },
  hero: {
    eyebrow: "Acceso anticipado · Marruecos",
    title: "Tu hogar en Marruecos, siempre listo cuando llegas.",
    body: "Únete al acceso anticipado de Dar Tahara para limpieza premium y cuidado de propiedades en Marruecos. Registra tu propiedad, recibe novedades del lanzamiento e invita a familiares y amigos.",
    ctaPrimary: "Solicitar acceso anticipado",
    ctaSecondary: "Cómo funciona",
    benefitsTitle: "Lo que está construyendo Dar Tahara",
    benefits: [
      "Un cuidado del hogar fiable y transparente, pensado para tu tranquilidad.",
      "Estándares de servicio coherentes, respaldados por formación estructurada y tecnología inteligente.",
      "Un crecimiento responsable que aspira a crear oportunidades más seguras y profesionales para nuestros equipos.",
    ],
    missionLink: "Lee nuestra misión y visión",
    notBooking: "Registrarse es una solicitud de acceso anticipado, no una reserva confirmada. Te contactaremos cuando el servicio esté disponible en tu zona.",
    reassure: "Unos 3 minutos · Tus datos se mantienen privados",
  },
  progress: { stepOf: "Paso {n} de {total}", step: "Paso" },
  nav: { back: "Atrás", next: "Continuar", submit: "Enviar solicitud", submitting: "Enviando…" },
  steps: {
    contact: { title: "Información de contacto", subtitle: "Cómo contactarte sobre tu solicitud." },
    billing: { title: "Dirección de facturación", subtitle: "Es la dirección para tu cuenta de cliente, facturación y facturas. Puede ser diferente de la dirección de la propiedad en Marruecos." },
    property_address: { title: "Dirección de la propiedad en Marruecos", subtitle: "Es la dirección física donde Dar Tahara prestará servicios de limpieza o cuidado de la propiedad." },
    property_info: { title: "Información de la propiedad", subtitle: "Algunos datos para planificar el servicio adecuado. Podemos verificarlos en la primera visita." },
    services: { title: "Preferencias de servicio", subtitle: "Lo que te interesa. No es una cita confirmada." },
    access: { title: "Acceso a la propiedad", subtitle: "Cómo accedería nuestro equipo a la propiedad." },
    review: { title: "Revisión y consentimiento", subtitle: "Revisa tus datos y confirma." },
  },
  fields: {
    firstName: "Nombre", lastName: "Apellidos", email: "Correo electrónico",
    countryCallingCode: "Código de país", mobileNumber: "Número de móvil",
    whatsappSameAsMobile: "Mi número de WhatsApp es el mismo que mi móvil", whatsappNumber: "Número de WhatsApp",
    preferredContactMethod: "Método de contacto preferido", preferredLanguage: "Idioma preferido",
    residenceCity: "Ciudad en Marruecos", billingRecipientType: "Esta cuenta es para",
    companyName: "Nombre de la empresa", billingFirstName: "Nombre (facturación)", billingLastName: "Apellidos (facturación)",
    billingAddressLine1: "Dirección línea 1", billingAddressLine2: "Dirección línea 2",
    billingBuildingNumber: "Número de edificio, apartamento o unidad", billingUnit: "Apartamento / unidad",
    addressSearch: "Dirección", mapsHelp: "¿Cómo obtengo un enlace de Google Maps?", openInGoogleMaps: "Abrir en Google Maps",
    billingPostalCode: "Código postal", billingCity: "Ciudad", billingRegion: "Estado / provincia / región",
    billingCountry: "País", taxId: "Número de IVA (opcional)", invoiceEmail: "Correo de facturación",
    invoiceEmailSameAsContact: "Igual que mi correo de contacto",
    propertyName: "Nombre o apodo de la propiedad", propertyAddressLine1: "Dirección línea 1", propertyAddressLine2: "Dirección línea 2",
    residenceName: "Nombre de la residencia o edificio", propertyBuildingNumber: "Número de edificio, apartamento, unidad o villa",
    propertyUnitNumber: "Número de apartamento, unidad o villa", propertyFloor: "Piso", propertyPostalCode: "Código postal",
    propertyCity: "Ciudad", propertyRegion: "Provincia o región", neighbourhood: "Barrio o distrito", googleMapsUrl: "Enlace de Google Maps", entryNotes: "Notas de acceso a la propiedad",
    authorizedBySubmitter: "Confirmo que estoy autorizado a solicitar servicios para esta propiedad",
    propertyType: "Tipo de propiedad", sizeM2: "Superficie aproximada (m²)", bedrooms: "Dormitorios", bathrooms: "Baños",
    kitchens: "Cocinas", livingRooms: "Salones", numberOfFloors: "Número de plantas", propertyFloorInfo: "Planta de la propiedad",
    elevatorStatus: "Ascensor disponible", outdoorArea: "Espacio exterior", occupancyType: "Ocupación",
    propertyCondition: "Estado actual", furnishingStatus: "Amueblado", petsPresent: "Mascotas presentes",
    smokingStatus: "Fumar en el interior", serviceTypes: "Servicios que te interesan", desiredFrequency: "Frecuencia deseada",
    expectedStartPeriod: "Inicio previsto", preferredStartDate: "Fecha de inicio preferida (opcional)",
    serviceNotes: "Algo más sobre el servicio (opcional)", accessMethod: "¿Cómo accederíamos a la propiedad?",
    thirdPartyDetails: "Detalles del acuerdo de acceso", accessNotes: "Notas de acceso (opcional)",
  },
  hints: {
    entryNotes: "Códigos de acceso, qué puerta, aparcamiento: todo lo que ayude a nuestro equipo.",
    sizeM2: "Una estimación aproximada es suficiente.",
    googleMapsUrl: "Se rellena automáticamente a partir del pin de arriba. Ajusta el pin para actualizarlo, o pega tu propio enlace.",
    notBookingServices: "Esto nos ayuda a planificar. No es una cita confirmada.",
  },
  options: {
    contactMethod: { email: "Correo electrónico", whatsapp: "WhatsApp", telephone: "Teléfono" },
    recipientType: { private: "Un particular", business: "Una empresa" },
    propertyType: { apartment: "Apartamento", house: "Casa", villa: "Villa", holiday_home: "Casa de vacaciones", short_term_rental: "Airbnb / alquiler corto", riad: "Riad", office: "Oficina", other: "Otro" },
    outdoor: { none: "Ninguno", balcony: "Balcón", terrace: "Terraza", garden: "Jardín", courtyard: "Patio", multiple: "Varios" },
    occupancy: { primary_residence: "Residencia principal", secondary_residence: "Residencia secundaria", holiday_home: "Casa de vacaciones", short_term_rental: "Alquiler de corta duración", long_term_rental: "Alquiler de larga duración", empty: "Propiedad vacía" },
    condition: { maintained: "Mantenida con regularidad", standard: "Necesita limpieza estándar", empty_a_while: "Vacía desde hace tiempo", deep_clean: "Puede necesitar limpieza profunda", renovation_dust: "Polvo de reforma u obra", unsure: "No estoy seguro" },
    furnishing: { fully_furnished: "Totalmente amueblado", partially_furnished: "Parcialmente amueblado", unfurnished: "Sin amueblar" },
    tristate: { yes: "Sí", no: "No", unknown: "No estoy seguro" },
    service: { standard_cleaning: "Limpieza estándar", deep_cleaning: "Limpieza profunda", rental_cleaning: "Limpieza de alquileres", property_care: "Cuidado de la propiedad", other: "Otro" },
    frequency: { one_time: "Una vez", weekly: "Semanal", biweekly: "Cada dos semanas", monthly: "Mensual", before_arrival: "Antes de llegar", after_departure: "Después de salir", on_demand: "Bajo demanda", not_sure: "No estoy seguro" },
    startPeriod: { asap: "En cuanto esté disponible", within_1_month: "En un mes", within_3_months: "En tres meses", within_6_months: "En seis meses", later: "Más adelante", no_fixed_date: "Sin fecha fija" },
    access: { digital_lock: "Cerradura inteligente", physical_key: "Llave física", person_present: "Cliente o familiar presente", concierge: "Conserjería o recepción", lockbox: "Caja de seguridad para llaves", property_manager: "Administrador de la propiedad", other: "Otro" },
  },
  keyNotice: {
    title: "Sobre las llaves físicas",
    body: "Puede aplicarse una tarifa por gestión de llave física. Cubre administración, almacenamiento seguro y requisitos de seguro adicionales. Dar Tahara toma precauciones de seguridad razonables; el almacenamiento de una llave física no hace, por sí solo, que Dar Tahara sea responsable de cualquier robo, pérdida o acceso no autorizado. Las responsabilidades finales se rigen por el acuerdo y la ley aplicable.",
    ack: "Entiendo que la gestión de una llave física puede implicar una tarifa adicional y condiciones aparte.",
  },
  thirdPartyNotice: "No podemos planificar de forma fiable una limpieza recurrente en torno a alguien que deba desplazarse para abrir la propiedad cada vez. Se requiere un acuerdo de acceso fiable.",
  digitalLockNotice: "Se prefiere un acceso digital fiable cuando está disponible: mejora la planificación y el control de acceso.",
  digitalLockInternetNotice: {
    title: "Conexión a internet necesaria",
    body: "Es imprescindible una conexión a internet estable en la propiedad para que la cerradura inteligente funcione.",
    ack: "Entiendo que es imprescindible una conexión a internet estable en la propiedad para que la cerradura inteligente funcione, y que Dar Tahara no se hace responsable de una visita fallida por falta de conexión a internet en la propiedad.",
  },
  phoneCountry: {
    label: "Prefijo del país",
    searchPlaceholder: "Busca un país o prefijo",
    noResults: "Ningún país coincide",
  },
  maps: {
    searchPlaceholder: "Busca la dirección de la propiedad",
    searching: "Buscando…",
    noResults: "Sin resultados. Puedes introducir la dirección manualmente.",
    manualLink: "Introducir la dirección manualmente",
    unavailable: "La búsqueda de direcciones no está disponible: escribe la dirección",
    pinTitle: "Coloca el marcador en la entrada correcta",
    pinHelp: "Mueve el marcador a la entrada que debe usar nuestro equipo de limpieza.",
    useMyLocation: "Usar mi ubicación actual",
    locating: "Localizando…",
    locationDenied: "No pudimos obtener tu ubicación. Puedes seguir buscando o mover el marcador en el mapa.",
    mapUnavailable: "El mapa no está disponible ahora. Puedes introducir la dirección manualmente y continuar.",
    adjusted: "Posición del marcador confirmada por ti",
  },
  citySelector: {
    searchPlaceholder: "Busca tu ciudad",
    notListed: "Mi ciudad no está en la lista",
    manualLabel: "Tu ciudad",
    manualPlaceholder: "Escribe tu ciudad",
    status: {
      planned: "Próximamente en esta zona",
      waiting_list: "Lista de espera: te avisaremos cuando lancemos aquí",
      unsupported: "Aún no está en nuestra zona de servicio; puedes unirte igualmente al acceso anticipado",
    },
  },
  smartLock: {
    eyebrow: "Acceso a la propiedad",
    heading: "Facilita el acceso a tu propiedad",
    intro: "Una cerradura inteligente compatible puede permitir la entrada de nuestro equipo para la limpieza programada sin que tengas que estar en casa, y sin que guardemos ni transportemos una llave física.",
    priceTag: "{price} instalación incluida",
    options: {
      purchase_interested: { title: "Sí, me interesa una cerradura inteligente", note: "{price} instalación incluida" },
      already_has_lock: { title: "Ya tengo una cerradura inteligente compatible", note: "Dinos la marca para que la comprobemos." },
      not_interested: { title: "No, ahora no", note: "Siempre puedes añadir una más adelante." },
    },
    brandLabel: "Marca de la cerradura",
    brandPlaceholder: "p. ej. TTLock, Nuki, Yale",
    modelLabel: "Modelo de la cerradura (si lo conoces)",
    modelPlaceholder: "Opcional",
    ttlockNotice: "Dar Tahara admite actualmente cerraduras compatibles con TTLock. Verificaremos tu cerradura antes de activar el acceso a la propiedad.",
    keyComparison: "Una cerradura inteligente puede reducir la necesidad de guardar y gestionar una llave física durante las visitas programadas.",
    reviewLabel: "Cerradura inteligente",
    reviewSubjectTo: "Sujeto a la confirmación de compatibilidad de la propiedad y la puerta. El pedido solo se confirma tras revisar la compatibilidad y los requisitos de instalación.",
    confirm: {
      interested: "Hemos registrado tu interés en una cerradura inteligente por {price} instalación incluida. Confirmaremos la compatibilidad y los detalles de instalación antes de que un pedido sea definitivo.",
      alreadyHas: "Revisaremos si tu cerradura inteligente actual es compatible con el sistema de acceso de Dar Tahara.",
    },
  },
  consent: {
    heading: "Confirmar y consentir",
    accurate: "Confirmo que la información es correcta.",
    authorized: "Confirmo que estoy autorizado a solicitar servicios para esta propiedad.",
    privacy: "Acepto la política de privacidad.",
    operational: "Acepto recibir comunicaciones operativas sobre mi solicitud de acceso anticipado.",
    reminder: "Envíame como máximo dos recordatorios si dejo esta solicitud sin terminar.",
    reminderHint: "Opcional y solo para esta solicitud incompleta. No es consentimiento para el boletín.",
    marketing: "Deseo recibir noticias, ofertas y novedades de Dar Tahara.",
    marketingHint: "Opcional: independiente de los mensajes sobre tu solicitud. Puedes darte de baja cuando quieras.",
  },
  errors: {
    required: "Este campo es obligatorio.", invalid: "Revisa este valor.",
    invalid_email: "Introduce un correo electrónico válido.", invalid_url: "Introduce un enlace válido (que empiece por http).",
    phone_required: "Añade un número de teléfono o WhatsApp, o elige el correo como método de contacto.",
    authorization_required: "Confirma que estás autorizado a solicitar servicios para esta propiedad.",
    acknowledgement_required: "Acepta las condiciones de la llave física para continuar.",
    internet_acknowledgement_required: "Confirma que entiendes el requisito de conexión a internet para continuar.",
    smart_lock_choice_required: "Elige una opción de cerradura inteligente para continuar.",
    select_one: "Selecciona al menos un servicio.", validation_failed: "Revisa los campos marcados.",
    captcha_failed: "No pudimos verificar que eres humano. Inténtalo de nuevo.",
    rate_limited: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
    server_error: "Algo salió mal por nuestra parte. Tus datos no se han perdido: inténtalo de nuevo en breve.",
    network: "Problema de red. Comprueba tu conexión e inténtalo de nuevo.",
  },
  success: {
    verifiedTitle: "Tu correo está confirmado 🎉",
    verifiedBody: "Estás en la lista de acceso anticipado de Dar Tahara. Te contactaremos cuando el servicio esté disponible para tu propiedad. No es una reserva confirmada: es tu lugar en la fila.",
    alreadyTitle: "Ya estás confirmado",
    pendingTitle: "Casi listo: revisa tu bandeja de entrada",
    pendingBody: "Hemos enviado un enlace de confirmación a tu correo. Haz clic en él para asegurar tu lugar. Si no llega en unos minutos, revisa el spam o reenvíalo abajo.",
    expiredTitle: "Este enlace ha caducado",
    expiredBody: "Por tu seguridad, los enlaces de verificación caducan tras 48 horas. Introduce tu correo para recibir uno nuevo.",
    invalidTitle: "Este enlace no es válido",
    invalidBody: "Puede que el enlace ya se haya usado. Introduce tu correo y enviaremos una nueva confirmación.",
    resend: "Reenviar correo de confirmación",
    resent: "Si ese correo está en nuestra lista, una nueva confirmación está en camino.",
    shareTitle: "Invita a familiares y amigos",
    shareBody: "Comparte tu enlace de invitación personal. Nos ayuda a llegar antes a tu ciudad.",
    copy: "Copiar enlace", copied: "¡Copiado!", whatsapp: "Compartir por WhatsApp",
    shareMessage: "Me he unido a la lista de acceso anticipado de Dar Tahara para limpieza premium y cuidado de propiedades en Marruecos. Puedes registrarte con mi invitación personal: {link}",
    home: "Volver a Dar Tahara",
  },
  submitted: {
    title: "Solicitud recibida",
    body: "Gracias. Tu solicitud de acceso anticipado se ha guardado.",
    checkInbox: "Revisa tu bandeja de entrada para confirmar tu correo y asegurar tu lugar.",
  },
};

const de: EarlyAccessCopy = {
  meta: {
    title: "Frühzugang anfragen: Dar Tahara Hausbetreuung in Marokko",
    description: "Registrieren Sie Ihre Immobilie für den Dar Tahara Frühzugang: Premium-Reinigung und Immobilienbetreuung in Marokko. Erhalten Sie Launch-Updates und laden Sie Familie und Freunde ein.",
  },
  hero: {
    eyebrow: "Frühzugang · Marokko",
    title: "Ihr Zuhause in Marokko, immer bereit bei Ihrer Ankunft.",
    body: "Sichern Sie sich den Dar Tahara Frühzugang für Premium-Reinigung und Immobilienbetreuung in Marokko. Registrieren Sie Ihre Immobilie, erhalten Sie Launch-Updates und laden Sie Familie und Freunde ein.",
    ctaPrimary: "Frühzugang anfragen",
    ctaSecondary: "So funktioniert's",
    benefitsTitle: "Woran Dar Tahara arbeitet",
    benefits: [
      "Zuverlässige, transparente Betreuung Ihres Zuhauses – für mehr Sicherheit und Gelassenheit.",
      "Einheitliche Servicestandards, unterstützt durch strukturierte Schulung und intelligente Technologie.",
      "Verantwortungsvolles Wachstum mit dem Ziel, sicherere und professionellere Chancen für unsere Teams zu schaffen.",
    ],
    missionLink: "Unsere Mission und Vision entdecken",
    notBooking: "Die Registrierung ist eine Frühzugangs-Anfrage, keine bestätigte Buchung. Wir melden uns, sobald der Service in Ihrer Region verfügbar ist.",
    reassure: "Dauert etwa 3 Minuten · Ihre Daten bleiben privat",
  },
  progress: { stepOf: "Schritt {n} von {total}", step: "Schritt" },
  nav: { back: "Zurück", next: "Weiter", submit: "Anfrage senden", submitting: "Senden…" },
  steps: {
    contact: { title: "Kontaktdaten", subtitle: "Wie wir Sie zu Ihrer Anfrage erreichen." },
    billing: { title: "Rechnungsadresse", subtitle: "Dies ist die Adresse für Ihr Kundenkonto, die Abrechnung und Rechnungen. Sie kann von der Immobilienadresse in Marokko abweichen." },
    property_address: { title: "Immobilienadresse in Marokko", subtitle: "Dies ist die physische Adresse, an der Dar Tahara Reinigungs- oder Betreuungsleistungen erbringt." },
    property_info: { title: "Immobilieninformationen", subtitle: "Einige Angaben, damit wir die richtige Betreuung planen können. Wir prüfen sie ggf. beim ersten Besuch." },
    services: { title: "Service-Präferenzen", subtitle: "Woran Sie interessiert sind. Dies ist kein bestätigter Termin." },
    access: { title: "Zugang zur Immobilie", subtitle: "Wie unser Team Zugang zur Immobilie erhält." },
    review: { title: "Prüfung und Einwilligung", subtitle: "Bitte prüfen Sie Ihre Angaben und bestätigen Sie." },
  },
  fields: {
    firstName: "Vorname", lastName: "Nachname", email: "E-Mail-Adresse",
    countryCallingCode: "Ländervorwahl", mobileNumber: "Mobilnummer",
    whatsappSameAsMobile: "Meine WhatsApp-Nummer ist dieselbe wie meine Mobilnummer", whatsappNumber: "WhatsApp-Nummer",
    preferredContactMethod: "Bevorzugte Kontaktmethode", preferredLanguage: "Bevorzugte Sprache",
    residenceCity: "Stadt in Marokko", billingRecipientType: "Dieses Konto ist für",
    companyName: "Firmenname", billingFirstName: "Vorname (Rechnung)", billingLastName: "Nachname (Rechnung)",
    billingAddressLine1: "Adresszeile 1", billingAddressLine2: "Adresszeile 2",
    billingBuildingNumber: "Gebäude-, Wohnungs- oder Einheitsnummer", billingUnit: "Wohnung / Einheit",
    addressSearch: "Adresse", mapsHelp: "Wie erhalte ich einen Google-Maps-Link?", openInGoogleMaps: "In Google Maps öffnen",
    billingPostalCode: "Postleitzahl", billingCity: "Stadt", billingRegion: "Bundesland / Provinz / Region",
    billingCountry: "Land", taxId: "USt-IdNr. (optional)", invoiceEmail: "Rechnungs-E-Mail",
    invoiceEmailSameAsContact: "Wie meine Kontakt-E-Mail",
    propertyName: "Name oder Spitzname der Immobilie", propertyAddressLine1: "Adresszeile 1", propertyAddressLine2: "Adresszeile 2",
    residenceName: "Name der Residenz oder des Gebäudes", propertyBuildingNumber: "Gebäude-, Wohnungs-, Einheits- oder Villanummer",
    propertyUnitNumber: "Wohnungs-, Einheits- oder Villennummer", propertyFloor: "Etage", propertyPostalCode: "Postleitzahl",
    propertyCity: "Stadt", propertyRegion: "Provinz oder Region", neighbourhood: "Viertel oder Bezirk", googleMapsUrl: "Google-Maps-Link", entryNotes: "Zugangshinweise zur Immobilie",
    authorizedBySubmitter: "Ich bestätige, dass ich berechtigt bin, für diese Immobilie Leistungen anzufragen",
    propertyType: "Immobilientyp", sizeM2: "Ungefähre Größe (m²)", bedrooms: "Schlafzimmer", bathrooms: "Badezimmer",
    kitchens: "Küchen", livingRooms: "Wohnzimmer", numberOfFloors: "Anzahl der Etagen", propertyFloorInfo: "Etage der Immobilie",
    elevatorStatus: "Aufzug vorhanden", outdoorArea: "Außenbereich", occupancyType: "Nutzung",
    propertyCondition: "Aktueller Zustand", furnishingStatus: "Möblierung", petsPresent: "Haustiere vorhanden",
    smokingStatus: "Rauchen im Innenbereich", serviceTypes: "Leistungen, die Sie interessieren", desiredFrequency: "Gewünschte Häufigkeit",
    expectedStartPeriod: "Voraussichtlicher Beginn", preferredStartDate: "Bevorzugtes Startdatum (optional)",
    serviceNotes: "Sonstiges zur Leistung (optional)", accessMethod: "Wie würden wir Zugang zur Immobilie erhalten?",
    thirdPartyDetails: "Details zur Zugangsregelung", accessNotes: "Zugangshinweise (optional)",
  },
  hints: {
    entryNotes: "Torcodes, welche Tür, Parken: alles, was unserem Team hilft.",
    sizeM2: "Eine grobe Schätzung genügt.",
    googleMapsUrl: "Wird automatisch anhand des obigen Pins ausgefüllt. Passen Sie den Pin an, um es zu aktualisieren, oder fügen Sie Ihren eigenen Link ein.",
    notBookingServices: "Das hilft uns bei der Planung. Es ist kein bestätigter Termin.",
  },
  options: {
    contactMethod: { email: "E-Mail", whatsapp: "WhatsApp", telephone: "Telefon" },
    recipientType: { private: "Eine Privatperson", business: "Ein Unternehmen" },
    propertyType: { apartment: "Wohnung", house: "Haus", villa: "Villa", holiday_home: "Ferienhaus", short_term_rental: "Airbnb / Kurzzeitvermietung", riad: "Riad", office: "Büro", other: "Sonstiges" },
    outdoor: { none: "Keiner", balcony: "Balkon", terrace: "Terrasse", garden: "Garten", courtyard: "Innenhof", multiple: "Mehrere" },
    occupancy: { primary_residence: "Hauptwohnsitz", secondary_residence: "Zweitwohnsitz", holiday_home: "Ferienhaus", short_term_rental: "Kurzzeitvermietung", long_term_rental: "Langzeitvermietung", empty: "Leerstehende Immobilie" },
    condition: { maintained: "Regelmäßig gepflegt", standard: "Standardreinigung nötig", empty_a_while: "Seit einer Weile leer", deep_clean: "Grundreinigung könnte nötig sein", renovation_dust: "Renovierungs- oder Baustaub", unsure: "Unsicher" },
    furnishing: { fully_furnished: "Voll möbliert", partially_furnished: "Teilweise möbliert", unfurnished: "Unmöbliert" },
    tristate: { yes: "Ja", no: "Nein", unknown: "Unsicher" },
    service: { standard_cleaning: "Standardreinigung", deep_cleaning: "Grundreinigung", rental_cleaning: "Reinigung von Mietobjekten", property_care: "Immobilienbetreuung", other: "Sonstiges" },
    frequency: { one_time: "Einmalig", weekly: "Wöchentlich", biweekly: "Alle zwei Wochen", monthly: "Monatlich", before_arrival: "Vor Ankunft", after_departure: "Nach Abreise", on_demand: "Auf Anfrage", not_sure: "Unsicher" },
    startPeriod: { asap: "Sobald verfügbar", within_1_month: "Innerhalb eines Monats", within_3_months: "Innerhalb von drei Monaten", within_6_months: "Innerhalb von sechs Monaten", later: "Später", no_fixed_date: "Kein festes Datum" },
    access: { digital_lock: "Digitales Smart-Schloss", physical_key: "Physischer Schlüssel", person_present: "Kunde oder Angehöriger anwesend", concierge: "Concierge oder Rezeption", lockbox: "Schlüsseltresor", property_manager: "Immobilienverwalter", other: "Sonstiges" },
  },
  keyNotice: {
    title: "Zu physischen Schlüsseln",
    body: "Für die Handhabung eines physischen Schlüssels kann eine Gebühr anfallen. Sie deckt Verwaltung, sichere Aufbewahrung und zusätzliche Versicherungsanforderungen ab. Dar Tahara trifft angemessene Sicherheitsvorkehrungen; die Aufbewahrung eines physischen Schlüssels macht Dar Tahara allein nicht für jeden möglichen Diebstahl, Verlust oder unbefugten Zutritt verantwortlich. Die endgültigen Verantwortlichkeiten richten sich nach dem Vertrag und dem geltenden Recht.",
    ack: "Ich verstehe, dass die Handhabung eines physischen Schlüssels eine zusätzliche Gebühr und gesonderte Bedingungen umfassen kann.",
  },
  thirdPartyNotice: "Wir können eine wiederkehrende Reinigung nicht zuverlässig um jemanden herum planen, der jedes Mal anreisen muss, um die Immobilie zu öffnen. Eine zuverlässige Zugangsregelung ist erforderlich.",
  digitalLockNotice: "Ein zuverlässiger digitaler Zugang wird bevorzugt, wo verfügbar: er verbessert Planung und Zugangskontrolle.",
  digitalLockInternetNotice: {
    title: "Internetverbindung erforderlich",
    body: "Eine stabile Internetverbindung in der Immobilie ist zwingend erforderlich, damit das digitale Smart Lock funktioniert.",
    ack: "Ich verstehe, dass eine stabile Internetverbindung in der Immobilie für das digitale Smart Lock zwingend erforderlich ist und dass Dar Tahara nicht für einen ausgefallenen Besuch aufgrund eines Internetausfalls in der Immobilie verantwortlich ist.",
  },
  phoneCountry: {
    label: "Ländervorwahl",
    searchPlaceholder: "Land oder Vorwahl suchen",
    noResults: "Kein passendes Land",
  },
  maps: {
    searchPlaceholder: "Adresse der Immobilie suchen",
    searching: "Suche…",
    noResults: "Keine Treffer. Sie können die Adresse manuell eingeben.",
    manualLink: "Adresse manuell eingeben",
    unavailable: "Die Adresssuche ist nicht verfügbar: bitte Adresse eintippen",
    pinTitle: "Setzen Sie die Markierung an den richtigen Eingang",
    pinHelp: "Verschieben Sie die Markierung zu dem Eingang, den unser Reinigungsteam nutzen soll.",
    useMyLocation: "Meinen aktuellen Standort verwenden",
    locating: "Standort wird ermittelt…",
    locationDenied: "Wir konnten Ihren Standort nicht ermitteln. Sie können weiterhin suchen oder die Markierung verschieben.",
    mapUnavailable: "Die Karte ist derzeit nicht verfügbar. Sie können die Adresse manuell eingeben und fortfahren.",
    adjusted: "Markierungsposition von Ihnen bestätigt",
  },
  citySelector: {
    searchPlaceholder: "Suchen Sie Ihre Stadt",
    notListed: "Meine Stadt ist nicht aufgeführt",
    manualLabel: "Ihre Stadt",
    manualPlaceholder: "Geben Sie Ihre Stadt ein",
    status: {
      planned: "Bald in diesem Gebiet verfügbar",
      waiting_list: "Warteliste: wir informieren Sie, sobald wir hier starten",
      unsupported: "Noch nicht in unserem Servicegebiet: Sie können sich dennoch für den Early Access anmelden",
    },
  },
  smartLock: {
    eyebrow: "Zugang zur Immobilie",
    heading: "Machen Sie den Zugang zu Ihrer Immobilie einfacher",
    intro: "Ein kompatibles digitales Smart Lock kann unser Team für die geplante Reinigung einlassen, ohne dass Sie zu Hause sein müssen und ohne dass wir einen physischen Schlüssel aufbewahren oder transportieren.",
    priceTag: "{price} inklusive Installation",
    options: {
      purchase_interested: { title: "Ja, ich interessiere mich für ein Smart Lock", note: "{price} inklusive Installation" },
      already_has_lock: { title: "Ich habe bereits ein kompatibles Smart Lock", note: "Nennen Sie uns die Marke, damit wir es prüfen können." },
      not_interested: { title: "Nein, zurzeit nicht", note: "Sie können später jederzeit eines hinzufügen." },
    },
    brandLabel: "Marke des Schlosses",
    brandPlaceholder: "z. B. TTLock, Nuki, Yale",
    modelLabel: "Modell des Schlosses (falls bekannt)",
    modelPlaceholder: "Optional",
    ttlockNotice: "Dar Tahara unterstützt derzeit kompatible TTLock-Schlösser. Wir prüfen Ihr Schloss, bevor wir den Zugang zur Immobilie aktivieren.",
    keyComparison: "Ein Smart Lock kann den Bedarf reduzieren, bei geplanten Besuchen einen physischen Schlüssel aufzubewahren und zu handhaben.",
    reviewLabel: "Digitales Smart Lock",
    reviewSubjectTo: "Vorbehaltlich der Bestätigung der Kompatibilität von Immobilie und Tür. Die Bestellung wird erst bestätigt, nachdem wir Kompatibilität und Installationsanforderungen geprüft haben.",
    confirm: {
      interested: "Wir haben Ihr Interesse an einem digitalen Smart Lock für {price} inklusive Installation registriert. Wir bestätigen Kompatibilität und Installationsdetails, bevor eine Bestellung endgültig wird.",
      alreadyHas: "Wir prüfen, ob Ihr vorhandenes Smart Lock mit dem Zugangssystem von Dar Tahara kompatibel ist.",
    },
  },
  consent: {
    heading: "Bestätigen und einwilligen",
    accurate: "Ich bestätige, dass die Angaben korrekt sind.",
    authorized: "Ich bestätige, dass ich berechtigt bin, für diese Immobilie Leistungen anzufragen.",
    privacy: "Ich akzeptiere die Datenschutzrichtlinie.",
    operational: "Ich stimme zu, operative Mitteilungen zu meiner Frühzugangs-Anfrage zu erhalten.",
    reminder: "Senden Sie mir höchstens zwei Erinnerungen, falls ich diese Anfrage nicht abschließe.",
    reminderHint: "Optional und nur für diese unvollständige Anfrage. Dies ist keine Newsletter-Einwilligung.",
    marketing: "Ich möchte News, Angebote und Marketing-Updates von Dar Tahara erhalten.",
    marketingHint: "Optional: getrennt von den Nachrichten zu Ihrer Anfrage. Sie können sich jederzeit abmelden.",
  },
  errors: {
    required: "Dieses Feld ist erforderlich.", invalid: "Bitte prüfen Sie diesen Wert.",
    invalid_email: "Bitte geben Sie eine gültige E-Mail-Adresse ein.", invalid_url: "Bitte geben Sie einen gültigen Link ein (beginnend mit http).",
    phone_required: "Fügen Sie eine Telefon- oder WhatsApp-Nummer hinzu oder wählen Sie E-Mail als Kontaktmethode.",
    authorization_required: "Bitte bestätigen Sie, dass Sie berechtigt sind, für diese Immobilie Leistungen anzufragen.",
    acknowledgement_required: "Bitte bestätigen Sie die Bedingungen für physische Schlüssel, um fortzufahren.",
    internet_acknowledgement_required: "Bitte bestätigen Sie, dass Sie die Anforderung an die Internetverbindung verstehen, um fortzufahren.",
    smart_lock_choice_required: "Bitte wählen Sie eine Smart-Lock-Option, um fortzufahren.",
    select_one: "Bitte wählen Sie mindestens eine Leistung.", validation_failed: "Bitte überprüfen Sie die markierten Felder.",
    captcha_failed: "Wir konnten nicht bestätigen, dass Sie ein Mensch sind. Bitte versuchen Sie es erneut.",
    rate_limited: "Zu viele Versuche. Bitte warten Sie einen Moment und versuchen Sie es erneut.",
    server_error: "Auf unserer Seite ist etwas schiefgelaufen. Ihre Daten sind nicht verloren: bitte versuchen Sie es gleich erneut.",
    network: "Netzwerkproblem. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
  },
  success: {
    verifiedTitle: "Ihre E-Mail ist bestätigt 🎉",
    verifiedBody: "Sie stehen auf der Dar Tahara Frühzugangs-Liste. Wir melden uns, sobald der Service für Ihre Immobilie verfügbar ist. Dies ist keine bestätigte Buchung: es ist Ihr Platz in der Warteschlange.",
    alreadyTitle: "Sie sind bereits bestätigt",
    pendingTitle: "Fast geschafft: prüfen Sie Ihren Posteingang",
    pendingBody: "Wir haben einen Bestätigungslink an Ihre E-Mail gesendet. Klicken Sie darauf, um Ihren Platz zu sichern. Falls er nicht innerhalb weniger Minuten ankommt, prüfen Sie den Spam-Ordner oder senden Sie ihn unten erneut.",
    expiredTitle: "Dieser Link ist abgelaufen",
    expiredBody: "Zu Ihrer Sicherheit laufen Bestätigungslinks nach 48 Stunden ab. Geben Sie Ihre E-Mail ein, um einen neuen zu erhalten.",
    invalidTitle: "Dieser Link ist ungültig",
    invalidBody: "Der Link wurde möglicherweise bereits verwendet. Geben Sie Ihre E-Mail ein und wir senden eine neue Bestätigung.",
    resend: "Bestätigungs-E-Mail erneut senden",
    resent: "Wenn diese E-Mail auf unserer Liste steht, ist eine neue Bestätigung unterwegs.",
    shareTitle: "Laden Sie Familie und Freunde ein",
    shareBody: "Teilen Sie Ihren persönlichen Einladungslink. Er hilft uns, Dar Tahara schneller in Ihre Stadt zu bringen.",
    copy: "Link kopieren", copied: "Kopiert!", whatsapp: "Über WhatsApp teilen",
    shareMessage: "Ich bin der Dar Tahara Frühzugangs-Liste für Premium-Reinigung und Immobilienbetreuung in Marokko beigetreten. Sie können sich über meine persönliche Einladung registrieren: {link}",
    home: "Zurück zu Dar Tahara",
  },
  submitted: {
    title: "Anfrage erhalten",
    body: "Danke. Ihre Frühzugangs-Anfrage wurde gespeichert.",
    checkInbox: "Bitte prüfen Sie Ihren Posteingang, um Ihre E-Mail zu bestätigen und Ihren Platz zu sichern.",
  },
};

const pt: EarlyAccessCopy = {
  meta: {
    title: "Solicite acesso antecipado: Dar Tahara cuidado do lar em Marrocos",
    description: "Registe o seu imóvel para o acesso antecipado da Dar Tahara: limpeza premium e cuidado de imóveis em Marrocos. Receba novidades do lançamento e convide familiares e amigos.",
  },
  hero: {
    eyebrow: "Acesso antecipado · Marrocos",
    title: "A sua casa em Marrocos, sempre pronta quando chega.",
    body: "Junte-se ao acesso antecipado da Dar Tahara para limpeza premium e cuidado de imóveis em Marrocos. Registe o seu imóvel, receba novidades do lançamento e convide familiares e amigos.",
    ctaPrimary: "Solicitar acesso antecipado",
    ctaSecondary: "Como funciona",
    benefitsTitle: "O que a Dar Tahara está a construir",
    benefits: [
      "Um cuidado do lar fiável e transparente, pensado para a sua tranquilidade.",
      "Padrões de serviço consistentes, apoiados por formação estruturada e tecnologia inteligente.",
      "Um crescimento responsável que procura criar oportunidades mais seguras e profissionais para as nossas equipas.",
    ],
    missionLink: "Conhecer a nossa missão e visão",
    notBooking: "O registo é um pedido de acesso antecipado, não uma reserva confirmada. Entraremos em contacto quando o serviço estiver disponível na sua região.",
    reassure: "Demora cerca de 3 minutos · Os seus dados permanecem privados",
  },
  progress: { stepOf: "Passo {n} de {total}", step: "Passo" },
  nav: { back: "Voltar", next: "Continuar", submit: "Enviar pedido", submitting: "A enviar…" },
  steps: {
    contact: { title: "Informações de contacto", subtitle: "Como o contactamos sobre o seu pedido." },
    billing: { title: "Endereço de faturação", subtitle: "É o endereço para a sua conta de cliente, faturação e faturas. Pode ser diferente do endereço do imóvel em Marrocos." },
    property_address: { title: "Endereço do imóvel em Marrocos", subtitle: "É o endereço físico onde a Dar Tahara prestará serviços de limpeza ou cuidado do imóvel." },
    property_info: { title: "Informações do imóvel", subtitle: "Alguns detalhes para planearmos o serviço certo. Podemos verificá-los na primeira visita." },
    services: { title: "Preferências de serviço", subtitle: "O que lhe interessa. Não é uma marcação confirmada." },
    access: { title: "Acesso ao imóvel", subtitle: "Como a nossa equipa acederia ao imóvel." },
    review: { title: "Revisão e consentimento", subtitle: "Verifique os seus dados e confirme." },
  },
  fields: {
    firstName: "Nome próprio", lastName: "Apelido", email: "Endereço de e-mail",
    countryCallingCode: "Indicativo do país", mobileNumber: "Número de telemóvel",
    whatsappSameAsMobile: "O meu número de WhatsApp é o mesmo do telemóvel", whatsappNumber: "Número de WhatsApp",
    preferredContactMethod: "Método de contacto preferido", preferredLanguage: "Idioma preferido",
    residenceCity: "Cidade em Marrocos", billingRecipientType: "Esta conta é para",
    companyName: "Nome da empresa", billingFirstName: "Nome (faturação)", billingLastName: "Apelido (faturação)",
    billingAddressLine1: "Morada linha 1", billingAddressLine2: "Morada linha 2",
    billingBuildingNumber: "Número do edifício, apartamento ou unidade", billingUnit: "Apartamento / unidade",
    addressSearch: "Morada", mapsHelp: "Como obtenho uma ligação do Google Maps?", openInGoogleMaps: "Abrir no Google Maps",
    billingPostalCode: "Código postal", billingCity: "Cidade", billingRegion: "Estado / província / região",
    billingCountry: "País", taxId: "Número de IVA (opcional)", invoiceEmail: "E-mail de faturação",
    invoiceEmailSameAsContact: "Igual ao meu e-mail de contacto",
    propertyName: "Nome ou alcunha do imóvel", propertyAddressLine1: "Morada linha 1", propertyAddressLine2: "Morada linha 2",
    residenceName: "Nome da residência ou edifício", propertyBuildingNumber: "Número do edifício, apartamento, unidade ou vivenda",
    propertyUnitNumber: "Número de apartamento, unidade ou villa", propertyFloor: "Andar", propertyPostalCode: "Código postal",
    propertyCity: "Cidade", propertyRegion: "Província ou região", neighbourhood: "Bairro ou zona", googleMapsUrl: "Ligação do Google Maps", entryNotes: "Notas de acesso ao imóvel",
    authorizedBySubmitter: "Confirmo que estou autorizado a solicitar serviços para este imóvel",
    propertyType: "Tipo de imóvel", sizeM2: "Área aproximada (m²)", bedrooms: "Quartos", bathrooms: "Casas de banho",
    kitchens: "Cozinhas", livingRooms: "Salas de estar", numberOfFloors: "Número de pisos", propertyFloorInfo: "Piso do imóvel",
    elevatorStatus: "Elevador disponível", outdoorArea: "Espaço exterior", occupancyType: "Ocupação",
    propertyCondition: "Estado atual", furnishingStatus: "Mobília", petsPresent: "Animais presentes",
    smokingStatus: "Fumar no interior", serviceTypes: "Serviços que lhe interessam", desiredFrequency: "Frequência desejada",
    expectedStartPeriod: "Início previsto", preferredStartDate: "Data de início preferida (opcional)",
    serviceNotes: "Mais alguma coisa sobre o serviço (opcional)", accessMethod: "Como acederíamos ao imóvel?",
    thirdPartyDetails: "Detalhes do acordo de acesso", accessNotes: "Notas de acesso (opcional)",
  },
  hints: {
    entryNotes: "Códigos de portão, que porta, estacionamento: tudo o que ajude a nossa equipa.",
    sizeM2: "Uma estimativa aproximada serve.",
    googleMapsUrl: "Preenchido automaticamente a partir do marcador acima. Ajuste o marcador para atualizar, ou cole a sua própria ligação.",
    notBookingServices: "Isto ajuda-nos a planear. Não é uma marcação confirmada.",
  },
  options: {
    contactMethod: { email: "E-mail", whatsapp: "WhatsApp", telephone: "Telefone" },
    recipientType: { private: "Um particular", business: "Uma empresa" },
    propertyType: { apartment: "Apartamento", house: "Casa", villa: "Villa", holiday_home: "Casa de férias", short_term_rental: "Airbnb / aluguer de curta duração", riad: "Riad", office: "Escritório", other: "Outro" },
    outdoor: { none: "Nenhum", balcony: "Varanda", terrace: "Terraço", garden: "Jardim", courtyard: "Pátio", multiple: "Vários" },
    occupancy: { primary_residence: "Residência principal", secondary_residence: "Residência secundária", holiday_home: "Casa de férias", short_term_rental: "Aluguer de curta duração", long_term_rental: "Aluguer de longa duração", empty: "Imóvel vazio" },
    condition: { maintained: "Mantido regularmente", standard: "Precisa de limpeza padrão", empty_a_while: "Vazio há algum tempo", deep_clean: "Pode precisar de limpeza profunda", renovation_dust: "Pó de renovação ou obra", unsure: "Não tenho a certeza" },
    furnishing: { fully_furnished: "Totalmente mobilado", partially_furnished: "Parcialmente mobilado", unfurnished: "Sem mobília" },
    tristate: { yes: "Sim", no: "Não", unknown: "Não tenho a certeza" },
    service: { standard_cleaning: "Limpeza padrão", deep_cleaning: "Limpeza profunda", rental_cleaning: "Limpeza de arrendamentos", property_care: "Cuidado do imóvel", other: "Outro" },
    frequency: { one_time: "Uma vez", weekly: "Semanal", biweekly: "A cada duas semanas", monthly: "Mensal", before_arrival: "Antes da chegada", after_departure: "Após a partida", on_demand: "A pedido", not_sure: "Não tenho a certeza" },
    startPeriod: { asap: "Assim que possível", within_1_month: "Dentro de um mês", within_3_months: "Dentro de três meses", within_6_months: "Dentro de seis meses", later: "Mais tarde", no_fixed_date: "Sem data fixa" },
    access: { digital_lock: "Fechadura inteligente", physical_key: "Chave física", person_present: "Cliente ou familiar presente", concierge: "Portaria ou receção", lockbox: "Cofre de chaves", property_manager: "Gestor do imóvel", other: "Outro" },
  },
  keyNotice: {
    title: "Sobre chaves físicas",
    body: "Pode aplicar-se uma taxa de gestão de chave física. Cobre administração, armazenamento seguro e requisitos de seguro adicionais. A Dar Tahara toma precauções de segurança razoáveis; o armazenamento de uma chave física não torna, por si só, a Dar Tahara responsável por qualquer roubo, perda ou acesso não autorizado. As responsabilidades finais regem-se pelo acordo e pela lei aplicável.",
    ack: "Compreendo que a gestão de uma chave física pode implicar uma taxa adicional e condições separadas.",
  },
  thirdPartyNotice: "Não conseguimos planear de forma fiável uma limpeza recorrente em torno de alguém que tenha de se deslocar para abrir o imóvel de cada vez. É necessário um acordo de acesso fiável.",
  digitalLockNotice: "Um acesso digital fiável é preferível quando disponível: melhora o planeamento e o controlo de acesso.",
  digitalLockInternetNotice: {
    title: "Ligação à internet obrigatória",
    body: "É obrigatória uma ligação à internet estável no imóvel para que a fechadura inteligente digital funcione.",
    ack: "Compreendo que é obrigatória uma ligação à internet estável no imóvel para que a fechadura inteligente digital funcione, e que a Dar Tahara não é responsável por uma visita não realizada devido a uma falha de internet no imóvel.",
  },
  phoneCountry: {
    label: "Indicativo do país",
    searchPlaceholder: "Procurar país ou indicativo",
    noResults: "Nenhum país corresponde",
  },
  maps: {
    searchPlaceholder: "Procurar a morada do imóvel",
    searching: "A procurar…",
    noResults: "Sem resultados. Pode introduzir a morada manualmente.",
    manualLink: "Introduzir a morada manualmente",
    unavailable: "A pesquisa de moradas não está disponível: escreva a morada",
    pinTitle: "Coloque o marcador na entrada correta do imóvel",
    pinHelp: "Mova o marcador para a entrada que a nossa equipa de limpeza deve usar.",
    useMyLocation: "Usar a minha localização atual",
    locating: "A localizar…",
    locationDenied: "Não conseguimos obter a sua localização. Pode continuar a pesquisar ou mover o marcador no mapa.",
    mapUnavailable: "O mapa está indisponível de momento. Pode introduzir a morada manualmente e continuar.",
    adjusted: "Posição do marcador confirmada por si",
  },
  citySelector: {
    searchPlaceholder: "Procure a sua cidade",
    notListed: "A minha cidade não está na lista",
    manualLabel: "A sua cidade",
    manualPlaceholder: "Escreva a sua cidade",
    status: {
      planned: "Em breve nesta zona",
      waiting_list: "Lista de espera: avisamos quando arrancarmos aqui",
      unsupported: "Ainda não está na nossa zona de serviço: pode aderir ao acesso antecipado à mesma",
    },
  },
  smartLock: {
    eyebrow: "Acesso ao imóvel",
    heading: "Facilite o acesso ao seu imóvel",
    intro: "Uma fechadura inteligente compatível pode permitir a entrada da nossa equipa para a limpeza agendada sem que precise de estar em casa, e sem que guardemos ou transportemos uma chave física.",
    priceTag: "{price} instalação incluída",
    options: {
      purchase_interested: { title: "Sim, tenho interesse numa fechadura inteligente", note: "{price} instalação incluída" },
      already_has_lock: { title: "Já tenho uma fechadura inteligente compatível", note: "Diga-nos a marca para a verificarmos." },
      not_interested: { title: "Não, não de momento", note: "Pode adicionar uma mais tarde." },
    },
    brandLabel: "Marca da fechadura",
    brandPlaceholder: "ex. TTLock, Nuki, Yale",
    modelLabel: "Modelo da fechadura (se souber)",
    modelPlaceholder: "Opcional",
    ttlockNotice: "A Dar Tahara suporta atualmente fechaduras compatíveis com TTLock. Verificaremos a sua fechadura antes de ativar o acesso ao imóvel.",
    keyComparison: "Uma fechadura inteligente pode reduzir a necessidade de guardar e gerir uma chave física durante as visitas agendadas.",
    reviewLabel: "Fechadura inteligente",
    reviewSubjectTo: "Sujeito à confirmação de compatibilidade do imóvel e da porta. O pedido só é confirmado após revisão da compatibilidade e dos requisitos de instalação.",
    confirm: {
      interested: "Registámos o seu interesse numa fechadura inteligente por {price} instalação incluída. Confirmaremos a compatibilidade e os detalhes de instalação antes de um pedido se tornar definitivo.",
      alreadyHas: "Analisaremos se a sua fechadura inteligente atual é compatível com o sistema de acesso da Dar Tahara.",
    },
  },
  consent: {
    heading: "Confirmar e consentir",
    accurate: "Confirmo que as informações estão corretas.",
    authorized: "Confirmo que estou autorizado a solicitar serviços para este imóvel.",
    privacy: "Aceito a política de privacidade.",
    operational: "Aceito receber comunicações operacionais sobre o meu pedido de acesso antecipado.",
    reminder: "Envie-me no máximo dois lembretes se eu não concluir este pedido.",
    reminderHint: "Opcional e apenas para este pedido incompleto. Não é consentimento para a newsletter.",
    marketing: "Desejo receber novidades, ofertas e atualizações de marketing da Dar Tahara.",
    marketingHint: "Opcional: separado das mensagens sobre o seu pedido. Pode cancelar a subscrição a qualquer momento.",
  },
  errors: {
    required: "Este campo é obrigatório.", invalid: "Verifique este valor.",
    invalid_email: "Introduza um e-mail válido.", invalid_url: "Introduza uma ligação válida (a começar por http).",
    phone_required: "Adicione um número de telefone ou WhatsApp, ou escolha o e-mail como método de contacto.",
    authorization_required: "Confirme que está autorizado a solicitar serviços para este imóvel.",
    acknowledgement_required: "Aceite as condições da chave física para continuar.",
    internet_acknowledgement_required: "Confirme que compreende o requisito de ligação à internet para continuar.",
    smart_lock_choice_required: "Escolha uma opção de fechadura inteligente para continuar.",
    select_one: "Selecione pelo menos um serviço.", validation_failed: "Reveja os campos assinalados.",
    captcha_failed: "Não conseguimos verificar que é humano. Tente novamente.",
    rate_limited: "Demasiadas tentativas. Aguarde um momento e tente novamente.",
    server_error: "Algo correu mal do nosso lado. Os seus dados não se perderam: tente novamente em breve.",
    network: "Problema de rede. Verifique a sua ligação e tente novamente.",
  },
  success: {
    verifiedTitle: "O seu e-mail está confirmado 🎉",
    verifiedBody: "Está na lista de acesso antecipado da Dar Tahara. Entraremos em contacto quando o serviço estiver disponível para o seu imóvel. Não é uma reserva confirmada: é o seu lugar na fila.",
    alreadyTitle: "Já está confirmado",
    pendingTitle: "Quase: verifique a sua caixa de entrada",
    pendingBody: "Enviámos uma ligação de confirmação para o seu e-mail. Clique nela para garantir o seu lugar. Se não chegar em alguns minutos, verifique o spam ou reenvie abaixo.",
    expiredTitle: "Esta ligação expirou",
    expiredBody: "Para sua segurança, as ligações de verificação expiram após 48 horas. Introduza o seu e-mail para obter uma nova.",
    invalidTitle: "Esta ligação não é válida",
    invalidBody: "A ligação pode já ter sido usada. Introduza o seu e-mail e enviaremos uma nova confirmação.",
    resend: "Reenviar e-mail de confirmação",
    resent: "Se esse e-mail estiver na nossa lista, uma nova confirmação está a caminho.",
    shareTitle: "Convide familiares e amigos",
    shareBody: "Partilhe a sua ligação de convite pessoal. Ajuda-nos a chegar mais cedo à sua cidade.",
    copy: "Copiar ligação", copied: "Copiado!", whatsapp: "Partilhar no WhatsApp",
    shareMessage: "Juntei-me à lista de acesso antecipado da Dar Tahara para limpeza premium e cuidado de imóveis em Marrocos. Pode registar-se através do meu convite pessoal: {link}",
    home: "Voltar à Dar Tahara",
  },
  submitted: {
    title: "Pedido recebido",
    body: "Obrigado. O seu pedido de acesso antecipado foi guardado.",
    checkInbox: "Verifique a sua caixa de entrada para confirmar o seu e-mail e garantir o seu lugar.",
  },
};

const COPY: Record<Locale, EarlyAccessCopy> = { en, fr, ar, nl, es, de, pt };

export function getEarlyAccessCopy(locale: Locale): EarlyAccessCopy {
  return COPY[locale] ?? en;
}

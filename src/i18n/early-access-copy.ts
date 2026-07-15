import { type Locale, locales } from "./config";

/**
 * Copy for the early-access page + 7-step form.
 *
 * English is complete. Other locales are PARTIAL overrides that are deep-merged
 * over English, so a missing translation always falls back to readable English
 * rather than a blank — the same strategy the main dictionaries use. French and
 * Arabic cover the headline-level strings (hero, step titles, buttons, consent)
 * to exercise multilingual + RTL end-to-end; the remaining field labels are a
 * fill-in-the-blanks task against this typed shape.
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
  consent: {
    heading: string;
    accurate: string;
    authorized: string;
    privacy: string;
    operational: string;
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
    title: "Request early access — Dar Tahara home care in Morocco",
    description:
      "Register your property for Dar Tahara early access: premium home cleaning and property care in Morocco. Get launch updates and invite friends and family.",
  },
  hero: {
    eyebrow: "Early access · Morocco",
    title: "Your home in Morocco, always ready when you arrive.",
    body: "Join Dar Tahara early access for premium home cleaning and property care in Morocco. Register your property, receive launch updates, and invite friends and family.",
    ctaPrimary: "Request early access",
    ctaSecondary: "How it works",
    notBooking:
      "Registering is an early-access request, not a confirmed booking. We'll contact you when service becomes available in your area.",
    reassure: "Takes about 3 minutes · Your details are kept private",
  },
  progress: { stepOf: "Step {n} of {total}", step: "Step" },
  nav: { back: "Back", next: "Continue", submit: "Submit request", submitting: "Submitting…" },
  steps: {
    contact: { title: "Contact information", subtitle: "How we reach you about your request." },
    billing: {
      title: "Billing address",
      subtitle:
        "This is the address we'll use for your customer account, billing and invoices. It may be different from the property address in Morocco.",
    },
    property_address: {
      title: "Property address in Morocco",
      subtitle: "This is the physical address where Dar Tahara will provide cleaning or property-care services.",
    },
    property_info: { title: "Property information", subtitle: "A few details so we can plan the right care. We may verify these on the first visit." },
    services: { title: "Service preferences", subtitle: "What you're interested in. This is not a confirmed appointment." },
    access: { title: "Property access", subtitle: "How our team would access the property." },
    review: { title: "Review & consent", subtitle: "Please check your details and confirm." },
  },
  fields: {
    firstName: "First name",
    lastName: "Last name",
    email: "Email address",
    countryCallingCode: "Country code",
    mobileNumber: "Mobile number",
    whatsappSameAsMobile: "My WhatsApp number is the same as my mobile",
    whatsappNumber: "WhatsApp number",
    preferredContactMethod: "Preferred contact method",
    preferredLanguage: "Preferred language",
    residenceCountry: "Country of residence",
    billingRecipientType: "This account is for",
    companyName: "Company name",
    billingFirstName: "Billing first name",
    billingLastName: "Billing last name",
    billingAddressLine1: "Address line 1",
    billingAddressLine2: "Address line 2",
    billingBuildingNumber: "House / building number",
    billingUnit: "Apartment / unit",
    billingPostalCode: "Postal code",
    billingCity: "City",
    billingRegion: "State / province / region",
    billingCountry: "Country",
    taxId: "Tax / VAT number (optional)",
    invoiceEmail: "Invoice email",
    invoiceEmailSameAsContact: "Same as my contact email",
    useBillingAsProperty: "Use billing address as property address",
    propertyName: "Property name or nickname",
    propertyAddressLine1: "Address line 1",
    propertyAddressLine2: "Address line 2",
    residenceName: "Residence or building name",
    propertyBuildingNumber: "Building number",
    propertyUnitNumber: "Apartment, unit or villa number",
    propertyFloor: "Floor",
    propertyPostalCode: "Postal code",
    propertyCity: "City",
    propertyRegion: "Province or region",
    neighbourhood: "Neighbourhood or district",
    landmark: "Nearby landmark",
    googleMapsUrl: "Google Maps link",
    entryNotes: "Property-entry notes",
    authorizedBySubmitter: "I confirm I am authorized to request services for this property",
    propertyType: "Property type",
    sizeM2: "Approximate size (m²)",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    kitchens: "Kitchens",
    livingRooms: "Living rooms",
    numberOfFloors: "Number of floors",
    propertyFloorInfo: "Property floor",
    elevatorStatus: "Elevator available",
    outdoorArea: "Outdoor area",
    occupancyType: "Occupancy",
    propertyCondition: "Current condition",
    furnishingStatus: "Furnishing",
    petsPresent: "Pets present",
    smokingStatus: "Indoor smoking",
    serviceTypes: "Services you're interested in",
    desiredFrequency: "Desired frequency",
    expectedStartPeriod: "Expected start",
    preferredStartDate: "Preferred start date (optional)",
    serviceNotes: "Anything else about the service (optional)",
    accessMethod: "How would we access the property?",
    thirdPartyDetails: "Access arrangement details",
    accessNotes: "Access notes (optional)",
  },
  hints: {
    entryNotes: "Gate codes, which door, parking — anything that helps our team.",
    sizeM2: "A rough estimate is fine.",
    googleMapsUrl: "Paste a Google Maps link to help us find it precisely.",
    notBookingServices: "This helps us plan. It is not a confirmed appointment.",
  },
  options: {
    contactMethod: { email: "Email", whatsapp: "WhatsApp", telephone: "Telephone" },
    recipientType: { private: "A private individual", business: "A business" },
    propertyType: {
      apartment: "Apartment", house: "House", villa: "Villa", holiday_home: "Holiday home",
      short_term_rental: "Airbnb / short-term rental", riad: "Riad", office: "Office", other: "Other",
    },
    outdoor: { none: "None", balcony: "Balcony", terrace: "Terrace", garden: "Garden", courtyard: "Courtyard", multiple: "Multiple" },
    occupancy: {
      primary_residence: "Primary residence", secondary_residence: "Secondary residence",
      holiday_home: "Holiday home", short_term_rental: "Short-term rental",
      long_term_rental: "Long-term rental", empty: "Empty property",
    },
    condition: {
      maintained: "Regularly maintained", standard: "Standard cleaning needed",
      empty_a_while: "Empty for some time", deep_clean: "Deep cleaning may be required",
      renovation_dust: "Renovation or construction dust", unsure: "Unsure",
    },
    furnishing: { fully_furnished: "Fully furnished", partially_furnished: "Partially furnished", unfurnished: "Unfurnished" },
    tristate: { yes: "Yes", no: "No", unknown: "Not sure" },
    service: {
      standard_cleaning: "Standard cleaning", deep_cleaning: "Deep cleaning", recurring_cleaning: "Recurring home cleaning",
      holiday_home_prep: "Holiday-home preparation", arrival_prep: "Arrival preparation", departure_cleaning: "Departure cleaning",
      airbnb_turnover: "Airbnb turnover cleaning", move_in: "Move-in cleaning", move_out: "Move-out cleaning",
      property_inspection: "Property inspection", laundry: "Laundry", linen_change: "Linen change",
      window_cleaning: "Window cleaning", fridge_cleaning: "Refrigerator cleaning", oven_cleaning: "Oven cleaning",
      balcony_terrace: "Balcony or terrace cleaning", property_care: "Property-care support", other: "Other",
    },
    frequency: {
      one_time: "One time", weekly: "Weekly", biweekly: "Every two weeks", monthly: "Monthly",
      before_arrival: "Before arrival", after_departure: "After departure", on_demand: "On demand", not_sure: "Not sure",
    },
    startPeriod: {
      asap: "As soon as available", within_1_month: "Within one month", within_3_months: "Within three months",
      within_6_months: "Within six months", later: "Later", no_fixed_date: "No fixed date",
    },
    access: {
      digital_lock: "Digital smart lock", physical_key: "Physical key", person_present: "Customer or family member present",
      concierge: "Concierge or reception", lockbox: "Key safe or lockbox", property_manager: "Property manager", other: "Other",
    },
  },
  keyNotice: {
    title: "About physical keys",
    body: "A physical-key handling fee may apply. It covers administration, secure storage and additional insurance requirements. Dar Tahara takes reasonable security precautions; physical-key storage does not by itself make Dar Tahara responsible for every possible theft, loss or unauthorized entry. Final responsibilities are governed by the agreement and applicable law.",
    ack: "I understand that physical-key handling may involve an additional fee and separate key-handling conditions.",
  },
  thirdPartyNotice:
    "We can't reliably plan recurring cleaning around someone who must travel to open the property each time. A dependable access arrangement is required.",
  digitalLockNotice:
    "Reliable digital access is preferred where available — it improves planning and access control.",
  consent: {
    heading: "Confirm & consent",
    accurate: "I confirm that the information is accurate.",
    authorized: "I confirm that I am authorized to request services for this property.",
    privacy: "I accept the privacy policy.",
    operational: "I agree to receive operational communication about my early-access request.",
    marketing: "I would like to receive Dar Tahara news, offers, and marketing updates.",
    marketingHint: "Optional — separate from the messages about your request. You can unsubscribe any time.",
  },
  errors: {
    required: "This field is required.",
    invalid: "Please check this value.",
    invalid_email: "Please enter a valid email address.",
    invalid_url: "Please enter a valid link (starting with http).",
    phone_required: "Please add a phone or WhatsApp number, or choose email as your contact method.",
    authorization_required: "Please confirm you're authorized to request services for this property.",
    acknowledgement_required: "Please acknowledge the physical-key conditions to continue.",
    select_one: "Please select at least one service.",
    validation_failed: "Please review the highlighted fields.",
    captcha_failed: "We couldn't verify you're human. Please try again.",
    rate_limited: "Too many attempts. Please wait a moment and try again.",
    server_error: "Something went wrong on our side. Your details weren't lost — please try again shortly.",
    network: "Network problem. Please check your connection and try again.",
  },
  success: {
    verifiedTitle: "Your email is confirmed 🎉",
    verifiedBody: "You're on the Dar Tahara early-access list. We'll contact you when service becomes available for your property. This is not a confirmed booking — it's your place in line.",
    alreadyTitle: "You're already confirmed",
    pendingTitle: "Almost there — check your inbox",
    pendingBody: "We've sent a confirmation link to your email. Please click it to secure your place. If it hasn't arrived in a few minutes, check spam or resend below.",
    expiredTitle: "This link has expired",
    expiredBody: "For your security, verification links expire after 48 hours. Enter your email to get a fresh one.",
    invalidTitle: "This link isn't valid",
    invalidBody: "The link may have already been used. Enter your email and we'll send a new confirmation.",
    resend: "Resend confirmation email",
    resent: "If that email is on our list, a new confirmation is on its way.",
    shareTitle: "Invite friends and family",
    shareBody: "Share your personal invitation link. It helps us bring Dar Tahara to your city sooner.",
    copy: "Copy link",
    copied: "Copied!",
    whatsapp: "Share on WhatsApp",
    shareMessage:
      "I've joined the Dar Tahara early-access list for premium home cleaning and property care in Morocco. You can register through my personal invitation: {link}",
    home: "Back to Dar Tahara",
  },
  submitted: {
    title: "Request received",
    body: "Thank you. Your early-access request has been saved.",
    checkInbox: "Please check your inbox to confirm your email and secure your place.",
  },
};

// French — headline-level overrides; the rest falls back to English.
const fr: DeepPartial<EarlyAccessCopy> = {
  meta: { title: "Demander un accès anticipé — Dar Tahara au Maroc" },
  hero: {
    eyebrow: "Accès anticipé · Maroc",
    title: "Votre maison au Maroc, toujours prête à votre arrivée.",
    body: "Rejoignez l'accès anticipé Dar Tahara pour le ménage premium et l'entretien de propriété au Maroc. Enregistrez votre bien, recevez les actualités du lancement et invitez vos proches.",
    ctaPrimary: "Demander un accès anticipé",
    ctaSecondary: "Comment ça marche",
    notBooking: "L'inscription est une demande d'accès anticipé, pas une réservation confirmée. Nous vous contacterons dès que le service sera disponible dans votre région.",
    reassure: "Environ 3 minutes · Vos informations restent confidentielles",
  },
  nav: { back: "Retour", next: "Continuer", submit: "Envoyer la demande", submitting: "Envoi…" },
  consent: {
    heading: "Confirmation & consentement",
    accurate: "Je confirme que les informations sont exactes.",
    authorized: "Je confirme être autorisé à demander des services pour ce bien.",
    privacy: "J'accepte la politique de confidentialité.",
    operational: "J'accepte de recevoir des communications opérationnelles concernant ma demande.",
    marketing: "Je souhaite recevoir les actualités, offres et nouveautés de Dar Tahara.",
    marketingHint: "Facultatif — distinct des messages sur votre demande. Désinscription à tout moment.",
  },
};

// Arabic — headline-level overrides (renders RTL via the page's dir).
const ar: DeepPartial<EarlyAccessCopy> = {
  meta: { title: "اطلب الوصول المبكر — دار طهارة في المغرب" },
  hero: {
    eyebrow: "وصول مبكر · المغرب",
    title: "منزلك في المغرب، جاهز دائمًا عند وصولك.",
    body: "انضم إلى الوصول المبكر من دار طهارة للحصول على تنظيف منزلي راقٍ والعناية بالعقار في المغرب. سجّل عقارك، واستقبل مستجدات الإطلاق، وادعُ العائلة والأصدقاء.",
    ctaPrimary: "اطلب الوصول المبكر",
    ctaSecondary: "كيف يعمل",
    notBooking: "التسجيل هو طلب وصول مبكر وليس حجزًا مؤكدًا. سنتواصل معك عند توفّر الخدمة في منطقتك.",
    reassure: "نحو 3 دقائق · تبقى بياناتك خاصة",
  },
  nav: { back: "رجوع", next: "متابعة", submit: "إرسال الطلب", submitting: "جارٍ الإرسال…" },
  consent: {
    heading: "التأكيد والموافقة",
    accurate: "أؤكد أن المعلومات دقيقة.",
    authorized: "أؤكد أنني مخوّل لطلب الخدمات لهذا العقار.",
    privacy: "أوافق على سياسة الخصوصية.",
    operational: "أوافق على تلقّي رسائل تشغيلية بخصوص طلبي.",
    marketing: "أرغب في تلقّي أخبار وعروض ومستجدات دار طهارة.",
    marketingHint: "اختياري — منفصل عن رسائل طلبك. يمكنك إلغاء الاشتراك في أي وقت.",
  },
};

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

const overrides: Partial<Record<Locale, DeepPartial<EarlyAccessCopy>>> = { fr, ar };

function merge<T>(base: T, ov: unknown): T {
  if (ov === undefined || ov === null) return base;
  if (typeof base !== "object" || base === null || Array.isArray(base)) return (ov as T) ?? base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  const o = ov as Record<string, unknown>;
  for (const k of Object.keys(out)) {
    if (k in o) out[k] = merge(out[k], o[k]);
  }
  return out as T;
}

const cache = new Map<Locale, EarlyAccessCopy>();

export function getEarlyAccessCopy(locale: Locale): EarlyAccessCopy {
  const hit = cache.get(locale);
  if (hit) return hit;
  const copy = overrides[locale] ? merge(en, overrides[locale]) : en;
  cache.set(locale, copy);
  return copy;
}

/** Exposed so the build can assert every locale resolves. */
export const earlyAccessCopyLocales = locales;

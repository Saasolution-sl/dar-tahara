export const servicePageSlugs = [
  "premium-cleaning",
  "recurring-cleaning",
  "move-in-move-out",
  "property-inspections",
  "maintenance-checks",
  "key-holding",
] as const;

export type ServicePageSlug = (typeof servicePageSlugs)[number];

export type ServicePage = {
  slug: ServicePageSlug;
  eyebrow: string;
  title: string;
  summary: string;
  intro: string;
  sections: Array<{ title: string; body: string }>;
  highlights: string[];
};

export const servicePages: Record<ServicePageSlug, ServicePage> = {
  "premium-cleaning": {
    slug: "premium-cleaning",
    eyebrow: "Premium Cleaning",
    title: "A higher standard of home care, delivered by people who take pride in the details.",
    summary:
      "Premium cleaning at Dar Tahara means trained, carefully selected personnel who are expected to go beyond a surface-level clean and care for the home with discretion, initiative and consistency.",
    intro:
      "Dar Tahara is built for customers who want more than a cleaner arriving for a checklist. Our premium cleaning service focuses on trust, presentation, detail and the small acts of care that make a home feel properly looked after.",
    sections: [
      {
        title: "Carefully selected personnel",
        body:
          "We place strong emphasis on the quality of the people entering your home. Team members are selected for professionalism, reliability, discretion and the willingness to go above and beyond for the customer.",
      },
      {
        title: "More than visible surfaces",
        body:
          "The service covers the visible standard of cleanliness as well as the details that shape the feeling of the home: presentation, freshness, order, careful handling of surfaces and attention to recurring problem areas.",
      },
      {
        title: "A premium guest-ready finish",
        body:
          "For homes that receive family, guests or short-stay visitors, the goal is a calm, polished and ready-to-enjoy environment rather than a rushed basic clean.",
      },
    ],
    highlights: [
      "Professional Dar Tahara home care personnel",
      "Detail-focused cleaning and presentation",
      "Suitable for private homes, holiday homes and premium rentals",
      "Care standards refined after the Initial Home Assessment",
    ],
  },
  "recurring-cleaning": {
    slug: "recurring-cleaning",
    eyebrow: "Recurring Cleaning",
    title: "Consistent upkeep for homes that need regular attention.",
    summary:
      "Recurring cleaning keeps the home maintained over time, especially in coastal areas where salty air, humidity and mould risks can require closer attention.",
    intro:
      "Some homes need more than an occasional refresh. Properties near the coast, humid areas or homes left closed between visits can develop issues such as mould, dust build-up and salt-air residue. Recurring cleaning gives the home a reliable rhythm of care.",
    sections: [
      {
        title: "Built for the Moroccan climate",
        body:
          "Homes near the coast may need extra attention because salty air and humidity can affect surfaces, windows, bathrooms, wardrobes and ventilation. The recurring plan helps spot and manage these issues before they become larger problems.",
      },
      {
        title: "A home that stays ready",
        body:
          "Regular visits maintain freshness, order and hygiene, so the property does not slide backwards between stays or busy periods.",
      },
      {
        title: "Adjusted after assessment",
        body:
          "The Initial Home Assessment helps determine the right frequency and focus areas. If the property materially differs from the supplied details, Dar Tahara may recommend a revised plan.",
      },
    ],
    highlights: [
      "Monthly, bi-weekly, weekly or tailored recurring care",
      "Attention to humidity, mould-prone and salt-air affected areas",
      "Useful for coastal, holiday and frequently used homes",
      "Supports ongoing home condition monitoring",
    ],
  },
  "move-in-move-out": {
    slug: "move-in-move-out",
    eyebrow: "Move In / Move Out",
    title: "A clean, calm handover for arrivals, departures and guest turnover.",
    summary:
      "Move In / Move Out service is especially useful for Airbnb and rental properties, but also for vacation-home owners preparing the home before arrival or after departure.",
    intro:
      "Whether a guest has just left, a new guest is arriving, or you are preparing your own vacation home, the handover moment matters. Dar Tahara helps return the property to a ready, welcoming condition.",
    sections: [
      {
        title: "Airbnb and rental turnovers",
        body:
          "For short-stay properties, the service supports guest-ready presentation, cleaning after departure and preparation before the next arrival.",
      },
      {
        title: "Vacation-home preparation",
        body:
          "For owners who visit Morocco occasionally, Move In / Move Out care helps make sure the home feels prepared before arrival and properly reset after use.",
      },
      {
        title: "Scope confirmed in advance",
        body:
          "The exact scope depends on property size, condition, linen needs, timing and access. Additional laundry, linen changes or restocking may be quoted separately.",
      },
    ],
    highlights: [
      "Useful for Airbnb, rentals and vacation homes",
      "Arrival and departure preparation",
      "Guest-ready cleaning and presentation",
      "Optional linen, laundry and restocking coordination",
    ],
  },
  "property-inspections": {
    slug: "property-inspections",
    eyebrow: "Property Inspections",
    title: "A careful check of your home when you cannot be there yourself.",
    summary:
      "Property inspections help identify damages, changes and signs of problems, for example after an earthquake, heavy rain, storms or long periods without occupancy.",
    intro:
      "When a property is empty or the owner is abroad, small issues can go unnoticed. Dar Tahara property inspections provide a structured check so the home is not left unattended after weather events, building movement or guest stays.",
    sections: [
      {
        title: "After unusual events",
        body:
          "Inspections are especially useful after earthquakes, heavy rain, storms, leaks, humidity spikes or any event that may have affected the property.",
      },
      {
        title: "Damage and change detection",
        body:
          "The team checks for visible damage, water ingress, unusual smells, mould indicators, broken fixtures, access issues and changes that should be reviewed by the owner or a specialist.",
      },
      {
        title: "Clear reporting",
        body:
          "Inspection notes can support a decision on whether maintenance, deep cleaning or a specialist contractor is needed. Dar Tahara does not invent findings and will escalate uncertain or sensitive issues.",
      },
    ],
    highlights: [
      "Useful after earthquakes, storms or heavy rain",
      "Checks for visible damage and property changes",
      "Supports owners living abroad",
      "Can trigger maintenance or human follow-up when needed",
    ],
  },
  "maintenance-checks": {
    slug: "maintenance-checks",
    eyebrow: "Maintenance Checks",
    title: "A regular practical check to help prevent avoidable surprises.",
    summary:
      "Dar Tahara can perform a standard maintenance check approximately once every three months, including practical items such as air conditioning checks.",
    intro:
      "Maintenance checks are designed to catch obvious issues before they become expensive or inconvenient. They are not a replacement for licensed technical servicing, but they help owners keep an eye on the basics.",
    sections: [
      {
        title: "Quarterly standard check",
        body:
          "As a standard rhythm, Dar Tahara can perform a maintenance check around once every three months. The exact schedule can be adjusted to the property and subscription.",
      },
      {
        title: "Practical home systems",
        body:
          "Checks may include practical observations around air conditioning, visible leaks, water pressure, lighting, appliances, ventilation, doors, windows and other everyday systems.",
      },
      {
        title: "Specialist work remains separate",
        body:
          "If a technical issue is found, Dar Tahara can report it and help coordinate next steps, but specialist repairs, servicing or replacement parts are quoted separately by the relevant provider.",
      },
    ],
    highlights: [
      "Suggested every three months",
      "Includes practical checks such as air conditioning observations",
      "Helps identify maintenance needs early",
      "Specialist repairs quoted separately",
    ],
  },
  "key-holding": {
    slug: "key-holding",
    eyebrow: "Key Holding",
    title: "Secure access coordination for owners who are away.",
    summary:
      "Dar Tahara can coordinate property access and recommends a digital Wi-Fi enabled door lock supported by TTLock where suitable. Installation can be booked for around €200 and requires an active internet connection in the home.",
    intro:
      "Reliable access is essential for cleaning, inspections, maintenance checks and guest preparation. Dar Tahara supports secure key handling and can advise on smarter access options where appropriate.",
    sections: [
      {
        title: "Digital access recommendation",
        body:
          "Where the property allows it, we recommend installing a digital Wi-Fi enabled door lock supported by TTLock. This can make access easier to manage, especially for owners abroad or short-stay properties.",
      },
      {
        title: "Installation support",
        body:
          "If the customer wants help with installation, Dar Tahara can arrange this as a separate paid service of around €200. The home must have an active internet connection for the smart-lock connection. The lock, installation and any specialist requirements are not included automatically in the cleaning subscription.",
      },
      {
        title: "Access remains controlled",
        body:
          "Whether using keys, codes or a smart lock, access should be documented, limited to approved visits and handled discreetly.",
      },
    ],
    highlights: [
      "Secure access for cleaning and inspections",
      "TTLock-supported Wi-Fi door lock recommended where suitable",
      "Installation can be arranged for a separate fee",
      "Useful for owners abroad and rental homes",
    ],
  },
};

export function isServicePageSlug(value: string): value is ServicePageSlug {
  return (servicePageSlugs as readonly string[]).includes(value);
}

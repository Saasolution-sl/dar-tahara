import type { Locale } from "./config";
import type { DeepPartial } from "./types";

/**
 * Legal document copy, per locale.
 *
 * English is the source of truth and the legally binding text; every other
 * locale is a deep-merged override, so an untranslated field falls back to
 * English rather than disappearing. That fallback is safe here in a way it
 * would not be elsewhere: an English paragraph inside a translated contract is
 * the binding wording, and the prevailing-language notice at the top of every
 * translated page already tells the reader that.
 *
 * Sections 3, 4 and the support block of the Terms are NOT here. They live in
 * `@/lib/service-policy`, already translated for all seven locales, and are
 * kept there because they restate scheduling, subscription, discount and pause
 * rules that must stay identical to the rules the booking flow enforces.
 *
 * Translating law is not translating marketing. These renderings stay close to
 * the English sentence structure on purpose: where a more natural phrasing
 * would have shifted the scope of an obligation, the literal reading wins.
 */

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalDocument = {
  intro: string;
  /** Sections rendered before the localized service-policy block. */
  opening: LegalSection[];
  /** Sections rendered after it. */
  closing: LegalSection[];
};

export type LegalCopy = {
  terms: LegalDocument;
  privacy: LegalDocument;
};

const en: LegalCopy = {
  terms: {
    intro:
      "These Terms govern bookings and subscriptions supplied by Dar Tahara in Morocco. By paying for an Initial Home Assessment or accepting a subscription, you agree to these Terms and the order summary shown before payment.",
    opening: [
      {
        heading: "1. Initial Home Assessment",
        paragraphs: [
          "An Initial Home Assessment is mandatory before any recurring service begins. It is a separate, one-time, prepaid service covering a professional visit, verification of the home information, a cleaning profile and, where reasonably achievable during the allocated visit, initial cleaning. Payment reserves the requested appointment but remains subject to our scheduling confirmation.",
          "The assessment fee is not a subscription payment and does not guarantee approval for recurring service. If the declared size, condition, access requirements, safety conditions or workload differ materially from the booking, we may propose an additional deep-clean fee, a revised recurring price or decline ongoing service.",
        ],
      },
      {
        heading: "2. Customer information and access",
        paragraphs: [
          "You must provide accurate property, contact, pet, smoking, access and safety information and ensure lawful, safe access at the agreed time. You remain responsible for valuables, hazardous materials, unstable fittings and disclosing risks. Keys or access codes accepted by us are handled only for service delivery and must not be shared through insecure channels unless we expressly instruct you to do so.",
        ],
      },
    ],
    closing: [
      {
        heading: "5. Quality, damage and complaints",
        paragraphs: [
          "Please report a service concern or alleged damage within 48 hours, with reasonable evidence, so we can investigate. Where we are responsible, our first remedy may be a return visit, repair, replacement or an appropriate credit. We are not responsible for pre-existing damage, ordinary wear, undisclosed fragility, inherent defects or events outside reasonable control.",
        ],
      },
      {
        heading: "6. Liability",
        paragraphs: [
          "Nothing excludes liability that cannot lawfully be excluded. Subject to that rule, our aggregate liability arising from a service is limited to the amount paid for the affected service or, for a subscription claim, the fees paid during the preceding three months. We are not liable for indirect business losses.",
        ],
      },
      {
        heading: "7. Communications and acceptable use",
        paragraphs: [
          "We may send operational email and WhatsApp messages about applications, payments, assessments, proposals and renewals. You must not misuse our website, staff, messaging assistant or payment systems. Automated answers are general service information; Dar Tahara Support confirms exceptional arrangements.",
        ],
      },
      {
        heading: "8. Privacy, changes and law",
        paragraphs: [
          "Our Privacy Policy explains personal-data processing. We may update these Terms prospectively; the version accepted at checkout is recorded with your booking. These Terms are governed by Moroccan law, and disputes are subject to the competent Moroccan courts unless mandatory consumer law provides otherwise.",
        ],
      },
      {
        heading: "9. Air-conditioning maintenance benefit",
        paragraphs: [
          "An active Dar Tahara subscription includes preventative maintenance cleaning for one registered air-conditioning unit at the subscribed property, up to twice per rolling 12-month benefit period. This included benefit is associated with one specific registered physical air-conditioning unit, identified and tracked by its own internal record, not by a room name or description alone; renaming or redescribing a unit does not change which physical unit the benefit applies to and does not create an additional entitlement.",
          "The included benefit cannot be transferred between air-conditioning units simply to obtain additional maintenance visits. Changing which unit is the included unit is only made through Dar Tahara, for a legitimate reason such as the unit being permanently removed, replaced, the customer moving property, an incorrect unit having been registered before any maintenance occurred, or another Dar Tahara-approved correction; the maintenance history of a replaced unit remains attached to that unit's own record.",
          "Additional air-conditioning units may be registered and added to the subscription for a recurring fee per unit, disclosed at the time of registration and shown in the subscription summary and invoices. Each additional unit that is registered and actively covered receives the same maintenance benefit described above, up to twice per rolling 12-month benefit period, for as long as its coverage remains active.",
          "A maintenance benefit can only be used while the corresponding subscription, or the specific unit's paid coverage, is active. Coverage that has ended, whether through cancellation, non-payment or removal of a unit, does not carry forward, and no future maintenance visit is promised or available after the corresponding coverage has ended unless the subscription or unit coverage is renewed or reinstated. An unused maintenance visit does not become a cash credit, refund or discount, is not transferable to another unit, another property or another customer, and does not carry over beyond its own benefit period once that period ends.",
          "The included and additional-unit benefits described in this section are preventative maintenance cleaning. They do not include technical HVAC repair, refrigerant work or component replacement. Where an apparent technical fault or repair need is identified during a visit, Dar Tahara will report it to the customer; performing the repair itself is a separate service, only where Dar Tahara explicitly offers it.",
          "This section supplements and does not override the subscription duration, cancellation and renewal terms described elsewhere in these Terms and in the Subscription pause benefit section; where those terms determine that a subscription or a unit's coverage is not active, the maintenance benefit described in this section is not available for that period.",
        ],
      },
    ],
  },
  privacy: {
    intro:
      "Dar Tahara is responsible for the personal data described in this policy. This notice applies to our website, mailing list, Initial Home Assessments, subscriptions, operational email and WhatsApp communications.",
    opening: [
      {
        heading: "1. Data we collect",
        paragraphs: [
          "We collect identity and contact details; billing identifiers and payment status (card details remain with Stripe); service addresses; declared and verified property size, rooms, condition, pets, smoking, access and care notes; appointment choices; assessment observations; subscription proposals, subscriptions and invoices; communications; legal acceptances; and security data such as IP address, user agent and webhook records.",
        ],
      },
      {
        heading: "2. Why we use data",
        paragraphs: [
          "We process data to take steps requested before a contract, perform assessments and subscriptions, collect payment, schedule staff, maintain safety and service quality, answer enquiries, prevent fraud, keep financial and consent records, comply with law and defend legal claims. Marketing is sent only where consent or another lawful basis applies, and you may unsubscribe at any time.",
        ],
      },
      {
        heading: "3. WhatsApp assistant and automated responses",
        paragraphs: [
          "When you message our WhatsApp Business number, Meta processes the message and we may automatically classify its language and topic to provide an FAQ answer. Conversation content, phone number, detected language and delivery status may be logged. Ask for a specialist at any time. Automated answers do not make eligibility, pricing or contractual decisions.",
        ],
      },
      {
        heading: "4. Service providers and international transfers",
        paragraphs: [
          "We use vetted providers including Supabase for application data, Stripe for payments and invoices, Resend or a comparable provider for email, Meta for WhatsApp, and Cloudflare for bot protection. Providers act under their own terms and data-protection commitments. Where data crosses borders, we use an available lawful transfer mechanism and proportionate safeguards.",
          "Some pages load small illustrative images from third parties. Our forms display country flags served by flagcdn.com; the request needed to fetch an image makes your IP address and browser details visible to that provider. No form entries, contact details or account information are sent with it, and these images are used only for display.",
        ],
      },
      {
        heading: "5. Retention",
        paragraphs: [
          "Unpaid abandoned bookings are normally removed or anonymised within 90 days. Operational customer records are retained while the relationship is active and ordinarily for up to five years afterward; invoices and legally required accounting records may be kept longer. Support messages are ordinarily retained for two years. Mailing-list data is retained until unsubscribe or the list is retired. Security logs are kept only as long as reasonably needed.",
        ],
      },
      {
        heading: "6. Sharing and confidentiality",
        paragraphs: [
          "Data is shared only with personnel and processors who need it for delivery, with professional advisers, or where law, safety or a corporate transaction requires it. We do not sell personal data. Staff access is role-based and customer-facing database access is restricted by row-level security.",
        ],
      },
      {
        heading: "7. Your choices and rights",
        paragraphs: [
          "Subject to applicable law, you may request access, correction, deletion, restriction, portability or objection; withdraw consent; unsubscribe; or complain to the competent data-protection authority. Some records must be retained for legal obligations or claims. We may verify identity before acting.",
        ],
      },
      {
        heading: "8. Security and cookies",
        paragraphs: [
          "We use encrypted transport, restricted server credentials, signed payment and messaging webhooks, audit events and access controls. No system is risk-free. The site uses essential storage for language, theme, security and admin sessions; optional analytics should be enabled only in accordance with applicable consent requirements.",
        ],
      },
      {
        heading: "9. Children and changes",
        paragraphs: [
          "Our services are not directed to children. We may update this policy and will identify the effective date; material changes will be communicated where appropriate.",
        ],
      },
    ],
    closing: [],
  },
};

/** Contact line for the privacy policy, rendered with a mailto link appended. */
export const PRIVACY_CONTACT: Record<Locale, { heading: string; body: string }> = {
  en: { heading: "10. Contact", body: "For a privacy request, email" },
  nl: { heading: "10. Contact", body: "Voor een privacyverzoek stuurt u een e-mail naar" },
  fr: { heading: "10. Contact", body: "Pour une demande relative à la vie privée, écrivez à" },
  ar: { heading: "10. الاتصال", body: "لتقديم طلب يتعلق بالخصوصية، راسلنا على" },
  es: { heading: "10. Contacto", body: "Para una solicitud de privacidad, escribe a" },
  de: { heading: "10. Kontakt", body: "Für eine Datenschutzanfrage schreiben Sie an" },
  pt: { heading: "10. Contacto", body: "Para um pedido de privacidade, escreva para" },
};

/** Suffix after the email address in the privacy contact line. */
export const PRIVACY_CONTACT_SUFFIX: Record<Locale, string> = {
  en: "and identify the relevant booking or account.",
  nl: "en vermeld daarbij de betreffende boeking of het betreffende account.",
  fr: "en précisant la réservation ou le compte concerné.",
  ar: "مع تحديد الحجز أو الحساب المعني.",
  es: "e indica la reserva o la cuenta correspondiente.",
  de: "und nennen Sie die betreffende Buchung oder das betreffende Konto.",
  pt: "e identifique a marcação ou a conta em causa.",
};

const nl: DeepPartial<LegalCopy> = {
  terms: {
    intro:
      "Deze voorwaarden zijn van toepassing op boekingen en abonnementen die Dar Tahara in Marokko levert. Door te betalen voor een eerste woninginspectie of door een abonnement te aanvaarden, gaat u akkoord met deze voorwaarden en met het besteloverzicht dat vóór de betaling is getoond.",
    opening: [
      {
        heading: "1. Eerste woninginspectie",
        paragraphs: [
          "Een eerste woninginspectie is verplicht voordat enige terugkerende dienstverlening begint. Het betreft een afzonderlijke, eenmalige, vooruitbetaalde dienst die een professioneel bezoek omvat, verificatie van de woninggegevens, een schoonmaakprofiel en, voor zover redelijkerwijs haalbaar tijdens het toegewezen bezoek, een eerste schoonmaak. De betaling reserveert de gevraagde afspraak, maar blijft onderworpen aan onze planningsbevestiging.",
          "De inspectievergoeding is geen abonnementsbetaling en garandeert geen goedkeuring voor terugkerende dienstverlening. Wijken de opgegeven oppervlakte, staat, toegangsvereisten, veiligheidsomstandigheden of werklast wezenlijk af van de boeking, dan kunnen wij een aanvullende vergoeding voor dieptereiniging voorstellen, een herziene terugkerende prijs voorstellen of doorlopende dienstverlening weigeren.",
        ],
      },
      {
        heading: "2. Klantgegevens en toegang",
        paragraphs: [
          "U dient juiste gegevens te verstrekken over de woning, contactgegevens, huisdieren, roken, toegang en veiligheid, en u dient op het afgesproken tijdstip rechtmatige en veilige toegang te verzekeren. U blijft verantwoordelijk voor waardevolle zaken, gevaarlijke stoffen, instabiele voorzieningen en het melden van risico's. Sleutels of toegangscodes die wij aanvaarden, worden uitsluitend gebruikt voor de dienstverlening en mogen niet via onveilige kanalen worden gedeeld, tenzij wij u daartoe uitdrukkelijk opdracht geven.",
        ],
      },
    ],
    closing: [
      {
        heading: "5. Kwaliteit, schade en klachten",
        paragraphs: [
          "Meld een servicekwestie of gestelde schade binnen 48 uur, met redelijk bewijs, zodat wij onderzoek kunnen doen. Waar wij verantwoordelijk zijn, kan ons eerste herstel bestaan uit een herhaalbezoek, reparatie, vervanging of een passende creditering. Wij zijn niet verantwoordelijk voor reeds bestaande schade, normale slijtage, niet-gemelde kwetsbaarheid, inherente gebreken of gebeurtenissen buiten redelijke controle.",
        ],
      },
      {
        heading: "6. Aansprakelijkheid",
        paragraphs: [
          "Niets sluit aansprakelijkheid uit die rechtens niet kan worden uitgesloten. Behoudens die regel is onze totale aansprakelijkheid die uit een dienst voortvloeit, beperkt tot het voor de betrokken dienst betaalde bedrag of, bij een vordering met betrekking tot een abonnement, tot de vergoedingen die in de voorafgaande drie maanden zijn betaald. Wij zijn niet aansprakelijk voor indirecte bedrijfsschade.",
        ],
      },
      {
        heading: "7. Communicatie en aanvaardbaar gebruik",
        paragraphs: [
          "Wij kunnen operationele e-mails en WhatsApp-berichten sturen over aanvragen, betalingen, inspecties, voorstellen en verlengingen. U mag onze website, medewerkers, berichtenassistent of betaalsystemen niet misbruiken. Geautomatiseerde antwoorden zijn algemene service-informatie; Dar Tahara Support bevestigt uitzonderlijke afspraken.",
        ],
      },
      {
        heading: "8. Privacy, wijzigingen en toepasselijk recht",
        paragraphs: [
          "Onze privacyverklaring licht de verwerking van persoonsgegevens toe. Wij kunnen deze voorwaarden voor de toekomst wijzigen; de versie die bij het afrekenen is aanvaard, wordt bij uw boeking vastgelegd. Op deze voorwaarden is Marokkaans recht van toepassing en geschillen worden voorgelegd aan de bevoegde Marokkaanse rechter, tenzij dwingend consumentenrecht anders bepaalt.",
        ],
      },
    ],
  },
  privacy: {
    intro:
      "Dar Tahara is verantwoordelijk voor de persoonsgegevens die in deze verklaring worden beschreven. Deze verklaring geldt voor onze website, mailinglijst, eerste woninginspecties, abonnementen, operationele e-mail en WhatsApp-communicatie.",
    opening: [
      {
        heading: "1. Gegevens die wij verzamelen",
        paragraphs: [
          "Wij verzamelen identiteits- en contactgegevens; factureringskenmerken en betaalstatus (kaartgegevens blijven bij Stripe); serviceadressen; opgegeven en geverifieerde woningoppervlakte, kamers, staat, huisdieren, roken, toegang en verzorgingsnotities; keuzes voor afspraken; observaties uit de inspectie; abonnementsvoorstellen, abonnementen en facturen; communicatie; juridische aanvaardingen; en beveiligingsgegevens zoals IP-adres, user agent en webhookregistraties.",
        ],
      },
      {
        heading: "2. Waarom wij gegevens gebruiken",
        paragraphs: [
          "Wij verwerken gegevens om vóór een overeenkomst gevraagde stappen te zetten, inspecties en abonnementen uit te voeren, betalingen te innen, personeel in te plannen, veiligheid en servicekwaliteit te bewaken, vragen te beantwoorden, fraude te voorkomen, financiële en toestemmingsregistraties bij te houden, aan de wet te voldoen en juridische aanspraken te verweren. Marketing wordt alleen verzonden waar toestemming of een andere rechtsgrond geldt, en u kunt zich op elk moment afmelden.",
        ],
      },
      {
        heading: "3. WhatsApp-assistent en geautomatiseerde antwoorden",
        paragraphs: [
          "Wanneer u ons WhatsApp Business-nummer bericht, verwerkt Meta het bericht en kunnen wij taal en onderwerp automatisch classificeren om een FAQ-antwoord te geven. Gespreksinhoud, telefoonnummer, gedetecteerde taal en bezorgstatus kunnen worden vastgelegd. U kunt op elk moment om een specialist vragen. Geautomatiseerde antwoorden nemen geen beslissingen over geschiktheid, prijzen of contractuele voorwaarden.",
        ],
      },
      {
        heading: "4. Dienstverleners en internationale doorgifte",
        paragraphs: [
          "Wij maken gebruik van gescreende leveranciers, waaronder Supabase voor applicatiegegevens, Stripe voor betalingen en facturen, Resend of een vergelijkbare aanbieder voor e-mail, Meta voor WhatsApp en Cloudflare voor botbescherming. Leveranciers handelen onder hun eigen voorwaarden en gegevensbeschermingsverplichtingen. Wanneer gegevens grenzen overschrijden, gebruiken wij een beschikbaar rechtmatig doorgiftemechanisme en evenredige waarborgen.",
          "Sommige pagina's laden kleine illustratieve afbeeldingen van derden. Onze formulieren tonen landvlaggen die worden geleverd door flagcdn.com; het verzoek dat nodig is om een afbeelding op te halen, maakt uw IP-adres en browsergegevens zichtbaar voor die aanbieder. Er worden geen formulierinvoer, contactgegevens of accountgegevens meegestuurd, en deze afbeeldingen worden uitsluitend gebruikt om te tonen.",
        ],
      },
      {
        heading: "5. Bewaartermijnen",
        paragraphs: [
          "Onbetaalde, afgebroken boekingen worden normaal gesproken binnen 90 dagen verwijderd of geanonimiseerd. Operationele klantgegevens worden bewaard zolang de relatie loopt en doorgaans tot vijf jaar daarna; facturen en wettelijk vereiste boekhoudkundige gegevens kunnen langer worden bewaard. Supportberichten worden doorgaans twee jaar bewaard. Gegevens van de mailinglijst worden bewaard tot afmelding of tot de lijst wordt beëindigd. Beveiligingslogs worden niet langer bewaard dan redelijkerwijs nodig is.",
        ],
      },
      {
        heading: "6. Delen en vertrouwelijkheid",
        paragraphs: [
          "Gegevens worden uitsluitend gedeeld met medewerkers en verwerkers die deze voor de dienstverlening nodig hebben, met professionele adviseurs, of waar wet, veiligheid of een bedrijfstransactie dit vereist. Wij verkopen geen persoonsgegevens. Toegang voor medewerkers is rolgebaseerd en klantgerichte databasetoegang is beperkt door beveiliging op rijniveau.",
        ],
      },
      {
        heading: "7. Uw keuzes en rechten",
        paragraphs: [
          "Behoudens toepasselijk recht kunt u verzoeken om inzage, correctie, verwijdering, beperking, overdraagbaarheid of bezwaar; toestemming intrekken; u afmelden; of een klacht indienen bij de bevoegde gegevensbeschermingsautoriteit. Bepaalde gegevens moeten worden bewaard vanwege wettelijke verplichtingen of aanspraken. Wij kunnen uw identiteit verifiëren voordat wij handelen.",
        ],
      },
      {
        heading: "8. Beveiliging en cookies",
        paragraphs: [
          "Wij gebruiken versleuteld transport, beperkte servergegevens, ondertekende betaal- en berichtenwebhooks, auditgebeurtenissen en toegangscontroles. Geen enkel systeem is zonder risico. De site gebruikt essentiële opslag voor taal, thema, beveiliging en beheerderssessies; optionele analytics dienen uitsluitend te worden ingeschakeld in overeenstemming met de toepasselijke toestemmingsvereisten.",
        ],
      },
      {
        heading: "9. Kinderen en wijzigingen",
        paragraphs: [
          "Onze diensten zijn niet gericht op kinderen. Wij kunnen deze verklaring bijwerken en zullen daarbij de ingangsdatum vermelden; wezenlijke wijzigingen worden waar passend gecommuniceerd.",
        ],
      },
    ],
  },
};

const fr: DeepPartial<LegalCopy> = {
  terms: {
    intro:
      "Les présentes conditions régissent les réservations et les abonnements fournis par Dar Tahara au Maroc. En payant une évaluation initiale du logement ou en acceptant un abonnement, vous acceptez les présentes conditions ainsi que le récapitulatif de commande affiché avant le paiement.",
    opening: [
      {
        heading: "1. Évaluation initiale du logement",
        paragraphs: [
          "Une évaluation initiale du logement est obligatoire avant le début de toute prestation récurrente. Il s'agit d'une prestation distincte, unique et prépayée, comprenant une visite professionnelle, la vérification des informations relatives au logement, l'établissement d'un profil de nettoyage et, dans la mesure raisonnablement réalisable pendant la visite allouée, un premier nettoyage. Le paiement réserve le rendez-vous demandé mais reste soumis à notre confirmation de planification.",
          "Les frais d'évaluation ne constituent pas un paiement d'abonnement et ne garantissent pas l'acceptation d'une prestation récurrente. Si la superficie déclarée, l'état, les exigences d'accès, les conditions de sécurité ou la charge de travail diffèrent sensiblement de la réservation, nous pouvons proposer des frais supplémentaires de nettoyage en profondeur, proposer un prix récurrent révisé ou refuser la prestation continue.",
        ],
      },
      {
        heading: "2. Informations client et accès",
        paragraphs: [
          "Vous devez fournir des informations exactes concernant le bien, vos coordonnées, les animaux, le tabagisme, l'accès et la sécurité, et garantir un accès licite et sûr à l'heure convenue. Vous demeurez responsable des objets de valeur, des matières dangereuses, des équipements instables et de la communication des risques. Les clés ou codes d'accès que nous acceptons sont utilisés uniquement pour l'exécution de la prestation et ne doivent pas être transmis par des canaux non sécurisés, sauf instruction expresse de notre part.",
        ],
      },
    ],
    closing: [
      {
        heading: "5. Qualité, dommages et réclamations",
        paragraphs: [
          "Veuillez signaler tout problème de prestation ou dommage allégué dans un délai de 48 heures, avec des éléments de preuve raisonnables, afin que nous puissions enquêter. Lorsque notre responsabilité est engagée, notre première mesure corrective peut consister en une nouvelle visite, une réparation, un remplacement ou un avoir approprié. Nous ne sommes pas responsables des dommages préexistants, de l'usure normale, d'une fragilité non signalée, des vices propres ou des événements échappant à un contrôle raisonnable.",
        ],
      },
      {
        heading: "6. Responsabilité",
        paragraphs: [
          "Rien n'exclut la responsabilité qui ne peut légalement être exclue. Sous réserve de cette règle, notre responsabilité globale découlant d'une prestation est limitée au montant payé pour la prestation concernée ou, pour une réclamation relative à un abonnement, aux sommes versées au cours des trois mois précédents. Nous ne sommes pas responsables des pertes commerciales indirectes.",
        ],
      },
      {
        heading: "7. Communications et usage acceptable",
        paragraphs: [
          "Nous pouvons envoyer des courriels et des messages WhatsApp opérationnels concernant les demandes, les paiements, les évaluations, les propositions et les renouvellements. Vous ne devez pas faire un usage abusif de notre site, de notre personnel, de notre assistant de messagerie ou de nos systèmes de paiement. Les réponses automatisées constituent une information générale sur le service ; Dar Tahara Support confirme les arrangements exceptionnels.",
        ],
      },
      {
        heading: "8. Vie privée, modifications et droit applicable",
        paragraphs: [
          "Notre politique de confidentialité explique le traitement des données personnelles. Nous pouvons modifier les présentes conditions pour l'avenir ; la version acceptée lors du paiement est enregistrée avec votre réservation. Les présentes conditions sont régies par le droit marocain et les litiges relèvent des juridictions marocaines compétentes, sauf disposition contraire du droit impératif de la consommation.",
        ],
      },
    ],
  },
  privacy: {
    intro:
      "Dar Tahara est responsable des données personnelles décrites dans la présente politique. Cet avis s'applique à notre site web, à notre liste de diffusion, aux évaluations initiales de logement, aux abonnements, aux courriels opérationnels et aux communications WhatsApp.",
    opening: [
      {
        heading: "1. Données que nous collectons",
        paragraphs: [
          "Nous collectons des données d'identité et de contact ; des identifiants de facturation et le statut de paiement (les données de carte restent chez Stripe) ; les adresses d'intervention ; la superficie déclarée et vérifiée, les pièces, l'état, les animaux, le tabagisme, l'accès et les notes d'entretien ; les choix de rendez-vous ; les observations d'évaluation ; les propositions d'abonnement, les abonnements et les factures ; les communications ; les acceptations juridiques ; ainsi que des données de sécurité telles que l'adresse IP, l'agent utilisateur et les enregistrements de webhooks.",
        ],
      },
      {
        heading: "2. Pourquoi nous utilisons les données",
        paragraphs: [
          "Nous traitons les données pour accomplir les démarches demandées avant un contrat, réaliser les évaluations et les abonnements, encaisser les paiements, planifier le personnel, garantir la sécurité et la qualité du service, répondre aux demandes, prévenir la fraude, conserver les registres financiers et de consentement, respecter la loi et défendre des prétentions juridiques. Les communications marketing ne sont envoyées que lorsque le consentement ou une autre base légale s'applique, et vous pouvez vous désinscrire à tout moment.",
        ],
      },
      {
        heading: "3. Assistant WhatsApp et réponses automatisées",
        paragraphs: [
          "Lorsque vous écrivez à notre numéro WhatsApp Business, Meta traite le message et nous pouvons classer automatiquement sa langue et son sujet afin de fournir une réponse issue de la FAQ. Le contenu de la conversation, le numéro de téléphone, la langue détectée et le statut de remise peuvent être enregistrés. Vous pouvez demander un spécialiste à tout moment. Les réponses automatisées ne prennent aucune décision d'éligibilité, de tarification ou de nature contractuelle.",
        ],
      },
      {
        heading: "4. Prestataires et transferts internationaux",
        paragraphs: [
          "Nous recourons à des prestataires sélectionnés, notamment Supabase pour les données applicatives, Stripe pour les paiements et les factures, Resend ou un prestataire comparable pour le courriel, Meta pour WhatsApp et Cloudflare pour la protection contre les robots. Les prestataires agissent selon leurs propres conditions et engagements en matière de protection des données. Lorsque des données franchissent des frontières, nous utilisons un mécanisme de transfert licite disponible et des garanties proportionnées.",
          "Certaines pages chargent de petites images illustratives provenant de tiers. Nos formulaires affichent des drapeaux de pays fournis par flagcdn.com ; la requête nécessaire au chargement d'une image rend votre adresse IP et les informations de votre navigateur visibles pour ce prestataire. Aucune saisie de formulaire, coordonnée ou information de compte n'est transmise avec elle, et ces images servent uniquement à l'affichage.",
        ],
      },
      {
        heading: "5. Conservation",
        paragraphs: [
          "Les réservations abandonnées et non payées sont normalement supprimées ou anonymisées dans un délai de 90 jours. Les dossiers clients opérationnels sont conservés pendant la durée de la relation et, ordinairement, jusqu'à cinq ans après ; les factures et les documents comptables légalement requis peuvent être conservés plus longtemps. Les messages d'assistance sont ordinairement conservés deux ans. Les données de la liste de diffusion sont conservées jusqu'au désabonnement ou jusqu'à la clôture de la liste. Les journaux de sécurité ne sont conservés que le temps raisonnablement nécessaire.",
        ],
      },
      {
        heading: "6. Partage et confidentialité",
        paragraphs: [
          "Les données ne sont partagées qu'avec le personnel et les sous-traitants qui en ont besoin pour l'exécution, avec des conseils professionnels, ou lorsque la loi, la sécurité ou une opération sur l'entreprise l'exige. Nous ne vendons pas de données personnelles. L'accès du personnel repose sur les rôles et l'accès à la base de données côté client est restreint par une sécurité au niveau des lignes.",
        ],
      },
      {
        heading: "7. Vos choix et vos droits",
        paragraphs: [
          "Sous réserve du droit applicable, vous pouvez demander l'accès, la rectification, l'effacement, la limitation, la portabilité ou vous opposer au traitement ; retirer votre consentement ; vous désinscrire ; ou saisir l'autorité de protection des données compétente. Certains éléments doivent être conservés au titre d'obligations légales ou de réclamations. Nous pouvons vérifier votre identité avant d'agir.",
        ],
      },
      {
        heading: "8. Sécurité et cookies",
        paragraphs: [
          "Nous utilisons un transport chiffré, des identifiants serveur restreints, des webhooks de paiement et de messagerie signés, des événements d'audit et des contrôles d'accès. Aucun système n'est exempt de risque. Le site utilise un stockage essentiel pour la langue, le thème, la sécurité et les sessions d'administration ; les mesures d'audience optionnelles ne doivent être activées que conformément aux exigences de consentement applicables.",
        ],
      },
      {
        heading: "9. Enfants et modifications",
        paragraphs: [
          "Nos services ne s'adressent pas aux enfants. Nous pouvons mettre à jour la présente politique et en indiquerons la date d'entrée en vigueur ; les modifications substantielles seront communiquées lorsque cela est approprié.",
        ],
      },
    ],
  },
};

const es: DeepPartial<LegalCopy> = {
  terms: {
    intro:
      "Estos Términos rigen las reservas y suscripciones prestadas por Dar Tahara en Marruecos. Al pagar una evaluación inicial de la vivienda o aceptar una suscripción, usted acepta estos Términos y el resumen del pedido mostrado antes del pago.",
    opening: [
      {
        heading: "1. Evaluación inicial de la vivienda",
        paragraphs: [
          "La evaluación inicial de la vivienda es obligatoria antes de que comience cualquier servicio recurrente. Se trata de un servicio independiente, único y prepagado que comprende una visita profesional, la verificación de la información de la vivienda, un perfil de limpieza y, en la medida razonablemente alcanzable durante la visita asignada, una limpieza inicial. El pago reserva la cita solicitada, pero queda sujeto a nuestra confirmación de planificación.",
          "La tarifa de evaluación no constituye un pago de suscripción ni garantiza la aprobación del servicio recurrente. Si la superficie declarada, el estado, los requisitos de acceso, las condiciones de seguridad o la carga de trabajo difieren sustancialmente de la reserva, podremos proponer una tarifa adicional de limpieza a fondo, proponer un precio recurrente revisado o rechazar la prestación continuada.",
        ],
      },
      {
        heading: "2. Información del cliente y acceso",
        paragraphs: [
          "Usted debe facilitar información veraz sobre la vivienda, los datos de contacto, las mascotas, el tabaco, el acceso y la seguridad, y garantizar un acceso lícito y seguro en el momento acordado. Usted sigue siendo responsable de los objetos de valor, los materiales peligrosos, los elementos inestables y la comunicación de riesgos. Las llaves o códigos de acceso que aceptemos se utilizarán únicamente para la prestación del servicio y no deberán compartirse por canales inseguros, salvo que se lo indiquemos expresamente.",
        ],
      },
    ],
    closing: [
      {
        heading: "5. Calidad, daños y reclamaciones",
        paragraphs: [
          "Comunique cualquier incidencia del servicio o daño alegado en un plazo de 48 horas, con pruebas razonables, para que podamos investigarlo. Cuando seamos responsables, nuestra primera medida correctora podrá consistir en una visita de repaso, una reparación, una sustitución o un abono adecuado. No somos responsables de daños preexistentes, del desgaste normal, de una fragilidad no comunicada, de defectos inherentes ni de sucesos ajenos a un control razonable.",
        ],
      },
      {
        heading: "6. Responsabilidad",
        paragraphs: [
          "Nada excluye la responsabilidad que no pueda excluirse legalmente. Con sujeción a esa regla, nuestra responsabilidad total derivada de un servicio se limita al importe abonado por el servicio afectado o, en el caso de una reclamación relativa a una suscripción, a las cuotas pagadas durante los tres meses anteriores. No respondemos de pérdidas comerciales indirectas.",
        ],
      },
      {
        heading: "7. Comunicaciones y uso aceptable",
        paragraphs: [
          "Podemos enviar correos electrónicos y mensajes de WhatsApp operativos sobre solicitudes, pagos, evaluaciones, propuestas y renovaciones. Usted no debe hacer un uso indebido de nuestro sitio web, nuestro personal, nuestro asistente de mensajería ni nuestros sistemas de pago. Las respuestas automatizadas constituyen información general del servicio; Dar Tahara Support confirma los acuerdos excepcionales.",
        ],
      },
      {
        heading: "8. Privacidad, cambios y legislación aplicable",
        paragraphs: [
          "Nuestra política de privacidad explica el tratamiento de los datos personales. Podemos actualizar estos Términos con efectos futuros; la versión aceptada en el momento del pago queda registrada junto con su reserva. Estos Términos se rigen por la legislación marroquí y los litigios se someten a los tribunales marroquíes competentes, salvo que la normativa imperativa de consumo disponga otra cosa.",
        ],
      },
    ],
  },
  privacy: {
    intro:
      "Dar Tahara es responsable de los datos personales descritos en esta política. Este aviso se aplica a nuestro sitio web, la lista de correo, las evaluaciones iniciales de vivienda, las suscripciones, el correo electrónico operativo y las comunicaciones por WhatsApp.",
    opening: [
      {
        heading: "1. Datos que recogemos",
        paragraphs: [
          "Recogemos datos de identidad y contacto; identificadores de facturación y estado del pago (los datos de la tarjeta permanecen en Stripe); direcciones de servicio; superficie declarada y verificada, estancias, estado, mascotas, tabaco, acceso y notas de cuidado; elecciones de cita; observaciones de la evaluación; propuestas de suscripción, suscripciones y facturas; comunicaciones; aceptaciones legales; y datos de seguridad como la dirección IP, el agente de usuario y los registros de webhooks.",
        ],
      },
      {
        heading: "2. Por qué usamos los datos",
        paragraphs: [
          "Tratamos los datos para realizar las gestiones solicitadas antes de un contrato, ejecutar evaluaciones y suscripciones, cobrar pagos, planificar al personal, mantener la seguridad y la calidad del servicio, atender consultas, prevenir el fraude, conservar registros financieros y de consentimiento, cumplir la ley y defender reclamaciones legales. El marketing solo se envía cuando existe consentimiento u otra base lícita, y puede darse de baja en cualquier momento.",
        ],
      },
      {
        heading: "3. Asistente de WhatsApp y respuestas automatizadas",
        paragraphs: [
          "Cuando escribe a nuestro número de WhatsApp Business, Meta trata el mensaje y nosotros podemos clasificar automáticamente su idioma y su tema para ofrecer una respuesta de las preguntas frecuentes. Pueden registrarse el contenido de la conversación, el número de teléfono, el idioma detectado y el estado de entrega. Puede solicitar un especialista en cualquier momento. Las respuestas automatizadas no adoptan decisiones sobre elegibilidad, precios ni cuestiones contractuales.",
        ],
      },
      {
        heading: "4. Proveedores de servicios y transferencias internacionales",
        paragraphs: [
          "Utilizamos proveedores contrastados, entre ellos Supabase para los datos de la aplicación, Stripe para pagos y facturas, Resend o un proveedor comparable para el correo electrónico, Meta para WhatsApp y Cloudflare para la protección frente a bots. Los proveedores actúan conforme a sus propios términos y compromisos de protección de datos. Cuando los datos cruzan fronteras, empleamos un mecanismo de transferencia lícito disponible y garantías proporcionadas.",
          "Algunas páginas cargan pequeñas imágenes ilustrativas de terceros. Nuestros formularios muestran banderas de países servidas por flagcdn.com; la solicitud necesaria para obtener una imagen hace visibles a ese proveedor su dirección IP y los datos de su navegador. No se envía con ella ninguna entrada del formulario, dato de contacto ni información de cuenta, y estas imágenes se usan únicamente para su visualización.",
        ],
      },
      {
        heading: "5. Conservación",
        paragraphs: [
          "Las reservas abandonadas y no pagadas se eliminan o anonimizan normalmente en un plazo de 90 días. Los registros operativos de clientes se conservan mientras la relación esté activa y, por lo general, hasta cinco años después; las facturas y los registros contables legalmente exigidos pueden conservarse durante más tiempo. Los mensajes de soporte se conservan normalmente dos años. Los datos de la lista de correo se conservan hasta la baja o hasta que la lista se retire. Los registros de seguridad se conservan solo el tiempo razonablemente necesario.",
        ],
      },
      {
        heading: "6. Comunicación de datos y confidencialidad",
        paragraphs: [
          "Los datos solo se comparten con el personal y los encargados que los necesitan para la prestación, con asesores profesionales, o cuando lo exigen la ley, la seguridad o una operación societaria. No vendemos datos personales. El acceso del personal se basa en funciones y el acceso a la base de datos orientada al cliente está restringido mediante seguridad a nivel de fila.",
        ],
      },
      {
        heading: "7. Sus opciones y derechos",
        paragraphs: [
          "Con sujeción a la legislación aplicable, puede solicitar acceso, rectificación, supresión, limitación, portabilidad u oposición; retirar el consentimiento; darse de baja; o presentar una reclamación ante la autoridad de protección de datos competente. Algunos registros deben conservarse por obligaciones legales o reclamaciones. Podemos verificar su identidad antes de actuar.",
        ],
      },
      {
        heading: "8. Seguridad y cookies",
        paragraphs: [
          "Utilizamos transporte cifrado, credenciales de servidor restringidas, webhooks de pago y mensajería firmados, eventos de auditoría y controles de acceso. Ningún sistema está libre de riesgo. El sitio usa almacenamiento esencial para idioma, tema, seguridad y sesiones de administración; la analítica opcional solo debe activarse conforme a los requisitos de consentimiento aplicables.",
        ],
      },
      {
        heading: "9. Menores y cambios",
        paragraphs: [
          "Nuestros servicios no están dirigidos a menores. Podemos actualizar esta política e indicaremos la fecha de entrada en vigor; los cambios sustanciales se comunicarán cuando proceda.",
        ],
      },
    ],
  },
};

const de: DeepPartial<LegalCopy> = {
  terms: {
    intro:
      "Diese Bedingungen gelten für Buchungen und Abonnements, die Dar Tahara in Marokko erbringt. Mit der Bezahlung einer ersten Wohnungsbegehung oder der Annahme eines Abonnements erkennen Sie diese Bedingungen und die vor der Zahlung angezeigte Bestellübersicht an.",
    opening: [
      {
        heading: "1. Erste Wohnungsbegehung",
        paragraphs: [
          "Eine erste Wohnungsbegehung ist vor Beginn jeder wiederkehrenden Leistung verpflichtend. Sie ist eine gesonderte, einmalige, im Voraus bezahlte Leistung und umfasst einen fachlichen Besuch, die Überprüfung der Angaben zur Wohnung, ein Reinigungsprofil sowie, soweit während des vorgesehenen Besuchs zumutbar erreichbar, eine erste Reinigung. Die Zahlung reserviert den gewünschten Termin, steht jedoch unter dem Vorbehalt unserer Terminbestätigung.",
          "Das Entgelt für die Begehung ist keine Abonnementzahlung und begründet keinen Anspruch auf Aufnahme in eine wiederkehrende Leistung. Weichen die angegebene Größe, der Zustand, die Zugangsanforderungen, die Sicherheitsbedingungen oder der Arbeitsaufwand wesentlich von der Buchung ab, können wir ein zusätzliches Entgelt für eine Grundreinigung vorschlagen, einen angepassten wiederkehrenden Preis anbieten oder die fortlaufende Leistung ablehnen.",
        ],
      },
      {
        heading: "2. Kundenangaben und Zugang",
        paragraphs: [
          "Sie müssen zutreffende Angaben zu Objekt, Kontaktdaten, Haustieren, Rauchen, Zugang und Sicherheit machen und zum vereinbarten Zeitpunkt rechtmäßigen, sicheren Zugang gewährleisten. Sie bleiben verantwortlich für Wertgegenstände, Gefahrstoffe, instabile Einbauten und die Offenlegung von Risiken. Von uns entgegengenommene Schlüssel oder Zugangscodes werden ausschließlich zur Leistungserbringung verwendet und dürfen nicht über unsichere Kanäle weitergegeben werden, sofern wir Sie nicht ausdrücklich dazu anweisen.",
        ],
      },
    ],
    closing: [
      {
        heading: "5. Qualität, Schäden und Beschwerden",
        paragraphs: [
          "Bitte melden Sie eine Beanstandung der Leistung oder einen behaupteten Schaden innerhalb von 48 Stunden mit angemessenen Nachweisen, damit wir den Sachverhalt prüfen können. Soweit wir verantwortlich sind, kann unsere erste Abhilfe in einem erneuten Besuch, einer Reparatur, einem Ersatz oder einer angemessenen Gutschrift bestehen. Für vorbestehende Schäden, gewöhnliche Abnutzung, nicht offengelegte Empfindlichkeit, immanente Mängel oder Ereignisse außerhalb zumutbarer Kontrolle haften wir nicht.",
        ],
      },
      {
        heading: "6. Haftung",
        paragraphs: [
          "Eine Haftung, die gesetzlich nicht ausgeschlossen werden kann, bleibt unberührt. Vorbehaltlich dessen ist unsere Gesamthaftung aus einer Leistung auf den für die betroffene Leistung gezahlten Betrag begrenzt oder, bei einem Anspruch aus einem Abonnement, auf die in den vorangegangenen drei Monaten gezahlten Entgelte. Für mittelbare Vermögensschäden haften wir nicht.",
        ],
      },
      {
        heading: "7. Kommunikation und zulässige Nutzung",
        paragraphs: [
          "Wir können betriebliche E-Mails und WhatsApp-Nachrichten zu Anfragen, Zahlungen, Begehungen, Angeboten und Verlängerungen versenden. Sie dürfen unsere Website, unsere Mitarbeitenden, unseren Nachrichtenassistenten und unsere Zahlungssysteme nicht missbräuchlich nutzen. Automatisierte Antworten sind allgemeine Serviceinformationen; Dar Tahara Support bestätigt Ausnahmeregelungen.",
        ],
      },
      {
        heading: "8. Datenschutz, Änderungen und anwendbares Recht",
        paragraphs: [
          "Unsere Datenschutzerklärung erläutert die Verarbeitung personenbezogener Daten. Wir können diese Bedingungen mit Wirkung für die Zukunft ändern; die beim Bezahlvorgang angenommene Fassung wird zu Ihrer Buchung gespeichert. Diese Bedingungen unterliegen marokkanischem Recht, und Streitigkeiten fallen in die Zuständigkeit der zuständigen marokkanischen Gerichte, soweit zwingendes Verbraucherrecht nichts anderes bestimmt.",
        ],
      },
    ],
  },
  privacy: {
    intro:
      "Dar Tahara ist für die in dieser Erklärung beschriebenen personenbezogenen Daten verantwortlich. Sie gilt für unsere Website, den Verteiler, erste Wohnungsbegehungen, Abonnements, betriebliche E-Mails und WhatsApp-Kommunikation.",
    opening: [
      {
        heading: "1. Daten, die wir erheben",
        paragraphs: [
          "Wir erheben Identitäts- und Kontaktdaten; Abrechnungskennungen und Zahlungsstatus (Kartendaten verbleiben bei Stripe); Leistungsadressen; angegebene und geprüfte Wohnfläche, Räume, Zustand, Haustiere, Rauchen, Zugang und Pflegehinweise; Terminwahl; Beobachtungen aus der Begehung; Abonnementangebote, Abonnements und Rechnungen; Kommunikation; rechtliche Zustimmungen; sowie Sicherheitsdaten wie IP-Adresse, User-Agent und Webhook-Aufzeichnungen.",
        ],
      },
      {
        heading: "2. Warum wir Daten nutzen",
        paragraphs: [
          "Wir verarbeiten Daten, um vorvertraglich angefragte Schritte durchzuführen, Begehungen und Abonnements zu erbringen, Zahlungen einzuziehen, Personal einzuplanen, Sicherheit und Servicequalität zu wahren, Anfragen zu beantworten, Betrug vorzubeugen, Finanz- und Einwilligungsnachweise zu führen, Recht einzuhalten und Rechtsansprüche abzuwehren. Marketing wird nur versandt, wenn eine Einwilligung oder eine andere Rechtsgrundlage vorliegt; Sie können sich jederzeit abmelden.",
        ],
      },
      {
        heading: "3. WhatsApp-Assistent und automatisierte Antworten",
        paragraphs: [
          "Wenn Sie unserer WhatsApp-Business-Nummer schreiben, verarbeitet Meta die Nachricht, und wir können Sprache und Thema automatisch klassifizieren, um eine FAQ-Antwort zu geben. Gesprächsinhalt, Telefonnummer, erkannte Sprache und Zustellstatus können protokolliert werden. Sie können jederzeit nach einer Fachkraft fragen. Automatisierte Antworten treffen keine Entscheidungen über Eignung, Preise oder Vertragsinhalte.",
        ],
      },
      {
        heading: "4. Dienstleister und internationale Übermittlungen",
        paragraphs: [
          "Wir setzen geprüfte Anbieter ein, darunter Supabase für Anwendungsdaten, Stripe für Zahlungen und Rechnungen, Resend oder einen vergleichbaren Anbieter für E-Mail, Meta für WhatsApp und Cloudflare zum Schutz vor Bots. Die Anbieter handeln nach ihren eigenen Bedingungen und Datenschutzverpflichtungen. Wenn Daten Grenzen überschreiten, nutzen wir einen verfügbaren rechtmäßigen Übermittlungsmechanismus und angemessene Garantien.",
          "Einige Seiten laden kleine illustrative Bilder von Dritten. Unsere Formulare zeigen Länderflaggen, die von flagcdn.com bereitgestellt werden; die zum Abruf eines Bildes nötige Anfrage macht Ihre IP-Adresse und Browserangaben für diesen Anbieter sichtbar. Es werden dabei keine Formulareingaben, Kontaktdaten oder Kontoinformationen übermittelt, und diese Bilder dienen ausschließlich der Darstellung.",
        ],
      },
      {
        heading: "5. Aufbewahrung",
        paragraphs: [
          "Unbezahlte, abgebrochene Buchungen werden in der Regel innerhalb von 90 Tagen gelöscht oder anonymisiert. Betriebliche Kundendaten werden für die Dauer der Geschäftsbeziehung und üblicherweise bis zu fünf Jahre darüber hinaus aufbewahrt; Rechnungen und gesetzlich vorgeschriebene Buchhaltungsunterlagen können länger aufbewahrt werden. Supportnachrichten werden üblicherweise zwei Jahre aufbewahrt. Verteilerdaten werden bis zur Abmeldung oder bis zur Einstellung des Verteilers aufbewahrt. Sicherheitsprotokolle werden nur so lange aufbewahrt, wie dies vernünftigerweise erforderlich ist.",
        ],
      },
      {
        heading: "6. Weitergabe und Vertraulichkeit",
        paragraphs: [
          "Daten werden nur an Mitarbeitende und Auftragsverarbeiter weitergegeben, die sie zur Leistungserbringung benötigen, an fachliche Berater, oder wenn Recht, Sicherheit oder eine Unternehmenstransaktion dies erfordert. Wir verkaufen keine personenbezogenen Daten. Der Zugriff der Mitarbeitenden ist rollenbasiert, und der kundenseitige Datenbankzugriff ist durch Sicherheit auf Zeilenebene beschränkt.",
        ],
      },
      {
        heading: "7. Ihre Wahlmöglichkeiten und Rechte",
        paragraphs: [
          "Vorbehaltlich des anwendbaren Rechts können Sie Auskunft, Berichtigung, Löschung, Einschränkung, Übertragbarkeit oder Widerspruch verlangen; eine Einwilligung widerrufen; sich abmelden; oder sich bei der zuständigen Datenschutzbehörde beschweren. Bestimmte Unterlagen müssen aufgrund gesetzlicher Pflichten oder Ansprüche aufbewahrt werden. Wir können Ihre Identität prüfen, bevor wir tätig werden.",
        ],
      },
      {
        heading: "8. Sicherheit und Cookies",
        paragraphs: [
          "Wir verwenden verschlüsselte Übertragung, eingeschränkte Serverzugangsdaten, signierte Zahlungs- und Nachrichten-Webhooks, Audit-Ereignisse und Zugriffskontrollen. Kein System ist frei von Risiken. Die Website nutzt notwendige Speicherung für Sprache, Design, Sicherheit und Administrationssitzungen; optionale Analysefunktionen sollten nur im Einklang mit den geltenden Einwilligungsanforderungen aktiviert werden.",
        ],
      },
      {
        heading: "9. Kinder und Änderungen",
        paragraphs: [
          "Unsere Leistungen richten sich nicht an Kinder. Wir können diese Erklärung aktualisieren und werden das Datum des Inkrafttretens angeben; wesentliche Änderungen werden mitgeteilt, soweit dies angemessen ist.",
        ],
      },
    ],
  },
};

const pt: DeepPartial<LegalCopy> = {
  terms: {
    intro:
      "Os presentes Termos regem as marcações e subscrições prestadas pela Dar Tahara em Marrocos. Ao pagar uma avaliação inicial da casa ou ao aceitar uma subscrição, o cliente aceita estes Termos e o resumo da encomenda apresentado antes do pagamento.",
    opening: [
      {
        heading: "1. Avaliação inicial da casa",
        paragraphs: [
          "A avaliação inicial da casa é obrigatória antes do início de qualquer serviço recorrente. Trata-se de um serviço autónomo, único e pré-pago, que inclui uma visita profissional, a verificação das informações da casa, um perfil de limpeza e, na medida razoavelmente exequível durante a visita atribuída, uma limpeza inicial. O pagamento reserva a marcação solicitada, mas fica sujeito à nossa confirmação de agendamento.",
          "A taxa de avaliação não constitui um pagamento de subscrição nem garante a aprovação de serviço recorrente. Se a área declarada, o estado, os requisitos de acesso, as condições de segurança ou a carga de trabalho diferirem substancialmente da marcação, podemos propor uma taxa adicional de limpeza profunda, propor um preço recorrente revisto ou recusar a prestação continuada.",
        ],
      },
      {
        heading: "2. Informações do cliente e acesso",
        paragraphs: [
          "O cliente deve fornecer informações corretas sobre o imóvel, contactos, animais, tabaco, acesso e segurança, e assegurar um acesso lícito e seguro na hora acordada. O cliente continua responsável por bens de valor, materiais perigosos, elementos instáveis e pela comunicação de riscos. As chaves ou códigos de acesso que aceitarmos são utilizados exclusivamente para a prestação do serviço e não devem ser partilhados por canais inseguros, salvo instrução expressa nossa.",
        ],
      },
    ],
    closing: [
      {
        heading: "5. Qualidade, danos e reclamações",
        paragraphs: [
          "Comunique qualquer questão relativa ao serviço ou dano alegado no prazo de 48 horas, com prova razoável, para que possamos averiguar. Quando formos responsáveis, a nossa primeira medida corretiva poderá consistir numa nova visita, reparação, substituição ou num crédito adequado. Não somos responsáveis por danos preexistentes, desgaste normal, fragilidade não comunicada, defeitos inerentes ou acontecimentos fora de controlo razoável.",
        ],
      },
      {
        heading: "6. Responsabilidade",
        paragraphs: [
          "Nada exclui a responsabilidade que não possa ser legalmente excluída. Sem prejuízo dessa regra, a nossa responsabilidade global decorrente de um serviço está limitada ao montante pago pelo serviço em causa ou, no caso de uma reclamação relativa a subscrição, às quantias pagas nos três meses anteriores. Não respondemos por perdas comerciais indiretas.",
        ],
      },
      {
        heading: "7. Comunicações e utilização aceitável",
        paragraphs: [
          "Podemos enviar mensagens de correio eletrónico e de WhatsApp de caráter operacional sobre pedidos, pagamentos, avaliações, propostas e renovações. O cliente não deve utilizar indevidamente o nosso sítio, o nosso pessoal, o assistente de mensagens ou os sistemas de pagamento. As respostas automatizadas constituem informação geral sobre o serviço; o Dar Tahara Support confirma acordos excecionais.",
        ],
      },
      {
        heading: "8. Privacidade, alterações e lei aplicável",
        paragraphs: [
          "A nossa política de privacidade explica o tratamento de dados pessoais. Podemos atualizar estes Termos com efeitos futuros; a versão aceite no momento do pagamento fica registada com a sua marcação. Estes Termos regem-se pela lei marroquina e os litígios ficam sujeitos aos tribunais marroquinos competentes, salvo se normas imperativas de defesa do consumidor dispuserem de outro modo.",
        ],
      },
    ],
  },
  privacy: {
    intro:
      "A Dar Tahara é responsável pelos dados pessoais descritos nesta política. Este aviso aplica-se ao nosso sítio, à lista de contactos, às avaliações iniciais de casa, às subscrições, ao correio eletrónico operacional e às comunicações por WhatsApp.",
    opening: [
      {
        heading: "1. Dados que recolhemos",
        paragraphs: [
          "Recolhemos dados de identidade e contacto; identificadores de faturação e estado do pagamento (os dados do cartão permanecem na Stripe); moradas de serviço; área declarada e verificada, divisões, estado, animais, tabaco, acesso e notas de cuidado; escolhas de marcação; observações da avaliação; propostas de subscrição, subscrições e faturas; comunicações; aceitações legais; e dados de segurança como endereço IP, agente de utilizador e registos de webhooks.",
        ],
      },
      {
        heading: "2. Porque utilizamos os dados",
        paragraphs: [
          "Tratamos dados para executar diligências solicitadas antes do contrato, realizar avaliações e subscrições, cobrar pagamentos, planear pessoal, manter a segurança e a qualidade do serviço, responder a pedidos, prevenir fraude, conservar registos financeiros e de consentimento, cumprir a lei e defender pretensões jurídicas. As comunicações de marketing só são enviadas quando existe consentimento ou outro fundamento lícito, e pode cancelar a subscrição a qualquer momento.",
        ],
      },
      {
        heading: "3. Assistente de WhatsApp e respostas automatizadas",
        paragraphs: [
          "Quando escreve para o nosso número de WhatsApp Business, a Meta trata a mensagem e nós podemos classificar automaticamente o respetivo idioma e tema para dar uma resposta das perguntas frequentes. O conteúdo da conversa, o número de telefone, o idioma detetado e o estado de entrega podem ser registados. Pode pedir um especialista a qualquer momento. As respostas automatizadas não tomam decisões de elegibilidade, preço ou de natureza contratual.",
        ],
      },
      {
        heading: "4. Prestadores de serviços e transferências internacionais",
        paragraphs: [
          "Recorremos a prestadores selecionados, incluindo a Supabase para dados da aplicação, a Stripe para pagamentos e faturas, a Resend ou prestador equivalente para correio eletrónico, a Meta para o WhatsApp e a Cloudflare para proteção contra bots. Os prestadores atuam ao abrigo dos seus próprios termos e compromissos de proteção de dados. Quando os dados atravessam fronteiras, utilizamos um mecanismo de transferência lícito disponível e garantias proporcionadas.",
          "Algumas páginas carregam pequenas imagens ilustrativas de terceiros. Os nossos formulários mostram bandeiras de países fornecidas pela flagcdn.com; o pedido necessário para obter uma imagem torna o seu endereço IP e os dados do navegador visíveis para esse prestador. Não são enviados com ele quaisquer dados introduzidos no formulário, contactos ou informações de conta, e estas imagens servem apenas para apresentação.",
        ],
      },
      {
        heading: "5. Conservação",
        paragraphs: [
          "As marcações abandonadas e não pagas são normalmente eliminadas ou anonimizadas no prazo de 90 dias. Os registos operacionais de clientes são conservados enquanto a relação estiver ativa e, em regra, até cinco anos depois; as faturas e os registos contabilísticos legalmente exigidos podem ser conservados por mais tempo. As mensagens de apoio são normalmente conservadas durante dois anos. Os dados da lista de contactos são conservados até ao cancelamento ou até a lista ser descontinuada. Os registos de segurança são conservados apenas pelo tempo razoavelmente necessário.",
        ],
      },
      {
        heading: "6. Partilha e confidencialidade",
        paragraphs: [
          "Os dados só são partilhados com pessoal e subcontratantes que deles necessitem para a prestação, com consultores profissionais, ou quando a lei, a segurança ou uma operação societária o exijam. Não vendemos dados pessoais. O acesso do pessoal é baseado em funções e o acesso à base de dados do lado do cliente é restringido por segurança ao nível da linha.",
        ],
      },
      {
        heading: "7. As suas escolhas e direitos",
        paragraphs: [
          "Sem prejuízo da lei aplicável, pode solicitar acesso, retificação, apagamento, limitação, portabilidade ou oposição; retirar o consentimento; cancelar a subscrição; ou apresentar reclamação junto da autoridade de proteção de dados competente. Alguns registos têm de ser conservados por obrigações legais ou por causa de reclamações. Podemos verificar a identidade antes de atuar.",
        ],
      },
      {
        heading: "8. Segurança e cookies",
        paragraphs: [
          "Utilizamos transporte cifrado, credenciais de servidor restritas, webhooks de pagamento e de mensagens assinados, eventos de auditoria e controlos de acesso. Nenhum sistema está isento de risco. O sítio utiliza armazenamento essencial para idioma, tema, segurança e sessões de administração; as estatísticas opcionais só devem ser ativadas em conformidade com os requisitos de consentimento aplicáveis.",
        ],
      },
      {
        heading: "9. Crianças e alterações",
        paragraphs: [
          "Os nossos serviços não se dirigem a crianças. Podemos atualizar esta política e indicaremos a data de entrada em vigor; as alterações substanciais serão comunicadas quando adequado.",
        ],
      },
    ],
  },
};

const ar: DeepPartial<LegalCopy> = {
  terms: {
    intro:
      "تحكم هذه الشروط الحجوزات والاشتراكات التي تقدّمها دار طهارة في المغرب. وبأداء ثمن المعاينة الأولى للمنزل أو بقبول اشتراك، فإنك توافق على هذه الشروط وعلى ملخّص الطلب المعروض قبل الأداء.",
    opening: [
      {
        heading: "1. المعاينة الأولى للمنزل",
        paragraphs: [
          "المعاينة الأولى للمنزل إلزامية قبل بدء أي خدمة متكررة. وهي خدمة مستقلة تُؤدَّى مرة واحدة ويُسدَّد ثمنها مسبقًا، وتشمل زيارة مهنية، والتحقق من معطيات المنزل، وإعداد ملف للتنظيف، وكذلك تنظيفًا أوليًا في حدود ما يمكن إنجازه بشكل معقول خلال الزيارة المخصَّصة. ويحجز الأداء الموعد المطلوب، لكنه يظل رهينًا بتأكيدنا للجدولة.",
          "رسوم المعاينة ليست أداءً للاشتراك ولا تضمن الموافقة على الخدمة المتكررة. وإذا اختلفت المساحة المصرَّح بها أو الحالة أو متطلبات الوصول أو ظروف السلامة أو حجم العمل اختلافًا جوهريًا عمّا ورد في الحجز، جاز لنا اقتراح رسوم إضافية لتنظيف عميق، أو اقتراح ثمن متكرر معدَّل، أو رفض الاستمرار في تقديم الخدمة.",
        ],
      },
      {
        heading: "2. معطيات العميل والوصول",
        paragraphs: [
          "يجب عليك تقديم معطيات صحيحة عن العقار ووسائل الاتصال والحيوانات الأليفة والتدخين والوصول والسلامة، وضمان وصول مشروع وآمن في الوقت المتفق عليه. وتبقى مسؤولاً عن الأشياء الثمينة والمواد الخطرة والتجهيزات غير المستقرة والإفصاح عن المخاطر. أما المفاتيح أو رموز الولوج التي نتسلّمها فتُستعمل حصريًا لتقديم الخدمة، ولا يجوز تبادلها عبر قنوات غير آمنة إلا إذا طلبنا منك ذلك صراحةً.",
        ],
      },
    ],
    closing: [
      {
        heading: "5. الجودة والأضرار والشكايات",
        paragraphs: [
          "يُرجى الإبلاغ عن أي ملاحظة تتعلق بالخدمة أو عن ضرر مزعوم داخل أجل 48 ساعة، مع تقديم إثبات معقول، حتى يتسنّى لنا البحث في الأمر. وحيثما تثبت مسؤوليتنا، قد يكون أول إصلاح من جانبنا زيارة جديدة أو ترميمًا أو استبدالًا أو تعويضًا ماليًا مناسبًا. ولا نتحمّل المسؤولية عن الأضرار السابقة، ولا عن التآكل العادي، ولا عن هشاشة لم يُفصح عنها، ولا عن العيوب الذاتية، ولا عن الأحداث الخارجة عن السيطرة المعقولة.",
        ],
      },
      {
        heading: "6. المسؤولية",
        paragraphs: [
          "لا يستبعد أي بند من هذه الشروط مسؤوليةً لا يجيز القانون استبعادها. ومع مراعاة هذه القاعدة، تقتصر مسؤوليتنا الإجمالية الناشئة عن خدمة ما على المبلغ المؤدَّى عن الخدمة المعنية، أو على الرسوم المؤدَّاة خلال الأشهر الثلاثة السابقة إذا تعلّقت المطالبة باشتراك. ولا نتحمّل المسؤولية عن الخسائر التجارية غير المباشرة.",
        ],
      },
      {
        heading: "7. المراسلات والاستعمال المقبول",
        paragraphs: [
          "يجوز لنا إرسال رسائل بريد إلكتروني ورسائل واتساب ذات طابع تشغيلي بخصوص الطلبات والأداءات والمعاينات والعروض والتجديدات. ولا يجوز لك إساءة استعمال موقعنا أو موظفينا أو مساعد المراسلة أو أنظمة الأداء لدينا. والأجوبة الآلية معلومات عامة عن الخدمة؛ أما الترتيبات الاستثنائية فيؤكّدها دعم دار طهارة.",
        ],
      },
      {
        heading: "8. الخصوصية والتعديلات والقانون المطبَّق",
        paragraphs: [
          "توضّح سياسة الخصوصية لدينا كيفية معالجة المعطيات الشخصية. ويجوز لنا تعديل هذه الشروط بأثر مستقبلي؛ وتُسجَّل مع حجزك النسخة التي قُبلت عند الأداء. وتخضع هذه الشروط للقانون المغربي، وتُعرض النزاعات على المحاكم المغربية المختصة، ما لم ينص قانون حماية المستهلك الآمر على خلاف ذلك.",
        ],
      },
    ],
  },
  privacy: {
    intro:
      "دار طهارة مسؤولة عن المعطيات الشخصية الموصوفة في هذه السياسة. ويسري هذا الإشعار على موقعنا وقائمتنا البريدية والمعاينات الأولى للمنازل والاشتراكات والبريد الإلكتروني التشغيلي ومراسلات واتساب.",
    opening: [
      {
        heading: "1. المعطيات التي نجمعها",
        paragraphs: [
          "نجمع معطيات الهوية والاتصال؛ ومعرّفات الفوترة وحالة الأداء (تبقى بيانات البطاقة لدى Stripe)؛ وعناوين تقديم الخدمة؛ والمساحة المصرَّح بها والمتحقَّق منها والغرف والحالة والحيوانات الأليفة والتدخين والوصول وملاحظات العناية؛ واختيارات المواعيد؛ وملاحظات المعاينة؛ وعروض الاشتراك والاشتراكات والفواتير؛ والمراسلات؛ والموافقات القانونية؛ ومعطيات الأمان مثل عنوان IP ووكيل المستعمل وسجلات الـ webhook.",
        ],
      },
      {
        heading: "2. لماذا نستعمل المعطيات",
        paragraphs: [
          "نعالج المعطيات لاتخاذ الإجراءات المطلوبة قبل التعاقد، ولإنجاز المعاينات والاشتراكات، ولتحصيل الأداء، ولجدولة الموظفين، وللحفاظ على السلامة وجودة الخدمة، وللرد على الاستفسارات، ولمنع الاحتيال، ولحفظ السجلات المالية وسجلات الموافقة، وللامتثال للقانون، وللدفاع عن المطالبات القانونية. ولا تُرسَل الرسائل التسويقية إلا حيث توجد موافقة أو أساس قانوني آخر، ويمكنك إلغاء الاشتراك في أي وقت.",
        ],
      },
      {
        heading: "3. مساعد واتساب والأجوبة الآلية",
        paragraphs: [
          "عندما تراسل رقم واتساب بزنس الخاص بنا، تعالج شركة Meta الرسالة، وقد نصنّف لغتها وموضوعها آليًا لتقديم جواب من الأسئلة الشائعة. وقد يُسجَّل محتوى المحادثة ورقم الهاتف واللغة المكتشَفة وحالة التسليم. ويمكنك طلب التحدث إلى مختص في أي وقت. ولا تتخذ الأجوبة الآلية أي قرار يتعلق بالأهلية أو الأثمان أو المسائل التعاقدية.",
        ],
      },
      {
        heading: "4. مقدّمو الخدمات والنقل الدولي",
        paragraphs: [
          "نستعين بمقدّمي خدمات مدقَّقين، من بينهم Supabase لمعطيات التطبيق، وStripe للأداءات والفواتير، وResend أو مزوّد مماثل للبريد الإلكتروني، وMeta لواتساب، وCloudflare للحماية من الروبوتات. ويعمل هؤلاء المزوّدون وفق شروطهم والتزاماتهم الخاصة بحماية المعطيات. وحين تعبر المعطيات الحدود، نعتمد آلية نقل قانونية متاحة وضمانات متناسبة.",
          "تُحمّل بعض الصفحات صورًا توضيحية صغيرة من أطراف ثالثة. وتعرض استماراتنا أعلام الدول عبر flagcdn.com؛ والطلب اللازم لجلب الصورة يجعل عنوان IP الخاص بك وتفاصيل متصفحك مرئية لذلك المزوّد. ولا تُرسَل معه أي بيانات مُدخلة في الاستمارة ولا معطيات اتصال ولا معلومات حساب، وتُستعمل هذه الصور للعرض فقط.",
        ],
      },
      {
        heading: "5. مدة الاحتفاظ",
        paragraphs: [
          "تُحذف الحجوزات المتروكة غير المؤدّى عنها أو تُجهَّل عادةً داخل أجل 90 يومًا. وتُحفظ السجلات التشغيلية للعملاء ما دامت العلاقة قائمة، وعادةً إلى غاية خمس سنوات بعدها؛ وقد تُحفظ الفواتير والوثائق المحاسبية المفروضة قانونًا مدةً أطول. وتُحفظ رسائل الدعم عادةً سنتين. وتُحفظ معطيات القائمة البريدية إلى حين إلغاء الاشتراك أو إيقاف القائمة. أما سجلات الأمان فلا تُحفظ إلا للمدة اللازمة بشكل معقول.",
        ],
      },
      {
        heading: "6. التقاسم والسرية",
        paragraphs: [
          "لا تُتقاسم المعطيات إلا مع الموظفين والمعالجين الذين يحتاجونها لتقديم الخدمة، ومع المستشارين المهنيين، أو حيث يقتضي ذلك القانون أو السلامة أو عملية تخص الشركة. ولا نبيع المعطيات الشخصية. وولوج الموظفين محدَّد حسب الأدوار، كما أن الولوج إلى قاعدة المعطيات الموجَّهة للعملاء مقيَّد بالحماية على مستوى الصفوف.",
        ],
      },
      {
        heading: "7. اختياراتك وحقوقك",
        paragraphs: [
          "مع مراعاة القانون المطبَّق، يمكنك طلب الاطلاع أو التصحيح أو الحذف أو التقييد أو النقل أو الاعتراض؛ وسحب الموافقة؛ وإلغاء الاشتراك؛ أو تقديم شكاية إلى السلطة المختصة بحماية المعطيات. غير أن بعض السجلات يجب الاحتفاظ بها بموجب التزامات قانونية أو بسبب مطالبات. وقد نتحقق من هويتك قبل التصرف.",
        ],
      },
      {
        heading: "8. الأمان وملفات تعريف الارتباط",
        paragraphs: [
          "نستعمل نقلًا مشفَّرًا، وبيانات ولوج مقيَّدة للخوادم، وwebhooks موقَّعة للأداء والمراسلة، وأحداث تدقيق، وضوابط للولوج. ولا يخلو أي نظام من المخاطر. ويستعمل الموقع تخزينًا ضروريًا للغة والمظهر والأمان وجلسات الإدارة؛ أما أدوات التحليل الاختيارية فلا ينبغي تفعيلها إلا وفق متطلبات الموافقة المطبَّقة.",
        ],
      },
      {
        heading: "9. الأطفال والتعديلات",
        paragraphs: [
          "خدماتنا ليست موجَّهة إلى الأطفال. وقد نحدّث هذه السياسة مع تحديد تاريخ السريان؛ وتُبلَّغ التعديلات الجوهرية حيثما كان ذلك مناسبًا.",
        ],
      },
    ],
  },
};

const overrides: Partial<Record<Locale, DeepPartial<LegalCopy>>> = { nl, fr, es, de, pt, ar };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, override: unknown): T {
  if (Array.isArray(base)) {
    if (!Array.isArray(override)) return base;
    return base.map((item, i) =>
      i < override.length ? deepMerge(item, override[i]) : item,
    ) as T;
  }
  if (isPlainObject(base) && isPlainObject(override)) {
    const result: Record<string, unknown> = { ...base };
    for (const key of Object.keys(base)) {
      if (key in override && override[key] !== undefined) {
        result[key] = deepMerge((base as Record<string, unknown>)[key], override[key]);
      }
    }
    return result as T;
  }
  return override === undefined ? base : (override as T);
}

const cache = new Map<Locale, LegalCopy>();

export function getLegalCopy(locale: Locale): LegalCopy {
  const hit = cache.get(locale);
  if (hit) return hit;
  const override = overrides[locale];
  const merged = override ? deepMerge(en, override) : en;
  cache.set(locale, merged);
  return merged;
}

export { overrides as legalOverrides };

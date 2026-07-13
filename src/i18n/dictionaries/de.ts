import type { DeepPartial } from "../types";
import type { Dictionary } from "./en";

/** German — complete translation. */
const de: DeepPartial<Dictionary> = {
  meta: {
    title: "Dar Tahara — Premium-Hauspflege & Immobilien-Concierge",
    description:
      "Dar Tahara ist ein Premium-Service für Hauspflege und Immobilien-Concierge in Marokko. Professionelle Reinigung, Inspektionen und Wartung, damit Sie stets in ein komfortables Zuhause zurückkehren.",
    ogAlt: "Dar Tahara — Haus der Reinheit",
  },
  brand: {
    name: "Dar Tahara",
    meaning: "Haus der Reinheit",
    tagline: "Kommen Sie immer nach Hause zum Komfort.",
  },
  nav: {
    why: "Warum Dar Tahara",
    services: "Leistungen",
    plans: "Abos",
    pricing: "Preise",
    how: "So funktioniert’s",
    gallery: "Galerie",
    faq: "FAQ",
    book: "Reinigung buchen",
    quote: "Angebot anfordern",
    menu: "Menü",
    close: "Schließen",
    language: "Sprache",
    theme: "Design",
  },
  hero: {
    eyebrow: "Hauspflege & Immobilien-Concierge",
    title: "Ihr Zuhause verdient mehr als Reinigung — es verdient außergewöhnliche Pflege.",
    subtitle:
      "Für Eigentümer, Expats und Ferienhausbesitzer in ganz Marokko. Wir reinigen, prüfen und pflegen Ihre Immobilie mit stiller Präzision — damit Sie zum Komfort zurückkehren, nie zur Sorge.",
    ctaPrimary: "Reinigung buchen",
    ctaSecondary: "Angebot anfordern",
    ctaTertiary: "Mehr erfahren",
    stat1Value: "500+",
    stat1Label: "Betreute Zuhause",
    stat2Value: "12 Jahre",
    stat2Label: "Durchschnittliche Kundentreue",
    stat3Value: "24 Std.",
    stat3Label: "Reaktionszeit",
    imageAlt: "Ein ruhiges, sonnendurchflutetes Wohnzimmer, perfekt vorbereitet",
  },
  why: {
    eyebrow: "Warum Dar Tahara",
    title: "Seelenfrieden, direkt an Ihre Tür geliefert.",
    subtitle:
      "Dar Tahara bedeutet Haus der Reinheit. Wir sind kein Reinigungsunternehmen — wir sind die vertrauensvollen Hüter Ihres Zuhauses in Ihrer Abwesenheit und der Grund, warum sich bei Ihrer Rückkehr alles mühelos anfühlt.",
    pillars: [
      {
        title: "Absolutes Vertrauen",
        body: "Geprüfte, geschulte und versicherte Fachkräfte. Diskrete Schlüsselverwahrung und volle Verantwortung bei jedem Besuch.",
      },
      {
        title: "Kompromisslose Qualität",
        body: "Ein sorgfältiger Standard für jede Oberfläche, jedes Detail — geprüft, fotografiert und abgezeichnet.",
      },
      {
        title: "Mühelos für Sie",
        body: "Ein Ansprechpartner, proaktive Updates und ein Zuhause, das einfach und in aller Ruhe bereit ist, bevor Sie ankommen.",
      },
      {
        title: "Vollständige Diskretion",
        body: "Ihr Zuhause, Ihr Zeitplan und Ihre Privatsphäre werden mit der Vertraulichkeit eines privaten Concierge behandelt.",
      },
    ],
  },
  services: {
    eyebrow: "Was wir tun",
    title: "Vollständige Pflege für jede Ecke Ihres Zuhauses.",
    subtitle:
      "Von einer einzigen makellosen Reinigung bis zur kompletten Verwaltung Ihres Ferienhauses — wählen Sie genau das, was Ihre Immobilie braucht.",
    items: [
      { title: "Premium-Reinigung", body: "Eine erlesene Reinigung von oben bis unten, abgestimmt auf edle Häuser und Oberflächen." },
      { title: "Wiederkehrende Reinigung", body: "Wöchentliche oder zweiwöchentliche Pflege, die Ihr Zuhause stets makellos hält." },
      { title: "Ein- / Auszug", body: "Eine makellose Übergabe, ob Sie ankommen, ausziehen oder zwischen Mietern wechseln." },
      { title: "Immobilien-Inspektionen", body: "Geplante Rundgänge mit Fotoberichten zum Zustand Ihres Zuhauses." },
      { title: "Wartungskontrollen", body: "Proaktive Prüfungen von Sanitär, Geräten und Sicherheit, bevor Probleme entstehen." },
      { title: "Schlüsselverwahrung", body: "Sichere, versicherte Verwahrung Ihrer Schlüssel mit protokolliertem Zugang auf Abruf." },
      { title: "Ferienhaus-Vorbereitung", body: "Ankunftsbereite Häuser: frische Wäsche, aufgefüllte Essentials, perfekte Temperatur." },
      { title: "Wäsche & Textilien", body: "Wäsche auf Hotelniveau, Bügeln und knackig frische Bettwäsche nach Wunsch." },
      { title: "Grundreinigung", body: "Eine intensive, auffrischende Reinigung für saisonale Neuanfänge und besondere Anlässe." },
      { title: "Reinigung nach Renovierung", body: "Staub, Rückstände und Schutt entfernt, um Ihren fertigen Raum zu enthüllen." },
      { title: "Notfallreinigung", body: "Schnelle Reaktion für kurzfristige Gäste, Veranstaltungen oder Unerwartetes." },
      { title: "Ferienhaus-Verwaltung", body: "Rundum-Pflege Ihres Zweitwohnsitzes, verwaltet, als wäre es unser eigenes." },
    ],
  },
  plans: {
    eyebrow: "Abo-Pakete",
    title: "Pflege in einem Rhythmus, der zu Ihrem Leben passt.",
    subtitle:
      "Einfache, transparente Pakete — pausieren, anpassen oder kündigen Sie jederzeit. Jedes Paket umfasst Inspektionsberichte und bevorzugten Support.",
    perMonthNote: "Individueller Preis je nach Wohnfläche und Bedarf.",
    mostPopular: "Am beliebtesten",
    cta: "Paket wählen",
    items: [
      {
        name: "Wöchentlich",
        tagline: "Für stets bewohnte Häuser",
        features: ["Wöchentliche Premium-Reinigung", "Bettwäschewechsel & Wäsche", "Inspektionsbericht bei jedem Besuch", "Bevorzugte Terminplanung"],
      },
      {
        name: "Zweiwöchentlich",
        tagline: "Die durchdachte Balance",
        features: ["Reinigung alle zwei Wochen", "Stichprobenartige Wartungskontrollen", "Foto-Inspektionsbericht", "Flexible Umplanung"],
      },
      {
        name: "Monatlich",
        tagline: "Für leichte Pflege",
        features: ["Monatliche Grundreinigung", "Vollständige Immobilien-Inspektion", "Saisonale Wartungsprüfung", "Persönlicher Koordinator"],
      },
      {
        name: "Individuell",
        tagline: "Ganz auf Sie zugeschnitten",
        features: ["Maßgeschneiderte Besuchsfrequenz", "Voller Concierge & Schlüsselverwahrung", "Ferienhaus-Verwaltung", "Ein Ansprechpartner"],
      },
    ],
  },
  how: {
    eyebrow: "So funktioniert’s",
    title: "Sechs ruhige Schritte zu einem Zuhause, das sich selbst pflegt.",
    steps: [
      { title: "Buchen", body: "Erzählen Sie uns in einer zweiminütigen Anfrage von Ihrem Zuhause und Ihrem Rhythmus." },
      { title: "Wir kommen", body: "Ein Koordinator besucht Sie, um Ihren Raum und Ihre Vorlieben zu verstehen." },
      { title: "Wir reinigen", body: "Unser geschultes Team liefert jedes Mal unseren charakteristischen Standard." },
      { title: "Wir prüfen", body: "Jeder Besuch endet mit einer dokumentierten, fotografierten Inspektion." },
      { title: "Sie kommen an", body: "Kommen Sie zurück zu frischer Wäsche, ruhiger Luft und allem an seinem Platz." },
      { title: "Genießen", body: "Entspannen Sie, kommen Sie zur Ruhe und genießen Sie einfach den Komfort Ihres Zuhauses." },
    ],
  },
  audiences: {
    eyebrow: "Für wen wir sorgen",
    title: "Vertraut von Menschen, die ihre Zeit und ihr Zuhause schätzen.",
    items: [
      { title: "Menschen, die im Ausland leben", body: "Ihr marokkanisches Zuhause, makellos und bereit zwischen den Besuchen." },
      { title: "Vielbeschäftigte Berufstätige", body: "Gewinnen Sie Ihre Abende und Wochenenden zurück — wir kümmern uns um den Rest." },
      { title: "Familien", body: "Ein gesundes, makelloses Zuhause, damit Sie sich auf das Wesentliche konzentrieren können." },
      { title: "Ferienhausbesitzer", body: "Kommen Sie in ein Zuhause, in dem der Urlaub schon früh begonnen zu haben scheint." },
      { title: "Airbnb-Gastgeber", body: "Fünf-Sterne-Wechsel, Auffüllen und gästefertige Präsentation." },
      { title: "Immobilieninvestoren", body: "Werte geschützt, geprüft und gepflegt, um ihren Wert zu erhalten." },
    ],
  },
  testimonials: {
    eyebrow: "In ihren Worten",
    title: "Das stille Vertrauen eines gut gepflegten Zuhauses.",
    items: [
      {
        quote:
          "Ich lebe in Brüssel und besuche Tanger nur wenige Male im Jahr. Jetzt komme ich in ein Zuhause, das sich geliebt anfühlt. Ich mache mir nie wieder Sorgen.",
        name: "Yasmine B.",
        role: "Eigentümerin, Tanger",
      },
      {
        quote:
          "Die Inspektionsberichte sind außergewöhnlich. Fotos, Notizen, alles dokumentiert. Es fühlt sich an, als hätte man Hausverwaltung und Haushälterin in einem.",
        name: "Thomas R.",
        role: "Investor, Marrakesch",
      },
      {
        quote:
          "Unsere Airbnb-Bewertungen erwähnen jetzt in fast jedem Kommentar die Sauberkeit. Dar Tahara hat unseren Standard schlicht angehoben.",
        name: "Karim & Sofia",
        role: "Gastgeber, Casablanca",
      },
    ],
  },
  gallery: {
    eyebrow: "Vorher & nachher",
    title: "Der Unterschied liegt im Detail.",
    subtitle: "Ein Einblick in den Standard, den wir in jedes Zuhause bringen.",
    before: "Vorher",
    after: "Nachher",
    items: [
      { label: "Wohnzimmer-Restaurierung" },
      { label: "Küchen-Grundreinigung" },
      { label: "Auffrischung der Master-Suite" },
    ],
  },
  faq: {
    eyebrow: "Gut zu wissen",
    title: "Häufig gestellte Fragen",
    items: [
      {
        q: "Sind Ihre Mitarbeiter geprüft und versichert?",
        a: "Jedes Mitglied unseres Teams wird auf Vorstrafen überprüft, nach unserem Standard geschult und ist vollständig versichert. Für Kunden mit Schlüsselverwahrung führen wir eine protokollierte Verwahrkette für volle Nachvollziehbarkeit.",
      },
      {
        q: "Wie funktioniert die Schlüsselverwahrung?",
        a: "Wir bewahren Ihre Schlüssel sicher auf und betreten Ihr Zuhause nur für geplante oder genehmigte Besuche. Jedes Kommen und Gehen wird protokolliert, und Sie erhalten nach jedem Besuch einen Bericht.",
      },
      {
        q: "Können Sie mein Zuhause vor meiner Ankunft vorbereiten?",
        a: "Ja. Teilen Sie uns Ihre Ankunftsdaten mit, und wir sorgen für frische Wäsche, ein makelloses Zuhause, eine angenehme Temperatur und alle gewünschten Essentials — bereit in dem Moment, in dem Sie eintreten.",
      },
      {
        q: "Welche Städte bedienen Sie?",
        a: "Wir bedienen derzeit die großen Städte Marokkos, darunter Tanger, Casablanca, Rabat und Marrakesch, mit stetig wachsender Abdeckung. Kontaktieren Sie uns, um Ihre Region zu bestätigen.",
      },
      {
        q: "Kann ich mein Paket pausieren oder ändern?",
        a: "Immer. Die Pakete sind flexibel — pausieren Sie während Ihrer Reisen, erhöhen Sie die Frequenz für die Saison oder passen Sie Leistungen jederzeit mit einer einzigen Nachricht an.",
      },
      {
        q: "Welche Produkte verwenden Sie?",
        a: "Wir verwenden professionelle, wirksame und sorgfältig ausgewählte Produkte, mit umweltbewussten und oberflächenschonenden Optionen für empfindliche Oberflächen und sensible Haushalte auf Anfrage.",
      },
    ],
  },
  cta: {
    eyebrow: "Bereit, wenn Sie es sind",
    title: "Kommen Sie immer nach Hause zum Komfort.",
    subtitle:
      "Überlassen Sie uns die Pflege Ihres Zuhauses, damit Sie nie daran denken müssen. Buchen Sie einen ersten Besuch oder fordern Sie noch heute ein maßgeschneidertes Angebot an.",
    ctaPrimary: "Reinigung buchen",
    ctaSecondary: "Angebot anfordern",
    whatsapp: "Auf WhatsApp chatten",
  },
  calculator: {
    eyebrow: "Transparente Preise",
    title: "Schätzen Sie Ihre monatliche Pflege.",
    subtitle:
      "Bewegen Sie den Regler und wählen Sie einen Rhythmus. Ihre Schätzung aktualisiert sich sofort — keine Anmeldung, keine Überraschungen.",
    sizeLabel: "Wohnfläche",
    sizeUnit: "m²",
    sizeHelp: "Geben Sie einen Wert zwischen 20 und 250 m² ein oder schieben Sie.",
    overMax: "Meine Immobilie ist größer als 250 m²",
    frequencyLabel: "Reinigungsfrequenz",
    visitsSuffix: "pro Monat",
    recommended: "Am beliebtesten",
    noDiscount: "Kein Rabatt",
    discountLabel: "Rabatt",
    freq: {
      monthly: { name: "Einmal pro Monat", visits: "1 Besuch pro Monat", note: "Eine gründliche monatliche Auffrischung." },
      biweekly: { name: "Zweiwöchentlich", visits: "2 Besuche pro Monat", note: "Die durchdachte Balance aus Pflege und Wert." },
      weekly: { name: "Wöchentlich", visits: "4 Besuche pro Monat", note: "Immer makellos, immer bereit." },
      irregular: {
        name: "Airbnb & Vermietung",
        visits: "Preis pro Woche",
        note: "Wechselreinigung für Airbnb & Kurzzeitvermietungen. Inklusive Basismaterialien, Reinigungsmitteln und Toilettenpapier.",
      },
    },
    result: {
      heading: "Ihre Schätzung",
      propertySize: "Wohnfläche",
      pricePerCleaning: "Preis pro Reinigung",
      frequency: "Frequenz",
      visits: "Reinigungsbesuche",
      visitsValue: "{n} pro Monat",
      subtotal: "Zwischensumme vor Rabatt",
      discount: "Frequenzrabatt",
      areaSurcharge: "Zusatzfläche",
      youSave: "Sie sparen",
      monthlyTotal: "Geschätzte Monatssumme",
      perMonth: "/ Monat",
      perWeek: "/ Woche",
      pricePerWeek: "Preis pro Woche",
      effective: "Effektiver Preis pro Besuch",
    },
    custom: {
      title: "Ein außergewöhnliches Zuhause verdient ein maßgeschneidertes Angebot.",
      body: "Immobilien über 250 m² erfordern ein individuelles Angebot.",
      cta: "Individuelles Angebot anfordern",
    },
    cta: {
      book: "Buchen Sie Ihre Reinigung",
      quote: "Persönliches Angebot anfordern",
    },
    disclaimer:
      "Dies ist ein geschätzter Preis auf Basis der Wohnfläche und der gewählten Reinigungsfrequenz. Der endgültige Preis kann je nach Zustand der Immobilie, Zugänglichkeit, Zusatzleistungen und spezifischen Reinigungsanforderungen variieren.",
    optionalNote:
      "Optionale Leistungen wie Grundreinigung, Fensterreinigung, Wäsche, Bettwäschewechsel, Terrassenreinigung und Reinigung nach Bauarbeiten können separat berechnet werden.",
    materialsNote:
      "Dieses Paket enthält grundlegende Reinigungsmaterialien, Reinigungsmittel und Toilettenpapier, bei jedem Besuch aufgefüllt.",
  },
  enquiry: {
    title: "Buchen Sie Ihre Reinigung",
    quoteTitle: "Persönliches Angebot anfordern",
    subtitle: "Teilen Sie uns ein paar Angaben mit, und wir bestätigen Ihren ersten Besuch innerhalb von 24 Stunden.",
    summary: "Ihre Auswahl",
    fields: {
      name: "Vollständiger Name",
      email: "E-Mail-Adresse",
      phone: "Telefon oder WhatsApp",
      location: "Lage der Immobilie",
      size: "Wohnfläche (m²)",
      frequency: "Reinigungsfrequenz",
      startDate: "Gewünschtes Startdatum",
      message: "Nachricht (optional)",
      messagePlaceholder: "Gibt es etwas, das wir über Ihr Zuhause wissen sollten?",
    },
    required: "Erforderlich",
    invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    submitWhatsApp: "Per WhatsApp senden",
    submitEmail: "Per E-Mail senden",
    cancel: "Abbrechen",
    close: "Schließen",
    successTitle: "Vielen Dank.",
    successBody: "Ihre Angaben sind bereit zum Versand. Wählen Sie WhatsApp oder E-Mail, um Ihre Anfrage abzuschließen.",
    monthlyEstimate: "Geschätzte Monatssumme",
    customSelected: "Individuelles Angebot (über 250 m²)",
  },
  mailing: {
    popupHeadline: "Erfahren Sie als Erste von unserem Start",
    popupBody:
      "Tragen Sie sich in unsere Early-Access-Liste ein und wir informieren Sie, sobald unsere Reinigungsabos verfügbar sind.",
    emailPlaceholder: "Geben Sie Ihre E-Mail-Adresse ein",
    button: "Benachrichtigen",
    success: "Vielen Dank. Sie stehen auf der Liste und wir melden uns, sobald wir live gehen.",
    consent:
      "Mit der Anmeldung stimmen Sie zu, Start- und Service-Updates zu erhalten. Sie können sich jederzeit abmelden.",
    close: "Schließen",
    errors: {
      invalid_email: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
      rate_limited: "Zu viele Versuche. Bitte versuchen Sie es in einer Minute erneut.",
      captcha_failed: "Verifizierung fehlgeschlagen. Bitte erneut versuchen.",
      consent_required: "Bitte stimmen Sie zu, um fortzufahren.",
      server_error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es gleich erneut.",
      network: "Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
    },
    footerEyebrow: "Bald verfügbar",
    footerTitle: "Kommen Sie nach Hause zu mehr als nur einem sauberen Zuhause.",
    footerBody:
      "Hinterlassen Sie Ihre E-Mail und wir informieren Sie, sobald unsere Reinigungsabos verfügbar sind.",
    confirmedTitle: "Anmeldung bestätigt",
    confirmedBody: "Danke für die Bestätigung. Alles bereit — wir melden uns zum Start.",
    unsubscribedTitle: "Sie wurden abgemeldet",
    unsubscribedBody: "Sie erhalten keine Start-Updates mehr. Sie können jederzeit wieder beitreten.",
    invalidTitle: "Link abgelaufen oder ungültig",
    invalidBody: "Dieser Link ist nicht mehr gültig. Bitte melden Sie sich erneut an, wenn Sie Updates möchten.",
    backHome: "Zurück zur Startseite",
  },
  footer: {
    tagline: "Premium-Hauspflege & Immobilien-Concierge in ganz Marokko.",
    quickLinks: "Entdecken",
    services: "Leistungen",
    contact: "Kontakt",
    email: "Schreiben Sie uns",
    whatsapp: "WhatsApp",
    call: "Rufen Sie uns an",
    followUs: "Folgen Sie uns",
    rights: "Alle Rechte vorbehalten.",
    terms: "AGB",
    privacy: "Datenschutz",
    madeWith: "Mit Sorgfalt in Marokko gestaltet.",
    newsletterTitle: "Kommen Sie nach Hause zu mehr als nur einem sauberen Zuhause.",
    newsletterBody: "Gelegentliche Tipps zur Pflege Ihres Zuhauses. Kein Rauschen.",
    newsletterPlaceholder: "Ihre E-Mail",
    newsletterCta: "Abonnieren",
  },
};

export default de;

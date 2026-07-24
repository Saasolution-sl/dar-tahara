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
    about: "Über uns",
    missionVision: "Mission & Vision",
    why: "Warum Dar Tahara",
    services: "Leistungen",
    plans: "Abos",
    pricing: "Preise",
    how: "So funktioniert’s",
    gallery: "Galerie",
    faq: "FAQ",
    book: "Ersteinschätzung buchen",
    login: "Anmelden",
    myAccount: "Mein Konto",
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
    ctaPrimary: "Ersteinschätzung buchen",
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
        body: "Ein Servicemodell mit rollenbezogener Prüfung, strukturierter Schulung, diskreter Schlüsselverwahrung und klarer Verantwortlichkeit.",
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
      { title: "Schlüsselverwahrung", body: "Sichere Verfahren zur Schlüsselverwahrung mit protokolliertem, genehmigtem Zugang." },
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
      "Einfache, transparente Pakete, deren Terminänderungen und Kündigung gemäß den Bedingungen im Kundenportal verwaltet werden. Jedes Paket umfasst Inspektionsberichte und Dar Tahara Support.",
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
      { title: "Wir reinigen", body: "Strukturierte Teamschulung soll unseren charakteristischen Standard bei jedem Einsatz unterstützen." },
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
        q: "Wie werden Mitarbeitende geprüft und Schlüssel geschützt?",
        a: "Unser Betriebsmodell sieht rollenbezogene Prüfungen und strukturierte Schulungen vor, während unsere Dienstleistungen starten und wachsen. Für Kunden mit Schlüsselverwahrung planen wir eine protokollierte Verwahrkette für klare Verantwortlichkeit.",
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
        a: "Wir konzentrieren uns derzeit auf Tétouan, Tanger, Meknès und Casablanca, mit stetig wachsender Abdeckung. Kontaktieren Sie uns, um Ihre Region zu bestätigen.",
      },
      {
        q: "Kann ich mein Paket pausieren, ändern oder kündigen?",
        a: "Abonnements können nicht pausiert werden. Zulässige Terminänderungen und die Kündigung verwalten Sie im Kundenportal: mindestens 48 Stunden für einen Termin und einen Monat für die Kündigung gemäß den Bedingungen.",
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
    ctaPrimary: "Ersteinschätzung buchen",
    whatsapp: "Auf WhatsApp chatten",
    whatsappInfo: "Chatten Sie mit dem Dar Tahara-Assistenten auf WhatsApp über Leistungen, Preise, Abonnements, Objektzugang und Buchungen. Komplexe Supportanfragen können per E-Mail an Dar Tahara Support übergeben werden.",
    whatsappPrivacy: "Dies ist ein automatisierter Assistent. Senden Sie keine Zahlungsdaten, Passwörter oder vollständigen Zugangscodes.",
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
      title: "Ein außergewöhnliches Zuhause verdient eine individuelle Bewertung.",
      body: "Immobilien über 250 m² werden vor einem Servicevorschlag individuell geprüft.",
      cta: "Bewertung beantragen",
    },
    cta: {
      book: "Ersteinschätzung buchen",
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
  booking: {
    title: "Buchen Sie Ihre erste Wohnungsbewertung",
    subtitle:
      "Ihr erster Besuch ermöglicht uns, Ihr Zuhause professionell zu bewerten, bei Bedarf eine erste Grundreinigung durchzuführen und Ihren persönlichen Reinigungsplan zu erstellen.",
    close: "Schließen",
    pay: "Bewertungsantrag senden",
    paySecure:
      "Sichere Zahlung über Stripe. Ihr Abonnement beginnt erst, nachdem Ihre erste Wohnungsbewertung abgeschlossen und freigegeben wurde.",
    summary: {
      heading: "Ihre Auswahl",
      propertySize: "Wohnfläche",
      frequency: "Reinigungsfrequenz",
      estMonthly: "Geschätztes Monatsabo",
      assessment: "Einmalige Wohnungsbewertung",
      doorlockInstallation: "Installation eines smarten Türschlosses",
      dueToday: "Heute fällig",
      fromAfterAssessment: "Ihr endgültiger Plan wird nach der Bewertung bestätigt.",
    },
    billing: {
      label: "Bevorzugte laufende Abrechnung",
      monthly: "Monatlich",
      monthlyNote: "Jeden Monat zahlen",
      annual: "Jährlich",
      annualNote: "Einmal im Jahr zahlen",
      save: "5% sparen",
    },
    steps: { visit: "Ihr Besuch", home: "Ihr Zuhause", details: "Ihre Angaben" },
    visit: {
      preferredDate: "Wunschtermin",
      alternateDate: "Alternativtermin (optional)",
      timeSlot: "Bevorzugte Zeit",
      morning: "Vormittag",
      afternoon: "Nachmittag",
      flexible: "Flexibel",
    },
    fields: {
      size: "Wohnfläche",
      condition: "Zustand der Wohnung",
      bedrooms: "Schlafzimmer",
      bathrooms: "Badezimmer",
      accessNotes: "Zugangshinweise (optional)",
      accessNotesPlaceholder: "Parken, Schlüssel, Torcodes — alles, was wir wissen sollten",
      pets: "Es leben Haustiere in der Wohnung",
      petDetails: "Angaben zu Haustieren",
      petDetailsPlaceholder: "Art und Anzahl der Haustiere",
      smoking: "In der Wohnung wird geraucht",
      fullName: "Vollständiger Name",
      email: "E-Mail-Adresse",
      phone: "Telefon / WhatsApp",
      city: "Stadt",
      addressLine1: "Adresse",
      addressLine2: "Wohnung, Etage (optional)",
      postalCode: "Postleitzahl (optional)",
    },
    doorlock: {
      title: "Installation eines smarten Türschlosses",
      label: "Optionale Installation eines smarten Türschlosses buchen",
      body:
        "Wir können die Installation eines Wi-Fi-fähigen smarten Türschlosses für etwa 200 € während oder nach der Bewertung arrangieren.",
      benefit:
        "Ein smartes Schloss gibt dem Eigentümer mehr Flexibilität und Ruhe: niemand benötigt eine physische Schlüsselkopie und Mitarbeiterzugänge können nach jeder Reinigung deaktiviert werden.",
      internetRequired: "Das Haus muss über eine aktive Internetverbindung verfügen.",
      confirmation:
        "Ich bestätige, dass im Haus Internet für die Verbindung des smarten Schlosses verfügbar ist.",
    },
    condition: {
      excellent: "Ausgezeichnet",
      standard: "Standard",
      needs_attention: "Benötigt Aufmerksamkeit",
      heavy: "Intensive Reinigung nötig",
    },
    legal: {
      accuracy:
        "Ich bestätige, dass die obigen Angaben — Fläche, Schlafzimmer, Badezimmer, Haustiere, Rauchen und Zustand — korrekt sind.",
      termsLink: "AGB",
      privacyLink: "Datenschutz",
      note: "Dar Tahara kann diese Angaben während der Bewertung prüfen und den laufenden Plan anpassen, wenn die Wohnung wesentlich abweicht.",
    },
    errors: {
      invalid_customer: "Bitte geben Sie Ihren Namen, eine gültige E-Mail und eine Telefonnummer an.",
      invalid_property: "Bitte vervollständigen Sie Ihre Adresse und die Wohnungsangaben.",
      invalid_booking: "Bitte wählen Sie ein Datum und eine Uhrzeit für Ihren Besuch.",
      pet_details_required: "Bitte fügen Sie einige Angaben zu Ihren Haustieren hinzu.",
      doorlock_internet_required: "Bitte bestätigen Sie, dass das Haus über Internet für das smarte Türschloss verfügt.",
      legal_acceptance_required: "Bitte bestätigen Sie die Angaben und akzeptieren Sie die Bedingungen.",
      rate_limited: "Zu viele Versuche. Bitte versuchen Sie es in einer Minute erneut.",
      checkout_not_configured: "Anträge sind derzeit nicht verfügbar — melden Sie sich für Early Access an.",
      checkout_failed: "Ihr Antrag konnte nicht gesendet werden. Bitte erneut versuchen.",
      network: "Netzwerkfehler. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.",
    },
  },
  consent: {
    message:
      "Wir verwenden Analyse-Cookies, um zu verstehen, wie unsere Website genutzt wird. Bei Ablehnung ändert sich nichts — die Website funktioniert genauso.",
    accept: "Akzeptieren",
    decline: "Ablehnen",
    privacy: "Datenschutz",
    aria: "Cookie-Einwilligung",
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
  assistant: {
    chat: {
      title: "Dar Tahara Assistent",
      subtitle:
        "Hallo, ich bin der virtuelle Concierge von Dar Tahara. Ich erkläre Services, Preise, die Ersteinschätzung, Abrechnung und Buchungsschritte.",
      open: "Dar Tahara fragen",
      close: "Assistent schließen",
      placeholder: "Fragen Sie zu Preisen, Buchung oder Services…",
      send: "Senden",
      automated: "Automatischer Assistent",
      human: "Dar Tahara-Spezialist",
      error: "Entschuldigung, die Anfrage konnte nicht abgeschlossen werden. Versuchen Sie es erneut; das Gespräch wurde gespeichert.",
      quickActions: [
        "Wie funktioniert der erste Besuch?",
        "Preis berechnen",
        "Was ist enthalten?",
        "Bewertung buchen",
        "Monatlich oder jährlich?",
        "Spezialist sprechen",
      ],
    },
  },
  missionVision: {
    meta: {
      title: "Mission & Vision",
      description:
        "Dar Tahara verbindet qualifizierte Fachkräfte, innovative Technologie und transparenten Service, um die Wohnungsreinigung in Marokko neu zu definieren. Entdecken Sie unsere Mission, Vision, Werte und Versprechen.",
      ogAlt: "Dar Tahara — Mission & Vision",
    },
    breadcrumb: { home: "Startseite", current: "Mission & Vision", label: "Navigationspfad" },
    hero: {
      eyebrow: "Mission & Vision",
      title: "Sauberere Zuhause. Stärkeres Vertrauen.",
      subtitle:
        "Dar Tahara verbindet qualifizierte Fachkräfte, innovative Technologie und transparenten Service, um die Wohnungsreinigung in Marokko neu zu definieren.",
      ctaPrimary: "Ersteinschätzung buchen",
      ctaSecondary: "Unsere Leistungen entdecken",
      imageAlt: "Ein modernes marokkanisches Zuhause, gepflegt vom professionellen Team von Dar Tahara",
    },
    mission: {
      eyebrow: "Unsere Mission",
      title: "Ein sauberes Zuhause schafft Ruhe.",
      lead: "Unsere Mission ist es, zuverlässige, transparente und technologiegestützte Reinigungsdienste anzubieten, die die Lebensqualität jedes Kunden verbessern.",
      body: [
        "Wir glauben, dass ein sauberes Zuhause innere Ruhe schafft.",
        "Indem wir strukturierte Teamschulung mit intelligenter Technologie, Qualitätskontrolle und außergewöhnlichem Kundenservice verbinden, wollen wir das vertrauenswürdigste Premium-Reinigungsunternehmen Marokkos werden.",
      ],
    },
    vision: {
      eyebrow: "Unsere Vision",
      title: "Ein neuer Maßstab für Haushaltsdienste in Marokko.",
      lead: "Das führende technologiegestützte Haushaltsdienstleistungsunternehmen Marokkos werden und dabei neue Maßstäbe für Vertrauen, Professionalität, Sicherheit und Kundenerlebnis setzen.",
      body: [
        "Unsere langfristige Vision ist es, in ganz Marokko zu wachsen und zugleich kontinuierlich in Innovation, die Entwicklung unserer Mitarbeitenden und nachhaltige Abläufe zu investieren.",
      ],
    },
    values: {
      eyebrow: "Unsere Grundwerte",
      title: "Die Prinzipien hinter jedem Einsatz.",
      subtitle:
        "Sechs Verpflichtungen, die prägen, wie wir einstellen, schulen und Ihr Zuhause pflegen.",
      items: [
        { title: "Vertrauen", body: "Wir gewinnen Vertrauen durch Ehrlichkeit, Transparenz und Verlässlichkeit." },
        { title: "Qualität", body: "Jeder Einsatz soll denselben hohen Standard erfüllen." },
        { title: "Respekt", body: "Wir respektieren unsere Kunden, ihr Zuhause und unsere Mitarbeitenden." },
        {
          title: "Innovation",
          body: "Technologie soll sowohl das Kundenerlebnis als auch die Effizienz der Mitarbeitenden verbessern.",
        },
        {
          title: "Professionalität",
          body: "Wir bekennen uns zu strukturierter, kontinuierlicher Teamschulung als Grundlage für außergewöhnlichen Service.",
        },
        {
          title: "Nachhaltigkeit",
          body: "Wir reduzieren fortlaufend Abfall und wählen, wo immer möglich, umweltverantwortliche Verfahren.",
        },
      ],
    },
    promises: {
      eyebrow: "Unsere Versprechen",
      title: "Worauf sich jeder Kunde verlassen kann.",
      subtitle: "Klare Zusagen, in jedem Zuhause und bei jedem Besuch gleichermaßen eingehalten.",
      items: [
        {
          title: "Wir versprechen Professionalität",
          body: "Unser Ziel ist, dass jede Reinigungskraft eine strukturierte Schulung abschließt, bevor sie das Zuhause eines Kunden betritt.",
        },
        {
          title: "Wir versprechen Transparenz",
          body: "Keine versteckten Kosten, klare Preise, digitale Rechnungen und transparente Kommunikation.",
        },
        {
          title: "Wir versprechen Sicherheit",
          body: "Privatsphäre und Eigentum unserer Kunden werden mit größter Sorgfalt behandelt.",
        },
        {
          title: "Wir versprechen Verlässlichkeit",
          body: "Wir kommen vorbereitet, folgen strukturierten Abläufen und überwachen die Servicequalität fortlaufend.",
        },
        {
          title: "Wir versprechen Innovation",
          body: "Wir investieren in Technologie, die Planung, Kommunikation, Qualitätssicherung und Kundenzufriedenheit verbessert.",
        },
        {
          title: "Wir versprechen kontinuierliche Verbesserung",
          body: "Kundenfeedback wird unsere Prozesse und unseren Ansatz zur Entwicklung der Mitarbeitenden mitgestalten.",
        },
      ],
    },
    inclusion: {
      eyebrow: "Gleichstellung, Vielfalt & Inklusion",
      title: "Talent, Engagement und Professionalität zählen am meisten.",
      body: [
        "Bei Dar Tahara sind wir überzeugt, dass Talent, Engagement und Professionalität am meisten zählen.",
        "Wir setzen uns für Chancengleichheit unabhängig von Geschlecht, Alter, Herkunft, Religion, Behinderung oder Lebensweg ein.",
        "Wir bauen einen inklusiven Arbeitsplatz auf, der auf Würde, Fairness und gegenseitigem Respekt beruht.",
        "Unser Ziel ist, dass Entscheidungen zu Einstellung, Schulung und Karriereentwicklung auf Eignung, Leistung und Potenzial beruhen.",
        "Indem wir Vielfalt und Inklusion leben, bauen wir stärkere Teams, stärkere Gemeinschaften und bessere Kundenerlebnisse auf.",
      ],
    },
    people: {
      eyebrow: "Unser Team",
      title: "Unser Bekenntnis zu verantwortungsvoller Beschäftigung.",
      subtitle:
        "Wir setzen uns für einen Arbeitsplatz ein, der auf Würde, Fairness, Transparenz und beruflicher Entwicklung beruht.",
      items: [
        {
          title: "Formelle Arbeitsverhältnisse",
          body: "Wir arbeiten auf formelle und ordnungsgemäß dokumentierte Arbeitsverhältnisse für berechtigte Teammitglieder hin.",
        },
        {
          title: "Registrierung bei der CNSS",
          body: "Mit dem Wachstum unseres Betriebs arbeiten wir darauf hin, berechtigte Beschäftigte beim marokkanischen Nationalen Sozialversicherungsfonds (Caisse Nationale de Sécurité Sociale — CNSS) anzumelden, im Einklang mit den gesetzlichen und arbeitsrechtlichen Anforderungen.",
        },
        {
          title: "Anwendbarer AMO-Krankenversicherungsschutz",
          body: "Unser Umsetzungsziel umfasst den anwendbaren Schutz der obligatorischen Krankenversicherung (Assurance Maladie Obligatoire — AMO) für berechtigte Beschäftigte über das CNSS-System.",
        },
        {
          title: "Klare Arbeitsbedingungen",
          body: "Wir arbeiten auf klare Verantwortlichkeiten und Arbeitsbedingungen hin, die auf Würde, Fairness und Transparenz beruhen.",
        },
        {
          title: "Strukturierte Entwicklung",
          body: "Unser Beschäftigungsmodell entsteht rund um strukturierte Schulung und berufliche Entwicklung.",
        },
        {
          title: "Sichere Arbeitsmethoden",
          body: "Wir streben sichere Arbeitsmethoden und eine für jede Rolle geeignete Ausrüstung an.",
        },
        {
          title: "Chancengleichheit",
          body: "Wir setzen uns für Chancengleichheit auf der Grundlage von Eignung, Leistung und Potenzial ein.",
        },
        {
          title: "Respektvoller Umgang",
          body: "Jedes Teammitglied soll mit Würde und gegenseitigem Respekt behandelt werden.",
        },
      ],
      clarification:
        "Unsere Beschäftigungspraktiken und Leistungen werden je nach Rolle, Beschäftigungsstatus, Anspruchsberechtigung, Betriebsphase und anwendbarem marokkanischem Recht umgesetzt.",
    },
    impact: {
      eyebrow: "Gesellschaftlicher Beitrag",
      title: "Verantwortungsvolle Beschäftigung aufbauen.",
      subtitle:
        "Dar Tahara möchte in den Gemeinschaften, in denen wir tätig sind, sinnvolle und professionell organisierte Beschäftigung schaffen. Wir investieren in strukturierte Schulungen, sichere Arbeitspraktiken, berufliche Entwicklung und respektvolle Arbeitsbeziehungen.",
      items: [
        "Mit dem Wachstum unseres Betriebs bauen wir auf ein formelles Beschäftigungsmodell hin, in dem berechtigte Teammitglieder über das marokkanische CNSS-Sozialversicherungssystem angemeldet werden und den anwendbaren AMO-Krankenversicherungsschutz erhalten, im Einklang mit den gesetzlichen und arbeitsrechtlichen Anforderungen.",
        "Unser Ziel ist es, die Standards in einer Branche anzuheben, in der informelle und nicht gemeldete Arbeit weiterhin verbreitet ist, und zugleich sicherere, stabilere und lohnendere Chancen für unsere Teams zu schaffen.",
      ],
    },
    comparison: {
      eyebrow: "Warum Dar Tahara?",
      title: "Ein anderer Servicestandard.",
      subtitle:
        "Der Unterschied zwischen einer klassischen Reinigungsabsprache und einem modernen, technologiegestützten Haushaltsdienst.",
      traditionalTitle: "Klassisches Reinigungsunternehmen",
      brandTitle: "Dar Tahara",
      traditional: [
        "Schwankende Servicequalität",
        "Barzahlungen",
        "Eingeschränkte Kommunikation",
        "Manuelle Verwaltung",
        "Kein Kundenportal",
        "Keine KI-Unterstützung",
        "Kaum Qualitätskontrolle",
        "Minimale Transparenz",
      ],
      brand: [
        "Leistungen im Abonnement",
        "Digitales Kundenportal",
        "KI-gestützter Kundenservice",
        "Digitale Qualitätskontrolle",
        "Online-Rechnungen",
        "Professionelle Terminplanung",
        "Technologiegestützte Abläufe",
        "Transparente Kommunikation",
        "Bekenntnis zu strukturierter Teamschulung",
        "Verantwortungsvolles Beschäftigungsmodell im Aufbau",
        "Modernes Kundenerlebnis",
      ],
    },
    sustainability: {
      eyebrow: "Nachhaltigkeit",
      title: "Fortschritt, der den Planeten respektiert.",
      subtitle:
        "Umweltverantwortung ist fest darin verankert, wie wir planen, reinigen und verwalten.",
      items: [
        { title: "Klügere Routen", body: "Optimierte Routenplanung, um unnötige Fahrten zu reduzieren." },
        {
          title: "Verantwortungsvolle Mittel",
          body: "Wo immer möglich umweltverantwortliche Reinigungsmittel.",
        },
        { title: "Papierlos gedacht", body: "Papierlose Verwaltung über digitale Systeme." },
        { title: "Weniger Abfall", body: "Effiziente Abläufe, die Abfall auf ein Minimum reduzieren." },
        {
          title: "Langfristige Investition",
          body: "Kontinuierliche Investition in nachhaltige Geschäftspraktiken.",
        },
      ],
    },
    closing: {
      eyebrow: "Mehr als Reinigung",
      title: "Mehr als Reinigung",
      body: [
        "Dar Tahara schafft einen neuen Maßstab für die Wohnungsreinigung in Marokko.",
        "Indem wir qualifizierte Fachkräfte, innovative Technologie und echte Fürsorge für unsere Kunden verbinden, liefern wir mehr als ein sauberes Zuhause — wir liefern Ruhe.",
      ],
      ctaPrimary: "Buchen Sie Ihre Ersteinschätzung",
      ctaSecondary: "Unsere Leistungen entdecken",
    },
    teaser: {
      eyebrow: "Warum Dar Tahara?",
      title: "Mehr als Reinigung.",
      body: "Qualifizierte Fachkräfte, innovative Technologie und transparenter Service — vereint, um die Wohnungsreinigung in Marokko neu zu definieren.",
      cta: "Unsere Mission & Vision lesen",
      points: [
        "Technologiegestützte Abläufe",
        "Transparente Preise im Abonnement",
        "Bekenntnis zu strukturierter Teamschulung",
      ],
    },
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
    madeWith: "Crafted with care by SaaSolution SL.",
    newsletterTitle: "Kommen Sie nach Hause zu mehr als nur einem sauberen Zuhause.",
    newsletterBody: "Gelegentliche Tipps zur Pflege Ihres Zuhauses. Kein Rauschen.",
    newsletterPlaceholder: "Ihre E-Mail",
    newsletterCta: "Abonnieren",
  },
};

export default de;

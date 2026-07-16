import type { Locale } from "@/i18n/config";
import type { RetrievedKnowledge } from "./types";

type LocalizedArticle = { title: string; content: string };
type LocalizedArticles = Partial<Record<string, LocalizedArticle>>;

const LOCALIZED_ARTICLES: Partial<Record<Locale, LocalizedArticles>> = {
  nl: {
    "company-overview": {
      title: "Over Dar Tahara",
      content: "Dar Tahara biedt premium woningonderhoud en property-conciergediensten in Marokko voor huiseigenaren, expats, gezinnen, short-stayhosts en eigenaren van vakantiewoningen. De diensten omvatten professionele schoonmaak, woninginspecties, voorbereiding van woningen, linnen- en wasservice, sleutelbeheer en doorlopend onderhoud via een abonnement. Dar Tahara richt zich momenteel op Tanger, Casablanca, Rabat en Marrakesh. Deel uw stad, zodat het team de beschikbaarheid kan bevestigen.",
    },
    "initial-home-assessment": {
      title: "Initiële Woningbeoordeling",
      content: "De Initiële Woningbeoordeling is een vooraf betaald kennismakingsbezoek. Dar Tahara controleert de woninggegevens en de staat van de woning en maakt een persoonlijk schoonmaakplan. Een abonnement start pas na goedkeuring door het team, uw uitdrukkelijke akkoord en een geslaagde betaling. Als de woning duidelijk afwijkt van de opgegeven informatie, kan Dar Tahara een aangepast voorstel doen.",
    },
    "pricing-rules": {
      title: "Prijsindicaties en woninggrootte",
      content: "Dar Tahara berekent een maandelijkse prijsindicatie op basis van de woninggrootte en de gekozen schoonmaakfrequentie. Bedragen vóór de Initiële Woningbeoordeling zijn schattingen. Het definitieve abonnement kan veranderen als de staat, toegankelijkheid, grootte of gewenste diensten afwijken van de verstrekte informatie. Voor woningen boven de limiet van de online calculator is een persoonlijke offerte nodig.",
    },
    "billing-monthly-annual": {
      title: "Maandelijkse en jaarlijkse betaling",
      content: "Een maandelijks abonnement wordt iedere maand automatisch verlengd volgens de abonnementsvoorwaarden. Een jaarabonnement wordt voor één jaar vooruitbetaald en geeft 5% korting. Annulering, terugbetaling en verlenging volgen altijd de goedgekeurde Algemene Voorwaarden.",
    },
    "payments-stripe": {
      title: "Veilig betalen via Stripe",
      content: "Dar Tahara gebruikt Stripe Checkout voor veilige betalingen. Afhankelijk van uw apparaat, bank en locatie kunnen kaarten, Apple Pay, Google Pay en geschikte lokale betaalmethoden beschikbaar zijn. Deel nooit volledige kaartnummers, CVC-codes, wachtwoorden of gevoelige documenten in de chat.",
    },
    "included-services": {
      title: "Wat is inbegrepen in de woningservice",
      content: "Dar Tahara biedt premium schoonmaak, periodieke schoonmaak, afgesproken dieptereiniging, woninginspecties, voorbereiding van woningen, sleutelbeheer, linnen- en wasservice en voorbereiding voor vakantie- of short-staywoningen. Professionele basisschoonmaakmiddelen, benodigdheden en toiletpapier kunnen inbegrepen zijn als dit in uw plan staat. Specialistische middelen, extra dieptereiniging, schoonmaak na bouwwerkzaamheden, ramen, terrassen, wasgoed, linnenwissels en conciergediensten kunnen afzonderlijke bevestiging of prijsstelling vereisen.",
    },
    "access-presence-keys": {
      title: "Toegang tot de woning en sleutelbeheer",
      content: "U hoeft bij gewone bezoeken niet altijd thuis te zijn, maar Dar Tahara heeft wel bevestigde, veilige toegang nodig. Toegangsinstructies kunnen parkeerinformatie, poortcodes, sleutelinstructies of informatie over de ingang bevatten. Bij het eerste bezoek is uw aanwezigheid aanbevolen als de woning bijzondere vereisten heeft. Fysieke sleutels worden met een geregistreerde bewaarketen opgeslagen; voor administratie, veilige opslag en verzekeringseisen kunnen extra beheerkosten en aparte voorwaarden gelden. Waar geschikt adviseert Dar Tahara een TTLock-compatibel slim Wi-Fi-slot; installatie kan tijdens of na de beoordeling voor ongeveer €200 worden geregeld en vereist internet in de woning.",
    },
    "reschedule-cancel-pause": {
      title: "Verzetten, annuleren en pauzeren",
      content: "U kunt vragen om een afspraak te verzetten of een abonnement te annuleren of te pauzeren. Wijzigingen met gevolgen moeten via een gevalideerde functie of een Dar Tahara-specialist worden uitgevoerd. De assistent kan het proces uitleggen, maar kan niet zelfstandig een terugbetaling goedkeuren, een betaalde dienst annuleren of een afspraak wijzigen.",
    },
    "human-handoff": {
      title: "Wanneer een specialist helpt",
      content: "Een Dar Tahara-specialist neemt het over wanneer u om een medewerker vraagt, wanneer goedgekeurde informatie ontbreekt, bij lage zekerheid, betwiste kosten, terugbetalingsbeslissingen, schade- of veiligheidsklachten, juridische kwesties, herhaalde fouten of handmatige boekingshulp.",
    },
    "privacy-boundaries": {
      title: "Privacy en identiteitscontrole",
      content: "Algemene vragen kunnen zonder inloggen worden beantwoord. Persoonlijke boekings-, betalings- of abonnementsgegevens mogen pas worden gedeeld nadat uw identiteit veilig is gecontroleerd. De assistent deelt nooit gegevens van een andere klant.",
    },
  },
  fr: {
    "company-overview": {
      title: "Présentation de Dar Tahara",
      content: "Dar Tahara propose au Maroc des services haut de gamme d’entretien du domicile et de conciergerie immobilière aux propriétaires, expatriés, familles, hôtes de courte durée et propriétaires de résidences secondaires. Les services comprennent le nettoyage professionnel, les inspections, la préparation du logement, le linge, la blanchisserie, la gestion des clés et l’entretien régulier par abonnement. Dar Tahara intervient principalement à Tanger, Casablanca, Rabat et Marrakech. Indiquez votre ville afin que l’équipe confirme la disponibilité.",
    },
    "initial-home-assessment": {
      title: "Évaluation Initiale du Domicile",
      content: "L’Évaluation Initiale du Domicile est une visite d’intégration prépayée. Dar Tahara vérifie les informations et l’état du logement, puis prépare un plan de nettoyage personnalisé. Aucun abonnement ne commence avant l’approbation de l’équipe, votre accord explicite et la réussite du paiement. Si le logement diffère sensiblement des informations fournies, Dar Tahara peut proposer une offre révisée.",
    },
    "pricing-rules": {
      title: "Estimations tarifaires et surface du logement",
      content: "Dar Tahara estime le prix mensuel selon la surface du logement et la fréquence de nettoyage choisie. Les montants affichés avant l’Évaluation Initiale du Domicile restent des estimations. L’abonnement final peut changer si l’état, l’accès, la surface ou les services demandés diffèrent des informations fournies. Les logements dépassant la limite du calculateur en ligne nécessitent un devis personnalisé.",
    },
    "billing-monthly-annual": {
      title: "Facturation mensuelle et annuelle",
      content: "La formule mensuelle est facturée chaque mois et se renouvelle selon les conditions de l’abonnement. La formule annuelle est payée à l’avance pour un an et comprend une remise de 5 %. Les annulations, remboursements et renouvellements suivent toujours les Conditions Générales approuvées.",
    },
    "payments-stripe": {
      title: "Paiement sécurisé avec Stripe",
      content: "Dar Tahara utilise Stripe Checkout pour sécuriser les paiements. Selon votre appareil, votre banque et votre localisation, les cartes, Apple Pay, Google Pay et certains moyens de paiement locaux peuvent être proposés. Ne communiquez jamais dans le chat un numéro de carte complet, un cryptogramme, un mot de passe ou un document sensible.",
    },
    "included-services": {
      title: "Services d’entretien inclus",
      content: "Dar Tahara propose le nettoyage haut de gamme et récurrent, le nettoyage approfondi convenu, les inspections, la préparation du logement, la garde des clés, le linge, la blanchisserie et la préparation des locations de courte durée. Les produits professionnels de base, les fournitures et le papier toilette peuvent être inclus lorsque votre formule le prévoit. Les produits spécialisés, travaux supplémentaires, vitres, terrasses, lessive, changements de linge et services de conciergerie peuvent nécessiter une confirmation ou une tarification séparée.",
    },
    "access-presence-keys": {
      title: "Accès au logement et gestion des clés",
      content: "Vous ne devez pas toujours être présent lors des visites régulières, mais Dar Tahara doit disposer d’un accès confirmé et sécurisé. Les consignes peuvent inclure le stationnement, les codes d’entrée, les clés ou l’accès à l’immeuble. Votre présence est recommandée lors de la première visite si le logement a des besoins particuliers. Les clés physiques sont conservées avec une chaîne de garde enregistrée ; des frais de gestion et des conditions séparées peuvent s’appliquer pour l’administration, le stockage sécurisé et l’assurance. Lorsque cela convient, Dar Tahara recommande une serrure Wi-Fi compatible TTLock et peut organiser son installation pour environ 200 € pendant ou après l’évaluation ; une connexion internet active est nécessaire.",
    },
    "reschedule-cancel-pause": {
      title: "Reporter, annuler ou suspendre",
      content: "Vous pouvez demander le report d’une visite, l’annulation ou la suspension d’un abonnement. Les changements ayant des conséquences doivent passer par une fonction validée ou un spécialiste Dar Tahara. L’assistant peut expliquer la procédure, mais ne peut pas approuver seul un remboursement, annuler une prestation payée ou modifier un rendez-vous.",
    },
    "human-handoff": {
      title: "Quand faire appel à un spécialiste",
      content: "Un spécialiste Dar Tahara intervient lorsque vous demandez une personne, lorsque les informations approuvées sont insuffisantes, en cas de faible certitude, de paiement contesté, de décision de remboursement, de plainte liée à un dommage ou à la sécurité, de question juridique, d’échecs répétés ou d’intervention manuelle sur une réservation.",
    },
    "privacy-boundaries": {
      title: "Confidentialité et vérification d’identité",
      content: "Les questions générales peuvent être traitées sans authentification. Les informations personnelles de réservation, paiement ou abonnement ne peuvent être communiquées qu’après une vérification sécurisée de votre identité. L’assistant ne divulgue jamais les données d’un autre client.",
    },
  },
  es: {
    "company-overview": {
      title: "Información sobre Dar Tahara",
      content: "Dar Tahara ofrece en Marruecos servicios prémium de cuidado del hogar y conserjería de propiedades para propietarios, expatriados, familias, anfitriones de corta estancia y dueños de viviendas vacacionales. Los servicios incluyen limpieza profesional, inspecciones, preparación de la vivienda, ropa de cama, lavandería, gestión de llaves y cuidado periódico mediante suscripción. Dar Tahara se centra actualmente en Tánger, Casablanca, Rabat y Marrakech. Indique su ciudad para que el equipo confirme la disponibilidad.",
    },
    "initial-home-assessment": {
      title: "Evaluación Inicial de la Vivienda",
      content: "La Evaluación Inicial de la Vivienda es una visita de incorporación prepagada. Dar Tahara comprueba los datos y el estado de la vivienda y prepara un plan de limpieza personalizado. La suscripción no comienza hasta contar con la aprobación del equipo, su aceptación explícita y un pago correcto. Si la vivienda difiere de forma importante de la información facilitada, Dar Tahara puede presentar una propuesta actualizada.",
    },
    "pricing-rules": {
      title: "Estimaciones de precio y tamaño de la vivienda",
      content: "Dar Tahara estima el precio mensual según el tamaño de la vivienda y la frecuencia de limpieza seleccionada. Los importes mostrados antes de la Evaluación Inicial son estimaciones. La suscripción final puede cambiar si el estado, el acceso, el tamaño o los servicios solicitados difieren de la información facilitada. Las viviendas que superan el límite de la calculadora en línea necesitan un presupuesto personalizado.",
    },
    "billing-monthly-annual": {
      title: "Facturación mensual y anual",
      content: "La modalidad mensual se cobra cada mes y se renueva según las condiciones de suscripción. La modalidad anual se paga por adelantado durante un año e incluye un 5 % de descuento. Las cancelaciones, los reembolsos y las renovaciones se rigen siempre por los Términos y Condiciones aprobados.",
    },
    "payments-stripe": {
      title: "Pago seguro con Stripe",
      content: "Dar Tahara utiliza Stripe Checkout para realizar pagos seguros. Según el dispositivo, el banco y la ubicación, pueden estar disponibles tarjetas, Apple Pay, Google Pay y métodos de pago locales compatibles. Nunca comparta en el chat números completos de tarjeta, códigos CVC, contraseñas ni documentos sensibles.",
    },
    "included-services": {
      title: "Servicios incluidos en el cuidado del hogar",
      content: "Dar Tahara ofrece limpieza prémium y periódica, limpieza profunda acordada, inspecciones, preparación de la vivienda, custodia de llaves, ropa de cama, lavandería y preparación de viviendas vacacionales o de corta estancia. Los productos profesionales básicos, suministros y papel higiénico pueden estar incluidos cuando así lo indique su plan. Los productos especializados, trabajos adicionales, ventanas, terrazas, lavandería, cambios de ropa de cama y servicios de conserjería pueden requerir confirmación o precio por separado.",
    },
    "access-presence-keys": {
      title: "Acceso a la vivienda y gestión de llaves",
      content: "No siempre es necesario que esté en casa durante las visitas periódicas, pero Dar Tahara necesita un acceso confirmado y seguro. Las instrucciones pueden incluir aparcamiento, códigos de entrada, llaves o acceso al edificio. Se recomienda estar disponible durante la primera visita si la vivienda tiene requisitos especiales. Las llaves físicas se guardan con una cadena de custodia registrada; pueden aplicarse una tarifa adicional de gestión y condiciones separadas por administración, almacenamiento seguro y requisitos del seguro. Cuando sea adecuado, Dar Tahara recomienda una cerradura Wi-Fi compatible con TTLock y puede organizar la instalación por unos 200 € durante o después de la evaluación; la vivienda necesita conexión a internet.",
    },
    "reschedule-cancel-pause": {
      title: "Reprogramación, cancelación y pausa",
      content: "Puede solicitar reprogramar una visita, cancelar o pausar una suscripción. Los cambios con consecuencias deben realizarse mediante una función validada o un especialista de Dar Tahara. El asistente puede explicar el proceso, pero no puede aprobar por sí solo un reembolso, cancelar un servicio pagado ni modificar una cita.",
    },
    "human-handoff": {
      title: "Cuándo interviene un especialista",
      content: "Un especialista de Dar Tahara interviene cuando solicita hablar con una persona, cuando falta información aprobada, existe poca certeza, se disputa un cargo, hace falta decidir un reembolso, hay una queja por daños o seguridad, una cuestión legal, fallos repetidos o una reserva requiere intervención manual.",
    },
    "privacy-boundaries": {
      title: "Privacidad y verificación de identidad",
      content: "Las preguntas generales pueden responderse sin autenticación. Los datos personales de reservas, pagos o suscripciones solo pueden compartirse después de verificar su identidad de forma segura. El asistente nunca revela información de otro cliente.",
    },
  },
  de: {
    "company-overview": {
      title: "Über Dar Tahara",
      content: "Dar Tahara bietet in Marokko hochwertige Hauspflege und Immobilien-Concierge-Dienste für Eigentümer, Expats, Familien, Kurzzeitvermieter und Besitzer von Ferienhäusern. Dazu gehören professionelle Reinigung, Hausinspektionen, Vorbereitung der Immobilie, Wäsche- und Bettwäsche-Service, Schlüsselverwaltung und laufende Betreuung im Abonnement. Dar Tahara konzentriert sich derzeit auf Tanger, Casablanca, Rabat und Marrakesch. Teilen Sie uns Ihre Stadt mit, damit das Team die Verfügbarkeit bestätigen kann.",
    },
    "initial-home-assessment": {
      title: "Ersteinschätzung des Hauses",
      content: "Die Ersteinschätzung ist ein vorausbezahlter Einführungstermin. Dar Tahara prüft die Angaben und den Zustand der Immobilie und erstellt einen persönlichen Reinigungsplan. Ein Abonnement beginnt erst nach Freigabe durch das Team, Ihrer ausdrücklichen Zustimmung und erfolgreicher Zahlung. Weicht die Immobilie wesentlich von den Angaben ab, kann Dar Tahara ein aktualisiertes Angebot erstellen.",
    },
    "pricing-rules": {
      title: "Preisschätzungen und Wohnungsgröße",
      content: "Dar Tahara schätzt den monatlichen Preis anhand der Wohnungsgröße und der gewählten Reinigungshäufigkeit. Vor der Ersteinschätzung angezeigte Beträge sind Schätzungen. Das endgültige Abonnement kann sich ändern, wenn Zustand, Zugang, Größe oder gewünschte Leistungen von den Angaben abweichen. Immobilien oberhalb der Grenze des Online-Rechners benötigen ein individuelles Angebot.",
    },
    "billing-monthly-annual": {
      title: "Monatliche und jährliche Abrechnung",
      content: "Die monatliche Option wird jeden Monat berechnet und gemäß den Abonnementbedingungen verlängert. Die jährliche Option wird für ein Jahr im Voraus bezahlt und enthält 5 % Rabatt. Kündigungen, Erstattungen und Verlängerungen richten sich immer nach den genehmigten Geschäftsbedingungen.",
    },
    "payments-stripe": {
      title: "Sichere Zahlung mit Stripe",
      content: "Dar Tahara nutzt Stripe Checkout für sichere Zahlungen. Je nach Gerät, Bank und Standort können Karten, Apple Pay, Google Pay und geeignete lokale Zahlungsmethoden verfügbar sein. Senden Sie im Chat niemals vollständige Kartennummern, CVC-Codes, Passwörter oder vertrauliche Dokumente.",
    },
    "included-services": {
      title: "Leistungen der Hauspflege",
      content: "Dar Tahara bietet hochwertige und regelmäßige Reinigung, vereinbarte Tiefenreinigung, Hausinspektionen, Vorbereitung der Immobilie, Schlüsselaufbewahrung, Bettwäsche, Wäscheservice sowie die Vorbereitung von Ferien- und Kurzzeitunterkünften. Professionelle Grundreinigungsmittel, Verbrauchsmaterial und Toilettenpapier können enthalten sein, wenn Ihr Plan dies vorsieht. Spezialprodukte, Zusatzarbeiten, Fenster, Terrassen, Wäsche, Bettwäschewechsel und Concierge-Leistungen können eine separate Bestätigung oder Preisangabe erfordern.",
    },
    "access-presence-keys": {
      title: "Zugang zur Immobilie und Schlüsselverwaltung",
      content: "Bei regelmäßigen Besuchen müssen Sie nicht immer zu Hause sein, Dar Tahara benötigt jedoch einen bestätigten und sicheren Zugang. Hinweise können Parkmöglichkeiten, Torcodes, Schlüssel oder den Gebäudeeingang betreffen. Beim ersten Besuch wird Ihre Anwesenheit empfohlen, wenn besondere Anforderungen bestehen. Physische Schlüssel werden mit dokumentierter Verwahrungskette gelagert; für Verwaltung, sichere Aufbewahrung und Versicherungsanforderungen können zusätzliche Gebühren und separate Bedingungen gelten. Wo geeignet, empfiehlt Dar Tahara ein TTLock-kompatibles WLAN-Smart-Lock und kann die Installation während oder nach der Bewertung für etwa 200 € organisieren; im Haus ist eine aktive Internetverbindung erforderlich.",
    },
    "reschedule-cancel-pause": {
      title: "Verschieben, kündigen und pausieren",
      content: "Sie können um die Verschiebung eines Termins sowie um Kündigung oder Pausierung eines Abonnements bitten. Änderungen mit Folgen müssen über eine geprüfte Funktion oder einen Dar Tahara-Spezialisten erfolgen. Der Assistent kann den Ablauf erklären, aber nicht eigenständig Erstattungen genehmigen, bezahlte Leistungen kündigen oder Termine ändern.",
    },
    "human-handoff": {
      title: "Wann ein Spezialist übernimmt",
      content: "Ein Dar Tahara-Spezialist übernimmt, wenn Sie einen Menschen wünschen, genehmigtes Wissen fehlt, die Sicherheit der Antwort niedrig ist, eine Zahlung bestritten wird, eine Erstattung entschieden werden muss, eine Schadens- oder Sicherheitsbeschwerde vorliegt, es um rechtliche Fragen, wiederholte Fehler oder manuelle Buchungshilfe geht.",
    },
    "privacy-boundaries": {
      title: "Datenschutz und Identitätsprüfung",
      content: "Allgemeine Fragen können ohne Anmeldung beantwortet werden. Persönliche Buchungs-, Zahlungs- oder Abonnementdaten dürfen erst nach sicherer Prüfung Ihrer Identität mitgeteilt werden. Der Assistent gibt niemals Daten anderer Kunden weiter.",
    },
  },
  pt: {
    "company-overview": {
      title: "Sobre a Dar Tahara",
      content: "A Dar Tahara presta em Marrocos serviços premium de cuidado da casa e concierge de propriedades para proprietários, expatriados, famílias, anfitriões de curta duração e donos de casas de férias. Os serviços incluem limpeza profissional, inspeções, preparação da casa, roupa de cama, lavandaria, gestão de chaves e cuidado contínuo por subscrição. Atualmente, a Dar Tahara concentra-se em Tânger, Casablanca, Rabat e Marraquexe. Indique a sua cidade para a equipa confirmar a disponibilidade.",
    },
    "initial-home-assessment": {
      title: "Avaliação Inicial da Casa",
      content: "A Avaliação Inicial da Casa é uma visita de integração pré-paga. A Dar Tahara verifica os dados e o estado da casa e prepara um plano de limpeza personalizado. A subscrição só começa após aprovação da equipa, a sua aceitação explícita e o pagamento bem-sucedido. Se a casa diferir significativamente das informações fornecidas, a Dar Tahara poderá apresentar uma proposta atualizada.",
    },
    "pricing-rules": {
      title: "Estimativas de preço e tamanho da casa",
      content: "A Dar Tahara estima o preço mensal com base no tamanho da casa e na frequência de limpeza escolhida. Os valores apresentados antes da Avaliação Inicial são estimativas. A subscrição final pode mudar se o estado, o acesso, o tamanho ou os serviços pretendidos diferirem das informações fornecidas. Casas acima do limite da calculadora online necessitam de um orçamento personalizado.",
    },
    "billing-monthly-annual": {
      title: "Faturação mensal e anual",
      content: "A opção mensal é cobrada todos os meses e renova-se de acordo com as condições da subscrição. A opção anual é paga antecipadamente por um ano e inclui 5% de desconto. Cancelamentos, reembolsos e renovações seguem sempre os Termos e Condições aprovados.",
    },
    "payments-stripe": {
      title: "Pagamento seguro com Stripe",
      content: "A Dar Tahara utiliza o Stripe Checkout para pagamentos seguros. Dependendo do dispositivo, banco e localização, podem estar disponíveis cartões, Apple Pay, Google Pay e métodos de pagamento locais elegíveis. Nunca envie no chat números completos de cartão, códigos CVC, palavras-passe ou documentos sensíveis.",
    },
    "included-services": {
      title: "Serviços incluídos no cuidado da casa",
      content: "A Dar Tahara oferece limpeza premium e recorrente, limpeza profunda acordada, inspeções, preparação da casa, guarda de chaves, roupa de cama, lavandaria e preparação de alojamentos de férias ou curta duração. Produtos profissionais básicos, consumíveis e papel higiénico podem estar incluídos quando o seu plano o indicar. Produtos especializados, trabalhos adicionais, janelas, terraços, lavandaria, mudanças de roupa de cama e serviços de concierge podem exigir confirmação ou preço separado.",
    },
    "access-presence-keys": {
      title: "Acesso à casa e gestão de chaves",
      content: "Nem sempre precisa de estar em casa nas visitas regulares, mas a Dar Tahara necessita de acesso confirmado e seguro. As instruções podem incluir estacionamento, códigos de portão, chaves ou entrada do edifício. Recomenda-se a sua presença na primeira visita se a casa tiver requisitos especiais. As chaves físicas são guardadas com cadeia de custódia registada; podem aplicar-se uma taxa adicional de gestão e condições separadas para administração, armazenamento seguro e requisitos de seguro. Quando adequado, a Dar Tahara recomenda uma fechadura Wi-Fi compatível com TTLock e pode organizar a instalação por cerca de 200 € durante ou após a avaliação; a casa necessita de internet ativa.",
    },
    "reschedule-cancel-pause": {
      title: "Reagendar, cancelar e pausar",
      content: "Pode pedir para reagendar uma visita, cancelar ou pausar uma subscrição. Alterações com consequências têm de ser efetuadas por uma função validada ou por um especialista da Dar Tahara. O assistente pode explicar o processo, mas não pode aprovar sozinho um reembolso, cancelar um serviço pago ou alterar uma marcação.",
    },
    "human-handoff": {
      title: "Quando intervém um especialista",
      content: "Um especialista da Dar Tahara intervém quando pede uma pessoa, quando falta informação aprovada, a certeza é baixa, uma cobrança é contestada, é necessária uma decisão de reembolso, existe uma reclamação de dano ou segurança, uma questão jurídica, falhas repetidas ou uma reserva exige intervenção manual.",
    },
    "privacy-boundaries": {
      title: "Privacidade e verificação de identidade",
      content: "As perguntas gerais podem ser respondidas sem autenticação. Os dados pessoais de reservas, pagamentos ou subscrições só podem ser partilhados depois de a sua identidade ser verificada com segurança. O assistente nunca divulga dados de outro cliente.",
    },
  },
  ar: {
    "company-overview": {
      title: "نبذة عن دار طهارة",
      content: "تقدم دار طهارة في المغرب خدمات راقية للعناية بالمنازل وإدارة العقارات للمالكين والمغتربين والعائلات ومضيفي الإقامات القصيرة وأصحاب بيوت العطلات. تشمل الخدمات التنظيف المهني وفحص المنزل وتجهيزه والعناية بالمفروشات والغسيل وإدارة المفاتيح والعناية المستمرة عبر الاشتراك. تركز دار طهارة حالياً على طنجة والدار البيضاء والرباط ومراكش. أخبرنا بمدينتك لكي يؤكد الفريق توفر الخدمة.",
    },
    "initial-home-assessment": {
      title: "التقييم الأولي للمنزل",
      content: "التقييم الأولي للمنزل هو زيارة تمهيدية مدفوعة مسبقاً. تتحقق دار طهارة من بيانات المنزل وحالته وتعد خطة تنظيف مخصصة. لا يبدأ أي اشتراك قبل موافقة الفريق وقبولك الصريح ونجاح الدفع. إذا اختلف المنزل بشكل واضح عن المعلومات المقدمة، فقد تقدم دار طهارة عرض خدمة محدثاً.",
    },
    "pricing-rules": {
      title: "تقدير السعر ومساحة المنزل",
      content: "تقدر دار طهارة سعر الاشتراك الشهري حسب مساحة المنزل وتكرار التنظيف المختار. الأسعار المعروضة قبل التقييم الأولي هي تقديرية. قد يتغير الاشتراك النهائي إذا اختلفت حالة المنزل أو سهولة الوصول أو المساحة أو الخدمات المطلوبة عن المعلومات المقدمة. المنازل التي تتجاوز حد الحاسبة الإلكترونية تحتاج إلى عرض سعر مخصص.",
    },
    "billing-monthly-annual": {
      title: "الفوترة الشهرية والسنوية",
      content: "يتم تحصيل الاشتراك الشهري كل شهر ويتجدد وفق شروط الاشتراك. يُدفع الاشتراك السنوي مقدماً لمدة سنة ويتضمن خصماً بنسبة 5%. تخضع الإلغاءات والمبالغ المستردة والتجديدات دائماً للشروط والأحكام المعتمدة.",
    },
    "payments-stripe": {
      title: "الدفع الآمن عبر Stripe",
      content: "تستخدم دار طهارة خدمة Stripe Checkout للدفع الآمن. بحسب الجهاز والبنك والموقع، قد تتوفر البطاقات وApple Pay وGoogle Pay ووسائل دفع محلية مؤهلة. لا ترسل أبداً رقم البطاقة كاملاً أو رمز CVC أو كلمة المرور أو وثائق حساسة عبر الدردشة.",
    },
    "included-services": {
      title: "الخدمات المشمولة في العناية بالمنزل",
      content: "تقدم دار طهارة التنظيف الراقي والدوري والتنظيف العميق المتفق عليه وفحص المنزل وتجهيزه وحفظ المفاتيح والعناية بالمفروشات والغسيل وتجهيز بيوت العطلات والإقامات القصيرة. قد تشمل الخطة مواد التنظيف المهنية الأساسية والمستلزمات وورق الحمام عندما ينص العرض على ذلك. قد تحتاج المنتجات المتخصصة والأعمال الإضافية والنوافذ والشرفات والغسيل وتغيير المفروشات وخدمات الكونسيرج إلى تأكيد أو تسعير منفصل.",
    },
    "access-presence-keys": {
      title: "الدخول إلى المنزل وإدارة المفاتيح",
      content: "لا يلزم أن تكون في المنزل دائماً أثناء الزيارات الدورية، لكن دار طهارة تحتاج إلى طريقة دخول مؤكدة وآمنة. قد تشمل التعليمات موقف السيارة أو رمز البوابة أو المفاتيح أو مدخل المبنى. يُستحسن حضورك في الزيارة الأولى إذا كانت للمنزل متطلبات خاصة. تُحفظ المفاتيح الفعلية بسجل عهدة موثق، وقد تُطبق رسوم إدارة إضافية وشروط منفصلة للإدارة والتخزين الآمن ومتطلبات التأمين. عند ملاءمة المنزل، توصي دار طهارة بقفل ذكي يعمل بالـ Wi-Fi ومتوافق مع TTLock، ويمكن ترتيب تركيبه بحوالي 200 يورو أثناء التقييم أو بعده، مع ضرورة توفر اتصال إنترنت فعال في المنزل.",
    },
    "reschedule-cancel-pause": {
      title: "تغيير الموعد والإلغاء والتوقيف المؤقت",
      content: "يمكنك طلب تغيير موعد أو إلغاء اشتراك أو توقيفه مؤقتاً. يجب تنفيذ التغييرات التي تترتب عليها آثار عبر وظيفة موثقة أو مختص من دار طهارة. يستطيع المساعد شرح الإجراءات، لكنه لا يستطيع وحده الموافقة على استرداد مبلغ أو إلغاء خدمة مدفوعة أو تغيير موعد.",
    },
    "human-handoff": {
      title: "متى يتدخل المختص",
      content: "يتدخل مختص من دار طهارة عندما تطلب التحدث إلى شخص، أو لا تتوفر معلومات معتمدة كافية، أو تكون الثقة منخفضة، أو يوجد اعتراض على رسوم، أو يلزم قرار بشأن استرداد مبلغ، أو توجد شكوى عن ضرر أو سلامة، أو مسألة قانونية، أو أخطاء متكررة، أو حجز يحتاج إلى تدخل يدوي.",
    },
    "privacy-boundaries": {
      title: "الخصوصية والتحقق من الهوية",
      content: "يمكن الإجابة عن الأسئلة العامة دون تسجيل الدخول. لا تُشارك بيانات الحجز أو الدفع أو الاشتراك الشخصية إلا بعد التحقق الآمن من هويتك. لا يكشف المساعد أبداً بيانات عميل آخر.",
    },
  },
};

function articleSlug(item: RetrievedKnowledge): string {
  const sourcePrefix = "Supabase knowledge_entries:";
  return item.article.source.startsWith(sourcePrefix)
    ? item.article.source.slice(sourcePrefix.length)
    : item.article.id;
}

export function localizeRetrievedKnowledge(
  retrieved: RetrievedKnowledge[],
  locale: Locale,
): RetrievedKnowledge[] {
  if (locale === "en") return retrieved;
  return retrieved.map((item) => {
    if (item.article.language === locale) return item;
    const localized = LOCALIZED_ARTICLES[locale]?.[articleSlug(item)];
    if (!localized) return item;
    return {
      ...item,
      article: {
        ...item.article,
        language: locale,
        title: localized.title,
        summary: localized.content.slice(0, 240),
        content: localized.content,
      },
    };
  });
}

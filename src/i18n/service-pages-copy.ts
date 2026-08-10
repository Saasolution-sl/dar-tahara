import type { Locale } from "./config";
import type { DeepPartial } from "./types";
import {
  servicePages,
  type ServicePage,
  type ServicePageSlug,
} from "@/lib/service-pages";

/**
 * Localized service-page copy.
 *
 * The English source of truth stays in `@/lib/service-pages`; this file holds
 * per-locale overrides that are deep-merged over it, exactly like the main
 * dictionaries. Before this existed all seven locales served the English text
 * under a localized `lang` attribute and hreflang set, which gave 42 URLs only
 * six distinct pages' worth of content and duplicate titles seven ways.
 *
 * Fields are translated, not transliterated: the Moroccan climate, coastal
 * humidity and owner-abroad framing matter more to a Dutch or French reader
 * than a literal rendering would.
 */
type ServicePagesCopy = Record<ServicePageSlug, DeepPartial<ServicePage>>;

const nl: ServicePagesCopy = {
  "premium-cleaning": {
    eyebrow: "Premium schoonmaak",
    title: "Een hogere standaard van woningverzorging, door mensen die trots zijn op het detail.",
    summary:
      "Premium schoonmaak bij Dar Tahara betekent opgeleide, zorgvuldig geselecteerde medewerkers van wie wordt verwacht dat zij verder gaan dan een oppervlakkige beurt en de woning met discretie, initiatief en consistentie verzorgen.",
    intro:
      "Dar Tahara is gebouwd voor klanten die meer willen dan een schoonmaker die een afvinklijst afwerkt. Onze premium schoonmaak richt zich op vertrouwen, presentatie, detail en de kleine handelingen die een huis werkelijk verzorgd laten aanvoelen.",
    sections: [
      {
        title: "Zorgvuldig geselecteerde medewerkers",
        body: "Wij hechten groot belang aan de kwaliteit van de mensen die uw woning betreden. Teamleden worden geselecteerd op professionaliteit, betrouwbaarheid, discretie en de bereidheid net dat stapje extra te zetten.",
      },
      {
        title: "Meer dan zichtbare oppervlakken",
        body: "De dienst omvat zowel de zichtbare schoonmaakstandaard als de details die het gevoel van de woning bepalen: presentatie, frisheid, orde, zorgvuldige omgang met materialen en aandacht voor terugkerende probleemplekken.",
      },
      {
        title: "Een premium, gastklare afwerking",
        body: "Voor woningen die familie, gasten of kortverblijvers ontvangen is het doel een rustige, verzorgde en direct bruikbare omgeving in plaats van een gehaaste basisbeurt.",
      },
    ],
    highlights: [
      "Professionele medewerkers van Dar Tahara",
      "Detailgerichte schoonmaak en presentatie",
      "Geschikt voor privéwoningen, vakantiehuizen en premium verhuur",
      "Verzorgingsnormen verfijnd na de eerste woninginspectie",
    ],
  },
  "recurring-cleaning": {
    eyebrow: "Terugkerende schoonmaak",
    title: "Consistent onderhoud voor woningen die regelmatig aandacht nodig hebben.",
    summary:
      "Terugkerende schoonmaak houdt de woning op peil, zeker in kustgebieden waar zilte lucht, vocht en schimmelrisico om nauwere opvolging vragen.",
    intro:
      "Sommige woningen hebben meer nodig dan een incidentele opfrisbeurt. Panden dicht bij de kust, in vochtige gebieden of woningen die tussen bezoeken gesloten blijven, kunnen last krijgen van schimmel, stofophoping en zoutaanslag. Terugkerende schoonmaak geeft het huis een betrouwbaar ritme van zorg.",
    sections: [
      {
        title: "Gebouwd voor het Marokkaanse klimaat",
        body: "Woningen aan de kust vragen soms extra aandacht omdat zilte lucht en vocht invloed hebben op oppervlakken, ramen, badkamers, kasten en ventilatie. Het terugkerende plan helpt deze zaken te signaleren en beheersen voordat ze groter worden.",
      },
      {
        title: "Een woning die klaar blijft",
        body: "Regelmatige bezoeken houden frisheid, orde en hygiëne op peil, zodat het pand tussen verblijven of drukke periodes niet terugvalt.",
      },
      {
        title: "Bijgesteld na de inspectie",
        body: "De eerste woninginspectie bepaalt de juiste frequentie en aandachtspunten. Wijkt het pand wezenlijk af van de opgegeven gegevens, dan kan Dar Tahara een aangepast plan voorstellen.",
      },
    ],
    highlights: [
      "Maandelijkse, tweewekelijkse, wekelijkse of op maat gemaakte zorg",
      "Aandacht voor vocht, schimmelgevoelige en door zeelucht aangetaste plekken",
      "Nuttig voor kust-, vakantie- en intensief gebruikte woningen",
      "Ondersteunt doorlopende bewaking van de staat van de woning",
    ],
  },
  "move-in-move-out": {
    eyebrow: "In- en uitverhuizen",
    title: "Een schone, rustige overdracht bij aankomst, vertrek en gastenwissel.",
    summary:
      "De in- en uitverhuisdienst is vooral nuttig voor Airbnb- en verhuurpanden, maar ook voor eigenaren van vakantiewoningen die het huis gereedmaken vóór aankomst of na vertrek.",
    intro:
      "Of een gast net vertrokken is, een nieuwe gast arriveert of u uw eigen vakantiewoning voorbereidt: het overdrachtsmoment telt. Dar Tahara helpt het pand terug te brengen in een verzorgde, gastvrije staat.",
    sections: [
      {
        title: "Airbnb- en verhuurwissels",
        body: "Voor kortverblijfpanden ondersteunt de dienst een gastklare presentatie, schoonmaak na vertrek en voorbereiding vóór de volgende aankomst.",
      },
      {
        title: "Voorbereiding van vakantiewoningen",
        body: "Voor eigenaren die Marokko af en toe bezoeken zorgt deze dienst dat het huis voorbereid aanvoelt bij aankomst en netjes wordt gereset na gebruik.",
      },
      {
        title: "Vooraf vastgelegde omvang",
        body: "De exacte omvang hangt af van grootte, staat, linnenbehoefte, timing en toegang. Extra was, linnenwissels of het aanvullen van voorraden worden apart geprijsd in het goedgekeurde voorstel.",
      },
    ],
    highlights: [
      "Nuttig voor Airbnb, verhuur en vakantiewoningen",
      "Voorbereiding bij aankomst en vertrek",
      "Gastklare schoonmaak en presentatie",
      "Optionele coördinatie van linnen, was en voorraden",
    ],
  },
  "property-inspections": {
    eyebrow: "Woninginspecties",
    title: "Een zorgvuldige controle van uw woning wanneer u er zelf niet kunt zijn.",
    summary:
      "Woninginspecties helpen schade, veranderingen en signalen van problemen op te sporen, bijvoorbeeld na een aardbeving, hevige regen, storm of een lange periode zonder bewoning.",
    intro:
      "Wanneer een pand leegstaat of de eigenaar in het buitenland is, blijven kleine problemen makkelijk onopgemerkt. De woninginspecties van Dar Tahara bieden een gestructureerde controle, zodat de woning niet onbeheerd blijft na weersinvloeden, verzakking of gastenverblijven.",
    sections: [
      {
        title: "Na bijzondere gebeurtenissen",
        body: "Inspecties zijn vooral nuttig na aardbevingen, hevige regen, stormen, lekkages, vochtpieken of andere gebeurtenissen die het pand kunnen hebben geraakt.",
      },
      {
        title: "Schade en veranderingen signaleren",
        body: "Het team controleert op zichtbare schade, waterindringing, ongewone geuren, schimmelindicatoren, defecte voorzieningen, toegangsproblemen en veranderingen die de eigenaar of een specialist moet beoordelen.",
      },
      {
        title: "Heldere rapportage",
        body: "Inspectienotities ondersteunen de afweging of onderhoud, dieptereiniging of een gespecialiseerde vakman nodig is. Dar Tahara verzint geen bevindingen en escaleert onzekere of gevoelige zaken.",
      },
    ],
    highlights: [
      "Nuttig na aardbevingen, stormen of hevige regen",
      "Controle op zichtbare schade en veranderingen",
      "Ondersteunt eigenaren die in het buitenland wonen",
      "Kan onderhoud of menselijke opvolging in gang zetten",
    ],
  },
  "maintenance-checks": {
    eyebrow: "Onderhoudscontroles",
    title: "Een regelmatige praktische controle die vermijdbare verrassingen voorkomt.",
    summary:
      "Dar Tahara kan ongeveer eens per drie maanden een standaard onderhoudscontrole uitvoeren, inclusief praktische punten zoals de controle van de airconditioning.",
    intro:
      "Onderhoudscontroles vangen zichtbare problemen op voordat ze duur of hinderlijk worden. Zij vervangen geen erkende technische servicebeurt, maar helpen eigenaren de basis in de gaten te houden.",
    sections: [
      {
        title: "Standaardcontrole per kwartaal",
        body: "Als vast ritme kan Dar Tahara ongeveer eens per drie maanden een onderhoudscontrole uitvoeren. Het precieze schema kan worden afgestemd op de woning en het abonnement.",
      },
      {
        title: "Praktische huisinstallaties",
        body: "Controles kunnen praktische observaties omvatten rond airconditioning, zichtbare lekkages, waterdruk, verlichting, apparatuur, ventilatie, deuren, ramen en andere dagelijkse systemen.",
      },
      {
        title: "Specialistisch werk blijft apart",
        body: "Wordt een technisch probleem gevonden, dan kan Dar Tahara dit melden en helpen de vervolgstappen te coördineren. De betrokken vakman prijst reparaties, servicebeurten of onderdelen apart.",
      },
    ],
    highlights: [
      "Voorgesteld elke drie maanden",
      "Inclusief praktische controles zoals observaties aan de airconditioning",
      "Helpt onderhoudsbehoefte vroeg te herkennen",
      "Specialistische reparaties worden apart geprijsd",
    ],
  },
  "key-holding": {
    eyebrow: "Sleutelbeheer",
    title: "Veilige toegangscoördinatie voor eigenaren die er niet zijn.",
    summary:
      "Dar Tahara kan de toegang tot de woning coördineren en adviseert waar passend een digitaal wifi-deurslot met TTLock-ondersteuning. Installatie is boekbaar voor circa € 200 en vereist een actieve internetverbinding in de woning.",
    intro:
      "Betrouwbare toegang is essentieel voor schoonmaak, inspecties, onderhoudscontroles en gastenvoorbereiding. Dar Tahara ondersteunt veilig sleutelbeheer en adviseert waar passend over slimmere toegangsopties.",
    sections: [
      {
        title: "Advies voor digitale toegang",
        body: "Waar de woning het toelaat, adviseren wij een digitaal wifi-deurslot met TTLock-ondersteuning. Dat maakt toegang eenvoudiger te beheren, zeker voor eigenaren in het buitenland of kortverblijfpanden.",
      },
      {
        title: "Ondersteuning bij installatie",
        body: "Wil de klant hulp bij de installatie, dan kan Dar Tahara dit regelen als aparte betaalde dienst van circa € 200. De woning moet een actieve internetverbinding hebben voor het slimme slot. Het slot, de installatie en eventuele specialistische eisen zitten niet automatisch in het schoonmaakabonnement.",
      },
      {
        title: "Toegang blijft gecontroleerd",
        body: "Of het nu met sleutels, codes of een slim slot gaat: toegang hoort gedocumenteerd te zijn, beperkt tot goedgekeurde bezoeken en discreet te worden afgehandeld.",
      },
    ],
    highlights: [
      "Veilige toegang voor schoonmaak en inspecties",
      "Waar passend een wifi-deurslot met TTLock-ondersteuning aanbevolen",
      "Installatie kan tegen een aparte vergoeding worden geregeld",
      "Nuttig voor eigenaren in het buitenland en verhuurwoningen",
    ],
  },
};

const fr: ServicePagesCopy = {
  "premium-cleaning": {
    eyebrow: "Nettoyage premium",
    title: "Un niveau d'entretien supérieur, assuré par des personnes attentives au détail.",
    summary:
      "Chez Dar Tahara, le nettoyage premium repose sur un personnel formé et soigneusement sélectionné, dont on attend qu'il aille au-delà d'un nettoyage de surface et prenne soin du logement avec discrétion, initiative et constance.",
    intro:
      "Dar Tahara s'adresse aux clients qui attendent mieux qu'un intervenant venu cocher une liste. Notre nettoyage premium met l'accent sur la confiance, la présentation, le détail et ces petits gestes qui font qu'un logement paraît véritablement entretenu.",
    sections: [
      {
        title: "Un personnel soigneusement sélectionné",
        body: "Nous accordons une grande importance à la qualité des personnes qui entrent chez vous. Les membres de l'équipe sont retenus pour leur professionnalisme, leur fiabilité, leur discrétion et leur volonté d'en faire davantage.",
      },
      {
        title: "Au-delà des surfaces visibles",
        body: "La prestation couvre le niveau de propreté visible ainsi que les détails qui façonnent l'atmosphère du logement : présentation, fraîcheur, ordre, manipulation soigneuse des matériaux et attention aux points problématiques récurrents.",
      },
      {
        title: "Une finition premium, prête à recevoir",
        body: "Pour les logements qui accueillent famille, invités ou séjours courts, l'objectif est un espace calme, soigné et immédiatement agréable, plutôt qu'un nettoyage de base expédié.",
      },
    ],
    highlights: [
      "Personnel d'entretien professionnel Dar Tahara",
      "Nettoyage et présentation axés sur le détail",
      "Adapté aux résidences privées, maisons de vacances et locations haut de gamme",
      "Standards affinés après l'évaluation initiale du logement",
    ],
  },
  "recurring-cleaning": {
    eyebrow: "Nettoyage récurrent",
    title: "Un entretien régulier pour les logements qui demandent une attention suivie.",
    summary:
      "Le nettoyage récurrent maintient le logement dans la durée, en particulier sur le littoral où l'air salin, l'humidité et les risques de moisissure exigent une vigilance accrue.",
    intro:
      "Certains logements demandent plus qu'un rafraîchissement occasionnel. Les biens proches de la côte, les zones humides ou les maisons fermées entre deux séjours peuvent développer moisissures, accumulation de poussière et dépôts salins. Le nettoyage récurrent donne au logement un rythme de soin fiable.",
    sections: [
      {
        title: "Pensé pour le climat marocain",
        body: "Les logements côtiers peuvent demander une attention supplémentaire : l'air salin et l'humidité affectent surfaces, fenêtres, salles de bains, placards et ventilation. Le plan récurrent aide à repérer et gérer ces points avant qu'ils ne s'aggravent.",
      },
      {
        title: "Un logement qui reste prêt",
        body: "Des visites régulières maintiennent fraîcheur, ordre et hygiène, pour que le bien ne régresse pas entre deux séjours ou périodes chargées.",
      },
      {
        title: "Ajusté après l'évaluation",
        body: "L'évaluation initiale du logement détermine la fréquence et les zones prioritaires. Si le bien diffère sensiblement des informations fournies, Dar Tahara peut proposer un plan révisé.",
      },
    ],
    highlights: [
      "Entretien mensuel, bimensuel, hebdomadaire ou sur mesure",
      "Attention à l'humidité, aux zones sensibles aux moisissures et à l'air salin",
      "Utile pour les logements côtiers, de vacances et fréquemment occupés",
      "Soutient un suivi continu de l'état du bien",
    ],
  },
  "move-in-move-out": {
    eyebrow: "Entrée / sortie",
    title: "Une remise des lieux propre et sereine, à l'arrivée, au départ et entre deux séjours.",
    summary:
      "Le service d'entrée / sortie est particulièrement utile pour les biens Airbnb et locatifs, mais aussi pour les propriétaires de maisons de vacances préparant le logement avant l'arrivée ou après le départ.",
    intro:
      "Qu'un voyageur vienne de partir, qu'un nouvel hôte arrive ou que vous prépariez votre propre maison de vacances, le moment de la remise compte. Dar Tahara aide à rendre au bien un état accueillant et prêt à l'usage.",
    sections: [
      {
        title: "Rotations Airbnb et locatives",
        body: "Pour les biens en séjour court, le service accompagne la présentation prête à recevoir, le nettoyage après départ et la préparation avant l'arrivée suivante.",
      },
      {
        title: "Préparation des maisons de vacances",
        body: "Pour les propriétaires qui viennent occasionnellement au Maroc, ce service garantit un logement préparé à l'arrivée et correctement remis en état après usage.",
      },
      {
        title: "Périmètre confirmé à l'avance",
        body: "Le périmètre exact dépend de la taille, de l'état, des besoins en linge, du calendrier et de l'accès. Blanchisserie, changement de linge ou réapprovisionnement supplémentaires sont facturés séparément dans la proposition validée.",
      },
    ],
    highlights: [
      "Utile pour Airbnb, locations et maisons de vacances",
      "Préparation à l'arrivée et au départ",
      "Nettoyage et présentation prêts à recevoir",
      "Coordination optionnelle du linge, de la blanchisserie et des consommables",
    ],
  },
  "property-inspections": {
    eyebrow: "Inspections du bien",
    title: "Un contrôle attentif de votre logement quand vous ne pouvez pas être présent.",
    summary:
      "Les inspections aident à repérer dégâts, changements et signes de problèmes, par exemple après un séisme, de fortes pluies, des tempêtes ou de longues périodes d'inoccupation.",
    intro:
      "Quand un bien est vide ou que le propriétaire est à l'étranger, les petits problèmes passent inaperçus. Les inspections Dar Tahara offrent un contrôle structuré, pour que le logement ne reste pas sans surveillance après un événement climatique, un mouvement du bâti ou un séjour de voyageurs.",
    sections: [
      {
        title: "Après un événement inhabituel",
        body: "Les inspections sont particulièrement utiles après séismes, fortes pluies, tempêtes, fuites, pics d'humidité ou tout événement susceptible d'avoir affecté le bien.",
      },
      {
        title: "Détection des dégâts et des changements",
        body: "L'équipe vérifie les dommages visibles, infiltrations, odeurs inhabituelles, indices de moisissure, équipements cassés, problèmes d'accès et changements devant être examinés par le propriétaire ou un spécialiste.",
      },
      {
        title: "Un compte rendu clair",
        body: "Les notes d'inspection aident à décider si un entretien, un nettoyage en profondeur ou un artisan spécialisé est nécessaire. Dar Tahara n'invente aucun constat et fait remonter les points incertains ou sensibles.",
      },
    ],
    highlights: [
      "Utile après séismes, tempêtes ou fortes pluies",
      "Contrôle des dommages visibles et des changements",
      "Accompagne les propriétaires vivant à l'étranger",
      "Peut déclencher un entretien ou un suivi humain",
    ],
  },
  "maintenance-checks": {
    eyebrow: "Contrôles d'entretien",
    title: "Un contrôle pratique régulier pour éviter les mauvaises surprises.",
    summary:
      "Dar Tahara peut réaliser un contrôle d'entretien standard environ tous les trois mois, incluant des points pratiques comme la vérification de la climatisation.",
    intro:
      "Les contrôles d'entretien repèrent les problèmes évidents avant qu'ils ne deviennent coûteux ou gênants. Ils ne remplacent pas une maintenance technique agréée, mais aident les propriétaires à surveiller l'essentiel.",
    sections: [
      {
        title: "Contrôle standard trimestriel",
        body: "Comme rythme de référence, Dar Tahara peut effectuer un contrôle d'entretien environ tous les trois mois. Le calendrier exact s'adapte au bien et à l'abonnement.",
      },
      {
        title: "Équipements du quotidien",
        body: "Les contrôles peuvent inclure des observations pratiques sur la climatisation, les fuites visibles, la pression d'eau, l'éclairage, les appareils, la ventilation, les portes, les fenêtres et les autres systèmes courants.",
      },
      {
        title: "Les interventions spécialisées restent distinctes",
        body: "Si un problème technique est identifié, Dar Tahara peut le signaler et aider à coordonner la suite, mais le prestataire concerné facture séparément réparations, entretien et pièces.",
      },
    ],
    highlights: [
      "Recommandé tous les trois mois",
      "Comprend des contrôles pratiques tels que l'observation de la climatisation",
      "Aide à identifier tôt les besoins d'entretien",
      "Réparations spécialisées facturées séparément",
    ],
  },
  "key-holding": {
    eyebrow: "Gestion des clés",
    title: "Une coordination d'accès sécurisée pour les propriétaires absents.",
    summary:
      "Dar Tahara peut coordonner l'accès au logement et recommande, lorsque c'est adapté, une serrure connectée Wi-Fi compatible TTLock. L'installation est réservable pour environ 200 € et nécessite une connexion internet active dans le logement.",
    intro:
      "Un accès fiable est essentiel pour le nettoyage, les inspections, les contrôles d'entretien et la préparation des séjours. Dar Tahara accompagne une gestion sécurisée des clés et conseille sur des solutions d'accès plus modernes lorsque c'est pertinent.",
    sections: [
      {
        title: "Recommandation d'accès numérique",
        body: "Lorsque le logement le permet, nous recommandons une serrure connectée Wi-Fi compatible TTLock. Elle simplifie la gestion des accès, notamment pour les propriétaires à l'étranger ou les biens en séjour court.",
      },
      {
        title: "Accompagnement à l'installation",
        body: "Si le client souhaite de l'aide pour l'installation, Dar Tahara peut l'organiser comme prestation payante distincte d'environ 200 €. Le logement doit disposer d'une connexion internet active pour la serrure connectée. La serrure, l'installation et d'éventuelles exigences techniques ne sont pas incluses d'office dans l'abonnement de nettoyage.",
      },
      {
        title: "L'accès reste maîtrisé",
        body: "Qu'il s'agisse de clés, de codes ou d'une serrure connectée, l'accès doit être documenté, limité aux visites approuvées et géré avec discrétion.",
      },
    ],
    highlights: [
      "Accès sécurisé pour le nettoyage et les inspections",
      "Serrure Wi-Fi compatible TTLock recommandée lorsque c'est adapté",
      "Installation organisable moyennant un supplément",
      "Utile pour les propriétaires à l'étranger et les biens locatifs",
    ],
  },
};

const ar: ServicePagesCopy = {
  "premium-cleaning": {
    eyebrow: "تنظيف راقٍ",
    title: "مستوى أرقى من العناية بالمنزل، على يد أشخاص يعتزّون بالتفاصيل.",
    summary:
      "التنظيف الراقي لدى دار طهارة يعني موظفين مدرَّبين ومختارين بعناية، يُنتظر منهم تجاوز التنظيف السطحي والاعتناء بالمنزل بتحفّظ ومبادرة واتّساق.",
    intro:
      "بُنيت دار طهارة لعملاء يريدون أكثر من عامل ينفّذ قائمة مهام. تركّز خدمة التنظيف الراقي لدينا على الثقة والمظهر والتفاصيل، وتلك اللمسات الصغيرة التي تجعل المنزل يبدو معتنى به فعلًا.",
    sections: [
      {
        title: "موظفون مختارون بعناية",
        body: "نولي أهمية كبيرة لجودة الأشخاص الذين يدخلون منزلك. يُختار أعضاء الفريق بناءً على الاحترافية والموثوقية والتحفّظ والاستعداد لبذل جهد إضافي.",
      },
      {
        title: "أبعد من الأسطح الظاهرة",
        body: "تغطي الخدمة مستوى النظافة الظاهر إضافةً إلى التفاصيل التي تصنع إحساس المنزل: المظهر والانتعاش والترتيب والتعامل الدقيق مع الأسطح والانتباه إلى المواضع المتكررة المشكلات.",
      },
      {
        title: "لمسة نهائية راقية وجاهزة للضيوف",
        body: "بالنسبة للمنازل التي تستقبل العائلة أو الضيوف أو الإقامات القصيرة، الهدف بيئة هادئة ومصقولة وجاهزة للاستمتاع، لا تنظيفًا أساسيًا مستعجلًا.",
      },
    ],
    highlights: [
      "موظفو عناية منزلية محترفون من دار طهارة",
      "تنظيف وعرض يركّزان على التفاصيل",
      "مناسب للمنازل الخاصة وبيوت العطلات والإيجارات الراقية",
      "معايير العناية تُضبط بعد المعاينة الأولى للمنزل",
    ],
  },
  "recurring-cleaning": {
    eyebrow: "تنظيف متكرر",
    title: "عناية منتظمة للمنازل التي تحتاج متابعة دورية.",
    summary:
      "يحافظ التنظيف المتكرر على المنزل مع مرور الوقت، خصوصًا في المناطق الساحلية حيث يتطلب هواء البحر المالح والرطوبة ومخاطر العفن انتباهًا أكبر.",
    intro:
      "بعض المنازل تحتاج أكثر من تجديد عرضي. العقارات القريبة من الساحل أو المناطق الرطبة أو المنازل المغلقة بين الزيارات قد تعاني من العفن وتراكم الغبار وترسّبات الملح. يمنح التنظيف المتكرر المنزل إيقاع عناية موثوقًا.",
    sections: [
      {
        title: "مصمَّم للمناخ المغربي",
        body: "قد تحتاج المنازل القريبة من الساحل انتباهًا إضافيًا لأن الهواء المالح والرطوبة يؤثران في الأسطح والنوافذ والحمامات والخزائن والتهوية. تساعد الخطة المتكررة على رصد هذه المسائل ومعالجتها قبل أن تكبر.",
      },
      {
        title: "منزل يبقى جاهزًا",
        body: "تحافظ الزيارات المنتظمة على الانتعاش والترتيب والنظافة، فلا يتراجع العقار بين الإقامات أو الفترات المزدحمة.",
      },
      {
        title: "يُعدَّل بعد المعاينة",
        body: "تساعد المعاينة الأولى للمنزل على تحديد الوتيرة المناسبة ومواضع التركيز. وإذا اختلف العقار جوهريًا عن البيانات المقدَّمة، قد توصي دار طهارة بخطة معدَّلة.",
      },
    ],
    highlights: [
      "عناية شهرية أو نصف شهرية أو أسبوعية أو مخصَّصة",
      "انتباه للرطوبة والمواضع المعرَّضة للعفن والمتأثرة بالهواء المالح",
      "مفيد للمنازل الساحلية وبيوت العطلات والمنازل كثيرة الاستعمال",
      "يدعم متابعة حالة المنزل باستمرار",
    ],
  },
  "move-in-move-out": {
    eyebrow: "الدخول والخروج",
    title: "تسليم نظيف وهادئ عند الوصول والمغادرة وتبديل الضيوف.",
    summary:
      "خدمة الدخول والخروج مفيدة بوجه خاص لعقارات Airbnb والإيجار، وكذلك لأصحاب بيوت العطلات الذين يجهّزون المنزل قبل الوصول أو بعد المغادرة.",
    intro:
      "سواء غادر ضيف للتو، أو كان ضيف جديد في الطريق، أو كنت تجهّز بيت عطلتك، فلحظة التسليم مهمة. تساعد دار طهارة على إعادة العقار إلى حالة جاهزة ومرحِّبة.",
    sections: [
      {
        title: "تبديل Airbnb والإيجارات",
        body: "بالنسبة لعقارات الإقامة القصيرة، تدعم الخدمة الجاهزية لاستقبال الضيوف والتنظيف بعد المغادرة والتحضير قبل الوصول التالي.",
      },
      {
        title: "تحضير بيوت العطلات",
        body: "لأصحاب المنازل الذين يزورون المغرب من حين لآخر، تساعد هذه الخدمة على أن يبدو المنزل مهيَّأً قبل الوصول ومرتَّبًا كما ينبغي بعد الاستعمال.",
      },
      {
        title: "نطاق يُحدَّد مسبقًا",
        body: "يعتمد النطاق الدقيق على المساحة والحالة واحتياجات المفروشات والتوقيت والوصول. أما الغسيل الإضافي أو تبديل المفروشات أو إعادة التزويد فتُسعَّر على حدة في العرض المعتمد.",
      },
    ],
    highlights: [
      "مفيد لـ Airbnb والإيجارات وبيوت العطلات",
      "تحضير عند الوصول والمغادرة",
      "تنظيف وعرض جاهزان للضيوف",
      "تنسيق اختياري للمفروشات والغسيل وإعادة التزويد",
    ],
  },
  "property-inspections": {
    eyebrow: "معاينة العقار",
    title: "فحص دقيق لمنزلك حين لا تستطيع الحضور بنفسك.",
    summary:
      "تساعد معاينات العقار على رصد الأضرار والتغيّرات وعلامات المشكلات، مثلًا بعد زلزال أو أمطار غزيرة أو عواصف أو فترات طويلة بلا سكن.",
    intro:
      "حين يكون العقار خاليًا أو المالك خارج البلاد، قد تمرّ المشكلات الصغيرة دون انتباه. توفّر معاينات دار طهارة فحصًا منظَّمًا حتى لا يبقى المنزل مهمَلًا بعد التقلبات الجوية أو حركة البناء أو إقامات الضيوف.",
    sections: [
      {
        title: "بعد الأحداث غير المعتادة",
        body: "المعاينات مفيدة بوجه خاص بعد الزلازل والأمطار الغزيرة والعواصف والتسربات وارتفاع الرطوبة أو أي حدث قد يكون أثّر في العقار.",
      },
      {
        title: "رصد الأضرار والتغيّرات",
        body: "يفحص الفريق الأضرار الظاهرة وتسرّب المياه والروائح غير المعتادة ومؤشرات العفن والتجهيزات المكسورة ومشكلات الوصول والتغيّرات التي ينبغي أن يراجعها المالك أو مختص.",
      },
      {
        title: "تقرير واضح",
        body: "تدعم ملاحظات المعاينة قرار ما إذا كانت هناك حاجة إلى صيانة أو تنظيف عميق أو مقاول مختص. ولا تختلق دار طهارة أي ملاحظات، وتُصعِّد المسائل غير المؤكدة أو الحساسة.",
      },
    ],
    highlights: [
      "مفيد بعد الزلازل والعواصف والأمطار الغزيرة",
      "فحص الأضرار الظاهرة وتغيّرات العقار",
      "يدعم المُلّاك المقيمين خارج البلاد",
      "يمكن أن يستدعي صيانة أو متابعة بشرية عند الحاجة",
    ],
  },
  "maintenance-checks": {
    eyebrow: "فحوصات الصيانة",
    title: "فحص عملي منتظم يساعد على تفادي المفاجآت.",
    summary:
      "يمكن لدار طهارة إجراء فحص صيانة قياسي مرة كل ثلاثة أشهر تقريبًا، يشمل بنودًا عملية مثل فحص التكييف.",
    intro:
      "تلتقط فحوصات الصيانة المشكلات الواضحة قبل أن تصبح مكلفة أو مزعجة. وهي ليست بديلًا عن الصيانة التقنية المعتمدة، لكنها تساعد المُلّاك على متابعة الأساسيات.",
    sections: [
      {
        title: "فحص قياسي كل ثلاثة أشهر",
        body: "كإيقاع قياسي، يمكن لدار طهارة إجراء فحص صيانة مرة كل ثلاثة أشهر تقريبًا. ويمكن تعديل الجدول بحسب العقار والاشتراك.",
      },
      {
        title: "أنظمة المنزل العملية",
        body: "قد تشمل الفحوص ملاحظات عملية حول التكييف والتسربات الظاهرة وضغط الماء والإنارة والأجهزة والتهوية والأبواب والنوافذ وغيرها من الأنظمة اليومية.",
      },
      {
        title: "الأعمال المتخصصة تبقى منفصلة",
        body: "إذا ظهرت مشكلة تقنية، يمكن لدار طهارة الإبلاغ عنها والمساعدة في تنسيق الخطوات التالية، لكن مقدّم الخدمة المعني يسعّر الإصلاحات والصيانة وقطع الغيار المتخصصة على حدة.",
      },
    ],
    highlights: [
      "يُقترح كل ثلاثة أشهر",
      "يشمل فحوصًا عملية مثل ملاحظات التكييف",
      "يساعد على اكتشاف احتياجات الصيانة مبكرًا",
      "الإصلاحات المتخصصة تُسعَّر على حدة",
    ],
  },
  "key-holding": {
    eyebrow: "حفظ المفاتيح",
    title: "تنسيق آمن للوصول لأصحاب العقارات الغائبين.",
    summary:
      "يمكن لدار طهارة تنسيق الوصول إلى العقار، وتوصي حيثما كان مناسبًا بقفل باب رقمي يعمل بالواي فاي ومدعوم من TTLock. يمكن حجز التركيب بنحو 200 يورو، ويتطلب اتصال إنترنت فعّالًا في المنزل.",
    intro:
      "الوصول الموثوق أساسي للتنظيف والمعاينات وفحوصات الصيانة وتحضير الضيوف. تدعم دار طهارة التعامل الآمن مع المفاتيح، وتقدّم المشورة بشأن خيارات وصول أذكى عند الاقتضاء.",
    sections: [
      {
        title: "توصية بالوصول الرقمي",
        body: "حيثما سمح العقار بذلك، نوصي بتركيب قفل باب رقمي يعمل بالواي فاي ومدعوم من TTLock. وهذا يسهّل إدارة الوصول، خصوصًا للمُلّاك خارج البلاد أو عقارات الإقامة القصيرة.",
      },
      {
        title: "دعم التركيب",
        body: "إذا رغب العميل في المساعدة على التركيب، يمكن لدار طهارة ترتيب ذلك كخدمة مدفوعة منفصلة بنحو 200 يورو. ويجب أن يتوفر في المنزل اتصال إنترنت فعّال لربط القفل الذكي. والقفل والتركيب وأي متطلبات متخصصة ليست مشمولة تلقائيًا في اشتراك التنظيف.",
      },
      {
        title: "الوصول يبقى مُنظَّمًا",
        body: "سواء بالمفاتيح أو الرموز أو القفل الذكي، ينبغي توثيق الوصول وحصره في الزيارات المعتمدة والتعامل معه بتحفّظ.",
      },
    ],
    highlights: [
      "وصول آمن للتنظيف والمعاينات",
      "يوصى بقفل واي فاي مدعوم من TTLock حيثما كان مناسبًا",
      "يمكن ترتيب التركيب مقابل رسوم منفصلة",
      "مفيد للمُلّاك خارج البلاد وللمنازل المؤجَّرة",
    ],
  },
};

const es: ServicePagesCopy = {
  "premium-cleaning": {
    eyebrow: "Limpieza premium",
    title: "Un nivel superior de cuidado del hogar, a cargo de personas que se enorgullecen del detalle.",
    summary:
      "La limpieza premium en Dar Tahara significa personal formado y cuidadosamente seleccionado, del que se espera que vaya más allá de una limpieza superficial y cuide la vivienda con discreción, iniciativa y constancia.",
    intro:
      "Dar Tahara está pensada para clientes que quieren algo más que un limpiador que cumple una lista. Nuestra limpieza premium se centra en la confianza, la presentación, el detalle y esos pequeños gestos que hacen que un hogar se sienta realmente cuidado.",
    sections: [
      {
        title: "Personal cuidadosamente seleccionado",
        body: "Damos mucha importancia a la calidad de las personas que entran en tu casa. Los miembros del equipo se seleccionan por profesionalidad, fiabilidad, discreción y disposición a dar un paso más.",
      },
      {
        title: "Más que superficies visibles",
        body: "El servicio cubre el nivel visible de limpieza y también los detalles que definen la sensación del hogar: presentación, frescura, orden, trato cuidadoso de los materiales y atención a las zonas problemáticas recurrentes.",
      },
      {
        title: "Un acabado premium, listo para recibir",
        body: "En viviendas que reciben familia, invitados o estancias cortas, el objetivo es un ambiente tranquilo, pulido y listo para disfrutar, no una limpieza básica apresurada.",
      },
    ],
    highlights: [
      "Personal profesional de cuidado del hogar de Dar Tahara",
      "Limpieza y presentación centradas en el detalle",
      "Apto para viviendas privadas, casas de vacaciones y alquileres premium",
      "Estándares afinados tras la evaluación inicial de la vivienda",
    ],
  },
  "recurring-cleaning": {
    eyebrow: "Limpieza recurrente",
    title: "Mantenimiento constante para viviendas que necesitan atención regular.",
    summary:
      "La limpieza recurrente mantiene la vivienda a lo largo del tiempo, sobre todo en zonas costeras donde el aire salino, la humedad y el riesgo de moho exigen más vigilancia.",
    intro:
      "Algunas viviendas necesitan más que una puesta a punto ocasional. Las propiedades cercanas a la costa, en zonas húmedas o cerradas entre visitas pueden desarrollar moho, acumulación de polvo y restos de salitre. La limpieza recurrente da a la casa un ritmo fiable de cuidado.",
    sections: [
      {
        title: "Pensada para el clima marroquí",
        body: "Las viviendas cercanas a la costa pueden requerir atención adicional porque el aire salino y la humedad afectan a superficies, ventanas, baños, armarios y ventilación. El plan recurrente ayuda a detectar y gestionar estos puntos antes de que crezcan.",
      },
      {
        title: "Una vivienda que sigue lista",
        body: "Las visitas regulares mantienen frescura, orden e higiene, de modo que la propiedad no retroceda entre estancias o periodos de mucha actividad.",
      },
      {
        title: "Ajustada tras la evaluación",
        body: "La evaluación inicial ayuda a determinar la frecuencia adecuada y las zonas prioritarias. Si la propiedad difiere sustancialmente de los datos facilitados, Dar Tahara puede recomendar un plan revisado.",
      },
    ],
    highlights: [
      "Cuidado mensual, quincenal, semanal o a medida",
      "Atención a la humedad y a zonas propensas al moho o afectadas por el salitre",
      "Útil para viviendas costeras, vacacionales y de uso frecuente",
      "Apoya el seguimiento continuo del estado de la vivienda",
    ],
  },
  "move-in-move-out": {
    eyebrow: "Entrada / salida",
    title: "Una entrega limpia y tranquila en llegadas, salidas y cambios de huésped.",
    summary:
      "El servicio de entrada / salida es especialmente útil para propiedades de Airbnb y alquiler, y también para propietarios de casas de vacaciones que preparan la vivienda antes de llegar o después de marcharse.",
    intro:
      "Tanto si un huésped acaba de irse, como si llega uno nuevo o preparas tu propia casa de vacaciones, el momento de la entrega importa. Dar Tahara ayuda a devolver la propiedad a un estado acogedor y listo para usar.",
    sections: [
      {
        title: "Rotaciones de Airbnb y alquiler",
        body: "En propiedades de estancia corta, el servicio apoya la presentación lista para huéspedes, la limpieza tras la salida y la preparación antes de la siguiente llegada.",
      },
      {
        title: "Preparación de casas de vacaciones",
        body: "Para propietarios que visitan Marruecos ocasionalmente, este servicio ayuda a que la vivienda se sienta preparada al llegar y quede correctamente restablecida tras su uso.",
      },
      {
        title: "Alcance confirmado por adelantado",
        body: "El alcance exacto depende del tamaño, el estado, las necesidades de ropa de cama, los plazos y el acceso. La lavandería, los cambios de ropa de cama o la reposición adicionales se presupuestan aparte en la propuesta aprobada.",
      },
    ],
    highlights: [
      "Útil para Airbnb, alquileres y casas de vacaciones",
      "Preparación de llegada y salida",
      "Limpieza y presentación listas para huéspedes",
      "Coordinación opcional de ropa de cama, lavandería y reposición",
    ],
  },
  "property-inspections": {
    eyebrow: "Inspecciones de la vivienda",
    title: "Una revisión cuidadosa de tu casa cuando no puedes estar allí.",
    summary:
      "Las inspecciones ayudan a identificar daños, cambios y señales de problemas, por ejemplo tras un terremoto, lluvias intensas, tormentas o largos periodos sin ocupación.",
    intro:
      "Cuando una propiedad está vacía o el propietario está en el extranjero, los pequeños problemas pasan desapercibidos. Las inspecciones de Dar Tahara ofrecen una revisión estructurada para que la vivienda no quede desatendida tras fenómenos meteorológicos, movimientos del edificio o estancias de huéspedes.",
    sections: [
      {
        title: "Tras sucesos poco habituales",
        body: "Las inspecciones son especialmente útiles después de terremotos, lluvias intensas, tormentas, fugas, picos de humedad o cualquier suceso que haya podido afectar a la propiedad.",
      },
      {
        title: "Detección de daños y cambios",
        body: "El equipo revisa daños visibles, entradas de agua, olores inusuales, indicios de moho, elementos rotos, problemas de acceso y cambios que deba valorar el propietario o un especialista.",
      },
      {
        title: "Informe claro",
        body: "Las notas de inspección ayudan a decidir si hace falta mantenimiento, limpieza a fondo o un profesional especializado. Dar Tahara no inventa hallazgos y escala los asuntos dudosos o delicados.",
      },
    ],
    highlights: [
      "Útil tras terremotos, tormentas o lluvias intensas",
      "Revisa daños visibles y cambios en la propiedad",
      "Apoya a propietarios que viven en el extranjero",
      "Puede activar mantenimiento o seguimiento humano cuando hace falta",
    ],
  },
  "maintenance-checks": {
    eyebrow: "Revisiones de mantenimiento",
    title: "Una revisión práctica y periódica para evitar sorpresas evitables.",
    summary:
      "Dar Tahara puede realizar una revisión de mantenimiento estándar aproximadamente cada tres meses, incluyendo puntos prácticos como la comprobación del aire acondicionado.",
    intro:
      "Las revisiones de mantenimiento detectan problemas evidentes antes de que resulten caros o incómodos. No sustituyen a un servicio técnico autorizado, pero ayudan a los propietarios a vigilar lo básico.",
    sections: [
      {
        title: "Revisión estándar trimestral",
        body: "Como ritmo estándar, Dar Tahara puede realizar una revisión de mantenimiento cada tres meses aproximadamente. El calendario exacto puede ajustarse a la vivienda y a la suscripción.",
      },
      {
        title: "Sistemas prácticos del hogar",
        body: "Las revisiones pueden incluir observaciones prácticas sobre aire acondicionado, fugas visibles, presión de agua, iluminación, electrodomésticos, ventilación, puertas, ventanas y otros sistemas cotidianos.",
      },
      {
        title: "El trabajo especializado sigue aparte",
        body: "Si se detecta un problema técnico, Dar Tahara puede informarlo y ayudar a coordinar los siguientes pasos, pero el proveedor correspondiente presupuesta aparte reparaciones, servicio o piezas.",
      },
    ],
    highlights: [
      "Sugerida cada tres meses",
      "Incluye comprobaciones prácticas como observaciones del aire acondicionado",
      "Ayuda a identificar pronto necesidades de mantenimiento",
      "Reparaciones especializadas presupuestadas aparte",
    ],
  },
  "key-holding": {
    eyebrow: "Custodia de llaves",
    title: "Coordinación de acceso segura para propietarios ausentes.",
    summary:
      "Dar Tahara puede coordinar el acceso a la vivienda y recomienda, cuando resulta adecuado, una cerradura inteligente con Wi-Fi compatible con TTLock. La instalación puede reservarse por unos 200 € y requiere conexión a internet activa en la vivienda.",
    intro:
      "Un acceso fiable es esencial para la limpieza, las inspecciones, las revisiones de mantenimiento y la preparación de huéspedes. Dar Tahara apoya una gestión segura de llaves y asesora sobre opciones de acceso más modernas cuando procede.",
    sections: [
      {
        title: "Recomendación de acceso digital",
        body: "Cuando la vivienda lo permite, recomendamos instalar una cerradura inteligente con Wi-Fi compatible con TTLock. Facilita la gestión del acceso, sobre todo para propietarios en el extranjero o propiedades de estancia corta.",
      },
      {
        title: "Apoyo en la instalación",
        body: "Si el cliente quiere ayuda con la instalación, Dar Tahara puede organizarla como servicio de pago independiente de unos 200 €. La vivienda debe tener conexión a internet activa para la cerradura inteligente. La cerradura, la instalación y cualquier requisito especializado no se incluyen automáticamente en la suscripción de limpieza.",
      },
      {
        title: "El acceso sigue controlado",
        body: "Ya sea con llaves, códigos o cerradura inteligente, el acceso debe documentarse, limitarse a visitas aprobadas y gestionarse con discreción.",
      },
    ],
    highlights: [
      "Acceso seguro para limpieza e inspecciones",
      "Cerradura Wi-Fi compatible con TTLock recomendada cuando procede",
      "La instalación puede organizarse por una tarifa aparte",
      "Útil para propietarios en el extranjero y viviendas de alquiler",
    ],
  },
};

const de: ServicePagesCopy = {
  "premium-cleaning": {
    eyebrow: "Premium-Reinigung",
    title: "Ein höherer Standard der Hauspflege, von Menschen mit Sinn fürs Detail.",
    summary:
      "Premium-Reinigung bei Dar Tahara bedeutet geschultes, sorgfältig ausgewähltes Personal, von dem erwartet wird, über eine oberflächliche Reinigung hinauszugehen und das Zuhause mit Diskretion, Eigeninitiative und Beständigkeit zu pflegen.",
    intro:
      "Dar Tahara ist für Kundinnen und Kunden gemacht, die mehr wollen als eine Reinigungskraft, die eine Checkliste abarbeitet. Unsere Premium-Reinigung setzt auf Vertrauen, Erscheinungsbild, Detail und jene kleinen Handgriffe, die ein Zuhause wirklich gepflegt wirken lassen.",
    sections: [
      {
        title: "Sorgfältig ausgewähltes Personal",
        body: "Wir legen großen Wert auf die Qualität der Menschen, die Ihr Zuhause betreten. Teammitglieder werden nach Professionalität, Zuverlässigkeit, Diskretion und der Bereitschaft ausgewählt, einen Schritt weiterzugehen.",
      },
      {
        title: "Mehr als sichtbare Oberflächen",
        body: "Die Leistung umfasst den sichtbaren Sauberkeitsstandard ebenso wie die Details, die das Gefühl des Zuhauses prägen: Erscheinungsbild, Frische, Ordnung, sorgsamer Umgang mit Oberflächen und Aufmerksamkeit für wiederkehrende Problemstellen.",
      },
      {
        title: "Ein Premium-Finish für Gäste",
        body: "Bei Wohnungen, die Familie, Gäste oder Kurzzeitbesuch empfangen, ist das Ziel eine ruhige, gepflegte und sofort nutzbare Umgebung statt einer hastigen Grundreinigung.",
      },
    ],
    highlights: [
      "Professionelle Hauspflegekräfte von Dar Tahara",
      "Detailorientierte Reinigung und Präsentation",
      "Geeignet für Privatwohnungen, Ferienhäuser und Premium-Vermietungen",
      "Pflegestandards werden nach der ersten Wohnungsbegehung verfeinert",
    ],
  },
  "recurring-cleaning": {
    eyebrow: "Wiederkehrende Reinigung",
    title: "Beständige Pflege für Wohnungen, die regelmäßige Aufmerksamkeit brauchen.",
    summary:
      "Wiederkehrende Reinigung erhält das Zuhause über die Zeit, besonders in Küstenregionen, wo salzige Luft, Feuchtigkeit und Schimmelrisiko genauere Aufmerksamkeit verlangen.",
    intro:
      "Manche Wohnungen brauchen mehr als eine gelegentliche Auffrischung. Objekte nahe der Küste, in feuchten Gegenden oder zwischen Besuchen geschlossene Häuser können Schimmel, Staubansammlungen und Salzrückstände entwickeln. Wiederkehrende Reinigung gibt dem Zuhause einen verlässlichen Pflegerhythmus.",
    sections: [
      {
        title: "Auf das marokkanische Klima ausgelegt",
        body: "Küstennahe Wohnungen brauchen mitunter zusätzliche Aufmerksamkeit, weil salzige Luft und Feuchtigkeit Oberflächen, Fenster, Bäder, Schränke und Lüftung beeinträchtigen. Der wiederkehrende Plan hilft, das früh zu erkennen und zu steuern.",
      },
      {
        title: "Ein Zuhause, das bereit bleibt",
        body: "Regelmäßige Besuche erhalten Frische, Ordnung und Hygiene, sodass das Objekt zwischen Aufenthalten oder arbeitsreichen Phasen nicht zurückfällt.",
      },
      {
        title: "Nach der Begehung angepasst",
        body: "Die erste Wohnungsbegehung hilft, die passende Frequenz und Schwerpunkte zu bestimmen. Weicht das Objekt wesentlich von den Angaben ab, kann Dar Tahara einen überarbeiteten Plan empfehlen.",
      },
    ],
    highlights: [
      "Monatliche, zweiwöchentliche, wöchentliche oder maßgeschneiderte Pflege",
      "Aufmerksamkeit für Feuchtigkeit, schimmelanfällige und salzluftbelastete Bereiche",
      "Nützlich für Küsten-, Ferien- und häufig genutzte Wohnungen",
      "Unterstützt die laufende Beobachtung des Objektzustands",
    ],
  },
  "move-in-move-out": {
    eyebrow: "Ein- und Auszug",
    title: "Eine saubere, ruhige Übergabe bei Ankunft, Abreise und Gästewechsel.",
    summary:
      "Der Ein- und Auszugsservice ist besonders nützlich für Airbnb- und Mietobjekte, aber auch für Ferienhausbesitzer, die das Zuhause vor der Ankunft oder nach der Abreise vorbereiten.",
    intro:
      "Ob ein Gast gerade abgereist ist, ein neuer Gast anreist oder Sie Ihr eigenes Ferienhaus vorbereiten: Der Moment der Übergabe zählt. Dar Tahara hilft, das Objekt in einen einladenden, nutzbaren Zustand zurückzuversetzen.",
    sections: [
      {
        title: "Airbnb- und Mietwechsel",
        body: "Bei Kurzzeitobjekten unterstützt der Service die gästefertige Präsentation, die Reinigung nach der Abreise und die Vorbereitung vor der nächsten Ankunft.",
      },
      {
        title: "Vorbereitung von Ferienhäusern",
        body: "Für Eigentümer, die Marokko gelegentlich besuchen, sorgt der Service dafür, dass sich das Zuhause bei Ankunft vorbereitet anfühlt und nach der Nutzung ordentlich zurückgesetzt wird.",
      },
      {
        title: "Umfang vorab festgelegt",
        body: "Der genaue Umfang hängt von Größe, Zustand, Wäschebedarf, Zeitpunkt und Zugang ab. Zusätzliche Wäsche, Bettwäschewechsel oder Auffüllen werden im freigegebenen Angebot separat berechnet.",
      },
    ],
    highlights: [
      "Nützlich für Airbnb, Vermietung und Ferienhäuser",
      "Vorbereitung bei Ankunft und Abreise",
      "Gästefertige Reinigung und Präsentation",
      "Optionale Koordination von Wäsche, Bettwäsche und Auffüllen",
    ],
  },
  "property-inspections": {
    eyebrow: "Objektbegehungen",
    title: "Eine sorgfältige Kontrolle Ihres Zuhauses, wenn Sie nicht vor Ort sein können.",
    summary:
      "Begehungen helfen, Schäden, Veränderungen und Anzeichen von Problemen zu erkennen, etwa nach einem Erdbeben, starkem Regen, Stürmen oder langem Leerstand.",
    intro:
      "Wenn ein Objekt leer steht oder die Eigentümerschaft im Ausland ist, bleiben kleine Probleme leicht unbemerkt. Die Begehungen von Dar Tahara bieten eine strukturierte Kontrolle, damit das Zuhause nach Wetterereignissen, Gebäudebewegung oder Gästeaufenthalten nicht unbeaufsichtigt bleibt.",
    sections: [
      {
        title: "Nach ungewöhnlichen Ereignissen",
        body: "Begehungen sind besonders nützlich nach Erdbeben, starkem Regen, Stürmen, Leckagen, Feuchtigkeitsspitzen oder jedem Ereignis, das das Objekt beeinträchtigt haben könnte.",
      },
      {
        title: "Schäden und Veränderungen erkennen",
        body: "Das Team prüft sichtbare Schäden, Wassereintritt, ungewöhnliche Gerüche, Schimmelhinweise, defekte Einrichtungen, Zugangsprobleme und Veränderungen, die von der Eigentümerschaft oder einer Fachkraft bewertet werden sollten.",
      },
      {
        title: "Klare Berichterstattung",
        body: "Begehungsnotizen stützen die Entscheidung, ob Wartung, Grundreinigung oder eine Fachfirma nötig ist. Dar Tahara erfindet keine Befunde und eskaliert unsichere oder heikle Punkte.",
      },
    ],
    highlights: [
      "Nützlich nach Erdbeben, Stürmen oder starkem Regen",
      "Prüft sichtbare Schäden und Veränderungen am Objekt",
      "Unterstützt im Ausland lebende Eigentümer",
      "Kann Wartung oder menschliche Nachverfolgung auslösen",
    ],
  },
  "maintenance-checks": {
    eyebrow: "Wartungskontrollen",
    title: "Eine regelmäßige praktische Kontrolle gegen vermeidbare Überraschungen.",
    summary:
      "Dar Tahara kann etwa alle drei Monate eine Standard-Wartungskontrolle durchführen, einschließlich praktischer Punkte wie einer Prüfung der Klimaanlage.",
    intro:
      "Wartungskontrollen erkennen offensichtliche Probleme, bevor sie teuer oder lästig werden. Sie ersetzen keine zugelassene technische Wartung, helfen der Eigentümerschaft aber, die Grundlagen im Blick zu behalten.",
    sections: [
      {
        title: "Quartalsweise Standardkontrolle",
        body: "Als Standardrhythmus kann Dar Tahara etwa alle drei Monate eine Wartungskontrolle durchführen. Der genaue Zeitplan lässt sich an Objekt und Abo anpassen.",
      },
      {
        title: "Praktische Haustechnik",
        body: "Kontrollen können praktische Beobachtungen zu Klimaanlage, sichtbaren Leckagen, Wasserdruck, Beleuchtung, Geräten, Lüftung, Türen, Fenstern und anderen Alltagssystemen umfassen.",
      },
      {
        title: "Facharbeiten bleiben getrennt",
        body: "Wird ein technisches Problem gefunden, kann Dar Tahara es melden und die nächsten Schritte koordinieren helfen; der zuständige Anbieter berechnet Reparaturen, Wartung oder Ersatzteile separat.",
      },
    ],
    highlights: [
      "Empfohlen alle drei Monate",
      "Enthält praktische Prüfungen wie Beobachtungen der Klimaanlage",
      "Hilft, Wartungsbedarf früh zu erkennen",
      "Facharbeiten werden separat berechnet",
    ],
  },
  "key-holding": {
    eyebrow: "Schlüsselverwahrung",
    title: "Sichere Zugangskoordination für abwesende Eigentümer.",
    summary:
      "Dar Tahara kann den Objektzugang koordinieren und empfiehlt, wo geeignet, ein digitales WLAN-Türschloss mit TTLock-Unterstützung. Die Installation ist für rund 200 € buchbar und setzt eine aktive Internetverbindung im Zuhause voraus.",
    intro:
      "Verlässlicher Zugang ist entscheidend für Reinigung, Begehungen, Wartungskontrollen und Gästevorbereitung. Dar Tahara unterstützt sichere Schlüsselabläufe und berät zu moderneren Zugangslösungen, wo das sinnvoll ist.",
    sections: [
      {
        title: "Empfehlung für digitalen Zugang",
        body: "Wo das Objekt es zulässt, empfehlen wir ein digitales WLAN-Türschloss mit TTLock-Unterstützung. Das erleichtert die Zugangsverwaltung, besonders bei Eigentümern im Ausland oder Kurzzeitobjekten.",
      },
      {
        title: "Unterstützung bei der Installation",
        body: "Wünscht die Kundschaft Hilfe bei der Installation, kann Dar Tahara das als separate kostenpflichtige Leistung von rund 200 € organisieren. Für die Verbindung des Smart Locks muss eine aktive Internetverbindung vorhanden sein. Schloss, Installation und etwaige Fachanforderungen sind nicht automatisch im Reinigungsabo enthalten.",
      },
      {
        title: "Zugang bleibt kontrolliert",
        body: "Ob Schlüssel, Codes oder Smart Lock: Zugang sollte dokumentiert, auf freigegebene Besuche begrenzt und diskret gehandhabt werden.",
      },
    ],
    highlights: [
      "Sicherer Zugang für Reinigung und Begehungen",
      "WLAN-Türschloss mit TTLock-Unterstützung empfohlen, wo geeignet",
      "Installation gegen separate Gebühr organisierbar",
      "Nützlich für Eigentümer im Ausland und Mietobjekte",
    ],
  },
};

const pt: ServicePagesCopy = {
  "premium-cleaning": {
    eyebrow: "Limpeza premium",
    title: "Um padrão superior de cuidado do lar, por pessoas que se orgulham do detalhe.",
    summary:
      "Limpeza premium na Dar Tahara significa pessoal formado e cuidadosamente selecionado, de quem se espera que vá além de uma limpeza superficial e cuide da casa com discrição, iniciativa e consistência.",
    intro:
      "A Dar Tahara foi criada para clientes que querem mais do que alguém a cumprir uma lista. A nossa limpeza premium foca-se na confiança, na apresentação, no detalhe e nos pequenos gestos que fazem uma casa parecer verdadeiramente cuidada.",
    sections: [
      {
        title: "Pessoal cuidadosamente selecionado",
        body: "Damos grande importância à qualidade das pessoas que entram na sua casa. Os membros da equipa são escolhidos por profissionalismo, fiabilidade, discrição e disponibilidade para ir mais além.",
      },
      {
        title: "Mais do que superfícies visíveis",
        body: "O serviço cobre o padrão visível de limpeza e também os detalhes que definem a sensação da casa: apresentação, frescura, ordem, manuseamento cuidadoso das superfícies e atenção a zonas problemáticas recorrentes.",
      },
      {
        title: "Um acabamento premium, pronto a receber",
        body: "Em casas que recebem família, convidados ou estadias curtas, o objetivo é um ambiente calmo, cuidado e pronto a desfrutar, e não uma limpeza básica apressada.",
      },
    ],
    highlights: [
      "Profissionais de cuidado do lar da Dar Tahara",
      "Limpeza e apresentação focadas no detalhe",
      "Adequado a casas privadas, casas de férias e arrendamentos premium",
      "Padrões afinados após a avaliação inicial da casa",
    ],
  },
  "recurring-cleaning": {
    eyebrow: "Limpeza recorrente",
    title: "Manutenção consistente para casas que precisam de atenção regular.",
    summary:
      "A limpeza recorrente mantém a casa ao longo do tempo, sobretudo em zonas costeiras onde o ar salino, a humidade e o risco de bolor exigem maior atenção.",
    intro:
      "Algumas casas precisam de mais do que uma renovação ocasional. Imóveis perto da costa, em zonas húmidas ou fechados entre visitas podem desenvolver bolor, acumulação de pó e resíduos de sal. A limpeza recorrente dá à casa um ritmo fiável de cuidado.",
    sections: [
      {
        title: "Pensada para o clima marroquino",
        body: "Casas junto à costa podem exigir atenção adicional porque o ar salino e a humidade afetam superfícies, janelas, casas de banho, armários e ventilação. O plano recorrente ajuda a detetar e gerir estas questões antes de se agravarem.",
      },
      {
        title: "Uma casa que se mantém pronta",
        body: "As visitas regulares mantêm frescura, ordem e higiene, para que o imóvel não recue entre estadias ou períodos de maior utilização.",
      },
      {
        title: "Ajustada após a avaliação",
        body: "A avaliação inicial ajuda a determinar a frequência certa e as áreas prioritárias. Se o imóvel diferir substancialmente dos dados fornecidos, a Dar Tahara pode recomendar um plano revisto.",
      },
    ],
    highlights: [
      "Cuidado mensal, quinzenal, semanal ou personalizado",
      "Atenção à humidade e a zonas propensas a bolor ou afetadas pelo ar salino",
      "Útil para casas costeiras, de férias e de utilização frequente",
      "Apoia o acompanhamento contínuo do estado do imóvel",
    ],
  },
  "move-in-move-out": {
    eyebrow: "Entrada / saída",
    title: "Uma entrega limpa e tranquila em chegadas, saídas e trocas de hóspedes.",
    summary:
      "O serviço de entrada / saída é especialmente útil para imóveis Airbnb e de arrendamento, e também para proprietários de casas de férias que preparam a casa antes da chegada ou após a partida.",
    intro:
      "Quer um hóspede acabe de sair, quer chegue um novo, quer esteja a preparar a sua própria casa de férias, o momento da entrega conta. A Dar Tahara ajuda a devolver ao imóvel um estado acolhedor e pronto a usar.",
    sections: [
      {
        title: "Rotações de Airbnb e arrendamento",
        body: "Em imóveis de estadia curta, o serviço apoia a apresentação pronta para hóspedes, a limpeza após a saída e a preparação antes da chegada seguinte.",
      },
      {
        title: "Preparação de casas de férias",
        body: "Para proprietários que visitam Marrocos ocasionalmente, este serviço ajuda a que a casa se sinta preparada à chegada e devidamente reposta após a utilização.",
      },
      {
        title: "Âmbito confirmado com antecedência",
        body: "O âmbito exato depende da dimensão, do estado, das necessidades de roupa de cama, dos prazos e do acesso. Lavandaria, mudanças de roupa de cama ou reposição adicionais são orçamentados à parte na proposta aprovada.",
      },
    ],
    highlights: [
      "Útil para Airbnb, arrendamentos e casas de férias",
      "Preparação de chegada e partida",
      "Limpeza e apresentação prontas para hóspedes",
      "Coordenação opcional de roupa de cama, lavandaria e reposição",
    ],
  },
  "property-inspections": {
    eyebrow: "Inspeções ao imóvel",
    title: "Uma verificação cuidada da sua casa quando não pode estar presente.",
    summary:
      "As inspeções ajudam a identificar danos, alterações e sinais de problemas, por exemplo após um sismo, chuvas fortes, tempestades ou longos períodos sem ocupação.",
    intro:
      "Quando um imóvel está vazio ou o proprietário está no estrangeiro, os pequenos problemas passam despercebidos. As inspeções da Dar Tahara oferecem uma verificação estruturada, para que a casa não fique desacompanhada após fenómenos meteorológicos, movimentos do edifício ou estadias de hóspedes.",
    sections: [
      {
        title: "Após acontecimentos invulgares",
        body: "As inspeções são especialmente úteis após sismos, chuvas fortes, tempestades, fugas, picos de humidade ou qualquer acontecimento que possa ter afetado o imóvel.",
      },
      {
        title: "Deteção de danos e alterações",
        body: "A equipa verifica danos visíveis, entradas de água, cheiros invulgares, indícios de bolor, equipamentos partidos, problemas de acesso e alterações que devam ser avaliadas pelo proprietário ou por um especialista.",
      },
      {
        title: "Relato claro",
        body: "As notas de inspeção apoiam a decisão sobre se é necessária manutenção, limpeza profunda ou um profissional especializado. A Dar Tahara não inventa constatações e escala assuntos incertos ou sensíveis.",
      },
    ],
    highlights: [
      "Útil após sismos, tempestades ou chuvas fortes",
      "Verifica danos visíveis e alterações no imóvel",
      "Apoia proprietários que vivem no estrangeiro",
      "Pode desencadear manutenção ou acompanhamento humano",
    ],
  },
  "maintenance-checks": {
    eyebrow: "Verificações de manutenção",
    title: "Uma verificação prática e regular para evitar surpresas evitáveis.",
    summary:
      "A Dar Tahara pode realizar uma verificação de manutenção padrão aproximadamente de três em três meses, incluindo pontos práticos como a verificação do ar condicionado.",
    intro:
      "As verificações de manutenção detetam problemas evidentes antes de se tornarem caros ou incómodos. Não substituem assistência técnica certificada, mas ajudam os proprietários a vigiar o essencial.",
    sections: [
      {
        title: "Verificação padrão trimestral",
        body: "Como ritmo padrão, a Dar Tahara pode realizar uma verificação de manutenção cerca de cada três meses. O calendário exato pode ser ajustado ao imóvel e à subscrição.",
      },
      {
        title: "Sistemas práticos da casa",
        body: "As verificações podem incluir observações práticas sobre ar condicionado, fugas visíveis, pressão da água, iluminação, eletrodomésticos, ventilação, portas, janelas e outros sistemas do dia a dia.",
      },
      {
        title: "O trabalho especializado mantém-se à parte",
        body: "Se for detetado um problema técnico, a Dar Tahara pode reportá-lo e ajudar a coordenar os passos seguintes, mas o prestador competente orçamenta à parte reparações, assistência ou peças.",
      },
    ],
    highlights: [
      "Sugerida de três em três meses",
      "Inclui verificações práticas como observações do ar condicionado",
      "Ajuda a identificar cedo necessidades de manutenção",
      "Reparações especializadas orçamentadas à parte",
    ],
  },
  "key-holding": {
    eyebrow: "Guarda de chaves",
    title: "Coordenação de acesso segura para proprietários ausentes.",
    summary:
      "A Dar Tahara pode coordenar o acesso ao imóvel e recomenda, quando adequado, uma fechadura inteligente com Wi-Fi compatível com TTLock. A instalação pode ser marcada por cerca de 200 € e exige ligação à internet ativa na casa.",
    intro:
      "Um acesso fiável é essencial para limpeza, inspeções, verificações de manutenção e preparação de hóspedes. A Dar Tahara apoia uma gestão segura de chaves e aconselha sobre opções de acesso mais modernas quando faz sentido.",
    sections: [
      {
        title: "Recomendação de acesso digital",
        body: "Quando o imóvel o permite, recomendamos instalar uma fechadura inteligente com Wi-Fi compatível com TTLock. Facilita a gestão do acesso, sobretudo para proprietários no estrangeiro ou imóveis de estadia curta.",
      },
      {
        title: "Apoio na instalação",
        body: "Se o cliente quiser ajuda com a instalação, a Dar Tahara pode organizá-la como serviço pago separado de cerca de 200 €. A casa deve ter ligação à internet ativa para a fechadura inteligente. A fechadura, a instalação e quaisquer requisitos especializados não estão automaticamente incluídos na subscrição de limpeza.",
      },
      {
        title: "O acesso mantém-se controlado",
        body: "Seja com chaves, códigos ou fechadura inteligente, o acesso deve ser documentado, limitado a visitas aprovadas e tratado com discrição.",
      },
    ],
    highlights: [
      "Acesso seguro para limpeza e inspeções",
      "Fechadura Wi-Fi compatível com TTLock recomendada quando adequado",
      "Instalação pode ser tratada mediante taxa separada",
      "Útil para proprietários no estrangeiro e casas arrendadas",
    ],
  },
};

const overrides: Partial<Record<Locale, ServicePagesCopy>> = { nl, fr, ar, es, de, pt };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Same merge semantics as the main dictionaries: base wins when override is absent. */
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

const cache = new Map<string, ServicePage>();

/** The service page for a locale, falling back to English field by field. */
export function getServicePage(locale: Locale, slug: ServicePageSlug): ServicePage {
  const key = `${locale}:${slug}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const base = servicePages[slug];
  const override = overrides[locale]?.[slug];
  const merged = override ? deepMerge(base, override) : base;
  cache.set(key, merged);
  return merged;
}

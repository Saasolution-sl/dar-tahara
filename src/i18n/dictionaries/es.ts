import type { DeepPartial } from "../types";
import type { Dictionary } from "./en";

/** Spanish — complete translation. */
const es: DeepPartial<Dictionary> = {
  meta: {
    title: "Dar Tahara — Cuidado del hogar y conserjería de propiedades premium",
    description:
      "Dar Tahara es un servicio premium de cuidado del hogar y conserjería de propiedades en Marruecos. Limpieza profesional, inspecciones y mantenimiento para llegar siempre a un hogar de confort.",
    ogAlt: "Dar Tahara — Casa de la Pureza",
  },
  brand: {
    name: "Dar Tahara",
    meaning: "Casa de la Pureza",
    tagline: "Llega siempre a un hogar de confort.",
  },
  nav: {
    why: "Por qué Dar Tahara",
    services: "Servicios",
    plans: "Planes",
    pricing: "Precios",
    how: "Cómo funciona",
    gallery: "Galería",
    faq: "Preguntas frecuentes",
    book: "Reservar limpieza",
    quote: "Solicitar presupuesto",
    menu: "Menú",
    close: "Cerrar",
    language: "Idioma",
    theme: "Tema",
  },
  hero: {
    eyebrow: "Cuidado del hogar y conserjería de propiedades",
    title: "Tu hogar merece más que limpieza: merece un cuidado excepcional.",
    subtitle:
      "Para propietarios, expatriados y dueños de casas vacacionales en todo Marruecos. Limpiamos, inspeccionamos y mantenemos tu propiedad con precisión discreta, para que regreses al confort y nunca a la preocupación.",
    ctaPrimary: "Reservar limpieza",
    ctaSecondary: "Solicitar presupuesto",
    ctaTertiary: "Saber más",
    stat1Value: "500+",
    stat1Label: "Hogares cuidados",
    stat2Value: "12 años",
    stat2Label: "Antigüedad media de los clientes",
    stat3Value: "24 h",
    stat3Label: "Tiempo de respuesta",
    imageAlt: "Un salón sereno y luminoso, preparado a la perfección",
  },
  why: {
    eyebrow: "Por qué Dar Tahara",
    title: "Tranquilidad, entregada en tu puerta.",
    subtitle:
      "Dar Tahara significa Casa de la Pureza. No somos una empresa de limpieza: somos los guardianes de confianza de tu hogar mientras estás fuera, y la razón por la que todo se siente sin esfuerzo cuando regresas.",
    pillars: [
      {
        title: "Confianza absoluta",
        body: "Profesionales verificados, formados y asegurados. Custodia discreta de llaves y total responsabilidad en cada visita.",
      },
      {
        title: "Calidad sin concesiones",
        body: "Un estándar meticuloso aplicado a cada superficie, cada detalle: inspeccionado, fotografiado y validado.",
      },
      {
        title: "Sin esfuerzo para ti",
        body: "Un único punto de contacto, información proactiva y un hogar que, simplemente y en calma, está listo antes de tu llegada.",
      },
      {
        title: "Discreción total",
        body: "Tu hogar, tu agenda y tu privacidad se tratan con la confidencialidad de un conserje privado.",
      },
    ],
  },
  services: {
    eyebrow: "Lo que hacemos",
    title: "Cuidado completo para cada rincón de tu hogar.",
    subtitle:
      "Desde una única limpieza impecable hasta la gestión completa de tu casa vacacional: elige exactamente lo que tu propiedad necesita.",
    items: [
      { title: "Limpieza premium", body: "Una limpieza refinada de arriba abajo, adaptada a hogares y acabados exclusivos." },
      { title: "Limpieza periódica", body: "Mantenimiento semanal o quincenal que mantiene tu hogar siempre impecable." },
      { title: "Entrada / salida de vivienda", body: "Una entrega impecable, ya sea que llegues, te vayas o cambies de inquilino." },
      { title: "Inspecciones de la propiedad", body: "Recorridos programados con informes fotográficos sobre el estado de tu hogar." },
      { title: "Revisiones de mantenimiento", body: "Comprobaciones proactivas de fontanería, electrodomésticos y seguridad antes de que surjan problemas." },
      { title: "Custodia de llaves", body: "Custodia segura y asegurada de tus llaves, con acceso registrado bajo demanda." },
      { title: "Preparación de casa vacacional", body: "Hogares listos a la llegada: ropa de cama fresca, esenciales repuestos y temperatura perfecta." },
      { title: "Lavandería y ropa de cama", body: "Lavandería de nivel hotelero, planchado y ropa de cama impecable dispuesta a medida." },
      { title: "Limpieza a fondo", body: "Una limpieza intensiva y restauradora para renovaciones de temporada y ocasiones especiales." },
      { title: "Limpieza tras reforma", body: "Polvo, residuos y escombros eliminados para revelar tu espacio terminado." },
      { title: "Limpieza de urgencia", body: "Respuesta rápida para invitados de última hora, eventos o imprevistos." },
      { title: "Gestión de casa vacacional", body: "Cuidado integral de tu segunda vivienda, gestionada como si fuera la nuestra." },
    ],
  },
  plans: {
    eyebrow: "Planes de suscripción",
    title: "Cuidado a un ritmo que se adapta a tu vida.",
    subtitle:
      "Planes sencillos y transparentes: pausa, ajusta o cancela cuando lo necesites. Cada plan incluye informes de inspección y soporte prioritario.",
    perMonthNote: "Precio personalizado según el tamaño y las necesidades de la propiedad.",
    mostPopular: "El más popular",
    cta: "Elegir plan",
    items: [
      {
        name: "Semanal",
        tagline: "Para hogares siempre en uso",
        features: ["Limpieza premium semanal", "Cambio de ropa de cama y lavandería", "Informe de inspección en cada visita", "Programación prioritaria"],
      },
      {
        name: "Quincenal",
        tagline: "El equilibrio ponderado",
        features: ["Limpieza cada dos semanas", "Controles puntuales de mantenimiento", "Informe de inspección con fotos", "Reprogramación flexible"],
      },
      {
        name: "Mensual",
        tagline: "Para un mantenimiento ligero",
        features: ["Limpieza a fondo mensual", "Inspección completa de la propiedad", "Revisión de mantenimiento estacional", "Coordinador dedicado"],
      },
      {
        name: "A medida",
        tagline: "Diseñado totalmente en torno a ti",
        features: ["Frecuencia de visita a medida", "Conserjería completa y custodia de llaves", "Gestión de casa vacacional", "Un único punto de contacto"],
      },
    ],
  },
  how: {
    eyebrow: "Cómo funciona",
    title: "Seis pasos serenos hacia un hogar que se cuida solo.",
    steps: [
      { title: "Reservar", body: "Cuéntanos sobre tu hogar y tu ritmo en una solicitud de dos minutos." },
      { title: "Te visitamos", body: "Un coordinador te visita para conocer tu espacio y tus preferencias." },
      { title: "Limpiamos", body: "Nuestro equipo formado ofrece nuestro estándar distintivo, siempre." },
      { title: "Inspeccionamos", body: "Cada visita termina con una inspección documentada y fotografiada." },
      { title: "Llegas", body: "Regresa a ropa de cama fresca, un ambiente sereno y cada cosa en su lugar." },
      { title: "Disfruta", body: "Relájate, reconecta y simplemente disfruta del confort del hogar." },
    ],
  },
  audiences: {
    eyebrow: "A quién cuidamos",
    title: "La confianza de quienes valoran su tiempo y su hogar.",
    items: [
      { title: "Personas que viven en el extranjero", body: "Tu hogar marroquí, impecable y listo entre visitas." },
      { title: "Profesionales ocupados", body: "Recupera tus tardes y fines de semana: nosotros nos ocupamos del resto." },
      { title: "Familias", body: "Un hogar sano e impecable para que te centres en lo que importa." },
      { title: "Dueños de casas vacacionales", body: "Llega a un hogar donde las vacaciones parecen haber empezado antes." },
      { title: "Anfitriones de Airbnb", body: "Rotaciones de cinco estrellas, reposición y presentación lista para los huéspedes." },
      { title: "Inversores inmobiliarios", body: "Activos protegidos, inspeccionados y mantenidos para conservar su valor." },
    ],
  },
  testimonials: {
    eyebrow: "En sus palabras",
    title: "La confianza serena de un hogar bien cuidado.",
    items: [
      {
        quote:
          "Vivo en Bruselas y solo visito Tánger unas pocas veces al año. Ahora llego a un hogar que se siente querido. Ya nunca me preocupo por él.",
        name: "Yasmine B.",
        role: "Propietaria, Tánger",
      },
      {
        quote:
          "Los informes de inspección son extraordinarios. Fotos, notas, todo documentado. Es como tener un administrador de la propiedad y un ama de llaves en uno.",
        name: "Thomas R.",
        role: "Inversor, Marrakech",
      },
      {
        quote:
          "Nuestras reseñas de Airbnb ahora mencionan la limpieza en casi cada comentario. Dar Tahara simplemente elevó nuestro estándar.",
        name: "Karim y Sofía",
        role: "Anfitriones, Casablanca",
      },
    ],
  },
  gallery: {
    eyebrow: "Antes y después",
    title: "La diferencia está en los detalles.",
    subtitle: "Un vistazo al estándar que llevamos a cada hogar.",
    before: "Antes",
    after: "Después",
    items: [
      { label: "Restauración del salón" },
      { label: "Limpieza a fondo de la cocina" },
      { label: "Renovación de la suite principal" },
    ],
  },
  faq: {
    eyebrow: "Bueno saberlo",
    title: "Preguntas frecuentes",
    items: [
      {
        q: "¿Su personal está verificado y asegurado?",
        a: "Cada miembro de nuestro equipo pasa una verificación de antecedentes, está formado según nuestro estándar y totalmente asegurado. Para clientes con custodia de llaves, mantenemos una cadena de custodia registrada para una total responsabilidad.",
      },
      {
        q: "¿Cómo funciona la custodia de llaves?",
        a: "Guardamos tus llaves de forma segura y accedemos a tu hogar solo para visitas programadas o aprobadas. Cada entrada y salida queda registrada, y recibes un informe después de cada visita.",
      },
      {
        q: "¿Pueden preparar mi hogar antes de que llegue?",
        a: "Sí. Comparte los detalles de tu llegada y nos aseguraremos de ropa de cama fresca, un hogar impecable, una temperatura agradable y cualquier esencial que solicites, listos en el momento en que entres.",
      },
      {
        q: "¿Qué ciudades cubren?",
        a: "Actualmente cubrimos las principales ciudades de Marruecos, incluidas Tánger, Casablanca, Rabat y Marrakech, con una cobertura en expansión continua. Contáctanos para confirmar tu zona.",
      },
      {
        q: "¿Puedo pausar o cambiar mi plan?",
        a: "Siempre. Los planes son flexibles: pausa mientras viajas, aumenta la frecuencia por temporada o ajusta los servicios en cualquier momento con un solo mensaje.",
      },
      {
        q: "¿Qué productos utilizan?",
        a: "Utilizamos productos profesionales, eficaces y cuidadosamente elegidos, con opciones ecológicas y seguras para las superficies, para acabados delicados y hogares sensibles bajo petición.",
      },
    ],
  },
  cta: {
    eyebrow: "Listos cuando tú lo estés",
    title: "Llega siempre a un hogar de confort.",
    subtitle:
      "Deja que cuidemos tu hogar, para que nunca tengas que pensar en él. Reserva una primera visita o solicita hoy un presupuesto a medida.",
    ctaPrimary: "Reservar limpieza",
    ctaSecondary: "Solicitar presupuesto",
    whatsapp: "Chatear por WhatsApp",
  },
  calculator: {
    eyebrow: "Precios transparentes",
    title: "Estima tu cuidado mensual.",
    subtitle:
      "Mueve el control deslizante y elige un ritmo. Tu estimación se actualiza al instante: sin registro, sin sorpresas.",
    sizeLabel: "Tamaño de la propiedad",
    sizeUnit: "m²",
    sizeHelp: "Introduce o desliza entre 20 y 250 m².",
    overMax: "Mi propiedad supera los 250 m²",
    frequencyLabel: "Frecuencia de limpieza",
    visitsSuffix: "al mes",
    recommended: "El más popular",
    noDiscount: "Sin descuento",
    discountLabel: "de descuento",
    freq: {
      monthly: { name: "Una vez al mes", visits: "1 visita al mes", note: "Una renovación mensual a fondo." },
      biweekly: { name: "Quincenal", visits: "2 visitas al mes", note: "El equilibrio ponderado entre cuidado y valor." },
      weekly: { name: "Semanal", visits: "4 visitas al mes", note: "Siempre impecable, siempre listo." },
      irregular: {
        name: "Airbnb y alquileres",
        visits: "Precio por semana",
        note: "Limpieza de rotación para Airbnb y alquileres de corta estancia. Incluye materiales básicos, productos de limpieza y papel higiénico.",
      },
    },
    result: {
      heading: "Tu estimación",
      propertySize: "Tamaño de la propiedad",
      pricePerCleaning: "Precio por limpieza",
      frequency: "Frecuencia",
      visits: "Visitas de limpieza",
      visitsValue: "{n} al mes",
      subtotal: "Subtotal antes del descuento",
      discount: "Descuento por frecuencia",
      areaSurcharge: "Superficie adicional",
      youSave: "Ahorras",
      monthlyTotal: "Total mensual estimado",
      perMonth: "/ mes",
      perWeek: "/ semana",
      pricePerWeek: "Precio por semana",
      effective: "Precio efectivo por visita",
    },
    custom: {
      title: "Un hogar distinguido merece un presupuesto a medida.",
      body: "Las propiedades de más de 250 m² requieren un presupuesto personalizado.",
      cta: "Solicitar un presupuesto a medida",
    },
    cta: {
      book: "Reserva tu limpieza",
      quote: "Solicitar un presupuesto personalizado",
    },
    disclaimer:
      "Este es un precio estimado basado en el tamaño de la propiedad y la frecuencia de limpieza seleccionada. El precio final puede variar según el estado de la propiedad, la accesibilidad, los servicios adicionales y los requisitos de limpieza específicos.",
    optionalNote:
      "Servicios opcionales como limpieza a fondo, limpieza de cristales, lavandería, cambio de ropa de cama, limpieza de terrazas y limpieza tras obras pueden cobrarse por separado.",
    materialsNote:
      "Este plan incluye materiales de limpieza básicos, productos y papel higiénico, repuestos en cada visita.",
  },
  enquiry: {
    title: "Reserva tu limpieza",
    quoteTitle: "Solicitar un presupuesto personalizado",
    subtitle: "Comparte algunos datos y confirmaremos tu primera visita en un plazo de 24 horas.",
    summary: "Tu selección",
    fields: {
      name: "Nombre completo",
      email: "Correo electrónico",
      phone: "Teléfono o WhatsApp",
      location: "Ubicación de la propiedad",
      size: "Tamaño de la propiedad (m²)",
      frequency: "Frecuencia de limpieza",
      startDate: "Fecha de inicio preferida",
      message: "Mensaje (opcional)",
      messagePlaceholder: "¿Hay algo que debamos saber sobre tu hogar?",
    },
    required: "Obligatorio",
    invalidEmail: "Introduce una dirección de correo válida.",
    submitWhatsApp: "Enviar por WhatsApp",
    submitEmail: "Enviar por correo",
    cancel: "Cancelar",
    close: "Cerrar",
    successTitle: "Gracias.",
    successBody: "Tus datos están listos para enviar. Elige WhatsApp o correo para completar tu solicitud.",
    monthlyEstimate: "Total mensual estimado",
    customSelected: "Presupuesto a medida (más de 250 m²)",
  },
  mailing: {
    popupHeadline: "Sé el primero en saber cuándo lanzamos",
    popupBody:
      "Únete a nuestra lista de acceso anticipado y te avisaremos en cuanto nuestras suscripciones de limpieza estén disponibles.",
    emailPlaceholder: "Introduce tu correo electrónico",
    button: "Avísame",
    success: "Gracias. Estás en la lista y te avisaremos cuando estemos en marcha.",
    consent:
      "Al suscribirte, aceptas recibir novedades sobre el lanzamiento y el servicio. Puedes darte de baja en cualquier momento.",
    close: "Cerrar",
    errors: {
      invalid_email: "Introduce una dirección de correo válida.",
      rate_limited: "Demasiados intentos. Inténtalo de nuevo en un minuto.",
      captcha_failed: "La verificación falló. Inténtalo de nuevo.",
      consent_required: "Acepta para continuar.",
      server_error: "Algo salió mal. Inténtalo de nuevo en breve.",
      network: "Error de red. Comprueba tu conexión e inténtalo de nuevo.",
    },
    footerEyebrow: "Muy pronto",
    footerTitle: "Llega a algo más que un hogar limpio.",
    footerBody:
      "Deja tu correo y te avisaremos en cuanto nuestras suscripciones de limpieza estén disponibles.",
    confirmedTitle: "Suscripción confirmada",
    confirmedBody: "Gracias por confirmar. Todo listo: te avisaremos cuando estemos en marcha.",
    unsubscribedTitle: "Te has dado de baja",
    unsubscribedBody: "Ya no recibirás novedades del lanzamiento. Puedes volver a unirte cuando quieras.",
    invalidTitle: "Enlace caducado o no válido",
    invalidBody: "Este enlace ya no es válido. Vuelve a suscribirte si quieres recibir novedades.",
    backHome: "Volver al inicio",
  },
  footer: {
    tagline: "Cuidado del hogar y conserjería de propiedades premium en todo Marruecos.",
    quickLinks: "Explora",
    services: "Servicios",
    contact: "Contacto",
    email: "Escríbenos",
    whatsapp: "WhatsApp",
    call: "Llámanos",
    followUs: "Síguenos",
    rights: "Todos los derechos reservados.",
    terms: "Términos",
    privacy: "Privacidad",
    madeWith: "Hecho con cuidado en Marruecos.",
    newsletterTitle: "Llega a algo más que un hogar limpio.",
    newsletterBody: "Consejos ocasionales para cuidar tu hogar. Sin ruido.",
    newsletterPlaceholder: "Tu correo electrónico",
    newsletterCta: "Suscribirse",
  },
};

export default es;

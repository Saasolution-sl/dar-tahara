import type { DeepPartial } from "../types";
import type { Dictionary } from "./en";

/** Spanish: complete translation. */
const es: DeepPartial<Dictionary> = {
  meta: {
    title: "Dar Tahara: Cuidado del hogar y conserjería de propiedades premium",
    description:
      "Dar Tahara es un servicio premium de cuidado del hogar y conserjería de propiedades en Marruecos. Limpieza profesional, inspecciones y mantenimiento para llegar siempre a un hogar de confort.",
    ogAlt: "Dar Tahara: Casa de la Pureza",
  },
  brand: {
    name: "Dar Tahara",
    meaning: "Casa de la Pureza",
    tagline: "Llega siempre a un hogar de confort.",
  },
  nav: {
    about: "Nosotros",
    missionVision: "Misión y Visión",
    peopleCommunity: "Personas y Comunidad",
    why: "Por qué Dar Tahara",
    services: "Servicios",
    plans: "Planes",
    pricing: "Precios",
    how: "Cómo funciona",
    gallery: "Galería",
    faq: "Preguntas frecuentes",
    book: "Reservar Evaluación Inicial",
    login: "Iniciar sesión",
    myAccount: "Mi cuenta",
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
    ctaPrimary: "Reservar Evaluación Inicial",
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
        body: "Un modelo de servicio basado en verificaciones adecuadas para cada función, formación estructurada, custodia discreta de llaves y responsabilidad clara.",
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
      { title: "Custodia de llaves", body: "Procedimientos seguros de custodia de llaves con acceso registrado y aprobado." },
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
      "Planes sencillos y transparentes, con cambios de visita y cancelación gestionados en el portal según las Condiciones. Cada plan incluye informes de inspección y Dar Tahara Support.",
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
      { title: "Limpiamos", body: "La formación estructurada del equipo está concebida para respaldar nuestro estándar distintivo en cada visita." },
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
        q: "¿Cómo verificarán al personal y protegerán las llaves?",
        a: "Nuestro modelo operativo incluye verificaciones adecuadas para cada función y formación estructurada a medida que se lanzan y amplían nuestros servicios. Para los clientes con custodia de llaves, prevemos mantener una cadena de custodia registrada que garantice una responsabilidad clara.",
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
        a: "Actualmente nos centramos en Tetuán, Tánger, Mequinez y Casablanca, con una cobertura en expansión continua. Contáctanos para confirmar tu zona.",
      },
      {
        q: "¿Puedo pausar, cambiar o cancelar mi plan?",
        a: "Una pausa solo puede solicitarse con una suscripción de 9 o 12 meses, sujeta a aprobación. Los cambios de visita permitidos y la cancelación se gestionan en el portal: al menos 48 horas para una visita y un mes para cancelar la suscripción, según las Condiciones.",
      },
      {
        q: "¿Qué productos utilizan?",
        a: "Utilizamos productos profesionales, eficaces y cuidadosamente elegidos, con opciones ecológicas y seguras para las superficies, para acabados delicados y hogares sensibles bajo petición.",
      },
      {
        q: "¿Qué duraciones de suscripción están disponibles?",
        a: "Dar Tahara ofrece suscripciones de duración fija de 3, 6, 9 y 12 meses.",
      },
      {
        q: "¿Las suscripciones más largas cuestan menos?",
        a: "Sí. Los descuentos estándar por duración son 5 % para seis meses, 10 % para nueve meses y 15 % para doce meses. La suscripción de tres meses utiliza el precio estándar.",
      },
      {
        q: "¿Cuándo puede aprobarse una pausa?",
        a: "Una pausa está prevista para circunstancias como obras de construcción, reformas importantes, daños graves a la propiedad o inaccesibilidad temporal.",
      },
      {
        q: "¿Puedo pausar porque estoy de viaje?",
        a: "Las vacaciones, los viajes, la ausencia temporal, la baja ocupación o no necesitar limpieza temporalmente no suelen ser elegibles.",
      },
      {
        q: "¿Qué ocurre con mi contrato durante una pausa?",
        a: "La limpieza y la facturación recurrente se suspenden durante el período aprobado, y la fecha de finalización del contrato se amplía según ese mismo período.",
      },
      {
        q: "¿Puedo usar dos pausas separadas de un mes?",
        a: "No. El beneficio permite una única pausa de hasta dos meses consecutivos por contrato.",
      },
      {
        q: "¿Una pausa no utilizada se traslada?",
        a: "No. Una pausa no utilizada no tiene valor monetario y no se traslada a otro contrato.",
      },
    ],
  },
  cta: {
    eyebrow: "Listos cuando tú lo estés",
    title: "Llega siempre a un hogar de confort.",
    subtitle:
      "Deja que cuidemos tu hogar, para que nunca tengas que pensar en él. Reserva una primera visita o solicita hoy un presupuesto a medida.",
    ctaPrimary: "Reservar Evaluación Inicial",
    whatsapp: "Chatear por WhatsApp",
    whatsappInfo: "Habla con el asistente de Dar Tahara por WhatsApp sobre servicios, precios, suscripciones, acceso a la propiedad y reservas. Las solicitudes de soporte complejas pueden enviarse por correo a Dar Tahara Support.",
    whatsappPrivacy: "Es un asistente automatizado. No envíes datos de pago, contraseñas ni códigos de acceso completos.",
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
    durationLabel: "Duración de la suscripción",
    durationHelp: "Elige cuánto tiempo quieres comprometerte: los plazos más largos ahorran más.",
    duration: {
      "3_month": { name: "3 meses", tag: "Inicio flexible" },
      "6_month": { name: "6 meses", tag: "Ahorra 5 %" },
      "9_month": { name: "9 meses", tag: "Ahorra 10 %" },
      "12_month": { name: "12 meses", tag: "Ahorra 15 %" },
      bestValue: "Mejor opción",
      pauseBenefit: "Beneficio de pausa",
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
      contractDuration: "Contrato",
      priceBeforeDuration: "Precio antes del ajuste por duración",
      durationDiscount: "Descuento de contrato",
      durationSavings: "Ahorras",
      minimumContractValue: "Valor mínimo del contrato",
      pauseBenefitNote: "Una pausa aprobada de hasta dos meses consecutivos",
      chooseDuration: "Elige una duración de suscripción para ver el precio de tu contrato.",
    },
    custom: {
      title: "Un hogar distinguido merece una evaluación individual.",
      body: "Las propiedades de más de 250 m² se revisan individualmente antes de preparar una propuesta.",
      cta: "Solicitar una evaluación",
    },
    cta: {
      book: "Reserva la Evaluación Inicial",
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
  booking: {
    title: "Reserva tu Evaluación inicial del hogar",
    subtitle:
      "Tu primera visita nos permite evaluar profesionalmente tu hogar, realizar una primera limpieza a fondo si es necesario y preparar tu plan de limpieza personalizado.",
    close: "Cerrar",
    pay: "Enviar solicitud de evaluación",
    paySecure:
      "Pago seguro con Stripe. Tu suscripción comienza solo después de completar y aprobar tu Evaluación inicial del hogar.",
    summary: {
      heading: "Tu selección",
      propertySize: "Tamaño de la propiedad",
      frequency: "Frecuencia de limpieza",
      duration: "Duración de la suscripción",
      durationDiscount: "Descuento de contrato",
      minimumContractValue: "Valor mínimo del contrato",
      estMonthly: "Suscripción mensual estimada",
      assessment: "Evaluación única del hogar",
      doorlockInstallation: "Instalación de cerradura inteligente",
      dueToday: "A pagar hoy",
      fromAfterAssessment: "Tu plan final se confirma tras la evaluación.",
    },
    billing: {
      label: "Facturación continua preferida",
      monthly: "Mensual",
      monthlyNote: "Pagar cada mes",
      annual: "Anual",
      annualNote: "Pagar una vez al año",
      save: "Ahorra 5%",
    },
    steps: { visit: "Tu visita", home: "Tu hogar", details: "Tus datos" },
    visit: {
      preferredDate: "Fecha preferida",
      alternateDate: "Fecha alternativa (opcional)",
      timeSlot: "Horario preferido",
      morning: "Mañana",
      afternoon: "Tarde",
      flexible: "Flexible",
    },
    fields: {
      size: "Tamaño de la propiedad",
      condition: "Estado de la propiedad",
      bedrooms: "Dormitorios",
      bathrooms: "Baños",
      accessNotes: "Notas de acceso (opcional)",
      accessNotesPlaceholder: "Aparcamiento, llaves, códigos de puerta: cualquier cosa que debamos saber",
      pets: "Hay mascotas en la vivienda",
      petDetails: "Detalles de mascotas",
      petDetailsPlaceholder: "Tipo y número de mascotas",
      smoking: "Se fuma en la vivienda",
      fullName: "Nombre completo",
      email: "Correo electrónico",
      phone: "Teléfono / WhatsApp",
      city: "Ciudad",
      addressLine1: "Dirección",
      addressLine2: "Piso, planta (opcional)",
      postalCode: "Código postal (opcional)",
    },
    doorlock: {
      title: "Instalación de cerradura inteligente",
      label: "Reservar instalación opcional de cerradura inteligente",
      body:
        "Podemos organizar la instalación de una cerradura inteligente con Wi-Fi por unos 200 € durante o después de la evaluación.",
      benefit:
        "Una cerradura inteligente da al propietario más flexibilidad y tranquilidad: nadie necesita una copia física de las llaves y el acceso del personal puede desactivarse después de cada limpieza.",
      internetRequired: "La vivienda debe tener una conexión a internet activa.",
      confirmation:
        "Confirmo que la vivienda tiene internet para conectar la cerradura inteligente.",
    },
    condition: {
      excellent: "Excelente",
      standard: "Estándar",
      needs_attention: "Requiere atención",
      heavy: "Necesita limpieza intensa",
    },
    legal: {
      accuracy:
        "Confirmo que la información anterior: tamaño, dormitorios, baños, mascotas, tabaco y estado: es exacta.",
      termsLink: "Términos y condiciones",
      privacyLink: "Política de privacidad",
      note: "Dar Tahara puede verificar esta información durante la evaluación y ajustar el plan continuo cuando la propiedad difiera de forma significativa.",
    },
    errors: {
      invalid_customer: "Añade tu nombre, un correo válido y un número de teléfono.",
      invalid_property: "Completa tu dirección y los datos de la propiedad.",
      invalid_booking: "Elige una fecha y hora para tu visita.",
      invalid_duration: "Elige una duración de suscripción para continuar.",
      pet_details_required: "Añade algunos detalles sobre tus mascotas.",
      doorlock_internet_required: "Confirme que la vivienda tiene conexión a internet para la cerradura inteligente.",
      legal_acceptance_required: "Confirma los datos y acepta los términos para continuar.",
      rate_limited: "Demasiados intentos. Inténtalo de nuevo en un minuto.",
      checkout_not_configured: "Las solicitudes no están disponibles: únase al acceso anticipado.",
      checkout_failed: "No pudimos enviar su solicitud. Inténtelo de nuevo.",
      network: "Error de red. Comprueba tu conexión e inténtalo de nuevo.",
    },
  },
  consent: {
    message:
      "Utilizamos cookies analíticas para entender cómo se usa nuestro sitio. Si rechazas, no cambia nada: el sitio funciona exactamente igual.",
    accept: "Aceptar",
    decline: "Rechazar",
    privacy: "Política de privacidad",
    aria: "Consentimiento de cookies",
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
  assistant: {
    chat: {
      title: "Asistente Dar Tahara",
      subtitle:
        "Hola, soy el concierge virtual de Dar Tahara. Puedo explicar servicios, precios, la Evaluación Inicial, facturación y pasos de reserva.",
      open: "Preguntar a Dar Tahara",
      close: "Cerrar asistente",
      placeholder: "Pregunte sobre precios, reservas o servicios…",
      send: "Enviar",
      automated: "Asistente automático",
      human: "Especialista Dar Tahara",
      error: "Lo siento, no se pudo completar la solicitud. Inténtelo de nuevo; la conversación se ha conservado.",
      quickActions: [
        "¿Cómo funciona la primera visita?",
        "Calcular mi precio",
        "¿Qué está incluido?",
        "Reservar evaluación",
        "¿Mensual o anual?",
        "Hablar con especialista",
      ],
    },
  },
  missionVision: {
    meta: {
      title: "Misión y Visión",
      description:
        "Dar Tahara combina profesionales cualificados, tecnología innovadora y un servicio transparente para redefinir la limpieza residencial en Marruecos. Descubre nuestra misión, visión, valores y compromisos.",
      ogAlt: "Dar Tahara: Misión y Visión",
    },
    breadcrumb: { home: "Inicio", current: "Misión y Visión", label: "Ruta de navegación" },
    hero: {
      eyebrow: "Misión y Visión",
      title: "Hogares más limpios. Una confianza más sólida.",
      subtitle:
        "Dar Tahara combina profesionales cualificados, tecnología innovadora y un servicio transparente para redefinir la limpieza residencial en Marruecos.",
      ctaPrimary: "Reservar Evaluación Inicial",
      ctaSecondary: "Conocer nuestros servicios",
      imageAlt: "Una vivienda marroquí moderna cuidada por el equipo profesional de Dar Tahara",
    },
    mission: {
      eyebrow: "Nuestra misión",
      title: "Un hogar limpio da tranquilidad.",
      lead: "Nuestra misión es ofrecer servicios de limpieza fiables, transparentes e impulsados por la tecnología que mejoren la calidad de vida de cada cliente.",
      body: [
        "Creemos que un hogar limpio da tranquilidad.",
        "Combinando la formación estructurada del equipo con tecnología inteligente, control de calidad y una atención al cliente excepcional, aspiramos a ser la empresa de limpieza premium más fiable de Marruecos.",
      ],
    },
    vision: {
      eyebrow: "Nuestra visión",
      title: "Un nuevo estándar para los servicios del hogar en Marruecos.",
      lead: "Convertirnos en la principal empresa marroquí de servicios para el hogar impulsada por la tecnología, estableciendo nuevos estándares de confianza, profesionalidad, seguridad y experiencia de cliente.",
      body: [
        "Nuestra visión a largo plazo es expandirnos por todo Marruecos invirtiendo continuamente en innovación, en el desarrollo de nuestros empleados y en operaciones sostenibles.",
      ],
    },
    values: {
      eyebrow: "Nuestros valores",
      title: "Los principios detrás de cada visita.",
      subtitle:
        "Seis compromisos que definen cómo contratamos, cómo formamos y cómo cuidamos tu hogar.",
      items: [
        { title: "Confianza", body: "Nos ganamos la confianza con honestidad, transparencia y constancia." },
        { title: "Calidad", body: "Cada visita debe cumplir el mismo alto estándar." },
        { title: "Respeto", body: "Respetamos a nuestros clientes, sus hogares y nuestros empleados." },
        {
          title: "Innovación",
          body: "La tecnología debe mejorar tanto la experiencia del cliente como la eficiencia del equipo.",
        },
        {
          title: "Profesionalidad",
          body: "Nos comprometemos con una formación estructurada y continua del equipo al servicio de una atención excepcional.",
        },
        {
          title: "Sostenibilidad",
          body: "Reducimos continuamente los residuos y elegimos prácticas responsables con el medio ambiente siempre que es posible.",
        },
      ],
    },
    promises: {
      eyebrow: "Nuestros compromisos",
      title: "Aquello con lo que cada cliente puede contar.",
      subtitle: "Compromisos claros, cumplidos igual en cada hogar y en cada visita.",
      items: [
        {
          title: "Prometemos profesionalidad",
          body: "Nuestro objetivo es que cada profesional complete una formación estructurada antes de entrar en el hogar de un cliente.",
        },
        {
          title: "Prometemos transparencia",
          body: "Sin costes ocultos, precios claros, facturas digitales y comunicación transparente.",
        },
        {
          title: "Prometemos seguridad",
          body: "La privacidad y los bienes del cliente se tratan con el máximo cuidado.",
        },
        {
          title: "Prometemos fiabilidad",
          body: "Llegamos preparados, seguimos procedimientos estructurados y supervisamos la calidad del servicio de forma continua.",
        },
        {
          title: "Prometemos innovación",
          body: "Invertimos en tecnología que mejora la planificación, la comunicación, el control de calidad y la satisfacción del cliente.",
        },
        {
          title: "Prometemos mejora continua",
          body: "Los comentarios de los clientes ayudarán a definir nuestros procesos y nuestro enfoque del desarrollo del equipo.",
        },
      ],
    },
    inclusion: {
      eyebrow: "Igualdad, diversidad e inclusión",
      title: "El talento, la dedicación y la profesionalidad son lo que más importa.",
      body: [
        "En Dar Tahara creemos que el talento, la dedicación y la profesionalidad son lo que más importa.",
        "Nos comprometemos con la igualdad de oportunidades con independencia del género, la edad, el origen étnico, la religión, la discapacidad o la trayectoria personal.",
        "Estamos construyendo un entorno de trabajo inclusivo basado en la dignidad, la equidad y el respeto mutuo.",
        "Nuestro objetivo es que las decisiones de selección, formación y desarrollo profesional se basen en el mérito, el desempeño y el potencial.",
        "Al abrazar la diversidad y la inclusión construimos equipos más fuertes, comunidades más sólidas y mejores experiencias para el cliente.",
      ],
    },
    people: {
      eyebrow: "Nuestro equipo",
      title: "Nuestro compromiso con el empleo responsable.",
      subtitle:
        "Nos comprometemos a construir un entorno laboral basado en la dignidad, la equidad, la transparencia y el desarrollo profesional.",
      items: [
        {
          title: "Relaciones laborales formales",
          body: "Estamos trabajando para establecer relaciones laborales formales y debidamente documentadas para los miembros del equipo que cumplan los requisitos.",
        },
        {
          title: "Registro en la CNSS",
          body: "A medida que crecen nuestras operaciones, trabajamos para que los empleados que cumplan los requisitos se registren en el Fondo Nacional de Seguridad Social de Marruecos (Caisse Nationale de Sécurité Sociale: CNSS), conforme a los requisitos legales y laborales aplicables.",
        },
        {
          title: "Cobertura AMO aplicable",
          body: "Nuestro objetivo de implantación incluye la cobertura sanitaria aplicable del Seguro Médico Obligatorio (Assurance Maladie Obligatoire: AMO) para los empleados que cumplan los requisitos a través del sistema de la CNSS.",
        },
        {
          title: "Condiciones laborales claras",
          body: "Trabajamos para establecer responsabilidades y condiciones laborales claras basadas en la dignidad, la equidad y la transparencia.",
        },
        {
          title: "Desarrollo estructurado",
          body: "Nuestro modelo de empleo se está construyendo en torno a la formación estructurada y el desarrollo profesional.",
        },
        {
          title: "Métodos de trabajo seguros",
          body: "Aspiramos a proporcionar métodos de trabajo seguros y equipos adecuados para cada función.",
        },
        {
          title: "Igualdad de oportunidades",
          body: "Nos comprometemos con la igualdad de oportunidades basada en el mérito, el rendimiento y el potencial.",
        },
        {
          title: "Trato respetuoso",
          body: "Cada miembro del equipo debe recibir un trato digno y respetuoso.",
        },
      ],
      clarification:
        "Nuestras prácticas y prestaciones laborales se implantarán según la función, la situación laboral, la elegibilidad, la fase operativa y la legislación marroquí aplicable.",
    },
    impact: {
      eyebrow: "Impacto social",
      title: "Construir un modelo de empleo responsable.",
      subtitle:
        "Dar Tahara aspira a crear empleo significativo y gestionado profesionalmente en las comunidades a las que servimos. Invertimos en formación estructurada, prácticas de trabajo seguras, desarrollo profesional y relaciones laborales respetuosas.",
      items: [
        "A medida que crecen nuestras operaciones, avanzamos hacia un modelo de empleo formal en el que los miembros del equipo que cumplan los requisitos estén registrados en el sistema marroquí de seguridad social de la CNSS, incluida la cobertura sanitaria AMO aplicable, conforme a los requisitos legales y laborales.",
        "Nuestro objetivo es contribuir a elevar los estándares de un sector en el que el trabajo informal y no declarado sigue siendo habitual, creando a la vez oportunidades más seguras, estables y gratificantes para nuestros equipos.",
      ],
    },
    comparison: {
      eyebrow: "¿Por qué Dar Tahara?",
      title: "Un estándar de servicio diferente.",
      subtitle:
        "La diferencia entre un acuerdo de limpieza tradicional y un servicio del hogar moderno impulsado por la tecnología.",
      traditionalTitle: "Empresa de limpieza tradicional",
      brandTitle: "Dar Tahara",
      traditional: [
        "Calidad de servicio irregular",
        "Pagos en efectivo",
        "Comunicación limitada",
        "Administración manual",
        "Sin portal del cliente",
        "Sin soporte con IA",
        "Poco control de calidad",
        "Transparencia mínima",
      ],
      brand: [
        "Servicios por suscripción",
        "Portal digital del cliente",
        "Atención al cliente con IA",
        "Control de calidad digital",
        "Facturas online",
        "Planificación profesional",
        "Operaciones impulsadas por la tecnología",
        "Comunicación transparente",
        "Compromiso con la formación estructurada del equipo",
        "Modelo de empleo responsable en desarrollo",
        "Experiencia de cliente moderna",
      ],
    },
    sustainability: {
      eyebrow: "Sostenibilidad",
      title: "Progreso que respeta el planeta.",
      subtitle:
        "La responsabilidad medioambiental está integrada en cómo planificamos, limpiamos y gestionamos.",
      items: [
        { title: "Rutas más inteligentes", body: "Planificación optimizada de rutas para reducir desplazamientos innecesarios." },
        {
          title: "Productos responsables",
          body: "Productos de limpieza respetuosos con el medio ambiente siempre que es posible.",
        },
        { title: "Sin papel por diseño", body: "Administración sin papel mediante sistemas digitales." },
        { title: "Menos residuos", body: "Procesos eficientes que minimizan los residuos." },
        {
          title: "Inversión a largo plazo",
          body: "Inversión continua en prácticas empresariales sostenibles.",
        },
      ],
    },
    closing: {
      eyebrow: "Más que limpieza",
      title: "Más que limpieza",
      body: [
        "Dar Tahara está construyendo un nuevo estándar de limpieza del hogar en Marruecos.",
        "Combinando profesionales cualificados, tecnología innovadora y un cuidado genuino por nuestros clientes, entregamos más que un hogar limpio: entregamos tranquilidad.",
      ],
      ctaPrimary: "Reserva tu Evaluación Inicial",
      ctaSecondary: "Descubre nuestros servicios",
    },
    teaser: {
      eyebrow: "¿Por qué Dar Tahara?",
      title: "Más que limpieza.",
      body: "Profesionales cualificados, tecnología innovadora y un servicio transparente: unidos para redefinir la limpieza residencial en Marruecos.",
      cta: "Lee nuestra misión y visión",
      points: [
        "Operaciones impulsadas por la tecnología",
        "Precios transparentes por suscripción",
        "Compromiso con la formación estructurada del equipo",
      ],
    },
  },
  peopleCommunity: {
    meta: {
      title: "Personas y Comunidad",
      description:
        "Descubre cómo Dar Tahara combina la limpieza profesional del hogar, la verificación de sus empleados, el acceso controlado a la vivienda y el empleo local estable en Marruecos.",
      ogAlt: "Dar Tahara: Personas y Comunidad",
    },
    breadcrumb: {
      home: "Inicio",
      current: "Personas y Comunidad",
      label: "Ruta de navegación",
    },
    hero: {
      eyebrow: "Personas y Comunidad",
      title: "Hogares limpios. Comunidades apoyadas.",
      subtitle:
        "En Dar Tahara creemos que un servicio de limpieza profesional debe hacer más que dejar una casa limpia. Combinamos el cuidado profesional del hogar con empleo local estable, condiciones de trabajo justas y un servicio diseñado en torno a la confianza.",
      ctaPrimary: "Únete al acceso anticipado",
      ctaSecondary: "Lee nuestra misión y visión",
      imageAlt: "Una profesional de limpieza de Dar Tahara prepara una vivienda marroquí",
      highlights: ["Equipos locales", "Personal verificado", "Acceso ligado a la cita"],
    },
    employment: {
      eyebrow: "Empleo local",
      title: "Personas del lugar al servicio de su comunidad",
      lead: "Dar Tahara aspira a formar sus equipos de limpieza en las ciudades y zonas circundantes donde operamos. Siempre que es posible, los empleados trabajan dentro de su área operativa local, cerca de las viviendas que cuidan.",
      items: [
        {
          title: "Empleo dentro de la propia comunidad",
          body: "Cuando Dar Tahara abre en una ciudad, miramos primero a esa ciudad y a su entorno para formar el equipo que la atenderá.",
        },
        {
          title: "Un trabajo más previsible",
          body: "Las suscripciones recurrentes generan citas recurrentes, lo que nos permite planificar los horarios con antelación en lugar de ofrecer trabajos sueltos e irregulares.",
        },
        {
          title: "Menos desplazamientos innecesarios",
          body: "Asignar a los empleados dentro de su área operativa local, cuando es posible, reduce los trayectos largos y les devuelve parte de su día.",
        },
        {
          title: "Equipos locales estables",
          body: "Los equipos que conocen su ciudad y sus barrios construyen familiaridad, constancia y una responsabilidad real hacia los clientes a los que atienden.",
        },
        {
          title: "Un crecimiento que crea empleo local",
          body: "Cada cliente recurrente adicional en una ciudad añade horas de limpieza en esa misma ciudad, y esas horas son las que crean puestos locales adicionales.",
        },
      ],
      flow: {
        title: "Cómo el crecimiento se convierte en empleo local",
        steps: [
          "Más clientes",
          "Más citas de limpieza recurrentes",
          "Más empleos locales estables",
        ],
        note: "Este es el mecanismo que sostiene nuestro modelo de empleo: una demanda previsible es lo que hace posible un empleo previsible.",
      },
      customerNote:
        "Al elegir Dar Tahara obtienes un servicio de limpieza profesional y seguro y, al mismo tiempo, apoyas el empleo local estable en la zona donde vives.",
      disclaimer:
        "La contratación y la asignación locales se aplican siempre que sea operativamente posible dentro de cada área de actividad. Dar Tahara no garantiza que cada empleado resida a una distancia determinada de cada vivienda de cliente.",
    },
    stability: {
      eyebrow: "Empleo justo",
      title: "Un empleo debe aportar estabilidad",
      lead: "Dar Tahara quiere ofrecer algo más que trabajo de limpieza ocasional. Nuestros empleados reciben un salario mensual justo y cobertura sanitaria, lo que contribuye a una mayor estabilidad financiera y al acceso a la atención sanitaria esencial.",
      items: [
        {
          title: "Un salario mensual justo",
          body: "El empleo se construye sobre un salario mensual fijo y no sobre pagos en efectivo inciertos, tarea por tarea.",
        },
        {
          title: "Cobertura sanitaria",
          body: "Nuestro modelo de empleo incluye la cobertura aplicable del Seguro Obligatorio de Enfermedad (AMO) para los empleados elegibles a través del sistema marroquí de la CNSS.",
        },
        {
          title: "Trabajo programado y previsible",
          body: "Las citas recurrentes se planifican con antelación, de modo que los empleados conocen su horario en lugar de esperar a que aparezca trabajo.",
        },
        {
          title: "Incorporación profesional",
          body: "Cada miembro del equipo conoce nuestros estándares, procedimientos y equipos antes de trabajar de forma independiente en la casa de un cliente.",
        },
        {
          title: "Un entorno de trabajo estructurado",
          body: "Responsabilidades claras, condiciones de trabajo definidas, equipamiento adecuado y un coordinador al que acudir.",
        },
      ],
      objective:
        "Nuestro objetivo es sencillo: un empleo lo bastante estable para cubrir las necesidades básicas, con acceso a cobertura sanitaria. Nuestros empleados son profesionales que prestan un servicio profesional, y se les remunera como tales.",
      disclaimer:
        "El salario, los beneficios y la cobertura se aplican según el puesto, la situación laboral, la elegibilidad, la fase operativa y la legislación marroquí aplicable.",
    },
    screening: {
      eyebrow: "Confianza del cliente",
      title: "Personas en las que puedes confiar dentro de tu casa",
      lead: "Dejar entrar a alguien en una vivienda privada exige confianza. Por eso Dar Tahara exige que el personal de limpieza supere con éxito el proceso de verificación de la empresa antes de estar autorizado a trabajar de forma independiente en las viviendas de los clientes.",
      steps: [
        {
          title: "Verificación de identidad",
          body: "Comprobamos la identidad de cada candidato con documentos de identificación oficiales.",
        },
        {
          title: "Verificación de antecedentes laborales",
          body: "Cuando procede, se verifican los empleos anteriores y las referencias antes de que el candidato continúe.",
        },
        {
          title: "Incorporación en Dar Tahara",
          body: "Los candidatos completan nuestro programa de incorporación sobre procedimientos, equipos, privacidad y conducta dentro de la casa del cliente.",
        },
        {
          title: "Estándares profesionales",
          body: "Cada empleado trabaja conforme a un estándar documentado de limpieza, comunicación y respeto por la casa y la privacidad del cliente.",
        },
        {
          title: "Autorización antes del acceso",
          body: "El acceso a la vivienda solo se habilita una vez completados con éxito la verificación y la incorporación.",
        },
      ],
      criminalRecordLabel: "Documento oficial de verificación",
      criminalRecordDocument: "Certificado de Antecedentes Penales",
      criminalRecordBody:
        "Como parte de nuestro proceso de verificación, cada candidato debe aportar un Certificado de Antecedentes Penales válido. El documento forma parte obligatoria de los requisitos de verificación de Dar Tahara, que el candidato debe cumplir con éxito antes de quedar autorizado a trabajar de forma independiente en las viviendas de los clientes.",
      criminalRecordPrivacy:
        "El documento se trata de forma confidencial como parte del expediente personal del empleado. Nunca se comparte con los clientes, y estos no pueden consultarlo ni descargarlo.",
      authorization:
        "Solo el personal que supera con éxito el proceso de verificación e incorporación exigido puede quedar autorizado a trabajar en las casas de los clientes.",
    },
    access: {
      eyebrow: "Acceso controlado a la vivienda",
      title: "La verificación es solo la primera capa de seguridad",
      lead: "Dar Tahara combina la verificación de sus empleados con la tecnología. Para los clientes que utilizan una solución de cerradura inteligente compatible de Dar Tahara, el personal de limpieza no recibe acceso permanente e ilimitado a la vivienda. El acceso está vinculado a la propia cita de limpieza.",
      statement: "Sin cita activa no hay acceso autorizado.",
      steps: [
        {
          title: "Una cita programada",
          body: "El cliente tiene una cita de limpieza en la agenda.",
        },
        {
          title: "Un empleado autorizado",
          body: "Se asigna a esa cita un empleado verificado y autorizado.",
        },
        {
          title: "Acceso para la franja de servicio",
          body: "El acceso a la vivienda se habilita para la franja horaria de servicio correspondiente.",
        },
        {
          title: "Acceso durante el periodo autorizado",
          body: "El empleado utiliza su método de acceso asignado dentro de ese periodo.",
        },
        {
          title: "Restringido fuera de la franja",
          body: "Fuera del periodo autorizado, ese acceso queda restringido.",
        },
        {
          title: "La actividad queda registrada",
          body: "La actividad de acceso se registra asociada a la cita a la que corresponde.",
        },
        {
          title: "Visible para el cliente",
          body: "El cliente puede consultar los registros de cerradura y acceso relativos a su vivienda.",
        },
      ],
      availabilityNote:
        "Este modelo de acceso se aplica a viviendas con una solución de cerradura inteligente compatible de Dar Tahara y se está introduciendo junto con nuestro programa de acceso anticipado, por lo que todavía no está activo en todas las viviendas. La instalación es opcional y está sujeta a una revisión de compatibilidad de la puerta y la cerradura. Las viviendas sin cerradura inteligente compatible siguen utilizando los acuerdos de gestión de llaves pactados.",
    },
    transparency: {
      eyebrow: "Transparencia de acceso",
      title: "Sabe cuándo se accedió a tu vivienda",
      body: "Dar Tahara combina el acceso controlado a la vivienda con registros transparentes. Los clientes que utilizan nuestra solución de cerradura inteligente compatible pueden consultar los registros de acceso pertinentes, lo que aporta transparencia adicional sobre cuándo se accedió a su vivienda.",
      points: [
        {
          title: "Cuándo se produjo el acceso",
          body: "La fecha y la hora en que se accedió a tu vivienda.",
        },
        {
          title: "A qué cita correspondía",
          body: "La cita de limpieza programada con la que se relaciona el acceso.",
        },
        {
          title: "Si ocurrió dentro de la franja de servicio",
          body: "La confirmación de que el acceso tuvo lugar dentro del periodo autorizado.",
        },
      ],
      privacyNote:
        "Los registros de acceso muestran lo relevante para tu vivienda y tus citas. No son una herramienta de vigilancia de empleados concretos, y los datos personales del personal nunca se exponen a los clientes.",
      availabilityNote:
        "Los registros de acceso se ofrecen para viviendas con una solución de cerradura inteligente compatible de Dar Tahara y estarán disponibles a medida que esa solución se implante. Las viviendas sin cerradura inteligente compatible no generan estos registros.",
    },
    trust: {
      eyebrow: "Nuestro compromiso",
      title: "Personal verificado. Acceso programado. Registros transparentes.",
      body: "Cuando confías a alguien el acceso a tu casa, creemos que mereces algo más que una promesa. Dar Tahara combina la verificación de sus empleados, el acceso controlado a la vivienda y unos registros de acceso transparentes para crear un servicio profesional diseñado en torno a la seguridad y la responsabilidad.",
      pillars: [
        {
          title: "Personal verificado",
          body: "Nadie trabaja de forma independiente en la casa de un cliente antes de completar nuestra verificación e incorporación.",
        },
        {
          title: "Acceso programado",
          body: "El acceso está ligado a una cita real y a una franja de servicio definida; nunca se cede de forma permanente.",
        },
        {
          title: "Registros transparentes",
          body: "Puedes consultar la actividad de acceso que corresponde a tu propia vivienda.",
        },
      ],
    },
    impact: {
      eyebrow: "Un modelo, tres resultados",
      title: "Servicio profesional. Empleo responsable. Comunidades locales más fuertes.",
      subtitle:
        "No son dos historias separadas. Una empresa que trata a su gente como profesionales es la misma empresa en la que puedes confiar dentro de tu casa.",
      groups: [
        {
          title: "Para el cliente",
          items: [
            "Limpieza profesional",
            "Personal verificado",
            "Acceso controlado a la vivienda",
            "Mayor transparencia",
          ],
        },
        {
          title: "Para el empleado",
          items: [
            "Empleo estable",
            "Un salario mensual justo",
            "Cobertura sanitaria",
            "Un entorno de trabajo profesional",
          ],
        },
        {
          title: "Para la comunidad",
          items: [
            "Oportunidades de empleo local",
            "Actividad económica local",
            "Competencias y formación profesionales",
            "Empleos creados a medida que Dar Tahara crece",
          ],
        },
      ],
      chain: [
        "Servicio profesional",
        "Empleo responsable",
        "Comunidades locales más fuertes",
      ],
    },
    closing: {
      eyebrow: "Por qué importa",
      title: "Estándares profesionales. Impacto humano.",
      body: [
        "Para nuestros clientes, Dar Tahara significa un servicio de limpieza profesional construido sobre la fiabilidad, la seguridad y la transparencia.",
        "Para nuestros empleados, significa la oportunidad de un trabajo estable, ingresos previsibles y cobertura sanitaria.",
        "Para las comunidades a las que servimos, significa que el crecimiento de Dar Tahara puede crear empleo directamente en la propia zona.",
      ],
      statement: "Un hogar más limpio. Un servicio más seguro. Una comunidad local más fuerte.",
      ctaPrimary: "Únete al acceso anticipado",
      ctaSecondary: "Lee nuestra misión y visión",
    },
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
    madeWith: "Crafted with care by SaaSolution SL.",
    newsletterTitle: "Llega a algo más que un hogar limpio.",
    newsletterBody: "Consejos ocasionales para cuidar tu hogar. Sin ruido.",
    newsletterPlaceholder: "Tu correo electrónico",
    newsletterCta: "Suscribirse",
  },
};

export default es;

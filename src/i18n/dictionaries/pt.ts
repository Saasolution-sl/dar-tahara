import type { DeepPartial } from "../types";
import type { Dictionary } from "./en";

/** Portuguese: complete translation. */
const pt: DeepPartial<Dictionary> = {
  meta: {
    title: "Dar Tahara: Cuidado premium do lar e concierge de imóveis",
    description:
      "A Dar Tahara é um serviço premium de cuidado do lar e concierge de imóveis em Marrocos. Limpeza profissional, inspeções e manutenção para chegar sempre a um lar de conforto.",
    ogAlt: "Dar Tahara: Casa da Pureza",
  },
  brand: {
    name: "Dar Tahara",
    meaning: "Casa da Pureza",
    tagline: "Chegue sempre a um lar de conforto.",
  },
  nav: {
    about: "Sobre nós",
    missionVision: "Missão e Visão",
    peopleCommunity: "Pessoas e Comunidade",
    why: "Porquê a Dar Tahara",
    services: "Serviços",
    plans: "Planos",
    pricing: "Preços",
    how: "Como funciona",
    gallery: "Galeria",
    faq: "Perguntas frequentes",
    book: "Reservar Avaliação Inicial",
    login: "Iniciar sessão",
    myAccount: "A minha conta",
    menu: "Menu",
    close: "Fechar",
    language: "Idioma",
    theme: "Tema",
  },
  hero: {
    eyebrow: "Cuidado do lar e concierge de imóveis",
    title: "A sua casa merece mais do que limpeza: merece um cuidado excecional.",
    subtitle:
      "Para proprietários, expatriados e donos de casas de férias em todo Marrocos. Limpamos, inspecionamos e mantemos o seu imóvel com precisão discreta: para que regresse ao conforto, nunca à preocupação.",
    ctaPrimary: "Reservar Avaliação Inicial",
    ctaTertiary: "Saber mais",
    stat1Value: "500+",
    stat1Label: "Casas cuidadas",
    stat2Value: "12 anos",
    stat2Label: "Antiguidade média dos clientes",
    stat3Value: "24 h",
    stat3Label: "Tempo de resposta",
    imageAlt: "Uma sala serena e cheia de luz, preparada na perfeição",
  },
  why: {
    eyebrow: "Porquê a Dar Tahara",
    title: "Tranquilidade, entregue à sua porta.",
    subtitle:
      "Dar Tahara significa Casa da Pureza. Não somos uma empresa de limpeza: somos os guardiões de confiança da sua casa na sua ausência e a razão pela qual tudo parece simples quando regressa.",
    pillars: [
      {
        title: "Confiança absoluta",
        body: "Um modelo de serviço assente em verificações adequadas a cada função, formação estruturada, guarda discreta de chaves e responsabilidade clara.",
      },
      {
        title: "Qualidade sem compromissos",
        body: "Um padrão meticuloso aplicado a cada superfície, cada detalhe: inspecionado, fotografado e validado.",
      },
      {
        title: "Sem esforço para si",
        body: "Um único ponto de contacto, atualizações proativas e uma casa que, simplesmente e com serenidade, está pronta antes de chegar.",
      },
      {
        title: "Discrição total",
        body: "A sua casa, a sua agenda e a sua privacidade são tratadas com a confidencialidade de um concierge privado.",
      },
    ],
  },
  services: {
    eyebrow: "O que fazemos",
    title: "Cuidado completo para cada canto da sua casa.",
    subtitle:
      "De uma única limpeza impecável à gestão completa da sua casa de férias: escolha exatamente o que o seu imóvel precisa.",
    items: [
      { title: "Limpeza premium", body: "Uma limpeza requintada de cima a baixo, adaptada a casas e acabamentos de excelência." },
      { title: "Limpeza periódica", body: "Manutenção semanal ou quinzenal que mantém a sua casa sempre impecável." },
      { title: "Entrada / saída de imóvel", body: "Uma entrega impecável, seja a chegar, a sair ou entre inquilinos." },
      { title: "Inspeções ao imóvel", body: "Visitas programadas com relatórios fotográficos sobre o estado da sua casa." },
      { title: "Verificações de manutenção", body: "Verificações proativas de canalização, eletrodomésticos e segurança antes que surjam problemas." },
      { title: "Guarda de chaves", body: "Procedimentos seguros de guarda de chaves com acesso registado e aprovado." },
      { title: "Preparação de casa de férias", body: "Casas prontas à chegada: roupa de cama fresca, essenciais repostos, temperatura perfeita." },
      { title: "Lavandaria e roupa de casa", body: "Lavandaria ao nível de hotel, engomadoria e roupa de cama impecável preparada a pedido." },
      { title: "Limpeza profunda", body: "Uma limpeza intensiva e restauradora para renovações sazonais e ocasiões especiais." },
      { title: "Limpeza pós-obras", body: "Pó, resíduos e detritos removidos para revelar o seu espaço terminado." },
      { title: "Limpeza de emergência", body: "Resposta rápida para hóspedes de última hora, eventos ou imprevistos." },
      { title: "Gestão de casa de férias", body: "Cuidado integral da sua segunda casa, gerida como se fosse nossa." },
    ],
  },
  plans: {
    eyebrow: "Planos de subscrição",
    title: "Cuidado a um ritmo que se adapta à sua vida.",
    subtitle:
      "Planos simples e transparentes, com alterações de visitas e cancelamento geridos no portal segundo as Condições. Cada plano inclui relatórios de inspeção e Dar Tahara Support.",
    perMonthNote: "Preço personalizado consoante a área e as necessidades do imóvel.",
    mostPopular: "Mais popular",
    cta: "Escolher plano",
    items: [
      {
        name: "Semanal",
        tagline: "Para casas sempre em uso",
        features: ["Limpeza premium semanal", "Mudança de roupa de cama e lavandaria", "Relatório de inspeção em cada visita", "Agendamento prioritário"],
      },
      {
        name: "Quinzenal",
        tagline: "O equilíbrio ponderado",
        features: ["Limpeza a cada duas semanas", "Verificações pontuais de manutenção", "Relatório de inspeção com fotos", "Reagendamento flexível"],
      },
      {
        name: "Mensal",
        tagline: "Para uma manutenção ligeira",
        features: ["Limpeza profunda mensal", "Inspeção completa do imóvel", "Revisão de manutenção sazonal", "Coordenador dedicado"],
      },
      {
        name: "Personalizado",
        tagline: "Totalmente construído em torno de si",
        features: ["Frequência de visita à medida", "Concierge completo e guarda de chaves", "Gestão de casa de férias", "Um único ponto de contacto"],
      },
    ],
  },
  how: {
    eyebrow: "Como funciona",
    title: "Seis passos serenos rumo a uma casa que cuida de si mesma.",
    steps: [
      { title: "Reservar", body: "Conte-nos sobre a sua casa e o seu ritmo num pedido de dois minutos." },
      { title: "Visitamos", body: "Um coordenador visita-o para compreender o seu espaço e as suas preferências." },
      { title: "Limpamos", body: "A formação estruturada da equipa foi concebida para apoiar o nosso padrão distintivo em cada visita." },
      { title: "Inspecionamos", body: "Cada visita termina com uma inspeção documentada e fotografada." },
      { title: "Chega", body: "Regresse a roupa de cama fresca, um ambiente sereno e tudo no seu lugar." },
      { title: "Desfrute", body: "Descontraia, reconecte-se e simplesmente desfrute do conforto de casa." },
    ],
  },
  audiences: {
    eyebrow: "De quem cuidamos",
    title: "A confiança de quem valoriza o seu tempo e a sua casa.",
    items: [
      { title: "Pessoas que vivem no estrangeiro", body: "A sua casa marroquina, impecável e pronta entre visitas." },
      { title: "Profissionais ocupados", body: "Recupere os seus serões e fins de semana: nós tratamos do resto." },
      { title: "Famílias", body: "Uma casa saudável e impecável para se focar no que importa." },
      { title: "Donos de casas de férias", body: "Chegue a uma casa onde as férias parecem ter começado mais cedo." },
      { title: "Anfitriões de Airbnb", body: "Rotações de cinco estrelas, reposição e apresentação pronta para hóspedes." },
      { title: "Investidores imobiliários", body: "Ativos protegidos, inspecionados e mantidos para preservar o seu valor." },
    ],
  },
  testimonials: {
    eyebrow: "Por palavras deles",
    title: "A confiança serena de uma casa bem cuidada.",
    items: [
      {
        quote:
          "Vivo em Bruxelas e só visito Tânger algumas vezes por ano. Agora chego a uma casa que se sente estimada. Nunca mais me preocupo com ela.",
        name: "Yasmine B.",
        role: "Proprietária, Tânger",
      },
      {
        quote:
          "Os relatórios de inspeção são extraordinários. Fotos, notas, tudo documentado. É como ter um gestor de imóveis e uma governanta num só.",
        name: "Thomas R.",
        role: "Investidor, Marraquexe",
      },
      {
        quote:
          "As nossas avaliações no Airbnb mencionam agora a limpeza em quase todos os comentários. A Dar Tahara elevou simplesmente o nosso padrão.",
        name: "Karim e Sofia",
        role: "Anfitriões, Casablanca",
      },
    ],
  },
  gallery: {
    eyebrow: "Antes e depois",
    title: "A diferença está nos detalhes.",
    subtitle: "Um vislumbre do padrão que levamos a cada casa.",
    before: "Antes",
    after: "Depois",
    items: [
      { label: "Restauro da sala" },
      { label: "Limpeza profunda da cozinha" },
      { label: "Renovação da suíte principal" },
    ],
  },
  faq: {
    eyebrow: "Bom saber",
    title: "Perguntas frequentes",
    items: [
      {
        q: "Como verificarão a equipa e protegerão as chaves?",
        a: "O nosso modelo operacional inclui verificações adequadas a cada função e formação estruturada à medida que os nossos serviços são lançados e crescem. Para clientes com guarda de chaves, planeamos manter uma cadeia de custódia registada para uma responsabilidade clara.",
      },
      {
        q: "Como funciona a guarda de chaves?",
        a: "Guardamos as suas chaves em segurança e acedemos à sua casa apenas para visitas agendadas ou aprovadas. Cada entrada e saída é registada, e recebe um relatório após cada visita.",
      },
      {
        q: "Podem preparar a minha casa antes de eu chegar?",
        a: "Sim. Partilhe os detalhes da sua chegada e garantiremos roupa de cama fresca, uma casa impecável, uma temperatura agradável e quaisquer essenciais que solicite: prontos no momento em que entrar.",
      },
      {
        q: "Que cidades servem?",
        a: "Atualmente, concentramo-nos em Tetuão, Tânger, Meknès e Casablanca, com uma cobertura em expansão contínua. Contacte-nos para confirmar a sua zona.",
      },
      {
        q: "Posso pausar, alterar ou cancelar o meu plano?",
        a: "Uma pausa só pode ser solicitada com uma subscrição de 9 ou 12 meses, sujeita a aprovação. As alterações de visitas permitidas e o cancelamento são geridos no portal: pelo menos 48 horas para uma visita e um mês para cancelar a subscrição, segundo as Condições.",
      },
      {
        q: "Que produtos utilizam?",
        a: "Utilizamos produtos profissionais, eficazes e criteriosamente escolhidos, com opções ecológicas e seguras para as superfícies, para acabamentos delicados e lares sensíveis mediante pedido.",
      },
      {
        q: "Que durações de subscrição estão disponíveis?",
        a: "A Dar Tahara oferece subscrições de duração fixa de 3, 6, 9 e 12 meses.",
      },
      {
        q: "As subscrições mais longas custam menos?",
        a: "Sim. Os descontos padrão por duração são 5% para seis meses, 10% para nove meses e 15% para doze meses. A subscrição de três meses utiliza o preço padrão.",
      },
      {
        q: "Quando pode ser aprovada uma pausa?",
        a: "Uma pausa destina-se a situações como obras de construção, renovação significativa, danos graves no imóvel ou inacessibilidade temporária.",
      },
      {
        q: "Posso pausar porque estou de viagem?",
        a: "Férias comuns, viagens, ausência temporária, baixa ocupação ou não precisar de limpeza temporariamente normalmente não são elegíveis.",
      },
      {
        q: "O que acontece ao meu contrato durante uma pausa?",
        a: "A limpeza e a faturação recorrente são suspensas durante o período aprovado, e a data de término do contrato é prolongada pelo mesmo período.",
      },
      {
        q: "Posso usar duas pausas separadas de um mês?",
        a: "Não. O benefício permite uma única pausa de até dois meses consecutivos por contrato.",
      },
      {
        q: "Uma pausa não utilizada transita?",
        a: "Não. Uma pausa não utilizada não tem valor monetário e não transita para outro contrato.",
      },
    ],
  },
  cta: {
    eyebrow: "Prontos quando estiver",
    title: "Chegue sempre a um lar de conforto.",
    subtitle:
      "Deixe-nos cuidar da sua casa, para que nunca tenha de pensar nela. Reserve uma primeira visita ou peça hoje um orçamento à medida.",
    ctaPrimary: "Reservar Avaliação Inicial",
    whatsapp: "Falar no WhatsApp",
    whatsappInfo: "Fale com o assistente Dar Tahara no WhatsApp sobre serviços, preços, subscrições, acesso à propriedade e reservas. Os pedidos de suporte complexos podem ser enviados por e-mail para Dar Tahara Support.",
    whatsappPrivacy: "Este é um assistente automatizado. Não envie dados de pagamento, palavras-passe ou códigos de acesso completos.",
  },
  calculator: {
    eyebrow: "Preços transparentes",
    title: "Estime o seu cuidado mensal.",
    subtitle:
      "Desloque o cursor e escolha um ritmo. A sua estimativa atualiza-se instantaneamente: sem registo, sem surpresas.",
    sizeLabel: "Área do imóvel",
    sizeUnit: "m²",
    sizeHelp: "Introduza ou deslize entre 20 e 250 m².",
    overMax: "O meu imóvel tem mais de 250 m²",
    frequencyLabel: "Frequência de limpeza",
    visitsSuffix: "por mês",
    recommended: "Mais popular",
    noDiscount: "Sem desconto",
    discountLabel: "de desconto",
    freq: {
      monthly: { name: "Uma vez por mês", visits: "1 visita por mês", note: "Uma renovação mensal completa." },
      biweekly: { name: "Quinzenal", visits: "2 visitas por mês", note: "O equilíbrio ponderado entre cuidado e valor." },
      weekly: { name: "Semanal", visits: "4 visitas por mês", note: "Sempre impecável, sempre pronto." },
      irregular: {
        name: "Airbnb e arrendamentos",
        visits: "Preço por semana",
        note: "Limpeza de rotação para Airbnb e arrendamentos de curta duração. Inclui materiais básicos, produtos de limpeza e papel higiénico.",
      },
    },
    durationLabel: "Duração da subscrição",
    durationHelp: "Escolha o tempo de compromisso: durações mais longas poupam mais.",
    duration: {
      "3_month": { name: "3 Meses", tag: "Início flexível" },
      "6_month": { name: "6 Meses", tag: "Poupe 5%" },
      "9_month": { name: "9 Meses", tag: "Poupe 10%" },
      "12_month": { name: "12 Meses", tag: "Poupe 15%" },
      bestValue: "Melhor opção",
      pauseBenefit: "Benefício de pausa",
    },
    result: {
      heading: "A sua estimativa",
      propertySize: "Área do imóvel",
      pricePerCleaning: "Preço por limpeza",
      frequency: "Frequência",
      visits: "Visitas de limpeza",
      visitsValue: "{n} por mês",
      subtotal: "Subtotal antes do desconto",
      discount: "Desconto por frequência",
      areaSurcharge: "Área adicional",
      youSave: "Poupa",
      monthlyTotal: "Total mensal estimado",
      perMonth: "/ mês",
      perWeek: "/ semana",
      pricePerWeek: "Preço por semana",
      effective: "Preço efetivo por visita",
      contractDuration: "Contrato",
      priceBeforeDuration: "Preço antes do ajuste de duração",
      durationDiscount: "Desconto de contrato",
      durationSavings: "Poupa",
      minimumContractValue: "Valor mínimo do contrato",
      pauseBenefitNote: "Uma pausa aprovada de até dois meses consecutivos",
      chooseDuration: "Escolha uma duração de subscrição para ver o preço do seu contrato.",
    },
    custom: {
      title: "Uma casa de distinção merece uma avaliação individual.",
      body: "Imóveis com mais de 250 m² são analisados individualmente antes da proposta de serviço.",
      cta: "Pedir uma avaliação",
    },
    cta: {
      book: "Reserve a Avaliação Inicial",
    },
    disclaimer:
      "Este é um preço estimado com base na área do imóvel e na frequência de limpeza selecionada. O preço final pode variar consoante o estado do imóvel, a acessibilidade, os serviços adicionais e os requisitos de limpeza específicos.",
    optionalNote:
      "Serviços opcionais como limpeza profunda, limpeza de vidros, lavandaria, mudança de roupa de cama, limpeza de terraços e limpeza pós-construção podem ser cobrados à parte.",
    materialsNote:
      "Este plano inclui materiais de limpeza básicos, produtos e papel higiénico, reabastecidos em cada visita.",
  },
  enquiry: {
    title: "Reserve a sua limpeza",
    subtitle: "Partilhe alguns dados e confirmaremos a sua primeira visita no prazo de 24 horas.",
    summary: "A sua seleção",
    fields: {
      name: "Nome completo",
      email: "Endereço de e-mail",
      phone: "Telefone ou WhatsApp",
      location: "Localização do imóvel",
      size: "Área do imóvel (m²)",
      frequency: "Frequência de limpeza",
      startDate: "Data de início preferida",
      message: "Mensagem (opcional)",
      messagePlaceholder: "Há algo que devamos saber sobre a sua casa?",
    },
    required: "Obrigatório",
    invalidEmail: "Introduza um endereço de e-mail válido.",
    submitWhatsApp: "Enviar via WhatsApp",
    submitEmail: "Enviar por e-mail",
    cancel: "Cancelar",
    close: "Fechar",
    successTitle: "Obrigado.",
    successBody: "Os seus dados estão prontos a enviar. Escolha WhatsApp ou e-mail para concluir o seu pedido.",
    monthlyEstimate: "Total mensal estimado",
    customSelected: "Orçamento à medida (mais de 250 m²)",
  },
  booking: {
    title: "Reserve a sua Avaliação inicial da casa",
    subtitle:
      "A sua primeira visita permite-nos avaliar profissionalmente a sua casa, realizar uma primeira limpeza profunda se necessário e preparar o seu plano de limpeza personalizado.",
    close: "Fechar",
    pay: "Enviar pedido de avaliação",
    paySecure:
      "Pagamento seguro via Stripe. A sua subscrição começa apenas depois de a sua Avaliação inicial da casa ser concluída e aprovada.",
    summary: {
      heading: "A sua seleção",
      propertySize: "Área do imóvel",
      frequency: "Frequência de limpeza",
      duration: "Duração da subscrição",
      durationDiscount: "Desconto de contrato",
      minimumContractValue: "Valor mínimo do contrato",
      estMonthly: "Subscrição mensal estimada",
      assessment: "Avaliação única da casa",
      doorlockInstallation: "Instalação de fechadura inteligente",
      dueToday: "A pagar hoje",
      fromAfterAssessment: "O seu plano final é confirmado após a avaliação.",
    },
    billing: {
      label: "Faturação contínua preferida",
      monthly: "Mensal",
      monthlyNote: "Pagar todos os meses",
      annual: "Anual",
      annualNote: "Pagar uma vez por ano",
      save: "Poupe 5%",
    },
    steps: { visit: "A sua visita", home: "A sua casa", details: "Os seus dados" },
    visit: {
      preferredDate: "Data preferida",
      alternateDate: "Data alternativa (opcional)",
      timeSlot: "Horário preferido",
      morning: "Manhã",
      afternoon: "Tarde",
      flexible: "Flexível",
    },
    fields: {
      size: "Área do imóvel",
      condition: "Estado do imóvel",
      bedrooms: "Quartos",
      bathrooms: "Casas de banho",
      accessNotes: "Notas de acesso (opcional)",
      accessNotesPlaceholder: "Estacionamento, chaves, códigos de portão: tudo o que devemos saber",
      pets: "Há animais na casa",
      petDetails: "Detalhes dos animais",
      petDetailsPlaceholder: "Tipo e número de animais",
      smoking: "Fuma-se na casa",
      fullName: "Nome completo",
      email: "Endereço de e-mail",
      phone: "Telefone / WhatsApp",
      city: "Cidade",
      addressLine1: "Morada",
      addressLine2: "Apartamento, andar (opcional)",
      postalCode: "Código postal (opcional)",
    },
    doorlock: {
      title: "Instalação de fechadura inteligente",
      label: "Reservar instalação opcional de fechadura inteligente",
      body:
        "Podemos organizar a instalação de uma fechadura inteligente com Wi-Fi por cerca de 200 € durante ou após a avaliação.",
      benefit:
        "Uma fechadura inteligente dá ao proprietário mais flexibilidade e tranquilidade: ninguém precisa de uma cópia física das chaves e o acesso dos funcionários pode ser desativado após cada sessão de limpeza.",
      internetRequired: "A casa deve ter uma ligação ativa à internet.",
      confirmation:
        "Confirmo que a casa tem internet disponível para a ligação da fechadura inteligente.",
    },
    condition: {
      excellent: "Excelente",
      standard: "Padrão",
      needs_attention: "Requer atenção",
      heavy: "Necessita de limpeza intensa",
    },
    legal: {
      accuracy:
        "Confirmo que as informações acima: área, quartos, casas de banho, animais, tabaco e estado: estão corretas.",
      termsLink: "Termos e Condições",
      privacyLink: "Política de Privacidade",
      note: "A Dar Tahara pode verificar estas informações durante a avaliação e ajustar o plano contínuo quando o imóvel diferir de forma significativa.",
    },
    errors: {
      invalid_customer: "Adicione o seu nome, um e-mail válido e um número de telefone.",
      invalid_property: "Complete a sua morada e os detalhes do imóvel.",
      invalid_booking: "Escolha uma data e hora para a sua visita.",
      invalid_duration: "Escolha uma duração de subscrição para continuar.",
      pet_details_required: "Adicione alguns detalhes sobre os seus animais.",
      doorlock_internet_required: "Confirme que a casa tem ligação à internet para a fechadura inteligente.",
      legal_acceptance_required: "Confirme os dados e aceite os termos para continuar.",
      rate_limited: "Demasiadas tentativas. Tente novamente dentro de um minuto.",
      checkout_not_configured: "Os pedidos não estão disponíveis: junte-se ao acesso antecipado.",
      checkout_failed: "Não foi possível enviar o pedido. Tente novamente.",
      network: "Erro de rede. Verifique a sua ligação e tente novamente.",
    },
  },
  consent: {
    message:
      "Utilizamos cookies analíticos para compreender como o nosso site é usado. Se recusar, nada muda: o site funciona exatamente da mesma forma.",
    accept: "Aceitar",
    decline: "Recusar",
    privacy: "Política de Privacidade",
    aria: "Consentimento de cookies",
  },
  mailing: {
    popupHeadline: "Seja o primeiro a saber quando lançarmos",
    popupBody:
      "Junte-se à nossa lista de acesso antecipado e avisamos assim que as nossas subscrições de limpeza estiverem disponíveis.",
    emailPlaceholder: "Introduza o seu e-mail",
    button: "Avise-me",
    success: "Obrigado. Está na lista e avisamos quando entrarmos em funcionamento.",
    consent:
      "Ao subscrever, concorda em receber novidades sobre o lançamento e o serviço. Pode cancelar a qualquer momento.",
    close: "Fechar",
    errors: {
      invalid_email: "Introduza um endereço de e-mail válido.",
      rate_limited: "Demasiadas tentativas. Tente novamente dentro de um minuto.",
      captcha_failed: "Falha na verificação. Tente novamente.",
      consent_required: "Aceite para continuar.",
      server_error: "Algo correu mal. Tente novamente em breve.",
      network: "Erro de rede. Verifique a sua ligação e tente novamente.",
    },
    footerEyebrow: "Brevemente",
    footerTitle: "Chegue a mais do que uma casa limpa.",
    footerBody:
      "Deixe o seu e-mail e avisamos assim que as nossas subscrições de limpeza estiverem disponíveis.",
    confirmedTitle: "Subscrição confirmada",
    confirmedBody: "Obrigado por confirmar. Está tudo pronto: entraremos em contacto no lançamento.",
    unsubscribedTitle: "A sua subscrição foi cancelada",
    unsubscribedBody: "Deixará de receber novidades do lançamento. Pode voltar a inscrever-se quando quiser.",
    invalidTitle: "Ligação expirada ou inválida",
    invalidBody: "Esta ligação já não é válida. Inscreva-se novamente se quiser receber novidades.",
    backHome: "Voltar ao início",
  },
  assistant: {
    chat: {
      title: "Assistente Dar Tahara",
      subtitle:
        "Olá, sou o concierge virtual da Dar Tahara. Posso explicar serviços, preços, a Avaliação Inicial, faturação e passos de reserva.",
      open: "Perguntar à Dar Tahara",
      close: "Fechar assistente",
      placeholder: "Pergunte sobre preços, reservas ou serviços…",
      send: "Enviar",
      automated: "Assistente automático",
      human: "Especialista Dar Tahara",
      error: "Desculpe, não foi possível concluir o pedido. Tente novamente; a conversa foi preservada.",
      quickActions: [
        "Como funciona a primeira visita?",
        "Calcular preço",
        "O que está incluído?",
        "Reservar avaliação",
        "Mensal ou anual?",
        "Falar com especialista",
      ],
    },
  },
  missionVision: {
    meta: {
      title: "Missão e Visão",
      description:
        "A Dar Tahara combina profissionais qualificados, tecnologia inovadora e um serviço transparente para redefinir a limpeza residencial em Marrocos. Conheça a nossa missão, visão, valores e compromissos.",
      ogAlt: "Dar Tahara: Missão e Visão",
    },
    breadcrumb: { home: "Início", current: "Missão e Visão", label: "Trilho de navegação" },
    hero: {
      eyebrow: "Missão e Visão",
      title: "Casas mais limpas. Confiança mais forte.",
      subtitle:
        "A Dar Tahara combina profissionais qualificados, tecnologia inovadora e um serviço transparente para redefinir a limpeza residencial em Marrocos.",
      ctaPrimary: "Reservar Avaliação Inicial",
      ctaSecondary: "Conhecer os nossos serviços",
      imageAlt: "Uma casa marroquina moderna cuidada pela equipa profissional da Dar Tahara",
    },
    mission: {
      eyebrow: "A nossa missão",
      title: "Uma casa limpa traz tranquilidade.",
      lead: "A nossa missão é prestar serviços de limpeza fiáveis, transparentes e assentes em tecnologia que melhorem a qualidade de vida de cada cliente.",
      body: [
        "Acreditamos que uma casa limpa traz tranquilidade.",
        "Ao combinar profissionais com formação estruturada, tecnologia inteligente, controlo de qualidade e um apoio ao cliente excecional, queremos ser a empresa de limpeza premium mais fiável de Marrocos.",
      ],
    },
    vision: {
      eyebrow: "A nossa visão",
      title: "Um novo padrão para os serviços domésticos em Marrocos.",
      lead: "Tornarmo-nos a principal empresa marroquina de serviços domésticos assente em tecnologia, definindo novos padrões de confiança, profissionalismo, segurança e experiência do cliente.",
      body: [
        "A nossa visão a longo prazo é crescer por todo Marrocos, investindo continuamente em inovação, no desenvolvimento dos colaboradores e em operações sustentáveis.",
      ],
    },
    values: {
      eyebrow: "Os nossos valores",
      title: "Os princípios por detrás de cada visita.",
      subtitle:
        "Seis compromissos que moldam a forma como recrutamos, formamos e cuidamos da sua casa.",
      items: [
        { title: "Confiança", body: "Conquistamos confiança com honestidade, transparência e consistência." },
        { title: "Qualidade", body: "Cada visita deve cumprir o mesmo padrão elevado." },
        { title: "Respeito", body: "Respeitamos os nossos clientes, as suas casas e os nossos colaboradores." },
        {
          title: "Inovação",
          body: "A tecnologia deve melhorar tanto a experiência do cliente como a eficiência da equipa.",
        },
        {
          title: "Profissionalismo",
          body: "Estamos empenhados numa formação estruturada e contínua da equipa em apoio a um serviço excecional.",
        },
        {
          title: "Sustentabilidade",
          body: "Reduzimos continuamente os resíduos e escolhemos práticas responsáveis para o ambiente sempre que possível.",
        },
      ],
    },
    promises: {
      eyebrow: "Os nossos compromissos",
      title: "Aquilo com que cada cliente pode contar.",
      subtitle: "Compromissos claros, cumpridos da mesma forma em cada casa e em cada visita.",
      items: [
        {
          title: "Prometemos profissionalismo",
          body: "O nosso objetivo é que cada profissional conclua uma formação estruturada antes de entrar na casa de um cliente.",
        },
        {
          title: "Prometemos transparência",
          body: "Sem custos ocultos, preços claros, faturas digitais e comunicação transparente.",
        },
        {
          title: "Prometemos segurança",
          body: "A privacidade e os bens do cliente são tratados com o máximo cuidado.",
        },
        {
          title: "Prometemos fiabilidade",
          body: "Chegamos preparados, seguimos procedimentos estruturados e monitorizamos continuamente a qualidade do serviço.",
        },
        {
          title: "Prometemos inovação",
          body: "Investimos em tecnologia que melhora o agendamento, a comunicação, a garantia de qualidade e a satisfação do cliente.",
        },
        {
          title: "Prometemos melhoria contínua",
          body: "O feedback dos clientes ajudará a definir os nossos processos e a nossa abordagem ao desenvolvimento da equipa.",
        },
      ],
    },
    inclusion: {
      eyebrow: "Igualdade, diversidade e inclusão",
      title: "Talento, dedicação e profissionalismo são o que mais importa.",
      body: [
        "Na Dar Tahara acreditamos que o talento, a dedicação e o profissionalismo são o que mais importa.",
        "Estamos empenhados na igualdade de oportunidades independentemente do género, idade, etnia, religião, deficiência ou percurso.",
        "Estamos a construir um local de trabalho inclusivo assente na dignidade, na equidade e no respeito mútuo.",
        "O nosso objetivo é que as decisões de recrutamento, formação e desenvolvimento de carreira se baseiem no mérito, no desempenho e no potencial.",
        "Ao abraçar a diversidade e a inclusão, construímos equipas mais fortes, comunidades mais sólidas e melhores experiências para o cliente.",
      ],
    },
    people: {
      eyebrow: "A nossa equipa",
      title: "O nosso compromisso com o emprego responsável.",
      subtitle:
        "Estamos empenhados em construir um local de trabalho assente na dignidade, na equidade, na transparência e no desenvolvimento profissional.",
      items: [
        {
          title: "Relações de trabalho formais",
          body: "Estamos a trabalhar para estabelecer relações de trabalho formais e devidamente documentadas para os membros da equipa elegíveis.",
        },
        {
          title: "Inscrição na CNSS",
          body: "À medida que as nossas operações crescem, trabalhamos para garantir que os colaboradores elegíveis sejam inscritos no Fundo Nacional de Segurança Social de Marrocos (Caisse Nationale de Sécurité Sociale: CNSS), em conformidade com os requisitos legais e laborais aplicáveis.",
        },
        {
          title: "Cobertura AMO aplicável",
          body: "O nosso objetivo de implementação inclui a cobertura de saúde aplicável do Seguro de Saúde Obrigatório (Assurance Maladie Obligatoire: AMO) para os colaboradores elegíveis através do sistema da CNSS.",
        },
        {
          title: "Condições de trabalho claras",
          body: "Estamos a trabalhar para estabelecer responsabilidades e condições de trabalho claras, assentes na dignidade, na equidade e na transparência.",
        },
        {
          title: "Desenvolvimento estruturado",
          body: "O nosso modelo de emprego está a ser construído em torno da formação estruturada e do desenvolvimento profissional.",
        },
        {
          title: "Métodos de trabalho seguros",
          body: "Pretendemos proporcionar métodos de trabalho seguros e equipamento adequado a cada função.",
        },
        {
          title: "Igualdade de oportunidades",
          body: "Estamos empenhados na igualdade de oportunidades com base no mérito, no desempenho e no potencial.",
        },
        {
          title: "Tratamento respeitoso",
          body: "Cada membro da equipa deve ser tratado com dignidade e respeito mútuo.",
        },
      ],
      clarification:
        "As nossas práticas e benefícios laborais serão implementados de acordo com a função, o estatuto profissional, a elegibilidade, a fase operacional e a legislação marroquina aplicável.",
    },
    impact: {
      eyebrow: "Impacto social",
      title: "Construir um modelo de emprego responsável.",
      subtitle:
        "A Dar Tahara pretende criar emprego significativo e gerido de forma profissional nas comunidades que servimos. Investimos em formação estruturada, práticas de trabalho seguras, desenvolvimento profissional e relações de trabalho respeitosas.",
      items: [
        "À medida que as nossas operações crescem, estamos a construir um modelo de emprego formal em que os membros da equipa elegíveis sejam inscritos no sistema marroquino de segurança social da CNSS, incluindo a cobertura de saúde AMO aplicável, em conformidade com os requisitos legais e laborais.",
        "O nosso objetivo é ajudar a elevar os padrões num setor em que o trabalho informal e não declarado continua a ser comum, criando simultaneamente oportunidades mais seguras, estáveis e gratificantes para as nossas equipas.",
      ],
    },
    comparison: {
      eyebrow: "Porquê a Dar Tahara?",
      title: "Um padrão de serviço diferente.",
      subtitle:
        "A diferença entre um arranjo de limpeza tradicional e um serviço doméstico moderno assente em tecnologia.",
      traditionalTitle: "Empresa de limpeza tradicional",
      brandTitle: "Dar Tahara",
      traditional: [
        "Qualidade de serviço irregular",
        "Pagamentos em numerário",
        "Comunicação limitada",
        "Administração manual",
        "Sem portal do cliente",
        "Sem apoio com IA",
        "Pouco controlo de qualidade",
        "Transparência mínima",
      ],
      brand: [
        "Serviços por subscrição",
        "Portal digital do cliente",
        "Apoio ao cliente com IA",
        "Controlo de qualidade digital",
        "Faturas online",
        "Agendamento profissional",
        "Operações assentes em tecnologia",
        "Comunicação transparente",
        "Compromisso com a formação estruturada da equipa",
        "Modelo de emprego responsável em desenvolvimento",
        "Experiência de cliente moderna",
      ],
    },
    sustainability: {
      eyebrow: "Sustentabilidade",
      title: "Progresso que respeita o planeta.",
      subtitle:
        "A responsabilidade ambiental está integrada na forma como planeamos, limpamos e administramos.",
      items: [
        { title: "Rotas mais inteligentes", body: "Planeamento otimizado de rotas para reduzir deslocações desnecessárias." },
        {
          title: "Produtos responsáveis",
          body: "Produtos de limpeza responsáveis para o ambiente sempre que possível.",
        },
        { title: "Sem papel por princípio", body: "Administração sem papel através de sistemas digitais." },
        { title: "Menos resíduos", body: "Processos eficientes que minimizam os resíduos." },
        {
          title: "Investimento a longo prazo",
          body: "Investimento contínuo em práticas empresariais sustentáveis.",
        },
      ],
    },
    closing: {
      eyebrow: "Mais do que limpeza",
      title: "Mais do que limpeza",
      body: [
        "A Dar Tahara está a construir um novo padrão de limpeza doméstica em Marrocos.",
        "Ao combinar profissionais qualificados, tecnologia inovadora e um cuidado genuíno pelos nossos clientes, entregamos mais do que uma casa limpa: entregamos tranquilidade.",
      ],
      ctaPrimary: "Reserve a sua Avaliação Inicial",
      ctaSecondary: "Descobrir os nossos serviços",
    },
    teaser: {
      eyebrow: "Porquê a Dar Tahara?",
      title: "Mais do que limpeza.",
      body: "Profissionais qualificados, tecnologia inovadora e um serviço transparente: reunidos para redefinir a limpeza residencial em Marrocos.",
      cta: "Ler a nossa missão e visão",
      points: [
        "Operações assentes em tecnologia",
        "Preços transparentes por subscrição",
        "Compromisso com a formação estruturada da equipa",
      ],
    },
  },
  peopleCommunity: {
    meta: {
      title: "Pessoas e Comunidade",
      description:
        "Descubra como a Dar Tahara combina limpeza doméstica profissional, verificação dos colaboradores, acesso controlado ao imóvel e emprego local estável em Marrocos.",
      ogAlt: "Dar Tahara: Pessoas e Comunidade",
    },
    breadcrumb: {
      home: "Início",
      current: "Pessoas e Comunidade",
      label: "Trilho de navegação",
    },
    hero: {
      eyebrow: "Pessoas e Comunidade",
      title: "Casas limpas. Comunidades apoiadas.",
      subtitle:
        "Na Dar Tahara acreditamos que um serviço de limpeza profissional deve fazer mais do que deixar uma casa limpa. Combinamos o cuidado profissional do lar com emprego local estável, condições de trabalho justas e um serviço construído em torno da confiança.",
      ctaPrimary: "Aderir ao acesso antecipado",
      ctaSecondary: "Ler a nossa missão e visão",
      imageAlt: "Uma profissional de limpeza da Dar Tahara com uniforme limpa uma janela numa casa marroquina",
      highlights: ["Equipas locais", "Pessoal verificado", "Acesso ligado à marcação"],
    },
    employment: {
      eyebrow: "Emprego local",
      title: "Pessoas da terra ao serviço da sua comunidade",
      lead: "A Dar Tahara procura recrutar as suas equipas de limpeza nas cidades e áreas envolventes onde opera. Sempre que possível, os colaboradores trabalham dentro da sua área operacional local, perto das casas de que cuidam.",
      items: [
        {
          title: "Emprego dentro da própria comunidade",
          body: "Quando a Dar Tahara abre numa cidade, olhamos primeiro para essa cidade e para a região envolvente para formar a equipa que irá servi-la.",
        },
        {
          title: "Trabalho mais previsível",
          body: "As subscrições recorrentes geram marcações recorrentes, o que nos permite planear horários com antecedência em vez de oferecer trabalhos avulsos e irregulares.",
        },
        {
          title: "Menos deslocações desnecessárias",
          body: "Afetar colaboradores dentro da sua área operacional local, quando é possível, reduz longas deslocações e devolve-lhes parte do dia.",
        },
        {
          title: "Equipas locais dedicadas",
          body: "Equipas que conhecem a sua cidade e os seus bairros constroem familiaridade, consistência e verdadeira responsabilidade perante os clientes que servem.",
        },
        {
          title: "Crescimento que cria emprego local",
          body: "Cada cliente recorrente adicional numa cidade acrescenta horas de limpeza nessa mesma cidade, e são essas horas que criam postos de trabalho locais adicionais.",
        },
      ],
      flow: {
        title: "Como o crescimento se transforma em emprego local",
        steps: [
          "Mais clientes",
          "Mais marcações de limpeza recorrentes",
          "Mais empregos locais estáveis",
        ],
        note: "É este o mecanismo por trás do nosso modelo de emprego: uma procura previsível é o que torna possível um emprego previsível.",
      },
      customerNote:
        "Ao escolher a Dar Tahara, recebe um serviço de limpeza profissional e seguro e apoia, ao mesmo tempo, o emprego local estável na região onde vive.",
      disclaimer:
        "O recrutamento e a afetação locais são aplicados sempre que operacionalmente possível dentro de cada área de atividade. A Dar Tahara não garante que cada colaborador resida a uma distância determinada de cada imóvel de cliente.",
    },
    stability: {
      eyebrow: "Emprego justo",
      title: "Um emprego deve dar estabilidade",
      lead: "A Dar Tahara quer oferecer mais do que trabalho de limpeza ocasional. Os nossos colaboradores recebem um salário mensal justo e cobertura de saúde, contribuindo para maior estabilidade financeira e para o acesso a cuidados de saúde essenciais.",
      items: [
        {
          title: "Um salário mensal justo",
          body: "O vínculo assenta num salário mensal fixo, e não em pagamentos em dinheiro incertos, tarefa a tarefa.",
        },
        {
          title: "Cobertura de saúde",
          body: "O nosso modelo de emprego inclui a cobertura aplicável do Seguro de Doença Obrigatório (AMO) para colaboradores elegíveis, através do sistema marroquino da CNSS.",
        },
        {
          title: "Trabalho agendado e previsível",
          body: "As marcações recorrentes são planeadas com antecedência, pelo que os colaboradores conhecem o seu horário em vez de esperarem que apareça trabalho.",
        },
        {
          title: "Integração profissional",
          body: "Cada membro da equipa conhece os nossos padrões, procedimentos e equipamentos antes de trabalhar de forma autónoma em casa de um cliente.",
        },
        {
          title: "Um ambiente de trabalho estruturado",
          body: "Responsabilidades claras, condições de trabalho definidas, equipamento adequado e um coordenador a quem recorrer.",
        },
      ],
      objective:
        "O nosso objetivo é simples: um emprego suficientemente estável para cobrir as necessidades básicas, com acesso a cobertura de saúde. Os nossos colaboradores são profissionais que prestam um serviço profissional e são remunerados como tal.",
      disclaimer:
        "O salário, os benefícios e a cobertura são aplicados de acordo com a função, o vínculo laboral, a elegibilidade, a fase operacional e a legislação marroquina aplicável.",
    },
    screening: {
      eyebrow: "Confiança do cliente",
      title: "Pessoas em quem pode confiar dentro de sua casa",
      lead: "Deixar alguém entrar numa casa privada exige confiança. Por isso, a Dar Tahara exige que o pessoal de limpeza conclua com êxito o processo de verificação da empresa antes de ficar autorizado a trabalhar de forma autónoma nos imóveis dos clientes.",
      steps: [
        {
          title: "Verificação de identidade",
          body: "Verificamos a identidade de cada candidato com base em documentos de identificação oficiais.",
        },
        {
          title: "Verificação de antecedentes profissionais",
          body: "Quando aplicável, são verificados empregos anteriores e referências antes de a candidatura prosseguir.",
        },
        {
          title: "Integração na Dar Tahara",
          body: "Os candidatos concluem o nosso programa de integração sobre procedimentos, equipamentos, privacidade e conduta dentro da casa do cliente.",
        },
        {
          title: "Padrões profissionais",
          body: "Cada colaborador trabalha segundo um padrão documentado de limpeza, comunicação e respeito pela casa e pela privacidade do cliente.",
        },
        {
          title: "Autorização antes do acesso",
          body: "O acesso ao imóvel só é ativado depois de concluídas com êxito a verificação e a integração.",
        },
      ],
      criminalRecordLabel: "Documento oficial de verificação",
      criminalRecordDocument: "Certificado de Registo Criminal",
      criminalRecordBody:
        "No âmbito do nosso processo de verificação, cada candidato deve apresentar um Certificado de Registo Criminal válido. O documento faz parte obrigatória dos requisitos de verificação da Dar Tahara, que o candidato tem de cumprir com êxito antes de ficar autorizado a trabalhar de forma autónoma nos imóveis dos clientes.",
      criminalRecordPrivacy:
        "O documento é tratado de forma confidencial, como parte do processo individual do colaborador. Nunca é partilhado com clientes, que não o podem consultar nem descarregar.",
      authorization:
        "Apenas o pessoal que conclui com êxito o processo de verificação e integração exigido pode ser autorizado a trabalhar em casa dos clientes.",
    },
    access: {
      eyebrow: "Acesso controlado ao imóvel",
      title: "A verificação é apenas a primeira camada de segurança",
      lead: "A Dar Tahara combina a verificação dos colaboradores com tecnologia. Para clientes que utilizam uma solução de fechadura inteligente compatível da Dar Tahara, o pessoal de limpeza não recebe acesso permanente e ilimitado ao imóvel. O acesso está associado à própria marcação de limpeza.",
      statement: "Sem marcação ativa não há acesso autorizado.",
      steps: [
        {
          title: "Uma marcação agendada",
          body: "O cliente tem uma marcação de limpeza no calendário.",
        },
        {
          title: "Um colaborador autorizado",
          body: "É atribuído a essa marcação um colaborador verificado e autorizado.",
        },
        {
          title: "Acesso para a janela de serviço",
          body: "O acesso ao imóvel é ativado para a janela horária de serviço correspondente.",
        },
        {
          title: "Acesso durante o período autorizado",
          body: "O colaborador utiliza o método de acesso que lhe foi atribuído dentro desse período.",
        },
        {
          title: "Restrito fora da janela",
          body: "Fora do período autorizado, esse acesso fica restrito.",
        },
        {
          title: "A atividade é registada",
          body: "A atividade de acesso é registada e associada à marcação a que pertence.",
        },
        {
          title: "Visível para o cliente",
          body: "O cliente pode consultar os registos de fechadura e de acesso relativos ao seu imóvel.",
        },
      ],
      availabilityNote:
        "Este modelo de acesso aplica-se a imóveis com uma solução de fechadura inteligente compatível da Dar Tahara e está a ser introduzido em conjunto com o nosso programa de acesso antecipado, pelo que ainda não está ativo em todas as casas. A instalação é opcional e sujeita a uma verificação de compatibilidade da porta e da fechadura. As casas sem fechadura inteligente compatível continuam a utilizar as regras de gestão de chaves acordadas.",
    },
    transparency: {
      eyebrow: "Transparência de acesso",
      title: "Saiba quando a sua casa foi acedida",
      body: "A Dar Tahara combina o acesso controlado ao imóvel com registos transparentes. Os clientes que utilizam a nossa solução de fechadura inteligente compatível podem consultar os registos de acesso relevantes, o que acrescenta transparência sobre os momentos em que o seu imóvel foi acedido.",
      points: [
        {
          title: "Quando ocorreu o acesso",
          body: "A data e a hora em que o seu imóvel foi acedido.",
        },
        {
          title: "A que marcação pertencia",
          body: "A marcação de limpeza agendada a que o acesso diz respeito.",
        },
        {
          title: "Se ocorreu dentro da janela de serviço",
          body: "A confirmação de que o acesso ocorreu dentro do período autorizado.",
        },
      ],
      privacyNote:
        "Os registos de acesso mostram o que é relevante para o seu imóvel e para as suas marcações. Não são uma ferramenta de vigilância de colaboradores individuais e os dados pessoais do pessoal nunca são expostos aos clientes.",
      availabilityNote:
        "Os registos de acesso são disponibilizados para imóveis com uma solução de fechadura inteligente compatível da Dar Tahara e ficam disponíveis à medida que essa solução é implementada. As casas sem fechadura inteligente compatível não produzem estes registos.",
    },
    trust: {
      eyebrow: "O nosso compromisso",
      title: "Pessoal verificado. Acesso agendado. Registos transparentes.",
      body: "Quando confia a alguém o acesso à sua casa, acreditamos que merece mais do que uma promessa. A Dar Tahara combina a verificação dos colaboradores, o acesso controlado ao imóvel e registos de acesso transparentes para criar um serviço profissional pensado em torno da segurança e da responsabilização.",
      pillars: [
        {
          title: "Pessoal verificado",
          body: "Ninguém trabalha de forma autónoma em casa de um cliente antes de concluir a nossa verificação e integração.",
        },
        {
          title: "Acesso agendado",
          body: "O acesso está ligado a uma marcação real e a uma janela de serviço definida, nunca é entregue de forma permanente.",
        },
        {
          title: "Registos transparentes",
          body: "Pode consultar a atividade de acesso relativa ao seu próprio imóvel.",
        },
      ],
    },
    impact: {
      eyebrow: "Um modelo, três resultados",
      title: "Serviço profissional. Emprego responsável. Comunidades locais mais fortes.",
      subtitle:
        "Não são duas histórias separadas. Uma empresa que trata as suas pessoas como profissionais é a mesma empresa em quem pode confiar dentro de sua casa.",
      groups: [
        {
          title: "Para o cliente",
          items: [
            "Limpeza profissional",
            "Pessoal verificado",
            "Acesso controlado ao imóvel",
            "Maior transparência",
          ],
        },
        {
          title: "Para o colaborador",
          items: [
            "Emprego estável",
            "Um salário mensal justo",
            "Cobertura de saúde",
            "Um ambiente de trabalho profissional",
          ],
        },
        {
          title: "Para a comunidade",
          items: [
            "Oportunidades de emprego local",
            "Atividade económica local",
            "Competências e formação profissionais",
            "Empregos criados à medida que a Dar Tahara cresce",
          ],
        },
      ],
      chain: [
        "Serviço profissional",
        "Emprego responsável",
        "Comunidades locais mais fortes",
      ],
    },
    closing: {
      eyebrow: "Porque isto importa",
      title: "Padrões profissionais. Impacto humano.",
      body: [
        "Para os nossos clientes, a Dar Tahara significa um serviço de limpeza profissional construído sobre fiabilidade, segurança e transparência.",
        "Para os nossos colaboradores, significa a oportunidade de trabalho estável, rendimento previsível e cobertura de saúde.",
        "Para as comunidades que servimos, significa que o crescimento da Dar Tahara pode criar emprego diretamente na própria região.",
      ],
      statement: "Uma casa mais limpa. Um serviço mais seguro. Uma comunidade local mais forte.",
      ctaPrimary: "Aderir ao acesso antecipado",
      ctaSecondary: "Ler a nossa missão e visão",
    },
    teaser: {
      eyebrow: "Pessoas e Comunidade",
      title: "Quem enviamos e quem empregamos.",
      body: "Cada profissional de limpeza da Dar Tahara conclui a nossa verificação antes de trabalhar sozinho em sua casa, e o acesso ao imóvel está associado à marcação em vez de ser entregue de forma permanente. O mesmo modelo paga-lhes um salário mensal com cobertura de saúde, na cidade onde vivem.",
      cta: "Veja como recrutamos e protegemos o acesso",
      points: [
        "Pessoal verificado",
        "Acesso ligado à marcação",
        "Emprego local estável",
      ],
    },
  },
  footer: {
    tagline: "Cuidado premium do lar e concierge de imóveis em todo Marrocos.",
    quickLinks: "Explorar",
    services: "Serviços",
    contact: "Contacto",
    email: "Envie-nos um e-mail",
    whatsapp: "WhatsApp",
    call: "Ligue-nos",
    followUs: "Siga-nos",
    rights: "Todos os direitos reservados.",
    terms: "Termos",
    privacy: "Privacidade",
    madeWith: "Crafted with care by SaaSolution SL.",
    newsletterTitle: "Chegue a mais do que uma casa limpa.",
    newsletterBody: "Conselhos ocasionais para cuidar da sua casa. Sem ruído.",
    newsletterPlaceholder: "O seu e-mail",
    newsletterCta: "Subscrever",
  },
};

export default pt;

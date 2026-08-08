#!/usr/bin/env python3
"""Provision the six non-English translations of Dar Tahara Mautic emails.

Run on the VPS with:
    sudo python3 /opt/projects/mautic/provision-email-translations.py

The script only talks to Mautic through its public HTTPS API. It is idempotent
by translation-parent/language pair and validates every newly created entity by
reading it back from the API.
"""
import base64
import json
import urllib.error
import urllib.request


BASE = "https://marketing.saasolution.es"
CREDENTIALS_FILE = "/root/mautic-admin-credentials.txt"
LOCALES = ("fr", "ar", "nl", "es", "de", "pt")
FIRSTNAME = "{contactfield=firstname}"
CITY = "{contactfield=cleaning_city}"
REFERRAL_CODE = "{contactfield=referral_code}"


MASTER_CONFIG = {
    "DT · Verification reminder": {"cta_path": "early-access/success?status=pending"},
    "DT · Verification final reminder": {"cta_path": "early-access/success?status=pending"},
    "DT · Verified welcome": {"cta_path": "early-access", "referral": True},
    "DT · Referral milestone": {"cta_path": "early-access", "referral": True},
    "DT · City launch announcement": {"cta_path": ""},
    "DT · High-intent follow-up": {},
    "DT · Re-engagement": {"cta_path": "early-access"},
    "DT · Preference update": {"cta_path": "early-access"},
    "DT · Unsubscribe confirmation": {"cta_path": "early-access"},
}


# The formality and terminology mirror src/lib/early-access/email.ts.
TRANSLATIONS = {
    "DT · Verification reminder": {
        "fr": {
            "subject": f"Plus qu'une étape, {FIRSTNAME}",
            "heading": "Plus qu'une étape pour garantir votre place",
            "paragraphs": [
                f"Bonjour {FIRSTNAME}, merci encore d'avoir demandé un accès anticipé aux services Dar Tahara.",
                "Nous n'avons pas encore pu confirmer votre e-mail. Confirmez-le pour rester informé et savoir dès que le service ouvrira dans votre région.",
            ],
            "cta": "Confirmer mon e-mail",
        },
        "ar": {
            "subject": f"بقيت خطوة واحدة، {FIRSTNAME}",
            "heading": "خطوة واحدة فقط لتأكيد مكانك",
            "paragraphs": [
                f"مرحبًا {FIRSTNAME}، شكرًا مجددًا لطلبك الوصول المبكر إلى خدمات دار طهارة للعناية بالمنزل.",
                "لم نتمكن بعد من تأكيد بريدك الإلكتروني. يرجى تأكيده لنبقيك على اطلاع ونعلمك فور توفّر الخدمة في منطقتك.",
            ],
            "cta": "تأكيد بريدي الإلكتروني",
        },
        "nl": {
            "subject": f"Nog één stap, {FIRSTNAME}",
            "heading": "Nog één stap om uw plek vast te leggen",
            "paragraphs": [
                f"Hallo {FIRSTNAME}, nogmaals bedankt voor uw aanvraag voor early access tot de thuisdiensten van Dar Tahara.",
                "We hebben uw e-mail nog niet kunnen bevestigen. Bevestig hem zodat we u op de hoogte kunnen houden en laten weten zodra de dienst in uw regio start.",
            ],
            "cta": "Mijn e-mail bevestigen",
        },
        "es": {
            "subject": f"Solo falta un paso, {FIRSTNAME}",
            "heading": "Solo falta un paso para asegurar tu lugar",
            "paragraphs": [
                f"Hola {FIRSTNAME}, gracias de nuevo por solicitar acceso anticipado a los servicios para el hogar de Dar Tahara.",
                "Aún no hemos podido confirmar tu correo. Confírmalo para mantenerte informado y avisarte en cuanto abramos servicio en tu zona.",
            ],
            "cta": "Confirmar mi correo",
        },
        "de": {
            "subject": f"Nur noch ein Schritt, {FIRSTNAME}",
            "heading": "Nur noch ein Schritt zu Ihrem Platz",
            "paragraphs": [
                f"Hallo {FIRSTNAME}, nochmals vielen Dank für Ihre Early-Access-Anfrage für die Hausbetreuung von Dar Tahara.",
                "Wir konnten Ihre E-Mail noch nicht bestätigen. Bitte bestätigen Sie sie, damit wir Sie informieren können, sobald der Service in Ihrer Region startet.",
            ],
            "cta": "E-Mail bestätigen",
        },
        "pt": {
            "subject": f"Falta apenas um passo, {FIRSTNAME}",
            "heading": "Falta apenas um passo para garantir o seu lugar",
            "paragraphs": [
                f"Olá {FIRSTNAME}, obrigado novamente por pedir acesso antecipado aos serviços domésticos da Dar Tahara.",
                "Ainda não conseguimos confirmar o seu e-mail. Confirme-o para o mantermos informado e avisarmos assim que o serviço abrir na sua região.",
            ],
            "cta": "Confirmar o meu e-mail",
        },
    },
    "DT · Verification final reminder": {
        "fr": {
            "subject": "Dernier rappel pour confirmer votre demande d'accès anticipé",
            "heading": "Voici notre dernier rappel",
            "paragraphs": [
                f"Bonjour {FIRSTNAME}, votre demande d'accès anticipé est presque terminée.",
                "Si vous souhaitez toujours bénéficier d'un accès prioritaire aux services d'entretien de maison et de bien Dar Tahara au Maroc, confirmez votre e-mail. Nous ne vous enverrons pas d'autre rappel.",
            ],
            "cta": "Confirmer mon e-mail",
        },
        "ar": {
            "subject": "التذكير الأخير لتأكيد طلب الوصول المبكر",
            "heading": "هذا تذكيرنا الأخير",
            "paragraphs": [
                f"مرحبًا {FIRSTNAME}، أوشك طلب وصولك المبكر على الاكتمال.",
                "إذا كنت لا تزال ترغب في أولوية الوصول إلى خدمات دار طهارة للعناية بالمنزل والعقار في المغرب، فيرجى تأكيد بريدك الإلكتروني. لن نرسل تذكيرات أخرى.",
            ],
            "cta": "تأكيد بريدي الإلكتروني",
        },
        "nl": {
            "subject": "Laatste herinnering om uw early-access-aanvraag te bevestigen",
            "heading": "Dit is onze laatste herinnering",
            "paragraphs": [
                f"Hallo {FIRSTNAME}, uw early-access-aanvraag is bijna voltooid.",
                "Wilt u nog steeds voorrang op de woning- en vastgoedzorg van Dar Tahara in Marokko? Bevestig dan uw e-mail. We sturen geen verdere herinneringen.",
            ],
            "cta": "Mijn e-mail bevestigen",
        },
        "es": {
            "subject": "Último recordatorio para confirmar tu solicitud de acceso anticipado",
            "heading": "Este es nuestro último recordatorio",
            "paragraphs": [
                f"Hola {FIRSTNAME}, tu solicitud de acceso anticipado está casi completa.",
                "Si todavía quieres acceso prioritario a los servicios de cuidado del hogar y la propiedad de Dar Tahara en Marruecos, confirma tu correo. No enviaremos más recordatorios.",
            ],
            "cta": "Confirmar mi correo",
        },
        "de": {
            "subject": "Letzte Erinnerung: Bestätigen Sie Ihre Early-Access-Anfrage",
            "heading": "Dies ist unsere letzte Erinnerung",
            "paragraphs": [
                f"Hallo {FIRSTNAME}, Ihre Early-Access-Anfrage ist fast abgeschlossen.",
                "Wenn Sie weiterhin bevorzugten Zugang zur Haus- und Immobilienbetreuung von Dar Tahara in Marokko wünschen, bestätigen Sie bitte Ihre E-Mail. Wir senden keine weiteren Erinnerungen.",
            ],
            "cta": "E-Mail bestätigen",
        },
        "pt": {
            "subject": "Último lembrete para confirmar o seu pedido de acesso antecipado",
            "heading": "Este é o nosso último lembrete",
            "paragraphs": [
                f"Olá {FIRSTNAME}, o seu pedido de acesso antecipado está quase concluído.",
                "Se ainda pretende acesso prioritário aos serviços domésticos e de cuidado de imóveis da Dar Tahara em Marrocos, confirme o seu e-mail. Não enviaremos mais lembretes.",
            ],
            "cta": "Confirmar o meu e-mail",
        },
    },
    "DT · Verified welcome": {
        "fr": {
            "subject": "Vous êtes sur la liste d'accès anticipé Dar Tahara 🎉",
            "heading": f"Bienvenue dans l'accès anticipé, {FIRSTNAME}",
            "paragraphs": [
                f"Votre e-mail est confirmé. Vous êtes maintenant sur la liste d'accès anticipé Dar Tahara. Nous vous contacterons dès que le service sera disponible pour votre bien à {CITY}.",
                "Ceci n'est pas une réservation confirmée. C'est votre place dans la file. Vous serez parmi les premières personnes contactées à l'ouverture de votre région.",
                "<strong>Invitez vos proches.</strong> Partagez votre lien d'invitation personnel. Cela nous aide à arriver plus vite dans votre ville.",
            ],
            "cta": "Ouvrir mes outils de parrainage",
            "note": "L'inscription est une demande d'accès anticipé, et non un rendez-vous confirmé.",
        },
        "ar": {
            "subject": "أنت الآن على قائمة الوصول المبكر لدار طهارة 🎉",
            "heading": f"مرحبًا بك في الوصول المبكر، {FIRSTNAME}",
            "paragraphs": [
                f"تم تأكيد بريدك الإلكتروني. أنت الآن على قائمة الوصول المبكر لدار طهارة. سنتواصل معك عند توفّر الخدمة لعقارك في {CITY}.",
                "هذا ليس حجزًا مؤكدًا؛ إنه مكانك في القائمة. ستكون من أوائل من نتواصل معهم عند افتتاح منطقتك.",
                "<strong>ادعُ العائلة والأصدقاء.</strong> شارك رابط دعوتك الشخصي، فهذا يساعدنا على الوصول إلى مدينتك أسرع.",
            ],
            "cta": "فتح أدوات الإحالة",
            "note": "التسجيل هو طلب وصول مبكر وليس موعدًا مؤكدًا.",
        },
        "nl": {
            "subject": "U staat op de Dar Tahara early-access-lijst 🎉",
            "heading": f"Welkom bij early access, {FIRSTNAME}",
            "paragraphs": [
                f"Uw e-mail is bevestigd. U staat nu op de Dar Tahara early-access-lijst. We nemen contact op zodra de dienst beschikbaar is voor uw woning in {CITY}.",
                "Dit is geen bevestigde boeking. Het is uw plek in de rij. Zodra we uw regio openen, nemen we als een van de eersten contact met u op.",
                "<strong>Nodig familie en vrienden uit.</strong> Deel uw persoonlijke uitnodigingslink. Zo brengen we Dar Tahara sneller naar uw stad.",
            ],
            "cta": "Mijn verwijshulpmiddelen openen",
            "note": "Registratie is een early-access-aanvraag, geen bevestigde afspraak.",
        },
        "es": {
            "subject": "Estás en la lista de acceso anticipado de Dar Tahara 🎉",
            "heading": f"Bienvenido al acceso anticipado, {FIRSTNAME}",
            "paragraphs": [
                f"Tu correo está confirmado. Ya estás en la lista de acceso anticipado de Dar Tahara. Te contactaremos cuando el servicio esté disponible para tu propiedad en {CITY}.",
                "Esto no es una reserva confirmada. Es tu lugar en la fila. Estarás entre las primeras personas a las que avisemos al abrir tu zona.",
                "<strong>Invita a familiares y amigos.</strong> Comparte tu enlace de invitación personal. Nos ayuda a llegar antes a tu ciudad.",
            ],
            "cta": "Abrir mis herramientas de referidos",
            "note": "El registro es una solicitud de acceso anticipado, no una cita confirmada.",
        },
        "de": {
            "subject": "Sie stehen auf der Dar Tahara Early-Access-Liste 🎉",
            "heading": f"Willkommen beim frühen Zugang, {FIRSTNAME}",
            "paragraphs": [
                f"Ihre E-Mail ist bestätigt. Sie stehen jetzt auf der Dar Tahara Early-Access-Liste. Wir melden uns, sobald der Service für Ihre Immobilie in {CITY} verfügbar ist.",
                "Dies ist keine bestätigte Buchung. Es ist Ihr Platz in der Warteliste. Sobald wir Ihre Region eröffnen, gehören Sie zu den Ersten, die wir kontaktieren.",
                "<strong>Laden Sie Familie und Freunde ein.</strong> Teilen Sie Ihren persönlichen Einladungslink. So bringen wir Dar Tahara schneller in Ihre Stadt.",
            ],
            "cta": "Meine Empfehlungstools öffnen",
            "note": "Die Registrierung ist eine Early-Access-Anfrage, kein bestätigter Termin.",
        },
        "pt": {
            "subject": "Está na lista de acesso antecipado da Dar Tahara 🎉",
            "heading": f"Bem-vindo ao acesso antecipado, {FIRSTNAME}",
            "paragraphs": [
                f"O seu e-mail está confirmado. Está agora na lista de acesso antecipado da Dar Tahara. Entraremos em contacto quando o serviço estiver disponível para o seu imóvel em {CITY}.",
                "Isto não é uma reserva confirmada. É o seu lugar na fila. Estará entre as primeiras pessoas que contactaremos ao abrir a sua região.",
                "<strong>Convide família e amigos.</strong> Partilhe o seu link de convite pessoal. Isso ajuda-nos a chegar mais cedo à sua cidade.",
            ],
            "cta": "Abrir as minhas ferramentas de indicação",
            "note": "O registo é um pedido de acesso antecipado, não uma marcação confirmada.",
        },
    },
    "DT · Referral milestone": {
        "fr": {
            "subject": f"Merci de faire connaître Dar Tahara, {FIRSTNAME}",
            "heading": "Vos invitations font la différence",
            "paragraphs": [
                f"Bonjour {FIRSTNAME}, merci d'avoir invité d'autres personnes à l'accès anticipé Dar Tahara. Vos parrainages nous aident à choisir les régions où lancer le service en priorité.",
                "Continuez à partager votre lien personnel avec vos proches qui possèdent ou gèrent un logement au Maroc.",
            ],
            "cta": "Partager à nouveau",
            "note": "Toute récompense vous sera confirmée directement lorsqu'elle sera disponible.",
        },
        "ar": {
            "subject": f"شكرًا لنشر الخبر، {FIRSTNAME}",
            "heading": "دعواتك تُحدث فرقًا",
            "paragraphs": [
                f"مرحبًا {FIRSTNAME}، شكرًا لدعوة الآخرين إلى الوصول المبكر لدار طهارة. تساعدنا إحالاتك على تحديد المناطق التي نطلق فيها أولًا.",
                "واصل مشاركة رابطك الشخصي مع العائلة والأصدقاء الذين يملكون أو يديرون منزلًا في المغرب.",
            ],
            "cta": "المشاركة مجددًا",
            "note": "سنؤكد لك أي مكافآت مباشرة عند توفّرها.",
        },
        "nl": {
            "subject": f"Bedankt dat u het nieuws deelt, {FIRSTNAME}",
            "heading": "Uw uitnodigingen maken het verschil",
            "paragraphs": [
                f"Hallo {FIRSTNAME}, bedankt dat u anderen uitnodigt voor early access tot Dar Tahara. Uw verwijzingen helpen ons bepalen waar we als eerste starten.",
                "Blijf uw persoonlijke link delen met familie en vrienden die een woning in Marokko bezitten of beheren.",
            ],
            "cta": "Opnieuw delen",
            "note": "Eventuele beloningen worden rechtstreeks aan u bevestigd zodra ze beschikbaar zijn.",
        },
        "es": {
            "subject": f"Gracias por correr la voz, {FIRSTNAME}",
            "heading": "Tus invitaciones marcan la diferencia",
            "paragraphs": [
                f"Hola {FIRSTNAME}, gracias por invitar a otras personas al acceso anticipado de Dar Tahara. Tus referidos nos ayudan a decidir dónde lanzar primero.",
                "Sigue compartiendo tu enlace personal con familiares y amigos que tengan o gestionen una vivienda en Marruecos.",
            ],
            "cta": "Compartir de nuevo",
            "note": "Te confirmaremos directamente cualquier recompensa cuando esté disponible.",
        },
        "de": {
            "subject": f"Danke, dass Sie Dar Tahara weiterempfehlen, {FIRSTNAME}",
            "heading": "Ihre Einladungen machen einen Unterschied",
            "paragraphs": [
                f"Hallo {FIRSTNAME}, vielen Dank, dass Sie andere zum frühen Zugang zu Dar Tahara einladen. Ihre Empfehlungen helfen uns zu entscheiden, wo wir zuerst starten.",
                "Teilen Sie Ihren persönlichen Link weiterhin mit Familie und Freunden, die ein Zuhause in Marokko besitzen oder verwalten.",
            ],
            "cta": "Erneut teilen",
            "note": "Etwaige Prämien bestätigen wir Ihnen direkt, sobald sie verfügbar sind.",
        },
        "pt": {
            "subject": f"Obrigado por divulgar a Dar Tahara, {FIRSTNAME}",
            "heading": "Os seus convites fazem a diferença",
            "paragraphs": [
                f"Olá {FIRSTNAME}, obrigado por convidar outras pessoas para o acesso antecipado da Dar Tahara. As suas indicações ajudam-nos a decidir onde lançar primeiro.",
                "Continue a partilhar o seu link pessoal com família e amigos que possuem ou gerem uma casa em Marrocos.",
            ],
            "cta": "Partilhar novamente",
            "note": "Quaisquer recompensas ser-lhe-ão confirmadas diretamente quando estiverem disponíveis.",
        },
    },
    "DT · City launch announcement": {
        "fr": {
            "subject": f"Dar Tahara arrive à {CITY}",
            "heading": f"Nous lançons le service à {CITY}",
            "paragraphs": [
                f"Bonne nouvelle, {FIRSTNAME}. Les services Dar Tahara d'entretien de maison et de bien deviennent disponibles à {CITY}.",
                "En tant que membre de l'accès anticipé, vous êtes invité à faire partie des premières personnes à organiser un service pour votre bien.",
            ],
            "cta": "Voir les services disponibles",
        },
        "ar": {
            "subject": f"دار طهارة قادمة إلى {CITY}",
            "heading": f"نطلق خدماتنا في {CITY}",
            "paragraphs": [
                f"أخبار رائعة، {FIRSTNAME}. أصبحت خدمات دار طهارة لتنظيف المنزل والعناية بالعقار متاحة في {CITY}.",
                "بصفتك من أعضاء الوصول المبكر، ندعوك لتكون من أوائل من يرتبون خدمة لعقارهم.",
            ],
            "cta": "عرض الخدمات المتاحة",
        },
        "nl": {
            "subject": f"Dar Tahara komt naar {CITY}",
            "heading": f"We starten in {CITY}",
            "paragraphs": [
                f"Goed nieuws, {FIRSTNAME}. De woningreiniging en vastgoedzorg van Dar Tahara worden beschikbaar in {CITY}.",
                "Als early-access-lid nodigen we u uit om als een van de eersten service voor uw woning te regelen.",
            ],
            "cta": "Bekijk wat beschikbaar is",
        },
        "es": {
            "subject": f"Dar Tahara llega a {CITY}",
            "heading": f"Lanzamos el servicio en {CITY}",
            "paragraphs": [
                f"Buenas noticias, {FIRSTNAME}. Los servicios de limpieza del hogar y cuidado de propiedades de Dar Tahara estarán disponibles en {CITY}.",
                "Como miembro del acceso anticipado, te invitamos a ser de los primeros en organizar un servicio para tu propiedad.",
            ],
            "cta": "Ver qué está disponible",
        },
        "de": {
            "subject": f"Dar Tahara kommt nach {CITY}",
            "heading": f"Wir starten in {CITY}",
            "paragraphs": [
                f"Gute Nachrichten, {FIRSTNAME}. Die Hausreinigung und Immobilienbetreuung von Dar Tahara wird in {CITY} verfügbar.",
                "Als Early-Access-Mitglied gehören Sie zu den Ersten, die einen Service für ihre Immobilie vereinbaren können.",
            ],
            "cta": "Verfügbarkeit ansehen",
        },
        "pt": {
            "subject": f"A Dar Tahara está a chegar a {CITY}",
            "heading": f"Vamos lançar o serviço em {CITY}",
            "paragraphs": [
                f"Boas notícias, {FIRSTNAME}. Os serviços de limpeza doméstica e cuidado de imóveis da Dar Tahara vão ficar disponíveis em {CITY}.",
                "Como membro do acesso antecipado, está convidado a ser dos primeiros a marcar um serviço para o seu imóvel.",
            ],
            "cta": "Ver o que está disponível",
        },
    },
    "DT · High-intent follow-up": {
        "fr": {
            "subject": f"Un message personnel au sujet de votre bien à {CITY}",
            "heading": "Préparons ensemble la suite",
            "paragraphs": [
                f"Bonjour {FIRSTNAME}, merci pour les informations que vous avez partagées au sujet de votre bien à {CITY}.",
                "Comme vous souhaitez commencer prochainement, un membre de l'équipe Dar Tahara aimerait s'assurer que tout sera prêt dès l'ouverture de votre région. Nous vous contacterons bientôt. Vous pouvez répondre à cet e-mail si vous avez des questions.",
            ],
        },
        "ar": {
            "subject": f"رسالة شخصية بشأن عقارك في {CITY}",
            "heading": "لنساعدك على الاستعداد",
            "paragraphs": [
                f"مرحبًا {FIRSTNAME}، شكرًا على التفاصيل التي شاركتها بشأن عقارك في {CITY}.",
                "لأنك ترغب في البدء قريبًا، يود أحد أعضاء فريق دار طهارة التأكد من استعدادنا لك فور افتتاح منطقتك. سنتواصل معك قريبًا، ويمكنك الرد على هذه الرسالة إذا كانت لديك أي أسئلة.",
            ],
        },
        "nl": {
            "subject": f"Een persoonlijk bericht over uw woning in {CITY}",
            "heading": "We helpen u graag voorbereiden",
            "paragraphs": [
                f"Hallo {FIRSTNAME}, bedankt voor de informatie die u over uw woning in {CITY} hebt gedeeld.",
                "Omdat u binnenkort wilt starten, zorgt een lid van het Dar Tahara-team graag dat we voor u klaarstaan zodra uw regio opent. We nemen spoedig contact op. Antwoord gerust op deze e-mail als u vragen hebt.",
            ],
        },
        "es": {
            "subject": f"Una nota personal sobre tu propiedad en {CITY}",
            "heading": "Te ayudamos a prepararlo todo",
            "paragraphs": [
                f"Hola {FIRSTNAME}, gracias por los detalles que compartiste sobre tu propiedad en {CITY}.",
                "Como quieres empezar pronto, un miembro del equipo de Dar Tahara se asegurará de que estemos preparados para ti en cuanto abramos tu zona. Nos pondremos en contacto contigo muy pronto. Responde a este correo si tienes alguna pregunta.",
            ],
        },
        "de": {
            "subject": f"Eine persönliche Nachricht zu Ihrer Immobilie in {CITY}",
            "heading": "Wir helfen Ihnen bei der Vorbereitung",
            "paragraphs": [
                f"Hallo {FIRSTNAME}, vielen Dank für die Angaben zu Ihrer Immobilie in {CITY}.",
                "Da Sie bald starten möchten, will ein Mitglied des Dar Tahara-Teams sicherstellen, dass wir bei der Eröffnung Ihrer Region für Sie bereit sind. Wir melden uns in Kürze. Antworten Sie bei Fragen gerne auf diese E-Mail.",
            ],
        },
        "pt": {
            "subject": f"Uma nota pessoal sobre o seu imóvel em {CITY}",
            "heading": "Vamos ajudar a preparar tudo",
            "paragraphs": [
                f"Olá {FIRSTNAME}, obrigado pelos detalhes que partilhou sobre o seu imóvel em {CITY}.",
                "Como pretende começar em breve, um membro da equipa da Dar Tahara quer garantir que estamos preparados para si assim que abrirmos a sua região. Entraremos em contacto em breve. Responda a este e-mail se tiver alguma questão.",
            ],
        },
    },
    "DT · Re-engagement": {
        "fr": {
            "subject": "Vous pensez toujours à l'entretien de votre maison au Maroc ?",
            "heading": "Nous sommes toujours là pour votre maison",
            "paragraphs": [
                f"Bonjour {FIRSTNAME}, cela fait quelque temps. Dar Tahara continue de se développer au Maroc et nous souhaitions prendre de vos nouvelles.",
                "Si votre bien ou vos besoins de service ont changé, vous pouvez mettre à jour vos préférences à tout moment afin de recevoir les informations adaptées.",
            ],
            "cta": "Mettre à jour mes préférences",
        },
        "ar": {
            "subject": "هل ما زلت تفكر في العناية بمنزلك في المغرب؟",
            "heading": "ما زلنا هنا للعناية بمنزلك",
            "paragraphs": [
                f"مرحبًا {FIRSTNAME}، مضى بعض الوقت. نواصل توسيع خدمات دار طهارة في المغرب وأردنا الاطمئنان عليك.",
                "إذا تغيّر عقارك أو احتياجاتك من الخدمات، يمكنك تحديث تفضيلاتك في أي وقت لنرسل إليك المعلومات المناسبة.",
            ],
            "cta": "تحديث تفضيلاتي",
        },
        "nl": {
            "subject": "Denkt u nog aan woningzorg in Marokko?",
            "heading": "We staan nog steeds klaar voor uw woning",
            "paragraphs": [
                f"Hallo {FIRSTNAME}, het is al even geleden. Dar Tahara blijft uitbreiden in Marokko en we wilden graag horen hoe het met u gaat.",
                "Zijn uw woning of servicebehoeften veranderd? Werk uw voorkeuren dan op elk moment bij, zodat u de juiste informatie van ons ontvangt.",
            ],
            "cta": "Mijn voorkeuren bijwerken",
        },
        "es": {
            "subject": "¿Sigues pensando en el cuidado del hogar en Marruecos?",
            "heading": "Seguimos aquí para cuidar de tu hogar",
            "paragraphs": [
                f"Hola {FIRSTNAME}, ha pasado un tiempo. Dar Tahara sigue creciendo en Marruecos y queríamos saber cómo estás.",
                "Si tu propiedad o tus necesidades de servicio han cambiado, puedes actualizar tus preferencias en cualquier momento para recibir la información adecuada.",
            ],
            "cta": "Actualizar mis preferencias",
        },
        "de": {
            "subject": "Denken Sie noch über Hausbetreuung in Marokko nach?",
            "heading": "Wir sind weiterhin für Ihr Zuhause da",
            "paragraphs": [
                f"Hallo {FIRSTNAME}, es ist eine Weile her. Dar Tahara wächst in Marokko weiter, und wir wollten uns bei Ihnen melden.",
                "Falls sich Ihre Immobilie oder Ihr Servicebedarf geändert hat, können Sie Ihre Präferenzen jederzeit aktualisieren, damit Sie die passenden Informationen erhalten.",
            ],
            "cta": "Meine Präferenzen aktualisieren",
        },
        "pt": {
            "subject": "Ainda pensa em cuidados domésticos em Marrocos?",
            "heading": "Continuamos aqui para cuidar da sua casa",
            "paragraphs": [
                f"Olá {FIRSTNAME}, já passou algum tempo. A Dar Tahara continua a crescer em Marrocos e queríamos saber como está.",
                "Se o seu imóvel ou as suas necessidades de serviço mudaram, pode atualizar as suas preferências a qualquer momento para receber a informação certa.",
            ],
            "cta": "Atualizar as minhas preferências",
        },
    },
    "DT · Preference update": {
        "fr": {
            "subject": "Mettez à jour vos préférences Dar Tahara",
            "heading": "Gardez vos informations à jour",
            "paragraphs": [
                f"Bonjour {FIRSTNAME}, vous pouvez modifier à tout moment les informations sur votre bien, les services qui vous intéressent et vos préférences de contact.",
                "En les tenant à jour, vous recevrez des informations pertinentes à mesure que nous ouvrons de nouvelles régions.",
            ],
            "cta": "Mettre à jour mes préférences",
        },
        "ar": {
            "subject": "حدّث تفضيلاتك لدى دار طهارة",
            "heading": "حافظ على تحديث بياناتك",
            "paragraphs": [
                f"مرحبًا {FIRSTNAME}، يمكنك تحديث تفاصيل عقارك والخدمات التي تهمك وتفضيلات التواصل في أي وقت.",
                "يساعدنا تحديث هذه البيانات على إرسال المعلومات المناسبة إليك عند افتتاح مناطق جديدة.",
            ],
            "cta": "تحديث تفضيلاتي",
        },
        "nl": {
            "subject": "Werk uw Dar Tahara-voorkeuren bij",
            "heading": "Houd uw gegevens actueel",
            "paragraphs": [
                f"Hallo {FIRSTNAME}, u kunt uw woninggegevens, service-interesses en contactvoorkeuren op elk moment bijwerken.",
                "Met actuele gegevens kunnen we u relevante updates sturen wanneer we nieuwe regio's openen.",
            ],
            "cta": "Mijn voorkeuren bijwerken",
        },
        "es": {
            "subject": "Actualiza tus preferencias de Dar Tahara",
            "heading": "Mantén tus datos al día",
            "paragraphs": [
                f"Hola {FIRSTNAME}, puedes actualizar los datos de tu propiedad, los servicios que te interesan y tus preferencias de contacto cuando quieras.",
                "Mantenerlos al día nos ayuda a enviarte información relevante a medida que abrimos nuevas zonas.",
            ],
            "cta": "Actualizar mis preferencias",
        },
        "de": {
            "subject": "Aktualisieren Sie Ihre Dar Tahara-Präferenzen",
            "heading": "Halten Sie Ihre Angaben aktuell",
            "paragraphs": [
                f"Hallo {FIRSTNAME}, Sie können Ihre Immobilienangaben, Serviceinteressen und Kontaktpräferenzen jederzeit aktualisieren.",
                "Aktuelle Angaben helfen uns, Ihnen bei der Eröffnung neuer Regionen relevante Informationen zu senden.",
            ],
            "cta": "Meine Präferenzen aktualisieren",
        },
        "pt": {
            "subject": "Atualize as suas preferências da Dar Tahara",
            "heading": "Mantenha os seus dados atualizados",
            "paragraphs": [
                f"Olá {FIRSTNAME}, pode atualizar os dados do seu imóvel, os serviços do seu interesse e as preferências de contacto sempre que quiser.",
                "Manter estes dados atualizados ajuda-nos a enviar informação relevante à medida que abrimos novas regiões.",
            ],
            "cta": "Atualizar as minhas preferências",
        },
    },
    "DT · Unsubscribe confirmation": {
        "fr": {
            "subject": "Vous êtes désinscrit des communications marketing Dar Tahara",
            "heading": "Votre désinscription est confirmée",
            "paragraphs": [
                f"Bonjour {FIRSTNAME}, vous avez été retiré des e-mails marketing Dar Tahara et ne recevrez plus nos communications marketing.",
                "Vous pourrez toujours recevoir des messages essentiels concernant une demande d'accès anticipé active. S'il s'agit d'une erreur, vous pouvez vous réinscrire à tout moment.",
            ],
            "cta": "Rejoindre à nouveau l'accès anticipé",
        },
        "ar": {
            "subject": "تم إلغاء اشتراكك في رسائل دار طهارة التسويقية",
            "heading": "تم إلغاء اشتراكك",
            "paragraphs": [
                f"مرحبًا {FIRSTNAME}، تمت إزالتك من رسائل دار طهارة التسويقية ولن تتلقى منا تحديثات تسويقية أخرى.",
                "قد تستمر في تلقي الرسائل الأساسية بشأن طلب وصول مبكر نشط. إذا حدث ذلك عن طريق الخطأ، يمكنك الانضمام مجددًا في أي وقت.",
            ],
            "cta": "الانضمام مجددًا إلى الوصول المبكر",
        },
        "nl": {
            "subject": "U bent afgemeld voor Dar Tahara-marketing",
            "heading": "U bent afgemeld",
            "paragraphs": [
                f"Hallo {FIRSTNAME}, u bent verwijderd uit de marketingmails van Dar Tahara en ontvangt geen verdere marketingupdates van ons.",
                "U kunt nog wel essentiële berichten ontvangen over een actieve early-access-aanvraag. Was dit een vergissing? Dan kunt u zich op elk moment opnieuw aanmelden.",
            ],
            "cta": "Opnieuw aanmelden voor early access",
        },
        "es": {
            "subject": "Te has dado de baja del marketing de Dar Tahara",
            "heading": "Tu baja está confirmada",
            "paragraphs": [
                f"Hola {FIRSTNAME}, te hemos eliminado de los correos de marketing de Dar Tahara y ya no recibirás más novedades de marketing.",
                "Es posible que sigas recibiendo mensajes esenciales sobre una solicitud activa de acceso anticipado. Si ha sido un error, puedes volver a unirte cuando quieras.",
            ],
            "cta": "Volver al acceso anticipado",
        },
        "de": {
            "subject": "Sie wurden vom Dar Tahara-Marketing abgemeldet",
            "heading": "Sie sind abgemeldet",
            "paragraphs": [
                f"Hallo {FIRSTNAME}, Sie wurden aus den Marketing-E-Mails von Dar Tahara entfernt und erhalten keine weiteren Marketing-Updates von uns.",
                "Wichtige Nachrichten zu einer aktiven Early-Access-Anfrage können Sie weiterhin erhalten. Falls dies ein Versehen war, können Sie sich jederzeit erneut anmelden.",
            ],
            "cta": "Erneut für Early Access anmelden",
        },
        "pt": {
            "subject": "Cancelou a subscrição do marketing da Dar Tahara",
            "heading": "A sua subscrição foi cancelada",
            "paragraphs": [
                f"Olá {FIRSTNAME}, foi removido dos e-mails de marketing da Dar Tahara e não receberá mais atualizações de marketing nossas.",
                "Poderá continuar a receber mensagens essenciais sobre um pedido de acesso antecipado ativo. Se foi um engano, pode voltar a aderir quando quiser.",
            ],
            "cta": "Voltar ao acesso antecipado",
        },
    },
}


PRIVACY = {
    "fr": "Confidentialité",
    "ar": "الخصوصية",
    "nl": "Privacy",
    "es": "Privacidad",
    "de": "Datenschutz",
    "pt": "Privacidade",
}


class ApiError(Exception):
    pass


def credentials():
    with open(CREDENTIALS_FILE, encoding="utf-8") as handle:
        values = dict(
            line.strip().split("=", 1)
            for line in handle
            if "=" in line and not line.startswith("#")
        )
    return values["username"], values["password"]


USER, PASSWORD = credentials()
AUTH = "Basic " + base64.b64encode(f"{USER}:{PASSWORD}".encode()).decode()


def api(method, path, body=None):
    data = json.dumps(body, ensure_ascii=False).encode("utf-8") if body is not None else None
    request = urllib.request.Request(
        BASE + path,
        data=data,
        method=method,
        headers={"Authorization": AUTH, "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")[:500]
        raise ApiError(f"HTTP {error.code} for {method} {path}: {detail}") from error
    except urllib.error.URLError as error:
        raise ApiError(f"API request failed for {method} {path}: {error.reason}") from error


def entity_id(value):
    if value is None:
        return None
    if isinstance(value, dict):
        value = value.get("id")
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def collection(payload):
    emails = payload.get("emails", {})
    return list(emails.values()) if isinstance(emails, dict) else emails


def paragraph(text):
    return f'<p style="font-size:15px;line-height:1.7;color:#574a3c;margin:0 0 14px;">{text}</p>'


def cta_url(locale, config):
    if "cta_path" not in config:
        return None
    path = config["cta_path"]
    url = f"https://www.dartahara.com/{locale}"
    if path:
        url += "/" + path
    if config.get("referral"):
        url += f"?ref={REFERRAL_CODE}"
    return url


def shell(locale, copy, config):
    rtl = locale == "ar"
    direction = "rtl" if rtl else "ltr"
    align = "right" if rtl else "left"
    body_html = "".join(paragraph(text) for text in copy["paragraphs"])
    url = cta_url(locale, config)
    cta = ""
    if copy.get("cta") and url:
        cta = (
            f'<a href="{url}" style="display:inline-block;margin:22px 0;'
            f'background:#2f4a29;color:#faf8f3;text-decoration:none;padding:13px 26px;'
            f'border-radius:999px;font-size:15px;font-weight:600;">{copy["cta"]}</a>'
        )
    note = ""
    if copy.get("note"):
        note = (
            '<p style="font-size:13px;line-height:1.6;color:#7a6a55;background:#f5efe2;'
            f'border-radius:10px;padding:12px 14px;">{copy["note"]}</p>'
        )
    return f"""<!doctype html><html lang="{locale}" dir="{direction}"><body style="margin:0;background:#faf8f3;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#26241f;text-align:{align};">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:8px;font-size:12px;color:#9c8562;">{{webview_text}}</div>
    <div style="background:#fff;border:1px solid #e8e0d0;border-radius:16px;padding:34px;text-align:{align};">
      <div style="font-size:20px;font-weight:700;color:#2f4a29;letter-spacing:.3px;">Dar Tahara</div>
      <div style="height:3px;width:44px;background:#d4a843;border-radius:2px;margin:14px 0 22px;"></div>
      <h1 style="font-size:23px;line-height:1.25;margin:0 0 12px;color:#26241f;">{copy["heading"]}</h1>
      {body_html}
      {cta}
      {note}
    </div>
    <p style="text-align:center;font-size:12px;color:#9c8562;margin-top:18px;line-height:1.7;">
      Dar Tahara, House of Purity · Morocco<br>
      <a href="https://www.dartahara.com/{locale}/privacy" style="color:#9c8562;">{PRIVACY[locale]}</a> ·
      {{unsubscribe_text}}
    </p>
  </div>
</body></html>"""


def child_parent_id(email):
    return entity_id(email.get("translationParent"))


def validate_child(email, master_id, locale):
    problems = []
    if child_parent_id(email) != master_id:
        problems.append(f"translationParent={email.get('translationParent')!r}")
    if email.get("language") != locale:
        problems.append(f"language={email.get('language')!r}")
    html = email.get("customHtml") or ""
    if locale == "ar" and ('<html lang="ar" dir="rtl">' not in html or "text-align:right" not in html):
        problems.append("Arabic HTML is not RTL")
    if "{webview_text}" not in html or "{unsubscribe_text}" not in html:
        problems.append("required shell tokens are missing")
    return problems


def main():
    created = existed = failed = 0
    try:
        all_emails = collection(api("GET", "/api/emails?limit=100"))
    except (ApiError, KeyError, ValueError) as error:
        print(f"FATAL: could not list Mautic emails: {error}")
        raise SystemExit(1)

    masters = {
        email.get("name"): email
        for email in all_emails
        if email.get("name") in MASTER_CONFIG
        and email.get("language") == "en"
        and child_parent_id(email) is None
    }
    missing = [name for name in MASTER_CONFIG if name not in masters]
    if missing:
        print("FATAL: missing English masters: " + ", ".join(missing))
        raise SystemExit(1)

    existing_pairs = {
        (child_parent_id(email), email.get("language"))
        for email in all_emails
        if child_parent_id(email) is not None
    }

    for master_name, config in MASTER_CONFIG.items():
        master_id = entity_id(masters[master_name].get("id"))
        try:
            master = api("GET", f"/api/emails/{master_id}")["email"]
            if "translationParent" not in master or "translationChildren" not in master:
                raise ApiError("email entity does not expose Mautic translation fields")
        except (ApiError, KeyError, TypeError) as error:
            print(f"  ! {master_name} FAILED: could not inspect master: {error}")
            failed += len(LOCALES)
            continue

        for locale in LOCALES:
            label = f"{master_name} [{locale}]"
            if (master_id, locale) in existing_pairs:
                print(f"  = {label} (exists)")
                existed += 1
                continue

            copy = TRANSLATIONS[master_name][locale]
            body = {
                "name": f"{master_name} · {locale.upper()}",
                "subject": copy["subject"],
                "emailType": master.get("emailType") or "template",
                "customHtml": shell(locale, copy, config),
                "isPublished": True,
                "fromName": master.get("fromName") or "Dar Tahara",
                "fromAddress": master.get("fromAddress") or "hello@dartahara.com",
                "replyToAddress": master.get("replyToAddress") or "hello@dartahara.com",
                "translationParent": master_id,
                "language": locale,
            }
            try:
                result = api("POST", "/api/emails/new", body)
                child_id = entity_id(result.get("email", {}).get("id"))
                if child_id is None:
                    raise ApiError(f"create response has no email id: {result!r}")
                child = api("GET", f"/api/emails/{child_id}")["email"]
                problems = validate_child(child, master_id, locale)
                if problems:
                    raise ApiError("read-back validation failed: " + "; ".join(problems))
                print(f"  + {label} (id {child_id})")
                existing_pairs.add((master_id, locale))
                created += 1
            except (ApiError, KeyError, TypeError, ValueError) as error:
                print(f"  ! {label} FAILED: {error}")
                failed += 1

    print(f"\ncreated: {created}  existed: {existed}  failed: {failed}")
    raise SystemExit(1 if failed else 0)


if __name__ == "__main__":
    main()

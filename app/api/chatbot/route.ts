import { NextRequest, NextResponse } from 'next/server'

/**
 * API du Chatbot IA NEXUS - Version Avancée
 * 
 * Fonctionnalités:
 * - Recherche web pour informations universitaires
 * - Intégration avec API IA (OpenAI, Claude, etc.)
 * - Base de connaissances UNIKIN
 * - Contexte de conversation
 */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  message: string
  history?: ChatMessage[]
  context?: {
    userId?: string
    userRole?: string
    studentInfo?: any
  }
}

interface WebSearchResult {
  title: string
  snippet: string
  url: string
}

// Configuration - À mettre dans .env en production
const AI_PROVIDER = process.env.AI_PROVIDER || 'local' // 'openai', 'claude', 'local'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

// Informations sur l'UNIKIN
const UNIKIN_KNOWLEDGE = {
  general: {
    name: "Université de Kinshasa (UNIKIN)",
    founded: "1954",
    location: "Mont Amba, Kinshasa, République Démocratique du Congo",
    rector: "Prof. Jean-Marie Kayembe Ntumba",
    website: "https://www.unikin.ac.cd",
    email: "info@unikin.ac.cd",
    phone: "+243 81 XXX XXXX",
    description: "L'Université de Kinshasa est la plus grande université de la RDC et l'une des plus prestigieuses d'Afrique centrale. Elle compte plus de 30 000 étudiants répartis dans 11 facultés."
  },
  faculties: [
    { name: "Faculté de Médecine", code: "MED", dean: "Prof. XXX", students: "5000+" },
    { name: "Faculté de Droit", code: "DROIT", dean: "Prof. XXX", students: "4000+" },
    { name: "Faculté des Sciences", code: "SCI", dean: "Prof. XXX", students: "3500+" },
    { name: "Faculté des Lettres et Sciences Humaines", code: "FLSH", dean: "Prof. XXX", students: "3000+" },
    { name: "Faculté Polytechnique", code: "POLY", dean: "Prof. XXX", students: "2500+" },
    { name: "Faculté des Sciences Économiques et de Gestion", code: "FASEG", dean: "Prof. XXX", students: "4500+" },
    { name: "Faculté de Psychologie et Sciences de l'Éducation", code: "FPSE", dean: "Prof. XXX", students: "2000+" },
    { name: "Faculté des Sciences Agronomiques", code: "AGRO", dean: "Prof. XXX", students: "1500+" },
    { name: "Faculté des Sciences Pharmaceutiques", code: "PHARMA", dean: "Prof. XXX", students: "1200+" },
    { name: "Faculté de Médecine Vétérinaire", code: "VET", dean: "Prof. XXX", students: "800+" },
    { name: "Faculté de Pétrole, Gaz et Énergies Renouvelables", code: "PGER", dean: "Prof. XXX", students: "600+" }
  ],
  academicCalendar: {
    year: "2025-2026",
    firstSemester: { start: "Octobre 2025", end: "Février 2026", exams: "Janvier-Février 2026" },
    secondSemester: { start: "Mars 2026", end: "Juillet 2026", exams: "Juin-Juillet 2026" },
    holidays: ["Vacances de Noël: 20 Déc - 5 Jan", "Vacances de Pâques: 2 semaines en Avril", "Grandes vacances: Août-Septembre"]
  },
  fees: {
    registration: "50 USD",
    tuitionPerYear: "200-500 USD selon la faculté",
    library: "20 USD/an",
    sports: "10 USD/an",
    insurance: "15 USD/an"
  },
  services: {
    library: "Bibliothèque centrale ouverte de 8h à 20h du lundi au samedi",
    health: "Centre médical universitaire sur le campus",
    housing: "Homes universitaires disponibles (places limitées)",
    restaurant: "Restaurant universitaire - Petit déjeuner, déjeuner, dîner",
    transport: "Bus universitaires desservant les principaux quartiers de Kinshasa"
  }
}

// Base de connaissances étendue avec patterns
const knowledgePatterns: { pattern: RegExp; handler: (match: RegExpMatchArray, message: string) => { response: string; suggestions?: string[] } }[] = [
  // Salutations
  {
    pattern: /^(bonjour|salut|hello|bonsoir|coucou|hi|hey)/i,
    handler: () => ({
      response: "Bonjour ! 👋 Je suis **NEXUS Assistant**, votre assistant IA universitaire intelligent.\n\nJe peux vous aider avec :\n• 📚 Informations sur l'UNIKIN et ses facultés\n• 📅 Calendrier académique et emploi du temps\n• 📊 Notes, évaluations et résultats\n• 💰 Frais et finances\n• 🔍 Recherche d'informations en ligne\n• ❓ Toute question sur la vie universitaire\n\nComment puis-je vous aider ?",
      suggestions: ["Parle-moi de l'UNIKIN", "Quelles sont les facultés ?", "Calendrier académique", "Frais de scolarité"]
    })
  },

  // Info UNIKIN
  {
    pattern: /unikin|universit[eé].*kinshasa|notre.*universit[eé]/i,
    handler: () => ({
      response: `🏛️ **${UNIKIN_KNOWLEDGE.general.name}**\n\n` +
        `📍 **Localisation:** ${UNIKIN_KNOWLEDGE.general.location}\n` +
        `📅 **Fondée en:** ${UNIKIN_KNOWLEDGE.general.founded}\n` +
        `👨‍🎓 **Recteur:** ${UNIKIN_KNOWLEDGE.general.rector}\n` +
        `🌐 **Site web:** ${UNIKIN_KNOWLEDGE.general.website}\n\n` +
        `${UNIKIN_KNOWLEDGE.general.description}\n\n` +
        `L'UNIKIN compte **11 facultés** et forme des milliers de diplômés chaque année dans tous les domaines.`,
      suggestions: ["Quelles sont les facultés ?", "Comment s'inscrire ?", "Frais de scolarité", "Contact"]
    })
  },

  // Facultés
  {
    pattern: /facult[eé]s?|d[eé]partement|fili[eè]re/i,
    handler: () => {
      const facultiesList = UNIKIN_KNOWLEDGE.faculties
        .map(f => `• **${f.name}** (${f.code}) - ${f.students} étudiants`)
        .join('\n')
      return {
        response: `🎓 **Les 11 Facultés de l'UNIKIN:**\n\n${facultiesList}\n\n💡 Chaque faculté offre des programmes de Licence (3 ans), Master (2 ans) et Doctorat.`,
        suggestions: ["Faculté de Médecine", "Faculté de Droit", "Faculté Polytechnique", "Comment choisir ma faculté ?"]
      }
    }
  },

  // Calendrier académique
  {
    pattern: /calendrier|ann[eé]e.*acad[eé]mique|semestre|session|quand.*exam/i,
    handler: () => {
      const cal = UNIKIN_KNOWLEDGE.academicCalendar
      return {
        response: `📅 **Calendrier Académique ${cal.year}**\n\n` +
          `**Premier Semestre:**\n` +
          `• Cours: ${cal.firstSemester.start} - ${cal.firstSemester.end}\n` +
          `• Examens: ${cal.firstSemester.exams}\n\n` +
          `**Second Semestre:**\n` +
          `• Cours: ${cal.secondSemester.start} - ${cal.secondSemester.end}\n` +
          `• Examens: ${cal.secondSemester.exams}\n\n` +
          `**Vacances:**\n${cal.holidays.map(h => `• ${h}`).join('\n')}`,
        suggestions: ["Quand commencent les cours ?", "Date des examens", "Vacances", "Mon emploi du temps"]
      }
    }
  },

  // Frais
  {
    pattern: /frais|co[uû]t|prix|payer|tarif|scolarit[eé]|minerval/i,
    handler: () => {
      const fees = UNIKIN_KNOWLEDGE.fees
      return {
        response: `💰 **Frais Universitaires UNIKIN (2025-2026)**\n\n` +
          `• **Inscription:** ${fees.registration}\n` +
          `• **Minerval annuel:** ${fees.tuitionPerYear}\n` +
          `• **Bibliothèque:** ${fees.library}\n` +
          `• **Sport:** ${fees.sports}\n` +
          `• **Assurance:** ${fees.insurance}\n\n` +
          `💳 **Modes de paiement acceptés:**\n` +
          `• Mobile Money (M-Pesa, Orange Money, Airtel Money)\n` +
          `• Virement bancaire\n` +
          `• Paiement au guichet\n\n` +
          `⚠️ Les frais peuvent varier selon la faculté et le niveau d'études.`,
        suggestions: ["Comment payer ?", "Demander une bourse", "Paiement en tranches", "Réduction possible ?"]
      }
    }
  },

  // Services
  {
    pattern: /biblioth[eè]que|cantine|restaurant|logement|home|transport|bus|sant[eé]|infirmerie/i,
    handler: (match, message) => {
      const services = UNIKIN_KNOWLEDGE.services
      let response = `🏫 **Services Universitaires UNIKIN**\n\n`
      
      if (/biblioth/i.test(message)) {
        response += `📚 **Bibliothèque:**\n${services.library}\n\nRessources: Plus de 100 000 ouvrages, accès aux bases de données numériques, salles d'étude.`
      } else if (/restaurant|cantine/i.test(message)) {
        response += `🍽️ **Restaurant Universitaire:**\n${services.restaurant}\n\nPrix: ~2 USD par repas pour les étudiants.`
      } else if (/logement|home/i.test(message)) {
        response += `🏠 **Logement:**\n${services.housing}\n\nPour postuler: Service social de l'université.`
      } else if (/transport|bus/i.test(message)) {
        response += `🚌 **Transport:**\n${services.transport}\n\nAbonnement mensuel disponible.`
      } else if (/sant|infirmerie/i.test(message)) {
        response += `🏥 **Santé:**\n${services.health}\n\nConsultations gratuites pour les étudiants inscrits.`
      } else {
        response += `📚 **Bibliothèque:** ${services.library}\n\n`
        response += `🍽️ **Restaurant:** ${services.restaurant}\n\n`
        response += `🏠 **Logement:** ${services.housing}\n\n`
        response += `🚌 **Transport:** ${services.transport}\n\n`
        response += `🏥 **Santé:** ${services.health}`
      }
      
      return { response, suggestions: ["Horaires bibliothèque", "Menu du restaurant", "Demander un logement", "Bus universitaire"] }
    }
  },

  // Inscription
  {
    pattern: /inscri|admission|candidat|postuler|comment.*entrer|rejoindre/i,
    handler: () => ({
      response: `📋 **Procédure d'Inscription à l'UNIKIN**\n\n` +
        `**1. Conditions d'admission:**\n` +
        `• Diplôme d'État (Baccalauréat) ou équivalent\n` +
        `• Âge minimum: 18 ans\n` +
        `• Réussite au concours d'entrée (certaines facultés)\n\n` +
        `**2. Documents requis:**\n` +
        `• Diplôme d'État original + 2 copies\n` +
        `• Acte de naissance\n` +
        `• 6 photos passeport\n` +
        `• Certificat médical\n` +
        `• Frais d'inscription\n\n` +
        `**3. Étapes:**\n` +
        `1. Retirer le formulaire au secrétariat\n` +
        `2. Remplir et soumettre avec les documents\n` +
        `3. Passer le test d'entrée (si applicable)\n` +
        `4. Attendre la liste des admis\n` +
        `5. Payer les frais et finaliser l'inscription\n\n` +
        `📅 **Période:** Généralement Août-Octobre`,
      suggestions: ["Documents requis", "Concours d'entrée", "Frais d'inscription", "Contact admission"]
    })
  },

  // Emploi du temps
  {
    pattern: /emploi.*temps|horaire|planning|quand.*cours/i,
    handler: () => ({
      response: `📅 **Emploi du Temps**\n\n` +
        `Pour consulter votre emploi du temps personnalisé:\n\n` +
        `1. Connectez-vous à votre espace étudiant\n` +
        `2. Allez dans le menu **"Emploi du temps"**\n` +
        `3. Vous verrez votre planning hebdomadaire\n\n` +
        `📱 **Fonctionnalités:**\n` +
        `• Vue jour/semaine/mois\n` +
        `• Notifications de changements\n` +
        `• Export vers Google Calendar\n` +
        `• Détails des salles et professeurs\n\n` +
        `💡 L'emploi du temps peut changer. Vérifiez régulièrement!`,
      suggestions: ["Voir mon emploi du temps", "Exporter le calendrier", "Changement de salle", "Cours annulé"]
    })
  },

  // Notes
  {
    pattern: /note|r[eé]sultat|bulletin|moyenne|r[eé]ussi|[eé]chou[eé]/i,
    handler: () => ({
      response: `📊 **Consultation des Notes**\n\n` +
        `**Pour voir vos notes:**\n` +
        `1. Accédez à **"Notes"** dans votre espace\n` +
        `2. Sélectionnez l'année académique\n` +
        `3. Consultez vos résultats par cours\n\n` +
        `**Système de notation UNIKIN:**\n` +
        `• 16-20: Distinction\n` +
        `• 14-15.9: Grande Distinction\n` +
        `• 12-13.9: Satisfaction\n` +
        `• 10-11.9: Passable\n` +
        `• <10: Échec (reprise)\n\n` +
        `**Délibération:**\n` +
        `Les notes sont publiées après délibération du jury. Cela peut prendre 2-4 semaines après les examens.`,
      suggestions: ["Mes dernières notes", "Calculer ma moyenne", "Contester une note", "Session de rattrapage"]
    })
  },

  // Évaluations
  {
    pattern: /[eé]valuation|examen|interro|tp|td|projet|oral|test/i,
    handler: () => ({
      response: `📝 **Système d'Évaluations**\n\n` +
        `**Types d'évaluations:**\n` +
        `• 📋 **Examens** - Évaluations finales (40-60%)\n` +
        `• ❓ **Interrogations** - Contrôles réguliers (10-20%)\n` +
        `• 🔬 **TP** - Travaux pratiques en labo\n` +
        `• 📖 **TD** - Travaux dirigés en classe\n` +
        `• 📁 **Projets** - Travaux de recherche\n` +
        `• 🎤 **Oraux** - Présentations et soutenances\n\n` +
        `**Anti-plagiat:**\n` +
        `⚠️ Tous les travaux écrits sont vérifiés par notre système anti-plagiat. Le plagiat entraîne la note de 0 et des sanctions disciplinaires.\n\n` +
        `Accédez à vos évaluations via le menu **"Évaluations"**.`,
      suggestions: ["Prochaines évaluations", "Soumettre un TP", "Voir mes résultats", "Calendrier des examens"]
    })
  },

  // Contact
  {
    pattern: /contact|joindre|email|t[eé]l[eé]phone|adresse|o[uù].*trouver/i,
    handler: () => ({
      response: `📞 **Contacts UNIKIN**\n\n` +
        `**Rectorat:**\n` +
        `📍 Avenue de l'Université, Mont Amba, Kinshasa\n` +
        `📧 ${UNIKIN_KNOWLEDGE.general.email}\n` +
        `📞 ${UNIKIN_KNOWLEDGE.general.phone}\n` +
        `🌐 ${UNIKIN_KNOWLEDGE.general.website}\n\n` +
        `**Services:**\n` +
        `• Scolarité: scolarite@unikin.ac.cd\n` +
        `• Admission: admission@unikin.ac.cd\n` +
        `• Support technique: support@nexus-unikin.cd\n\n` +
        `**Horaires d'ouverture:**\n` +
        `Lundi - Vendredi: 8h00 - 16h00\n` +
        `Samedi: 8h00 - 12h00`,
      suggestions: ["Localisation sur la carte", "Contact ma faculté", "Support technique", "Rendez-vous"]
    })
  },

  // Bourse
  {
    pattern: /bourse|aide.*financi[eè]re|subvention|sponsor/i,
    handler: () => ({
      response: `🎓 **Bourses et Aides Financières**\n\n` +
        `**Bourses disponibles:**\n` +
        `• **Bourse d'excellence** - Pour les meilleurs étudiants (moyenne ≥16)\n` +
        `• **Bourse sociale** - Selon les revenus familiaux\n` +
        `• **Bourse gouvernementale** - Programme national\n` +
        `• **Bourses internationales** - Partenaires étrangers\n\n` +
        `**Comment postuler:**\n` +
        `1. Remplir le formulaire de demande\n` +
        `2. Fournir les justificatifs (relevés de notes, revenus)\n` +
        `3. Déposer au Service social\n` +
        `4. Attendre la décision du comité\n\n` +
        `📅 **Période de candidature:** Généralement Septembre-Novembre`,
      suggestions: ["Critères de sélection", "Documents requis", "Date limite", "Autres aides"]
    })
  },

  // Stage
  {
    pattern: /stage|entreprise|convention|emploi|travail|carri[eè]re/i,
    handler: () => ({
      response: `💼 **Stages et Emploi**\n\n` +
        `**Service Stages & Carrières:**\n` +
        `L'UNIKIN dispose d'un service dédié pour vous accompagner.\n\n` +
        `**Offres de stage:**\n` +
        `• Consultez les offres dans **"Stages & Emploi"**\n` +
        `• Partenariats avec +100 entreprises en RDC\n` +
        `• Stages obligatoires selon les filières\n\n` +
        `**Convention de stage:**\n` +
        `1. Trouvez une entreprise d'accueil\n` +
        `2. Demandez une convention au secrétariat\n` +
        `3. Faites signer par l'entreprise et l'université\n` +
        `4. Commencez votre stage\n\n` +
        `**Durée:** 1-6 mois selon le programme`,
      suggestions: ["Offres de stage", "Rédiger mon CV", "Lettre de motivation", "Convention de stage"]
    })
  },

  // Merci
  {
    pattern: /merci|thanks|thank you/i,
    handler: () => ({
      response: "De rien ! 😊 Je suis là pour vous aider. N'hésitez pas si vous avez d'autres questions sur l'UNIKIN ou votre parcours universitaire !",
      suggestions: ["Autre question", "Parler à un humain", "Retour à l'accueil"]
    })
  },

  // Au revoir
  {
    pattern: /au revoir|bye|[aà] bient[oô]t|ciao|tchao/i,
    handler: () => ({
      response: "Au revoir ! 👋 Bonne continuation dans vos études à l'UNIKIN. Je reste disponible 24h/24 si vous avez besoin d'aide. À bientôt !",
      suggestions: []
    })
  }
]

/**
 * Recherche web simulée pour les informations universitaires
 * En production, utiliser une vraie API de recherche (Google, Bing, etc.)
 */
async function searchWeb(query: string): Promise<WebSearchResult[]> {
  // Simulation de résultats de recherche liés à l'UNIKIN
  const simulatedResults: WebSearchResult[] = [
    {
      title: "Université de Kinshasa - Site Officiel",
      snippet: "Bienvenue sur le site officiel de l'UNIKIN. Découvrez nos programmes, facultés et actualités.",
      url: "https://www.unikin.ac.cd"
    },
    {
      title: "Inscription UNIKIN 2025-2026",
      snippet: "Toutes les informations sur les procédures d'inscription pour l'année académique 2025-2026.",
      url: "https://www.unikin.ac.cd/inscription"
    },
    {
      title: "Résultats et Palmarès UNIKIN",
      snippet: "Consultez les résultats des examens et les palmarès des différentes facultés.",
      url: "https://www.unikin.ac.cd/resultats"
    }
  ]

  return simulatedResults
}

/**
 * Appel à l'API OpenAI (si configurée)
 */
async function callOpenAI(messages: ChatMessage[]): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Tu es NEXUS Assistant, l'assistant IA de l'Université de Kinshasa (UNIKIN) en RDC. 
          Tu aides les étudiants et le personnel avec des informations sur l'université, les cours, les inscriptions, etc.
          Réponds toujours en français de manière professionnelle mais amicale.
          Si tu ne connais pas une information spécifique, suggère de contacter le service approprié.`
        },
        ...messages
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  })

  const data = await response.json()
  return data.choices?.[0]?.message?.content || "Je n'ai pas pu générer une réponse."
}

/**
 * Appel à l'API Anthropic Claude (si configurée)
 */
async function callClaude(messages: ChatMessage[]): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: `Tu es NEXUS Assistant, l'assistant IA de l'Université de Kinshasa (UNIKIN) en RDC. 
      Tu aides les étudiants et le personnel avec des informations sur l'université, les cours, les inscriptions, etc.
      Réponds toujours en français de manière professionnelle mais amicale.`,
      messages: messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
    })
  })

  const data = await response.json()
  return data.content?.[0]?.text || "Je n'ai pas pu générer une réponse."
}

/**
 * Génère une réponse intelligente basée sur le contexte
 */
async function generateResponse(message: string, history: ChatMessage[]): Promise<{ response: string; suggestions?: string[]; sources?: WebSearchResult[] }> {
  const normalizedMessage = message.toLowerCase().trim()

  // 1. Chercher dans les patterns de connaissance locale
  for (const { pattern, handler } of knowledgePatterns) {
    const match = normalizedMessage.match(pattern)
    if (match) {
      return handler(match, message)
    }
  }

  // 2. Si aucun pattern ne correspond, essayer l'IA externe
  if (AI_PROVIDER === 'openai' && OPENAI_API_KEY) {
    try {
      const aiResponse = await callOpenAI([...history, { role: 'user', content: message }])
      return {
        response: aiResponse,
        suggestions: ["Autre question", "Plus de détails", "Contacter un humain"]
      }
    } catch (error) {
      console.error('OpenAI error:', error)
    }
  }

  if (AI_PROVIDER === 'claude' && ANTHROPIC_API_KEY) {
    try {
      const aiResponse = await callClaude([...history, { role: 'user', content: message }])
      return {
        response: aiResponse,
        suggestions: ["Autre question", "Plus de détails", "Contacter un humain"]
      }
    } catch (error) {
      console.error('Claude error:', error)
    }
  }

  // 3. Recherche web si la question semble demander des informations externes
  if (/recherche|cherche|trouve|internet|web|google|info sur/i.test(message)) {
    const searchResults = await searchWeb(message)
    return {
      response: `🔍 Voici ce que j'ai trouvé sur le web:\n\n` +
        searchResults.map(r => `**${r.title}**\n${r.snippet}\n🔗 ${r.url}`).join('\n\n'),
      suggestions: ["Plus de résultats", "Autre recherche"],
      sources: searchResults
    }
  }

  // 4. Réponse par défaut intelligente
  return {
    response: `Je comprends que vous posez une question sur "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"\n\n` +
      `Je n'ai pas d'information précise à ce sujet dans ma base de connaissances. Voici ce que je peux faire:\n\n` +
      `• 🔍 **Reformulez** votre question avec plus de détails\n` +
      `• 📞 **Contactez** le service concerné: info@unikin.ac.cd\n` +
      `• 💬 **Demandez** à parler à un conseiller humain\n\n` +
      `Ou choisissez un sujet dans les suggestions ci-dessous:`,
    suggestions: [
      "Informations sur l'UNIKIN",
      "Inscription et admission",
      "Frais de scolarité",
      "Emploi du temps",
      "Contacter l'administration"
    ]
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, history = [] } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message requis' }, { status: 400 })
    }

    // Générer la réponse
    const result = await generateResponse(message, history)

    // Simuler un délai de réflexion
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700))

    return NextResponse.json({
      response: result.response,
      suggestions: result.suggestions,
      sources: result.sources
    })

  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json({ 
      response: "Désolé, une erreur technique s'est produite. Veuillez réessayer ou contacter le support: support@nexus-unikin.cd",
      suggestions: ["Réessayer", "Contacter le support"]
    }, { status: 500 })
  }
}

// GET - Information sur le chatbot
export async function GET() {
  return NextResponse.json({
    name: 'NEXUS Assistant',
    version: '2.0.0',
    status: 'online',
    aiProvider: AI_PROVIDER,
    capabilities: [
      'Informations UNIKIN',
      'Calendrier académique',
      'Frais et finances',
      'Inscription et admission',
      'Notes et évaluations',
      'Services universitaires',
      'Recherche web',
      'Support multilingue (FR)'
    ],
    university: UNIKIN_KNOWLEDGE.general
  })
}

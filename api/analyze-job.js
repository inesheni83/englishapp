import { verifySupabaseJWT, unauthorizedResponse } from './_lib/auth.js';
import { checkRateLimit, rateLimitedResponse } from './_lib/rateLimit.js';

export const config = {
  runtime: 'edge',
};

const MAX_OFFER_LENGTH = 20000;       // ~20kB de texte d'offre
const MAX_CV_BYTES = 8 * 1024 * 1024; // 8 MB de CV PDF (Gemini supporte plus, on cap raisonnablement)

const buildAnalysisPrompt = ({ jobTitle, companyName, offerText, userLevel, levelBand }) => `You are a senior career coach AND English teacher specialised in tech industry interviews. You help francophone tech professionals prepare for specific job applications.

ANALYSE the candidate's CV (provided as a PDF in this request) AND the job offer below. Then build a personalised English learning plan + interview preparation that is SPECIFIC to this exact role at this exact company.

================================================================================
JOB OFFER
================================================================================
Position: ${jobTitle}
Company: ${companyName}

Offer text:
"""
${offerText.slice(0, MAX_OFFER_LENGTH)}
"""

CANDIDATE CEFR ENGLISH LEVEL: ${userLevel} (target band: ${levelBand})
================================================================================

YOUR TASK
Produce a single JSON document containing:

1. cvSummary: extracted from the CV (skills, years of experience, key past roles, notable projects, languages)
2. companyBriefing: 1 short paragraph (3-4 sentences) in French about ${companyName}: what they do, their tech stack if known, their culture, anything relevant for interview prep. If you don't know the company, say so honestly and describe the kind of company implied by the offer.
3. gapAnalysis: list of 5-8 concrete gaps between the CV and the offer (skills missing, experience level mismatches, vocabulary the candidate will need to master) with a short "howToBridge" tip in French for each.
4. learningPlan: 7 days of bite-sized English lessons SPECIFIC to this role/company. Each day has a clear theme tied to a skill/topic in the offer. Each day must include:
    - title (English, role-specific)
    - vocabulary: 8 to 12 English words/expressions that appear in or are implied by the offer (with French translation, English example sentence in the work context, French translation of the example)
    - grammarFocus: ONE grammar point likely useful for THIS role (e.g. "Talking about past projects: Past Simple vs Present Perfect" for someone presenting their experience)
    - keyExpression: ONE professional English expression with French meaning, English example, French translation
    - miniDialogue: 4-6 lines of an English dialogue simulating a realistic moment for this role at ${companyName} (each line: speaker A/B, English text, French translation)
5. interviewQuestions: exactly 12 LIKELY interview questions for this exact role at ${companyName}. Mix HR (motivation, fit), behavioural (STAR-style), and technical (skills, tools mentioned in the offer). For each question give:
    - category (HR | Behavioural | Technical | Situational)
    - question (English, ${levelBand} level)
    - whyAsked (1 short French sentence: why this question is likely for THIS offer)
    - hint (1 short French sentence to help the candidate structure their answer)
6. coreVocabulary: 30 distinct, high-impact English terms (with French translation) that the candidate MUST master before this interview, derived from the offer (frameworks, tools, methodologies, business terms).

LANGUAGE RULES
- All "english" / "word" / "example" / "question" / "text" fields MUST be in English.
- All "translation" / "meaning" / "hint" / "whyAsked" / "howToBridge" / "companyBriefing" fields MUST be in French.
- Vocabulary level must match ${levelBand}.

OUTPUT
Return ONLY a single valid JSON object with this EXACT structure (no markdown, no commentary):

{
  "cvSummary": {
    "yearsOfExperience": number,
    "currentRole": "string",
    "topSkills": ["skill 1", "skill 2", "..."],
    "notableProjects": ["short description 1", "..."],
    "languages": ["English: B1", "French: native", "..."]
  },
  "companyBriefing": "string in French",
  "gapAnalysis": [
    { "gap": "string", "severity": "low|medium|high", "howToBridge": "string in French" }
  ],
  "coreVocabulary": [
    { "word": "english", "translation": "francais" }
  ],
  "learningPlan": [
    {
      "day": 1,
      "title": "English title",
      "vocabulary": [
        { "word": "english", "translation": "francais", "example": "english sentence", "exampleTranslation": "phrase en francais" }
      ],
      "grammarFocus": {
        "title": "English grammar focus",
        "explanation": "Explication courte en francais",
        "example": "english sentence",
        "exampleTranslation": "phrase en francais"
      },
      "keyExpression": {
        "phrase": "english expression",
        "meaning": "sens en francais",
        "example": "english sentence",
        "exampleTranslation": "phrase en francais"
      },
      "miniDialogue": [
        { "speaker": "A", "text": "english", "translation": "francais" }
      ]
    }
  ],
  "interviewQuestions": [
    {
      "id": 1,
      "category": "HR|Behavioural|Technical|Situational",
      "question": "english question",
      "whyAsked": "phrase en francais",
      "hint": "phrase en francais"
    }
  ]
}

Constraints:
- learningPlan: exactly 7 days
- interviewQuestions: exactly 12 questions
- coreVocabulary: exactly 30 entries
- gapAnalysis: 5 to 8 entries`;

const levelBandFor = (userLevel) => {
  const base = (userLevel || 'B1').split(' ')[0];
  const map = { A1: 'A1/A2', A2: 'A1/A2', B1: 'B1/B2', B2: 'B1/B2', C1: 'C1/C2', C2: 'C1/C2' };
  return map[base] || 'B1/B2';
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  // 1. Auth
  const auth = await verifySupabaseJWT(req.headers.get('authorization'));
  if (!auth) return unauthorizedResponse('Missing or invalid authentication token');

  // 2. Rate limit (more aggressive for this endpoint - it consumes more Gemini tokens)
  const rl = await checkRateLimit(auth.userId, 'analyze-job');
  if (!rl.ok) return rateLimitedResponse(rl);

  // 3. Parse body
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const { cvBase64, offerText, jobTitle, companyName, userLevel } = body || {};
  if (!offerText || !jobTitle || !companyName) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: jobTitle, companyName, offerText' }),
      { status: 400 },
    );
  }
  if (typeof offerText !== 'string' || offerText.length < 50) {
    return new Response(
      JSON.stringify({ error: 'offerText must be at least 50 characters' }),
      { status: 400 },
    );
  }
  if (cvBase64 && typeof cvBase64 === 'string') {
    // Rough size check on base64 payload (3/4 ratio)
    const approxBytes = Math.floor((cvBase64.length * 3) / 4);
    if (approxBytes > MAX_CV_BYTES) {
      return new Response(
        JSON.stringify({ error: 'CV file too large (max 8 MB)' }),
        { status: 413 },
      );
    }
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API Key is missing' }), { status: 500 });
  }

  const levelBand = levelBandFor(userLevel);
  const promptText = buildAnalysisPrompt({ jobTitle, companyName, offerText, userLevel, levelBand });

  const parts = [];
  if (cvBase64) {
    parts.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: cvBase64,
      },
    });
  }
  parts.push({ text: promptText });

  // 4. Call Gemini in multimodal mode
  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: 'You are a pure JSON generator. Return only one valid JSON object, no markdown, no commentary, no code fences.',
            }],
          },
          contents: [{ role: 'user', parts }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.6,
          },
        }),
      },
    );

    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(
        JSON.stringify({ error: 'Gemini upstream error', status: upstream.status, detail: errText.slice(0, 500) }),
        { status: upstream.status === 429 ? 429 : 502 },
      );
    }

    const data = await upstream.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return new Response(
        JSON.stringify({ error: 'Could not parse JSON from Gemini response', raw: text.slice(0, 500) }),
        { status: 502 },
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(match[0]);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON from Gemini', detail: e.message }),
        { status: 502 },
      );
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

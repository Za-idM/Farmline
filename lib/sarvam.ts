const SARVAM_API_BASE = "https://api.sarvam.ai";

export type SarvamLanguage =
  | "hi-IN"
  | "bn-IN"
  | "ta-IN"
  | "te-IN"
  | "kn-IN"
  | "ml-IN"
  | "mr-IN"
  | "gu-IN"
  | "pa-IN"
  | "or-IN"
  | "en-IN";

// Speech to Text
export async function transcribeAudioBase64(
  audioBase64: string,
  language: SarvamLanguage = "hi-IN"
): Promise<string> {
  const response = await fetch(`${SARVAM_API_BASE}/speech-to-text`, {
    method: "POST",
    headers: {
      "api-subscription-key": process.env.SARVAM_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "saaras:v3",
      language_code: language,
      audio: audioBase64,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Sarvam STT error: ${err}`);
  }

  const data = await response.json();
  return data.transcript || "";
}

// Map language codes to readable names for the LLM prompt
const LANGUAGE_NAMES: Record<string, string> = {
  "hi-IN": "Hindi",
  "bn-IN": "Bengali",
  "ta-IN": "Tamil",
  "te-IN": "Telugu",
  "kn-IN": "Kannada",
  "ml-IN": "Malayalam",
  "mr-IN": "Marathi",
  "gu-IN": "Gujarati",
  "pa-IN": "Punjabi",
  "or-IN": "Odia",
  "en-IN": "English",
};

// Chat / LLM
export async function getFarmingAnswer(
  userMessage: string,
  conversationHistory: { role: string; content: string }[],
  language: SarvamLanguage = "hi-IN"
): Promise<string> {
  const langName = LANGUAGE_NAMES[language] || "English";

  const systemPrompt = `You are a helpful AI assistant for Indian farmers. You answer questions about:
- Crop cultivation, sowing, harvesting
- Pest and disease management
- Soil health and fertilizers
- Weather and irrigation
- Government schemes for farmers (PM-KISAN, crop insurance, etc.)
- Market prices and selling crops
- Organic farming

CRITICAL RULE: You MUST reply in ${langName} ONLY. The farmer is writing in ${langName}, so your entire response must be in ${langName}. Do NOT switch to Hindi or any other language.
Be simple, clear, and practical. Keep answers under 3 sentences.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((m) => ({
      role: m.role === "farmer" ? "user" : "assistant",
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  const response = await fetch(`${SARVAM_API_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.SARVAM_API_KEY!}`,
      "api-subscription-key": process.env.SARVAM_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sarvam-m",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Sarvam LLM error:", response.status, err);
    throw new Error(`Sarvam LLM error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const fallbacks: Record<string, string> = {
    "hi-IN": "मुझे खेद है, मैं समझ नहीं पाया।",
    "en-IN": "Sorry, I could not understand. Please try again.",
    "ta-IN": "மன்னிக்கவும், எனக்கு புரியவில்லை.",
    "te-IN": "క్షమించండి, నాకు అర్థం కాలేదు.",
    "bn-IN": "দুঃখিত, আমি বুঝতে পারিনি।",
    "kn-IN": "ಕ್ಷಮಿಸಿ, ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ.",
    "ml-IN": "ക്ഷമിക്കണം, എനിക്ക് മനസ്സിലായില്ല.",
    "mr-IN": "माफ करा, मला समजले नाही.",
    "gu-IN": "માફ કરશો, મને સમજાયું નહીં.",
    "pa-IN": "ਮਾਫ਼ ਕਰਨਾ, ਮੈਨੂੰ ਸਮਝ ਨਹੀਂ ਆਇਆ।",
    "or-IN": "କ୍ଷମା କରନ୍ତୁ, ମୁଁ ବୁଝିପାରିଲି ନାହିଁ।",
  };
  let reply = data.choices?.[0]?.message?.content || fallbacks[language] || fallbacks["en-IN"];
  // Strip <think>...</think> reasoning blocks from the response (handles unclosed tags too)
  reply = reply.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, "").trim();
  return reply;
}

// Text to Speech — returns base64 audio
export async function textToSpeech(
  text: string,
  language: SarvamLanguage = "hi-IN"
): Promise<string> {
  // Sarvam TTS has a 500 char limit per input — truncate at sentence boundary
  let ttsText = text;
  if (ttsText.length > 490) {
    // Try to cut at last sentence ending before 490 chars
    const cutoff = ttsText.substring(0, 490);
    const lastPunct = Math.max(
      cutoff.lastIndexOf("।"),
      cutoff.lastIndexOf("."),
      cutoff.lastIndexOf("?"),
      cutoff.lastIndexOf("!")
    );
    ttsText = lastPunct > 100 ? cutoff.substring(0, lastPunct + 1) : cutoff + "...";
  }
  const response = await fetch(`${SARVAM_API_BASE}/text-to-speech`, {
    method: "POST",
    headers: {
      "api-subscription-key": process.env.SARVAM_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: [ttsText],
      target_language_code: language,
      speaker: "priya",
      model: "bulbul:v3",
      enable_preprocessing: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Sarvam TTS error: ${err}`);
  }

  const data = await response.json();
  return data.audios?.[0] || "";
}

// Generate a summary of the conversation
export async function generateCallSummary(
  transcript: { role: string; content: string }[]
): Promise<string> {
  const transcriptText = transcript
    .map((m) => `${m.role === "farmer" ? "Farmer" : "AI"}: ${m.content}`)
    .join("\n");

  const response = await fetch(`${SARVAM_API_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.SARVAM_API_KEY!}`,
      "api-subscription-key": process.env.SARVAM_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sarvam-m",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Summarize the following farmer helpline call in 2-3 sentences in English. Focus on what the farmer asked and what advice was given.",
        },
        {
          role: "user",
          content: `Call transcript:\n${transcriptText}\n\nProvide a brief summary:`,
        },
      ],
      max_tokens: 150,
    }),
  });

  if (!response.ok) return "Summary unavailable.";
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Summary unavailable.";
}

// Transcribe audio from Twilio media URL
export async function transcribeAudio(mediaUrl: string): Promise<{
  transcript: string;
  languageCode: string;
}> {
  console.log("Fetching audio from mediaUrl:", mediaUrl);
  const audioRes = await fetch(mediaUrl, {
    headers: {
      Authorization: "Basic " + Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString("base64"),
    },
  });

  if (!audioRes.ok) {
    throw new Error(`Failed to fetch media from Twilio: ${audioRes.statusText}`);
  }

  const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
  const form = new FormData();
  form.append("file", new Blob([audioBuffer], { type: "audio/ogg" }), "audio.ogg");
  form.append("model", "saaras:v3");
  form.append("language_code", "unknown");

  console.log("Sending speech to Sarvam ASR...");
  const res = await fetch(`${SARVAM_API_BASE}/speech-to-text`, {
    method: "POST",
    headers: { "api-subscription-key": process.env.SARVAM_API_KEY! },
    body: form,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Sarvam ASR API error:", errText);
    throw new Error(`Sarvam STT failed: ${errText}`);
  }

  const data = await res.json();
  console.log("ASR transcript:", data.transcript, "detected lang:", data.language_code);
  return {
    transcript: data.transcript ?? "",
    languageCode: data.language_code ?? "hi-IN",
  };
}

// Synthesize speech to buffer for Twilio / WhatsApp
export async function synthesizeSpeech(
  text: string,
  languageCode: string
): Promise<Buffer> {
  console.log("Synthesizing speech via Sarvam TTS, lang:", languageCode);
  const res = await fetch(`${SARVAM_API_BASE}/text-to-speech`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": process.env.SARVAM_API_KEY!,
    },
    body: JSON.stringify({
      inputs: [text.slice(0, 500)],
      target_language_code: languageCode,
      speaker: "priya",
      model: "bulbul:v3",
      enable_preprocessing: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Sarvam TTS error:", errText);
    throw new Error(`Sarvam TTS failed: ${errText}`);
  }

  const data = await res.json();
  const base64 = data.audios?.[0];

  if (!base64) {
    throw new Error("Sarvam TTS returned no audio");
  }

  return Buffer.from(base64, "base64");
}

// Score call lead classification (Hot, Warm, Cold)
export async function scoreLead(transcript: string): Promise<"Hot" | "Warm" | "Cold"> {
  console.log("Scoring lead based on transcript length:", transcript.length);
  try {
    const res = await fetch(`${SARVAM_API_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SARVAM_API_KEY!}`,
        "api-subscription-key": process.env.SARVAM_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sarvam-m",
        messages: [
          {
            role: "system",
            content: `You are a lead scoring agent for an agricultural helpline.
Given a conversation transcript, reply with ONLY one word: Hot, Warm, or Cold.
Do not write anything else. Do not use punctuation.

Hot = urgent problem (crop disease, pest attack, flood/drought, animal damage).
Warm = planning question (what to plant, market prices, fertiliser dosage, basic schemes).
Cold = general curiosity, greeting, irrelevant, or already resolved.`,
          },
          { role: "user", content: transcript },
        ],
      }),
    });

    if (!res.ok) {
      console.error("Lead score API response not OK:", res.status);
      return "Warm";
    }

    const data = await res.json();
    let score = data.choices?.[0]?.message?.content?.trim() || "";
    // Clean potential markdown or thoughts
    score = score.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, "").trim();
    // Strip trailing periods or quotes
    score = score.replace(/[".]/g, "");

    console.log("Raw lead score output:", score);
    if (score === "Hot" || score === "Warm" || score === "Cold") {
      return score as "Hot" | "Warm" | "Cold";
    }

    // Heuristics if LLM returns more than just the word
    if (score.toLowerCase().includes("hot")) return "Hot";
    if (score.toLowerCase().includes("cold")) return "Cold";
    return "Warm";
  } catch (err) {
    console.error("Failed to score lead:", err);
    return "Warm";
  }
}

// Wrapper to match build plan
export async function generateFarmingAnswer(
  userMessage: string,
  language: SarvamLanguage = "hi-IN"
): Promise<string> {
  let answer = await getFarmingAnswer(userMessage, [], language);
  answer = answer.replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, "").trim();
  return answer;
}

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
export async function transcribeAudio(
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
      model: "saaras:v2",
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

// Chat / LLM
export async function getFarmingAnswer(
  userMessage: string,
  conversationHistory: { role: string; content: string }[],
  language: SarvamLanguage = "hi-IN"
): Promise<string> {
  const systemPrompt = `You are a helpful AI assistant for Indian farmers. You answer questions about:
- Crop cultivation, sowing, harvesting
- Pest and disease management
- Soil health and fertilizers
- Weather and irrigation
- Government schemes for farmers (PM-KISAN, crop insurance, etc.)
- Market prices and selling crops
- Organic farming

Always respond in the same language the farmer is speaking. Be simple, clear, and practical.
If speaking Hindi, use simple Hindi. If Tamil, use simple Tamil. Keep answers concise for phone calls.
Current language: ${language}`;

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
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Sarvam LLM error:", response.status, err);
    throw new Error(`Sarvam LLM error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "मुझे खेद है, मैं समझ नहीं पाया।";
}

// Text to Speech — returns base64 audio
export async function textToSpeech(
  text: string,
  language: SarvamLanguage = "hi-IN"
): Promise<string> {
  const response = await fetch(`${SARVAM_API_BASE}/text-to-speech`, {
    method: "POST",
    headers: {
      "api-subscription-key": process.env.SARVAM_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: [text],
      target_language_code: language,
      speaker: "meera",
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

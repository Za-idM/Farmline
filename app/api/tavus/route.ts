import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.TAVUS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Tavus API Key is missing. Please set TAVUS_API_KEY in your .env file." },
      { status: 400 }
    );
  }

  try {
    const body: any = {
      conversation_name: "Akrush AI Consultation",
      conversational_context: 
        "You are Akrush, an expert Indian agricultural advisor. You speak clearly and help farmers with crop health, fertilizer recommendations, pest control, weather and mandi pricing queries. You answer concisely and empathetically.",
      custom_greeting: "Namaste! Welcome to Akrush AI Video Consultation. How can I help you with your crops or soil today?",
      properties: {
        max_call_duration: 300, // 5 minutes limit for demos
      }
    };

    if (process.env.TAVUS_REPLICA_ID && process.env.TAVUS_REPLICA_ID.trim() !== "") {
      body.replica_id = process.env.TAVUS_REPLICA_ID.trim();
    }
    if (process.env.TAVUS_PERSONA_ID && process.env.TAVUS_PERSONA_ID.trim() !== "") {
      body.persona_id = process.env.TAVUS_PERSONA_ID.trim();
    }

    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Tavus API error response:", data);
      const errMsg = data.message || data.error || "Failed to create conversation session with Tavus API.";
      return NextResponse.json(
        { error: errMsg },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Failed to connect to Tavus API:", err);
    return NextResponse.json(
      { error: "Internal server error occurred while connecting to Tavus AI API." },
      { status: 500 }
    );
  }
}

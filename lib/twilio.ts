import twilio from "twilio";

export const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// Build TwiML response that greets the farmer and starts media stream
export function buildGreetingTwiML(streamUrl: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="hi-IN" voice="Polly.Aditi">
    नमस्ते! किसान हेल्पलाइन में आपका स्वागत है। कृपया अपना सवाल पूछें।
  </Say>
  <Connect>
    <Stream url="${streamUrl}" />
  </Connect>
</Response>`;
}

// Build TwiML that plays a base64 audio response
export function buildAudioResponseTwiML(audioBase64: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${audioBase64}</Play>
</Response>`;
}

// Simple gather TwiML for speech input
export function buildGatherTwiML(actionUrl: string, language = "hi-IN"): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${actionUrl}" method="POST" language="${language}" speechTimeout="auto" timeout="5">
    <Say language="hi-IN" voice="Polly.Aditi">कृपया बोलें।</Say>
  </Gather>
</Response>`;
}

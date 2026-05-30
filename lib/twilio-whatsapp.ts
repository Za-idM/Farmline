import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const rawNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER || "+14155238886";
const FROM = rawNumber.startsWith("whatsapp:") ? rawNumber : `whatsapp:${rawNumber}`;


export async function sendWhatsAppText(to: string, body: string) {
  console.log(`Sending WhatsApp text to ${to} from ${FROM}`);
  await client.messages.create({
    from: FROM,
    to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
    body,
  });
}

export async function sendWhatsAppAudio(to: string, body: string, mediaUrl: string) {
  console.log(`Sending WhatsApp audio to ${to} from ${FROM} with mediaUrl ${mediaUrl}`);
  await client.messages.create({
    from: FROM,
    to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
    body,
    mediaUrl: [mediaUrl],
  });
}

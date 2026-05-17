import path from "path";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbUrl = `file:${path.resolve(process.cwd(), "dev.db")}`;
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding demo data...");

  const calls = [
    {
      callSid: "CA_demo_001",
      fromNumber: "+91 98765 43210",
      toNumber: "+1 800 555 0100",
      status: "completed",
      language: "hi-IN",
      duration: 187,
      summary:
        "Farmer asked about treating yellow leaves on wheat crop. AI advised checking for nitrogen deficiency and recommended urea application at 30kg/acre.",
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 187000),
      messages: [
        { role: "farmer", content: "मेरे गेहूं के पत्ते पीले हो रहे हैं, क्या करूं?" },
        {
          role: "assistant",
          content:
            "यह नाइट्रोजन की कमी के कारण हो सकता है। आप प्रति एकड़ 30 किलो यूरिया डालें। साथ ही सिंचाई भी करें।",
        },
        { role: "farmer", content: "कब डालना चाहिए?" },
        {
          role: "assistant",
          content:
            "शाम के समय डालें जब धूप कम हो। बारिश से पहले डालना सबसे अच्छा रहता है ताकि खाद जमीन में अच्छे से मिल जाए।",
        },
        { role: "farmer", content: "धन्यवाद" },
      ],
    },
    {
      callSid: "CA_demo_002",
      fromNumber: "+91 87654 32109",
      toNumber: "+1 800 555 0100",
      status: "completed",
      language: "ta-IN",
      duration: 143,
      summary:
        "Farmer inquired about PM-KISAN scheme registration. AI explained the eligibility criteria and directed them to the nearest Common Service Centre.",
      startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 5 * 60 * 60 * 1000 + 143000),
      messages: [
        { role: "farmer", content: "PM-KISAN திட்டத்தில் பதிவு செய்வது எப்படி?" },
        {
          role: "assistant",
          content:
            "PM-KISAN திட்டத்தில் சேர, உங்கள் அருகிலுள்ள Common Service Centre-க்கு செல்லுங்கள். ஆதார் அட்டை மற்றும் வங்கி கணக்கு விவரங்கள் கொண்டு செல்லுங்கள்.",
        },
        { role: "farmer", content: "எவ்வளவு பணம் கிடைக்கும்?" },
        {
          role: "assistant",
          content: "ஆண்டுக்கு ₹6,000 மூன்று தவணைகளில் கிடைக்கும். ஒவ்வொரு தவணையும் ₹2,000.",
        },
      ],
    },
    {
      callSid: "CA_demo_003",
      fromNumber: "+91 76543 21098",
      toNumber: "+1 800 555 0100",
      status: "completed",
      language: "hi-IN",
      duration: 95,
      summary:
        "Farmer asked about controlling aphids on mustard crop. AI recommended neem oil spray solution and advised early morning application.",
      startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 95000),
      messages: [
        { role: "farmer", content: "सरसों में माहू कीट लग गया है" },
        {
          role: "assistant",
          content:
            "नीम का तेल 5 मिली प्रति लीटर पानी में मिलाकर छिड़काव करें। सुबह जल्दी छिड़काव करना ज्यादा असरदार होता है।",
        },
        { role: "farmer", content: "कितने दिन में असर होगा?" },
        {
          role: "assistant",
          content: "2-3 दिन में असर दिखेगा। अगर नहीं हुआ तो 7 दिन बाद दोबारा छिड़काव करें।",
        },
      ],
    },
    {
      callSid: "CA_demo_004",
      fromNumber: "+91 65432 10987",
      toNumber: "+1 800 555 0100",
      status: "in-progress",
      language: "te-IN",
      duration: null,
      summary: null,
      startedAt: new Date(Date.now() - 5 * 60 * 1000),
      endedAt: null,
      messages: [
        { role: "farmer", content: "వరి పంటలో నీరు ఎంత పెట్టాలి?" },
        {
          role: "assistant",
          content:
            "వరి పంటకు నాటిన తర్వాత మొదటి 15 రోజులు 5 సెంటీమీటర్ల నీరు నిలిపి ఉంచండి. తర్వాత అవసరాన్ని బట్టి నీరు పెట్టండి.",
        },
      ],
    },
  ];

  for (const callData of calls) {
    const { messages, ...callFields } = callData;

    await prisma.call.upsert({
      where: { callSid: callFields.callSid },
      update: {},
      create: {
        ...callFields,
        transcript: {
          create: messages.map((m, i) => ({
            ...m,
            timestamp: new Date(callFields.startedAt.getTime() + i * 20000),
          })),
        },
      },
    });
  }

  console.log("✅ Seeded", calls.length, "demo calls");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

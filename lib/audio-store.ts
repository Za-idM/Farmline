// Simple in-memory buffer store for serving audio files to Twilio/WhatsApp
const globalForAudio = globalThis as unknown as {
  audioStore: Map<string, Buffer> | undefined;
};

const store = globalForAudio.audioStore ?? new Map<string, Buffer>();
if (process.env.NODE_ENV !== "production") {
  globalForAudio.audioStore = store;
}

export function storeAudio(key: string, buf: Buffer) {
  console.log("Storing audio for key:", key, "size:", buf.length);
  store.set(key, buf);
  // 5-minute time-to-live to avoid memory leak
  setTimeout(() => {
    store.delete(key);
    console.log("Cleared cached audio for key:", key);
  }, 5 * 60 * 1000);
}

export function getAudio(key: string): Buffer | undefined {
  const buf = store.get(key);
  console.log("Retrieving audio for key:", key, "found:", !!buf);
  return buf;
}

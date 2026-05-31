import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages } from "ai";

export async function POST(req: Request) {
  try {
    const { messages, billContext } = await req.json();

    if (!billContext) {
      return new Response(JSON.stringify({ error: "No context" }), {
        status: 400,
      });
    }

    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: `You are a precise telecom billing assistant. 
               Source of Truth (JSON): ${JSON.stringify(billContext)}. 
               Guidelines: 
               1. Use ONLY the provided JSON for data.
               2. Do not invent numbers.
               3. If the answer is not in the JSON, politely state you don't have that info.`,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat" }), {
      status: 500,
    });
  }
}
